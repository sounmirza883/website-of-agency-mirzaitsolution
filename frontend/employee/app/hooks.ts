"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { fetchMyClients, createClient, fetchAssignedProjects, fetchEmpTasks, fetchEmpFiles, fetchStatusUpdates, fetchAttendance, fetchLeaveRequests } from "./queries";

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
  return useQuery({ queryKey: ["assignedProjects"], queryFn: fetchAssignedProjects, staleTime: 1000 * 60 * 5 });
}

export function useEmpTasks() {
  return useQuery({ queryKey: ["empTasks"], queryFn: fetchEmpTasks, staleTime: 1000 * 60 * 5 });
}

export function useEmpFiles() {
  return useQuery({ queryKey: ["empFiles"], queryFn: fetchEmpFiles, staleTime: 1000 * 60 * 5 });
}

export function useStatusUpdates() {
  return useQuery({ queryKey: ["statusUpdates"], queryFn: fetchStatusUpdates, staleTime: 1000 * 60 * 5 });
}

export function useAttendance() {
  return useQuery({ queryKey: ["attendance"], queryFn: fetchAttendance, staleTime: 1000 * 60 * 5 });
}

export function useLeaveRequests() {
  return useQuery({ queryKey: ["leaveRequests"], queryFn: fetchLeaveRequests, staleTime: 1000 * 60 * 5 });
}
