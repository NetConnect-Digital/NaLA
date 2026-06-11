/**
 * Central configuration. Reads from environment with sensible defaults so the
 * app runs against the live NaLA backend out of the box.
 */
export const WP_URL = (
  process.env.NEXT_PUBLIC_WP_URL ?? "https://shop.nalalifeline.org"
).replace(/\/$/, "");

export const WP_API = `${WP_URL}/wp-json`;
export const STORE_API = `${WP_API}/wc/store/v1`;
export const WC_API = `${WP_API}/wc/v3`;

/** Server-only WooCommerce REST keys (do not expose to the client). */
export const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY ?? "";
export const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET ?? "";

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

/** httpOnly cookie names */
export const AUTH_COOKIE = "nala_token";
export const CART_TOKEN_COOKIE = "nala_cart_token";
