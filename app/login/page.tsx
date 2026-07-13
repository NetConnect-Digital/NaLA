"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AuthShell, Field } from "@/components/auth/AuthShell";
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
      subtitle="Please login to your NaLA Membership below."
      footer={
        <>
          <p>
            Not a member yet? Register{" "}
            <Link href="/register" className="font-semibold underline hover:text-navy">
              here
            </Link>
            .
          </p>
          <p>
            Lost your password? Click{" "}
            <Link
              href="/recover-password"
              className="font-semibold underline hover:text-navy"
            >
              here
            </Link>
            .
          </p>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field name="username" label="Username or Email" required autoComplete="username" />
        <Field
          name="password"
          label="Password"
          type="password"
          required
          autoComplete="current-password"
        />
        <label className="flex items-center gap-2 text-sm text-white">
          <input type="checkbox" name="remember" className="h-4 w-4 accent-green" />
          Remember Me
        </label>
        {error && (
          <p className="rounded-md bg-white/90 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={login.isPending}
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-green px-8 py-3 font-sans text-sm font-bold uppercase tracking-wide !text-white transition-colors hover:bg-[#5fae4d] disabled:opacity-60"
        >
          {login.isPending ? "Logging in…" : "Log In"}
        </button>
      </form>
    </AuthShell>
  );
}
