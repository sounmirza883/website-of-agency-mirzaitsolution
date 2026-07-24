const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return res.json();
}

export function fetchAssignedProjects() { return apiGet<any[]>("/employee/assigned-projects"); }
export function fetchEmpTasks() { return apiGet<any[]>("/employee/tasks"); }
export function fetchEmpFiles() { return apiGet<any[]>("/employee/files"); }
export function fetchStatusUpdates() { return apiGet<any[]>("/employee/status-updates"); }
export function fetchAttendance() { return apiGet<any[]>("/employee/attendance"); }
export function fetchLeaveRequests() { return apiGet<any[]>("/employee/leave-requests"); }
