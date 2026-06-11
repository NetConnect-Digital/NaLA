import { Container, Section } from "@/components/ui/Container";
import { CONFERENCE, VENUE } from "@/lib/conference";
import { VenueSlider } from "./VenueSlider";

export function ConferenceLocation() {
  return (
    <Section id="venue" className="bg-cyan-50/40">
      <Container className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="font-sans text-base font-bold uppercase tracking-widest text-[#8051a7]">
            {VENUE.city}
          </p>
          <h2 className="mt-2 mb-2 text-[26px] md:text-[36px]">{VENUE.heading}</h2>
          <p className="mt-4 text-ink-soft">
            {VENUE.intro.replace(
              "The Belgrove Resort & Spa",
              CONFERENCE.venue,
            )}
          </p>
          <p className="mt-3">
            <a
              href={CONFERENCE.hotelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold !text-[#0be] underline hover:!text-navy"
            >
              {VENUE.bookingNote}
            </a>
          </p>
          <ul className="mt-4 space-y-2">
            {VENUE.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-[15px] text-ink-soft">
                <span className="mt-0.5 shrink-0 text-cyan-700">•</span>
                {b}
              </li>
            ))}
          </ul>
          <a
            href={CONFERENCE.hotelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center rounded-full bg-cyan px-8 py-3 font-sans text-sm font-bold uppercase tracking-wide !text-white transition-colors hover:bg-cyan-700 md:text-base"
          >
            Book Room
          </a>
        </div>

        {/* Resort image slider */}
        <VenueSlider />
      </Container>
    </Section>
  );
}
