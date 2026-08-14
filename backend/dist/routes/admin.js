"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../supabase.js");
const supabaseAdmin_js_1 = require("../supabaseAdmin.js");
const authStore_js_1 = require("../authStore.js");
const auth_js_1 = require("../middleware/auth.js");
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const scheduling_js_1 = require("../scheduling.js");
const projectChat_js_1 = require("../projectChat.js");
const realtime_js_1 = require("../realtime.js");
const router = (0, express_1.Router)();
function toEmployeeProfile(u) {
    return { id: u.id, name: u.name, email: u.email, dept: u.dept, position: u.position, status: u.status, canCreateClients: u.canCreateClients };
}
function toClientProfile(u) {
    return { id: u.id, name: u.name, email: u.email, company: u.company, status: u.status };
}
// A plain select("*") on admin_projects returns raw snake_case columns, but every
// client reads `clientId`/`employeeId` — the same names /employee/assigned-projects
// and /client/projects already alias to — so an assigned employee silently read as
// undefined. Every admin_projects read/write goes through these aliases.
const PROJECT_COLUMNS = "id,name,client,clientId:client_id,employeeId:employee_id,status,deadline,progress";
const WORK_SETTINGS_COLUMNS = "workDays:work_days,startTime:start_time,endTime:end_time,breakMinutes:break_minutes,timezone";
const SCHEDULE_COLUMNS = "employee_id,workDays:work_days,startTime:start_time,endTime:end_time,breakMinutes:break_minutes";
router.get("/employees", auth_js_1.requireAuth, (0, asyncHandler_js_1.asyncHandler)(async (_req, res) => {
    const employees = await (0, authStore_js_1.listUsersByRole)("employee");
    return res.json(employees.map(toEmployeeProfile));
}));
router.post("/employees", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { name, email, password, dept, position, canCreateClients } = req.body ?? {};
    if (!name || !email || !password || !dept || !position) {
        return res.status(400).json({ error: "name, email, password, dept, position are required" });
    }
    try {
        const user = await (0, authStore_js_1.createUser)({ name, email, password, dept, position, role: "employee", canCreateClients: !!canCreateClients, createdBy: req.user.id });
        return res.status(201).json(toEmployeeProfile(user));
    }
    catch (err) {
        if (err instanceof authStore_js_1.EmailTakenError)
            return res.status(409).json({ error: err.message });
        return res.status(500).json({ error: err.message });
    }
});
router.patch("/employees/:id/permission", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const id = Number(req.params.id);
    const { canCreateClients } = req.body ?? {};
    if (typeof canCreateClients !== "boolean")
        return res.status(400).json({ error: "canCreateClients (boolean) is required" });
    const user = await (0, authStore_js_1.setCanCreateClients)(id, canCreateClients);
    if (!user)
        return res.status(404).json({ error: "Employee not found" });
    return res.json(toEmployeeProfile(user));
});
router.get("/clients", auth_js_1.requireAuth, (0, asyncHandler_js_1.asyncHandler)(async (_req, res) => {
    const clients = await (0, authStore_js_1.listUsersByRole)("client");
    return res.json(clients.map(toClientProfile));
}));
router.post("/clients", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { name, email, password, company } = req.body ?? {};
    if (!name || !email || !password || !company) {
        return res.status(400).json({ error: "name, email, password, company are required" });
    }
    try {
        const user = await (0, authStore_js_1.createUser)({ name, email, password, company, role: "client", createdBy: req.user.id });
        return res.status(201).json(toClientProfile(user));
    }
    catch (err) {
        if (err instanceof authStore_js_1.EmailTakenError)
            return res.status(409).json({ error: err.message });
        return res.status(500).json({ error: err.message });
    }
});
router.get("/users", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (_req, res) => {
    const users = await (0, authStore_js_1.listAllUsers)();
    return res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status })));
}));
router.patch("/users/:id/status", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body ?? {};
    if (!status)
        return res.status(400).json({ error: "status is required" });
    const user = await (0, authStore_js_1.setUserStatus)(id, status);
    if (!user)
        return res.status(404).json({ error: "User not found" });
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status });
});
router.patch("/users/:id", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const { name, email, dept, position, company } = req.body ?? {};
    if (!name && !email && dept === undefined && position === undefined && company === undefined) {
        return res.status(400).json({ error: "At least one field to update is required" });
    }
    try {
        const user = await (0, authStore_js_1.updateUserDetails)(id, { name, email, dept, position, company });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, dept: user.dept, position: user.position, company: user.company });
    }
    catch (err) {
        if (err instanceof authStore_js_1.EmailTakenError)
            return res.status(409).json({ error: err.message });
        throw err;
    }
}));
router.delete("/users/:id", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const ok = await (0, authStore_js_1.deleteUser)(id);
    if (!ok)
        return res.status(404).json({ error: "User not found" });
    return res.status(204).send();
}));
router.get("/contact-submissions", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("website_contact_submissions").select("*").order("created_at", { ascending: false });
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.delete("/contact-submissions/:id", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { error } = await supabase_js_1.supabase.from("website_contact_submissions").delete().eq("id", Number(req.params.id));
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(204).send();
}));
router.get("/tickets", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("client_tickets").select("id,subject,status,priority,updated,description,client_id,users(name,company)");
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.patch("/tickets/:id/status", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
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
router.post("/services", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { name, price, duration } = req.body ?? {};
    if (!name || !price || !duration)
        return res.status(400).json({ error: "name, price, duration are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("admin_services").insert({ name, price, duration }).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
router.post("/projects", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { name, client, clientId, employeeId, status, deadline } = req.body ?? {};
    if (!name || !client || !status || !deadline)
        return res.status(400).json({ error: "name, client, status, deadline are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("admin_projects").insert({
        name, client, status, deadline, client_id: clientId ? Number(clientId) : null, employee_id: employeeId ? Number(employeeId) : null,
    }).select(PROJECT_COLUMNS).single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
router.patch("/projects/:id/status", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body ?? {};
    if (!status)
        return res.status(400).json({ error: "status is required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("admin_projects").update({ status }).eq("id", id).select(PROJECT_COLUMNS).maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: "Project not found" });
    return res.json(data);
});
router.patch("/projects/:id/assign", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const id = Number(req.params.id);
    const { employeeId } = req.body ?? {};
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("admin_projects").update({ employee_id: employeeId ? Number(employeeId) : null }).eq("id", id).select(PROJECT_COLUMNS).maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: "Project not found" });
    return res.json(data);
});
async function nextInvoiceId() {
    const { data } = await supabase_js_1.supabase.from("admin_invoices").select("id");
    const max = Math.max(0, ...(data ?? []).map((r) => parseInt(r.id.replace("INV-", ""), 10) || 0));
    return `INV-${String(max + 1).padStart(3, "0")}`;
}
router.post("/invoices", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { client, clientUserId, project, amount, date } = req.body ?? {};
    if (!client || !clientUserId || !project || !amount || !date) {
        return res.status(400).json({ error: "client, clientUserId, project, amount, date are required" });
    }
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const id = await nextInvoiceId();
    const formattedAmount = "$" + Number(amount).toLocaleString("en-US");
    const { data, error } = await supabase_js_1.supabase.from("admin_invoices").insert({ id, client, amount: formattedAmount, status: "Unpaid", date }).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    await supabase_js_1.supabase.from("client_invoices").insert({ id, project, amount: formattedAmount, status: "Unpaid", due: date, client_id: clientUserId });
    return res.status(201).json(data);
});
async function attachProofUrl(rows) {
    const admin = supabaseAdmin_js_1.supabaseAdmin;
    return Promise.all(rows.map(async (r) => {
        if (!r.proof_path || !admin)
            return { ...r, proofUrl: null };
        const { data } = await admin.storage.from(supabaseAdmin_js_1.FILES_BUCKET).createSignedUrl(r.proof_path, 3600);
        return { ...r, proofUrl: data?.signedUrl ?? null };
    }));
}
router.get("/invoices", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("admin_invoices").select("*");
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(await attachProofUrl(data ?? []));
});
router.patch("/invoices/:id/verify", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const id = req.params.id;
    const { approve } = req.body ?? {};
    if (typeof approve !== "boolean")
        return res.status(400).json({ error: "approve (boolean) is required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const patch = approve ? { status: "Paid" } : { status: "Unpaid", proof_path: null };
    const { data, error } = await supabase_js_1.supabase.from("admin_invoices").update(patch).eq("id", id).select().maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: "Invoice not found" });
    await supabase_js_1.supabase.from("client_invoices").update(patch).eq("id", id);
    return res.json((await attachProofUrl([data]))[0]);
});
router.get("/payment-settings", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json(null);
    const { data, error } = await supabase_js_1.supabase.from("payment_settings").select("*").eq("id", 1).maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.patch("/payment-settings", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { bankName, accountTitle, accountNumber, iban, branchCode, swiftCode, instructions, intlBankName, intlAccountTitle, intlAccountNumber, intlIban, intlSwiftCode, intlInstructions, } = req.body ?? {};
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("payment_settings").upsert({
        id: 1,
        bank_name: bankName ?? null,
        account_title: accountTitle ?? null,
        account_number: accountNumber ?? null,
        iban: iban ?? null,
        branch_code: branchCode ?? null,
        swift_code: swiftCode ?? null,
        instructions: instructions ?? null,
        intl_bank_name: intlBankName ?? null,
        intl_account_title: intlAccountTitle ?? null,
        intl_account_number: intlAccountNumber ?? null,
        intl_iban: intlIban ?? null,
        intl_swift_code: intlSwiftCode ?? null,
        intl_instructions: intlInstructions ?? null,
    }).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
// ---------------------------------------------------------------------------
// Task allocation. Until now an employee could only create tasks for themselves
// (employee_id was hard-wired to the caller in /employee/tasks) and an admin
// could neither see nor assign one. These are the routes that let the person
// who decides what gets done actually record that decision.
//
// employee_tasks now has two FKs to users — employee_id and assigned_by — so a
// bare users(name) embed is ambiguous and fails at runtime while the build stays
// green. Both embeds below name their column explicitly.
// ---------------------------------------------------------------------------
// One literal, not a concatenation: the Supabase client infers the row type from
// this string, and `+` widens it to `string`, which erases the inference.
const TASK_COLUMNS = "id,project,projectId:project_id,task,description,priority,due,status,progress,employee_id,assignedBy:assigned_by,scheduledStart:scheduled_start,scheduledEnd:scheduled_end,estimatedMinutes:estimated_minutes,clientVisible:client_visible,completedAt:completed_at,createdAt:created_at";
const TASK_WITH_NAMES = "id,project,projectId:project_id,task,description,priority,due,status,progress,employee_id,assignedBy:assigned_by,scheduledStart:scheduled_start,scheduledEnd:scheduled_end,estimatedMinutes:estimated_minutes,clientVisible:client_visible,completedAt:completed_at,createdAt:created_at,assignee:users!employee_id(name)";
router.get("/tasks", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    let query = supabase_js_1.supabase.from("employee_tasks").select(TASK_WITH_NAMES).order("id", { ascending: false }).limit(500);
    if (req.query.employeeId)
        query = query.eq("employee_id", Number(req.query.employeeId));
    if (req.query.projectId)
        query = query.eq("project_id", Number(req.query.projectId));
    if (req.query.status)
        query = query.eq("status", String(req.query.status));
    const { data, error } = await query;
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.post("/tasks", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { employeeId, projectId, project, task, description, priority, due, scheduledStart, scheduledEnd, estimatedMinutes, clientVisible } = req.body ?? {};
    if (!employeeId || !task)
        return res.status(400).json({ error: "employeeId and task are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    // project is a display name the employee board and mobile app match on;
    // project_id is the FK the client-facing views need. Keep both in step.
    let projectName = project ?? null;
    if (projectId && !projectName) {
        const { data: p } = await supabase_js_1.supabase.from("admin_projects").select("name").eq("id", Number(projectId)).maybeSingle();
        projectName = p?.name ?? null;
    }
    const { data, error } = await supabase_js_1.supabase.from("employee_tasks").insert({
        employee_id: Number(employeeId),
        project_id: projectId ? Number(projectId) : null,
        project: projectName ?? "",
        task,
        description: description || null,
        priority: priority || "Medium",
        due: due || "",
        status: "Pending",
        assigned_by: req.user.id,
        scheduled_start: scheduledStart || null,
        scheduled_end: scheduledEnd || null,
        estimated_minutes: estimatedMinutes ? Number(estimatedMinutes) : null,
        client_visible: clientVisible === false ? false : true,
    }).select(TASK_COLUMNS).single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json({ ...data, warnings: await (0, scheduling_js_1.scheduleWarnings)(Number(employeeId), scheduledStart, scheduledEnd) });
}));
router.patch("/tasks/:id", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { employeeId, projectId, project, task, description, priority, due, status, progress, scheduledStart, scheduledEnd, estimatedMinutes, clientVisible } = req.body ?? {};
    const patch = {};
    if (employeeId !== undefined)
        patch.employee_id = employeeId ? Number(employeeId) : null;
    if (projectId !== undefined)
        patch.project_id = projectId ? Number(projectId) : null;
    if (project !== undefined)
        patch.project = project;
    if (task !== undefined)
        patch.task = task;
    if (description !== undefined)
        patch.description = description || null;
    if (priority !== undefined)
        patch.priority = priority;
    if (due !== undefined)
        patch.due = due;
    if (status !== undefined)
        patch.status = status;
    if (progress !== undefined)
        patch.progress = Math.max(0, Math.min(100, Number(progress)));
    if (scheduledStart !== undefined)
        patch.scheduled_start = scheduledStart || null;
    if (scheduledEnd !== undefined)
        patch.scheduled_end = scheduledEnd || null;
    if (estimatedMinutes !== undefined)
        patch.estimated_minutes = estimatedMinutes ? Number(estimatedMinutes) : null;
    if (clientVisible !== undefined)
        patch.client_visible = !!clientVisible;
    if (Object.keys(patch).length === 0)
        return res.status(400).json({ error: "No fields to update" });
    const { data, error } = await supabase_js_1.supabase.from("employee_tasks").update(patch).eq("id", id).select(TASK_COLUMNS).maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: "Task not found" });
    if (patch.progress !== undefined || patch.status !== undefined)
        await (0, scheduling_js_1.rollUpProjectProgress)(data.projectId);
    return res.json(data);
}));
router.delete("/tasks/:id", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data: existing } = await supabase_js_1.supabase.from("employee_tasks").select("project_id").eq("id", Number(req.params.id)).maybeSingle();
    const { error } = await supabase_js_1.supabase.from("employee_tasks").delete().eq("id", Number(req.params.id));
    if (error)
        return res.status(500).json({ error: error.message });
    await (0, scheduling_js_1.rollUpProjectProgress)(existing?.project_id ?? null);
    return res.status(204).end();
}));
// ---------------------------------------------------------------------------
// Reporting. Hours come from task_time_entries, which stores real timestamps —
// none of this was computable from the display-string attendance columns.
// ---------------------------------------------------------------------------
/**
 * Who is working right now. One row per employee with an open timer.
 *
 * `ended_at IS NULL` is the same condition the partial unique index uses, so
 * there can be at most one row per person by construction.
 */
