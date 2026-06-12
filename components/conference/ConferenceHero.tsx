import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { CONFERENCE } from "@/lib/conference";

/** NaLA conference emblem — ring of stars around the striped map mark. */
function Emblem() {
  return (
    <Image
      src="/conference/conference-emblem.png"
      alt="NaLA 2026 Annual Conference emblem"
      width={240}
      height={240}
      loading="eager"
      className="h-[120px] w-[120px] shrink-0 md:h-[240px] md:w-[240px]"
    />
  );
}

export function ConferenceHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#5b2c8f] via-[#37409c] to-[#0a4f96] text-white">
      {/* Hero photo + gradient (baked into the asset); gradient above is the fallback */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://shop.nalalifeline.org/wp-content/uploads/sites/3/2026/05/2026-Conference-Gradient-Background-W-Img.jpg)" }}
        aria-hidden
      />

      {/* Decorative radiating swoosh, anchored to the top-right corner */}
      <div
        className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 scale-x-[-1] bg-right-bottom bg-contain bg-no-repeat opacity-90 md:-top-12 md:bottom-auto md:h-[30rem] md:w-[30rem] md:bg-right-top"
        style={{ backgroundImage: "url(https://shop.nalalifeline.org/wp-content/uploads/sites/3/2026/05/Stars-and-Stripes.png)" }}
        aria-hidden
      />

      <Container className="relative py-8 md:py-12">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-center md:gap-10 md:text-left">
          <Emblem />
          <div>
            <p className="font-sans text-6xl font-black leading-none tracking-tight md:text-8xl">
              2026
            </p>
            <h1 className="!text-white mt-1 font-sans !font-normal text-3xl leading-tight md:text-5xl">
              NaLA Annual <br /> Conference
            </h1>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4 md:mt-10">
          <Link
            href="#registration"
            className="inline-flex items-center gap-2 rounded-full bg-cyan px-8 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white md:text-base transition-colors hover:bg-cyan-700"
          >
            Tickets
            <svg className="hidden md:inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
          <Link
            href="#sponsorships"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white md:text-base transition-colors hover:bg-white hover:!text-navy"
          >
            Sponsorships
            <svg className="hidden md:inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </Container>

      {/* Save-now banner */}
      <div className="relative bg-[#00B9C3] py-5 text-center md:py-6">
        <p className="font-sans text-base font-bold uppercase tracking-wide text-white md:text-2xl">
          {CONFERENCE.saveBanner}
        </p>
      </div>
    </section>
  );
}
