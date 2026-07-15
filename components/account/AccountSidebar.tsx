"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogout } from "@/lib/auth-hooks";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  /** Match by prefix (section + children) rather than exact path. */
  prefix?: boolean;
}

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/my-account",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    label: "Orders",
    href: "/my-account/orders",
    prefix: true,
    icon: (
      <>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
  },
  {
    label: "My Tickets",
    href: "/my-ticket",
    prefix: true,
    icon: (
      <>
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
        <path d="M13 5v2M13 17v2M13 11v2" />
      </>
    ),
  },
  {
    label: "My Subscription",
    href: "/my-account/subscriptions",
    prefix: true,
    icon: (
      <>
        <path d="M17 2.1 21 6l-4 3.9" />
        <path d="M3 12a8 8 0 0 1 14-5.3L21 6" />
        <path d="M7 21.9 3 18l4-3.9" />
        <path d="M21 12a8 8 0 0 1-14 5.3L3 18" />
      </>
    ),
  },
  {
    label: "Coupons",
    href: "/my-account/coupons",
    prefix: true,
    icon: (
      <>
        <path d="M20.6 8.5 12.5 0.4a1.4 1.4 0 0 0-1-.4H4a2 2 0 0 0-2 2v7.5a1.4 1.4 0 0 0 .4 1l8.1 8.1a2 2 0 0 0 2.8 0l6.5-6.5a2 2 0 0 0 0-2.8z" transform="translate(0 2)" />
        <circle cx="7.5" cy="9.5" r="1.5" />
      </>
    ),
  },
  {
    label: "Addresses",
    href: "/my-account/edit-address",
    prefix: true,
    icon: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    label: "Payment methods",
    href: "/my-account/payment-methods",
    prefix: true,
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    prefix: true,
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      </>
    ),
  },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Modern WooCommerce-style My Account navigation. */
export function AccountSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  const initial = name.trim().charAt(0).toUpperCase() || "M";

  function isActive(item: NavItem) {
    return item.prefix ? pathname.startsWith(item.href) : pathname === item.href;
  }

  const row =
    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold transition-all";

  return (
    <nav className="rounded-2xl border border-line bg-white p-3 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_8px_24px_-12px_rgba(16,24,40,0.12)]">
      {/* Profile block */}
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-cyan-50 to-white px-3 py-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyan text-lg font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold leading-tight text-navy">{name}</p>
          {email && <p className="truncate text-xs text-muted">{email}</p>}
        </div>
      </div>

      <div className="my-3 h-px bg-line" />

      <ul className="space-y-1">
        {NAV.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${row} ${
                  active
                    ? "bg-cyan text-white !text-white shadow-sm"
                    : "!text-slate-600 hover:bg-slate-50 hover:!text-navy"
                }`}
              >
                <span className={active ? "text-white" : "text-slate-400"}>
                  <Icon>{item.icon}</Icon>
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="my-3 h-px bg-line" />

      <button
        type="button"
        onClick={() =>
          logout.mutate(undefined, {
            onSuccess: () => {
              router.push("/");
              router.refresh();
            },
          })
        }
        disabled={logout.isPending}
        className={`${row} w-full cursor-pointer !text-slate-600 hover:bg-red-50 hover:!text-red-600 disabled:opacity-60`}
      >
        <span className="text-slate-400">
          <Icon>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </Icon>
        </span>
        {logout.isPending ? "Logging out…" : "Log out"}
      </button>
    </nav>
  );
}
