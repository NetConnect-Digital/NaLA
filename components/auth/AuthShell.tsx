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
    <Section>
      <Container>
        <div className="mx-auto max-w-2xl rounded-lg bg-cyan p-6 text-white sm:p-8 md:p-10">
          <h1 className="!text-white text-3xl md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-white/90">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-5 space-y-1.5 text-sm text-white/90">{footer}</div>
          )}
        </div>
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
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-white">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-full border border-white/40 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/60"
      />
    </div>
  );
}

export { Link };
