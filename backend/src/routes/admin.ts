import { Router } from "express";
import { supabase } from "../supabase.js";
import { supabaseAdmin, FILES_BUCKET } from "../supabaseAdmin.js";
import { createUser, deleteUser, EmailTakenError, listAllUsers, listUsersByRole, setCanCreateClients, setUserStatus, updateUserDetails } from "../authStore.js";
import { type AuthedRequest, requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

function toEmployeeProfile(u: Awaited<ReturnType<typeof listUsersByRole>>[number]) {
  return { id: u.id, name: u.name, email: u.email, dept: u.dept, position: u.position, status: u.status, canCreateClients: u.canCreateClients };
}
function toClientProfile(u: Awaited<ReturnType<typeof listUsersByRole>>[number]) {
  return { id: u.id, name: u.name, email: u.email, company: u.company, status: u.status };
}

// A plain select("*") on admin_projects returns raw snake_case columns, but every
// client reads `clientId`/`employeeId` — the same names /employee/assigned-projects
// and /client/projects already alias to — so an assigned employee silently read as
// undefined. Every admin_projects read/write goes through these aliases.
const PROJECT_COLUMNS = "id,name,client,clientId:client_id,employeeId:employee_id,status,deadline,progress";

router.get("/employees", requireAuth, asyncHandler(async (_req, res) => {
  const employees = await listUsersByRole("employee");
  return res.json(employees.map(toEmployeeProfile));
}));

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

router.get("/clients", requireAuth, asyncHandler(async (_req, res) => {
  const clients = await listUsersByRole("client");
  return res.json(clients.map(toClientProfile));
}));

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

router.get("/users", requireAuth, requireRole("admin"), asyncHandler(async (_req, res) => {
  const users = await listAllUsers();
  return res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status })));
}));

router.patch("/users/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status is required" });
  const user = await setUserStatus(id, status);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status });
});

router.patch("/users/:id", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, dept, position, company } = req.body ?? {};
  if (!name && !email && dept === undefined && position === undefined && company === undefined) {
    return res.status(400).json({ error: "At least one field to update is required" });
  }
  try {
    const user = await updateUserDetails(id, { name, email, dept, position, company });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, dept: user.dept, position: user.position, company: user.company });
  } catch (err) {
    if (err instanceof EmailTakenError) return res.status(409).json({ error: err.message });
    throw err;
  }
}));

router.delete("/users/:id", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const ok = await deleteUser(id);
  if (!ok) return res.status(404).json({ error: "User not found" });
  return res.status(204).send();
}));

router.get("/contact-submissions", requireAuth, requireRole("admin"), async (_req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("website_contact_submissions").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete("/contact-submissions/:id", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { error } = await supabase.from("website_contact_submissions").delete().eq("id", Number(req.params.id));
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
}));

router.get("/tickets", requireAuth, requireRole("admin"), async (_req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("client_tickets").select("id,subject,status,priority,updated,description,client_id,users(name,company)");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.patch("/tickets/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("client_tickets").update({ status, updated: "Just now" }).eq("id", req.params.id).select().maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Ticket not found" });
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
  const { name, client, clientId, employeeId, status, deadline } = req.body ?? {};
  if (!name || !client || !status || !deadline) return res.status(400).json({ error: "name, client, status, deadline are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("admin_projects").insert({
    name, client, status, deadline, client_id: clientId ? Number(clientId) : null, employee_id: employeeId ? Number(employeeId) : null,
  }).select(PROJECT_COLUMNS).single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.patch("/projects/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("admin_projects").update({ status }).eq("id", id).select(PROJECT_COLUMNS).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Project not found" });
  return res.json(data);
});

