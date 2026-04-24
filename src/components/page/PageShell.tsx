import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Canonical page shell for the Lilach dashboard.
 *
 * Gives every content page a consistent frame:
 *   - narrow reading column (max-w-4xl)
 *   - warm amber-tinted page background
 *   - colored icon badge + title + subtitle header
 *   - comfortable top/bottom padding
 *
 * Every section inside should be a <SectionCard> (or a <Callout>).
 */
const ICON_TINTS = {
  blue:    { bg: "bg-blue-500/15",    fg: "text-blue-600"    },
  violet:  { bg: "bg-violet-500/15",  fg: "text-violet-600"  },
  amber:   { bg: "bg-amber-500/15",   fg: "text-amber-600"   },
  emerald: { bg: "bg-emerald-500/15", fg: "text-emerald-600" },
  rose:    { bg: "bg-rose-500/15",    fg: "text-rose-600"    },
  slate:   { bg: "bg-slate-500/15",   fg: "text-slate-600"   },
  teal:    { bg: "bg-teal-500/15",    fg: "text-teal-600"    },
  pink:    { bg: "bg-pink-500/15",    fg: "text-pink-600"    },
} as const;

export type IconTint = keyof typeof ICON_TINTS;

export type PageShellProps = {
  /** Optional Lucide icon displayed in a colored rounded badge. */
  icon?: LucideIcon;
  /** Tint used for the icon badge. Default: amber. */
  iconColor?: IconTint;
  /** Large h1 title. Hebrew-ready. */
  title: string;
  /** Muted one-line subtitle / description. */
  subtitle?: string;
  /** Optional actions rendered at the top-start of the content area (e.g. a + button). */
  actions?: ReactNode;
  /** Page body — typically a stack of <SectionCard> children. */
  children: ReactNode;
  /** Extra classes on the outer wrapper. */
  className?: string;
};

export function PageShell({
  icon: Icon,
  iconColor = "amber",
  title,
  subtitle,
  actions,
  children,
  className,
}: PageShellProps) {
  const tint = ICON_TINTS[iconColor];
  return (
    <div
      className={cn(
        // Warm editorial page background. `min-h-svh` + negative margins
        // escape the Layout's content-sized `<div>` wrapper so the tint
        // covers the entire scrollable area — no white cutoff at the
        // bottom when content is short. `h-full` plus the flex above
        // makes tall content scroll naturally inside <main>.
        "min-h-svh h-full bg-gradient-to-b from-amber-50/60 via-amber-50/30 to-stone-50/60",
        "-mx-6 -my-8 px-6 py-8",
        className,
      )}
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon ? (
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl shrink-0",
                  tint.bg,
                )}
              >
                <Icon className={cn("h-5 w-5", tint.fg)} />
              </div>
            ) : null}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
