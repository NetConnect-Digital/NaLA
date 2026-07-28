import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWcOrder } from "@/lib/wc-admin";
import { Container, Section } from "@/components/ui/Container";
import { CancelOrderButton } from "@/components/account/CancelOrderButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order Details" };

function money(symbol: string, amount: string) {
  return `${symbol}${amount}`;
}

/** Status → badge colours. Cancelled/failed read red; completed green; else cyan. */
function statusBadge(status: string): string {
  switch (status) {
    case "cancelled":
    case "failed":
    case "refunded":
      return "bg-red-50 text-red-600";
    case "completed":
      return "bg-green-50 text-green";
    default:
      return "bg-cyan-50 text-cyan-700";
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const order = await getWcOrder(Number(id)).catch(() => null);

  // Not found, or the order doesn't belong to the signed-in customer.
  if (!order || order.customer_id !== user.id) notFound();

  const sym = order.currency_symbol ?? "$";
  const date = new Date(order.date_created).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const b = order.billing ?? {};
  const badge = statusBadge(order.status);

  return (
    <Section>
      <Container>
        <nav className="mb-4 text-sm text-muted">
          <Link href="/my-account" className="hover:text-cyan-700">
            My Account
          </Link>{" "}
          / Order #{order.number}
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl md:text-4xl">Order #{order.number}</h1>
          <span
            className={`rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide ${badge}`}
          >
            {order.status}
          </span>
        </div>
        <p className="mt-1 text-ink-soft">Placed on {date}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[420px] border-collapse bg-white">
                <thead>
                  <tr className="bg-navy text-left text-white">
                    <th className="p-3 font-sans">Product</th>
                    <th className="p-3 text-center font-sans">Qty</th>
                    <th className="p-3 text-right font-sans">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.line_items.map((li) => (
                    <tr key={li.id} className="border-b border-line last:border-0">
                      <td className="p-3 text-ink-soft">{li.name}</td>
                      <td className="p-3 text-center text-ink-soft">{li.quantity}</td>
                      <td className="p-3 text-right font-bold text-navy">
                        {money(sym, li.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary + billing */}
          <aside className="space-y-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h2 className="text-xl">Order Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <Line label="Discount" value={money(sym, order.discount_total)} hide={order.discount_total === "0.00"} />
                <Line label="Shipping" value={money(sym, order.shipping_total)} hide={order.shipping_total === "0.00"} />
                <Line label="Tax" value={money(sym, order.total_tax)} hide={order.total_tax === "0.00"} />
                <div className="flex justify-between border-t border-line pt-2 text-base">
                  <dt className="font-bold text-navy">Total</dt>
                  <dd className="font-bold text-navy">{money(sym, order.total)}</dd>
                </div>
                {order.payment_method_title && (
                  <p className="pt-2 text-xs text-muted">
                    Paid via {order.payment_method_title}
                  </p>
                )}
              </dl>
            </div>

            {(b.first_name || b.address_1) && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h2 className="text-xl">Billing</h2>
                <address className="mt-3 text-sm not-italic leading-relaxed text-ink-soft">
                  {(b.first_name || b.last_name) && (
                    <div>
                      {b.first_name} {b.last_name}
                    </div>
                  )}
                  {b.company && <div>{b.company}</div>}
                  {b.address_1 && <div>{b.address_1}</div>}
                  {b.address_2 && <div>{b.address_2}</div>}
                  {(b.city || b.state || b.postcode) && (
                    <div>
                      {b.city}
                      {b.city && (b.state || b.postcode) ? ", " : ""}
                      {b.state} {b.postcode}
                    </div>
                  )}
                  {b.email && <div className="mt-2">{b.email}</div>}
                  {b.phone && <div>{b.phone}</div>}
                </address>
              </div>
            )}
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/my-account"
            className="inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-navy px-6 py-2.5 text-sm font-bold uppercase tracking-wide !text-navy transition-colors hover:bg-navy hover:!text-white"
          >
            Back to My Account
          </Link>
          {order.needs_payment && (
            <Link
              href={`/my-account/view-order/${order.id}/pay`}
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan px-6 py-2.5 text-sm font-bold uppercase tracking-wide !text-white transition-colors hover:bg-cyan-700"
            >
              Pay {money(sym, order.total)}
            </Link>
          )}
          {order.status === "completed" && (
            <a
              href={`/my-account/view-order/${order.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-navy px-6 py-2.5 text-sm font-bold uppercase tracking-wide !text-white transition-colors hover:bg-navy-dark"
            >
              PDF Invoice
            </a>
          )}
          {order.status === "failed" && <CancelOrderButton id={order.id} />}
        </div>
      </Container>
    </Section>
  );
}

function Line({ label, value, hide }: { label: string; value: string; hide?: boolean }) {
  if (hide) return null;
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink-soft">{value}</dd>
    </div>
  );
}
