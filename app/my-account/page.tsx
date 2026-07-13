import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/wc-admin";
import { WP_URL } from "@/lib/config";
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

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AccountTile
            href="/profile"
            title="Edit Profile"
            cta="Edit profile"
            accent="cyan"
            icon={
              <>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </>
            }
          />
          <AccountTile
            href="/my-ticket"
            title="My Tickets"
            cta="View tickets"
            accent="purple"
            icon={
              <>
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                <path d="M13 5v2M13 17v2M13 11v2" />
              </>
            }
          />
          <AccountTile
            href="https://nalalifeline.org/membership/"
            title="Membership"
            cta="Manage membership"
            accent="green"
            icon={
              <>
                <circle cx="12" cy="8" r="6" />
                <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
              </>
            }
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
                        <td className="p-3 font-bold text-cyan-700">#{o.number}</td>
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
                            <OrderButton
                              href={`${WP_URL}/checkout/order-received/${o.id}/?key=${o.order_key}`}
                            >
                              View
                            </OrderButton>
                            {o.needs_payment && o.payment_url && (
                              <OrderButton href={o.payment_url}>Pay</OrderButton>
                            )}
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
        </div>
      </Container>
    </Section>
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
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide !text-white transition-colors ${color}`}
    >
      {children}
    </a>
  );
}

const ACCENTS = {
  cyan: { badge: "bg-cyan-50 text-cyan-700", cta: "text-cyan-700", hover: "hover:border-cyan" },
  purple: { badge: "bg-[#efe6f6] text-[#7f54b3]", cta: "text-[#7f54b3]", hover: "hover:border-[#7f54b3]" },
  green: { badge: "bg-green-50 text-green", cta: "text-green", hover: "hover:border-green" },
} as const;

function AccountTile({
  href,
  title,
  cta,
  icon,
  accent,
}: {
  href: string;
  title: string;
  cta: string;
  icon: React.ReactNode;
  accent: keyof typeof ACCENTS;
}) {
  const a = ACCENTS[accent];
  const external = href.startsWith("http");
  const inner = (
    <div
      className={`group flex h-full items-center gap-4 rounded-xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md ${a.hover}`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${a.badge}`}>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {icon}
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-bold text-navy">{title}</h3>
        <span className={`mt-1 inline-flex items-center gap-1 text-sm font-bold ${a.cta}`}>
          {cta}
          <svg
            className="transition-transform group-hover:translate-x-1"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </div>
    </div>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  ) : (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}
