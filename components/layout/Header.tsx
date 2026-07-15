"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { PRIMARY_NAV, ACCOUNT_NAV, type NavItem } from "@/lib/nav";
import { useCart } from "@/lib/cart-hooks";
import { useUser } from "@/lib/auth-hooks";
import { cn } from "@/lib/utils";

const LOGGED_IN_NAV: NavItem[] = [
  { label: "My Account", href: "/my-account" },
  { label: "Profile", href: "/profile" },
  { label: "Edit Account", href: "/my-account/edit-account" },
  { label: "My Tickets", href: "/my-ticket" },
];

function CartLink() {
  const { data } = useCart();
  const count = data?.items_count ?? 0;
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 rounded-md px-3 py-2 text-navy hover:bg-cyan-50"
      aria-label={`Cart with ${count} items`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

function Dropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href}
        className="inline-flex items-center gap-1 px-3 py-2 font-sans text-[18px] font-semibold text-navy hover:text-cyan-700"
      >
        {item.label}
        {item.children && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        )}
      </Link>
      {item.children && open && (
        <div className="absolute left-0 top-full z-50 min-w-56 rounded-md border border-line bg-white py-2 shadow-lg">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-2 text-sm text-ink-soft hover:bg-cyan-50 hover:text-navy"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user } = useUser();
  const accountItem: NavItem = user
    ? { label: user.first_name || "My Account", href: "/my-account", children: LOGGED_IN_NAV }
    : { label: "Member Login", href: "/login", children: ACCOUNT_NAV };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="NaLA home">
          <Image
            src="/brand/logo.png"
            alt="National Lifeline Association"
            width={338}
            height={78}
            priority
            className="w-[170px] h-auto md:h-12 md:w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
          {PRIMARY_NAV.map((item) => (
            <Dropdown key={item.href} item={item} />
          ))}
          <Dropdown item={accountItem} />
          <CartLink />
        </nav>

        {/* Mobile toggle */}
        <button
          className="inline-flex cursor-pointer items-center rounded-md p-2 text-navy lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-line bg-white transition-[max-height] lg:hidden",
          mobileOpen ? "max-h-[80vh]" : "max-h-0",
        )}
      >
        <nav className="flex flex-col px-4 py-3">
          {[...PRIMARY_NAV, { label: "Cart", href: "/cart" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b border-line py-3 font-sans font-bold text-navy"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">
              Member Login
            </p>
            {ACCOUNT_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-sm text-ink-soft"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
