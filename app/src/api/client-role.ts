import { apiGet, apiPatch, apiPost, apiUpload } from './client';

export interface ClientProject {
  id: number;
  name: string;
  client: string;
  clientId: number;
  employeeId: number | null;
  status: string;
  deadline: string;
  progress: number;
}

export interface ClientMilestone {
  id: number;
  project: string;
  task: string;
  status: string;
  date: string;
  client_id: number;
}

export interface ClientInvoice {
  id: string;
  project: string;
  amount: string;
  status: 'Unpaid' | 'PendingVerification' | 'Paid';
  due: string;
  client_id: number;
  proofUrl: string | null;
}

export interface ClientTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  updated: string;
  client_id: number;
  description: string;
}

export interface ClientMessage {
  id: number;
  projectId: number;
  senderId: number;
  senderRole: 'admin' | 'employee' | 'client';
  text: string;
  time: string;
  client_id: number;
}

export interface ClientNotification {
  id: number;
  title: string;
  msg: string;
  date: string;
}

export function fetchClientProjects(token: string) {
  return apiGet<ClientProject[]>('/client/projects', token);
}

export function fetchClientMilestones(token: string) {
  return apiGet<ClientMilestone[]>('/client/milestones', token);
}

export function fetchClientInvoices(token: string) {
  return apiGet<ClientInvoice[]>('/client/invoices', token);
}

export function submitClientInvoicePayment(token: string, id: string, formData: FormData) {
  return apiUpload<ClientInvoice>(`/client/invoices/${id}/submit-payment`, token, formData);
}

export function fetchClientTickets(token: string) {
  return apiGet<ClientTicket[]>('/client/tickets', token);
}

export function createClientTicket(token: string, payload: { subject: string; priority: string; description: string }) {
  return apiPost<ClientTicket>('/client/tickets', token, payload);
}

export function updateClientTicketStatus(token: string, id: string, status: string) {
  return apiPatch<ClientTicket>(`/client/tickets/${id}/status`, token, { status });
}

export function fetchClientMessages(token: string, projectId: number) {
  return apiGet<ClientMessage[]>(`/client/messages?projectId=${projectId}`, token);
}

export function sendClientMessage(token: string, projectId: number, text: string) {
  return apiPost<ClientMessage>('/client/messages', token, { projectId, text });
}

export function fetchClientNotifications(token: string) {
  return apiGet<ClientNotification[]>('/client/notifications', token);
}
