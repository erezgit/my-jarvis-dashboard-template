import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { DebatesSection } from "../types";

export function DebatesSection({ section }: { section: DebatesSection }) {
  return (
    <div className="space-y-4">
      {section.items.map((item, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Position</div>
          <div className="mt-0.5 text-sm font-semibold text-foreground">{item.position}</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-emerald-500/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <ThumbsUp className="h-3.5 w-3.5" />
                For
              </div>
              <div className="mt-1 text-sm text-foreground whitespace-pre-wrap">{item.for}</div>
            </div>
            <div className="rounded-md bg-rose-500/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <ThumbsDown className="h-3.5 w-3.5" />
                Against
              </div>
              <div className="mt-1 text-sm text-foreground whitespace-pre-wrap">{item.against}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
