"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useApplyCoupon,
  useRemoveCoupon,
} from "@/lib/cart-hooks";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { Cart, CartItem } from "@/lib/types";

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

            <aside className="h-fit rounded-lg border border-line bg-white p-6 shadow-sm lg:sticky lg:top-24">
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
                {cart && Number(cart.totals.total_discount) > 0 && (
                  <div className="flex justify-between text-green">
                    <dt>Discount</dt>
                    <dd className="font-bold">
                      −
                      {formatPrice(cart.totals.total_discount, {
                        minorUnit: cart.totals.currency_minor_unit,
                        prefix: cart.totals.currency_prefix,
                      })}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-2 text-xl">
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

              <CouponForm cart={cart} />

              <Button
                href="/checkout"
                variant="secondary"
                className="mt-6 w-full bg-[#7f54b3] uppercase !text-white hover:bg-[#6c4699]"
              >
                Proceed to Checkout
              </Button>
              <Link
                href="/shop"
                className="mt-5 inline-flex w-full cursor-pointer items-center justify-center rounded-full border-2 border-navy px-8 py-3 font-sans text-sm font-bold uppercase tracking-wide !text-navy transition-colors hover:bg-navy hover:!text-white"
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

  // Derive the slug from the permalink, ignoring any query string / trailing slash.
  const slug = item.permalink.split("?")[0].replace(/\/+$/, "").split("/").pop();

  return (
    <li className="flex gap-4 p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-cyan-50">
        {img && (
          <Image src={img.thumbnail || img.src} alt={img.alt || item.name} fill className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <Link href={`/product/${slug}`}>
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
            className="cursor-pointer text-sm text-muted hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="text-right font-sans font-bold text-[#00b9c3]">
        {formatPrice(item.totals.line_total, priceOpts)}
      </div>
    </li>
  );
}

function CouponForm({ cart }: { cart?: Cart }) {
  const [code, setCode] = useState("");
  const apply = useApplyCoupon();
  const remove = useRemoveCoupon();
  const coupons = cart?.coupons ?? [];

  return (
    <div className="mt-6 border-t border-line pt-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = code.trim();
          if (value) apply.mutate({ code: value }, { onSuccess: () => setCode("") });
        }}
        className="flex gap-2"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          aria-label="Coupon code"
          className="h-10 min-w-0 flex-1 rounded-full border border-line px-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan"
        />
        <button
          type="submit"
          disabled={apply.isPending || !code.trim()}
          className="h-10 shrink-0 cursor-pointer rounded-full bg-navy px-5 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
        >
          {apply.isPending ? "Applying…" : "Apply"}
        </button>
      </form>

      {apply.isError && (
        <p className="mt-2 text-sm text-red-600">
          {(apply.error as Error)?.message?.trim() ||
            "This coupon could not be applied. Please try again."}
        </p>
      )}

      {coupons.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {coupons.map((c) => (
            <li key={c.code} className="flex items-center justify-between text-sm">
              <span className="font-bold uppercase text-green">{c.code}</span>
              <button
                onClick={() => remove.mutate({ code: c.code })}
                disabled={remove.isPending}
                className="cursor-pointer text-xs text-muted hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
