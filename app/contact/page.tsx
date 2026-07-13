import { Container, Section } from "@/components/ui/Container";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with the National Lifeline Association — phone, email, and address.",
};

const mail = "font-semibold !text-cyan-700 underline hover:!text-navy";

export default function ContactPage() {
  return (
    <Section>
      <Container>
        <header className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl md:text-4xl">Have Questions?</h1>
          <p className="mt-4 text-ink-soft">
            You can contact us by filling out the form below, emailing us at{" "}
            <a href="mailto:info@nalalifeline.org" className={mail}>
              info@nalalifeline.org
            </a>
            , or giving us a call at 1-844-937-NALA.
          </p>
          <p className="mt-3 text-ink-soft">
            <strong className="text-ink">
              Have inquiries about media or want to submit membership news?
            </strong>{" "}
            Email us at{" "}
            <a href="mailto:media@nalalifeline.org" className={mail}>
              media@nalalifeline.org
            </a>
          </p>
          <p className="mt-3 text-ink-soft">
            Hours of Operation: Monday – Friday from 8am – 5pm (Eastern Time)
          </p>
        </header>

        <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
          {/* Contact form */}
          <ContactForm />

          {/* NaLA Inquiries */}
          <aside className="rounded-lg bg-green p-12 text-ink">
            <h2 className="!text-navy text-[36px]">NaLA Inquiries</h2>
            <p className="mt-5 font-semibold">1-844-937-NALA (6252)</p>
            <p className="mt-4">
              General Inquires –{" "}
              <a href="mailto:info@nalalifeline.org" className="underline hover:text-navy">
                info@nalalifeline.org
              </a>
            </p>
            <p className="mt-2">
              Media &amp; News Inquires –{" "}
              <a href="mailto:media@nalalifeline.org" className="underline hover:text-navy">
                media@nalalifeline.org
              </a>
            </p>
          </aside>
        </div>

        {/* Map */}
        <div className="mt-10 overflow-hidden rounded-lg border border-line">
          <iframe
            title="NaLA location map"
            width="100%"
            height="360"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=415+McFarlan+Rd+%23108+Kennett+Square+PA+19348&output=embed"
            className="block w-full"
          />
        </div>
      </Container>
    </Section>
  );
}
