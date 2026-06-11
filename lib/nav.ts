/** Primary navigation, mirroring the live NaLA mega-menu structure. */

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const PRIMARY_NAV: NavItem[] = [
  {
    label: "2026 Conference",
    href: "/2026-conference",
    children: [
      { label: "Registration & Tickets", href: "/2026-conference#registration" },
      { label: "Sponsorships", href: "/2026-conference#sponsorships" },
      { label: "Hotel & Venue", href: "/2026-conference#venue" },
    ],
  },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
];

export const ACCOUNT_NAV: NavItem[] = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "My Account", href: "/my-account" },
  { label: "Edit Profile", href: "/profile" },
  { label: "Become a Member", href: "https://nalalifeline.org/membership/" },
];
