"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WcAddress } from "@/lib/wc-admin";

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-navy">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-cyan"
      />
    </label>
  );
}

/** Edit a billing or shipping address; saves via /api/account/address. */
export function AddressForm({
  type,
  address,
}: {
  type: "billing" | "shipping";
  address: WcAddress;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/account/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, address: payload }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed to save address.");
      setSaved(true);
      router.refresh();
      setTimeout(() => router.push("/my-account/edit-address"), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="first_name" label="First name" defaultValue={address.first_name} required />
        <Field name="last_name" label="Last name" defaultValue={address.last_name} required />
      </div>
      <Field name="company" label="Company (optional)" defaultValue={address.company} />
      <Field name="address_1" label="Street address" defaultValue={address.address_1} required />
      <Field
        name="address_2"
        label="Apartment, suite, etc. (optional)"
        defaultValue={address.address_2}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="city" label="Town / City" defaultValue={address.city} required />
        <Field name="state" label="State" defaultValue={address.state} required />
        <Field name="postcode" label="ZIP Code" defaultValue={address.postcode} required />
      </div>
      <Field name="country" label="Country" defaultValue={address.country || "US"} required />
      <div className="grid gap-4 sm:grid-cols-2">
        {type === "billing" && (
          <Field name="email" label="Email" type="email" defaultValue={address.email} />
        )}
        <Field name="phone" label="Phone" defaultValue={address.phone} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm font-bold text-green">Address saved.</p>}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan px-8 py-2.5 text-sm font-bold uppercase tracking-wide !text-white transition-colors hover:bg-cyan-700 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save address"}
      </button>
    </form>
  );
}
