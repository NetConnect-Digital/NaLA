import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress";
import { Container, Section } from "@/components/ui/Container";

/** Renders a WordPress page's title + HTML content for static/legal pages. */
export async function WpPageView({ slug }: { slug: string }) {
  const page = await getPageBySlug(slug).catch(() => null);
  if (!page) notFound();

  return (
    <Section>
      <Container className="max-w-3xl">
        <h1
          className="text-4xl"
          dangerouslySetInnerHTML={{ __html: page.title.rendered }}
        />
        <div
          className="prose-nala mt-6"
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
      </Container>
    </Section>
  );
}
