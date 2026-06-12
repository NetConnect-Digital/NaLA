import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { PriceTag } from "./PriceTag";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images[0];
  const soldOut = !product.is_in_stock || !product.is_purchasable;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-cyan-50">
          {img ? (
            <Image
              src={img.src}
              alt={img.alt || product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              No image
            </div>
          )}
          {soldOut && (
            <span className="absolute left-3 top-3 rounded bg-navy px-2 py-1 text-xs font-bold text-white">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.categories[0] && (
          <span className="mb-1 text-xs font-bold uppercase tracking-wide text-cyan-700">
            {product.categories[0].name}
          </span>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 text-[18px] leading-snug hover:text-cyan-700">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <PriceTag prices={product.prices} />
          {soldOut ? (
            <span className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-line px-4 py-2 font-sans text-xs font-bold uppercase tracking-wide text-muted md:px-5 md:text-sm">
              Sold Out
            </span>
          ) : (
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-cyan px-4 py-2 font-sans text-xs font-bold uppercase tracking-wide !text-white transition-colors hover:bg-[#0096c7] md:px-5 md:text-sm"
            >
              {product.has_options ? "Select options" : "Add to Cart"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
