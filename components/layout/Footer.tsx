import Link from "next/link";
import { Container } from "@/components/ui/Container";

const SOCIALS = [
  {
    label: "Twitter",
    href: "https://twitter.com/nalalifeline",
    path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/nalalifeline",
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/nalalifeline",
    path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-navy text-white">
      <Container className="py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="!text-white text-lg">National Lifeline Association</h3>
            <p className="mt-2 text-sm text-white/80">
              415 McFarlan Rd #108
              <br />
              Kennett Square, PA 19348
            </p>
            <p className="mt-2 text-sm text-white/80">
              1-844-937-NALA (6252)
              <br />
              Mon–Fri, 8am–5pm ET
            </p>
          </div>

          <div>
            <h3 className="!text-white text-lg">Quick Links</h3>
            <ul className="mt-2 space-y-2 text-sm text-white/80">
              <li><Link href="/2026-conference" className="hover:text-cyan">2026 Conference</Link></li>
              <li><Link href="/shop" className="hover:text-cyan">Shop</Link></li>
              <li><Link href="/contact" className="hover:text-cyan">Contact</Link></li>
              <li><Link href="/my-account" className="hover:text-cyan">My Account</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-cyan">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="!text-white text-lg">Get in Touch</h3>
            <p className="mt-2 text-sm text-white/80">
              <a href="mailto:info@nalalifeline.org" className="hover:text-cyan">info@nalalifeline.org</a>
            </p>
            <div className="mt-4 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-cyan"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6 text-center text-sm text-white/70">
          © {new Date().getFullYear()} National Lifeline Association. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
