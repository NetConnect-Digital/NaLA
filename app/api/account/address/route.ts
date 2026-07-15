import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateWcCustomerAddress, type WcAddress } from "@/lib/wc-admin";

const FIELDS: (keyof WcAddress)[] = [
  "first_name",
  "last_name",
  "company",
  "address_1",
  "address_2",
  "city",
  "state",
  "postcode",
  "country",
  "email",
  "phone",
];

/**
 * PUT /api/account/address — update the signed-in customer's billing or
 * shipping address. Body: { type: "billing" | "shipping", address: {...} }.
 */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    address?: Record<string, unknown>;
  };
  if (body.type !== "billing" && body.type !== "shipping") {
    return NextResponse.json({ message: "Invalid address type." }, { status: 400 });
  }

  // Whitelist known address fields.
  const address: WcAddress = {};
  for (const key of FIELDS) {
    const v = body.address?.[key];
    if (typeof v === "string") address[key] = v;
  }

  const result = await updateWcCustomerAddress(user.id, body.type, address);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
