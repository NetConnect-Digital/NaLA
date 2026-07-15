import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWcCustomer } from "@/lib/wc-admin";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProfileForm } from "@/components/auth/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account details" };

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
    <AccountLayout>
      <h2 className="text-2xl">Account details</h2>
      <p className="mt-2 text-ink-soft">Update your account details.</p>
      <div className="mt-6">
        <ProfileForm user={profile} displayName={customer?.display_name} />
      </div>
    </AccountLayout>
  );
}
