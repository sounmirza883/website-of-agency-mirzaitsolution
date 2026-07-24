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

export function fetchMyClients(token: string) { return apiGet<any[]>("/employee/clients", token); }
export function createClient(token: string, payload: { name: string; email: string; password: string; company: string }) {
  return apiPost<any>("/employee/clients", token, payload);
}

export function fetchAssignedProjects() { return apiGet<any[]>("/employee/assigned-projects"); }
export function fetchEmpTasks() { return apiGet<any[]>("/employee/tasks"); }
export function fetchEmpFiles() { return apiGet<any[]>("/employee/files"); }
export function fetchStatusUpdates() { return apiGet<any[]>("/employee/status-updates"); }
export function fetchAttendance() { return apiGet<any[]>("/employee/attendance"); }
export function fetchLeaveRequests() { return apiGet<any[]>("/employee/leave-requests"); }
