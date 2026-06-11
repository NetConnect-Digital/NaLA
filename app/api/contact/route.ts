import { NextRequest, NextResponse } from "next/server";
import { WP_API } from "@/lib/config";

/**
 * Proxy contact submissions to Contact Form 7's REST endpoint.
 *
 * NOTE: CONTACT_FORM_ID and the field-name mapping below must match the live
 * CF7 form on the WordPress backend (e.g. your-name, your-email, your-message).
 * Confirm these in WP Admin > Contact > the contact form's form template.
 */
const CONTACT_FORM_ID = process.env.CONTACT_FORM_ID ?? "";

export async function POST(req: NextRequest) {
  if (!CONTACT_FORM_ID) {
    return NextResponse.json(
      { message: "Contact form is not configured yet (set CONTACT_FORM_ID)." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, string>;

  const form = new FormData();
  form.set("your-name", body.name ?? "");
  form.set("your-email", body.email ?? "");
  form.set("your-subject", body.subject ?? "");
  form.set("your-message", body.message ?? "");

  const res = await fetch(
    `${WP_API}/contact-form-7/v1/contact-forms/${CONTACT_FORM_ID}/feedback`,
    { method: "POST", body: form },
  );
  const data = await res.json().catch(() => ({}));

  if (data?.status === "mail_sent") {
    return NextResponse.json({ message: data.message }, { status: 200 });
  }
  return NextResponse.json(
    { message: data?.message ?? "Unable to send your message." },
    { status: 400 },
  );
}
