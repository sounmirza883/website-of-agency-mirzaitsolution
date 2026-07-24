import { Router } from "express";
import { supabase } from "../supabase.js";
import { type AuthedRequest, requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const tableMap: Record<string, string> = {
  projects: "client_projects",
  milestones: "client_milestones",
  files: "client_files",
  invoices: "client_invoices",
  tickets: "client_tickets",
  messages: "client_messages",
};

Object.entries(tableMap).forEach(([key, table]) => {
  router.get(`/${key}`, requireAuth, requireRole("client"), async (req: AuthedRequest, res) => {
    if (!supabase) return res.json([]);
    const { data, error } = await supabase.from(table).select("*").eq("client_id", req.user!.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  });
});

export default router;
