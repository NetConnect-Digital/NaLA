"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { useRegister } from "@/lib/auth-hooks";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    register.mutate(
      {
        email: String(form.get("email")),
        password: String(form.get("password")),
        first_name: String(form.get("first_name") ?? ""),
        last_name: String(form.get("last_name") ?? ""),
      },
      {
        onSuccess: (data) => router.push(data?.autoLoggedIn ? "/my-account" : "/login"),
        onError: (err) =>
          setError(err instanceof Error ? err.message : "Registration failed"),
      },
    );
  }

  return (
    <AuthShell
      title="Create an Account"
      subtitle="Join NaLA to register for the conference and manage your orders."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-cyan-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="first_name" label="First Name" autoComplete="given-name" />
          <Field name="last_name" label="Last Name" autoComplete="family-name" />
        </div>
        <Field name="email" label="Email" type="email" required autoComplete="email" />
        <Field name="password" label="Password" type="password" required autoComplete="new-password" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="secondary" className="w-full" disabled={register.isPending}>
          {register.isPending ? "Creating account…" : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
