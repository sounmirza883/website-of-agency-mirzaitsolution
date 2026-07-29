"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchServices, fetchPortfolio, fetchServiceDetails, submitContact, fetchBlogPosts, fetchBlogPost } from "./queries";

export function useServices() {
  return useQuery({ queryKey: ["website-services"], queryFn: fetchServices, staleTime: 1000 * 60 * 5 });
}

export function usePortfolio() {
  return useQuery({ queryKey: ["website-portfolio"], queryFn: fetchPortfolio, staleTime: 1000 * 60 * 5 });
}

export function useServiceDetails() {
  return useQuery({ queryKey: ["website-service-details"], queryFn: fetchServiceDetails, staleTime: 1000 * 60 * 5 });
}

export function useSubmitContact() {
  return useMutation({ mutationFn: submitContact });
}

export function useBlogPosts() {
  return useQuery({ queryKey: ["website-blog"], queryFn: fetchBlogPosts, staleTime: 1000 * 60 * 5 });
}

export function useBlogPost(slug: string) {
  return useQuery({ queryKey: ["website-blog", slug], queryFn: () => fetchBlogPost(slug), staleTime: 1000 * 60 * 5, enabled: !!slug });
}
