import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import {
  createClientTicket,
  fetchClientInvoices,
  fetchClientMessages,
  fetchClientMilestones,
  fetchClientNotifications,
  fetchClientProjects,
  fetchClientTickets,
  sendClientMessage,
  submitClientInvoicePayment,
  updateClientTicketStatus,
  type ClientTicket,
} from './client-role';

export function useClientProjects() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['client', 'projects'],
    queryFn: () => fetchClientProjects(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useClientMilestones() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['client', 'milestones'],
    queryFn: () => fetchClientMilestones(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useClientInvoices() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['client', 'invoices'],
    queryFn: () => fetchClientInvoices(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useClientTickets() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['client', 'tickets'],
    queryFn: () => fetchClientTickets(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useClientMessages(projectId: number | null | undefined) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['client', 'messages', projectId],
    queryFn: () => fetchClientMessages(token!, projectId!),
    enabled: !!token && !!projectId,
    refetchInterval: 5000,
  });
}

export function useClientNotifications() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['client', 'notifications'],
    queryFn: () => fetchClientNotifications(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubmitInvoicePayment() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; formData: FormData }) => submitClientInvoicePayment(token!, vars.id, vars.formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client', 'invoices'] }),
  });
}

export function useCreateClientTicket() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createClientTicket>[1]) => createClientTicket(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client', 'tickets'] }),
  });
}

export function useUpdateClientTicketStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: string }) => updateClientTicketStatus(token!, vars.id, vars.status),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ['client', 'tickets'] });
      const prev = qc.getQueryData<ClientTicket[]>(['client', 'tickets']);
      qc.setQueryData<ClientTicket[]>(['client', 'tickets'], (old) =>
        old?.map((t) => (t.id === vars.id ? { ...t, status: vars.status } : t))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['client', 'tickets'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['client', 'tickets'] }),
  });
}

export function useSendClientMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: number; text: string }) => sendClientMessage(token!, vars.projectId, vars.text),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['client', 'messages', vars.projectId] }),
  });
}
