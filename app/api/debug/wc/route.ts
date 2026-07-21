import { NextResponse } from "next/server";
import { WC_API, WC_CONSUMER_KEY, WC_CONSUMER_SECRET, WP_URL } from "@/lib/config";

/**
 * GET /api/debug/wc — diagnose WooCommerce connectivity from the server.
 *
 * Reports whether the API keys are present and what a live wc/v3 request
 * returns (HTTP status + whether the body looks like a Sucuri firewall block).
 * Never returns the key/secret values. Safe to remove once the deploy works.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const keysPresent = Boolean(WC_CONSUMER_KEY && WC_CONSUMER_SECRET);

  let testStatus: number | null = null;
  let bodyKind = "n/a";
  let error: string | null = null;

  if (keysPresent) {
    try {
      const token = Buffer.from(
        `${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`,
      ).toString("base64");
      const res = await fetch(`${WC_API}/orders?per_page=1`, {
        headers: { Authorization: `Basic ${token}`, Accept: "application/json" },
        cache: "no-store",
      });
      testStatus = res.status;
      const text = await res.text();
      if (/sucuri/i.test(text) || text.trimStart().startsWith("<")) {
        bodyKind = "html/firewall-block";
      } else if (text.trimStart().startsWith("[") || text.trimStart().startsWith("{")) {
        bodyKind = "json";
      } else {
        bodyKind = "other";
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "fetch failed";
    }
  }

  return NextResponse.json({
    wpUrl: WP_URL,
    keysPresent,
    keyPrefix: WC_CONSUMER_KEY ? WC_CONSUMER_KEY.slice(0, 5) : null,
    testStatus,
    bodyKind,
    error,
    hint:
      !keysPresent
        ? "Set WC_CONSUMER_KEY and WC_CONSUMER_SECRET in Vercel env, then redeploy."
        : testStatus === 200 && bodyKind === "json"
          ? "WooCommerce is reachable — orders should load."
          : bodyKind === "html/firewall-block"
            ? "Sucuri is blocking Vercel's server IPs — whitelist them in Sucuri."
            : `Unexpected wc/v3 response (status ${testStatus}).`,
  });
}
