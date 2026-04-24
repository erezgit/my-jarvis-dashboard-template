import type { TimelineSection } from "../types";

export function TimelineSection({ section }: { section: TimelineSection }) {
  return (
    <ol className="relative border-s border-border pl-6 space-y-5">
      {section.items.map((item, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[1.6rem] top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
          <div className="text-xs font-medium text-muted-foreground">{item.date}</div>
          <div className="mt-0.5 text-sm font-semibold text-foreground">{item.title}</div>
          {item.body && (
            <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{item.body}</div>
          )}
        </li>
      ))}
    </ol>
  );
}
