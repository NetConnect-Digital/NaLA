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
import { formatPrice } from "@/lib/utils";
import type { Cart, CartItem } from "@/lib/types";

/** The "review your products" table shown at the top of checkout, mirroring
 * the cart contents with inline quantity/remove/coupon controls. */
export function OrderReviewTable() {
  const { data: cart, isLoading } = useCart();

  if (isLoading) return <p className="text-muted">Loading your cart…</p>;
  const items = cart?.items ?? [];
  if (items.length === 0) {
    return <p className="text-ink-soft">Your cart is empty.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-cream text-navy">
          <tr>
            <th className="w-10 px-3 py-3" />
            <th className="w-16 px-3 py-3" />
            <th className="px-3 py-3 font-bold">Product</th>
            <th className="px-3 py-3 font-bold">Price</th>
            <th className="px-3 py-3 font-bold">Quantity</th>
            <th className="px-3 py-3 font-bold">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <ReviewRow key={item.key} item={item} />
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap items-center gap-3 border-t border-line p-3">
        <CouponForm cart={cart} />
      </div>
    </div>
  );
}

function ReviewRow({ item }: { item: CartItem }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const img = item.images[0];
  const busy = update.isPending || remove.isPending;
  const priceOpts = {
    minorUnit: item.totals.currency_minor_unit,
    prefix: item.totals.currency_prefix,
  };
  const slug = item.permalink.split("?")[0].replace(/\/+$/, "").split("/").pop();

  return (
    <tr>
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={() => remove.mutate({ key: item.key })}
          disabled={busy}
          aria-label={`Remove ${item.name}`}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
        >
          ×
        </button>
      </td>
      <td className="px-3 py-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-cyan-50">
          {img && (
            <Image src={img.thumbnail || img.src} alt={img.alt || item.name} fill className="object-cover" />
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <Link href={`/product/${slug}`} className="font-semibold !text-[#1dc2ef] hover:underline">
          {item.name}
        </Link>
      </td>
      <td className="px-3 py-3 text-ink-soft">{formatPrice(item.prices.price, priceOpts)}</td>
      <td className="px-3 py-3">
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
          aria-label={`${item.name} quantity`}
        />
      </td>
      <td className="px-3 py-3 font-bold text-navy">
        {formatPrice(item.totals.line_subtotal, priceOpts)}
      </td>
    </tr>
  );
}

function CouponForm({ cart }: { cart?: Cart }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const apply = useApplyCoupon();
  const remove = useRemoveCoupon();
  const coupons = cart?.coupons ?? [];

  if (!open && coupons.length === 0) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm !text-[#1dc2ef] hover:underline"
      >
        Have a coupon? Click here to enter your code
      </button>
    );
  }

  return (
    <div className="w-full">
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
          {apply.isPending ? "Applying…" : "Apply coupon"}
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
                type="button"
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
