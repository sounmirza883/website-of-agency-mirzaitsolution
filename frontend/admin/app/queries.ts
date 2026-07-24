const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://backend.vesseldrop.com/api";

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

export function fetchUsers(token: string) { return apiGet<any[]>("/admin/users", token); }
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
export function fetchServices(token: string) { return apiGet<any[]>("/admin/services", token); }
export function fetchProjects(token: string) { return apiGet<any[]>("/admin/projects", token); }
export function fetchInvoices(token: string) { return apiGet<any[]>("/admin/invoices", token); }
export function fetchNotifications(token: string) { return apiGet<any[]>("/admin/notifications", token); }
export function fetchBlogPosts(token: string) { return apiGet<any[]>("/admin/blog", token); }
export function fetchPortfolioList(token: string) { return apiGet<any[]>("/admin/portfolio", token); }
export function fetchContactSubmissions(token: string) { return apiGet<any[]>("/admin/contact-submissions", token); }

export function createService(token: string, payload: { name: string; price: string; duration: string }) {
  return apiPost<any>("/admin/services", token, payload);
}
export function createProject(token: string, payload: { name: string; client: string; status: string; deadline: string }) {
  return apiPost<any>("/admin/projects", token, payload);
}
export function updateProjectStatus(token: string, id: number, status: string) {
  return apiPatch<any>(`/admin/projects/${id}/status`, token, { status });
}
export function createInvoice(token: string, payload: { client: string; clientUserId: number; project: string; amount: number; date: string }) {
  return apiPost<any>("/admin/invoices", token, payload);
}
export function createNotification(token: string, payload: { title: string; msg: string }) {
  return apiPost<any>("/admin/notifications", token, payload);
}
export function createBlogPost(token: string, payload: { title: string; author: string; content: string; status: string }) {
  return apiPost<any>("/admin/blog", token, payload);
}
export function setBlogPostStatus(token: string, id: number, status: string) {
  return apiPatch<any>(`/admin/blog/${id}/status`, token, { status });
}
export function createPortfolioItem(token: string, payload: { title: string; client: string; category: string; description?: string }) {
  return apiPost<any>("/admin/portfolio", token, payload);
}
export function setUserStatus(token: string, id: number, status: string) {
  return apiPatch<any>(`/admin/users/${id}/status`, token, { status });
}
