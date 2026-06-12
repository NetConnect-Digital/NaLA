import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/wc-admin";
import { Container, Section } from "@/components/ui/Container";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Tickets" };

export default async function MyTicketPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await getCustomerOrders(user.id).catch(() => []);
  const ticketOrders = orders.filter((o) =>
    o.line_items.some((li) => /registration|ticket|conference/i.test(li.name)),
  );

  return (
    <Section>
      <Container>
        <nav className="mb-4 text-sm text-muted">
          <Link href="/my-account" className="hover:text-cyan-700">
            My Account
          </Link>{" "}
          / My Tickets
        </nav>
        <h1 className="text-3xl md:text-4xl">My Tickets</h1>

        {ticketOrders.length === 0 ? (
          <div className="mt-8 rounded-lg border border-line bg-white p-8 text-center">
            <p className="text-ink-soft">
              You don&apos;t have any conference tickets yet.
            </p>
            <Link
              href="/2026-conference#registration"
              className="mt-4 inline-block font-bold text-cyan-700 hover:underline"
            >
              Register for the 2026 Conference →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {ticketOrders.flatMap((o) =>
              o.line_items
                .filter((li) => /registration|ticket|conference/i.test(li.name))
                .map((li) => (
                  <li
                    key={`${o.id}-${li.id}`}
                    className="rounded-lg border border-line bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg">{li.name}</h3>
                        <p className="text-sm text-muted">
                          Order #{o.number} ·{" "}
                          {new Date(o.date_created).toLocaleDateString("en-US")} ·{" "}
                          <span className="capitalize">{o.status}</span>
                        </p>
                      </div>
                      <span className="rounded bg-green-50 px-3 py-1 text-sm font-bold text-navy">
                        Qty {li.quantity}
                      </span>
                    </div>
                  </li>
                )),
            )}
          </ul>
        )}
      </Container>
    </Section>
  );
}
