import { apiGet, apiPatch, apiPost } from './client';

export interface EmployeeProject {
  id: number;
  name: string;
  client: string;
  clientId: number;
  employeeId: number;
  status: string;
  deadline: string;
  progress: number;
}

export interface EmployeeTask {
  id: number;
  project: string;
  task: string;
  priority: string;
  due: string;
  status: string;
  employee_id: number;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  employee_id: number;
}

export interface LeaveRequest {
  id: number;
  type: string;
  reason: string;
  from: string;
  to: string;
  status: string;
  employee_id: number;
}

export interface ProjectMessage {
  id: number;
  projectId: number;
  senderId: number;
  senderRole: 'admin' | 'employee' | 'client';
  text: string;
  time: string;
  client_id?: number;
}

export interface EmployeeNotification {
  id: number;
  title: string;
  msg: string;
  date: string;
}

export function fetchAssignedProjects(token: string) {
  return apiGet<EmployeeProject[]>('/employee/assigned-projects', token);
}

export function fetchEmployeeTasks(token: string) {
  return apiGet<EmployeeTask[]>('/employee/tasks', token);
}

export function createEmployeeTask(
  token: string,
  payload: { project: string; task: string; priority: string; due: string }
) {
  return apiPost<EmployeeTask>('/employee/tasks', token, payload);
}

export function updateEmployeeTaskStatus(token: string, id: number, status: string) {
  return apiPatch<EmployeeTask>(`/employee/tasks/${id}/status`, token, { status });
}

export function fetchAttendance(token: string) {
  return apiGet<AttendanceRecord[]>('/employee/attendance', token);
}

export function checkIn(token: string) {
  return apiPost<AttendanceRecord>('/employee/attendance/check-in', token, {});
}

export function checkOut(token: string) {
  return apiPost<AttendanceRecord>('/employee/attendance/check-out', token, {});
}

export function fetchLeaveRequests(token: string) {
  return apiGet<LeaveRequest[]>('/employee/leave-requests', token);
}

export function createLeaveRequest(
  token: string,
  payload: { type: string; reason: string; from: string; to: string }
) {
  return apiPost<LeaveRequest>('/employee/leave-requests', token, payload);
}

export function fetchEmployeeMessages(token: string, projectId: number) {
  return apiGet<ProjectMessage[]>(`/employee/messages?projectId=${projectId}`, token);
}

export function sendEmployeeMessage(token: string, projectId: number, text: string) {
  return apiPost<ProjectMessage>('/employee/messages', token, { projectId, text });
}

export function fetchEmployeeNotifications(token: string) {
  return apiGet<EmployeeNotification[]>('/employee/notifications', token);
}
