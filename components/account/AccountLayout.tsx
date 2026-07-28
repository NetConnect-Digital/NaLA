import { getCurrentUser } from "@/lib/auth";
import { getWcCustomer } from "@/lib/wc-admin";
import { Container, Section } from "@/components/ui/Container";
import { AccountSidebar } from "./AccountSidebar";

export async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const customer = user ? await getWcCustomer(user.id).catch(() => null) : null;
  const name =
    customer?.display_name ||
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ").trim() ||
    user?.name ||
    "Member";
  const email = customer?.email ?? user?.email ?? "";

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
