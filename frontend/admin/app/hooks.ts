"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { fetchUsers, fetchEmployees, fetchClientsList, createEmployee, createClient, setEmployeePermission, fetchServices, fetchProjects, fetchInvoices, fetchNotifications, fetchBlogPosts, fetchPortfolioList } from "./queries";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: fetchUsers, staleTime: 1000 * 60 * 5 });
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
  return useQuery({ queryKey: ["services"], queryFn: fetchServices, staleTime: 1000 * 60 * 5 });
}

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: fetchProjects, staleTime: 1000 * 60 * 5 });
}

export function useInvoices() {
  return useQuery({ queryKey: ["invoices"], queryFn: fetchInvoices, staleTime: 1000 * 60 * 5 });
}

export function useNotifications() {
  return useQuery({ queryKey: ["notifications"], queryFn: fetchNotifications, staleTime: 1000 * 60 * 5 });
}

export function useBlogPosts() {
  return useQuery({ queryKey: ["blogPosts"], queryFn: fetchBlogPosts, staleTime: 1000 * 60 * 5 });
}

export function usePortfolioList() {
  return useQuery({ queryKey: ["portfolioList"], queryFn: fetchPortfolioList, staleTime: 1000 * 60 * 5 });
}
