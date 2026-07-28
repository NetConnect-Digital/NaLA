import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWcOrder } from "@/lib/wc-admin";
import { renderInvoicePdf } from "@/lib/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const order = await getWcOrder(Number(id)).catch(() => null);
  if (!order || order.customer_id !== user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const pdf = await renderInvoicePdf(order);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${order.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
