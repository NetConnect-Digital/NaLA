/**
 * 2026 NaLA Annual Conference content model.
 *
 * Mirrors the live shop.nalalifeline.org/2026-conference page: registration
 * tiers, sponsorship packages, and add-on sponsorships. Prices/labels/sold-out
 * states are authoritative for display here; purchasable items are wired to
 * WooCommerce products by name match where one exists (see app/2026-conference).
 *
 * NOTE: confirm cutover dates, the sponsorship feature matrix, and whether
 * funding pricing is membership-gated against the live WooCommerce config.
 */

export const CONFERENCE = {
  title: "2026 NaLA Annual Conference",
  dates: "October 21–22, 2026",
  venueCity: "West Palm Beach, FL",
  venue: "The Belgrove Resort & Spa",
  hotelUrl: "https://shop.nalalifeline.org/2026-conference/#venue",
  sponsorEmail: "sponsorships@nalalifeline.org",
  saveBanner: "SAVE NOW With Early Registration",
};

/* ------------------------------------------------------------------ */
/* Registration tiers                                                  */
/* ------------------------------------------------------------------ */

export type WindowState = "open" | "upcoming" | "closed";

export interface RegWindow {
  key: "early" | "regular" | "late";
  label: string; // card heading
  range: string; // effective-date copy
  opensLabel: string; // for the "Opens …" button when upcoming
  start: string; // ISO
  end: string; // ISO (inclusive end of day)
  funding: number;
  nonFunding: number;
}

export const REG_WINDOWS: RegWindow[] = [
  {
    key: "early",
    label: "Early Registration",
    range: "Effective June 1 – June 30",
    opensLabel: "June 1",
    start: "2026-06-01",
    end: "2026-06-30",
    funding: 599,
    nonFunding: 899,
  },
  {
    key: "regular",
    label: "Regular Registration",
    range: "Effective July 1 – September 30",
    opensLabel: "July 1",
    start: "2026-07-01",
    end: "2026-09-30",
    funding: 699,
    nonFunding: 999,
  },
  {
    key: "late",
    label: "Late Registration",
    range: "Effective October 1 – October 22",
    opensLabel: "October 1",
    start: "2026-10-01",
    end: "2026-10-22",
    funding: 799,
    nonFunding: 1099,
  },
];

export const REG_INCLUDES = [
  "Welcome Party (Wednesday, October 21)",
  "NaLA Talks & Panels (Thursday, October 22)",
  "Breakfast & Lunch (Thursday, October 22)",
];

export const FUNDING_DISCLAIMER =
  "Funding Member Pricing is reserved for NaLA members who have made regular monthly contributions to NaLA in the calendar year 2026 as an ETC Provider, a Supplier of Goods/Services to the industry, or an Independent Field Agent and Master Agent making contributions under the Agent Platform Program (APP), Master Agent Program (MAPP), Pick-Pack-Ship (PPS), or Device Suppliers Coalition (DSC) Program. Funding member pricing is also available to Government Representatives, Public Interest Groups, Industry-Based Organizations, and Industry Suppliers. Every ticket purchased will be validated for accuracy on its funding status. For more information, email info@nalalifeline.org.";

export const NON_FUNDING_DISCLAIMER =
  "Non-Funding Member Pricing is available to ETCs, Independent Field Agents, and Master Agents, or anyone else not currently making monetary contributions to the National Lifeline Association or its programs. If you would like more information on becoming a funding member of NaLA or other ticket/sponsorship options that may be available to non-funding members, email info@nalalifeline.org. If you have questions as to which ticket option is applicable to you, please email info@nalalifeline.org.";

export function windowState(w: RegWindow, now = new Date()): WindowState {
  const today = now.toISOString().slice(0, 10);
  if (today < w.start) return "upcoming";
  if (today > w.end) return "closed";
  return "open";
}

/* ------------------------------------------------------------------ */
/* Venue                                                               */
/* ------------------------------------------------------------------ */

export const VENUE = {
  city: "WEST PALM BEACH, FL",
  heading: "2026 Conference Location",
  intro:
    "We look forward to hosting this year's conference at The Belgrove Resort & Spa in West Palm Beach, FL.",
  bookingNote: "Get preferred room rates through our booking link.",
  bullets: [
    "Each room features a private balcony",
    "Exclusive guest access to Dutchman's Pipe Golf Club, a Jack Nicklaus-designed course",
    "All conference events and content will be conveniently hosted on site",
  ],
};

/* ------------------------------------------------------------------ */
/* Returning sponsors                                                  */
/* ------------------------------------------------------------------ */

export const SPONSORS: { name: string; logo: string }[] = [
  { name: "Nelson Mullins", logo: "/conference/sponsors/nelson-mullins.png" },
  { name: "PayGo Distributors", logo: "/conference/sponsors/paygo.webp" },
  { name: "enTouch Wireless", logo: "/conference/sponsors/entouch.webp" },
  { name: "XFiniti Solutions", logo: "/conference/sponsors/xfiniti.png" },
  { name: "RSG Connect", logo: "/conference/sponsors/rsg-connect.webp" },
];

