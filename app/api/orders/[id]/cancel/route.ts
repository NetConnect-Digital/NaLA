import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWcOrder, cancelOrder } from "@/lib/wc-admin";

/**
 * POST /api/orders/[id]/cancel — cancel the signed-in customer's own failed
 * order. Ownership is enforced from the JWT before the wc/v3 mutation.
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
  const orderId = Number(id);
  const order = await getWcOrder(orderId).catch(() => null);

  if (!order || order.customer_id !== user.id) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }
  if (order.status !== "failed") {
    return NextResponse.json(
      { message: "Only failed orders can be cancelled." },
      { status: 409 },
    );
  }

  const result = await cancelOrder(orderId);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 502 });
  }
  return NextResponse.json({ status: "cancelled" });
}
