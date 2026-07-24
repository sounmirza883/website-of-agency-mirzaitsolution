"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchServices, fetchPortfolio, fetchServiceDetails } from "./queries";

export function useServices() {
  return useQuery({ queryKey: ["website-services"], queryFn: fetchServices, staleTime: 1000 * 60 * 5 });
}

export function usePortfolio() {
  return useQuery({ queryKey: ["website-portfolio"], queryFn: fetchPortfolio, staleTime: 1000 * 60 * 5 });
}

export function useServiceDetails() {
  return useQuery({ queryKey: ["website-service-details"], queryFn: fetchServiceDetails, staleTime: 1000 * 60 * 5 });
}
