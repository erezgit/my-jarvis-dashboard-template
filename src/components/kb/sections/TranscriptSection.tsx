import type { TranscriptSection } from "../types";

export function TranscriptSection({ section }: { section: TranscriptSection }) {
  return (
    <div className="space-y-3">
      {section.speakers.map((s, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {s.name}
          </div>
          <div className="flex-1 text-sm text-foreground whitespace-pre-wrap">{s.line}</div>
        </div>
      ))}
    </div>
  );
}
