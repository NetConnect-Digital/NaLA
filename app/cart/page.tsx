"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@/lib/cart-hooks";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

export default function CartPage() {
  const { data: cart, isLoading } = useCart();

  if (isLoading) {
    return (
      <Section>
        <Container>
          <p className="text-muted">Loading your cart…</p>
        </Container>
      </Section>
    );
  }

  const items = cart?.items ?? [];

  return (
    <Section>
      <Container>
        <h1 className="text-4xl">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-lg border border-line bg-white p-10 text-center">
            <p className="text-ink-soft">Your cart is empty.</p>
            <Button href="/2026-conference" className="mt-6">
              Browse the Conference
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ul className="divide-y divide-line rounded-lg border border-line bg-white">
                {items.map((item) => (
                  <CartRow key={item.key} item={item} />
                ))}
              </ul>
            </div>

            <aside className="h-fit rounded-lg border border-line bg-white p-6 shadow-sm">
              <h2 className="text-xl">Order Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="font-bold text-navy">
                    {cart &&
                      formatPrice(cart.totals.total_items, {
                        minorUnit: cart.totals.currency_minor_unit,
                        prefix: cart.totals.currency_prefix,
                      })}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base">
                  <dt className="font-bold text-navy">Total</dt>
                  <dd className="font-bold text-navy">
                    {cart &&
                      formatPrice(cart.totals.total_price, {
                        minorUnit: cart.totals.currency_minor_unit,
                        prefix: cart.totals.currency_prefix,
                      })}
                  </dd>
                </div>
              </dl>
              <Button href="/checkout" variant="secondary" className="mt-6 w-full">
                Proceed to Checkout
              </Button>
              <Link
                href="/shop"
                className="mt-3 block text-center text-sm text-cyan-700 hover:underline"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </Container>
    </Section>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const img = item.images[0];
  const busy = update.isPending || remove.isPending;

  const priceOpts = {
    minorUnit: item.totals.currency_minor_unit,
    prefix: item.totals.currency_prefix,
  };

  return (
    <li className="flex gap-4 p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-cyan-50">
        {img && (
          <Image src={img.thumbnail || img.src} alt={img.alt || item.name} fill className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <Link href={`/product/${item.permalink.split("/").filter(Boolean).pop()}`}>
          <h3 className="text-base leading-snug hover:text-cyan-700">{item.name}</h3>
        </Link>
        <div className="mt-auto flex items-center gap-3 pt-2">
          <input
            type="number"
            min={item.quantity_limits.minimum}
            max={item.quantity_limits.maximum}
            defaultValue={item.quantity}
            disabled={busy || !item.quantity_limits.editable}
            onChange={(e) =>
              update.mutate({ key: item.key, quantity: Math.max(1, Number(e.target.value)) })
            }
            className="w-16 rounded-md border border-line px-2 py-1 text-center"
            aria-label="Quantity"
          />
          <button
            onClick={() => remove.mutate({ key: item.key })}
            disabled={busy}
            className="text-sm text-muted hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="text-right font-sans font-bold text-navy">
        {formatPrice(item.totals.line_total, priceOpts)}
      </div>
    </li>
  );
}
