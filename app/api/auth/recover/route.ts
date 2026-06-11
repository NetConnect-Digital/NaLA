import { NextRequest, NextResponse } from "next/server";
import { JWT_NS } from "@/lib/auth";

/** POST /api/auth/recover { email } — triggers a password reset email. */
export async function POST(req: NextRequest) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const res = await fetch(`${JWT_NS}/user/reset_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));

  // Always respond success-ish to avoid leaking which emails exist.
  return NextResponse.json({
    ok: res.ok,
    message:
      (data as { message?: string })?.message ??
      "If that email exists, a reset link has been sent.",
  });
}
