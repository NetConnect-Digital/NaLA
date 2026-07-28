import "server-only";
import fs from "fs";
import path from "path";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { WcOrderDetail, WcMetaData } from "./wc-admin";

Font.registerHyphenationCallback((word) => [word]);

const LOGO_DATA_URI = (() => {
  const file = path.join(process.cwd(), "public/brand/logo.png");
  const b64 = fs.readFileSync(file).toString("base64");
  return `data:image/png;base64,${b64}`;
})();

const FALLBACK_COMPANY = {
  name: "National Lifeline Association",
  detailLines: ["info@nalalifeline.org", "www.nalalifeline.org"],
  registeredAddress: "415 McFarlan Rd, Suite 108 Kennett Square, PA 19348",
};

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
  return base
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

/** Extract the customer-facing "(Label:Value)" lines shown under a certification line item. */
function getLineItemFields(meta: WcMetaData[] | undefined): { label: string; value: string }[] {
  if (!meta?.length) return [];
  const byKey = new Map(meta.map((m) => [m.key, m]));
  const fields: { label: string; value: string }[] = [];

  for (const m of meta) {
    if (!m.key.startsWith("_wccf_pf_")) continue;
    const rest = m.key.slice("_wccf_pf_".length);
    if (rest.startsWith("id_") || rest.startsWith("data_")) continue;

    const value = resolveCodedValue(m.value, byKey.get(`_wccf_pf_data_${rest}`));
    if (!value) continue;
    fields.push({ label: FIELD_LABELS[rest] ?? humanizeFieldKey(rest), value });
  }
  return fields;
}

function invoiceMeta(order: WcOrderDetail) {
  const raw = order.meta_data?.find((m) => m.key === "_invoice_meta")?.value as
    | Record<string, string>
    | undefined;

  const orderDate = new Date(order.date_created);
  return {
    invoiceNumber: raw?.invoice_number || order.number,
    invoiceDate:
      raw?.invoice_date ||
      orderDate.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }),
    orderDate: orderDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    companyName: raw?.pdf_company_name || FALLBACK_COMPANY.name,
    detailLines: raw?.pdf_company_details
      ? raw.pdf_company_details.split(/\r?\n/).filter(Boolean)
      : FALLBACK_COMPANY.detailLines,
    registeredAddress: raw?.pdf_registered_address || FALLBACK_COMPANY.registeredAddress,
  };
}

function money(symbol: string, amount: number): string {
  return `${symbol}${amount.toFixed(2)}`;
}

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9.5, color: "#1a2233", fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logo: { width: 150, objectFit: "contain" },
  companyBlock: { alignItems: "flex-end", textAlign: "right" },
  companyName: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  metaTable: { marginTop: 20, borderTopWidth: 1, borderTopColor: "#dbe1ea", paddingTop: 10 },
  metaRow: { flexDirection: "row", marginBottom: 3 },
  metaLabel: { width: 110, color: "#5a6472" },
  metaValue: { fontFamily: "Helvetica-Bold" },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 6 },
  address: { lineHeight: 1.4 },
  table: { marginTop: 8, borderWidth: 1, borderColor: "#dbe1ea" },
  tHeadRow: { flexDirection: "row", backgroundColor: "#0b2545" },
  tHeadCell: { color: "#ffffff", padding: 6, fontFamily: "Helvetica-Bold", fontSize: 9 },
  tRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#dbe1ea" },
  tCell: { padding: 6 },
  colProduct: { flex: 3 },
  colNum: { flex: 1, textAlign: "right" },
  fieldLine: { fontSize: 8.5, color: "#5a6472", marginTop: 1.5 },
  totals: { marginTop: 10, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 200, justifyContent: "space-between", marginBottom: 3 },
  totalsRowFinal: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#dbe1ea",
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 36,
    right: 36,
    textAlign: "center",
    fontSize: 8.5,
    color: "#5a6472",
  },
});

