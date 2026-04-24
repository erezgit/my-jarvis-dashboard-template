import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2, Search } from "lucide-react";
import type { PageContentListItem } from "./types";

async function fetchKbList(): Promise<PageContentListItem[]> {
  const res = await fetch("/api/kb");
  if (!res.ok) throw new Error(`Failed to load /api/kb: HTTP ${res.status}`);
  return (await res.json()) as PageContentListItem[];
}

// Group by slug prefix: "kb-doc/..." -> "Docs", "kb-project/..." -> "Projects", etc.
function prefixOf(slug: string): string {
  const first = slug.split("/")[0];
  return first || "Other";
}

export function KnowledgeBasePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["kb-list"],
    queryFn: fetchKbList,
    staleTime: 60_000,
  });
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    if (!data) return {};
    const filtered = query
      ? data.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.page_slug.toLowerCase().includes(query.toLowerCase())
        )
      : data;
    const groups: Record<string, PageContentListItem[]> = {};
    for (const item of filtered) {
      const pfx = prefixOf(item.page_slug);
      (groups[pfx] ||= []).push(item);
    }
    for (const k of Object.keys(groups)) {
      groups[k].sort((a, b) => a.title.localeCompare(b.title));
    }
    return groups;
  }, [data, query]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">
          All page_content entries, grouped by slug prefix.
        </p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages…"
          className="w-full rounded-lg border bg-background px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-400/60 bg-rose-50/40 dark:bg-rose-500/5 p-4 text-sm text-rose-600">
          Failed to load KB list: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && Object.keys(grouped).length === 0 && (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          No pages match “{query}”.
        </div>
      )}

      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([prefix, items]) => (
          <section key={prefix} className="space-y-1.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {prefix} <span className="text-muted-foreground/60">({items.length})</span>
            </h2>
            <ul className="rounded-lg border divide-y">
              {items.map((item) => (
                <li key={item.page_slug}>
                  <Link
                    to={`/kb/${item.page_slug.replace(/^kb-[^/]+\//, "")}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.page_slug}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
