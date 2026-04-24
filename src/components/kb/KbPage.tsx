import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { PageContent } from "./types";
import { SectionRenderer } from "./SectionRenderer";

async function fetchKbPage(slug: string): Promise<PageContent> {
  const res = await fetch(`/api/kb/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    throw new Error(`Failed to load /api/kb/${slug}: HTTP ${res.status}`);
  }
  const json = (await res.json()) as { content: PageContent };
  return json.content;
}

export function KbPage({ slug }: { slug: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["kb", slug],
    queryFn: () => fetchKbPage(slug),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-rose-400/60 bg-rose-50/40 dark:bg-rose-500/5 p-4">
          <div className="text-sm font-medium text-rose-600">Failed to load KB page</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Slug: <code className="rounded bg-muted px-1">{slug}</code>
          </div>
          {error && (
            <div className="mt-2 text-xs text-rose-600/80">{(error as Error).message}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">{data.title}</h1>
        {data.subtitle && <p className="text-sm text-muted-foreground">{data.subtitle}</p>}
      </header>
      <div className="space-y-6">
        {data.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </div>
    </article>
  );
}
