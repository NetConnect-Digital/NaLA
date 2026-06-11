import { getProducts } from "@/lib/woocommerce";
import {
  buildAddOnCards,
  buildTierCards,
  buildRegWindows,
  buildIncludes,
  priceToNumber,
} from "@/lib/conference-products";
import type { Product } from "@/lib/types";
import { ConferenceHero } from "@/components/conference/ConferenceHero";
import { SponsorLogos } from "@/components/conference/SponsorLogos";
import { ConferenceLocation } from "@/components/conference/ConferenceLocation";
import { RegistrationSection } from "@/components/conference/RegistrationSection";
import { SponsorshipPackages } from "@/components/conference/SponsorshipPackages";
import { OtherSponsorships } from "@/components/conference/OtherSponsorships";

// Always fetch fresh from WooCommerce so backend edits show up immediately.
export const revalidate = 0;

export const metadata = {
  title: "2026 NaLA Annual Conference",
  description:
    "Register for the 2026 NaLA Annual Conference at The Belgrove Resort & Spa, West Palm Beach — October 21–22, 2026. Tickets and sponsorship packages.",
};

export default async function ConferencePage() {
  const products = await getProducts({ per_page: 100 }, { revalidate: 0 }).catch(
    () => [],
  );

  const tickets = products.filter((p) =>
    p.categories.some((c) => c.slug === "ticket"),
  );

  const ticketRef = (p?: Product) =>
    p
      ? {
          id: p.id,
          is_in_stock: p.is_in_stock,
          is_purchasable: p.is_purchasable,
          price: priceToNumber(p),
          slug: p.slug,
        }
      : undefined;

  const fundingTicket = ticketRef(
    tickets.find((p) => /funding/i.test(p.name) && !/non-?funding/i.test(p.name)),
  );
  const nonFundingTicket = ticketRef(
    tickets.find((p) => /non-?funding/i.test(p.name)),
  );

  const otherSponsors = buildAddOnCards(products);
  const tiers = buildTierCards(products);
  const regWindows = buildRegWindows(products);
  const regIncludes = buildIncludes(products);

  return (
    <>
      <ConferenceHero />
      <SponsorLogos />
      <ConferenceLocation />
      <RegistrationSection
        windows={regWindows}
        includes={regIncludes}
        fundingTicket={fundingTicket}
        nonFundingTicket={nonFundingTicket}
      />
      <SponsorshipPackages tiers={tiers} />
      <OtherSponsorships items={otherSponsors} />
    </>
  );
}
