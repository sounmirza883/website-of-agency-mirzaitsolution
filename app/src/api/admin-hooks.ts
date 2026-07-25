import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import {
  assignAdminProjectEmployee,
  createAdminNotification,
  fetchAdminClients,
  fetchAdminEmployees,
  fetchAdminInvoices,
  fetchAdminLeaveRequests,
  fetchAdminMessages,
  fetchAdminNotifications,
  fetchAdminProjects,
  sendAdminMessage,
  setAdminLeaveRequestStatus,
  updateAdminProjectStatus,
  verifyAdminInvoice,
} from './admin';

export function useAdminProjects() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => fetchAdminProjects(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminEmployees() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'employees'],
    queryFn: () => fetchAdminEmployees(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminClients() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'clients'],
    queryFn: () => fetchAdminClients(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminInvoices() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'invoices'],
    queryFn: () => fetchAdminInvoices(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminNotifications() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => fetchAdminNotifications(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminLeaveRequests() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'leaveRequests'],
    queryFn: () => fetchAdminLeaveRequests(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminMessages(projectId: number | null | undefined) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'messages', projectId],
    queryFn: () => fetchAdminMessages(token!, projectId!),
    enabled: !!token && !!projectId,
    refetchInterval: 5000,
  });
}

export function useUpdateAdminProjectStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; status: string }) => updateAdminProjectStatus(token!, vars.id, vars.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'projects'] }),
  });
}

export function useAssignAdminProjectEmployee() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; employeeId: number | null }) => assignAdminProjectEmployee(token!, vars.id, vars.employeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'projects'] }),
  });
}

export function useVerifyAdminInvoice() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; approve: boolean }) => verifyAdminInvoice(token!, vars.id, vars.approve),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'invoices'] }),
  });
}

export function useCreateAdminNotification() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createAdminNotification>[1]) => createAdminNotification(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });
}

export function useSetAdminLeaveRequestStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; status: 'Approved' | 'Rejected' }) => setAdminLeaveRequestStatus(token!, vars.id, vars.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'leaveRequests'] }),
  });
}

export function useSendAdminMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: number; text: string }) => sendAdminMessage(token!, vars.projectId, vars.text),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['admin', 'messages', vars.projectId] }),
  });
}
