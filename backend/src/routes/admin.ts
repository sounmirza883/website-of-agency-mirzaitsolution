import { Router } from "express";
import { supabase } from "../supabase.js";
import { createUser, EmailTakenError, listUsersByRole, setCanCreateClients } from "../authStore.js";
import { type AuthedRequest, requireAuth, requireRole } from "../middleware/auth.js";
import type { User, Service, Project, Invoice, Notification, BlogPost, PortfolioItem } from "../types/index.js";

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

const fallback = {
  users: [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "Active" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Viewer", status: "Active" },
    { id: 4, name: "Sarah Lee", email: "sarah@example.com", role: "Editor", status: "Inactive" },
    { id: 5, name: "Tom Brown", email: "tom@example.com", role: "Viewer", status: "Active" },
  ] as User[],
  services: [
    { id: 1, name: "Graphic Design", price: "$199", duration: "3-5 days" },
    { id: 2, name: "Video Editing", price: "$299", duration: "5-7 days" },
    { id: 3, name: "Motion Graphics", price: "$399", duration: "5-10 days" },
    { id: 4, name: "UI/UX Design", price: "$499", duration: "7-14 days" },
    { id: 5, name: "WordPress Development", price: "$599", duration: "7-14 days" },
    { id: 6, name: "Social Media Marketing", price: "$249", duration: "Ongoing" },
  ] as Service[],
  projects: [
    { id: 1, name: "Brand Identity", client: "Bright Tech", status: "In Progress", deadline: "Aug 15, 2026" },
    { id: 2, name: "Website Redesign", client: "Green Leaf Co", status: "Completed", deadline: "Jul 10, 2026" },
    { id: 3, name: "Social Media Campaign", client: "Prime Media", status: "In Progress", deadline: "Sep 1, 2026" },
    { id: 4, name: "Mobile App UI", client: "NextWave", status: "Pending", deadline: "Sep 20, 2026" },
    { id: 5, name: "Product Video", client: "Bright Tech", status: "Completed", deadline: "Jun 25, 2026" },
  ] as Project[],
  invoices: [
    { id: "INV-001", client: "Bright Tech", amount: "$1,200", status: "Paid", date: "Jul 5, 2026" },
    { id: "INV-002", client: "Green Leaf Co", amount: "$2,500", status: "Unpaid", date: "Jul 12, 2026" },
    { id: "INV-003", client: "Urban Studio", amount: "$800", status: "Overdue", date: "Jun 20, 2026" },
    { id: "INV-004", client: "Prime Media", amount: "$1,800", status: "Paid", date: "Jul 18, 2026" },
    { id: "INV-005", client: "NextWave", amount: "$3,200", status: "Unpaid", date: "Jul 22, 2026" },
  ] as Invoice[],
  notifications: [
    { id: 1, title: "New Project Created", msg: "Bright Tech started a new project.", date: "2 hours ago" },
    { id: 2, title: "Invoice Paid", msg: "INV-001 has been paid by Bright Tech.", date: "5 hours ago" },
    { id: 3, title: "New Client Registered", msg: "NextWave Inc has registered as a client.", date: "1 day ago" },
    { id: 4, title: "Project Completed", msg: "Website Redesign for Green Leaf Co is done.", date: "2 days ago" },
    { id: 5, title: "Support Ticket Opened", msg: "Urban Studio opened a new support ticket.", date: "3 days ago" },
  ] as Notification[],
  blog: [
    { id: 1, title: "Top Design Trends in 2026", author: "Ali Khan", date: "Jul 15, 2026", status: "Published" },
    { id: 2, title: "Why Video Content Matters", author: "Fatima Ahmed", date: "Jul 10, 2026", status: "Published" },
    { id: 3, title: "UI/UX Best Practices", author: "Hassan Raza", date: "Jul 5, 2026", status: "Draft" },
    { id: 4, title: "Social Media Growth Tips", author: "Ayesha Malik", date: "Jun 28, 2026", status: "Published" },
    { id: 5, title: "WordPress vs Custom Dev", author: "Usman Ali", date: "Jun 20, 2026", status: "Draft" },
  ] as BlogPost[],
  portfolio: [
    { id: 1, title: "Brand Identity Pack", client: "Bright Tech", category: "Graphic Design" },
    { id: 2, title: "Website Redesign", client: "Green Leaf Co", category: "Web Development" },
    { id: 3, title: "Product Launch Video", client: "Prime Media", category: "Video" },
    { id: 4, title: "Mobile App UI", client: "NextWave", category: "UI/UX" },
    { id: 5, title: "Social Media Kit", client: "Urban Studio", category: "Social Media" },
  ] as PortfolioItem[],
};

const tableMap: Record<string, string> = {
  users: "admin_users",
  services: "admin_services",
  projects: "admin_projects",
  invoices: "admin_invoices",
  notifications: "admin_notifications",
  blog: "admin_blog",
  portfolio: "admin_portfolio",
};

Object.entries(tableMap).forEach(([key, table]) => {
  router.get(`/${key}`, async (_req, res) => {
    if (!supabase) return res.json((fallback as any)[key]);
    const { data, error } = await supabase.from(table).select("*");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  });
});

export default router;
