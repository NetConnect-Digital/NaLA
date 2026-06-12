import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/wc-admin";
import { Container, Section } from "@/components/ui/Container";
import { LogoutButton } from "@/components/auth/LogoutButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account" };

export default async function MyAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await getCustomerOrders(user.id).catch(() => []);

  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl">My Account</h1>
            <p className="mt-1 text-ink-soft">
              Welcome back, {user.first_name || user.name}.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <AccountTile href="/profile" title="Edit Profile" desc="Update your name, email, and details." />
          <AccountTile href="/my-ticket" title="My Tickets" desc="View your conference tickets." />
          <AccountTile
            href="https://nalalifeline.org/membership/"
            title="Membership"
            desc="Manage your NaLA membership."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-2xl">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-muted">
              No orders yet (or order history isn&apos;t connected — configure the
              WooCommerce REST API keys).
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse rounded-lg bg-white shadow-sm">
                <thead>
                  <tr className="bg-navy text-left text-white">
                    <th className="p-3 font-sans">Order</th>
                    <th className="p-3 font-sans">Date</th>
                    <th className="p-3 font-sans">Status</th>
                    <th className="p-3 font-sans">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-line">
                      <td className="p-3 font-bold text-navy">#{o.number}</td>
                      <td className="p-3 text-ink-soft">
                        {new Date(o.date_created).toLocaleDateString("en-US")}
                      </td>
                      <td className="p-3 capitalize text-ink-soft">{o.status}</td>
                      <td className="p-3 font-bold text-navy">
                        {o.currency_symbol ?? "$"}
                        {o.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

function AccountTile({ href, title, desc }: { href: string; title: string; desc: string }) {
  const external = href.startsWith("http");
  const inner = (
    <div className="h-full rounded-lg border border-line bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-lg">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{desc}</p>
    </div>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link href={href}>{inner}</Link>
  );
}
