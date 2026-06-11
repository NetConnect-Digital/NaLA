"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Cart } from "./types";

const CART_KEY = ["cart"] as const;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { message?: string })?.message ?? "Request failed";
    throw new Error(message);
  }
  return data as T;
}

export function useCart() {
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => fetchJson<Cart>("/api/cart"),
    staleTime: 30_000,
  });
}

function useCartMutation<TVars>(
  path: (vars: TVars) => string,
  body: (vars: TVars) => unknown,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: TVars) =>
      fetchJson<Cart>(path(vars), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body(vars)),
      }),
    onSuccess: (cart) => qc.setQueryData(CART_KEY, cart),
  });
}

export function useAddToCart() {
  return useCartMutation<{ id: number; quantity?: number }>(
    () => "/api/cart/add-item",
    (v) => ({ id: v.id, quantity: v.quantity ?? 1 }),
  );
}

export function useUpdateCartItem() {
  return useCartMutation<{ key: string; quantity: number }>(
    () => "/api/cart/update-item",
    (v) => ({ key: v.key, quantity: v.quantity }),
  );
}

export function useRemoveCartItem() {
  return useCartMutation<{ key: string }>(
    () => "/api/cart/remove-item",
    (v) => ({ key: v.key }),
  );
}
