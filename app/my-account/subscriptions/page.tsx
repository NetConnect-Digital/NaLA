import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerSubscriptions } from "@/lib/wc-admin";
import { AccountLayout } from "@/components/account/AccountLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Subscription" };

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subs = await getCustomerSubscriptions(user.id).catch(() => []);

  return (
    <AccountLayout>
      <h2 className="text-2xl">My Subscription</h2>

      {subs.length === 0 ? (
        <div className="mt-6 rounded-lg border border-line bg-white p-8 text-center">
          <p className="text-ink-soft">You have no active subscriptions.</p>
          <Link
            href="https://shop.nalalifeline.org/shop/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-bold !text-cyan-700 hover:underline"
          >
            Explore NaLA membership →
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse rounded-lg bg-white shadow-sm">
            <thead>
              <tr className="bg-navy text-left text-white">
                <th className="p-3 font-sans">Subscription</th>
                <th className="p-3 font-sans">Status</th>
                <th className="p-3 font-sans">Next payment</th>
                <th className="p-3 font-sans">Total</th>
                <th className="p-3 font-sans">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-line align-middle">
                  <td className="p-3 font-bold">
                    <Link
                      href={`/my-account/subscriptions/${s.id}`}
                      className="!text-cyan-700 hover:underline"
                    >
                      #{s.number}
                    </Link>
                  </td>
                  <td className="p-3 capitalize text-ink-soft">{s.status}</td>
                  <td className="p-3 text-ink-soft">
                    {s.next_payment_date_gmt
                      ? new Date(s.next_payment_date_gmt).toLocaleDateString("en-US")
                      : "—"}
                  </td>
                  <td className="p-3 text-ink-soft">
                    <span className="font-bold text-navy">
                      {s.currency_symbol ?? "$"}
                      {s.total}
                    </span>
                    {s.billing_period ? ` / ${s.billing_period}` : ""}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/my-account/subscriptions/${s.id}`}
                      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan px-5 py-1.5 text-xs font-bold uppercase tracking-wide !text-white transition-colors hover:bg-cyan-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AccountLayout>
  );
}
