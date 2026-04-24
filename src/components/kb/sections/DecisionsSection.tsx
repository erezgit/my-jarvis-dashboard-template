import { ArrowRight } from "lucide-react";
import type { DecisionsSection } from "../types";

export function DecisionsSection({ section }: { section: DecisionsSection }) {
  return (
    <div className="space-y-3">
      {section.items.map((item, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Question</div>
          <div className="mt-0.5 text-sm text-foreground">{item.q}</div>
          <div className="mt-3 flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Decision</div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">{item.decision}</div>
              {item.rationale && (
                <div className="mt-1 text-sm text-muted-foreground">{item.rationale}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
