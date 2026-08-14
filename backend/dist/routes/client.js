"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const supabase_js_1 = require("../supabase.js");
const supabaseAdmin_js_1 = require("../supabaseAdmin.js");
const auth_js_1 = require("../middleware/auth.js");
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const projectChat_js_1 = require("../projectChat.js");
const realtime_js_1 = require("../realtime.js");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
function todayStr() {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
router.get("/projects", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("admin_projects").select("id,name,client,clientId:client_id,employeeId:employee_id,status,deadline,progress").eq("client_id", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
// ---------------------------------------------------------------------------
// What the client can see about work on their project.
//
// The column lists below are written out deliberately and must stay that way.
// select("*") would leak whatever the table gains later, and the shared
// PROJECT_COLUMNS constant includes employeeId. Clients get task status,
// progress and the completion write-ups — never hours logged, never who did it.
// Showing hours would tell a client exactly how long a fixed-price job took.
// ---------------------------------------------------------------------------
/** 403 unless this project belongs to the caller. Used by both routes below. */
async function assertOwnsProject(projectId, clientId) {
    if (!supabase_js_1.supabase)
        return false;
    const { data } = await supabase_js_1.supabase.from("admin_projects").select("id").eq("id", projectId).eq("client_id", clientId).maybeSingle();
    return !!data;
}
router.get("/projects/:id/tasks", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const projectId = Number(req.params.id);
    if (!(await assertOwnsProject(projectId, req.user.id)))
        return res.status(403).json({ error: "Not your project" });
    const { data, error } = await supabase_js_1.supabase
        .from("employee_tasks")
        .select("id,task,description,status,progress,due,completedAt:completed_at")
        .eq("project_id", projectId)
        .eq("client_visible", true)
        .order("id", { ascending: true })
        .limit(500);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
}));
router.get("/projects/:id/reports", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const projectId = Number(req.params.id);
    if (!(await assertOwnsProject(projectId, req.user.id)))
        return res.status(403).json({ error: "Not your project" });
    // Two hops rather than an embed: task_reports has no project_id, and joining
    // through employee_tasks would put the task's employee_id within reach of a
    // careless select. Fetching the id list first keeps that impossible.
    const { data: taskRows } = await supabase_js_1.supabase.from("employee_tasks").select("id,task").eq("project_id", projectId).eq("client_visible", true).limit(500);
    const ids = (taskRows ?? []).map((t) => t.id);
    if (ids.length === 0)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase
        .from("task_reports")
        .select("id,taskId:task_id,summary,submittedAt:submitted_at")
        .in("task_id", ids)
        .eq("client_visible", true)
        .order("submitted_at", { ascending: false })
        .limit(200);
    if (error)
        return res.status(500).json({ error: error.message });
    const titles = new Map((taskRows ?? []).map((t) => [t.id, t.task]));
    return res.json((data ?? []).map((r) => ({ ...r, task: titles.get(r.taskId) ?? null })));
}));
router.get("/milestones", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("client_milestones").select("*").eq("client_id", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.get("/files", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("project_files").select("*").eq("client_id", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    const admin = supabaseAdmin_js_1.supabaseAdmin;
    if (!admin)
        return res.json((data ?? []).map((r) => ({ ...r, url: null })));
    const withUrls = await Promise.all((data ?? []).map(async (r) => {
        const { data: signed } = await admin.storage.from(supabaseAdmin_js_1.FILES_BUCKET).createSignedUrl(r.path, 3600);
        return { ...r, url: signed?.signedUrl ?? null };
    }));
    return res.json(withUrls);
});
router.get("/invoices", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("client_invoices").select("*").eq("client_id", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    const admin = supabaseAdmin_js_1.supabaseAdmin;
    if (!admin)
        return res.json((data ?? []).map((r) => ({ ...r, proofUrl: null })));
    const withUrls = await Promise.all((data ?? []).map(async (r) => {
        if (!r.proof_path)
            return { ...r, proofUrl: null };
        const { data: signed } = await admin.storage.from(supabaseAdmin_js_1.FILES_BUCKET).createSignedUrl(r.proof_path, 3600);
        return { ...r, proofUrl: signed?.signedUrl ?? null };
    }));
    return res.json(withUrls);
});
router.get("/payment-settings", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json(null);
    const { data, error } = await supabase_js_1.supabase.from("payment_settings").select("*").eq("id", 1).maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.post("/invoices/:id/submit-payment", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), upload.single("file"), async (req, res) => {
    const id = req.params.id;
    const file = req.file;
    if (!file)
        return res.status(400).json({ error: "file is required" });
    if (!supabase_js_1.supabase || !supabaseAdmin_js_1.supabaseAdmin)
        return res.status(503).json({ error: "File storage not configured" });
    const existing = await supabase_js_1.supabase.from("client_invoices").select("id").eq("id", id).eq("client_id", req.user.id).maybeSingle();
    if (!existing.data)
        return res.status(404).json({ error: "Invoice not found" });
    const path = `invoice-proofs/${req.user.id}/${Date.now()}-${file.originalname}`;
    const { error: uploadError } = await supabaseAdmin_js_1.supabaseAdmin.storage.from(supabaseAdmin_js_1.FILES_BUCKET).upload(path, file.buffer, { contentType: file.mimetype });
    if (uploadError)
        return res.status(500).json({ error: uploadError.message });
    const { data, error } = await supabase_js_1.supabase.from("client_invoices").update({ status: "PendingVerification", proof_path: path }).eq("id", id).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    await supabase_js_1.supabase.from("admin_invoices").update({ status: "PendingVerification", proof_path: path }).eq("id", id);
    const { data: signed } = await supabaseAdmin_js_1.supabaseAdmin.storage.from(supabaseAdmin_js_1.FILES_BUCKET).createSignedUrl(path, 3600);
    return res.status(201).json({ ...data, proofUrl: signed?.signedUrl ?? null });
});
router.get("/tickets", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("client_tickets").select("*").eq("client_id", req.user.id);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
async function nextTicketId() {
    const { data } = await supabase_js_1.supabase.from("client_tickets").select("id");
    const max = Math.max(0, ...(data ?? []).map((r) => parseInt(r.id.replace("TK-", ""), 10) || 0));
    return `TK-${String(max + 1).padStart(3, "0")}`;
}
router.post("/tickets", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (req, res) => {
    const { subject, priority, description } = req.body ?? {};
    if (!subject || !priority)
        return res.status(400).json({ error: "subject, priority are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const id = await nextTicketId();
    const { data, error } = await supabase_js_1.supabase.from("client_tickets").insert({
        id, subject, priority, description: description || "", status: "Open", updated: "Just now", client_id: req.user.id,
    }).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
router.get("/messages", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (req, res) => {
    const projectId = Number(req.query.projectId);
    if (!projectId)
        return res.status(400).json({ error: "projectId query param is required" });
    if (!supabase_js_1.supabase)
        return res.json([]);
    const project = await supabase_js_1.supabase.from("admin_projects").select("id,client_id").eq("id", projectId).maybeSingle();
    if (!project.data || project.data.client_id !== req.user.id)
        return res.status(403).json({ error: "This project doesn't belong to you" });
    const { data, error } = await supabase_js_1.supabase.from("project_messages").select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").eq("project_id", projectId).order("id", { ascending: true });
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.post("/messages", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (req, res) => {
    const { projectId, text } = req.body ?? {};
    if (!projectId || !text)
        return res.status(400).json({ error: "projectId, text are required" });
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const project = await supabase_js_1.supabase.from("admin_projects").select("id,client_id").eq("id", projectId).maybeSingle();
    if (!project.data || project.data.client_id !== req.user.id)
        return res.status(403).json({ error: "This project doesn't belong to you" });
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const { data, error } = await supabase_js_1.supabase.from("project_messages").insert({
        project_id: projectId, sender_id: req.user.id, sender_role: "client", text, time, client_id: req.user.id,
    }).select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").single();
    if (error)
        return res.status(500).json({ error: error.message });
    // Poke Supabase Realtime so the other participants' sidebars update without
    // waiting for the poll. Carries only the project id — never the message text —
    // because the browser socket is authenticated with a public anon key.
    await (0, realtime_js_1.broadcastChatActivity)(await (0, projectChat_js_1.projectAudience)(projectId), projectId);
    return res.status(201).json(data);
});
router.get("/notifications", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("notifications").select("*").in("target_role", ["client", "all"]).or(`target_user_id.is.null,target_user_id.eq.${req.user.id}`).order("id", { ascending: false });
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
// ---------------------------------------------------------------------------
// Project chat: one thread per project the client owns.
// ---------------------------------------------------------------------------
router.get("/conversations", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data: projects } = await supabase_js_1.supabase.from("admin_projects").select("id,name,client,status").eq("client_id", req.user.id);
    return res.json(await (0, projectChat_js_1.listProjectConversations)(projects ?? [], req.user.id));
}));
router.post("/conversations/:projectId/read", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const projectId = Number(req.params.projectId);
    if (!supabase_js_1.supabase)
        return res.status(503).json({ error: "Database not configured" });
    const { data: project } = await supabase_js_1.supabase.from("admin_projects").select("id").eq("id", projectId).eq("client_id", req.user.id).maybeSingle();
    if (!project)
        return res.status(403).json({ error: "Not your project" });
    await (0, projectChat_js_1.markProjectRead)(projectId, req.user.id);
    return res.status(204).end();
}));
exports.default = router;
