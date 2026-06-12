import Link from "next/link";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Thank You" };

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <Section>
      <Container className="max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#88cc77" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl">Thank You for Registering!</h1>
        <p className="mt-3 text-ink-soft">
          Your order has been received{order ? <> — confirmation <strong>#{order}</strong></> : ""}.
          A receipt has been emailed to you.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/my-account">View My Account</Button>
          <Button href="/2026-conference" variant="outline">
            Back to Conference
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted">
          Questions? <Link href="/contact" className="text-cyan-700 hover:underline">Contact us</Link>.
        </p>
      </Container>
    </Section>
  );
}
