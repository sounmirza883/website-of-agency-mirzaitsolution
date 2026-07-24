import { Router } from "express";
import { supabase } from "../supabase.js";
import { createUser, EmailTakenError, listUsersByRole } from "../authStore.js";
import { type AuthedRequest, requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/clients", requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
  const clients = await listUsersByRole("client", req.user!.id);
  return res.json(clients.map((c) => ({ id: c.id, name: c.name, email: c.email, company: c.company, status: c.status })));
});

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

const tableMap: Record<string, string> = {
  "assigned-projects": "employee_assigned_projects",
  tasks: "employee_tasks",
  files: "employee_files",
  "status-updates": "employee_status_updates",
  attendance: "employee_attendance",
  "leave-requests": "employee_leave_requests",
};

Object.entries(tableMap).forEach(([key, table]) => {
  router.get(`/${key}`, requireAuth, requireRole("employee"), async (req: AuthedRequest, res) => {
    if (!supabase) return res.json([]);
    const { data, error } = await supabase.from(table).select("*").eq("employee_id", req.user!.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  });
});

export default router;
