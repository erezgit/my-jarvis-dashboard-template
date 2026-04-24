import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Colored highlight box for a key insight, quote, or reminder.
 * Softer than a SectionCard — use sparingly.
 */
const TONES = {
  blue:    { bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200 dark:border-blue-900",    icon: "text-blue-600"    },
  violet:  { bg: "bg-violet-50 dark:bg-violet-950/30",   border: "border-violet-200 dark:border-violet-900", icon: "text-violet-600" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-900",  icon: "text-amber-600"   },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-900", icon: "text-emerald-600" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-950/30",       border: "border-rose-200 dark:border-rose-900",    icon: "text-rose-600"    },
} as const;

export type CalloutTone = keyof typeof TONES;

export type CalloutProps = {
  tone?: CalloutTone;
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Callout({
  tone = "amber",
  icon: Icon,
  title,
  children,
  className,
}: CalloutProps) {
  const t = TONES[tone];
  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex gap-3",
        t.bg,
        t.border,
        className,
      )}
    >
      {Icon ? (
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", t.icon)} />
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>
        ) : null}
        <div className="text-sm text-foreground/90 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
