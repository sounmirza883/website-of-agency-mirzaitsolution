"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { fetchProjects, fetchMilestones, fetchFiles, fetchInvoices, fetchPaymentSettings, fetchTickets, fetchMessages, submitInvoicePayment, createTicket, sendMessage, fetchClientNotifications, changePassword } from "./queries";

export function useChangePassword() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (payload: Parameters<typeof changePassword>[1]) => changePassword(token!, payload),
  });
}

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

export function usePaymentSettings() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["paymentSettings"], queryFn: () => fetchPaymentSettings(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useTickets() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["tickets"], queryFn: () => fetchTickets(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useMessages(projectId?: string) {
  const { token } = useAuth();
  return useQuery({ queryKey: ["messages", projectId], queryFn: () => fetchMessages(token!, projectId!), enabled: !!token && !!projectId, staleTime: 1000 * 60 * 5, refetchInterval: 5000 });
}

export function useClientNotifications() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["notifications"], queryFn: () => fetchClientNotifications(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useSubmitInvoicePayment() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; formData: FormData }) => submitInvoicePayment(token!, vars.id, vars.formData),
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

export function useSendMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: string; text: string }) => sendMessage(token!, vars.projectId, vars.text),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["messages", vars.projectId] }),
  });
}
