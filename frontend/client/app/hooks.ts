"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { fetchProjects, fetchMilestones, fetchFiles, fetchInvoices, fetchTickets, fetchMessages } from "./queries";

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
  return useQuery({ queryKey: ["messages"], queryFn: () => fetchMessages(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}
