import { NextRequest, NextResponse } from "next/server";
import { storeProxy, persistCartToken } from "@/lib/store-server";
import type { Cart } from "@/lib/types";

const ALLOWED = new Set(["add-item", "update-item", "remove-item", "items"]);

/**
 * POST /api/cart/add-item     { id, quantity }
 * POST /api/cart/update-item  { key, quantity }
 * POST /api/cart/remove-item  { key }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (!ALLOWED.has(action)) {
    return NextResponse.json({ message: "Unknown cart action" }, { status: 404 });
  }

  const body = await req.text();
  const { status, data, cartToken } = await storeProxy<Cart>(`/cart/${action}`, {
    method: "POST",
    body,
  });
  await persistCartToken(cartToken);
  return NextResponse.json(data, { status });
}
