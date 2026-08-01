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

async function apiUpload<T>(path: string, token: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function fetchMyClients(token: string) { return apiGet<any[]>("/employee/clients", token); }
export function createClient(token: string, payload: { name: string; email: string; password: string; company: string }) {
  return apiPost<any>("/employee/clients", token, payload);
}

export function fetchAssignedProjects(token: string) { return apiGet<any[]>("/employee/assigned-projects", token); }
export function fetchEmpTasks(token: string) { return apiGet<any[]>("/employee/tasks", token); }
export function fetchEmpFiles(token: string) { return apiGet<any[]>("/employee/files", token); }
export function fetchStatusUpdates(token: string) { return apiGet<any[]>("/employee/status-updates", token); }
export function fetchAttendance(token: string) { return apiGet<any[]>("/employee/attendance", token); }
export function fetchLeaveRequests(token: string) { return apiGet<any[]>("/employee/leave-requests", token); }

export function createTask(token: string, payload: { project: string; task: string; priority: string; due: string }) {
  return apiPost<any>("/employee/tasks", token, payload);
}
export function updateTaskStatus(token: string, id: number, status: string) {
  return apiPatch<any>(`/employee/tasks/${id}/status`, token, { status });
}
export function postStatusUpdate(token: string, payload: { project: string; update: string; progress: number }) {
  return apiPost<any>("/employee/status-updates", token, payload);
}
export function checkIn(token: string) { return apiPost<any>("/employee/attendance/check-in", token, {}); }
export function checkOut(token: string) { return apiPost<any>("/employee/attendance/check-out", token, {}); }
export function requestLeave(token: string, payload: { type: string; reason: string; from: string; to: string }) {
  return apiPost<any>("/employee/leave-requests", token, payload);
}
export function uploadFile(token: string, formData: FormData) { return apiUpload<any>("/employee/files", token, formData); }

export function fetchProjectMessages(token: string, projectId: number) {
  return apiGet<any[]>(`/employee/messages?projectId=${projectId}`, token);
}
export function sendProjectMessage(token: string, projectId: number, text: string) {
  return apiPost<any>("/employee/messages", token, { projectId, text });
}

export function fetchEmpNotifications(token: string) { return apiGet<any[]>("/employee/notifications", token); }
export function fetchEmpTickets(token: string) { return apiGet<any[]>("/employee/tickets", token); }
export function setEmpTicketStatus(token: string, id: string, status: string) {
  return apiPatch<any>(`/employee/tickets/${id}/status`, token, { status });
}
export function createEmpNotification(token: string, payload: { title: string; msg: string; targetRole: "employee" | "client" | "all"; targetClientId?: number }) {
  return apiPost<any>("/employee/notifications", token, payload);
}

// Staff chat (DMs + channels between admins and employees), separate from the
// project-scoped messages above. Channel creation is admin-only, so there is no
// createChatChannel here.
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
