import type { KeyValueSection } from "../types";

export function KeyValueSection({ section }: { section: KeyValueSection }) {
  return (
    <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-2 text-sm">
      {section.items.map((item, i) => (
        <div key={i} className="contents">
          <dt className="text-muted-foreground font-medium">{item.label}</dt>
          <dd className="text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
