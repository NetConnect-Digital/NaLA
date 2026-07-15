import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AccountLayout } from "@/components/account/AccountLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment methods" };

export default async function PaymentMethodsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AccountLayout>
      <h2 className="text-2xl">Payment methods</h2>
      <div className="mt-6 rounded-lg border border-line bg-white p-8 text-center">
        <p className="text-ink-soft">No saved payment methods.</p>
        <p className="mt-2 text-sm text-muted">
          Cards are entered securely at checkout and are not stored on this account.
        </p>
      </div>
    </AccountLayout>
  );
}
