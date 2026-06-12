import type { ProductPrices } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Renders a product price (incl. on-sale + price-range) using Store API price data. */
export function PriceTag({
  prices,
  className,
}: {
  prices: ProductPrices;
  className?: string;
}) {
  const opts = {
    minorUnit: prices.currency_minor_unit,
    prefix: prices.currency_prefix || prices.currency_symbol || "$",
    suffix: prices.currency_suffix || "",
  };

  if (prices.price_range) {
    return (
      <span className={cn("font-sans text-[22px] font-bold text-[#8ac87b]", className)}>
        {formatPrice(prices.price_range.min_amount, opts)} –{" "}
        {formatPrice(prices.price_range.max_amount, opts)}
      </span>
    );
  }

  const onSale =
    prices.sale_price &&
    prices.regular_price &&
    prices.sale_price !== prices.regular_price;

  return (
    <span className={cn("font-sans text-[22px] font-bold text-[#8ac87b]", className)}>
      {onSale && (
        <span className="mr-2 font-normal text-muted line-through">
          {formatPrice(prices.regular_price, opts)}
        </span>
      )}
      {formatPrice(prices.price, opts)}
    </span>
  );
}
