import { Router } from "express";
import { supabase } from "../supabase.js";
import type { ClientProject, Milestone, ClientFile, ClientInvoice, Ticket, Message } from "../types/index.js";

const router = Router();

const fallback = {
  projects: [
    { id: 1, name: "Brand Identity Design", status: "In Progress", deadline: "Aug 15, 2026", progress: 65 },
    { id: 2, name: "Social Media Kit", status: "Completed", deadline: "Jul 20, 2026", progress: 100 },
    { id: 3, name: "Product Video", status: "In Progress", deadline: "Sep 1, 2026", progress: 35 },
    { id: 4, name: "Website Banner Set", status: "Pending", deadline: "Sep 10, 2026", progress: 0 },
  ] as ClientProject[],
  milestones: [
    { id: 1, project: "Brand Identity Design", task: "Logo Concepts", status: "Done", date: "Jul 10, 2026" },
    { id: 2, project: "Brand Identity Design", task: "Color Palette", status: "Done", date: "Jul 15, 2026" },
    { id: 3, project: "Brand Identity Design", task: "Typography Selection", status: "In Review", date: "Jul 20, 2026" },
    { id: 4, project: "Brand Identity Design", task: "Final Asset Delivery", status: "Pending", date: "Aug 15, 2026" },
    { id: 5, project: "Product Video", task: "Script Writing", status: "Done", date: "Jul 18, 2026" },
    { id: 6, project: "Product Video", task: "Footage Recording", status: "In Progress", date: "Jul 25, 2026" },
    { id: 7, project: "Product Video", task: "Editing & Post-production", status: "Pending", date: "Aug 15, 2026" },
  ] as Milestone[],
  files: [
    { id: 1, name: "Logo_Concept_1.png", project: "Brand Identity", size: "2.4 MB", uploaded: "Jul 12, 2026" },
    { id: 2, name: "Color_Palette.pdf", project: "Brand Identity", size: "0.8 MB", uploaded: "Jul 14, 2026" },
    { id: 3, name: "Social_Media_Template.psd", project: "Social Media Kit", size: "15 MB", uploaded: "Jul 18, 2026" },
    { id: 4, name: "Video_Script.docx", project: "Product Video", size: "0.3 MB", uploaded: "Jul 19, 2026" },
    { id: 5, name: "Banner_Mockup.png", project: "Website Banners", size: "3.1 MB", uploaded: "Jul 22, 2026" },
  ] as ClientFile[],
  invoices: [
    { id: "INV-001", project: "Brand Identity Design", amount: "$1,200", status: "Paid", due: "Jul 25, 2026" },
    { id: "INV-002", project: "Social Media Kit", amount: "$800", status: "Paid", due: "Jul 30, 2026" },
    { id: "INV-003", project: "Product Video", amount: "$1,500", status: "Unpaid", due: "Aug 20, 2026" },
    { id: "INV-004", project: "Website Banner Set", amount: "$400", status: "Unpaid", due: "Sep 15, 2026" },
  ] as ClientInvoice[],
  tickets: [
    { id: "TK-001", subject: "Revision Request", status: "Open", priority: "Medium", updated: "2 hours ago" },
    { id: "TK-002", subject: "File Format Question", status: "Closed", priority: "Low", updated: "1 day ago" },
    { id: "TK-003", subject: "Deadline Extension Request", status: "Open", priority: "High", updated: "3 hours ago" },
    { id: "TK-004", subject: "New Project Inquiry", status: "Open", priority: "Low", updated: "5 hours ago" },
  ] as Ticket[],
  messages: [
    { id: 1, from: "client", text: "Hi! I had a question about the logo concepts.", time: "10:15 AM" },
    { id: 2, from: "team", text: "Sure, feel free to ask! Which concept are you referring to?", time: "10:16 AM" },
    { id: 3, from: "client", text: "Concept B — could we see it with a different color palette?", time: "10:18 AM" },
    { id: 4, from: "team", text: "Absolutely! I'll update the mockups and share them with you shortly.", time: "10:20 AM" },
    { id: 5, from: "team", text: "Here are some alternative color versions for Concept B.", time: "10:35 AM" },
  ] as Message[],
};

const tableMap: Record<string, string> = {
  projects: "client_projects",
  milestones: "client_milestones",
  files: "client_files",
  invoices: "client_invoices",
  tickets: "client_tickets",
  messages: "client_messages",
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
