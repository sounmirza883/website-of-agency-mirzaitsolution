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
export function fetchPortfolioList(token: string) { return apiGet<any[]>("/admin/portfolio", token); }
export function fetchContactSubmissions(token: string) { return apiGet<any[]>("/admin/contact-submissions", token); }
export function deleteLead(token: string, id: number) { return apiDelete(`/admin/contact-submissions/${id}`, token); }
export function fetchPaymentSettings(token: string) { return apiGet<any>("/admin/payment-settings", token); }
export function fetchAdminTickets(token: string) { return apiGet<any[]>("/admin/tickets", token); }
export function setTicketStatus(token: string, id: string, status: string) {
  return apiPatch<any>(`/admin/tickets/${id}/status`, token, { status });
}

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

// Staff chat (DMs + channels between admins and employees), separate from the
// project-scoped messages above.
async function apiUpload<T>(path: string, token: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function fetchChatContacts(token: string) { return apiGet<any[]>("/chat/contacts", token); }
export function fetchChatConversations(token: string) { return apiGet<any[]>("/chat/conversations", token); }
// Returns one newest-first page, oldest-last in the array. `before` walks
// backwards through history for "load older".
export function fetchChatMessages(token: string, conversationId: number, before?: number) {
  const qs = before ? `?before=${before}` : "";
  return apiGet<{ messages: any[]; hasMore: boolean }>(`/chat/conversations/${conversationId}/messages${qs}`, token);
}
export function sendChatMessage(token: string, conversationId: number, text: string, mentionIds: number[] = [], replyToId?: number | null) {
  return apiPost<any>(`/chat/conversations/${conversationId}/messages`, token, { text, mentionIds, replyToId });
}
export function toggleChatReaction(token: string, conversationId: number, messageId: number, emoji: string) {
  return apiPost<any>(`/chat/conversations/${conversationId}/messages/${messageId}/reactions`, token, { emoji });
}
export function openChatDm(token: string, userId: number) {
  return apiPost<any>("/chat/conversations/dm", token, { userId });
}
export function createChatChannel(token: string, payload: { name: string; memberIds: number[] }) {
  return apiPost<any>("/chat/conversations/channel", token, payload);
}
export function markChatRead(token: string, conversationId: number) {
  return apiPost<any>(`/chat/conversations/${conversationId}/read`, token, {});
}
export function sendChatAttachment(token: string, conversationId: number, file: File, text: string, mentionIds: number[] = []) {
  const fd = new FormData();
  fd.append("file", file);
  if (text) fd.append("text", text);
  // Multipart has no array type, so ids ride as JSON and are parsed server-side.
  if (mentionIds.length) fd.append("mentionIds", JSON.stringify(mentionIds));
  return apiUpload<any>(`/chat/conversations/${conversationId}/attachments`, token, fd);
}
export function editChatMessage(token: string, conversationId: number, messageId: number, text: string, mentionIds: number[] = []) {
  return apiPatch<any>(`/chat/conversations/${conversationId}/messages/${messageId}`, token, { text, mentionIds });
}
export function deleteChatMessage(token: string, conversationId: number, messageId: number) {
  return apiDelete(`/chat/conversations/${conversationId}/messages/${messageId}`, token);
}
export function leaveChatConversation(token: string, conversationId: number) {
  return apiPost<any>(`/chat/conversations/${conversationId}/leave`, token, {});
}
export function renameChatChannel(token: string, conversationId: number, name: string) {
  return apiPatch<any>(`/chat/conversations/${conversationId}`, token, { name });
}
export function addChatMember(token: string, conversationId: number, userId: number) {
  return apiPost<any>(`/chat/conversations/${conversationId}/members`, token, { userId });
}
export function removeChatMember(token: string, conversationId: number, userId: number) {
  return apiDelete(`/chat/conversations/${conversationId}/members/${userId}`, token);
}
export function deleteChatChannel(token: string, conversationId: number) {
  return apiDelete(`/chat/conversations/${conversationId}`, token);
}
export function searchChatMessages(token: string, q: string) {
  return apiGet<any[]>(`/chat/search?q=${encodeURIComponent(q)}`, token);
}
