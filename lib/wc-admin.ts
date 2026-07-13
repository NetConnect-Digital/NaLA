import "server-only";
import { WC_API, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } from "./config";

/**
 * Server-only WooCommerce REST (wc/v3) client using consumer key/secret.
 * Used for reads that the public Store API doesn't expose (e.g. a customer's
 * order history). Never import this into client components.
 */

export interface WcOrderLineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
}

export interface WcOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  currency_symbol?: string;
  order_key: string;
  payment_url: string;
  needs_payment: boolean;
  line_items: WcOrderLineItem[];
}

function authHeader(): string | null {
  if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) return null;
  const token = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

export async function getCustomerOrders(customerId: number): Promise<WcOrder[]> {
  const auth = authHeader();
  if (!auth) return []; // keys not configured yet

  const url = new URL(`${WC_API}/orders`);
  url.searchParams.set("customer", String(customerId));
  url.searchParams.set("per_page", "20");
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");

  const res = await fetch(url.toString(), {
    headers: { Authorization: auth, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return (await res.json()) as WcOrder[];
}

export interface WcCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
}

/** Fetch a WooCommerce customer (profile) by id. Returns null if keys/customer missing. */
export async function getWcCustomer(id: number): Promise<WcCustomer | null> {
  const auth = authHeader();
  if (!auth) return null;
  const res = await fetch(`${WC_API}/customers/${id}`, {
    headers: { Authorization: auth, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as WcCustomer;
}

/** Update a WooCommerce customer (profile). */
export async function updateWcCustomer(
  id: number,
  data: Record<string, string>,
): Promise<{ ok: boolean; message?: string }> {
  const auth = authHeader();
  if (!auth) {
    return { ok: false, message: "WooCommerce API keys are not configured." };
  }
  const res = await fetch(`${WC_API}/customers/${id}`, {
    method: "PUT",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  const d = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) return { ok: false, message: d.message ?? "Update failed." };
  return { ok: true };
}
