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
