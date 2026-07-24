import { Router } from "express";
import { supabase } from "../supabase.js";
import { createUser, EmailTakenError, listAllUsers, listUsersByRole, setCanCreateClients } from "../authStore.js";
import { type AuthedRequest, requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

function toEmployeeProfile(u: Awaited<ReturnType<typeof listUsersByRole>>[number]) {
  return { id: u.id, name: u.name, email: u.email, dept: u.dept, position: u.position, status: u.status, canCreateClients: u.canCreateClients };
}
function toClientProfile(u: Awaited<ReturnType<typeof listUsersByRole>>[number]) {
  return { id: u.id, name: u.name, email: u.email, company: u.company, status: u.status };
}

router.get("/employees", requireAuth, async (_req, res) => {
  const employees = await listUsersByRole("employee");
  return res.json(employees.map(toEmployeeProfile));
});

router.post("/employees", requireAuth, requireRole("admin"), async (req: AuthedRequest, res) => {
  const { name, email, password, dept, position, canCreateClients } = req.body ?? {};
  if (!name || !email || !password || !dept || !position) {
    return res.status(400).json({ error: "name, email, password, dept, position are required" });
  }
  try {
    const user = await createUser({ name, email, password, dept, position, role: "employee", canCreateClients: !!canCreateClients, createdBy: req.user!.id });
    return res.status(201).json(toEmployeeProfile(user));
  } catch (err) {
    if (err instanceof EmailTakenError) return res.status(409).json({ error: err.message });
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.patch("/employees/:id/permission", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { canCreateClients } = req.body ?? {};
  if (typeof canCreateClients !== "boolean") return res.status(400).json({ error: "canCreateClients (boolean) is required" });
  const user = await setCanCreateClients(id, canCreateClients);
  if (!user) return res.status(404).json({ error: "Employee not found" });
  return res.json(toEmployeeProfile(user));
});

router.get("/clients", requireAuth, async (_req, res) => {
  const clients = await listUsersByRole("client");
  return res.json(clients.map(toClientProfile));
});

router.post("/clients", requireAuth, requireRole("admin"), async (req: AuthedRequest, res) => {
  const { name, email, password, company } = req.body ?? {};
  if (!name || !email || !password || !company) {
    return res.status(400).json({ error: "name, email, password, company are required" });
  }
  try {
    const user = await createUser({ name, email, password, company, role: "client", createdBy: req.user!.id });
    return res.status(201).json(toClientProfile(user));
  } catch (err) {
    if (err instanceof EmailTakenError) return res.status(409).json({ error: err.message });
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/users", requireAuth, requireRole("admin"), async (_req, res) => {
  const users = await listAllUsers();
  return res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status })));
});

router.get("/contact-submissions", requireAuth, requireRole("admin"), async (_req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("website_contact_submissions").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

const tableMap: Record<string, string> = {
  services: "admin_services",
  projects: "admin_projects",
  invoices: "admin_invoices",
  notifications: "admin_notifications",
  blog: "admin_blog",
  portfolio: "admin_portfolio",
};

Object.entries(tableMap).forEach(([key, table]) => {
  router.get(`/${key}`, requireAuth, requireRole("admin"), async (_req, res) => {
    if (!supabase) return res.json([]);
    const { data, error } = await supabase.from(table).select("*");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  });
});

export default router;
