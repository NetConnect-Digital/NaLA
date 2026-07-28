import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/wc-admin";
import { WP_URL } from "@/lib/config";
import { AccountLayout } from "@/components/account/AccountLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await getCustomerOrders(user.id).catch(() => []);

  return (
    <AccountLayout>
      <h2 className="text-2xl">Orders</h2>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-lg border border-line bg-white p-8 text-center">
          <p className="text-ink-soft">You have no orders yet.</p>
          <Link
            href="https://shop.nalalifeline.org/shop/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-bold !text-cyan-700 hover:underline"
          >
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse rounded-lg bg-white shadow-sm">
            <thead>
              <tr className="bg-navy text-left text-white">
                <th className="p-3 font-sans">Order</th>
                <th className="p-3 font-sans">Date</th>
                <th className="p-3 font-sans">Status</th>
                <th className="p-3 font-sans">Total</th>
                <th className="p-3 font-sans">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const items = o.line_items.reduce(
                  (n, li) => n + (li.quantity ?? 0),
                  0,
                );
                return (
                  <tr key={o.id} className="border-b border-line align-middle">
                    <td className="p-3 font-bold">
                      <Link
                        href={`/my-account/orders/${o.id}`}
                        className="!text-cyan-700 hover:underline"
                      >
                        #{o.number}
                      </Link>
                    </td>
                    <td className="p-3 text-ink-soft">
                      {new Date(o.date_created).toLocaleDateString("en-US")}
                    </td>
                    <td className="p-3 capitalize text-ink-soft">{o.status}</td>
                    <td className="p-3 text-ink-soft">
                      <span className="font-bold text-navy">
                        {o.currency_symbol ?? "$"}
                        {o.total}
                      </span>{" "}
                      for {items} item{items === 1 ? "" : "s"}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {o.needs_payment && (
                          <OrderButton href={`/my-account/orders/${o.id}/pay`}>
                            Pay
                          </OrderButton>
                        )}
                        <OrderButton href={`/my-account/orders/${o.id}`}>
                          View
                        </OrderButton>
                        {o.status === "completed" && (
                          <OrderButton
                            variant="navy"
                            href={`${WP_URL}/checkout/order-received/${o.id}/?key=${o.order_key}`}
                          >
                            PDF Invoice
                          </OrderButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AccountLayout>
  );
}

function OrderButton({
  href,
  children,
  variant = "cyan",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "cyan" | "navy";
}) {
  const color =
    variant === "navy" ? "bg-navy hover:bg-navy-dark" : "bg-cyan hover:bg-cyan-700";
  const cls = `inline-flex cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide !text-white transition-colors ${color}`;

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  );
}
