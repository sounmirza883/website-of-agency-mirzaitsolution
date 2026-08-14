"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const supabase_js_1 = require("../supabase.js");
const supabaseAdmin_js_1 = require("../supabaseAdmin.js");
const authStore_js_1 = require("../authStore.js");
const auth_js_1 = require("../middleware/auth.js");
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const scheduling_js_1 = require("../scheduling.js");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
function todayStr() {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function nowTimeStr() {
    return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
router.get("/my-schedule", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    return res.json(await (0, scheduling_js_1.resolveSchedule)(req.user.id));
}));
router.get("/clients", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const clients = await (0, authStore_js_1.listUsersByRole)("client", req.user.id);
    return res.json(clients.map((c) => ({ id: c.id, name: c.name, email: c.email, company: c.company, status: c.status })));
}));
router.post("/clients", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    if (!req.user.canCreateClients)
        return res.status(403).json({ error: "You don't have permission to create clients. Ask an admin to enable it." });
    const { name, email, password, company } = req.body ?? {};
    if (!name || !email || !password || !company) {
        return res.status(400).json({ error: "name, email, password, company are required" });
    }
    try {
        const user = await (0, authStore_js_1.createUser)({ name, email, password, company, role: "client", createdBy: req.user.id });
        return res.status(201).json({ id: user.id, name: user.name, email: user.email, company: user.company, status: user.status });
    }
    catch (err) {
        if (err instanceof authStore_js_1.EmailTakenError)
            return res.status(409).json({ error: err.message });
        return res.status(500).json({ error: err.message });
    }
});
router.post("/tasks", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    const { project, task, priority, due } = req.body ?? {};
    if (!project || !task || !priority || !due)
        return res.status(400).json({ error: "project, task, priority, due are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("employee_tasks").insert({ project, task, priority, due, status: "Pending", employee_id: req.user.id }).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
router.patch("/tasks/:id/status", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body ?? {};
    if (!status)
        return res.status(400).json({ error: "status is required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    // Finishing a task requires a report. The write-up is the point of the task
    // being closed, so it is a precondition rather than a reminder afterwards.
    if ((0, scheduling_js_1.isDone)(status)) {
        const { count } = await supabase_js_1.supabase.from("task_reports").select("id", { count: "exact", head: true }).eq("task_id", id);
        if (!count)
            return res.status(400).json({ error: "Submit a completion report before marking this task complete" });
    }
    const patch = { status };
    if ((0, scheduling_js_1.isDone)(status)) {
        patch.progress = 100;
        patch.completed_at = new Date().toISOString();
    }
    const { data, error } = await supabase_js_1.supabase.from("employee_tasks").update(patch).eq("id", id).eq("employee_id", req.user.id).select("id,project_id,status,progress").maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: "Task not found" });
    await (0, scheduling_js_1.rollUpProjectProgress)(data.project_id);
    return res.json(data);
}));
router.patch("/tasks/:id/progress", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const progress = Math.max(0, Math.min(100, Number(req.body?.progress)));
    if (!Number.isFinite(progress))
        return res.status(400).json({ error: "progress must be a number between 0 and 100" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("employee_tasks").update({ progress }).eq("id", Number(req.params.id)).eq("employee_id", req.user.id).select("id,project_id,progress").maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: "Task not found" });
    await (0, scheduling_js_1.rollUpProjectProgress)(data.project_id);
    return res.json(data);
}));
// ---------------------------------------------------------------------------
// Time tracking. One row per timer run; ended_at IS NULL means running.
//
// Hours were previously not computable at all: attendance stores two display
// strings a day with no duration, and the strings are unparseable. These are
// real timestamps, so a duration is a subtraction rather than a guess.
// ---------------------------------------------------------------------------
const TIME_ENTRY_COLUMNS = "id,taskId:task_id,employee_id,startedAt:started_at,endedAt:ended_at,note,editedAt:edited_at,editedBy:edited_by";
router.get("/time-entries", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    let query = supabase_js_1.supabase.from("task_time_entries").select(TIME_ENTRY_COLUMNS).eq("employee_id", req.user.id).order("started_at", { ascending: false }).limit(200);
    if (req.query.taskId)
        query = query.eq("task_id", Number(req.query.taskId));
    const { data, error } = await query;
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
/** The entry currently running, if any. Drives the timer indicator in the shell. */
router.get("/time-entries/running", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json(null);
    const { data, error } = await supabase_js_1.supabase.from("task_time_entries").select(TIME_ENTRY_COLUMNS).eq("employee_id", req.user.id).is("ended_at", null).maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.post("/tasks/:id/start", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const taskId = Number(req.params.id);
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data: task } = await supabase_js_1.supabase.from("employee_tasks").select("id").eq("id", taskId).eq("employee_id", req.user.id).maybeSingle();
    if (!task)
        return res.status(404).json({ error: "Task not found" });
    const { data, error } = await supabase_js_1.supabase.from("task_time_entries")
        .insert({ task_id: taskId, employee_id: req.user.id, started_at: new Date().toISOString() })
        .select(TIME_ENTRY_COLUMNS).single();
    // A partial unique index enforces one running timer per person, so a second
    // start is rejected by the database rather than by a check that two
    // concurrent taps would both pass.
    if (error) {
        if (/duplicate key|unique/i.test(error.message))
            return res.status(409).json({ error: "You already have a timer running. Stop it first." });
        return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
}));
router.post("/time-entries/:id/stop", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("task_time_entries")
        .update({ ended_at: new Date().toISOString(), note: req.body?.note || null })
        .eq("id", Number(req.params.id)).eq("employee_id", req.user.id).is("ended_at", null)
        .select(TIME_ENTRY_COLUMNS).maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: "No running timer with that id" });
    return res.json(data);
}));
router.patch("/time-entries/:id", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { startedAt, endedAt, note } = req.body ?? {};
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    if (startedAt && endedAt && new Date(endedAt) <= new Date(startedAt)) {
        return res.status(400).json({ error: "End time must be after start time" });
    }
    // edited_at/edited_by are what keep a corrected entry visibly a correction
    // rather than indistinguishable from tracked time.
    const patch = { edited_at: new Date().toISOString(), edited_by: req.user.id };
    if (startedAt !== undefined)
        patch.started_at = startedAt;
    if (endedAt !== undefined)
        patch.ended_at = endedAt || null;
    if (note !== undefined)
        patch.note = note || null;
    const { data, error } = await supabase_js_1.supabase.from("task_time_entries").update(patch).eq("id", Number(req.params.id)).eq("employee_id", req.user.id).select(TIME_ENTRY_COLUMNS).maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: "Time entry not found" });
    return res.json(data);
}));
// ---------------------------------------------------------------------------
// Reports: one per task on completion, plus a daily summary.
// ---------------------------------------------------------------------------
router.get("/tasks/:id/reports", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("task_reports").select("id,taskId:task_id,summary,blockers,clientVisible:client_visible,submittedAt:submitted_at").eq("task_id", Number(req.params.id)).order("id", { ascending: false });
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.post("/tasks/:id/report", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { summary, blockers, clientVisible } = req.body ?? {};
    if (!summary?.trim())
        return res.status(400).json({ error: "summary is required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const taskId = Number(req.params.id);
    const { data: task } = await supabase_js_1.supabase.from("employee_tasks").select("id").eq("id", taskId).eq("employee_id", req.user.id).maybeSingle();
    if (!task)
        return res.status(404).json({ error: "Task not found" });
    const { data, error } = await supabase_js_1.supabase.from("task_reports").insert({
        task_id: taskId, employee_id: req.user.id, summary: summary.trim(),
        blockers: blockers?.trim() || null, client_visible: clientVisible === false ? false : true,
    }).select("id,taskId:task_id,summary,blockers,clientVisible:client_visible,submittedAt:submitted_at").single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
}));
router.get("/daily-reports", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("daily_reports").select("id,workDate:work_date,summary,submittedAt:submitted_at").eq("employee_id", req.user.id).order("work_date", { ascending: false }).limit(90);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.post("/daily-reports", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { summary, workDate } = req.body ?? {};
    if (!summary?.trim())
        return res.status(400).json({ error: "summary is required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    // UNIQUE (employee_id, work_date) makes this an edit of today's entry rather
    // than a second one, which is what re-submitting a day's summary should mean.
    const { data, error } = await supabase_js_1.supabase.from("daily_reports").upsert({
        employee_id: req.user.id,
        work_date: workDate || new Date().toISOString().slice(0, 10),
        summary: summary.trim(),
        submitted_at: new Date().toISOString(),
    }, { onConflict: "employee_id,work_date" }).select("id,workDate:work_date,summary,submittedAt:submitted_at").single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
}));
router.get("/status-updates", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("employee_status_updates").select("id,project,update:update_text,progress,date,employee_id").eq("employee_id", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.post("/status-updates", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    const { project, update, progress } = req.body ?? {};
    if (!project || !update || progress == null)
        return res.status(400).json({ error: "project, update, progress are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("employee_status_updates").insert({ project, update_text: update, progress, date: todayStr(), employee_id: req.user.id }).select("id,project,update:update_text,progress,date,employee_id").single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
router.get("/attendance", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("employee_attendance").select("id,date,checkIn:check_in,checkOut:check_out,status,employee_id").eq("employee_id", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.post("/attendance/check-in", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const now = new Date();
    const workDate = now.toISOString().slice(0, 10);
    // Dual write: the display strings keep every existing screen working, the
    // typed columns make hours computable and back the unique index.
    const { data, error } = await supabase_js_1.supabase.from("employee_attendance").insert({
        date: todayStr(), check_in: nowTimeStr(), check_out: "", status: "Present", employee_id: req.user.id,
        work_date: workDate, checked_in_at: now.toISOString(),
    }).select("id,date,checkIn:check_in,checkOut:check_out,status,employee_id,workDate:work_date").single();
    // The old guard was a check-then-insert with no constraint, so two concurrent
    // requests both passed it — and once duplicates existed, .maybeSingle() errored,
    // the error was discarded, and check-in silently succeeded forever after.
    // UNIQUE (employee_id, work_date) makes the database the arbiter instead.
    if (error) {
        if (/duplicate key|unique/i.test(error.message))
            return res.status(409).json({ error: "Already checked in today" });
        return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
}));
router.post("/attendance/check-out", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const today = todayStr();
    // Matches on the typed column where it exists, falling back to the display
    // string for rows written before the migration.
    const workDate = new Date().toISOString().slice(0, 10);
    const byDate = await supabase_js_1.supabase.from("employee_attendance").select("id,check_out").eq("employee_id", req.user.id).eq("work_date", workDate).maybeSingle();
    const existing = byDate.data
        ?? (await supabase_js_1.supabase.from("employee_attendance").select("id,check_out").eq("employee_id", req.user.id).eq("date", today).maybeSingle()).data;
    if (!existing)
        return res.status(400).json({ error: "You haven't checked in today" });
    if (existing.check_out)
        return res.status(409).json({ error: "Already checked out today" });
    const { data, error } = await supabase_js_1.supabase.from("employee_attendance").update({ check_out: nowTimeStr(), checked_out_at: new Date().toISOString() }).eq("id", existing.id).select("id,date,checkIn:check_in,checkOut:check_out,status,employee_id").single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.get("/leave-requests", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("employee_leave_requests").select("id,type,reason,from:from_date,to:to_date,status,employee_id").eq("employee_id", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.post("/leave-requests", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    const { type, reason, from, to } = req.body ?? {};
    if (!type || !reason || !from || !to)
        return res.status(400).json({ error: "type, reason, from, to are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("employee_leave_requests").insert({ type, reason, from_date: from, to_date: to, status: "Pending", employee_id: req.user.id }).select("id,type,reason,from:from_date,to:to_date,status,employee_id").single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
async function attachSignedUrls(rows) {
    const admin = supabaseAdmin_js_1.supabaseAdmin;
    if (!admin)
        return rows.map((r) => ({ ...r, url: null }));
    return Promise.all(rows.map(async (r) => {
        const { data } = await admin.storage.from(supabaseAdmin_js_1.FILES_BUCKET).createSignedUrl(r.path, 3600);
        return { ...r, url: data?.signedUrl ?? null };
    }));
}
router.get("/files", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("project_files").select("*").eq("uploaded_by", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(await attachSignedUrls(data ?? []));
});
router.post("/files", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), upload.single("file"), async (req, res) => {
    const file = req.file;
    const { project, clientId } = req.body ?? {};
    if (!file || !project)
        return res.status(400).json({ error: "file and project are required" });
    if (!supabase_js_1.supabase || !supabaseAdmin_js_1.supabaseAdmin)
        return res.status(503).json({ error: "File storage not configured" });
    const path = `employee-files/${req.user.id}/${Date.now()}-${file.originalname}`;
    const { error: uploadError } = await supabaseAdmin_js_1.supabaseAdmin.storage.from(supabaseAdmin_js_1.FILES_BUCKET).upload(path, file.buffer, { contentType: file.mimetype });
    if (uploadError)
        return res.status(500).json({ error: uploadError.message });
    const sizeStr = file.size >= 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`;
    const { data, error } = await supabase_js_1.supabase.from("project_files").insert({
        name: file.originalname, project, size: sizeStr, path, uploaded: todayStr(), status: "Pending",
        uploaded_by: req.user.id, client_id: clientId ? Number(clientId) : null,
    }).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json((await attachSignedUrls([data]))[0]);
});
router.get("/assigned-projects", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("admin_projects").select("id,name,client,clientId:client_id,employeeId:employee_id,status,deadline,progress").eq("employee_id", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.get("/tasks", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("employee_tasks").select("*").eq("employee_id", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.get("/messages", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    const projectId = Number(req.query.projectId);
    if (!projectId)
        return res.status(400).json({ error: "projectId query param is required" });
    if (!supabase_js_1.supabase)
        return res.json([]);
    const project = await supabase_js_1.supabase.from("admin_projects").select("id,employee_id").eq("id", projectId).maybeSingle();
    if (!project.data || project.data.employee_id !== req.user.id)
        return res.status(403).json({ error: "You are not assigned to this project" });
    const { data, error } = await supabase_js_1.supabase.from("project_messages").select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").eq("project_id", projectId).order("id", { ascending: true });
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.post("/messages", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    const { projectId, text } = req.body ?? {};
    if (!projectId || !text)
        return res.status(400).json({ error: "projectId, text are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const project = await supabase_js_1.supabase.from("admin_projects").select("id,employee_id,client_id").eq("id", projectId).maybeSingle();
    if (!project.data || project.data.employee_id !== req.user.id)
        return res.status(403).json({ error: "You are not assigned to this project" });
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const { data, error } = await supabase_js_1.supabase.from("project_messages").insert({
        project_id: projectId, sender_id: req.user.id, sender_role: "employee", text, time, client_id: project.data.client_id,
    }).select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
router.get("/tickets", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("client_tickets").select("id,subject,status,priority,updated,description,client_id,users(name,company)");
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.patch("/tickets/:id/status", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    const { status } = req.body ?? {};
    if (!status)
        return res.status(400).json({ error: "status is required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("client_tickets").update({ status, updated: "Just now" }).eq("id", req.params.id).select().maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: "Ticket not found" });
    return res.json(data);
});
router.get("/notifications", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("notifications").select("*").in("target_role", ["employee", "all"]).order("id", { ascending: false });
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.post("/notifications", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    const { title, msg, targetRole, targetClientId } = req.body ?? {};
    if (!title || !msg)
        return res.status(400).json({ error: "title, msg are required" });
    if (!["employee", "client", "all"].includes(targetRole))
        return res.status(400).json({ error: "targetRole must be employee, client, or all" });
    if (targetRole === "client" && !targetClientId)
        return res.status(400).json({ error: "targetClientId is required when targetRole is client" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const date = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const { data, error } = await supabase_js_1.supabase.from("notifications").insert({
        title, msg, date, created_by: req.user.id, creator_role: "employee",
        target_role: targetRole, target_user_id: targetRole === "client" ? Number(targetClientId) : null,
    }).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
exports.default = router;
