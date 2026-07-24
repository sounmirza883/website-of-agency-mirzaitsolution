import { Router } from "express";
import multer from "multer";
import { supabase } from "../supabase.js";
import { supabaseAdmin, FILES_BUCKET } from "../supabaseAdmin.js";
import { type AuthedRequest, requireAuth, requireRole } from "../middleware/auth.js";

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

router.patch("/tickets/:id/status", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  const id = req.params.id;
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("client_tickets").update({ status, updated: "Just now" }).eq("id", id).eq("client_id", req.user!.id).select().maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Ticket not found" });
  return res.json(data);
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
  return res.status(201).json(data);
});

router.get("/notifications", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("notifications").select("*").in("target_role", ["client", "all"]).or(`target_user_id.is.null,target_user_id.eq.${req.user!.id}`).order("id", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

export default router;
