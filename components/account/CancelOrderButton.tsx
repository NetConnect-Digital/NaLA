"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Cancels a failed order via the API route, then refreshes the page. */
export function CancelOrderButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
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
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={cancel}
        disabled={busy}
        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan px-4 py-1.5 text-xs font-bold uppercase tracking-wide !text-white transition-colors hover:bg-cyan-700 disabled:opacity-60"
      >
        {busy ? "Cancelling…" : "Cancel"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
