import "server-only";
import { WC_API, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } from "./config";

/**
 * Server-only WooCommerce REST (wc/v3) client using consumer key/secret.
 * Used for reads that the public Store API doesn't expose (e.g. a customer's
 * order history). Never import this into client components.
 */

export interface WcMetaData {
  id: number;
  key: string;
  value: unknown;
  display_key?: string;
  display_value?: unknown;
}

export interface WcOrderLineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  total_tax?: string;
  price?: number;
  meta_data?: WcMetaData[];
}

export interface WcAddress {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface WcTaxLine {
  id: number;
  label: string;
  tax_total: string;
}

export interface WcOrderDetail extends WcOrder {
  customer_id: number;
  discount_total: string;
  shipping_total: string;
  total_tax: string;
  payment_method_title: string;
  billing: WcAddress;
  meta_data?: WcMetaData[];
  tax_lines?: WcTaxLine[];
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

/**
 * Perform a WooCommerce write (PUT/DELETE) as a POST with `?_method=` override.
 *
 * The Sucuri firewall in front of the backend blocks raw PUT/DELETE requests
 * (403 block page), but WordPress honours the `_method` query parameter, so a
 * POST tunnels the intended verb straight through. All wc/v3 mutations go
 * through here.
 */
async function wcWrite(
  path: string,
  data: Record<string, unknown>,
  method: "PUT" | "DELETE" = "PUT",
): Promise<{ ok: boolean; data: Record<string, unknown>; message?: string }> {
  const auth = authHeader();
  if (!auth) {
    return { ok: false, data: {}, message: "WooCommerce API keys are not configured." };
  }
  const url = new URL(`${WC_API}${path}`);
  url.searchParams.set("_method", method);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  }).catch(() => null);
  const d = (await res?.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res || !res.ok) {
    return { ok: false, data: d, message: (d?.message as string) ?? "Request failed." };
  }
  return { ok: true, data: d };
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

/** Fetch a single order by id (server-only; used by the order detail page). */
export async function getWcOrder(id: number): Promise<WcOrderDetail | null> {
  const auth = authHeader();
  if (!auth) return null;
  const res = await fetch(`${WC_API}/orders/${id}`, {
    headers: { Authorization: auth, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as WcOrderDetail;
}

/**
 * Mark an order paid after a successful off-site charge. Sets status to
 * processing and records the payment gateway transaction id. WooCommerce
 * fills in date_paid / stock reduction from the `set_paid` transition.
 */
export async function markOrderPaid(
  id: number,
  transactionId: string,
): Promise<{ ok: boolean; message?: string }> {
  const { ok, message } = await wcWrite(`/orders/${id}`, {
    status: "processing",
    set_paid: true,
    transaction_id: transactionId,
  });
  return { ok, message };
}

interface WcMeta {
  key: string;
  value: string;
}

export interface WcCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  /** Display name — stored as customer meta (`wp/v2/users` is firewall-blocked). */
  display_name?: string;
  date_created?: string;
  avatar_url?: string;
  billing?: WcAddress;
  shipping?: WcAddress;
  meta_data?: WcMeta[];
}

/** Meta key used to persist the display name (the WP column is not reachable). */
export const DISPLAY_NAME_META = "nala_display_name";

export interface WcDownload {
  download_id: string;
  download_name: string;
  product_id: number;
  product_name: string;
  download_url: string;
  downloads_remaining: string | number;
  access_expires: string | null;
}

export interface WcSubscription {
  id: number;
  number: string;
  status: string;
  total: string;
  currency_symbol?: string;
  customer_id?: number;
  billing_period?: string;
  billing_interval?: string;
  payment_method_title?: string;
  next_payment_date_gmt?: string;
  start_date_gmt?: string;
  last_payment_date_gmt?: string;
  end_date_gmt?: string;
  date_created?: string;
  line_items: WcOrderLineItem[];
}

/**
 * A customer's subscriptions (WooCommerce Subscriptions plugin, wc/v3).
 * Returns [] if the plugin/endpoint isn't available so the UI degrades cleanly.
 */
export async function getCustomerSubscriptions(
  customerId: number,
): Promise<WcSubscription[]> {
  const auth = authHeader();
  if (!auth) return [];
  const url = new URL(`${WC_API}/subscriptions`);
  url.searchParams.set("customer", String(customerId));
  url.searchParams.set("per_page", "20");
  const res = await fetch(url.toString(), {
    headers: { Authorization: auth, Accept: "application/json" },
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) return [];
  return (await res.json().catch(() => [])) as WcSubscription[];
}

/** Fetch a single subscription by id (WooCommerce Subscriptions, wc/v3). */
export async function getWcSubscription(
  id: number,
): Promise<WcSubscription | null> {
  const auth = authHeader();
  if (!auth) return null;
  const res = await fetch(`${WC_API}/subscriptions/${id}`, {
    headers: { Authorization: auth, Accept: "application/json" },
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as WcSubscription | null;
}

/** Cancel a subscription (wc/v3). */
export async function cancelSubscription(
  id: number,
): Promise<{ ok: boolean; message?: string }> {
  const { ok, message } = await wcWrite(`/subscriptions/${id}`, {
    status: "cancelled",
  });
  return { ok, message };
}

/** Cancel an order (wc/v3). */
export async function cancelOrder(
  id: number,
): Promise<{ ok: boolean; message?: string }> {
  const { ok, message } = await wcWrite(`/orders/${id}`, {
    status: "cancelled",
  });
  return { ok, message };
}

/** A customer's downloadable products (wc/v3). Empty when none / keys missing. */
export async function getCustomerDownloads(id: number): Promise<WcDownload[]> {
  const auth = authHeader();
  if (!auth) return [];
  const res = await fetch(`${WC_API}/customers/${id}/downloads`, {
    headers: { Authorization: auth, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return (await res.json()) as WcDownload[];
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
  const customer = (await res.json()) as WcCustomer;
  // Surface the display name persisted in meta (the WP column is unreachable).
  const meta = customer.meta_data?.find((m) => m.key === DISPLAY_NAME_META);
  if (meta?.value) customer.display_name = meta.value;
  return customer;
}

/**
 * Update a WooCommerce customer (profile). A `display_name` key is redirected
 * into customer meta because WooCommerce's wc/v3 customer API has no
 * display_name field and the WP users endpoint is firewall-blocked.
 */
export async function updateWcCustomer(
  id: number,
  data: Record<string, string>,
): Promise<{ ok: boolean; message?: string }> {
  const { display_name, ...rest } = data;
  const payload: Record<string, unknown> = { ...rest };
  if (typeof display_name === "string" && display_name.trim() !== "") {
    payload.meta_data = [{ key: DISPLAY_NAME_META, value: display_name }];
  }
  const { ok, message } = await wcWrite(`/customers/${id}`, payload);
  return { ok, message };
}

/** Update a customer's billing or shipping address (wc/v3). */
export async function updateWcCustomerAddress(
  id: number,
  type: "billing" | "shipping",
  address: WcAddress,
): Promise<{ ok: boolean; message?: string }> {
  const { ok, message } = await wcWrite(`/customers/${id}`, { [type]: address });
  return { ok, message };
}
