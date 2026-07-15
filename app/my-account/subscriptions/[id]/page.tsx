import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWcSubscription } from "@/lib/wc-admin";
import { AccountLayout } from "@/components/account/AccountLayout";
import { CancelSubscriptionButton } from "@/components/account/CancelSubscriptionButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscription" };

const CANCELLABLE = new Set(["pending", "active", "on-hold"]);

/** WooCommerce-style human diff, e.g. "12 minutes ago", "3 days ago". */
function humanDiff(date?: string): string {
  if (!date) return "—";
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const abs = Math.abs(diff);
  const suffix = diff >= 0 ? "ago" : "from now";
  const units: [number, string][] = [
    [60_000, "minute"],
    [3_600_000, "hour"],
    [86_400_000, "day"],
    [2_592_000_000, "month"],
    [31_536_000_000, "year"],
  ];
  if (abs < 60_000) return "just now";
  let value = Math.round(abs / 60_000);
  let label = "minute";
  for (let i = units.length - 1; i >= 0; i--) {
    if (abs >= units[i][0]) {
      value = Math.round(abs / units[i][0]);
      label = units[i][1];
      break;
    }
  }
  return `${value} ${label}${value === 1 ? "" : "s"} ${suffix}`;
}

function fmtDate(date?: string): string {
  if (!date) return "—";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US");
}

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const sub = await getWcSubscription(Number(id)).catch(() => null);

  if (!sub || (sub.customer_id != null && sub.customer_id !== user.id)) notFound();

  const sym = sub.currency_symbol ?? "$";
  const recurring =
    sub.billing_period != null
      ? ` / ${Number(sub.billing_interval) > 1 ? `${sub.billing_interval} ` : ""}${sub.billing_period}`
      : "";

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Status", value: <span className="capitalize">{sub.status}</span> },
    { label: "Start date", value: humanDiff(sub.start_date_gmt ?? sub.date_created) },
    { label: "Last order date", value: fmtDate(sub.last_payment_date_gmt) },
    { label: "Next payment date", value: fmtDate(sub.next_payment_date_gmt) },
    { label: "Payment", value: `Via ${sub.payment_method_title || "Manual Renewal"}` },
    {
      label: "Actions",
      value: CANCELLABLE.has(sub.status) ? (
        <CancelSubscriptionButton id={sub.id} />
      ) : (
        "—"
      ),
    },
  ];

  return (
    <AccountLayout>
      <nav className="mb-4 text-sm text-muted">
        <Link href="/my-account/subscriptions" className="hover:text-cyan-700">
          Subscriptions
        </Link>{" "}
        / #{sub.number}
      </nav>

      <h2 className="text-2xl md:text-3xl">Subscription #{sub.number}</h2>

      {/* Details table (WooCommerce view-subscription style) */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-white shadow-sm">
        <table className="w-full border-collapse text-[15px]">
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-line last:border-0">
                <th className="w-1/2 border-r border-line p-4 text-left align-middle font-bold text-navy">
                  {r.label}
                </th>
                <td className="p-4 align-middle text-ink-soft">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subscription totals */}
      <h3 className="mt-8 text-xl">Subscription totals</h3>
      <div className="mt-4 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[420px] border-collapse bg-white">
          <thead>
            <tr className="bg-navy text-left text-white">
              <th className="p-3 font-sans">Product</th>
              <th className="p-3 text-center font-sans">Qty</th>
              <th className="p-3 text-right font-sans">Total</th>
            </tr>
          </thead>
          <tbody>
            {sub.line_items.map((li) => (
              <tr key={li.id} className="border-b border-line last:border-0">
                <td className="p-3 text-ink-soft">{li.name}</td>
                <td className="p-3 text-center text-ink-soft">{li.quantity}</td>
                <td className="p-3 text-right font-bold text-navy">
                  {sym}
                  {li.total}
                </td>
              </tr>
            ))}
            <tr className="bg-cream/60">
              <td className="p-3 font-bold text-navy" colSpan={2}>
                Recurring total
              </td>
              <td className="p-3 text-right font-bold text-navy">
                {sym}
                {sub.total}
                {recurring}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <Link
          href="/my-account/subscriptions"
          className="inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-navy px-6 py-2.5 text-sm font-bold uppercase tracking-wide !text-navy transition-colors hover:bg-navy hover:!text-white"
        >
          Back to Subscriptions
        </Link>
      </div>
    </AccountLayout>
  );
}
