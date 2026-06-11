"use client";

import { useState } from "react";
import { useAddToCart } from "@/lib/cart-hooks";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  productId: number;
  disabled?: boolean;
  withQuantity?: boolean;
  label?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
}

export function AddToCart({
  productId,
  disabled,
  withQuantity = false,
  label = "Add to Cart",
  className,
  variant = "primary",
}: Props) {
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const add = useAddToCart();

  if (disabled) {
    return (
      <Button variant="outline" disabled className={className}>
        Sold Out
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {withQuantity && (
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-16 rounded-md border border-line px-2 py-2 text-center"
          aria-label="Quantity"
        />
      )}
      <Button
        variant={variant}
        onClick={() =>
          add.mutate(
            { id: productId, quantity: qty },
            {
              onSuccess: () => {
                setDone(true);
                setTimeout(() => setDone(false), 2000);
              },
            },
          )
        }
        disabled={add.isPending}
      >
        {add.isPending ? "Adding…" : done ? "Added ✓" : label}
      </Button>
    </div>
  );
}
