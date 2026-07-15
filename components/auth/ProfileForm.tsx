"use client";

import { useState } from "react";
import type { WpUser } from "@/lib/auth";

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-cyan";

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-bold text-navy">
      {children}
      {required && <span className="text-red-600"> *</span>}
    </label>
  );
}

function TextField({
  name,
  label,
  type = "text",
  defaultValue,
  required,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} className={inputCls} />
      {hint && <p className="mt-1.5 text-sm italic text-muted">{hint}</p>}
    </div>
  );
}

function PasswordField({ name, label }: { name: string; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <input id={name} name={name} type={show ? "text" : "password"} autoComplete="new-password" className={`${inputCls} pr-12`} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68" />
              <path d="M6.6 6.6C3.9 8.3 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
              <path d="m2 2 20 20" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function ProfileForm({ user, displayName: dn }: { user: WpUser; displayName?: string }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const displayName =
    dn?.trim() ||
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.name;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus("saved");
      setMessage("Account details saved.");
    } else {
      setStatus("error");
      setMessage(data?.message ?? "Could not update your account.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="first_name" label="First name" defaultValue={user.first_name} required />
        <TextField name="last_name" label="Last name" defaultValue={user.last_name} required />
      </div>

      <TextField
        name="display_name"
        label="Display name"
        defaultValue={displayName}
        required
        hint="This will be how your name will be displayed in the account section and in reviews"
      />

      <TextField name="email" label="Email address" type="email" defaultValue={user.email} required />

      <div className="border-t border-line pt-6">
        <h3 className="!text-xl font-bold text-navy">Password change</h3>
        <div className="mt-4 space-y-5">
          <PasswordField name="current_password" label="Current password (leave blank to leave unchanged)" />
          <PasswordField name="new_password" label="New password (leave blank to leave unchanged)" />
          <PasswordField name="confirm_password" label="Confirm new password" />
        </div>
      </div>

      {message && (
        <p className={status === "error" ? "text-sm font-bold text-red-600" : "text-sm font-bold text-green"}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan px-8 py-2.5 text-sm font-bold uppercase tracking-wide !text-white transition-colors hover:bg-cyan-700 disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
