import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWcCustomer, type WcAddress } from "@/lib/wc-admin";
import { AccountLayout } from "@/components/account/AccountLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const customer = await getWcCustomer(user.id).catch(() => null);

  return (
    <AccountLayout>
      <h2 className="text-2xl">Addresses</h2>
      <p className="mt-2 text-ink-soft">
        The following addresses will be used on the checkout page by default.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <AddressCard
          type="billing"
          heading="Billing address"
          subtitle="Used for billing & invoices"
          address={customer?.billing}
          icon={
            <>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </>
          }
        />
        <AddressCard
          type="shipping"
          heading="Shipping address"
          subtitle="Where your orders are delivered"
          address={customer?.shipping}
          icon={
            <>
              <path d="M1 3h15v13H1z" />
              <path d="M16 8h4l3 3v5h-7z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </>
          }
        />
      </div>
    </AccountLayout>
  );
}

function hasContent(a?: WcAddress) {
  return Boolean(a && (a.first_name || a.address_1 || a.city));
}

function AddressCard({
  type,
  heading,
  subtitle,
  address,
  icon,
}: {
  type: "billing" | "shipping";
  heading: string;
  subtitle: string;
  address?: WcAddress;
  icon: React.ReactNode;
}) {
  const a = address ?? {};
  const filled = hasContent(a);

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_10px_28px_-16px_rgba(16,24,40,0.18)]">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyan-50 text-cyan-700">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {icon}
          </svg>
        </span>
        <div>
          <h3 className="!text-base font-bold leading-tight text-navy">{heading}</h3>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 flex-1">
        {filled ? (
          <address className="text-[15px] not-italic leading-relaxed text-ink-soft">
            {(a.first_name || a.last_name) && (
              <div className="font-bold text-navy">
                {a.first_name} {a.last_name}
              </div>
            )}
            {a.company && <div>{a.company}</div>}
            {a.address_1 && <div>{a.address_1}</div>}
            {a.address_2 && <div>{a.address_2}</div>}
            {(a.city || a.state || a.postcode) && (
              <div>
                {a.city}
                {a.city && (a.state || a.postcode) ? ", " : ""}
                {a.state} {a.postcode}
              </div>
            )}
            {a.phone && <div className="mt-2 text-muted">{a.phone}</div>}
          </address>
        ) : (
          <div className="grid place-items-center rounded-xl border border-dashed border-line bg-[#fafbfc] px-4 py-6 text-center">
            <p className="text-sm text-muted">You haven&apos;t added a {type} address yet.</p>
          </div>
        )}
      </div>

      <Link
        href={`/my-account/edit-address/${type}`}
        className={`mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors ${
          filled
            ? "border border-cyan/40 !text-cyan-700 hover:bg-cyan-50"
            : "bg-cyan !text-white hover:bg-cyan-700"
        }`}
      >
        {!filled && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
        {filled ? "Edit address" : "Add address"}
      </Link>
    </div>
  );
}
