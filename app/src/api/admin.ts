import { apiGet, apiPatch, apiPost } from './client';

export interface AdminProject {
  id: number;
  name: string;
  client: string;
  clientId: number | null;
  employeeId: number | null;
  status: string;
  deadline: string;
  progress: number;
}

export interface AdminEmployee {
  id: number;
  name: string;
  email: string;
  dept: string | null;
  position: string | null;
  status: string;
  canCreateClients: boolean;
}

export interface AdminClient {
  id: number;
  name: string;
  email: string;
  company: string | null;
  status: string;
}

export interface AdminInvoice {
  id: string;
  client: string;
  amount: string;
  status: 'Unpaid' | 'PendingVerification' | 'Paid';
  date: string;
  proofUrl: string | null;
}

export interface AdminNotification {
  id: number;
  title: string;
  msg: string;
  date: string;
  created_by: number | null;
  creator_role: string | null;
  target_role: string | null;
  target_user_id: number | null;
}

export interface AdminLeaveRequest {
  id: number;
  type: string;
  reason: string;
  from: string;
  to: string;
  status: string;
  employee_id: number;
  users: { name: string } | null;
}

export interface AdminMessage {
  id: number;
  projectId: number;
  senderId: number;
  senderRole: 'admin' | 'employee' | 'client';
  text: string;
  time: string;
  client_id: number | null;
}

export function fetchAdminProjects(token: string) {
  return apiGet<AdminProject[]>('/admin/projects', token);
}

export function updateAdminProjectStatus(token: string, id: number, status: string) {
  return apiPatch<AdminProject>(`/admin/projects/${id}/status`, token, { status });
}

export function assignAdminProjectEmployee(token: string, id: number, employeeId: number | null) {
  return apiPatch<AdminProject>(`/admin/projects/${id}/assign`, token, { employeeId });
}

export function fetchAdminEmployees(token: string) {
  return apiGet<AdminEmployee[]>('/admin/employees', token);
}

export function fetchAdminClients(token: string) {
  return apiGet<AdminClient[]>('/admin/clients', token);
}

export function fetchAdminInvoices(token: string) {
  return apiGet<AdminInvoice[]>('/admin/invoices', token);
}

export function verifyAdminInvoice(token: string, id: string, approve: boolean) {
  return apiPatch<AdminInvoice>(`/admin/invoices/${id}/verify`, token, { approve });
}

export function fetchAdminNotifications(token: string) {
  return apiGet<AdminNotification[]>('/admin/notifications', token);
}

export function createAdminNotification(
  token: string,
  payload: { title: string; msg: string; targetRole?: 'all' | 'employee' | 'client'; targetUserId?: number }
) {
  return apiPost<AdminNotification>('/admin/notifications', token, payload);
}

export function fetchAdminLeaveRequests(token: string) {
  return apiGet<AdminLeaveRequest[]>('/admin/leave-requests', token);
}

export function setAdminLeaveRequestStatus(token: string, id: number, status: 'Approved' | 'Rejected') {
  return apiPatch<AdminLeaveRequest>(`/admin/leave-requests/${id}/status`, token, { status });
}

export function fetchAdminMessages(token: string, projectId: number) {
  return apiGet<AdminMessage[]>(`/admin/messages?projectId=${projectId}`, token);
}

export function sendAdminMessage(token: string, projectId: number, text: string) {
  return apiPost<AdminMessage>('/admin/messages', token, { projectId, text });
}
