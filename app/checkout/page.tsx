"use client";

import { useCart } from "@/lib/cart-hooks";
import { Container, Section } from "@/components/ui/Container";
import { StripeProvider } from "@/components/checkout/StripeProvider";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { data: cart, isLoading } = useCart();

  return (
    <Section>
      <Container>
        <h1 className="text-4xl">Checkout</h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-line bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl">Billing &amp; Payment</h2>
            <StripeProvider>
              <CheckoutForm />
            </StripeProvider>
          </div>

          <aside className="h-fit rounded-lg border border-line bg-white p-6 shadow-sm">
            <h2 className="text-xl">Order Summary</h2>
            {isLoading ? (
              <p className="mt-4 text-muted">Loading…</p>
            ) : (
              <>
                <ul className="mt-4 space-y-3">
                  {cart?.items.map((item) => (
                    <li key={item.key} className="flex justify-between gap-3 text-sm">
                      <span className="text-ink-soft">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-bold text-navy">
                        {formatPrice(item.totals.line_total, {
                          minorUnit: item.totals.currency_minor_unit,
                          prefix: item.totals.currency_prefix,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
                {cart && (
                  <div className="mt-4 flex justify-between border-t border-line pt-4 text-base">
                    <span className="font-bold text-navy">Total</span>
                    <span className="font-bold text-navy">
                      {formatPrice(cart.totals.total_price, {
                        minorUnit: cart.totals.currency_minor_unit,
                        prefix: cart.totals.currency_prefix,
                      })}
                    </span>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </Container>
    </Section>
  );
}
