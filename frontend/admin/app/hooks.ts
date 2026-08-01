"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { fetchUsers, fetchEmployees, fetchClientsList, createEmployee, createClient, setEmployeePermission, fetchServices, fetchProjects, fetchInvoices, fetchNotifications, fetchPortfolioList, fetchContactSubmissions, deleteLead, fetchPaymentSettings, fetchAdminTickets, setTicketStatus, createService, createProject, updateProjectStatus, assignProjectEmployee, createInvoice, verifyInvoice, createNotification, createPortfolioItem, setUserStatus, updateUserDetails, deleteUserAccount, fetchAdminAttendance, fetchAdminLeaveRequests, setLeaveRequestStatus, fetchProjectMessages, sendProjectMessage, changePassword, updatePaymentSettings,
  fetchChatContacts, fetchChatConversations, fetchChatMessages, sendChatMessage, openChatDm, createChatChannel, markChatRead, sendChatAttachment } from "./queries";

export function useChangePassword() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (payload: Parameters<typeof changePassword>[1]) => changePassword(token!, payload),
  });
}

export function useUsers() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["users"], queryFn: () => fetchUsers(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useEmployees() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["employees"], queryFn: () => fetchEmployees(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useClientsList() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["clientsList"], queryFn: () => fetchClientsList(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useCreateEmployee() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createEmployee>[1]) => createEmployee(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useCreateClient() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createClient>[1]) => createClient(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientsList"] }),
  });
}

export function useSetEmployeePermission() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, canCreateClients }: { id: number; canCreateClients: boolean }) => setEmployeePermission(token!, id, canCreateClients),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useServices() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["services"], queryFn: () => fetchServices(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useProjects() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useInvoices() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["invoices"], queryFn: () => fetchInvoices(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useNotifications() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["notifications"], queryFn: () => fetchNotifications(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function usePortfolioList() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["portfolioList"], queryFn: () => fetchPortfolioList(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useContactSubmissions() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["contactSubmissions"], queryFn: () => fetchContactSubmissions(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useAdminTickets() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["adminTickets"], queryFn: () => fetchAdminTickets(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useSetTicketStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: string }) => setTicketStatus(token!, vars.id, vars.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminTickets"] }),
  });
}

export function useDeleteLead() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteLead(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contactSubmissions"] }),
  });
}

export function usePaymentSettings() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["paymentSettings"], queryFn: () => fetchPaymentSettings(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useUpdatePaymentSettings() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof updatePaymentSettings>[1]) => updatePaymentSettings(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentSettings"] }),
  });
}

export function useCreateService() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createService>[1]) => createService(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useCreateProject() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createProject>[1]) => createProject(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProjectStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; status: string }) => updateProjectStatus(token!, vars.id, vars.status),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["projects"] });
      const prev = qc.getQueryData<any[]>(["projects"]);
      qc.setQueryData<any[]>(["projects"], (old) => old?.map((p) => (p.id === vars.id ? { ...p, status: vars.status } : p)));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(["projects"], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useCreateInvoice() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createInvoice>[1]) => createInvoice(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useVerifyInvoice() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve }: { id: number; approve: boolean }) => verifyInvoice(token!, id, approve),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useAssignProjectEmployee() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, employeeId }: { id: number; employeeId: number | null }) => assignProjectEmployee(token!, id, employeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useCreateNotification() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createNotification>[1]) => createNotification(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useCreatePortfolioItem() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createPortfolioItem>[1]) => createPortfolioItem(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolioList"] }),
  });
}

export function useSetUserStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => setUserStatus(token!, id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUserDetails() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateUserDetails>[2] }) => updateUserDetails(token!, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["clientsList"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUserAccount(token!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["clientsList"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAdminAttendance() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["adminAttendance"], queryFn: () => fetchAdminAttendance(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useAdminLeaveRequests() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["adminLeaveRequests"], queryFn: () => fetchAdminLeaveRequests(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useSetLeaveRequestStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: "Approved" | "Rejected" }) => setLeaveRequestStatus(token!, id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminLeaveRequests"] }),
  });
}

export function useProjectMessages(projectId: number | null | undefined) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["projectMessages", projectId],
    queryFn: () => fetchProjectMessages(token!, projectId!),
    enabled: !!token && !!projectId,
    refetchInterval: 5000,
  });
}

// --- Staff chat (DMs + channels) ---------------------------------------
// Polls on the same 5s cadence as project chat; phase 3 replaces this with a
// Supabase Realtime subscription and drops the interval to a slow safety net.

export function useChatContacts() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["chatContacts"], queryFn: () => fetchChatContacts(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useChatConversations() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["chatConversations"], queryFn: () => fetchChatConversations(token!), enabled: !!token, refetchInterval: 30000 });
}

export function useChatMessages(conversationId: number | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["chatMessages", conversationId],
    queryFn: () => fetchChatMessages(token!, conversationId!),
    enabled: !!token && !!conversationId,
    refetchInterval: 30000,
  });
}

export function useSendChatMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, text }: { conversationId: number; text: string }) => sendChatMessage(token!, conversationId, text),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["chatMessages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["chatConversations"] });
    },
  });
}

export function useOpenChatDm() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => openChatDm(token!, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chatConversations"] }),
  });
}

export function useCreateChatChannel() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createChatChannel>[1]) => createChatChannel(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chatConversations"] }),
  });
}

export function useMarkChatRead() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) => markChatRead(token!, conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chatConversations"] }),
  });
}

export function useSendProjectMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, text }: { projectId: number; text: string }) => sendProjectMessage(token!, projectId, text),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["projectMessages", vars.projectId] }),
  });
}

export function useSendChatAttachment() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, file, text }: { conversationId: number; file: File; text: string }) =>
      sendChatAttachment(token!, conversationId, file, text),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["chatMessages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["chatConversations"] });
    },
  });
}
