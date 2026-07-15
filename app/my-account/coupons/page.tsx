import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AccountLayout } from "@/components/account/AccountLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AccountLayout>
      <h2 className="text-2xl">Coupons</h2>
      <div className="mt-6 rounded-lg border border-line bg-white p-8 text-center">
        <p className="text-ink-soft">You have no available coupons at this time.</p>
        <p className="mt-2 text-sm text-muted">
          Any coupons issued to your account will appear here and can be applied at checkout.
        </p>
      </div>
    </AccountLayout>
  );
}
