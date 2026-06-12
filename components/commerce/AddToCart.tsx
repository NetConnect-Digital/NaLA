"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAddToCart } from "@/lib/cart-hooks";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  productId: number;
  disabled?: boolean;
  withQuantity?: boolean;
  label?: string;
  className?: string;
  /** Extra classes applied to the button itself (e.g. custom background). */
  buttonClassName?: string;
  variant?: "primary" | "secondary" | "outline";
  /** If set, navigate here after the item is added (e.g. "/checkout"). */
  redirectTo?: string;
}

export function AddToCart({
  productId,
  disabled,
  withQuantity = false,
  label = "Add to Cart",
  className,
  buttonClassName,
  variant = "primary",
  redirectTo,
}: Props) {
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const add = useAddToCart();

  if (disabled) {
    return (
      <Button variant="outline" disabled className={cn(className, buttonClassName)}>
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
          className="h-12 w-20 rounded-full border border-line px-3 text-center"
          aria-label="Quantity"
        />
      )}
      <Button
        variant={variant}
        className={buttonClassName}
        onClick={() =>
          add.mutate(
            { id: productId, quantity: qty },
            {
              onSuccess: () => {
                if (redirectTo) {
                  router.push(redirectTo);
                  return;
                }
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
