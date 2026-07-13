import { NextRequest, NextResponse } from "next/server";
import { WP_API } from "@/lib/config";

/**
 * Proxy contact submissions to Contact Form 7's REST endpoint.
 *
 * NOTE: CONTACT_FORM_ID and the field-name mapping below must match the live
 * CF7 form on the WordPress backend (e.g. your-name, your-email, your-message).
 * Confirm these in WP Admin > Contact > the contact form's form template.
 */
const CONTACT_FORM_ID = process.env.CONTACT_FORM_ID ?? "12";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, string>;

  // Field names must match the live CF7 form template (form #12: your-name/email/message).
  const form = new FormData();
  form.set("your-name", body.name ?? "");
  form.set("your-email", body.email ?? "");
  form.set("your-message", body.message ?? "");
  form.set("_wpcf7", CONTACT_FORM_ID);
  form.set("_wpcf7_unit_tag", `wpcf7-f${CONTACT_FORM_ID}-o1`);

  const res = await fetch(
    `${WP_API}/contact-form-7/v1/contact-forms/${CONTACT_FORM_ID}/feedback`,
    { method: "POST", body: form },
  );
  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
  };

  // CF7 returns 200 with a status field; only "mail_sent" is a real success.
  if (data.status === "mail_sent") {
    return NextResponse.json({ message: data.message }, { status: 200 });
  }
  return NextResponse.json(
    { message: data.message ?? "Unable to send your message." },
    { status: 400 },
  );
}
