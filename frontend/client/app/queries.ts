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

export function changePassword(token: string, payload: { currentPassword: string; newPassword: string }) {
  return apiPost<{ success: boolean }>("/auth/change-password", token, payload);
}

async function apiPatch<T>(path: string, token: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: body !== undefined ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function apiUpload<T>(path: string, token: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function fetchProjects(token: string) { return apiGet<any[]>("/client/projects", token); }
export function fetchMilestones(token: string) { return apiGet<any[]>("/client/milestones", token); }
export function fetchFiles(token: string) { return apiGet<any[]>("/client/files", token); }
export function fetchInvoices(token: string) { return apiGet<any[]>("/client/invoices", token); }
export function fetchPaymentSettings(token: string) { return apiGet<any>("/client/payment-settings", token); }
export function fetchTickets(token: string) { return apiGet<any[]>("/client/tickets", token); }
export function fetchMessages(token: string, projectId: string) { return apiGet<any[]>(`/client/messages?projectId=${projectId}`, token); }
export function submitInvoicePayment(token: string, id: string, formData: FormData) {
  return apiUpload<any>(`/client/invoices/${id}/submit-payment`, token, formData);
}
export function createTicket(token: string, payload: { subject: string; priority: string; description: string }) {
  return apiPost<any>("/client/tickets", token, payload);
}
export function sendMessage(token: string, projectId: string, text: string) { return apiPost<any>("/client/messages", token, { projectId, text }); }
export function fetchClientNotifications(token: string) { return apiGet<any[]>("/client/notifications", token); }
