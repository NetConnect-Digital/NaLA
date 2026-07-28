import type { WcMetaData } from "./wc-admin";

export interface LineItemField {
  label: string;
  value: string;
  /** Nested Q&A pairs (e.g. a ticket plugin's per-attendee answers embedded as an HTML list). */
  children?: { label: string; value: string }[];
}

/** Friendly labels for the certification application's custom line-item fields (`_wccf_pf_*` meta). */
const FIELD_LABELS: Record<string, string> = {
  add_first_name: "First Name",
  add_last_name: "Last Name",
  add_phone_number: "Phone Number",
  add_email_address: "Email Address",
  supervisor_email: "Supervisor Email",
  companies_you_distribute_for: "Companies You Distribute For",
  states_distributing: "States Distributing In",
  home1_address: "Home Address",
  city_add: "City",
  add_state: "State",
  add_zip_code: "Zip Code",
  dateofbirth: "Date of Birth (m/d/yyyy)",
};

function humanizeFieldKey(base: string): string {
  return base.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripHtml(str: string): string {
  return decodeHtmlEntities(str.replace(/<[^>]+>/g, "")).trim();
}

/** Resolve a coded value (e.g. `{"1":"iw","2":"ew"}`) against its sibling `_data_` meta's label dictionary. */
function resolveCodedValue(value: unknown, dataMeta: WcMetaData | undefined): string {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const labels =
      dataMeta &&
      typeof dataMeta.value === "object" &&
      dataMeta.value !== null &&
      "labels" in (dataMeta.value as Record<string, unknown>)
        ? ((dataMeta.value as Record<string, unknown>).labels as Record<string, string>)
        : undefined;
    return Object.values(value as Record<string, string>)
      .map((code) => labels?.[code] ?? code)
      .join(", ");
  }
  return String(value ?? "");
}

/**
 * Some plugins (e.g. event ticket add-ons) pack a whole set of per-attendee
 * answers into one meta value as `<ul><li><strong>Q</strong>: <span>A</span></li>...</ul>`.
 * Pull those back out into individual Q&A pairs instead of one flattened blob.
 */
function parseHtmlQaList(html: string): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];
  const liRegex = /<li>\s*<strong>([\s\S]*?)<\/strong>\s*:?\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(html))) {
    const label = stripHtml(match[1]);
    const value = stripHtml(match[2]);
    if (label) items.push({ label, value });
  }
  return items;
}

/** Extract the customer-facing fields captured on a line item (application answers, ticket Q&A, etc.). */
export function getLineItemFields(meta: WcMetaData[] | undefined): LineItemField[] {
  if (!meta?.length) return [];
  const byKey = new Map(meta.map((m) => [m.key, m]));
  const fields: LineItemField[] = [];

  for (const m of meta) {
    // Certification application fields: hidden (`_`-prefixed) meta with a bespoke naming scheme.
    if (m.key.startsWith("_wccf_pf_")) {
      const rest = m.key.slice("_wccf_pf_".length);
      if (rest.startsWith("id_") || rest.startsWith("data_")) continue;
      const value = resolveCodedValue(m.value, byKey.get(`_wccf_pf_data_${rest}`));
      if (!value) continue;
      fields.push({ label: FIELD_LABELS[rest] ?? humanizeFieldKey(rest), value });
      continue;
    }

    // Everything else starting with `_` is internal plugin bookkeeping, not customer-facing.
    if (m.key.startsWith("_")) continue;

    // WooCommerce already computes a friendly display_key/display_value pair for
    // "visible" (non-underscore) meta, used by most other plugins (e.g. ticket add-ons).
    const rawValue = typeof m.value === "string" ? m.value : undefined;
    if (rawValue && /<li>/i.test(rawValue)) {
      const children = parseHtmlQaList(rawValue);
      if (children.length) {
        const label =
          typeof m.display_key === "string" ? stripHtml(m.display_key) : humanizeFieldKey(m.key);
        fields.push({ label, value: "", children });
        continue;
      }
    }

    const label =
      typeof m.display_key === "string" ? stripHtml(m.display_key) : humanizeFieldKey(m.key);
    const value =
      typeof m.display_value === "string"
        ? stripHtml(m.display_value)
        : String(m.value ?? "");
    if (!value) continue;
    fields.push({ label, value });
  }
  return fields;
}
