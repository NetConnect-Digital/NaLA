import { Container, Section } from "@/components/ui/Container";
import { TierButton } from "./TierButton";
import { CONFERENCE, usd, type TierAccent, type TierIcon } from "@/lib/conference";
import type { TierCard } from "@/lib/conference-products";
import { cn } from "@/lib/utils";

const headerAccent: Record<TierAccent, string> = {
  exhibit: "bg-cyan",
  platinum: "bg-[#6a2c91]",
  premiere: "bg-[#8e6bc0]",
  diamond: "bg-navy",
};

const iconColor: Record<TierAccent, string> = {
  exhibit: "text-cyan",
  platinum: "text-[#6a2c91]",
  premiere: "text-[#8e6bc0]",
  diamond: "text-navy",
};

function TierIconMark({ icon, className }: { icon: TierIcon; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true,
  } as const;
  switch (icon) {
    case "user":
      return (
        <svg {...common}>
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m12 2 2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2Z" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...common}>
          <path d="M6 2h12l4 6-10 14L2 8l4-6Z" />
        </svg>
      );
  }
}

/** Colored header block (name + icon badge) shared by the table and mobile cards. */
function TierHeader({ t }: { t: TierCard }) {
  return (
    <div className={`text-white ${headerAccent[t.accent]}`}>
      <div className="px-3 pt-5 pb-3 text-center">
        <span className="block font-sans text-lg font-bold leading-tight">{t.name}</span>
      </div>
      <div className="flex justify-center bg-black/10 px-3 pb-5 pt-2">
        <div className="flex h-[86px] w-[86px] flex-col items-center justify-center rounded-full bg-white text-center shadow">
          <TierIconMark icon={t.icon} className={`h-5 w-5 ${iconColor[t.accent]}`} />
          <span className="mt-1 text-[12px] font-bold leading-tight text-ink">
            Available:
            <br />
            {t.available}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Funding / Non-Funding prices + Add-to-Cart, shared by the table and mobile cards. */
function PriceBlock({ t }: { t: TierCard }) {
  return (
    <>
      <p className="text-[16px] font-semibold text-muted">Funding Member Price</p>
      <p className="font-sans text-[24px] font-bold text-green md:text-[32px]">
        {usd(t.funding)}
      </p>
      <TierButton
        color="green"
        label="Add to Cart"
        href={t.fundingSlug ? `/product/${t.fundingSlug}` : undefined}
        fallbackHref="/shop?category=sponsorship"
        className="mt-2 w-auto px-4 py-2 text-xs md:px-5 md:text-sm"
      />
      <p className="mt-4 text-[16px] font-semibold text-muted">Non-Funding Member Price</p>
      <p className="font-sans text-[24px] font-bold text-cyan-700 md:text-[32px]">
        {usd(t.nonFunding)}
      </p>
      <TierButton
        color="cyan"
        label="Add to Cart"
        href={t.nonFundingSlug ? `/product/${t.nonFundingSlug}` : undefined}
        fallbackHref="/shop?category=sponsorship"
        className="mt-2 w-auto px-4 py-2 text-xs md:px-5 md:text-sm"
      />
    </>
  );
}

export function SponsorshipPackages({ tiers }: { tiers: TierCard[] }) {
  const rowCount = Math.max(...tiers.map((t) => t.perks.length));
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <Section id="sponsorships" className="bg-cyan-50/40">
      <Container>
        <h2 className="text-center text-[26px] pb-3 md:text-[36px]">
          NaLA Conference Sponsorship Packages
        </h2>
        <p className="mt-4 text-center text-[15px] text-ink-soft">
          Our 2026 NaLA Annual Conference sponsorship packages allow you to choose
          the best fit to showcase and promote your organization at the only
          Lifeline industry event of the year! Please email{" "}
          <a
            href={`mailto:${CONFERENCE.sponsorEmail}`}
            className="font-bold !text-[#00b9c3] hover:underline"
          >
            {CONFERENCE.sponsorEmail}
          </a>{" "}
          with questions, thank you!
        </p>
        <p className="mt-4 text-center text-[15px] italic leading-relaxed text-ink-soft">
          *&ldquo;Funding&rdquo; Sponsorship packages are reserved for funding NaLA
          members who have made regular monthly contributions to NaLA in the
          calendar year 2026 as an ETC, a Supplier of Goods/Services to the
          Industry, or as Independent Field Agents and Master Agents making
          contributions under the Agent Platform Program (APP), Master Agent
          Program (MAPP), Pick Pack Ship (PPS), or Device Suppliers Coalition (DSC)
          Program. All other attendees must purchase &ldquo;Non-Funding&rdquo;
          Sponsorship packages.{" "}
          <strong>We will verify your funding status before processing the order.</strong>{" "}
          Please note that opportunities are limited and are on a first-come,
          first-served basis.
        </p>

        {/* Desktop: comparison table */}
        <div className="mt-10 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] border-separate border-spacing-0 bg-white">
            <thead>
              <tr>
                {tiers.map((t) => (
                  <th key={t.key} className="w-1/4 p-0 align-top">
                    <TierHeader t={t} />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-[#ededed]" : "bg-white"}>
                  {tiers.map((t) => (
                    <td
                      key={t.key}
                      className="border-r border-line px-3 py-2.5 text-center align-middle text-[13px] text-slate last:border-r-0"
                    >
                      {t.perks[i] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Pricing + CTA row */}
              <tr className="bg-white">
                {tiers.map((t) => (
                  <td
                    key={t.key}
                    className="border-r border-line px-3 py-6 text-center align-top last:border-r-0"
                  >
                    <PriceBlock t={t} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile: one vertical card per tier */}
        <div className="mt-8 space-y-6 md:hidden">
          {tiers.map((t) => (
            <div key={t.key} className="overflow-hidden rounded-lg border border-line">
              <TierHeader t={t} />
              <ul>
                {t.perks.map((perk, i) => (
                  <li
                    key={`${perk}-${i}`}
                    className={cn(
                      "px-4 py-2.5 text-center text-[13px] text-slate",
                      i % 2 === 0 ? "bg-[#ededed]" : "bg-white",
                    )}
                  >
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="px-4 py-6 text-center">
                <PriceBlock t={t} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
