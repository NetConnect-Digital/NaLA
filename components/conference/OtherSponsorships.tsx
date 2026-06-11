import Image from "next/image";
import { Container, Section } from "@/components/ui/Container";
import { TierButton } from "./TierButton";
import { usd } from "@/lib/conference";
import type { AddOnCard } from "@/lib/conference-products";
import { cn } from "@/lib/utils";

function SponsorCard({ item }: { item: AddOnCard }) {
  const { name, funding, nonFunding, soldOut, image, fundingSlug, nonFundingSlug } = item;
  return (
    <div className="flex flex-col overflow-hidden bg-[#f1f1f1]">
      {/* Featured image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-navy/80 to-cyan/70">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={cn("object-cover", soldOut && "opacity-60")}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
        )}
        {soldOut && (
          <span className="absolute right-2 top-2 rounded bg-navy/90 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            Sold Out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 text-center md:p-4">
        <h3 className="pt-2 text-[15px] leading-snug md:text-[20px]">{name}</h3>

        <div className="mt-auto pt-4">
          <p className="text-[12px] font-semibold text-muted md:text-[16px]">Funding Member Price</p>
          <p className={cn("font-sans text-[18px] font-bold md:text-[32px]", soldOut ? "text-muted" : "text-green")}>
            {usd(funding)}
          </p>
          <TierButton
            color="green"
            label="Add to Cart"
            href={fundingSlug ? `/product/${fundingSlug}` : undefined}
            disabled={soldOut}
            disabledLabel="Sold Out"
            fallbackHref="/shop?category=sponsorship"
            className="mt-2 w-auto px-4 py-2 text-xs md:px-5 md:text-sm"
          />

          <p className="mt-4 text-[12px] font-semibold text-muted md:text-[16px]">Non-Funding Member Price</p>
          <p className={cn("font-sans text-[18px] font-bold md:text-[32px]", soldOut ? "text-muted" : "text-cyan-700")}>
            {usd(nonFunding)}
          </p>
          <TierButton
            color="cyan"
            label="Add to Cart"
            href={nonFundingSlug ? `/product/${nonFundingSlug}` : undefined}
            disabled={soldOut}
            disabledLabel="Sold Out"
            fallbackHref="/shop?category=sponsorship"
            className="mt-2 w-auto px-4 py-2 text-xs md:px-5 md:text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export function OtherSponsorships({ items }: { items: AddOnCard[] }) {
  return (
    <Section className="bg-white md:pt-0">
      <Container>
        <h2 className="text-center text-[26px] md:text-[36px]">
          Other Sponsorship Opportunities
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] text-ink-soft">
          Looking for more ways to promote your organization at the 2026 NaLA
          Annual Conference? Check out our other sponsorship options!
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:mt-10 md:gap-6 lg:grid-cols-4">
          {items.map((item) => (
            <SponsorCard key={item.name} item={item} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
