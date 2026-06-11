import type { Product } from "./types";
import {
  OTHER_SPONSORSHIPS,
  SPONSOR_TIERS,
  REG_WINDOWS,
  REG_INCLUDES,
  type SponsorTier,
  type RegWindow,
} from "./conference";

/**
 * Enriches the static add-on sponsorship list with live WooCommerce data.
 *
 * On the live site each add-on is a `sponsorship`-category product, split into a
 * funding product (e.g. "Welcome Party Sponsor") and a non-funding variant
 * ("Welcome Party Sponsor (Non-Funding Price)"). We match by normalized name and
 * pull the featured image, price, stock, and product id from each — falling back
 * to the hardcoded values when the backend is unreachable or a match is missing.
 */
export interface AddOnCard {
  name: string;
  funding: number;
  nonFunding: number;
  soldOut: boolean;
  image?: string;
  fundingId?: number;
  nonFundingId?: number;
  fundingSlug?: string;
  nonFundingSlug?: string;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/&#8211;|&amp;/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bnon funding price\b/g, "")
    .replace(/\bfunding price\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

const isNonFunding = (name: string) => /non[\s-]*funding/i.test(name);

export const priceToNumber = (p?: Product): number | undefined => {
  if (!p) return undefined;
  const n = Number(p.prices.price);
  if (Number.isNaN(n)) return undefined;
  const unit = p.prices.currency_minor_unit ?? 2;
  return unit > 0 ? n / 10 ** unit : n;
};

const cleanText = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&nbsp;/g, " ")
    .replace(/�/g, "—")
    .replace(/\s+/g, " ")
    .trim();

/** Pull the perk list out of a product's short_description HTML. */
function parsePerks(html?: string): string[] {
  if (!html) return [];
  const cells = [...html.matchAll(/gw-go-body-cell[^>]*>([\s\S]*?)<\/div>/g)].map(
    (m) => m[1],
  );
  const raw = cells.length
    ? cells
    : [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  return raw.map(cleanText).filter(Boolean);
}

/** Remaining stock count from the Store API's stock_availability text. */
function stockCount(p?: Product): number | undefined {
  const text = p?.stock_availability?.text;
  const m = text?.match(/(\d+)/);
  return m ? Number(m[1]) : undefined;
}

export function buildAddOnCards(products: Product[]): AddOnCard[] {
  const sponsors = products.filter((p) =>
    p.categories.some((c) => c.slug === "sponsorship"),
  );

  const match = (base: string, nonFunding: boolean) => {
    const target = normalize(base);
    return sponsors.find((p) => {
      if (isNonFunding(p.name) !== nonFunding) return false;
      return normalize(p.name).startsWith(target);
    });
  };

  return OTHER_SPONSORSHIPS.map((item) => {
    const fundingProd = match(item.name, false);
    const nonProd = match(item.name, true);
    return {
      name: item.name,
      funding: priceToNumber(fundingProd) ?? item.funding,
      nonFunding: priceToNumber(nonProd) ?? item.nonFunding,
      soldOut: fundingProd
        ? !fundingProd.is_in_stock || !fundingProd.is_purchasable
        : item.soldOut,
      image: fundingProd?.images?.[0]?.src ?? nonProd?.images?.[0]?.src,
      fundingId: fundingProd?.id,
      nonFundingId: nonProd?.id,
      fundingSlug: fundingProd?.slug,
      nonFundingSlug: nonProd?.slug,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Sponsorship package tiers (comparison table)                        */
/* ------------------------------------------------------------------ */

/** Live product names per tier (Store API has no per-tier metadata). */
const TIER_MATCH: Record<string, string> = {
  exhibit: "exhibit table",
  platinum: "platinum sponsor",
  premiere: "premiere sponsor",
  diamond: "diamond sponsor",
};

export interface TierCard extends SponsorTier {
  fundingId?: number;
  nonFundingId?: number;
  fundingSlug?: string;
  nonFundingSlug?: string;
}

export function buildTierCards(products: Product[]): TierCard[] {
  const sponsors = products.filter((p) =>
    p.categories.some((c) => c.slug === "sponsorship"),
  );

  const match = (term: string, nonFunding: boolean) =>
    sponsors.find(
      (p) => isNonFunding(p.name) === nonFunding && normalize(p.name).startsWith(term),
    );

  return SPONSOR_TIERS.map((t) => {
    const term = TIER_MATCH[t.key] ?? normalize(t.name);
    const fundingProd = match(term, false);
    const nonProd = match(term, true);

    // Perks come from the funding product's short_description; non-funding as fallback.
    const perks = parsePerks(fundingProd?.short_description || nonProd?.short_description);

    // Availability: live remaining count (API) over the configured total allotment.
    const remaining = stockCount(fundingProd);
    const total = t.available.match(/of\s+(\d+)/i)?.[1];
    const available =
      remaining != null ? `${remaining}${total ? ` of ${total}` : ""}` : t.available;

    // Tier name from the live product (strip the "(Non-Funding Price)" suffix).
    const liveName = fundingProd
      ? cleanText(fundingProd.name).replace(/\s*\(.*?\)\s*$/, "").trim()
      : "";

    return {
      ...t,
      name: liveName || t.name,
      perks: perks.length ? perks : t.perks,
      available,
      funding: priceToNumber(fundingProd) ?? t.funding,
      nonFunding: priceToNumber(nonProd) ?? t.nonFunding,
      fundingId: fundingProd?.id,
      nonFundingId: nonProd?.id,
      fundingSlug: fundingProd?.slug,
      nonFundingSlug: nonProd?.slug,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Registration windows (parsed from the ticket product description)   */
/* ------------------------------------------------------------------ */

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const priceText = (s: string): number | undefined => {
  const n = Number(s.replace(/[^0-9.]/g, ""));
  return Number.isNaN(n) || n === 0 ? undefined : n;
};

const toISO = (s: string, year: number): string | undefined => {
  const m = s.trim().match(/([A-Za-z]+)\s+(\d+)/);
  const month = m ? MONTHS[m[1].toLowerCase()] : undefined;
  if (!m || !month) return undefined;
  return `${year}-${String(month).padStart(2, "0")}-${String(Number(m[2])).padStart(2, "0")}`;
};

/** Read a pricing table that follows a heading matched by `heading`. */
function parsePricingTable(html: string, heading: RegExp): string[][] | null {
  const idx = html.search(heading);
  if (idx < 0) return null;
  const table = html.slice(idx).match(/<table[\s\S]*?<\/table>/i)?.[0];
  if (!table) return null;
  return [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) =>
    [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => cleanText(c[1])),
  );
}

/**
 * Builds the registration windows from the funding ticket's description, which
 * holds both pricing tables (Funding + Non-Funding × Early/Regular/Late with
 * dates). Falls back to the static REG_WINDOWS if the product or its tables
 * can't be parsed.
 */
export function buildRegWindows(products: Product[]): RegWindow[] {
  const ticket = products.find(
    (p) =>
      p.categories.some((c) => c.slug === "ticket") &&
      /funding members/i.test(p.name) &&
      !/non-?funding/i.test(p.name),
  );
  const desc = ticket?.description;
  if (!desc) return REG_WINDOWS;

  const year = Number(ticket.name.match(/20\d\d/)?.[0]) || 2026;
  const fundingRows = parsePricingTable(desc, /\|\s*Funding Members/i);
  const nonRows = parsePricingTable(desc, /Non-?Funding Members/i);
  if (!fundingRows || !nonRows || fundingRows.length < 3 || nonRows.length < 3) {
    return REG_WINDOWS;
  }

  const [labels, fundingPrices, dates] = fundingRows;
  const nonPrices = nonRows[1];
  const keys: RegWindow["key"][] = ["early", "regular", "late"];

  const windows = keys.map((key, i): RegWindow | null => {
    const dateText = dates?.[i] ?? "";
    const [startStr, endStr] = dateText.split(/[–-]/).map((s) => s.trim());
    const start = startStr ? toISO(startStr, year) : undefined;
    const end = endStr ? toISO(endStr, year) : undefined;
    const funding = priceText(fundingPrices?.[i] ?? "");
    const nonFunding = priceText(nonPrices?.[i] ?? "");
    if (!start || !end || funding == null || nonFunding == null) return null;
    return {
      key,
      label: `${labels?.[i] ?? key} Registration`,
      range: `Effective ${dateText}`,
      opensLabel: startStr ?? "",
      start,
      end,
      funding,
      nonFunding,
    };
  });

  return windows.every(Boolean) ? (windows as RegWindow[]) : REG_WINDOWS;
}

/** Ticket "what's included" list, parsed from the funding ticket's short_description. */
export function buildIncludes(products: Product[]): string[] {
  const ticket = products.find(
    (p) =>
      p.categories.some((c) => c.slug === "ticket") &&
      /funding members/i.test(p.name) &&
      !/non-?funding/i.test(p.name),
  );
  const items = parsePerks(ticket?.short_description);
  return items.length ? items : REG_INCLUDES;
}
