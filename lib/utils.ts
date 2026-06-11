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
