"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WpUser } from "./auth";

const USER_KEY = ["auth", "me"] as const;

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message ?? "Request failed");
  return data;
}

export function useUser() {
  return useQuery({
    queryKey: USER_KEY,
    queryFn: async (): Promise<WpUser | null> => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const data = await res.json();
      return data.user ?? null;
    },
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { username: string; password: string }) =>
      postJson("/api/auth/login", vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEY }),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: Record<string, string>) => postJson("/api/auth/register", vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEY }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => postJson("/api/auth/logout", {}),
    onSuccess: () => qc.setQueryData(USER_KEY, null),
  });
}

export function useRecoverPassword() {
  return useMutation({
    mutationFn: (vars: { email: string }) => postJson("/api/auth/recover", vars),
  });
}
