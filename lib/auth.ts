import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE, WP_API } from "./config";

/**
 * Headless auth helpers.
 *
 * BACKEND REQUIREMENT: install + configure a JWT auth plugin. These helpers
 * target the "Simple JWT Login" plugin REST shape (namespace simple-jwt-login/v1)
 * which provides login, registration, and password reset over REST. Enable:
 *   - Authentication endpoint (returns a JWT)
 *   - "Allow Authentication" so a Bearer token authorizes wp/v2 requests
 *   - Register + Reset Password endpoints
 * Adjust JWT_NS / endpoints if you choose a different plugin.
 */

export const JWT_NS = `${WP_API}/simple-jwt-login/v1`;

export interface WpUser {
  id: number;
  name: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  roles?: string[];
  avatar_urls?: Record<string, string>;
}

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value;
}

export async function setToken(token: string) {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearToken() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

/** Fetch the current WP user using the stored Bearer token. Returns null if unauthenticated. */
export async function getCurrentUser(): Promise<WpUser | null> {
  const token = await getToken();
  if (!token) return null;
  const res = await fetch(`${WP_API}/wp/v2/users/me?context=edit`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as WpUser;
}

/** Extract a JWT from the various shapes JWT plugins return. */
export function extractJwt(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  if (typeof d.jwt === "string") return d.jwt;
  if (typeof d.token === "string") return d.token;
  if (d.data && typeof d.data === "object") {
    const inner = d.data as Record<string, unknown>;
    if (typeof inner.jwt === "string") return inner.jwt;
    if (typeof inner.token === "string") return inner.token;
  }
  return undefined;
}
