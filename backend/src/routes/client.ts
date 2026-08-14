import { Router } from "express";
import multer from "multer";
import { supabase } from "../supabase.js";
import { supabaseAdmin, FILES_BUCKET } from "../supabaseAdmin.js";
import { type AuthedRequest, requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { listProjectConversations, markProjectRead, projectAudience } from "../projectChat.js";
import { broadcastChatActivity } from "../realtime.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

function todayStr(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

router.get("/projects", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("admin_projects").select("id,name,client,clientId:client_id,employeeId:employee_id,status,deadline,progress").eq("client_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
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
async function assertOwnsProject(projectId: number, clientId: number): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.from("admin_projects").select("id").eq("id", projectId).eq("client_id", clientId).maybeSingle();
  return !!data;
}

router.get("/projects/:id/tasks", requireAuth, requireRole("client"), asyncHandler(async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const projectId = Number(req.params.id);
  if (!(await assertOwnsProject(projectId, req.user!.id))) return res.status(403).json({ error: "Not your project" });

  const { data, error } = await supabase
    .from("employee_tasks")
    .select("id,task,description,status,progress,due,completedAt:completed_at")
    .eq("project_id", projectId)
    .eq("client_visible", true)
    .order("id", { ascending: true })
    .limit(500);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}));

router.get("/projects/:id/reports", requireAuth, requireRole("client"), asyncHandler(async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const projectId = Number(req.params.id);
  if (!(await assertOwnsProject(projectId, req.user!.id))) return res.status(403).json({ error: "Not your project" });

  // Two hops rather than an embed: task_reports has no project_id, and joining
  // through employee_tasks would put the task's employee_id within reach of a
  // careless select. Fetching the id list first keeps that impossible.
  const { data: taskRows } = await supabase.from("employee_tasks").select("id,task").eq("project_id", projectId).eq("client_visible", true).limit(500);
  const ids = (taskRows ?? []).map((t) => t.id);
  if (ids.length === 0) return res.json([]);

  const { data, error } = await supabase
    .from("task_reports")
    .select("id,taskId:task_id,summary,submittedAt:submitted_at")
    .in("task_id", ids)
    .eq("client_visible", true)
    .order("submitted_at", { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: error.message });

  const titles = new Map((taskRows ?? []).map((t) => [t.id, t.task]));
  return res.json((data ?? []).map((r) => ({ ...r, task: titles.get(r.taskId) ?? null })));
}));

router.get("/milestones", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("client_milestones").select("*").eq("client_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get("/files", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("project_files").select("*").eq("client_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  const admin = supabaseAdmin;
  if (!admin) return res.json((data ?? []).map((r) => ({ ...r, url: null })));
  const withUrls = await Promise.all((data ?? []).map(async (r) => {
    const { data: signed } = await admin.storage.from(FILES_BUCKET).createSignedUrl(r.path, 3600);
    return { ...r, url: signed?.signedUrl ?? null };
  }));
  return res.json(withUrls);
});

router.get("/invoices", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("client_invoices").select("*").eq("client_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  const admin = supabaseAdmin;
  if (!admin) return res.json((data ?? []).map((r) => ({ ...r, proofUrl: null })));
  const withUrls = await Promise.all((data ?? []).map(async (r) => {
    if (!r.proof_path) return { ...r, proofUrl: null };
    const { data: signed } = await admin.storage.from(FILES_BUCKET).createSignedUrl(r.proof_path, 3600);
    return { ...r, proofUrl: signed?.signedUrl ?? null };
  }));
  return res.json(withUrls);
});

router.get("/payment-settings", requireAuth, requireRole("client"), async (_req, res) => {
  if (!supabase) return res.json(null);
  const { data, error } = await supabase.from("payment_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/invoices/:id/submit-payment", requireAuth, requireRole("client"), upload.single("file"), async (req: AuthedRequest, res) => {
  const id = req.params.id;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "file is required" });
  if (!supabase || !supabaseAdmin) return res.status(503).json({ error: "File storage not configured" });
  const existing = await supabase.from("client_invoices").select("id").eq("id", id).eq("client_id", req.user!.id).maybeSingle();
  if (!existing.data) return res.status(404).json({ error: "Invoice not found" });
  const path = `invoice-proofs/${req.user!.id}/${Date.now()}-${file.originalname}`;
  const { error: uploadError } = await supabaseAdmin.storage.from(FILES_BUCKET).upload(path, file.buffer, { contentType: file.mimetype });
  if (uploadError) return res.status(500).json({ error: uploadError.message });
  const { data, error } = await supabase.from("client_invoices").update({ status: "PendingVerification", proof_path: path }).eq("id", id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await supabase.from("admin_invoices").update({ status: "PendingVerification", proof_path: path }).eq("id", id);
  const { data: signed } = await supabaseAdmin.storage.from(FILES_BUCKET).createSignedUrl(path, 3600);
  return res.status(201).json({ ...data, proofUrl: signed?.signedUrl ?? null });
});

router.get("/tickets", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("client_tickets").select("*").eq("client_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

async function nextTicketId(): Promise<string> {
  const { data } = await supabase!.from("client_tickets").select("id");
  const max = Math.max(0, ...(data ?? []).map((r: { id: string }) => parseInt(r.id.replace("TK-", ""), 10) || 0));
  return `TK-${String(max + 1).padStart(3, "0")}`;
}

router.post("/tickets", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  const { subject, priority, description } = req.body ?? {};
  if (!subject || !priority) return res.status(400).json({ error: "subject, priority are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const id = await nextTicketId();
  const { data, error } = await supabase.from("client_tickets").insert({
    id, subject, priority, description: description || "", status: "Open", updated: "Just now", client_id: req.user!.id,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get("/messages", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  const projectId = Number(req.query.projectId);
  if (!projectId) return res.status(400).json({ error: "projectId query param is required" });
  if (!supabase) return res.json([]);
  const project = await supabase.from("admin_projects").select("id,client_id").eq("id", projectId).maybeSingle();
  if (!project.data || project.data.client_id !== req.user!.id) return res.status(403).json({ error: "This project doesn't belong to you" });
  const { data, error } = await supabase.from("project_messages").select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").eq("project_id", projectId).order("id", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/messages", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  const { projectId, text } = req.body ?? {};
  if (!projectId || !text) return res.status(400).json({ error: "projectId, text are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const project = await supabase.from("admin_projects").select("id,client_id").eq("id", projectId).maybeSingle();
  if (!project.data || project.data.client_id !== req.user!.id) return res.status(403).json({ error: "This project doesn't belong to you" });
  const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const { data, error } = await supabase.from("project_messages").insert({
    project_id: projectId, sender_id: req.user!.id, sender_role: "client", text, time, client_id: req.user!.id,
  }).select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").single();
  if (error) return res.status(500).json({ error: error.message });

  // Poke Supabase Realtime so the other participants' sidebars update without
  // waiting for the poll. Carries only the project id — never the message text —
  // because the browser socket is authenticated with a public anon key.
  await broadcastChatActivity(await projectAudience(projectId), projectId);
  return res.status(201).json(data);
});

router.get("/notifications", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("notifications").select("*").in("target_role", ["client", "all"]).or(`target_user_id.is.null,target_user_id.eq.${req.user!.id}`).order("id", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ---------------------------------------------------------------------------
// Project chat: one thread per project the client owns.
// ---------------------------------------------------------------------------

router.get("/conversations", requireAuth, requireRole("client"), asyncHandler(async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data: projects } = await supabase.from("admin_projects").select("id,name,client,status").eq("client_id", req.user!.id);
  return res.json(await listProjectConversations(projects ?? [], req.user!.id));
}));

router.post("/conversations/:projectId/read", requireAuth, requireRole("client"), asyncHandler(async (req: AuthedRequest, res) => {
  const projectId = Number(req.params.projectId);
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data: project } = await supabase.from("admin_projects").select("id").eq("id", projectId).eq("client_id", req.user!.id).maybeSingle();
  if (!project) return res.status(403).json({ error: "Not your project" });
  await markProjectRead(projectId, req.user!.id);
  return res.status(204).end();
}));

export default router;
