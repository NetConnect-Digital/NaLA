import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getWcCustomer } from "@/lib/wc-admin";
import { Container, Section } from "@/components/ui/Container";
import { ProfileForm } from "@/components/auth/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Prefill from the WooCommerce customer record when the API keys are set.
  const customer = await getWcCustomer(user.id).catch(() => null);
  const profile = {
    ...user,
    first_name: customer?.first_name ?? user.first_name,
    last_name: customer?.last_name ?? user.last_name,
    email: customer?.email ?? user.email,
  };

  return (
    <Section>
      <Container>
        <nav className="mb-4 text-sm text-muted">
          <Link href="/my-account" className="hover:text-cyan-700">
            My Account
          </Link>{" "}
          / Edit Profile
        </nav>
        <h1 className="text-3xl md:text-4xl">Edit Profile</h1>
        <p className="mt-2 text-ink-soft">Update your account details.</p>
        <div className="mt-8">
          <ProfileForm user={profile} />
        </div>
      </Container>
    </Section>
  );
}
