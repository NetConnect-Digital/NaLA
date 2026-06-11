import { Container, Section } from "@/components/ui/Container";

export default function Loading() {
  return (
    <Section>
      <Container>
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-2/3 rounded bg-line" />
          <div className="h-4 w-1/2 rounded bg-line" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-line/60" />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