router.patch("/projects/:id/assign", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { employeeId } = req.body ?? {};
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("admin_projects").update({ employee_id: employeeId ? Number(employeeId) : null }).eq("id", id).select(PROJECT_COLUMNS).maybeSingle();
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

async function attachProofUrl<T extends { proof_path: string | null }>(rows: T[]): Promise<(T & { proofUrl: string | null })[]> {
  const admin = supabaseAdmin;
  return Promise.all(rows.map(async (r) => {
    if (!r.proof_path || !admin) return { ...r, proofUrl: null };
    const { data } = await admin.storage.from(FILES_BUCKET).createSignedUrl(r.proof_path, 3600);
    return { ...r, proofUrl: data?.signedUrl ?? null };
  }));
}

router.get("/invoices", requireAuth, requireRole("admin"), async (_req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("admin_invoices").select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(await attachProofUrl(data ?? []));
});

router.patch("/invoices/:id/verify", requireAuth, requireRole("admin"), async (req, res) => {
  const id = req.params.id;
  const { approve } = req.body ?? {};
  if (typeof approve !== "boolean") return res.status(400).json({ error: "approve (boolean) is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const patch = approve ? { status: "Paid" } : { status: "Unpaid", proof_path: null };
  const { data, error } = await supabase.from("admin_invoices").update(patch).eq("id", id).select().maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Invoice not found" });
  await supabase.from("client_invoices").update(patch).eq("id", id);
  return res.json((await attachProofUrl([data]))[0]);
});

router.get("/payment-settings", requireAuth, requireRole("admin"), async (_req, res) => {
  if (!supabase) return res.json(null);
  const { data, error } = await supabase.from("payment_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.patch("/payment-settings", requireAuth, requireRole("admin"), async (req, res) => {
  const {
    bankName, accountTitle, accountNumber, iban, branchCode, swiftCode, instructions,
    intlBankName, intlAccountTitle, intlAccountNumber, intlIban, intlSwiftCode, intlInstructions,
  } = req.body ?? {};
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("payment_settings").upsert({
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
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/notifications", requireAuth, requireRole("admin"), async (req: AuthedRequest, res) => {
  const { title, msg, targetRole, targetUserId } = req.body ?? {};
  if (!title || !msg) return res.status(400).json({ error: "title, msg are required" });
  if (targetRole && !["all", "employee", "client"].includes(targetRole)) return res.status(400).json({ error: "targetRole must be all, employee, or client" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const date = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const { data, error } = await supabase.from("notifications").insert({
    title, msg, date, created_by: req.user!.id, creator_role: "admin",
    target_role: targetRole || "all", target_user_id: targetUserId ? Number(targetUserId) : null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.post("/portfolio", requireAuth, requireRole("admin"), async (req, res) => {
  const { title, client, category, description } = req.body ?? {};
  if (!title || !client || !category) return res.status(400).json({ error: "title, client, category are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("admin_portfolio").insert({ title, client, category, description: description || null }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// Projects are deliberately not in the generic tableMap below — they need the
// PROJECT_COLUMNS aliasing declared at the top of this file.
router.get("/projects", requireAuth, requireRole("admin"), async (_req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("admin_projects").select(PROJECT_COLUMNS);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

const tableMap: Record<string, string> = {
  services: "admin_services",
  notifications: "notifications",
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

router.get("/messages", requireAuth, requireRole("admin"), async (req, res) => {
  const projectId = Number(req.query.projectId);
  if (!projectId) return res.status(400).json({ error: "projectId query param is required" });
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("project_messages").select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").eq("project_id", projectId).order("id", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/messages", requireAuth, requireRole("admin"), async (req: AuthedRequest, res) => {
  const { projectId, text } = req.body ?? {};
  if (!projectId || !text) return res.status(400).json({ error: "projectId, text are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const project = await supabase.from("admin_projects").select("id,client_id").eq("id", projectId).maybeSingle();
  if (!project.data) return res.status(404).json({ error: "Project not found" });
  const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const { data, error } = await supabase.from("project_messages").insert({
    project_id: projectId, sender_id: req.user!.id, sender_role: "admin", text, time, client_id: project.data.client_id,
  }).select("id,projectId:project_id,senderId:sender_id,senderRole:sender_role,text,time,client_id").single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get("/attendance", requireAuth, requireRole("admin"), async (_req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("employee_attendance").select("id,date,checkIn:check_in,checkOut:check_out,status,employee_id,users(name)");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get("/leave-requests", requireAuth, requireRole("admin"), async (_req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from("employee_leave_requests").select("id,type,reason,from:from_date,to:to_date,status,employee_id,users(name)");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.patch("/leave-requests/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};
  if (status !== "Approved" && status !== "Rejected") return res.status(400).json({ error: "status must be Approved or Rejected" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  const { data, error } = await supabase.from("employee_leave_requests").update({ status }).eq("id", id).select("id,type,reason,from:from_date,to:to_date,status,employee_id").maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Leave request not found" });
  return res.json(data);
});

export default router;
