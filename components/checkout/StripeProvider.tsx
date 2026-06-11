"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useMemo } from "react";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/config";

/** Lazily initialise Stripe.js with the publishable key. */
export function StripeProvider({ children }: { children: React.ReactNode }) {
  const stripePromise = useMemo<Promise<Stripe | null> | null>(
    () => (STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null),
    [],
  );

  if (!stripePromise) {
    return (
      <div className="rounded-md bg-cream p-4 text-sm text-ink-soft">
        Payments are not configured yet. Set{" "}
        <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to enable checkout.
      </div>
    );
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}
