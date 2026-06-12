import "server-only";
import { cookies } from "next/headers";
import {
  STORE_API,
  CART_TOKEN_COOKIE,
  CART_NONCE_COOKIE,
  AUTH_COOKIE,
} from "./config";

/**
 * Server-side proxy to the WooCommerce Store API cart/checkout endpoints.
 *
 * The Store API issues two session headers we must replay:
 *  - `Cart-Token` — identifies the guest cart session.
 *  - `Nonce`      — required on cart/checkout *writes*; obtained from any
 *                   Store API response (we prime one via GET /cart if missing).
 *
 * Both are persisted in httpOnly cookies and replayed on every request. When a
 * user is logged in we also forward the JWT so the cart is tied to their account.
 */

export interface StoreProxyResult<T> {
  status: number;
  data: T;
  cartToken?: string;
  nonce?: string;
}

interface Session {
  cartToken?: string;
  nonce?: string;
  jwt?: string;
}

async function rawFetch(
  path: string,
  init: RequestInit & { method?: string },
  session: Session,
) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (session.cartToken) headers.set("Cart-Token", session.cartToken);
  if (session.nonce) headers.set("Nonce", session.nonce);
  if (session.jwt) headers.set("Authorization", `Bearer ${session.jwt}`);

  return fetch(`${STORE_API}${path}`, { ...init, headers, cache: "no-store" });
}

export async function storeProxy<T>(
  path: string,
  init: RequestInit & { method?: string } = {},
): Promise<StoreProxyResult<T>> {
  const cookieStore = await cookies();
  let cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value;
  let nonce = cookieStore.get(CART_NONCE_COOKIE)?.value;
  const jwt = cookieStore.get(AUTH_COOKIE)?.value;
  const method = (init.method ?? "GET").toUpperCase();

  const isWrite = method !== "GET";

  // Cart/checkout writes require a Nonce. If we don't have one yet, prime it
  // (and a Cart-Token) with a GET /cart first.
  if (isWrite && !nonce) {
    const prime = await rawFetch("/cart", { method: "GET" }, { cartToken, jwt });
    nonce = prime.headers.get("Nonce") ?? nonce;
    cartToken = prime.headers.get("Cart-Token") ?? cartToken;
  }

  let res = await rawFetch(path, init, { cartToken, jwt, nonce });

  // A cached nonce can be stale/expired (401/403). Re-prime a fresh one and retry once.
  if (isWrite && (res.status === 401 || res.status === 403)) {
    const prime = await rawFetch("/cart", { method: "GET" }, { cartToken, jwt });
    nonce = prime.headers.get("Nonce") ?? nonce;
    cartToken = prime.headers.get("Cart-Token") ?? cartToken;
    res = await rawFetch(path, init, { cartToken, jwt, nonce });
  }

  const newToken = res.headers.get("Cart-Token") ?? cartToken;
  const newNonce = res.headers.get("Nonce") ?? nonce;

  let data: T;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : ({} as T);
  } catch {
    data = {} as T;
  }

  // Persist refreshed session headers so subsequent requests carry them.
  persistSessionCookies(cookieStore, newToken, newNonce);

  return { status: res.status, data, cartToken: newToken, nonce: newNonce };
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function persistSessionCookies(
  cookieStore: CookieStore,
  token?: string,
  nonce?: string,
) {
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
  if (token) cookieStore.set(CART_TOKEN_COOKIE, token, opts);
  if (nonce) cookieStore.set(CART_NONCE_COOKIE, nonce, opts);
}

/** Persist a refreshed Cart-Token onto the response cookie jar. */
export async function persistCartToken(token?: string) {
  if (!token) return;
  const cookieStore = await cookies();
  persistSessionCookies(cookieStore, token);
}
