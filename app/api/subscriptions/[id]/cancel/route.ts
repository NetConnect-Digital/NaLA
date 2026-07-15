import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWcSubscription, cancelSubscription } from "@/lib/wc-admin";

/**
 * POST /api/subscriptions/[id]/cancel — cancel the signed-in customer's own
 * subscription. Ownership is enforced from the JWT before the wc/v3 mutation.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const subId = Number(id);
  const sub = await getWcSubscription(subId).catch(() => null);

  if (!sub || (sub.customer_id != null && sub.customer_id !== user.id)) {
    return NextResponse.json({ message: "Subscription not found." }, { status: 404 });
  }
  if (sub.status === "cancelled") {
    return NextResponse.json({ message: "Already cancelled." }, { status: 409 });
  }

  const result = await cancelSubscription(subId);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 502 });
  }
  return NextResponse.json({ status: "cancelled" });
}
