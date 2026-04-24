import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A content section. Rounded-xl card with a subtle border and optional
 * tiny uppercase "eyebrow" label at the top. Designed to sit in a stack
 * inside <PageShell>.
 *
 * Variants map to tinted backgrounds for when you want to call out an
 * especially important section.
 */
const VARIANTS = {
  default: "bg-card",
  muted:   "bg-muted/40",
  blue:    "bg-blue-50/70 dark:bg-blue-950/20",
  violet:  "bg-violet-50/70 dark:bg-violet-950/20",
  amber:   "bg-amber-50/70 dark:bg-amber-950/20",
  emerald: "bg-emerald-50/70 dark:bg-emerald-950/20",
  rose:    "bg-rose-50/70 dark:bg-rose-950/20",
} as const;

export type SectionVariant = keyof typeof VARIANTS;

export type SectionCardProps = {
  /** Optional small uppercase label above the content. */
  eyebrow?: string;
  /** Optional title rendered larger, below the eyebrow. */
  title?: string;
  /** Optional muted one-line subtitle under the title. */
  subtitle?: string;
  /** Visual variant — use tinted backgrounds for emphasis. */
  variant?: SectionVariant;
  /** Content. */
  children: ReactNode;
  /** Extra classes merged into the card. */
  className?: string;
};

export function SectionCard({
  eyebrow,
  title,
  subtitle,
  variant = "default",
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border p-5 mb-0",
        VARIANTS[variant],
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      ) : null}
      {subtitle ? (
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
      {(title || subtitle) && (eyebrow || children) ? (
        <div className="h-2" />
      ) : null}
      {children}
    </section>
  );
}
