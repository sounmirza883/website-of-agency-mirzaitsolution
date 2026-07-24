const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return res.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function fetchServices() { return apiGet<any[]>("/website/services"); }
export function fetchPortfolio() { return apiGet<any[]>("/website/portfolio"); }
export function fetchServiceDetails() { return apiGet<any[]>("/website/service-details"); }
export function submitContact(payload: { name: string; email: string; phone: string; service: string; message: string }) {
  return apiPost<any>("/website/contact", payload);
}
