import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, verifyPassword } from "@/lib/auth";
import { updateWcCustomer } from "@/lib/wc-admin";

/**
 * PUT /api/account/profile — update the current user's WooCommerce account.
 *
 * Handles name/email/display name plus an optional password change. Password
 * changes require the correct current password (verified via the JWT auth
 * endpoint) and a matching confirmation. Uses the wc/v3 customers API — the
 * Sucuri firewall blocks wp/v2/users/me.
 */
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, string>;

  const update: Record<string, string> = {};
  for (const k of ["first_name", "last_name", "email", "display_name"]) {
    if (typeof body[k] === "string" && body[k].trim() !== "") update[k] = body[k];
  }

  // Optional password change.
  const current = body.current_password ?? "";
  const next = body.new_password ?? "";
  const confirm = body.confirm_password ?? "";

  if (next || confirm || current) {
    if (!next) {
      return NextResponse.json({ message: "Enter a new password." }, { status: 400 });
    }
    if (next !== confirm) {
      return NextResponse.json({ message: "New passwords do not match." }, { status: 400 });
    }
    if (!current) {
      return NextResponse.json(
        { message: "Enter your current password to set a new one." },
        { status: 400 },
      );
    }
    const email = user.email ?? body.email;
    const valid = email ? await verifyPassword(email, current) : false;
    if (!valid) {
      return NextResponse.json(
        { message: "Your current password is incorrect." },
        { status: 400 },
      );
    }
    update.password = next;
  }

  const result = await updateWcCustomer(user.id, update);
  if (!result.ok) {
    // WooCommerce refuses password changes via this endpoint for elevated
    // roles (staff/admin accounts) as a deliberate security guard.
    const message = /password cannot be updated via this endpoint/i.test(
      result.message ?? "",
    )
      ? "This account has staff/admin privileges, so its password can only be changed from the WordPress dashboard directly. Contact your site administrator for help."
      : result.message;
    return NextResponse.json({ message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
