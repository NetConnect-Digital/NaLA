"use client";

import { useCart } from "@/lib/cart-hooks";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { StripeProvider } from "@/components/checkout/StripeProvider";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderReviewTable } from "@/components/checkout/OrderReviewTable";

export default function CheckoutPage() {
  const { data: cart, isLoading } = useCart();
  const empty = !isLoading && (cart?.items_count ?? 0) === 0;

  return (
    <Section>
      <Container>
        <h1 className="text-3xl md:text-4xl">
          Please Review Your Products, Then Scroll Down To Complete Your Purchase
        </h1>

        {empty ? (
          <div className="mt-8 rounded-lg border border-line bg-white p-10 text-center">
            <p className="text-ink-soft">Your cart is empty.</p>
            <Button href="/2026-conference" className="mt-6">
              Browse the Conference
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <OrderReviewTable />
            </div>

            <div className="mt-10 rounded-lg border border-line bg-white p-6 shadow-sm">
              <StripeProvider>
                <CheckoutForm />
              </StripeProvider>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
