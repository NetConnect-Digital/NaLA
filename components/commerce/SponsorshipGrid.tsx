import Link from "next/link";
import type { Product } from "@/lib/types";
import { PriceTag } from "./PriceTag";
import { AddToCart } from "./AddToCart";
import { stripHtml } from "@/lib/utils";

/** Grid of sponsorship products from the Store API, with SOLD OUT states. */
export function SponsorshipGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="text-muted">Sponsorship options coming soon.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const soldOut = !p.is_in_stock || !p.is_purchasable;
        return (
          <div
            key={p.id}
            className="flex flex-col rounded-lg border border-line bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <Link href={`/product/${p.slug}`}>
                <h3 className="text-lg leading-snug hover:text-cyan-700">{p.name}</h3>
              </Link>
              {soldOut && (
                <span className="shrink-0 rounded bg-navy px-2 py-0.5 text-xs font-bold text-white">
                  Sold Out
                </span>
              )}
            </div>
            {p.short_description && (
              <p className="mt-2 line-clamp-4 text-sm text-ink-soft">
                {stripHtml(p.short_description)}
              </p>
            )}
            <div className="mt-auto flex items-center justify-between pt-4">
              <PriceTag prices={p.prices} className="text-lg" />
              {p.has_options ? (
                <Link
                  href={`/product/${p.slug}`}
                  className="text-sm font-bold text-cyan-700 hover:underline"
                >
                  Options →
                </Link>
              ) : (
                <AddToCart productId={p.id} disabled={soldOut} label="Sponsor" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
