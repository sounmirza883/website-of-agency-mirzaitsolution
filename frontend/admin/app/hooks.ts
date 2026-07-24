"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUsers, fetchEmployees, fetchClientsList, fetchServices, fetchProjects, fetchInvoices, fetchNotifications, fetchBlogPosts, fetchPortfolioList } from "./queries";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: fetchUsers, staleTime: 1000 * 60 * 5 });
}

export function useEmployees() {
  return useQuery({ queryKey: ["employees"], queryFn: fetchEmployees, staleTime: 1000 * 60 * 5 });
}

export function useClientsList() {
  return useQuery({ queryKey: ["clientsList"], queryFn: fetchClientsList, staleTime: 1000 * 60 * 5 });
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
