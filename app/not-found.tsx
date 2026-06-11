import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Section>
      <Container className="max-w-xl text-center">
        <p className="font-sans text-6xl font-black text-cyan">404</p>
        <h1 className="mt-2 text-3xl">Page Not Found</h1>
        <p className="mt-3 text-ink-soft">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/">Go Home</Button>
          <Button href="/shop" variant="outline">
            Browse Shop
          </Button>
        </div>
      </Container>
    </Section>
  );
}
