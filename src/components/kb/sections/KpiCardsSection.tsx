import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { KpiCardsSection } from "../types";

const TREND_META = {
  up: { Icon: TrendingUp, className: "text-emerald-500" },
  down: { Icon: TrendingDown, className: "text-rose-500" },
  flat: { Icon: Minus, className: "text-muted-foreground" },
} as const;

export function KpiCardsSection({ section }: { section: KpiCardsSection }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {section.items.map((item, i) => {
        const meta = item.trend ? TREND_META[item.trend] : null;
        const Icon = meta?.Icon;
        return (
          <div key={i} className="rounded-lg border p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {item.label}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-2xl font-semibold text-foreground">{item.value}</div>
              {Icon && <Icon className={`h-4 w-4 ${meta!.className}`} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
