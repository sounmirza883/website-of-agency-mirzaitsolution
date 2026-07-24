import { Router } from "express";
import { supabase } from "../supabase.js";
import { createUser, EmailTakenError, listAllUsers, listUsersByRole, setCanCreateClients, setUserStatus } from "../authStore.js";
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

router.patch("/users/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status is required" });
  const user = await setUserStatus(id, status);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status });
});

router.get("/contact-submissions", requireAuth, requireRole("admin"), async (_req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("website_contact_submissions").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/services", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, price, duration } = req.body ?? {};
  if (!name || !price || !duration) return res.status(400).json({ error: "name, price, duration are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("admin_services").insert({ name, price, duration }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.post("/projects", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, client, status, deadline } = req.body ?? {};
  if (!name || !client || !status || !deadline) return res.status(400).json({ error: "name, client, status, deadline are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("admin_projects").insert({ name, client, status, deadline }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.patch("/projects/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("admin_projects").update({ status }).eq("id", id).select().maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Project not found" });
  return res.json(data);
});

async function nextInvoiceId(): Promise<string> {
  const { data } = await supabase!.from("admin_invoices").select("id");
  const max = Math.max(0, ...(data ?? []).map((r: { id: string }) => parseInt(r.id.replace("INV-", ""), 10) || 0));
  return `INV-${String(max + 1).padStart(3, "0")}`;
}

router.post("/invoices", requireAuth, requireRole("admin"), async (req, res) => {
  const { client, clientUserId, project, amount, date } = req.body ?? {};
  if (!client || !clientUserId || !project || !amount || !date) {
    return res.status(400).json({ error: "client, clientUserId, project, amount, date are required" });
  }
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const id = await nextInvoiceId();
  const formattedAmount = "$" + Number(amount).toLocaleString("en-US");
  const { data, error } = await supabase.from("admin_invoices").insert({ id, client, amount: formattedAmount, status: "Unpaid", date }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await supabase.from("client_invoices").insert({ id, project, amount: formattedAmount, status: "Unpaid", due: date, client_id: clientUserId });
  return res.status(201).json(data);
});

router.post("/notifications", requireAuth, requireRole("admin"), async (req, res) => {
  const { title, msg } = req.body ?? {};
  if (!title || !msg) return res.status(400).json({ error: "title, msg are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const date = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const { data, error } = await supabase.from("admin_notifications").insert({ title, msg, date }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.post("/blog", requireAuth, requireRole("admin"), async (req, res) => {
  const { title, author, content, status } = req.body ?? {};
  if (!title || !author || !content) return res.status(400).json({ error: "title, author, content are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const date = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const { data, error } = await supabase.from("admin_blog").insert({ title, author, content, status: status === "Published" ? "Published" : "Draft", date }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.patch("/blog/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};
  if (status !== "Draft" && status !== "Published") return res.status(400).json({ error: "status must be Draft or Published" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("admin_blog").update({ status }).eq("id", id).select().maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Blog post not found" });
  return res.json(data);
});

router.post("/portfolio", requireAuth, requireRole("admin"), async (req, res) => {
  const { title, client, category, description } = req.body ?? {};
  if (!title || !client || !category) return res.status(400).json({ error: "title, client, category are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("admin_portfolio").insert({ title, client, category, description: description || null }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
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
