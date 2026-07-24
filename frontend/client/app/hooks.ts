"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { fetchProjects, fetchMilestones, fetchFiles, fetchInvoices, fetchTickets, fetchMessages, payInvoice, createTicket, updateTicketStatus, sendMessage } from "./queries";

export function useProjects() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useMilestones() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["milestones"], queryFn: () => fetchMilestones(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useFiles() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["files"], queryFn: () => fetchFiles(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useInvoices() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["invoices"], queryFn: () => fetchInvoices(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useTickets() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["tickets"], queryFn: () => fetchTickets(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useMessages() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["messages"], queryFn: () => fetchMessages(token!), enabled: !!token, staleTime: 1000 * 60 * 5, refetchInterval: 5000 });
}

export function usePayInvoice() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payInvoice(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useCreateTicket() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createTicket>[1]) => createTicket(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });
}

export function useUpdateTicketStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: string }) => updateTicketStatus(token!, vars.id, vars.status),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["tickets"] });
      const prev = qc.getQueryData<any[]>(["tickets"]);
      qc.setQueryData<any[]>(["tickets"], (old) => old?.map((t) => (t.id === vars.id ? { ...t, status: vars.status } : t)));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tickets"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });
}

export function useSendMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => sendMessage(token!, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}
