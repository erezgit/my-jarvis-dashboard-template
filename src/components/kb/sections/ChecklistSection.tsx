import { Check, Square } from "lucide-react";
import type { ChecklistSection } from "../types";

export function ChecklistSection({ section }: { section: ChecklistSection }) {
  return (
    <ul className="space-y-1.5">
      {section.items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className="mt-0.5 shrink-0">
            {item.done ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
          <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
