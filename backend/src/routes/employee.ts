import { Router } from "express";
import multer from "multer";
import { supabase } from "../supabase.js";
import { supabaseAdmin, FILES_BUCKET } from "../supabaseAdmin.js";
import { createUser, EmailTakenError, listUsersByRole } from "../authStore.js";
import { type AuthedRequest, requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

function todayStr(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function nowTimeStr(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

router.get("/clients", requireAuth, requireRole("employee"), asyncHandler(async (req, res) => {
  const clients = await listUsersByRole("client", (req as AuthedRequest).user!.id);
  return res.json(clients.map((c) => ({ id: c.id, name: c.name, email: c.email, company: c.company, status: c.status })));
}));

router.post("/clients", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  if (!req.user!.canCreateClients) return res.status(403).json({ error: "You don't have permission to create clients. Ask an admin to enable it." });
  const { name, email, password, company } = req.body ?? {};
  if (!name || !email || !password || !company) {
    return res.status(400).json({ error: "name, email, password, company are required" });
  }
  try {
    const user = await createUser({ name, email, password, company, role: "client", createdBy: req.user!.id });
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, company: user.company, status: user.status });
  } catch (err) {
    if (err instanceof EmailTakenError) return res.status(409).json({ error: err.message });
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.post("/tasks", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  const { project, task, priority, due } = req.body ?? {};
  if (!project || !task || !priority || !due) return res.status(400).json({ error: "project, task, priority, due are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("employee_tasks").insert({ project, task, priority, due, status: "Pending", employee_id: req.user!.id }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.patch("/tasks/:id/status", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("employee_tasks").update({ status }).eq("id", id).eq("employee_id", req.user!.id).select().maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Task not found" });
  return res.json(data);
});

router.get("/status-updates", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("employee_status_updates").select("id,project,update:update_text,progress,date,employee_id").eq("employee_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/status-updates", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  const { project, update, progress } = req.body ?? {};
  if (!project || !update || progress == null) return res.status(400).json({ error: "project, update, progress are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("employee_status_updates").insert({ project, update_text: update, progress, date: todayStr(), employee_id: req.user!.id }).select("id,project,update:update_text,progress,date,employee_id").single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get("/attendance", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("employee_attendance").select("id,date,checkIn:check_in,checkOut:check_out,status,employee_id").eq("employee_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/attendance/check-in", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const today = todayStr();
  const { data: existing } = await supabase.from("employee_attendance").select("id").eq("employee_id", req.user!.id).eq("date", today).maybeSingle();
  if (existing) return res.status(409).json({ error: "Already checked in today" });
  const { data, error } = await supabase.from("employee_attendance").insert({ date: today, check_in: nowTimeStr(), check_out: "", status: "Present", employee_id: req.user!.id }).select("id,date,checkIn:check_in,checkOut:check_out,status,employee_id").single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.post("/attendance/check-out", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const today = todayStr();
  const { data: existing } = await supabase.from("employee_attendance").select("id,check_out").eq("employee_id", req.user!.id).eq("date", today).maybeSingle();
  if (!existing) return res.status(400).json({ error: "You haven't checked in today" });
  if (existing.check_out) return res.status(409).json({ error: "Already checked out today" });
  const { data, error } = await supabase.from("employee_attendance").update({ check_out: nowTimeStr() }).eq("id", existing.id).select("id,date,checkIn:check_in,checkOut:check_out,status,employee_id").single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get("/leave-requests", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("employee_leave_requests").select("id,type,reason,from:from_date,to:to_date,status,employee_id").eq("employee_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/leave-requests", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  const { type, reason, from, to } = req.body ?? {};
  if (!type || !reason || !from || !to) return res.status(400).json({ error: "type, reason, from, to are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("employee_leave_requests").insert({ type, reason, from_date: from, to_date: to, status: "Pending", employee_id: req.user!.id }).select("id,type,reason,from:from_date,to:to_date,status,employee_id").single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

async function attachSignedUrls(rows: any[]) {
  const admin = supabaseAdmin;
  if (!admin) return rows.map((r) => ({ ...r, url: null }));
  return Promise.all(rows.map(async (r) => {
    const { data } = await admin.storage.from(FILES_BUCKET).createSignedUrl(r.path, 3600);
    return { ...r, url: data?.signedUrl ?? null };
  }));
}

router.get("/files", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("project_files").select("*").eq("uploaded_by", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(await attachSignedUrls(data ?? []));
});

router.post("/files", requireAuth, requireRole("employee"), upload.single("file"), async (req: AuthedRequest, res) => {
  const file = req.file;
  const { project, clientId } = req.body ?? {};
  if (!file || !project) return res.status(400).json({ error: "file and project are required" });
  if (!supabase || !supabaseAdmin) return res.status(503).json({ error: "File storage not configured" });
  const path = `employee-files/${req.user!.id}/${Date.now()}-${file.originalname}`;
  const { error: uploadError } = await supabaseAdmin.storage.from(FILES_BUCKET).upload(path, file.buffer, { contentType: file.mimetype });
  if (uploadError) return res.status(500).json({ error: uploadError.message });
  const sizeStr = file.size >= 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`;
  const { data, error } = await supabase.from("project_files").insert({
    name: file.originalname, project, size: sizeStr, path, uploaded: todayStr(), status: "Pending",
    uploaded_by: req.user!.id, client_id: clientId ? Number(clientId) : null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json((await attachSignedUrls([data]))[0]);
});

router.get("/assigned-projects", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("admin_projects").select("id,name,client,clientId:client_id,employeeId:employee_id,status,deadline,progress").eq("employee_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get("/tasks", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("employee_tasks").select("*").eq("employee_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get("/messages", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  const projectId = Number(req.query.projectId);
  if (!projectId) return res.status(400).json({ error: "projectId query param is required" });
  if (!supabase) return res.json([]);
  const project = await supabase.from("admin_projects").select("id,employee_id").eq("id", projectId).maybeSingle();
  if (!project.data || project.data.employee_id !== req.user!.id) return res.status(403).json({ error: "You are not assigned to this project" });
  const { data, error } = await supabase.from("project_messages").select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").eq("project_id", projectId).order("id", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/messages", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  const { projectId, text } = req.body ?? {};
  if (!projectId || !text) return res.status(400).json({ error: "projectId, text are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const project = await supabase.from("admin_projects").select("id,employee_id,client_id").eq("id", projectId).maybeSingle();
  if (!project.data || project.data.employee_id !== req.user!.id) return res.status(403).json({ error: "You are not assigned to this project" });
  const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const { data, error } = await supabase.from("project_messages").insert({
    project_id: projectId, sender_id: req.user!.id, sender_role: "employee", text, time, client_id: project.data.client_id,
  }).select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get("/notifications", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("notifications").select("*").in("target_role", ["employee", "all"]).order("id", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/notifications", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  const { title, msg, targetRole, targetClientId } = req.body ?? {};
  if (!title || !msg) return res.status(400).json({ error: "title, msg are required" });
  if (!["employee", "client", "all"].includes(targetRole)) return res.status(400).json({ error: "targetRole must be employee, client, or all" });
  if (targetRole === "client" && !targetClientId) return res.status(400).json({ error: "targetClientId is required when targetRole is client" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const date = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const { data, error } = await supabase.from("notifications").insert({
    title, msg, date, created_by: req.user!.id, creator_role: "employee",
    target_role: targetRole, target_user_id: targetRole === "client" ? Number(targetClientId) : null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

export default router;
