"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TICKET_FIELDS,
  emptyTicketAnswers,
  validateTicketAnswers,
  type TicketAnswers,
  type TicketField,
} from "@/lib/ticket-fields";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-cyan";

function FieldLabel({ field }: { field: TicketField }) {
  return (
    <span className="mb-1 block text-sm font-bold text-navy">
      {field.label}
      {field.required && <span className="text-red-600"> *</span>}
    </span>
  );
}

function TicketFieldInput({
  field,
  value,
  onChange,
}: {
  field: TicketField;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.type === "select") {
    return (
      <label className="block">
        <FieldLabel field={field} />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputClass}
        >
          <option value="" disabled>
            Select…
          </option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "radio") {
    return (
      <fieldset>
        <FieldLabel field={field} />
        <div className="flex flex-wrap gap-4">
          {field.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-[15px] text-ink-soft">
              <input
                type="radio"
                name={field.key}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                required={field.required}
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className="block">
      <FieldLabel field={field} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className={inputClass}
      />
    </label>
  );
}

function TicketAccordion({
  index,
  open,
  onToggle,
  answers,
  onFieldChange,
}: {
  index: number;
  open: boolean;
  onToggle: () => void;
  answers: TicketAnswers;
  onFieldChange: (key: string, value: string) => void;
}) {
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left text-lg font-semibold !text-[#00b9c3]"
      >
        Ticket #{index + 1}
        <span className={cn("transition-transform", open && "rotate-180")}>▾</span>
      </button>
      {open && (
        <div className="space-y-4 pb-5">
          {TICKET_FIELDS.map((field) => {
            if (field.showIf && answers[field.showIf.key] !== field.showIf.equals) return null;
            return (
              <TicketFieldInput
                key={field.key}
                field={field}
                value={answers[field.key] ?? ""}
                onChange={(value) => onFieldChange(field.key, value)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TicketRegistrationForm({
  productId,
  slug,
}: {
  productId: number;
  slug: string;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [tickets, setTickets] = useState<TicketAnswers[]>([emptyTicketAnswers()]);
  const [openIndex, setOpenIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function setTicketCount(next: number) {
    const count = Math.max(1, next);
    setQuantity(count);
    setTickets((prev) => {
      const copy = prev.slice(0, count);
      while (copy.length < count) copy.push(emptyTicketAnswers());
      return copy;
    });
  }

  function setField(ticketIndex: number, key: string, value: string) {
    setTickets((prev) =>
      prev.map((t, i) => (i === ticketIndex ? { ...t, [key]: value } : t)),
    );
  }

  async function submit() {
    setError("");
    for (let i = 0; i < tickets.length; i++) {
      const missing = validateTicketAnswers(tickets[i]);
      if (missing.length > 0) {
        setOpenIndex(i);
        setError(`Ticket #${i + 1} is missing: ${missing.join(", ")}`);
        return;
      }
    }

    setBusy(true);
    try {
      const res = await fetch("/api/tickets/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, slug, tickets }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Registration failed.");
      router.push("/cart");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setTicketCount(Number(e.target.value))}
          aria-label="Quantity"
          className="h-11 w-20 rounded-full border border-line px-3 text-center"
        />
        <p className="text-sm text-ink-soft">
          If you are purchasing multiple tickets, please fill out guest information beneath
          each ticket before adding them to your cart.
        </p>
      </div>

      {tickets.map((answers, i) => (
        <TicketAccordion
          key={i}
          index={i}
          open={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          answers={answers}
          onFieldChange={(key, value) => setField(i, key, value)}
        />
      ))}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-6 inline-flex items-center rounded-full bg-[#01c0e1] px-8 py-3 font-sans text-sm font-bold uppercase tracking-wide !text-white transition-colors hover:bg-[#01a8c5] disabled:opacity-60 md:text-base"
      >
        {busy ? "Registering…" : "Buy Ticket Now"}
      </button>
    </div>
  );
}
