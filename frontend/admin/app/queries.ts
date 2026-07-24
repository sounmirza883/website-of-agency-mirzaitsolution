const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return res.json();
}

async function apiPost<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function apiPatch<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function fetchUsers() { return apiGet<any[]>("/admin/users"); }
export function fetchEmployees(token: string) { return apiGet<any[]>("/admin/employees", token); }
export function fetchClientsList(token: string) { return apiGet<any[]>("/admin/clients", token); }
export function createEmployee(token: string, payload: { name: string; email: string; password: string; dept: string; position: string; canCreateClients: boolean }) {
  return apiPost<any>("/admin/employees", token, payload);
}
export function createClient(token: string, payload: { name: string; email: string; password: string; company: string }) {
  return apiPost<any>("/admin/clients", token, payload);
}
export function setEmployeePermission(token: string, id: number, canCreateClients: boolean) {
  return apiPatch<any>(`/admin/employees/${id}/permission`, token, { canCreateClients });
}
export function fetchServices() { return apiGet<any[]>("/admin/services"); }
export function fetchProjects() { return apiGet<any[]>("/admin/projects"); }
export function fetchInvoices() { return apiGet<any[]>("/admin/invoices"); }
export function fetchNotifications() { return apiGet<any[]>("/admin/notifications"); }
export function fetchBlogPosts() { return apiGet<any[]>("/admin/blog"); }
export function fetchPortfolioList() { return apiGet<any[]>("/admin/portfolio"); }
