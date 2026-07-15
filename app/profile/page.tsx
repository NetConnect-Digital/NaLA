import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWcCustomer } from "@/lib/wc-admin";
import { AccountLayout } from "@/components/account/AccountLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const customer = await getWcCustomer(user.id).catch(() => null);

  const firstName = customer?.first_name ?? user.first_name ?? "";
  const lastName = customer?.last_name ?? user.last_name ?? "";
  const email = customer?.email ?? user.email ?? "";
  const username = customer?.username ?? "";
  const displayName =
    customer?.display_name?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    user.name;
  const initial = displayName.trim().charAt(0).toUpperCase() || "M";
  const memberSince = customer?.date_created
    ? new Date(customer.date_created).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const details: { label: string; value: string }[] = [
    { label: "First name", value: firstName || "—" },
    { label: "Last name", value: lastName || "—" },
    { label: "Display name", value: displayName || "—" },
    { label: "Email address", value: email || "—" },
    { label: "Username", value: username || "—" },
  ];
  if (memberSince) details.push({ label: "Member since", value: memberSince });

  return (
    <AccountLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl">Profile</h2>
        <Link
          href="/my-account/edit-account"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-cyan px-6 py-2.5 text-sm font-bold uppercase tracking-wide !text-white transition-colors hover:bg-cyan-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
          Edit account
        </Link>
      </div>

      {/* Identity card */}
      <div className="mt-6 flex items-center gap-5 rounded-2xl border border-line bg-gradient-to-br from-cyan-50 to-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-cyan text-3xl font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold text-navy">{displayName}</p>
          {email && <p className="truncate text-ink-soft">{email}</p>}
          {memberSince && (
            <p className="mt-1 text-sm text-muted">Member since {memberSince}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        <dl>
          {details.map((d, i) => (
            <div
              key={d.label}
              className={`flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:gap-6 ${
                i !== details.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <dt className="w-48 shrink-0 text-sm font-bold uppercase tracking-wide text-muted">
                {d.label}
              </dt>
              <dd className="text-[15px] text-navy">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </AccountLayout>
  );
}
