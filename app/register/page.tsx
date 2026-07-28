"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Container, Section } from "@/components/ui/Container";
import { useRegister } from "@/lib/auth-hooks";
import { RECAPTCHA_SITE_KEY } from "@/lib/config";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (
        container: HTMLElement,
        params: { sitekey: string },
      ) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
    };
  }
}

const MEMBER_TYPES = [
  "Lifeline ETC/Provider",
  "Lifeline Distributor",
  "Lifeline Advocate/Supporter",
  "Lifeline Recipient/Participant",
  "Government Representative",
  "Regulatory Representative",
  "Lifeline Vendor/Supplier",
  "ACP Provider Only",
];

const fieldCls =
  "w-full rounded-[30px] border border-black/[0.16] bg-black/[0.02] py-2.5 pl-[26px] pr-4 text-base text-ink-soft focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30";

const PW_LEVELS = [
  { label: "Very Weak", color: "#e53e3e", width: "25%" },
  { label: "Weak", color: "#dd6b20", width: "50%" },
  { label: "Medium", color: "#d69e2e", width: "75%" },
  { label: "Strong", color: "#88cc77", width: "100%" },
];

/** Rough password strength score (0–5) → level index (0–3). */
function pwScore(pw: string): number {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function pwLevel(pw: string) {
  const s = pwScore(pw);
  const idx = s <= 1 ? 0 : s === 2 ? 1 : s === 3 ? 2 : 3;
  return { idx, ...PW_LEVELS[idx] };
}

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [error, setError] = useState("");
  const [pw, setPw] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const level = pw ? pwLevel(pw) : null;

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  useEffect(() => {
    if (!recaptchaReady || !RECAPTCHA_SITE_KEY || !window.grecaptcha) return;
    window.grecaptcha.ready(() => {
      if (widgetId.current !== null || !recaptchaRef.current || !window.grecaptcha) return;
      widgetId.current = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
      });
    });
  }, [recaptchaReady]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();

    const recaptchaToken = window.grecaptcha?.getResponse(widgetId.current ?? undefined) ?? "";
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setError("Please check the box to confirm you're not a robot.");
      return;
    }

    const password = get("password");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (pwScore(password) <= 1) {
      setError("The password must have a minimum strength of Weak.");
      return;
    }
    if (password !== get("password2")) {
      setError("Passwords do not match.");
      return;
    }

    register.mutate(
      {
        username: get("username"),
        email: get("email"),
        password,
        first_name: get("first_name"),
        last_name: get("last_name"),
        member_type: get("member_type"),
        company: get("company"),
        website: get("website"),
        description: get("description"),
        recaptchaToken,
      },
      {
        onSuccess: (data) => router.push(data?.autoLoggedIn ? "/my-account" : "/login"),
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Registration failed");
          window.grecaptcha?.reset(widgetId.current ?? undefined);
        },
      },
    );
  }

  return (
    <Section>
      {RECAPTCHA_SITE_KEY && (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setRecaptchaReady(true)}
        />
      )}
      <Container>
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl">It&apos;s FREE to Join!</h1>
          <p className="mt-4 text-ink-soft">
            Become a member and participate in Lifeline related discussions, receive
            important industry related news &amp; updates, and get notified of
            upcoming events. We greatly value our members and encourage you to join
            and participate in our discussions and events!
          </p>
          <p className="mt-5 text-xl font-bold text-navy md:text-2xl">
            Fill out the form below and join today!
          </p>
        </header>

        <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-2xl space-y-5">
          <Row label="Member Type" required help="Please choose which type of membership best describes you.">
            <select name="member_type" required className={fieldCls} defaultValue={MEMBER_TYPES[0]}>
              {MEMBER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Username" required>
            <input name="username" required autoComplete="username" className={fieldCls} />
          </Row>
          <Row label="First Name" required>
            <input name="first_name" required autoComplete="given-name" className={fieldCls} />
          </Row>
          <Row label="Last Name" required>
            <input name="last_name" required autoComplete="family-name" className={fieldCls} />
          </Row>
          <Row label="Avatar" help="Optional: Upload an avatar (picture) to be more easily identified.">
            <div className="flex items-center gap-3">
              <label
                htmlFor="avatar"
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/[0.16] bg-black/[0.02] px-6 py-2 text-sm font-semibold text-ink-soft hover:border-cyan hover:text-cyan"
              >
                Upload
              </label>
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />
              {avatarFile && <span className="text-sm text-ink-soft">{avatarFile.name}</span>}
            </div>
          </Row>

          <SectionHeading>Contact Info</SectionHeading>
          <Row label="E-mail" required>
            <input name="email" type="email" required autoComplete="email" className={fieldCls} />
          </Row>
          <Row label="Company Name" help="(optional)">
            <input name="company" className={fieldCls} />
          </Row>
          <Row label="Website" help="(optional)">
            <input name="website" type="url" placeholder="https://" className={fieldCls} />
          </Row>

          <SectionHeading>About Yourself</SectionHeading>
          <Row label="Biographical Info" help="(Optional)">
            <textarea
              name="description"
              rows={5}
              className={`${fieldCls} rounded-2xl`}
            />
          </Row>
          <Row label="Password" required>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className={fieldCls}
            />
            <p className="mt-1 text-xs italic text-muted">Minimum length of 6 characters.</p>
            <p className="mt-1 text-xs italic text-muted">
              The password must have a minimum strength of Weak.
            </p>
            {level && (
              <div className="mt-2 h-6 overflow-hidden rounded bg-line/40">
                <div
                  className="flex h-full items-center justify-center text-xs font-bold text-white transition-all"
                  style={{ width: level.width, backgroundColor: level.color }}
                >
                  {level.label}
                </div>
              </div>
            )}
          </Row>
          <Row label="Repeat Password" required>
            <input name="password2" type="password" required autoComplete="new-password" className={fieldCls} />
          </Row>

          <Row
            label="Prove You're Human"
            required
            help="Check the box and enter the number you see appear, if prompted."
          >
            <div ref={recaptchaRef} />
          </Row>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 sm:ml-[186px]">
              {error}
            </p>
          )}

          <div className="sm:pl-[186px]">
            <button
              type="submit"
              disabled={register.isPending}
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[17px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-cyan-700 disabled:opacity-60"
            >
              {register.isPending ? "Registering…" : "Register"}
            </button>
            <p className="mt-4 text-sm text-ink-soft">
              Already a member?{" "}
              <Link href="/login" className="font-semibold !text-cyan-700 underline hover:!text-navy">
                Log in here
              </Link>
              .
            </p>
          </div>
        </form>
      </Container>
    </Section>
  );
}

function Row({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[170px_1fr] sm:items-start sm:gap-4">
      <label className="text-sm font-semibold text-navy sm:pt-2.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div>
        {children}
        {help && <p className="mt-1 text-xs italic text-muted">{help}</p>}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-line pb-2 pt-2 text-xl font-bold text-navy">
      {children}
    </h2>
  );
}
