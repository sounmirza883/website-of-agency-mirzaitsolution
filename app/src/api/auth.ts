import { API_BASE, apiGet } from './client';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'client';
  dept: string | null;
  position: string | null;
  company: string | null;
  canCreateClients: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export function fetchMe(token: string) {
  return apiGet<AuthUser>('/auth/me', token);
}
