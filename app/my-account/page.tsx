import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AccountLayout } from "@/components/account/AccountLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account" };

export default async function MyAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AccountLayout>
      <h1 className="text-2xl font-bold text-navy md:text-3xl">
        Hi, {user.first_name || user.name} 👋
      </h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Welcome to your account. Track your orders, manage your details, and view
        your conference tickets — all in one place.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AccountTile
          href="/my-account/orders"
          title="Orders"
          cta="View orders"
          accent="green"
          icon={
            <>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </>
          }
        />
        <AccountTile
          href="/my-account/edit-account"
          title="Account details"
          cta="Edit details"
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
      </div>
    </AccountLayout>
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
  return (
    <Link href={href} className="block">
      <div
        className={`group flex h-full items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_12px_28px_-12px_rgba(16,24,40,0.25)] ${a.hover}`}
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
    </Link>
  );
}
