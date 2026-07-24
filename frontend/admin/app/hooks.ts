"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { fetchUsers, fetchEmployees, fetchClientsList, createEmployee, createClient, setEmployeePermission, fetchServices, fetchProjects, fetchInvoices, fetchNotifications, fetchBlogPosts, fetchPortfolioList, fetchContactSubmissions, createService, createProject, updateProjectStatus, createInvoice, createNotification, createBlogPost, setBlogPostStatus, createPortfolioItem, setUserStatus } from "./queries";

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

export function useBlogPosts() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["blogPosts"], queryFn: () => fetchBlogPosts(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function usePortfolioList() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["portfolioList"], queryFn: () => fetchPortfolioList(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
}

export function useContactSubmissions() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["contactSubmissions"], queryFn: () => fetchContactSubmissions(token!), enabled: !!token, staleTime: 1000 * 60 * 5 });
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

export function useCreateNotification() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createNotification>[1]) => createNotification(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useCreateBlogPost() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createBlogPost>[1]) => createBlogPost(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blogPosts"] }),
  });
}

export function useSetBlogPostStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => setBlogPostStatus(token!, id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blogPosts"] }),
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
