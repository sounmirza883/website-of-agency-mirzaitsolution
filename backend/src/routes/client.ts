import { Router } from "express";
import { supabase } from "../supabase.js";
import { supabaseAdmin, FILES_BUCKET } from "../supabaseAdmin.js";
import { type AuthedRequest, requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

function todayStr(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

router.get("/projects", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("client_projects").select("*").eq("client_id", req.user!.id);
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
  return res.json(data);
});

router.patch("/invoices/:id/pay", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  const id = req.params.id;
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("client_invoices").update({ status: "Paid" }).eq("id", id).eq("client_id", req.user!.id).select().maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Invoice not found" });
  await supabase.from("admin_invoices").update({ status: "Paid" }).eq("id", id);
  return res.json(data);
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
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("client_messages").select("id,from:sender,text,time,client_id").eq("client_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/messages", requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
  const { text } = req.body ?? {};
  if (!text) return res.status(400).json({ error: "text is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const { data, error } = await supabase.from("client_messages").insert({ sender: "client", text, time, client_id: req.user!.id }).select("id,from:sender,text,time,client_id").single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

export default router;
