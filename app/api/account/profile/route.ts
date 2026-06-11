import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import { WP_API } from "@/lib/config";

/** PUT /api/account/profile — update the current user's WP profile fields. */
export async function PUT(req: NextRequest) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const allowed: Record<string, string> = {};
  for (const k of ["first_name", "last_name", "email", "name"]) {
    if (typeof body[k] === "string") allowed[k] = body[k];
  }

  const res = await fetch(`${WP_API}/wp/v2/users/me`, {
    method: "POST", // WP accepts POST for partial update
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(allowed),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { message: (data as { message?: string })?.message ?? "Update failed" },
      { status: res.status },
    );
  }
  return NextResponse.json({ ok: true, user: data });
}
