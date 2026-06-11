import Link from "next/link";
import { cn } from "@/lib/utils";

type Color = "cyan" | "green" | "navy";

const colorClasses: Record<Color, string> = {
  cyan: "bg-cyan !text-white hover:bg-[#0096c7]",
  green: "bg-green !text-white hover:bg-[#5fae4d]",
  navy: "bg-navy !text-white hover:bg-navy-dark",
};

interface Props {
  /** Link target — typically the product's single page. */
  href?: string;
  /** Used when no `href` is resolved (e.g. backend match missing). */
  fallbackHref?: string;
  color?: Color;
  label?: string;
  /** Renders an inert, greyed-out button (sold out / not yet open). */
  disabled?: boolean;
  /** Text shown when disabled (defaults to label). */
  disabledLabel?: string;
  className?: string;
}

/**
 * Conference call-to-action. Navigates to the product's single page; renders a
 * greyed inert state for sold-out / not-yet-open tiers.
 */
export function TierButton({
  href,
  fallbackHref = "/shop",
  color = "cyan",
  label = "Add to Cart",
  disabled = false,
  disabledLabel,
  className,
}: Props) {
  const base =
    "inline-flex w-full cursor-pointer items-center justify-center rounded-full px-8 py-3 text-center font-sans text-sm font-bold uppercase tracking-wide transition-colors md:text-base";

  if (disabled) {
    return (
      <span
        aria-disabled
        className={cn(base, "cursor-not-allowed bg-line text-muted", className)}
      >
        {disabledLabel ?? label}
      </span>
    );
  }

  return (
    <Link href={href ?? fallbackHref} className={cn(base, colorClasses[color], className)}>
      {label}
    </Link>
  );
}
