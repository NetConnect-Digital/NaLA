"use client";

import { useState } from "react";
import { Field } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import type { WpUser } from "@/lib/auth";

export function ProfileForm({ user }: { user: WpUser }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus("saved");
      setMessage("Profile updated.");
    } else {
      setStatus("error");
      setMessage(data?.message ?? "Could not update profile.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <PrefilledField name="first_name" label="First Name" defaultValue={user.first_name} />
        <PrefilledField name="last_name" label="Last Name" defaultValue={user.last_name} />
      </div>
      <PrefilledField name="email" label="Email" type="email" defaultValue={user.email} />
      {message && (
        <p className={status === "error" ? "text-sm text-red-600" : "text-sm text-green-700"}>
          {message}
        </p>
      )}
      <Button type="submit" variant="secondary" disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}

function PrefilledField({
  name,
  label,
  type = "text",
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-bold text-navy">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-md border border-line px-3 py-2 focus:border-cyan focus:outline-none"
      />
    </div>
  );
}

// Re-export Field for parity if needed elsewhere.
export { Field };
