import Link from "next/link";
import { getProducts, getCategories } from "@/lib/woocommerce";
import { Container, Section } from "@/components/ui/Container";
import { ProductCard } from "@/components/commerce/ProductCard";

export const revalidate = 300;

export const metadata = {
  title: "Shop",
  description: "Browse all NaLA conference registrations, sponsorships, and products.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ category, per_page: 100 }).catch(() => []),
    getCategories().catch(() => []),
  ]);

  return (
    <Section>
      <Container>
        <header className="mb-8">
          <h1 className="text-4xl">Shop</h1>
          <p className="mt-2 text-ink-soft">
            Conference registration, sponsorships, and more.
          </p>
        </header>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/shop"
            className={`rounded-full border px-4 py-1.5 text-sm font-bold ${
              !category
                ? "border-navy bg-navy text-white"
                : "border-line text-navy hover:bg-cyan-50"
            }`}
          >
            All
          </Link>
          {categories
            .filter((c) => (c.count ?? 0) > 0)
            .map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className={`rounded-full border px-4 py-1.5 text-sm font-bold ${
                  category === c.slug
                    ? "border-navy bg-navy text-white"
                    : "border-line text-navy hover:bg-cyan-50"
                }`}
              >
                {c.name}
              </Link>
            ))}
        </div>

        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-muted">No products found.</p>
        )}
      </Container>
    </Section>
  );
}
