const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return res.json();
}

export function fetchProjects() { return apiGet<any[]>("/client/projects"); }
export function fetchMilestones() { return apiGet<any[]>("/client/milestones"); }
export function fetchFiles() { return apiGet<any[]>("/client/files"); }
export function fetchInvoices() { return apiGet<any[]>("/client/invoices"); }
export function fetchTickets() { return apiGet<any[]>("/client/tickets"); }
export function fetchMessages() { return apiGet<any[]>("/client/messages"); }
