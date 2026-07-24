const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return res.json();
}

export function fetchProjects(token: string) { return apiGet<any[]>("/client/projects", token); }
export function fetchMilestones(token: string) { return apiGet<any[]>("/client/milestones", token); }
export function fetchFiles(token: string) { return apiGet<any[]>("/client/files", token); }
export function fetchInvoices(token: string) { return apiGet<any[]>("/client/invoices", token); }
export function fetchTickets(token: string) { return apiGet<any[]>("/client/tickets", token); }
export function fetchMessages(token: string) { return apiGet<any[]>("/client/messages", token); }
