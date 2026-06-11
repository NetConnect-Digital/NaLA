import { NextRequest, NextResponse } from "next/server";
import { JWT_NS, setToken, extractJwt } from "@/lib/auth";

/** POST /api/auth/login { username, password } → sets httpOnly JWT cookie. */
export async function POST(req: NextRequest) {
  const { username, password } = (await req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };
  if (!username || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const res = await fetch(`${JWT_NS}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: username, username, password }),
  });
  const data = await res.json().catch(() => ({}));
  const token = extractJwt(data);

  if (!res.ok || !token) {
    return NextResponse.json(
      { message: (data as { message?: string })?.message ?? "Invalid credentials." },
      { status: 401 },
    );
  }

  await setToken(token);
  return NextResponse.json({ ok: true });
}
