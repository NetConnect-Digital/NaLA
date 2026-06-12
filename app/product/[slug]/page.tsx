import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/woocommerce";
import { Container, Section } from "@/components/ui/Container";
import { PriceTag } from "@/components/commerce/PriceTag";
import { AddToCart } from "@/components/commerce/AddToCart";
import { stripHtml } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: stripHtml(product.short_description).slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  const img = product.images[0];
  const soldOut = !product.is_in_stock || !product.is_purchasable;

  return (
    <Section>
      <Container>
        <nav className="mb-6 text-sm text-muted">
          <Link href="/shop" className="hover:text-cyan-700">
            Shop
          </Link>
          {product.categories[0] && (
            <>
              {" / "}
              <Link
                href={`/shop?category=${product.categories[0].slug}`}
                className="hover:text-cyan-700"
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-cyan-50">
            {img ? (
              <Image
                src={img.src}
                alt={img.alt || product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                No image
              </div>
            )}
          </div>

          <div>
            <h1 className="text-[26px] md:text-[36px]">{product.name}</h1>
            <div className="mt-3 text-2xl">
              <PriceTag prices={product.prices} className="text-2xl text-[#8ac87b]" />
            </div>

            {product.short_description && (
              <div
                className="prose-nala mt-4 text-ink-soft"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            <div className="mt-6">
              {product.has_options ? (
                <p className="rounded-md bg-cream p-4 text-sm text-ink-soft">
                  This product has options. Please complete your selection on the
                  original site or contact us to configure variations.
                </p>
              ) : (
                <AddToCart
                  productId={product.id}
                  disabled={soldOut}
                  withQuantity={!product.sold_individually}
                  variant="secondary"
                  buttonClassName="bg-[#01c0e1] uppercase hover:bg-[#01a8c5]"
                  redirectTo="/cart"
                />
              )}
            </div>

            {(product.categories.length > 0 || product.tags?.length > 0) && (
              <div className="mt-6 space-y-1.5 border-t border-line pt-4 text-[15px]">
                {product.categories.length > 0 && (
                  <p className="text-muted">
                    <span className="font-semibold text-ink">Category:</span>{" "}
                    {product.categories.map((c, i) => (
                      <span key={c.id}>
                        <Link
                          href={`/shop?category=${c.slug}`}
                          className="!text-[#1dc2ef] hover:underline"
                        >
                          {c.name}
                        </Link>
                        {i < product.categories.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                )}
                {product.tags?.length > 0 && (
                  <p className="text-muted">
                    <span className="font-semibold text-ink">Tags:</span>{" "}
                    {product.tags.map((t, i) => (
                      <span key={t.id}>
                        <Link
                          href={`/shop?search=${encodeURIComponent(t.name)}`}
                          className="!text-[#1dc2ef] hover:underline"
                        >
                          {t.name}
                        </Link>
                        {i < product.tags.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {product.description && (
          <section className="mt-10 w-full md:mt-16">
            <div className="overflow-hidden rounded-lg border border-line bg-[#f7f9fb]">
              <div className="border-b border-line bg-white px-5 py-4 md:px-7">
                <h2 className="text-[22px] leading-none !text-[#00b9c3] md:text-[30px]">Details</h2>
              </div>
              <div
                className="prose-nala px-5 py-5 text-ink-soft md:px-7 md:py-6"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </section>
        )}
      </Container>
    </Section>
  );
}
