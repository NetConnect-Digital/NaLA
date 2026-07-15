import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWcOrder, markOrderPaid } from "@/lib/wc-admin";
import { getStripe, toStripeAmount } from "@/lib/stripe-server";

/**
 * POST /api/orders/[id]/pay — charge an existing WooCommerce order in-app.
 *
 * Two phases share this endpoint:
 *  1. { payment_method_id }  → create + confirm a PaymentIntent.
 *  2. { payment_intent_id }  → finalise after the client clears 3-D Secure.
 *
 * On a succeeded intent the order is marked paid via wc/v3. Ownership is
 * enforced from the JWT (order.customer_id must match the signed-in user).
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { message: "Payments are not configured. Set STRIPE_SECRET_KEY." },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  const orderId = Number(id);
  const order = await getWcOrder(orderId).catch(() => null);

  if (!order || order.customer_id !== user.id) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }
  if (!order.needs_payment) {
    return NextResponse.json(
      { message: "This order has already been paid." },
      { status: 409 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    payment_method_id?: string;
    payment_intent_id?: string;
  };

  try {
    let intent;

    if (body.payment_intent_id) {
      // Phase 2: retrieve the intent the client just confirmed for 3-D Secure.
      intent = await stripe.paymentIntents.retrieve(body.payment_intent_id);
      if (intent.metadata?.order_id !== String(orderId)) {
        return NextResponse.json({ message: "Payment mismatch." }, { status: 400 });
      }
    } else if (body.payment_method_id) {
      // Phase 1: create + confirm a card PaymentIntent for the order total.
      intent = await stripe.paymentIntents.create({
        amount: toStripeAmount(order.total, order.currency),
        currency: order.currency.toLowerCase(),
        payment_method: body.payment_method_id,
        confirm: true,
        // Card only — no redirect-based methods for this in-app flow.
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        metadata: {
          order_id: String(orderId),
          order_key: order.order_key,
          customer_id: String(user.id),
        },
      });
    } else {
      return NextResponse.json({ message: "Missing payment details." }, { status: 400 });
    }

    if (intent.status === "requires_action") {
      return NextResponse.json({
        status: "requires_action",
        client_secret: intent.client_secret,
        payment_intent_id: intent.id,
      });
    }

    if (intent.status === "succeeded") {
      const paid = await markOrderPaid(orderId, intent.id);
      if (!paid.ok) {
        // Charged but the WC update failed — surface it so it can be reconciled.
        return NextResponse.json(
          { status: "paid_unrecorded", message: paid.message },
          { status: 502 },
        );
      }
      return NextResponse.json({ status: "succeeded" });
    }

    return NextResponse.json(
      { message: `Payment ${intent.status}.` },
      { status: 402 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment failed.";
    return NextResponse.json({ message }, { status: 402 });
  }
}
