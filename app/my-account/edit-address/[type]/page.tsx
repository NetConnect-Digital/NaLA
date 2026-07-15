import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWcCustomer } from "@/lib/wc-admin";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AddressForm } from "@/components/account/AddressForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Address" };

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { type } = await params;
  if (type !== "billing" && type !== "shipping") notFound();

  const customer = await getWcCustomer(user.id).catch(() => null);
  const address = (type === "billing" ? customer?.billing : customer?.shipping) ?? {};
  const heading = type === "billing" ? "Billing address" : "Shipping address";

  return (
    <AccountLayout>
      <nav className="mb-4 text-sm text-muted">
        <Link href="/my-account/edit-address" className="hover:text-cyan-700">
          Addresses
        </Link>{" "}
        / {heading}
      </nav>

      <h2 className="text-2xl">{heading}</h2>
      <p className="mt-2 text-ink-soft">
        This address will be used on the checkout page by default.
      </p>

      <div className="mt-6">
        <AddressForm type={type} address={address} />
      </div>
    </AccountLayout>
  );
}
