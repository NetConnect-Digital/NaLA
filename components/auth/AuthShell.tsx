import Link from "next/link";
import { Container, Section } from "@/components/ui/Container";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Section className="bg-cyan-50/40">
      <Container className="max-w-md">
        <div className="rounded-xl border border-line bg-white p-8 shadow-sm">
          <h1 className="text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-4 text-center text-sm text-ink-soft">{footer}</div>}
      </Container>
    </Section>
  );
}

export function Field({
  name,
  label,
  type = "text",
  required,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-bold text-navy">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-line px-3 py-2 focus:border-cyan focus:outline-none"
      />
    </div>
  );
}

export { Link };
