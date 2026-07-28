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
import type { WcOrderDetail } from "./wc-admin";
import { getLineItemFields } from "./order-item-fields";

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
  metaLabel2: { width: 90, color: "#5a6472" },
  metaValue: { width: 130, fontFamily: "Helvetica-Bold" },
  metaValue2: { fontFamily: "Helvetica-Bold" },
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
  fieldChildLine: { fontSize: 8.5, color: "#5a6472", marginTop: 1, marginLeft: 10 },
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
            <Text style={styles.metaLabel2}>Order No.</Text>
            <Text style={styles.metaValue2}>{order.number}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Invoice Date</Text>
            <Text style={styles.metaValue}>{meta.invoiceDate}</Text>
            <Text style={styles.metaLabel2}>Order Date</Text>
            <Text style={styles.metaValue2}>{meta.orderDate}</Text>
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
                  {fields.map((f) =>
                    f.children ? (
                      <View key={f.label}>
                        <Text style={styles.fieldLine}>{f.label}:</Text>
                        {f.children.map((c) => (
                          <Text key={c.label} style={styles.fieldChildLine}>
                            ({c.label}:{c.value})
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text key={f.label} style={styles.fieldLine}>
                        ({f.label}:{f.value})
                      </Text>
                    ),
                  )}
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
