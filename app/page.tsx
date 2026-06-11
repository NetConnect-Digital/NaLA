import Link from "next/link";
import { getProducts } from "@/lib/woocommerce";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/commerce/ProductCard";

export const revalidate = 300;

export default async function HomePage() {
  const products = await getProducts({ per_page: 6 }).catch(() => []);
  const featured = products.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white">
        <Container className="grid gap-8 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="mb-3 font-sans text-sm font-bold uppercase tracking-widest text-cyan">
              October 21–22, 2026 · West Palm Beach, FL
            </p>
            <h1 className="!text-white text-4xl leading-tight md:text-5xl">
              2026 NaLA Annual Conference
            </h1>
            <p className="mt-4 max-w-lg text-white/80">
              Join the National Lifeline Association at The Belgrove Resort &amp; Spa
              for two days of NaLA Talks, panels, and networking with the Lifeline
              community.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/2026-conference" size="lg">
                Register Now
              </Button>
              <Button
                href="/2026-conference#sponsorships"
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-navy"
              >
                Become a Sponsor
              </Button>
            </div>
          </div>
          <div className="rounded-xl bg-white/10 p-8 backdrop-blur">
            <h2 className="!text-white text-xl">Save with Early Registration</h2>
            <ul className="mt-4 space-y-3 text-white/85">
              <li className="flex justify-between border-b border-white/15 pb-2">
                <span>Funding Members (Early)</span>
                <span className="font-bold text-cyan">$599</span>
              </li>
              <li className="flex justify-between border-b border-white/15 pb-2">
                <span>Non-Funding (Early)</span>
                <span className="font-bold text-cyan">$899</span>
              </li>
              <li className="flex justify-between">
                <span>Includes</span>
                <span className="text-right text-sm">
                  Welcome Party · Talks &amp; Panels · Meals
                </span>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <Section>
        <Container>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl">Conference Registration &amp; Sponsorships</h2>
              <p className="mt-2 text-ink-soft">
                Secure your spot and showcase your brand.
              </p>
            </div>
            <Link href="/shop" className="hidden font-bold text-cyan-700 hover:underline sm:block">
              View all →
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-muted">Products are loading…</p>
          )}
        </Container>
      </Section>

      {/* CTA band */}
      <section className="bg-green-50">
        <Container className="flex flex-col items-center gap-4 py-12 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-2xl">Become a NaLA Member</h2>
            <p className="mt-1 text-ink-soft">
              Unlock funding-member pricing and exclusive benefits.
            </p>
          </div>
          <Button href="https://nalalifeline.org/membership/" variant="secondary" size="lg">
            Join NaLA
          </Button>
        </Container>
      </section>
    </>
  );
}
