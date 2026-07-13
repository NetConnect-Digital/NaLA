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

/** Decode a JWT payload (no verification — trust comes from the httpOnly cookie). */
function decodeJwt(
  token: string,
): { id?: string | number; email?: string; exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Resolve the current user from the JWT stored in the httpOnly cookie.
 *
 * We read identity straight from the token payload ({ id, email }) rather than
 * calling wp/v2/users/me — the Sucuri firewall blocks the WordPress users
 * endpoint (user-enumeration protection). Richer profile data + orders come
 * from the WooCommerce wc/v3 customer API, which is not firewall-blocked.
 */
export async function getCurrentUser(): Promise<WpUser | null> {
  const token = await getToken();
  if (!token) return null;

  const payload = decodeJwt(token);
  if (!payload?.id) return null;

  // Expired token → treated as logged out.
  if (payload.exp && Date.now() >= payload.exp * 1000) return null;

  const id = Number(payload.id);
  const email = typeof payload.email === "string" ? payload.email : undefined;
  return {
    id,
    email,
    name: email ? email.split("@")[0] : `Member #${id}`,
  };
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
