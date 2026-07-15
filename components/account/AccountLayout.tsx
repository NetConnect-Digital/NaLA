import { getCurrentUser } from "@/lib/auth";
import { Container, Section } from "@/components/ui/Container";
import { AccountSidebar } from "./AccountSidebar";

/**
 * Shared My Account shell: a soft, modern sidebar on the left and the page
 * content on the right. Fetches the current user so the sidebar can show a
 * profile block (auth is already enforced by each page).
 */
export async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const name = user?.first_name || user?.name || "Member";
  const email = user?.email ?? "";

  return (
    <Section className="bg-[#f6f8fa]">
      <Container>
        <div className="grid items-start gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-24">
            <AccountSidebar name={name} email={email} />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </Section>
  );
}
