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

async function apiPatch<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function apiDelete(path: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      // no JSON body
    }
    throw new Error(message);
  }
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
export function deleteLead(token: string, id: number) { return apiDelete(`/admin/contact-submissions/${id}`, token); }
export function fetchPaymentSettings(token: string) { return apiGet<any>("/admin/payment-settings", token); }

export function createService(token: string, payload: { name: string; price: string; duration: string }) {
  return apiPost<any>("/admin/services", token, payload);
}
export function updatePaymentSettings(token: string, payload: {
  bankName?: string; accountTitle?: string; accountNumber?: string; iban?: string; branchCode?: string; swiftCode?: string; instructions?: string;
  intlBankName?: string; intlAccountTitle?: string; intlAccountNumber?: string; intlIban?: string; intlSwiftCode?: string; intlInstructions?: string;
}) {
  return apiPatch<any>("/admin/payment-settings", token, payload);
}
export function createProject(token: string, payload: { name: string; client: string; clientId?: number; employeeId?: number; status: string; deadline: string }) {
  return apiPost<any>("/admin/projects", token, payload);
}
export function updateProjectStatus(token: string, id: number, status: string) {
  return apiPatch<any>(`/admin/projects/${id}/status`, token, { status });
}
export function assignProjectEmployee(token: string, id: number, employeeId: number | null) {
  return apiPatch<any>(`/admin/projects/${id}/assign`, token, { employeeId });
}
export function createInvoice(token: string, payload: { client: string; clientUserId: number; project: string; amount: number; date: string }) {
  return apiPost<any>("/admin/invoices", token, payload);
}
export function verifyInvoice(token: string, id: number, approve: boolean) {
  return apiPatch<any>(`/admin/invoices/${id}/verify`, token, { approve });
}
export function createNotification(token: string, payload: { title: string; msg: string; targetRole?: "all" | "employee" | "client"; targetUserId?: number }) {
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

export function updateUserDetails(token: string, id: number, payload: { name?: string; email?: string; dept?: string; position?: string; company?: string }) {
  return apiPatch<any>(`/admin/users/${id}`, token, payload);
}

export function deleteUserAccount(token: string, id: number) {
  return apiDelete(`/admin/users/${id}`, token);
}

export function fetchAdminAttendance(token: string) { return apiGet<any[]>("/admin/attendance", token); }
export function fetchAdminLeaveRequests(token: string) { return apiGet<any[]>("/admin/leave-requests", token); }
export function setLeaveRequestStatus(token: string, id: number, status: "Approved" | "Rejected") {
  return apiPatch<any>(`/admin/leave-requests/${id}/status`, token, { status });
}

export function fetchProjectMessages(token: string, projectId: number) {
  return apiGet<any[]>(`/admin/messages?projectId=${projectId}`, token);
}
export function sendProjectMessage(token: string, projectId: number, text: string) {
  return apiPost<any>("/admin/messages", token, { projectId, text });
}
