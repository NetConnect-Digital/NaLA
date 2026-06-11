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

        <div className="grid gap-10 md:grid-cols-2">
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
            <h1 className="text-3xl">{product.name}</h1>
            <div className="mt-3 text-2xl">
              <PriceTag prices={product.prices} className="text-2xl" />
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
                />
              )}
            </div>
          </div>
        </div>

        {product.description && (
          <div className="mt-12 max-w-3xl">
            <h2 className="text-2xl">Details</h2>
            <div
              className="prose-nala mt-4"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}
      </Container>
    </Section>
  );
}
