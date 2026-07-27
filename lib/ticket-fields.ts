/**
 * Per-ticket registration fields for the 2026 Annual Conference tickets.
 *
 * Mirrors the "WooCommerce Box Office" custom fields configured on the live
 * product pages (shop.nalalifeline.org/product/2026-annual-conference-*).
 * Field keys are the plugin's stable per-field hashes — they must match
 * exactly for submitted data to attach to the right meta on the WooCommerce
 * order line item, so don't regenerate them from scratch if the copy changes;
 * edit the `label`/`options` here to match a copy change on the live site.
 */

export type TicketFieldType = "text" | "radio" | "select";

export interface TicketField {
  key: string;
  label: string;
  type: TicketFieldType;
  required: boolean;
  options?: string[];
  /** Only rendered when the field with this key is answered "Yes". */
  showIf?: { key: string; equals: string };
}

export const TICKET_FIELDS: TicketField[] = [
  { key: "ddf0c5e3362962d29180d9226f2e5be8", label: "First Name", type: "text", required: true },
  { key: "d6d93e88becfc567bb30ca978a237726", label: "Last Name", type: "text", required: true },
  { key: "c276b415493b81614a98b061f511e8ff", label: "Email", type: "text", required: true },
  { key: "31889fefdcc1a5ad134e53dfba161b5d", label: "Phone Number", type: "text", required: true },
  {
    key: "8882a22028b82517db237318bcd3259b",
    label: "Can we send you occasional updates related to your registration via text message?",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
  },
  { key: "44ef28f20a640e7d06a2bf034fd590e6", label: "What company do you represent?", type: "text", required: true },
  {
    key: "7fe41b424ac9c289f0d24ae7522ab99f",
    label: "What best describes your role in the industry?",
    type: "select",
    required: true,
    options: [
      "Lifeline Advocate",
      "Device Supplier",
      "Distributor",
      "ETC",
      "Field Enrollment Rep",
      "Government Representative",
      "Pick-Pack-Ship Supplier",
      "Public Interest Group",
      "Solution Supplier",
    ],
  },
  {
    key: "d718e0eb02d8ed04fc1c697ec7101a8d",
    label: "Are you staying at the host hotel? (The Belgrove Resort & Spa)",
    type: "radio",
    required: true,
    options: ["Yes", "No", "Not Sure"],
  },
  {
    key: "6940c6a9d555ae2e4ed59342e5dc7daf",
    label:
      "Are you interested in speaking at the event, participating in a panel discussion, or moderating a panel? Don't worry, we will contact you to discuss your level of comfort and preferred topics.",
    type: "radio",
    required: true,
    options: ["Yes", "No", "Maybe"],
  },
  {
    key: "98cf758c04f12a7fe25ab9090a00e50b",
    label:
      "Do we have your permission to give your contact information, including phone number, to event sponsors?",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
  },
  {
    key: "5060d3afbece0e80dea4361138cfbd1b",
    label: "Are you interested in becoming a 2026 conference sponsor?",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
  },
  {
    key: "9a49f91cd0b0f5e8d8d15548ec25f7c4",
    label:
      "Is there anything we can do to make this conference more accessible for you? (for example: level access, hearing loop, ramps, seating closer to screens/displays, or anything else)",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
  },
  {
    key: "51995b7ade50541c3ffc22a9d71daf33",
    label: "If yes, please provide details of how we can accommodate you",
    type: "text",
    required: false,
    showIf: { key: "9a49f91cd0b0f5e8d8d15548ec25f7c4", equals: "Yes" },
  },
  {
    key: "afbb2ae444c1bb311c8b9c3c495c28d4",
    label: "Do you have any food allergies or restrictions?",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
  },
  {
    key: "77caa3f0c72a7cd763ee0ad832852458",
    label: "If yes, please provide details of dietary restrictions",
    type: "text",
    required: false,
    showIf: { key: "afbb2ae444c1bb311c8b9c3c495c28d4", equals: "Yes" },
  },
  {
    key: "b61d72557ce6cf6debeff9154276cff6",
    label: "How many NaLA conferences have you attended?",
    type: "select",
    required: true,
    options: ["This is my first", "1", "2", "3", "4", "5", "6", "7", "8 or more"],
  },
  {
    key: "e986cf2bfb9a7b4614a3bf34e217962d",
    label: "Are you participating in any programs that fund NaLA outside of the Conference?",
    type: "radio",
    required: true,
    options: ["Yes", "No", "Not Sure"],
  },
  {
    key: "47012c0bf83635f5dd9ce424acc05699",
    label:
      "Do we have your permission to include your provided email and phone number to the QR code on your name badge?",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
  },
  {
    key: "58260b82b888a934c225adb73c16055f",
    label: "Do you plan to attend the Welcome Party Wednesday evening (10/21)?",
    type: "radio",
    required: true,
    options: ["Yes", "No", "Not Sure"],
  },
];

/** Product slugs that use the per-ticket registration form above. */
export const TICKET_FORM_SLUGS = new Set([
  "2026-annual-conference-funding",
  "2026-annual-conference-non-funding",
]);

export type TicketAnswers = Record<string, string>;

export function emptyTicketAnswers(): TicketAnswers {
  return Object.fromEntries(TICKET_FIELDS.map((f) => [f.key, ""]));
}

export function validateTicketAnswers(answers: TicketAnswers): string[] {
  const missing: string[] = [];
  for (const field of TICKET_FIELDS) {
    if (field.showIf && answers[field.showIf.key] !== field.showIf.equals) continue;
    if (field.required && !answers[field.key]?.trim()) missing.push(field.label);
  }
  return missing;
}
