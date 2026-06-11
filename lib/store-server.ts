import "server-only";
import { cookies } from "next/headers";
import { STORE_API, CART_TOKEN_COOKIE, AUTH_COOKIE } from "./config";

/**
 * Server-side proxy to the WooCommerce Store API cart/checkout endpoints.
 *
 * The Store API issues a `Cart-Token` header that identifies the guest cart
 * session. We persist it in an httpOnly cookie and replay it on every request
 * so the cart survives navigation/reloads. When a user is logged in we also
 * forward the JWT so the cart is associated with their account.
 */

export interface StoreProxyResult<T> {
  status: number;
  data: T;
  cartToken?: string;
}

export async function storeProxy<T>(
  path: string,
  init: RequestInit & { method?: string } = {},
): Promise<StoreProxyResult<T>> {
  const cookieStore = await cookies();
  const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value;
  const jwt = cookieStore.get(AUTH_COOKIE)?.value;

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (cartToken) headers.set("Cart-Token", cartToken);
  if (jwt) headers.set("Authorization", `Bearer ${jwt}`);

  const res = await fetch(`${STORE_API}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const newToken = res.headers.get("Cart-Token") ?? undefined;
  let data: T;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : ({} as T);
  } catch {
    data = {} as T;
  }

  return { status: res.status, data, cartToken: newToken };
}

/** Persist a refreshed Cart-Token onto the response cookie jar. */
export async function persistCartToken(token?: string) {
  if (!token) return;
  const cookieStore = await cookies();
  cookieStore.set(CART_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