router.get("/active-timers", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase
        .from("task_time_entries")
        .select("id,taskId:task_id,employee_id,startedAt:started_at,employee:users!employee_id(name),task:employee_tasks!task_id(task,project)")
        .is("ended_at", null)
        .order("started_at", { ascending: true })
        .limit(100);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
/** Time entries in a window, with the task and employee they belong to. */
router.get("/time-entries", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    let query = supabase_js_1.supabase
        .from("task_time_entries")
        .select("id,taskId:task_id,employee_id,startedAt:started_at,endedAt:ended_at,note,editedAt:edited_at,employee:users!employee_id(name)")
        .not("ended_at", "is", null)
        .order("started_at", { ascending: false })
        .limit(1000);
    if (req.query.employeeId)
        query = query.eq("employee_id", Number(req.query.employeeId));
    if (req.query.from)
        query = query.gte("started_at", String(req.query.from));
    if (req.query.to)
        query = query.lte("started_at", String(req.query.to));
    const { data, error } = await query;
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.get("/task-reports", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    let query = supabase_js_1.supabase
        .from("task_reports")
        .select("id,taskId:task_id,employee_id,summary,blockers,clientVisible:client_visible,submittedAt:submitted_at,employee:users!employee_id(name),task:employee_tasks!task_id(task,project)")
        .order("submitted_at", { ascending: false })
        .limit(300);
    if (req.query.employeeId)
        query = query.eq("employee_id", Number(req.query.employeeId));
    const { data, error } = await query;
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.get("/daily-reports", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    let query = supabase_js_1.supabase
        .from("daily_reports")
        .select("id,employee_id,workDate:work_date,summary,submittedAt:submitted_at,employee:users!employee_id(name)")
        .order("work_date", { ascending: false })
        .limit(300);
    if (req.query.employeeId)
        query = query.eq("employee_id", Number(req.query.employeeId));
    const { data, error } = await query;
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
// ---------------------------------------------------------------------------
// Working hours: one company default, plus a per-employee override where a NULL
// column means "inherit". Nothing here blocks scheduling — it only describes
// when someone is expected to be working, so conflicts can be warned about.
// ---------------------------------------------------------------------------
router.get("/work-settings", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json(null);
    const { data, error } = await supabase_js_1.supabase.from("work_settings").select(WORK_SETTINGS_COLUMNS).eq("id", 1).maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.patch("/work-settings", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { workDays, startTime, endTime, breakMinutes, timezone } = req.body ?? {};
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase
        .from("work_settings")
        .upsert({
        id: 1,
        work_days: Array.isArray(workDays) ? workDays.map(Number).filter((d) => d >= 0 && d <= 6) : undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        break_minutes: breakMinutes == null ? undefined : Number(breakMinutes),
        timezone: timezone || undefined,
        updated_at: new Date().toISOString(),
    })
        .select(WORK_SETTINGS_COLUMNS)
        .single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.get("/employee-schedules", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("employee_schedules").select(SCHEDULE_COLUMNS);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.put("/employee-schedules/:id", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const employeeId = Number(req.params.id);
    if (!Number.isFinite(employeeId))
        return res.status(400).json({ error: "Invalid employee id" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { workDays, startTime, endTime, breakMinutes } = req.body ?? {};
    // An explicit null clears the override for that field, so the employee falls
    // back to the company default. Sending nothing at all leaves it as it was.
    const { data, error } = await supabase_js_1.supabase
        .from("employee_schedules")
        .upsert({
        employee_id: employeeId,
        work_days: Array.isArray(workDays) ? workDays.map(Number).filter((d) => d >= 0 && d <= 6) : null,
        start_time: startTime || null,
        end_time: endTime || null,
        break_minutes: breakMinutes == null || breakMinutes === "" ? null : Number(breakMinutes),
        updated_at: new Date().toISOString(),
    })
        .select(SCHEDULE_COLUMNS)
        .single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.delete("/employee-schedules/:id", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { error } = await supabase_js_1.supabase.from("employee_schedules").delete().eq("employee_id", Number(req.params.id));
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(204).end();
}));
router.post("/notifications", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { title, msg, targetRole, targetUserId } = req.body ?? {};
    if (!title || !msg)
        return res.status(400).json({ error: "title, msg are required" });
    if (targetRole && !["all", "employee", "client"].includes(targetRole))
        return res.status(400).json({ error: "targetRole must be all, employee, or client" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const date = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const { data, error } = await supabase_js_1.supabase.from("notifications").insert({
        title, msg, date, created_by: req.user.id, creator_role: "admin",
        target_role: targetRole || "all", target_user_id: targetUserId ? Number(targetUserId) : null,
    }).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
router.post("/portfolio", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { title, client, category, description } = req.body ?? {};
    if (!title || !client || !category)
        return res.status(400).json({ error: "title, client, category are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("admin_portfolio").insert({ title, client, category, description: description || null }).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
// Projects are deliberately not in the generic tableMap below — they need the
// PROJECT_COLUMNS aliasing declared at the top of this file.
router.get("/projects", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("admin_projects").select(PROJECT_COLUMNS);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
const tableMap = {
    services: "admin_services",
    notifications: "notifications",
    portfolio: "admin_portfolio",
};
Object.entries(tableMap).forEach(([key, table]) => {
    router.get(`/${key}`, auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
        if (!supabase_js_1.supabase)
            return res.json([]);
        const { data, error } = await supabase_js_1.supabase.from(table).select("*");
        if (error)
            return res.status(500).json({ error: error.message });
        return res.json(data);
    });
});
router.get("/messages", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const projectId = Number(req.query.projectId);
    if (!projectId)
        return res.status(400).json({ error: "projectId query param is required" });
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("project_messages").select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").eq("project_id", projectId).order("id", { ascending: true });
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.post("/messages", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { projectId, text } = req.body ?? {};
    if (!projectId || !text)
        return res.status(400).json({ error: "projectId, text are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const project = await supabase_js_1.supabase.from("admin_projects").select("id,client_id").eq("id", projectId).maybeSingle();
    if (!project.data)
        return res.status(404).json({ error: "Project not found" });
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const { data, error } = await supabase_js_1.supabase.from("project_messages").insert({
        project_id: projectId, sender_id: req.user.id, sender_role: "admin", text, time, client_id: project.data.client_id,
    }).select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").single();
    if (error)
        return res.status(500).json({ error: error.message });
    // Poke Supabase Realtime so the other participants' sidebars update without
    // waiting for the poll. Carries only the project id — never the message text —
    // because the browser socket is authenticated with a public anon key.
    await (0, realtime_js_1.broadcastChatActivity)(await (0, projectChat_js_1.projectAudience)(projectId), projectId);
    return res.status(201).json(data);
});
router.get("/attendance", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("employee_attendance").select("id,date,checkIn:check_in,checkOut:check_out,status,employee_id,users(name)");
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.get("/leave-requests", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("employee_leave_requests").select("id,type,reason,from:from_date,to:to_date,status,employee_id,users(name)");
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.patch("/leave-requests/:id/status", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body ?? {};
    if (status !== "Approved" && status !== "Rejected")
        return res.status(400).json({ error: "status must be Approved or Rejected" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase_js_1.supabase.from("employee_leave_requests").update({ status }).eq("id", id).select("id,type,reason,from:from_date,to:to_date,status,employee_id").maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: "Leave request not found" });
    return res.json(data);
});
// ---------------------------------------------------------------------------
// Project chat: admin can read and post in every project thread.
// ---------------------------------------------------------------------------
router.get("/conversations", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data: projects } = await supabase_js_1.supabase.from("admin_projects").select("id,name,client,status").limit(500);
    return res.json(await (0, projectChat_js_1.listProjectConversations)(projects ?? [], req.user.id));
}));
router.post("/conversations/:projectId/read", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    await (0, projectChat_js_1.markProjectRead)(Number(req.params.projectId), req.user.id);
    return res.status(204).end();
}));
exports.default = router;
