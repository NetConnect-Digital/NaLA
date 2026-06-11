import { NextRequest, NextResponse } from "next/server";
import { storeProxy, persistCartToken } from "@/lib/store-server";

interface CheckoutResponse {
  order_id?: number;
  status?: string;
  order_key?: string;
  payment_result?: {
    payment_status: string;
    redirect_url?: string;
    payment_details?: { key: string; value: string }[];
  };
  message?: string;
}

/**
 * POST /api/checkout — proxy the Store API checkout.
 *
 * Body (from the client): { billing_address, shipping_address?, payment_method,
 * payment_data, customer_note? }. The Cart-Token and (if logged in) JWT are
 * attached server-side by storeProxy.
 *
 * NOTE: payment_data keys are gateway-specific. The WooCommerce Stripe Gateway's
 * Store API integration expects the tokenized payment method; verify the exact
 * keys against your installed gateway version with Stripe TEST keys.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const { status, data, cartToken } = await storeProxy<CheckoutResponse>("/checkout", {
    method: "POST",
    body,
  });
  await persistCartToken(cartToken);
  return NextResponse.json(data, { status });
}
