"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useMemo } from "react";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/config";

/**
 * Lazily initialise Stripe.js with the publishable key. Always wraps children
 * in <Elements> — react-stripe-js supports passing a null/never-resolving
 * `stripe` prop, so billing fields stay usable even before Stripe.js loads;
 * only the actual card input (which needs a live Stripe instance) should
 * check `useStripe()`/`STRIPE_PUBLISHABLE_KEY` itself and degrade there.
 */
export function StripeProvider({ children }: { children: React.ReactNode }) {
  const stripePromise = useMemo<Promise<Stripe | null> | null>(
    () => (STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null),
    [],
  );

  return <Elements stripe={stripePromise}>{children}</Elements>;
}
