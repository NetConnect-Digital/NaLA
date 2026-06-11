import Image from "next/image";
import { Container, Section } from "@/components/ui/Container";
import { SPONSORS } from "@/lib/conference";

/** "Thank you to our sponsors" logo band. */
export function SponsorLogos() {
  return (
    <Section className="bg-white">
      <Container>
        <h2 className="text-center text-[26px] md:text-[36px]">
          Thank You To Our 2026 NaLA Annual Conference Sponsors
        </h2>
        <ul className="mt-6 grid grid-cols-2 place-items-center gap-6 md:mt-10 md:flex md:flex-nowrap md:items-center md:justify-center md:gap-x-8 md:overflow-x-auto">
          {SPONSORS.map((s) => (
            <li key={s.name} className="shrink-0">
              <Image
                src={s.logo}
                alt={s.name}
                width={400}
                height={200}
                className="h-[64px] w-auto object-contain md:h-[100px]"
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
