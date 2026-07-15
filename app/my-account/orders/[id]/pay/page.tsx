import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWcOrder } from "@/lib/wc-admin";
import { Container, Section } from "@/components/ui/Container";
import { StripeProvider } from "@/components/checkout/StripeProvider";
import { OrderPayForm } from "@/components/checkout/OrderPayForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pay for Order" };

export default async function OrderPayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const order = await getWcOrder(Number(id)).catch(() => null);

  if (!order || order.customer_id !== user.id) notFound();
  // Already paid → nothing to do, send them to the order detail.
  if (!order.needs_payment) redirect(`/my-account/orders/${order.id}`);

  const sym = order.currency_symbol ?? "$";
  const amountLabel = `${sym}${order.total}`;

  return (
    <Section>
      <Container>
        <nav className="mb-4 text-sm text-muted">
          <Link href="/my-account" className="hover:text-cyan-700">
            My Account
          </Link>{" "}
          /{" "}
          <Link href={`/my-account/orders/${order.id}`} className="hover:text-cyan-700">
            Order #{order.number}
          </Link>{" "}
          / Pay
        </nav>

        <h1 className="text-3xl md:text-4xl">Pay for Order #{order.number}</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-line bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl">Payment</h2>
            <StripeProvider>
              <OrderPayForm orderId={order.id} amountLabel={amountLabel} />
            </StripeProvider>
          </div>

          <aside className="h-fit rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl">Order Summary</h2>
            <ul className="mt-4 space-y-3">
              {order.line_items.map((li) => (
                <li key={li.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-ink-soft">
                    {li.name} × {li.quantity}
                  </span>
                  <span className="font-bold text-navy">
                    {sym}
                    {li.total}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-blue-200 pt-4 text-base">
              <span className="font-bold text-navy">Total</span>
              <span className="font-bold text-navy">{amountLabel}</span>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
