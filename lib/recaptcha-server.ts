import "server-only";
import { RECAPTCHA_SECRET_KEY } from "./config";

/**
 * Verifies a Google reCAPTCHA v2 token server-side. Returns true (skips the
 * check) when no secret key is configured, so the app keeps working locally
 * before keys are set up.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) return true;
  if (!token) return false;

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: RECAPTCHA_SECRET_KEY, response: token }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return Boolean(data.success);
}
