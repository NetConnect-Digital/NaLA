"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";

interface PayResult {
  status?: "succeeded" | "requires_action" | "paid_unrecorded";
  client_secret?: string;
  payment_intent_id?: string;
  message?: string;
}

/**
 * In-app payment for an existing WooCommerce order. Tokenises the card, posts
 * to /api/orders/[id]/pay, and completes any 3-D Secure step before the server
 * marks the order paid.
 */
export function OrderPayForm({
  orderId,
  amountLabel,
}: {
  orderId: number;
  amountLabel: string;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function pay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError("");

    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card field not ready.");

      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: "card",
        card,
      });
      if (pmError) throw new Error(pmError.message);

      // Phase 1: create + confirm the PaymentIntent server-side.
      let res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method_id: paymentMethod!.id }),
      });
      let data: PayResult = await res.json();
      if (!res.ok && data.status !== "requires_action") {
        throw new Error(data.message ?? "Payment failed.");
      }

      // Phase 2: clear 3-D Secure, then finalise server-side.
      if (data.status === "requires_action" && data.client_secret) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          data.client_secret,
        );
        if (confirmError) throw new Error(confirmError.message);

        res = await fetch(`/api/orders/${orderId}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_intent_id: data.payment_intent_id }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Payment failed.");
      }

      // Success → back to the order, now marked paid.
      router.push(`/my-account/orders/${orderId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={pay} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-bold text-navy">Card Details</label>
        <div className="rounded-md border border-line bg-white px-3 py-3">
          <CardElement options={{ style: { base: { fontSize: "16px", color: "#1c1c1c" } } }} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="secondary" className="w-full" disabled={busy || !stripe}>
        {busy ? "Processing…" : `Pay ${amountLabel}`}
      </Button>

      <p className="text-xs text-muted">Payments are securely processed by Stripe.</p>
    </form>
  );
}
