import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Readable Hebrew body text block.
 *
 * By default preserves newlines and whitespace from the source markdown
 * (think: content imported from .md files). Keeps line-height relaxed,
 * a comfortable text size, and a subtle text color.
 *
 * Don't use for UI chrome; use for body copy.
 */
export type BodyTextProps = {
  children: ReactNode;
  className?: string;
  /** Whether to preserve whitespace/newlines (`whitespace-pre-wrap`). Default: true. */
  preserveWhitespace?: boolean;
};

export function BodyText({
  children,
  className,
  preserveWhitespace = true,
}: BodyTextProps) {
  return (
    <div
      className={cn(
        "text-[15px] leading-[1.8] text-foreground/90",
        preserveWhitespace && "whitespace-pre-wrap",
        className,
      )}
    >
      {children}
    </div>
  );
}
