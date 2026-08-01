"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { fetchMyClients, createClient, fetchAssignedProjects, fetchEmpTasks, fetchEmpFiles, fetchStatusUpdates, fetchAttendance, fetchLeaveRequests, createTask, updateTaskStatus, postStatusUpdate, checkIn, checkOut, requestLeave, uploadFile, fetchProjectMessages, sendProjectMessage, fetchEmpNotifications, createEmpNotification, changePassword, fetchEmpTickets, setEmpTicketStatus,
  fetchChatContacts, fetchChatConversations, fetchChatMessages, sendChatMessage, openChatDm, markChatRead, sendChatAttachment, editChatMessage, deleteChatMessage, leaveChatConversation, toggleChatReaction } from "./queries";

export function useChangePassword() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (payload: Parameters<typeof changePassword>[1]) => changePassword(token!, payload),
  });
}

export function useMyClients() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["myClients"], queryFn: () => fetchMyClients(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useCreateClient() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createClient>[1]) => createClient(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myClients"] }),
  });
}

export function useAssignedProjects() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["assignedProjects"], queryFn: () => fetchAssignedProjects(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useEmpTasks() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["empTasks"], queryFn: () => fetchEmpTasks(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useEmpFiles() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["empFiles"], queryFn: () => fetchEmpFiles(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useStatusUpdates() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["statusUpdates"], queryFn: () => fetchStatusUpdates(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useAttendance() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["attendance"], queryFn: () => fetchAttendance(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useLeaveRequests() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["leaveRequests"], queryFn: () => fetchLeaveRequests(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useCreateTask() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createTask>[1]) => createTask(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empTasks"] }),
  });
}

export function useUpdateTaskStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; status: string }) => updateTaskStatus(token!, vars.id, vars.status),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["empTasks"] });
      const prev = qc.getQueryData<any[]>(["empTasks"]);
      qc.setQueryData<any[]>(["empTasks"], (old) => old?.map((t) => (t.id === vars.id ? { ...t, status: vars.status } : t)));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(["empTasks"], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["empTasks"] }),
  });
}

export function usePostStatusUpdate() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof postStatusUpdate>[1]) => postStatusUpdate(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["statusUpdates"] }),
  });
}

export function useCheckIn() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => checkIn(token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useCheckOut() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => checkOut(token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useRequestLeave() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof requestLeave>[1]) => requestLeave(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });
}

export function useUploadFile() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => uploadFile(token!, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empFiles"] }),
  });
}

export function useProjectMessages(projectId: number | undefined) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["projectMessages", projectId],
    queryFn: () => fetchProjectMessages(token!, projectId!),
    enabled: !!token && !!projectId,
    refetchInterval: 5000,
  });
}

export function useSendProjectMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: number; text: string }) => sendProjectMessage(token!, vars.projectId, vars.text),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["projectMessages", vars.projectId] }),
  });
}

export function useEmpNotifications() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["empNotifications"], queryFn: () => fetchEmpNotifications(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useCreateEmpNotification() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createEmpNotification>[1]) => createEmpNotification(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empNotifications"] }),
  });
}

export function useEmpTickets() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["empTickets"], queryFn: () => fetchEmpTickets(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useSetEmpTicketStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: string }) => setEmpTicketStatus(token!, vars.id, vars.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empTickets"] }),
  });
}

// --- Staff chat (DMs + channels) ---------------------------------------
// Delivery is realtime (see app/realtime.ts); the 30s interval below is only a
// safety net so a dropped socket still recovers on its own.

export function useChatContacts() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["chatContacts"], queryFn: () => fetchChatContacts(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useChatConversations() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["chatConversations"], queryFn: () => fetchChatConversations(token!), enabled: !!token, refetchInterval: 30000 });
}

// Paged newest-first from the server; useInfiniteQuery walks backwards with
// the oldest id on the current page as the cursor.
export function useChatMessages(conversationId: number | null) {
  const { token } = useAuth();
  return useInfiniteQuery({
    queryKey: ["chatMessages", conversationId],
    queryFn: ({ pageParam }) => fetchChatMessages(token!, conversationId!, pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    // Pages arrive oldest-last, so the cursor for older history is the first id.
    getNextPageParam: (last) => (last.hasMore ? last.messages[0]?.id : undefined),
    enabled: !!token && !!conversationId,
    refetchInterval: 30000,
  });
}

export function useSendChatMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, text, mentionIds, replyToId }: { conversationId: number; text: string; mentionIds?: number[]; replyToId?: number | null }) =>
      sendChatMessage(token!, conversationId, text, mentionIds ?? [], replyToId ?? null),
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

export function useMarkChatRead() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) => markChatRead(token!, conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chatConversations"] }),
  });
}

export function useSendChatAttachment() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, file, text, mentionIds }: { conversationId: number; file: File; text: string; mentionIds?: number[] }) =>
      sendChatAttachment(token!, conversationId, file, text, mentionIds ?? []),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["chatMessages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["chatConversations"] });
    },
  });
}

export function useEditChatMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageId, text, mentionIds }: { conversationId: number; messageId: number; text: string; mentionIds?: number[] }) =>
      editChatMessage(token!, conversationId, messageId, text, mentionIds ?? []),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["chatMessages", v.conversationId] });
      qc.invalidateQueries({ queryKey: ["chatConversations"] });
    },
  });
}

export function useDeleteChatMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: number; messageId: number }) =>
      deleteChatMessage(token!, conversationId, messageId),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["chatMessages", v.conversationId] });
      qc.invalidateQueries({ queryKey: ["chatConversations"] });
    },
  });
}

export function useLeaveChatConversation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) => leaveChatConversation(token!, conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chatConversations"] }),
  });
}

export function useToggleChatReaction() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageId, emoji }: { conversationId: number; messageId: number; emoji: string }) =>
      toggleChatReaction(token!, conversationId, messageId, emoji),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["chatMessages", v.conversationId] }),
  });
}
