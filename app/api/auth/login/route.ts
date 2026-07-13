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

  // Simple JWT Login resolves the account by whichever param is present. Sending
  // `email` with a username value makes it do an email lookup that always fails,
  // so route the value to the right param based on whether it's an email.
  const isEmail = username.includes("@");
  const credentials = isEmail
    ? { email: username, password }
    : { username, login: username, password };

  const res = await fetch(`${JWT_NS}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
    data?: { message?: string };
  };
  const token = extractJwt(data);

  if (!res.ok || !token) {
    // Simple JWT Login nests its error under data.data.message.
    const message =
      data.data?.message ?? data.message ?? "Invalid email or password.";
    return NextResponse.json({ message }, { status: 401 });
  }

  await setToken(token);
  return NextResponse.json({ ok: true });
}
