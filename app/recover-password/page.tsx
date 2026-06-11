"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { useRecoverPassword } from "@/lib/auth-hooks";

export default function RecoverPasswordPage() {
  const recover = useRecoverPassword();
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    recover.mutate(
      { email: String(form.get("email")) },
      { onSuccess: (data) => setMessage(data?.message ?? "Check your email.") },
    );
  }

  return (
    <AuthShell
      title="Recover Password"
      subtitle="Enter your email and we'll send a reset link."
      footer={
        <Link href="/login" className="font-bold text-cyan-700 hover:underline">
          Back to login
        </Link>
      }
    >
      {message ? (
        <div className="rounded-md bg-green-50 p-4 text-ink-soft">{message}</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field name="email" label="Email" type="email" required autoComplete="email" />
          <Button type="submit" variant="secondary" className="w-full" disabled={recover.isPending}>
            {recover.isPending ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
