"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAssignedProjects, fetchEmpTasks, fetchEmpFiles, fetchStatusUpdates, fetchAttendance, fetchLeaveRequests } from "./queries";

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
