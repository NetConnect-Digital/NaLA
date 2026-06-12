import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a numeric/string amount + WooCommerce currency info into a price string. */
export function formatPrice(
  amount: number | string,
  opts?: { currencyCode?: string; minorUnit?: number; prefix?: string; suffix?: string },
) {
  const minorUnit = opts?.minorUnit ?? 2;
  const value =
    typeof amount === "string" ? Number(amount) : amount;
  const normalized = minorUnit > 0 ? value / 10 ** minorUnit : value;
  const formatted = normalized.toLocaleString("en-US", {
    minimumFractionDigits: normalized % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const prefix = opts?.prefix ?? "$";
  const suffix = opts?.suffix ?? "";
  return `${prefix}${formatted}${suffix}`;
}

/** Strip HTML tags to plain text (for short descriptions / meta). */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

/** Remove WPBakery / WordPress shortcodes (e.g. [vc_row], [vc_column_text css="…"]) from HTML. */
export function stripShortcodes(html: string): string {
  if (!html) return html;
  return html
    .replace(/\[\/?[a-z][a-z0-9_]*[^\]]*\]/gi, "")
    .replace(/(?:\s*\n){3,}/g, "\n\n")
    .trim();
}

/** Decode the HTML entities WooCommerce returns in plain-text fields (names, etc.). */
export function decodeEntities(input: string): string {
  if (!input) return input;
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}
