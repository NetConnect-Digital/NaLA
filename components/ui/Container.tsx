import { cn } from "@/lib/utils";

/** Centered max-width content wrapper, matching the theme's container width. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

/** Vertical section spacing wrapper. */
export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-12 md:py-16 scroll-mt-24", className)}>
      {children}
    </section>
  );
}
