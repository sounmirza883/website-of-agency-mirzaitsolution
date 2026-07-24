export interface User {
  id: number; name: string; email: string; role: string; status: string;
}
export interface Service {
  id: number; name: string; price: string; duration: string;
}
export interface Project {
  id: number; name: string; client: string; clientId: number | null; employeeId: number | null; status: string; deadline: string; progress: number;
}
export interface Invoice {
  id: string; client: string; amount: string; status: string; date: string; proofUrl: string | null;
}
export interface Notification {
  id: number; title: string; msg: string; date: string; createdBy: number | null; creatorRole: string; targetRole: string; targetUserId: number | null;
}
export interface BlogPost {
  id: number; title: string; author: string; date: string; status: string; content: string;
}
export interface PortfolioItem {
  id: number; title: string; client: string; category: string; description: string | null;
}
export interface Task {
  id: number; project: string; task: string; priority: string; due: string; status: string; employee_id: number;
}
export interface ProjectFile {
  id: number; name: string; project: string; size: string; uploaded: string; status: string; uploaded_by: number; client_id: number | null; url: string;
}
export interface StatusUpdate {
  id: number; project: string; update: string; progress: number; date: string; employee_id: number;
}
export interface Attendance {
  id: number; date: string; checkIn: string; checkOut: string; status: string; employee_id: number;
}
export interface LeaveRequest {
  id: number; type: string; reason: string; from: string; to: string; status: string; employee_id: number;
}
export interface Milestone {
  id: number; project: string; task: string; status: string; date: string; client_id: number;
}
export interface ClientInvoice {
  id: string; project: string; amount: string; status: string; due: string; client_id: number; proofUrl: string | null;
}
export interface Ticket {
  id: string; subject: string; status: string; priority: string; updated: string; client_id: number; description: string;
}
export interface ProjectMessage {
  id: number; projectId: number; senderId: number | null; senderRole: string; text: string; time: string; client_id: number;
}
export interface WebsiteContactSubmission {
  id: number; name: string; email: string; phone: string | null; service: string | null; message: string; created_at: string;
}
export interface WebsiteService {
  title: string; icon: string; description: string;
}
export interface WebsitePortfolio {
  title: string; category: string; slug: string; icon: string;
}
export interface ServiceDetail {
  title: string; description: string; features: string[]; className: string;
}
