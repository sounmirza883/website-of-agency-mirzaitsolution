const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return res.json();
}

export function fetchUsers() { return apiGet<any[]>("/admin/users"); }
export function fetchEmployees() { return apiGet<any[]>("/admin/employees"); }
export function fetchClientsList() { return apiGet<any[]>("/admin/clients"); }
export function fetchServices() { return apiGet<any[]>("/admin/services"); }
export function fetchProjects() { return apiGet<any[]>("/admin/projects"); }
export function fetchInvoices() { return apiGet<any[]>("/admin/invoices"); }
export function fetchNotifications() { return apiGet<any[]>("/admin/notifications"); }
export function fetchBlogPosts() { return apiGet<any[]>("/admin/blog"); }
export function fetchPortfolioList() { return apiGet<any[]>("/admin/portfolio"); }
