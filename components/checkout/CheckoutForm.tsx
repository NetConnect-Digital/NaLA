"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart-hooks";
import { Button } from "@/components/ui/Button";
import { COUNTRIES } from "@/lib/countries";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/config";
import { formatPrice } from "@/lib/utils";

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

function TextField({
  name,
  label,
  type = "text",
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-navy">
        {label}
        {required && <span className="text-red-600"> *</span>}
        {!required && <span className="text-muted"> (optional)</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-cyan"
      />
    </label>
  );
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const stripeConfigured = Boolean(STRIPE_PUBLISHABLE_KEY);

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripeConfigured || !stripe || !elements) return;
    setBusy(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const billing_address = {
      first_name: String(fd.get("first_name") ?? ""),
      last_name: String(fd.get("last_name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      company: String(fd.get("company") ?? ""),
      address_1: String(fd.get("address_1") ?? ""),
      address_2: String(fd.get("address_2") ?? ""),
      city: String(fd.get("city") ?? ""),
      state: String(fd.get("state") ?? ""),
      postcode: String(fd.get("postcode") ?? ""),
      country: String(fd.get("country") ?? "US"),
    };
    const customer_note = String(fd.get("customer_note") ?? "");

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
          customer_note,
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

  const canSubmit = stripeConfigured && Boolean(stripe) && agreedToTerms;

  return (
    <form onSubmit={placeOrder} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-xl font-bold text-navy">Billing details</h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="first_name" label="First name" required />
              <TextField name="last_name" label="Last name" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="phone" label="Phone" />
              <TextField name="email" label="Email address" type="email" required />
            </div>
            <TextField name="company" label="Company name" />
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-navy">
                Country <span className="text-red-600">*</span>
              </span>
              <select
                name="country"
                required
                defaultValue="US"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-cyan"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="address_1" label="Street address" required />
              <TextField name="address_2" label="Apartment, suite, unit etc." />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField name="city" label="Town / City" required />
              <TextField name="state" label="State" />
              <TextField name="postcode" label="Postcode / ZIP" required />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-bold text-navy">Additional information</h3>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-navy">Order notes</span>
            <textarea
              name="customer_note"
              rows={4}
              placeholder="Notes about your order, e.g. special notes for delivery."
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-cyan"
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold text-navy">Your order</h3>
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-navy">
              <tr>
                <th className="px-3 py-3 font-bold">Product</th>
                <th className="px-3 py-3 text-right font-bold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {cart?.items.map((item) => (
                <tr key={item.key}>
                  <td className="px-3 py-3 text-ink-soft">
                    {item.name} × {item.quantity}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-navy">
                    {formatPrice(item.totals.line_subtotal, {
                      minorUnit: item.totals.currency_minor_unit,
                      prefix: item.totals.currency_prefix,
                    })}
                  </td>
                </tr>
              ))}
              {cart && (
                <>
                  <tr>
                    <td className="px-3 py-3 font-bold text-navy">Subtotal</td>
                    <td className="px-3 py-3 text-right font-bold text-navy">
                      {formatPrice(cart.totals.total_items, {
                        minorUnit: cart.totals.currency_minor_unit,
                        prefix: cart.totals.currency_prefix,
                      })}
                    </td>
                  </tr>
                  {Number(cart.totals.total_tax) > 0 && (
                    <tr>
                      <td className="px-3 py-3 font-bold text-navy">Tax</td>
                      <td className="px-3 py-3 text-right font-bold text-navy">
                        {formatPrice(cart.totals.total_tax, {
                          minorUnit: cart.totals.currency_minor_unit,
                          prefix: cart.totals.currency_prefix,
                        })}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-3 py-3 text-base font-bold text-navy">Total</td>
                    <td className="px-3 py-3 text-right text-base font-bold text-navy">
                      {formatPrice(cart.totals.total_price, {
                        minorUnit: cart.totals.currency_minor_unit,
                        prefix: cart.totals.currency_prefix,
                      })}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold text-navy">Payment</h3>
        <div className="space-y-3 rounded-lg border border-line bg-cream p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-navy">
            <input type="radio" name="payment_option" defaultChecked />
            Credit / Debit Cards
            <span className="ml-1 flex gap-1 text-[11px] font-bold text-muted">
              <span className="rounded border border-line bg-white px-1.5 py-0.5">AMEX</span>
              <span className="rounded border border-line bg-white px-1.5 py-0.5">VISA</span>
              <span className="rounded border border-line bg-white px-1.5 py-0.5">MC</span>
              <span className="rounded border border-line bg-white px-1.5 py-0.5">DISC</span>
            </span>
          </label>

          <div className="rounded-md border border-line bg-white px-3 py-3">
            {stripeConfigured ? (
              <CardElement options={{ style: { base: { fontSize: "16px", color: "#1c1c1c" } } }} />
            ) : (
              <p className="text-sm text-ink-soft">
                Payments are not configured yet. Set{" "}
                <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to enable card payment.
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-muted">
            <input type="radio" name="payment_option" disabled />
            ACH Payment
            <span className="text-xs font-normal">(coming soon)</span>
          </label>
        </div>
      </div>

      <p className="text-sm text-ink-soft">
        Your personal data will be used to process your order, support your experience
        throughout this website, and for other purposes described in our{" "}
        {/* No dedicated privacy-policy page exists on the backend yet — points at the
            nearest existing legal page until one is published. */}
        <a href="/terms-and-conditions" className="!text-[#1dc2ef] underline hover:no-underline">
          privacy policy
        </a>
        . Your information will not be shared with or sold to any third party without
        prior consent in accordance with law.
      </p>

      <label className="flex items-start gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5"
        />
        I have read and agree to the website{" "}
        <a href="/terms-and-conditions" className="!text-[#1dc2ef] underline hover:no-underline">
          terms and conditions
        </a>
        <span className="text-red-600">*</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        variant="secondary"
        className="w-full bg-[#7f54b3] uppercase !text-white hover:bg-[#6c4699]"
        disabled={busy || !canSubmit}
      >
        {busy ? "Placing order…" : "Place order"}
      </Button>
    </form>
  );
}
