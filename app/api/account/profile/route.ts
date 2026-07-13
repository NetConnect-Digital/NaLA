import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateWcCustomer } from "@/lib/wc-admin";

/**
 * PUT /api/account/profile — update the current user's WooCommerce profile.
 *
 * Uses the wc/v3 customers API (not wp/v2/users/me, which the Sicuri firewall
 * blocks). Requires WC_CONSUMER_KEY / WC_CONSUMER_SECRET to be configured.
 */
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const allowed: Record<string, string> = {};
  for (const k of ["first_name", "last_name", "email"]) {
    if (typeof body[k] === "string") allowed[k] = body[k];
  }

  const result = await updateWcCustomer(user.id, allowed);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
