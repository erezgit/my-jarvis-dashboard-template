import type { DeepDivesSection } from "../types";

export function DeepDivesSection({ section }: { section: DeepDivesSection }) {
  return (
    <div className="space-y-4">
      {section.items.map((item, i) => (
        <details key={i} className="rounded-lg border p-3 group">
          <summary className="cursor-pointer text-sm font-semibold text-foreground marker:text-muted-foreground">
            {item.title}
          </summary>
          <div className="mt-3 text-sm text-foreground whitespace-pre-wrap">{item.body}</div>
        </details>
      ))}
    </div>
  );
}
