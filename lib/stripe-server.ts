import "server-only";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "./config";

/**
 * Server-only Stripe client. Returns null when the secret key isn't configured
 * so callers can fail gracefully (payments simply stay disabled until the key
 * is set). Never import this into a client component.
 */
let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!STRIPE_SECRET_KEY) return null;
  if (!cached) cached = new Stripe(STRIPE_SECRET_KEY);
  return cached;
}

/** Zero-decimal currencies charge the raw amount (no ×100). */
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
  "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);

/** Convert a decimal amount string (e.g. "5423.01") + currency to Stripe minor units. */
export function toStripeAmount(amount: string, currency: string): number {
  const value = Number(amount);
  if (!Number.isFinite(value)) return 0;
  return ZERO_DECIMAL.has(currency.toLowerCase())
    ? Math.round(value)
    : Math.round(value * 100);
}
