"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart-hooks";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/auth/AuthShell";

interface CheckoutResult {
  order_id?: number;
  order_key?: string;
  payment_result?: {
    payment_status: string;
    redirect_url?: string;
    payment_details?: { key: string; value: string }[];
  };
  message?: string;
}

/**
 * Headless checkout: collect billing, tokenize the card with Stripe.js, then
 * submit to the Store API checkout via our proxy. Handles the happy path and
 * 3-D Secure (requires_action) confirmation.
 */
export function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { data: cart } = useCart();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const billing_address = {
      first_name: String(fd.get("first_name") ?? ""),
      last_name: String(fd.get("last_name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address_1: String(fd.get("address_1") ?? ""),
      city: String(fd.get("city") ?? ""),
      state: String(fd.get("state") ?? ""),
      postcode: String(fd.get("postcode") ?? ""),
      country: String(fd.get("country") ?? "US"),
    };

    try {
      // 1. Create a Stripe PaymentMethod from the card field.
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card field not ready.");
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: "card",
        card,
        billing_details: {
          name: `${billing_address.first_name} ${billing_address.last_name}`.trim(),
          email: billing_address.email,
        },
      });
      if (pmError) throw new Error(pmError.message);

      // 2. Submit checkout to the Store API.
      // NOTE: payment_method id + payment_data keys are gateway-specific.
      // Verify against the installed WooCommerce Stripe Gateway with test keys.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_address,
          shipping_address: billing_address,
          payment_method: "stripe_cc",
          payment_data: [
            { key: "wc-stripe-payment-method", value: paymentMethod!.id },
            { key: "wc-stripe-is-deferred-intent", value: "true" },
          ],
        }),
      });
      const data: CheckoutResult = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Checkout failed.");

      // 3. Handle 3-D Secure if required.
      const pr = data.payment_result;
      if (pr?.payment_status === "requires_action") {
        const secret = pr.payment_details?.find((d) => /client_secret|intent/.test(d.key))?.value;
        if (secret) {
          const { error: confirmError } = await stripe.confirmCardPayment(secret);
          if (confirmError) throw new Error(confirmError.message);
        }
      }

      // 4. Success.
      const params = new URLSearchParams();
      if (data.order_id) params.set("order", String(data.order_id));
      if (data.order_key) params.set("key", data.order_key);
      router.push(`/thank-you?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  const empty = (cart?.items_count ?? 0) === 0;
  if (empty) {
    return <p className="text-ink-soft">Your cart is empty. Add an item before checking out.</p>;
  }

  return (
    <form onSubmit={placeOrder} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="first_name" label="First Name" required />
        <Field name="last_name" label="Last Name" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="email" label="Email" type="email" required />
        <Field name="phone" label="Phone" />
      </div>
      <Field name="address_1" label="Address" required />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="city" label="City" required />
        <Field name="state" label="State" required />
        <Field name="postcode" label="ZIP" required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-navy">Card Details</label>
        <div className="rounded-md border border-line px-3 py-3">
          <CardElement options={{ style: { base: { fontSize: "16px", color: "#1c1c1c" } } }} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="secondary" className="w-full" disabled={busy || !stripe}>
        {busy ? "Placing order…" : "Place Order"}
      </Button>
    </form>
  );
}