/* ------------------------------------------------------------------ */
/* Sponsorship packages (comparison table)                             */
/* ------------------------------------------------------------------ */

export type TierAccent = "exhibit" | "platinum" | "premiere" | "diamond";

export type TierIcon = "user" | "bookmark" | "star" | "diamond";

export interface SponsorTier {
  key: string;
  name: string;
  available: string;
  funding: number;
  nonFunding: number;
  accent: TierAccent;
  icon: TierIcon;
  /** Perks listed top-down in this tier's column. */
  perks: string[];
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    key: "exhibit",
    name: "Exhibit Tables",
    available: "10 of 10",
    funding: 6000,
    nonFunding: 9000,
    accent: "exhibit",
    icon: "user",
    perks: [
      "Full-Page Program Ad",
      "Attendee Bag Stuffer",
      "Badge Ribbon",
      "Logo on NaLA Website",
      "Logo on Event Emails",
      "6 ft. Exhibition Table",
    ],
  },
  {
    key: "platinum",
    name: "Platinum Sponsorship",
    available: "2 of 2",
    funding: 12500,
    nonFunding: 18750,
    accent: "platinum",
    icon: "bookmark",
    perks: [
      "Full-Page Program Ad",
      "Attendee Bag Stuffer",
      "Badge Ribbon",
      "Logo on NaLA Website",
      "Logo on Event Emails",
      "Logo on Lunch Signage",
      "Logo Featured in Program",
      "Two (2) Conference Tickets",
      "1 Hotel Room - 2 Nights (Over $980 Value)",
      "Logo on Hotel Keycard Holder",
    ],
  },
  {
    key: "premiere",
    name: "Premiere Sponsorship",
    available: "2 of 2",
    funding: 15000,
    nonFunding: 22500,
    accent: "premiere",
    icon: "star",
    perks: [
      "Two Full-Page Program Ads",
      "Attendee Bag Stuffer",
      "Badge Ribbon",
      "Logo on NaLA Website",
      "Logo on Event Emails",
      "6 ft. Exhibition Table",
      "Logo Featured in Program",
      "Four (4) Conference Tickets",
      "1 Hotel Room - 2 Nights (Over $980 Value)",
      "Social Media Feature",
    ],
  },
  {
    key: "diamond",
    name: "Diamond Sponsorship",
    available: "2 of 2",
    funding: 20000,
    nonFunding: 30000,
    accent: "diamond",
    icon: "diamond",
    perks: [
      "Two Full-Page Program Ads",
      "Attendee Bag Stuffer",
      "Badge Ribbon",
      "Logo on NaLA Website",
      "Logo on Event Emails",
      "6 ft. Exhibition Table",
      "Logo Featured in Program",
      "Six (6) Conference Tickets",
      "1 Hotel Suite - 2 Nights (Over $1,910 Value)",
      "VIP Cabana at Welcome Party",
      "Social Media Feature",
      "Logo on All Event Signage",
      "Logo on All Conference Signs",
      "Logo on Conference Presentation Slides",
      "Logo on Program Cover",
      "Logo on Badge Lanyards",
      "Exclusive Headline Sponsorship",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Other (à la carte) sponsorships                                     */
/* ------------------------------------------------------------------ */

export interface AddOnSponsor {
  name: string;
  funding: number;
  nonFunding: number;
  soldOut: boolean;
  /** Featured image path under /public (falls back to a gradient if unset). */
  image?: string;
}

export const OTHER_SPONSORSHIPS: AddOnSponsor[] = [
  { name: "Welcome Party Sponsor", funding: 10000, nonFunding: 15000, soldOut: false },
  { name: "Keynote Speaker Sponsor", funding: 8000, nonFunding: 12000, soldOut: false },
  { name: "Happy Hour Sponsor", funding: 8000, nonFunding: 12000, soldOut: false },
  { name: "Photography Sponsor", funding: 6000, nonFunding: 9000, soldOut: false },
  { name: "Water Bottle Sponsor", funding: 5000, nonFunding: 7500, soldOut: false },
  { name: "Centerpiece Sponsor", funding: 5000, nonFunding: 7500, soldOut: false },
  { name: "Conference Wi-Fi Sponsor", funding: 4000, nonFunding: 6000, soldOut: true },
  { name: "Candy Table Sponsor", funding: 3000, nonFunding: 4500, soldOut: true },
  { name: "Coffee Station Sponsor", funding: 2500, nonFunding: 3750, soldOut: true },
  { name: "Gift Bag Sponsor", funding: 2000, nonFunding: 3000, soldOut: false },
  { name: "Comfort Station Sponsor", funding: 2000, nonFunding: 3000, soldOut: false },
  { name: "Conference Notepad Sponsor", funding: 2000, nonFunding: 3000, soldOut: true },
  { name: "Conference Pen Sponsor", funding: 2000, nonFunding: 3000, soldOut: true },
];

/** Whole-dollar USD formatter used across the conference UI. */
export function usd(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}
