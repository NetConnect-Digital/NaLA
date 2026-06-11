import { Container, Section } from "@/components/ui/Container";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with the National Lifeline Association — phone, email, and address.",
};

export default function ContactPage() {
  return (
    <Section>
      <Container>
        <h1 className="text-4xl">Contact Us</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Have a question about the conference, membership, or sponsorships? Reach
          out and our team will get back to you.
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <InfoBlock title="Phone" lines={["1-844-937-NALA (6252)", "Mon–Fri, 8am–5pm ET"]} />
            <InfoBlock
              title="Email"
              lines={["info@nalalifeline.org", "media@nalalifeline.org"]}
            />
            <InfoBlock
              title="Address"
              lines={["415 McFarlan Rd #108", "Kennett Square, PA 19348"]}
            />
            <div className="overflow-hidden rounded-lg border border-line">
              <iframe
                title="NaLA location map"
                width="100%"
                height="260"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=415+McFarlan+Rd+%23108+Kennett+Square+PA+19348&output=embed"
              />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
            <h2 className="text-2xl">Send a Message</h2>
            <p className="mb-4 mt-1 text-sm text-muted">
              All fields marked with * are required.
            </p>
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border-l-4 border-green bg-green-50 p-4">
      <h3 className="text-lg">{title}</h3>
      {lines.map((l) => (
        <p key={l} className="text-ink-soft">
          {l}
        </p>
      ))}
    </div>
  );
}
