import { NextRequest, NextResponse } from "next/server";
import { WP_URL, STORE_API } from "@/lib/config";
import { persistCartSession } from "@/lib/store-server";
import {
  TICKET_FORM_SLUGS,
  validateTicketAnswers,
  type TicketAnswers,
} from "@/lib/ticket-fields";
import type { Cart } from "@/lib/types";

interface RegisterBody {
  productId: number;
  slug: string;
  tickets: TicketAnswers[];
}

/**
 * POST /api/tickets/register  { productId, slug, tickets }
 *
 * The conference ticket products carry per-ticket guest-info fields added by
 * the WooCommerce Box Office plugin, which only understands the classic
 * multipart <form action="{product permalink}"> POST — it has no Store API
 * support. So this route bridges the two: it submits that classic form
 * server-side, captures the WooCommerce session cookie WordPress issues in
 * response, and immediately exchanges it for a matching Store API
 * Cart-Token/Nonce pair, which we then persist as our normal cart session
 * cookies. Any items already in the caller's current headless cart session
 * are left behind (a different WC session) once this swap happens — fine for
 * a dedicated "buy this ticket" flow, but worth knowing if this route is ever
 * reused mid-checkout with an existing multi-item cart.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as RegisterBody;
  const { productId, slug, tickets } = body;

  if (!TICKET_FORM_SLUGS.has(slug)) {
    return NextResponse.json({ message: "Unsupported product" }, { status: 400 });
  }
  if (!Array.isArray(tickets) || tickets.length < 1) {
    return NextResponse.json({ message: "At least one ticket is required" }, { status: 400 });
  }

  for (let i = 0; i < tickets.length; i++) {
    const missing = validateTicketAnswers(tickets[i]);
    if (missing.length > 0) {
      return NextResponse.json(
        { message: `Ticket #${i + 1} is missing: ${missing.join(", ")}` },
        { status: 400 },
      );
    }
  }

  const form = new FormData();
  form.set("quantity", String(tickets.length));
  form.set("add-to-cart", String(productId));
  tickets.forEach((answers, i) => {
    for (const [key, value] of Object.entries(answers)) {
      form.set(`ticket_fields[${i}][${key}]`, value);
    }
  });

  const classicRes = await fetch(`${WP_URL}/product/${slug}/`, {
    method: "POST",
    body: form,
    redirect: "manual",
  });

  const setCookies =
    typeof classicRes.headers.getSetCookie === "function"
      ? classicRes.headers.getSetCookie()
      : [];
  if (setCookies.length === 0) {
    return NextResponse.json(
      { message: "Registration failed: no session returned by the store" },
      { status: 502 },
    );
  }
  const cookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");

  const cartRes = await fetch(`${STORE_API}/cart`, {
    headers: { Accept: "application/json", Cookie: cookieHeader },
    cache: "no-store",
  });
  const cart = (await cartRes.json()) as Cart;
  const cartToken = cartRes.headers.get("Cart-Token") ?? undefined;
  const nonce = cartRes.headers.get("Nonce") ?? undefined;

  const added = cart.items?.find((item) => item.id === productId);
  if (!added || added.quantity < tickets.length) {
    return NextResponse.json(
      { message: "Registration failed: the store didn't confirm the ticket(s) were added" },
      { status: 502 },
    );
  }

  await persistCartSession(cartToken, nonce);
  return NextResponse.json(cart, { status: 200 });
}
