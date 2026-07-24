"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProjects, fetchMilestones, fetchFiles, fetchInvoices, fetchTickets, fetchMessages } from "./queries";

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: fetchProjects, staleTime: 1000 * 60 * 5 });
}

export function useMilestones() {
  return useQuery({ queryKey: ["milestones"], queryFn: fetchMilestones, staleTime: 1000 * 60 * 5 });
}

export function useFiles() {
  return useQuery({ queryKey: ["files"], queryFn: fetchFiles, staleTime: 1000 * 60 * 5 });
}

export function useInvoices() {
  return useQuery({ queryKey: ["invoices"], queryFn: fetchInvoices, staleTime: 1000 * 60 * 5 });
}

export function useTickets() {
  return useQuery({ queryKey: ["tickets"], queryFn: fetchTickets, staleTime: 1000 * 60 * 5 });
}

export function useMessages() {
  return useQuery({ queryKey: ["messages"], queryFn: fetchMessages, staleTime: 1000 * 60 * 5 });
}
