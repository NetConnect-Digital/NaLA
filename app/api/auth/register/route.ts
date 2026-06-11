import { NextRequest, NextResponse } from "next/server";
import { JWT_NS, setToken, extractJwt } from "@/lib/auth";

/**
 * POST /api/auth/register { email, password, first_name?, last_name? }
 * Registers via the JWT plugin's user endpoint, then logs the user in.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const regRes = await fetch(`${JWT_NS}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const regData = await regRes.json().catch(() => ({}));

  if (!regRes.ok) {
    return NextResponse.json(
      { message: (regData as { message?: string })?.message ?? "Registration failed." },
      { status: regRes.status },
    );
  }

  // Auto-login after successful registration.
  const authRes = await fetch(`${JWT_NS}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, username: email, password }),
  });
  const authData = await authRes.json().catch(() => ({}));
  const token = extractJwt(authData);
  if (token) await setToken(token);

  return NextResponse.json({ ok: true, autoLoggedIn: Boolean(token) });
}