export async function renderInvoicePdf(order: WcOrderDetail): Promise<Buffer> {
  const sym = order.currency_symbol ?? "$";
  const meta = invoiceMeta(order);
  const b = order.billing ?? {};
  const subtotal = order.line_items.reduce((n, li) => n + parseFloat(li.total || "0"), 0);
  const taxLines = order.tax_lines?.filter((t) => parseFloat(t.tax_total || "0") > 0) ?? [];

  const doc = (
    <Document title={`Invoice ${meta.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={LOGO_DATA_URI} style={styles.logo} />
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{meta.companyName}</Text>
            {meta.detailLines.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </View>
        </View>

        <View style={styles.metaTable}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Invoice No.</Text>
            <Text style={styles.metaValue}>{meta.invoiceNumber}</Text>
            <Text style={[styles.metaLabel, { marginLeft: 40 }]}>Order No.</Text>
            <Text style={styles.metaValue}>{order.number}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Invoice Date</Text>
            <Text style={styles.metaValue}>{meta.invoiceDate}</Text>
            <Text style={[styles.metaLabel, { marginLeft: 40 }]}>Order Date</Text>
            <Text style={styles.metaValue}>{meta.orderDate}</Text>
          </View>
          {order.payment_method_title && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Payment Method</Text>
              <Text style={styles.metaValue}>{order.payment_method_title}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Billing Details</Text>
        <View style={styles.address}>
          {(b.first_name || b.last_name) && (
            <Text>
              {b.first_name} {b.last_name}
            </Text>
          )}
          {b.company && <Text>{b.company}</Text>}
          {b.address_1 && <Text>{b.address_1}</Text>}
          {b.address_2 && <Text>{b.address_2}</Text>}
          {(b.city || b.state || b.postcode) && (
            <Text>
              {b.city}
              {b.city && (b.state || b.postcode) ? ", " : ""}
              {b.state} {b.postcode}
            </Text>
          )}
          {b.email && <Text>{b.email}</Text>}
          {b.phone && <Text>{b.phone}</Text>}
        </View>

        <Text style={styles.sectionTitle}>Order Details</Text>
        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Text style={[styles.tHeadCell, styles.colProduct]}>Qty Product</Text>
            <Text style={[styles.tHeadCell, styles.colNum]}>Price Ex</Text>
            <Text style={[styles.tHeadCell, styles.colNum]}>Total Ex.</Text>
            <Text style={[styles.tHeadCell, styles.colNum]}>Tax</Text>
            <Text style={[styles.tHeadCell, styles.colNum]}>Price Inc</Text>
            <Text style={[styles.tHeadCell, styles.colNum]}>Total Inc</Text>
          </View>
          {order.line_items.map((li) => {
            const qty = li.quantity || 1;
            const totalEx = parseFloat(li.total || "0");
            const totalTax = parseFloat(li.total_tax || "0");
            const priceEx = totalEx / qty;
            const priceInc = (totalEx + totalTax) / qty;
            const fields = getLineItemFields(li.meta_data);
            return (
              <View key={li.id} style={styles.tRow}>
                <View style={[styles.tCell, styles.colProduct]}>
                  <Text>
                    {qty} x {li.name}
                  </Text>
                  {fields.map((f) => (
                    <Text key={f.label} style={styles.fieldLine}>
                      ({f.label}:{f.value})
                    </Text>
                  ))}
                </View>
                <Text style={[styles.tCell, styles.colNum]}>{money(sym, priceEx)}</Text>
                <Text style={[styles.tCell, styles.colNum]}>{money(sym, totalEx)}</Text>
                <Text style={[styles.tCell, styles.colNum]}>{money(sym, totalTax)}</Text>
                <Text style={[styles.tCell, styles.colNum]}>{money(sym, priceInc)}</Text>
                <Text style={[styles.tCell, styles.colNum]}>{money(sym, totalEx + totalTax)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text>Subtotal:</Text>
            <Text>{money(sym, subtotal)}</Text>
          </View>
          {parseFloat(order.discount_total || "0") > 0 && (
            <View style={styles.totalsRow}>
              <Text>Discount:</Text>
              <Text>-{money(sym, parseFloat(order.discount_total))}</Text>
            </View>
          )}
          {parseFloat(order.shipping_total || "0") > 0 && (
            <View style={styles.totalsRow}>
              <Text>Shipping:</Text>
              <Text>{money(sym, parseFloat(order.shipping_total))}</Text>
            </View>
          )}
          {taxLines.map((t) => (
            <View style={styles.totalsRow} key={t.id}>
              <Text>{t.label}:</Text>
              <Text>{money(sym, parseFloat(t.tax_total))}</Text>
            </View>
          ))}
          <View style={styles.totalsRowFinal}>
            <Text>Total:</Text>
            <Text>{money(sym, parseFloat(order.total))}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Registered Office : {meta.registeredAddress}</Text>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
