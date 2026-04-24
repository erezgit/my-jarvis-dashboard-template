import { Circle, CircleDot, CircleCheck } from "lucide-react";
import type { ActionItemsSection } from "../types";

const ICON = {
  todo: Circle,
  in_progress: CircleDot,
  done: CircleCheck,
} as const;

const STYLE = {
  todo: "text-muted-foreground",
  in_progress: "text-amber-500",
  done: "text-emerald-500",
} as const;

export function ActionItemsSection({ section }: { section: ActionItemsSection }) {
  return (
    <ul className="space-y-1.5">
      {section.items.map((item, i) => {
        const status = item.status ?? "todo";
        const Icon = ICON[status];
        return (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${STYLE[status]}`} />
            <span className={status === "done" ? "text-muted-foreground line-through" : "text-foreground"}>
              {item.text}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
