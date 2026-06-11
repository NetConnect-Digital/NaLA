"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/lib/auth-hooks";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    login.mutate(
      {
        username: String(form.get("username")),
        password: String(form.get("password")),
      },
      {
        onSuccess: () => router.push("/my-account"),
        onError: (err) => setError(err instanceof Error ? err.message : "Login failed"),
      },
    );
  }

  return (
    <AuthShell
      title="Welcome"
      subtitle="Log in to your NaLA account."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-bold text-cyan-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field name="username" label="Username or Email" required autoComplete="username" />
        <Field name="password" label="Password" type="password" required autoComplete="current-password" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="secondary" className="w-full" disabled={login.isPending}>
          {login.isPending ? "Logging in…" : "Log In"}
        </Button>
        <Link
          href="/recover-password"
          className="block text-center text-sm text-cyan-700 hover:underline"
        >
          Forgot your password?
        </Link>
      </form>
    </AuthShell>
  );
}
