import { NextResponse } from "next/server";
import { storeProxy, persistCartToken } from "@/lib/store-server";
import type { Cart } from "@/lib/types";

/** GET /api/cart — current cart for this session. */
export async function GET() {
  const { status, data, cartToken } = await storeProxy<Cart>("/cart");
  await persistCartToken(cartToken);
  return NextResponse.json(data, { status });
}
