"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Cancels a subscription via the API route, then refreshes the page. */
export function CancelSubscriptionButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/subscriptions/${id}/cancel`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed to cancel.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={cancel}
        disabled={busy}
        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan px-6 py-2 text-sm font-bold uppercase tracking-wide !text-white transition-colors hover:bg-cyan-700 disabled:opacity-60"
      >
        {busy ? "Cancelling…" : "Cancel"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </span>
  );
}
