import { HelpCircle } from "lucide-react";
import type { OpenQuestionsSection } from "../types";

export function OpenQuestionsSection({ section }: { section: OpenQuestionsSection }) {
  return (
    <ul className="space-y-2">
      {section.items.map((q, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span className="text-foreground">{q}</span>
        </li>
      ))}
    </ul>
  );
}
