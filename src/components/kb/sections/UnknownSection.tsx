import { AlertTriangle } from "lucide-react";

// Rendered when section.type is not one of the 13 known types.
// Partial-migration safety: don't crash, show a visible warning card instead.
export function UnknownSection({ section }: { section: { type: string } }) {
  return (
    <div className="rounded-lg border border-amber-400/60 bg-amber-50/40 dark:bg-amber-500/5 p-3">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">
          Unknown section type: <code className="rounded bg-amber-100 dark:bg-amber-500/10 px-1">{section.type}</code>
        </span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Rendered as JSON for inspection. Add a renderer for this type under{" "}
        <code>src/components/kb/sections/</code>.
      </div>
      <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted/50 p-2 text-xs text-foreground/80">
        {JSON.stringify(section, null, 2)}
      </pre>
    </div>
  );
}
