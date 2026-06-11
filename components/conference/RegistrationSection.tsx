import { Container, Section } from "@/components/ui/Container";
import { TierButton } from "./TierButton";
import { windowState, usd, type RegWindow } from "@/lib/conference";

function MailLink() {
  return (
    <a
      href="mailto:info@nalalifeline.org"
      className="font-semibold !text-[#00b9c3] hover:underline"
    >
      info@nalalifeline.org
    </a>
  );
}

const FUNDING_DISCLAIMER = (
  <>
    <strong>
      Funding Member Pricing is reserved for NaLA members who have made regular
      monthly contributions to NaLA in the calendar year 2026
    </strong>{" "}
    as an ETC Provider, a Supplier of Goods/Services to the Industry, or as
    Independent Field Agents and Master Agents making contributions under the
    Agent Platform Program (APP), Master Agent Program (MAPP), Pick Pack Ship
    (PPS), or Device Suppliers Coalition (DSC) Program. Funding member pricing is
    also made available to Government Representatives, Public Interest Groups,
    Community Based Organizations, and Industry Supporters.{" "}
    <strong>
      Every ticket purchased will be validated for accuracy on its funding
      status. For more information, email
    </strong>{" "}
    <MailLink />.
  </>
);

const NON_FUNDING_DISCLAIMER = (
  <>
    Non-Funding Member Pricing is available to ETCs, Independent Field Agents, and
    Master Agents, or anyone else not currently making regular monetary
    contributions to the National Lifeline Association or its programs. If you
    would like more information on becoming a funding member of NaLA or other
    ticket/sponsorship options that may be available to non-funding members,
    email <MailLink />.{" "}
    <strong>
      If you have questions as to which ticket option is applicable to you,
      please email
    </strong>{" "}
    <MailLink />.
  </>
);

interface TicketRef {
  id: number;
  is_in_stock: boolean;
  is_purchasable: boolean;
  /** Live current price from the product (applies to the active window). */
  price?: number;
  /** Product slug for the single-page link. */
  slug?: string;
}

function PriceCard({
  window: w,
  headerClass,
  accentClass,
  price,
  href,
  includes,
}: {
  window: RegWindow;
  headerClass: string;
  accentClass: string;
  price: number;
  href?: string;
  includes: string[];
}) {
  const state = windowState(w);
  const open = state === "open";

  return (
    <div className="flex flex-col overflow-hidden bg-[#f1f1f1]">
      <div className={`px-5 py-4 text-center text-white ${headerClass}`}>
        <h4 className="!text-white font-sans text-lg font-bold">{w.label}</h4>
      </div>

      <div className="flex flex-1 flex-col pb-5 pt-5 text-center">
        <div className="px-5">
          <p className={`font-sans text-4xl font-bold md:text-5xl ${accentClass}`}>{usd(price)}</p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">{w.range}</p>
        </div>

        <ul className="mt-5 text-center">
          {includes.map((inc) => (
            <li
              key={inc}
              className="px-5 py-2.5 text-[13px] text-slate odd:bg-[#e8e8e8] even:bg-[#f3f3f3]"
            >
              {inc}
            </li>
          ))}
        </ul>

        <div className="mt-5 px-5">
          <TierButton
            color="cyan"
            label="Register Now"
            disabled={!open}
            disabledLabel={state === "upcoming" ? `Opens ${w.opensLabel}` : "Closed"}
            href={open ? href : undefined}
            fallbackHref="/shop?category=ticket"
            className="w-auto py-3"
          />
        </div>
      </div>
    </div>
  );
}

function PricingGroup({
  title,
  tier,
  headerClass,
  accentClass,
  windows,
  includes,
  product,
  disclaimer,
  divider = false,
}: {
  title: string;
  tier: "funding" | "nonFunding";
  headerClass: string;
  accentClass: string;
  windows: RegWindow[];
  includes: string[];
  product?: TicketRef;
  disclaimer: React.ReactNode;
  divider?: boolean;
}) {
  const href = product?.slug ? `/product/${product.slug}` : undefined;

  return (
    <div className="mt-6 first:mt-0">
      <h3 className="text-center text-2xl font-bold !text-[#00b9c3]">{title}</h3>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {windows.map((w) => {
          const basePrice = tier === "funding" ? w.funding : w.nonFunding;
          // The active window uses the live product price when available.
          const price =
            windowState(w) === "open" && product?.price != null
              ? product.price
              : basePrice;
          return (
            <PriceCard
              key={w.key}
              window={w}
              headerClass={headerClass}
              accentClass={accentClass}
              price={price}
              href={href}
              includes={includes}
            />
          );
        })}
      </div>
      <p className="mt-5 py-6 text-center text-[13px] leading-relaxed text-ink-soft">{disclaimer}</p>
      {divider && <hr className="border-t border-line" />}
    </div>
  );
}

export function RegistrationSection({
  windows,
  includes,
  fundingTicket,
  nonFundingTicket,
}: {
  windows: RegWindow[];
  includes: string[];
  fundingTicket?: TicketRef;
  nonFundingTicket?: TicketRef;
}) {
  return (
    <Section id="registration" className="bg-white">
      <Container>
        <h2 className="text-center text-[26px] md:text-[36px]">
          Register for the 2026 NaLA Annual Conference
        </h2>

        <PricingGroup
          title="Funding Member Pricing"
          tier="funding"
          headerClass="bg-[#6a2c91]"
          accentClass="text-[#6a2c91]"
          windows={windows}
          includes={includes}
          product={fundingTicket}
          disclaimer={FUNDING_DISCLAIMER}
          divider
        />

        <PricingGroup
          title="Non-Funding Member Pricing"
          tier="nonFunding"
          headerClass="bg-navy"
          accentClass="text-navy"
          windows={windows}
          includes={includes}
          product={nonFundingTicket}
          disclaimer={NON_FUNDING_DISCLAIMER}
        />
      </Container>
    </Section>
  );
}
