"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to send");
      setStatus("sent");
      setMessage(data?.message ?? "Thanks! We'll be in touch shortly.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-ink-soft">
        <p className="font-bold text-navy">Message sent</p>
        <p className="mt-1">{message}</p>
      </div>
    );
  }

  const field =
    "w-full min-h-[44px] rounded-[30px] border border-black/[0.16] bg-black/[0.02] py-3 pl-[26px] pr-4 text-base text-[#3c3c3c] placeholder:text-muted focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" placeholder="Your name *" required className={field} aria-label="Your name" />
        <input
          name="email"
          type="email"
          placeholder="Your email *"
          required
          className={field}
          aria-label="Your email"
        />
      </div>
      <textarea
        name="message"
        placeholder="Your message"
        rows={5}
        required
        className={field}
        aria-label="Your message"
      />
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[17px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-cyan-700 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Email"}
      </button>
    </form>
  );
}
