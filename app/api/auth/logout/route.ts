import { NextResponse } from "next/server";
import { clearToken } from "@/lib/auth";

/** POST /api/auth/logout — clears the auth cookie. */
export async function POST() {
  await clearToken();
  return NextResponse.json({ ok: true });
}
