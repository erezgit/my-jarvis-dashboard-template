import { useEffect, useMemo, useState } from "react";
import { Brain, AlertCircle } from "lucide-react";
import { useApi } from "@/lib/api";

type MemoryType =
  | "session_log"
  | "learning"
  | "user_fact"
  | "area"
  | "principle"
  | "identity";

type MemoryRow = {
  id: string;
  agent: string | null;
  type: MemoryType;
  title: string | null;
  body: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

const TYPES: { value: MemoryType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "session_log", label: "Sessions" },
  { value: "learning", label: "Learnings" },
  { value: "principle", label: "Principles" },
  { value: "identity", label: "Identity" },
  { value: "user_fact", label: "User facts" },
  { value: "area", label: "Areas" },
];

const TYPE_STYLES: Record<MemoryType, string> = {
  session_log:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  learning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  user_fact:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  area: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  principle:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  identity: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
};

const AGENT_COLORS: Record<string, string> = {
  jarvis: "text-blue-500",
  atlas: "text-orange-500",
  ben: "text-emerald-500",
  nova: "text-violet-500",
  emma: "text-pink-500",
  iris: "text-sky-500",
};

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function MemoryPage() {
  const api = useApi();
  const [rows, setRows] = useState<MemoryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<MemoryType | "all">("all");
  const [activeAgent, setActiveAgent] = useState<string | "all">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api("/api/memories");
        if (!res.ok) {
          if (!cancelled) setError(`HTTP ${res.status}`);
          return;
        }
        const data = (await res.json()) as MemoryRow[];
        if (!cancelled) setRows(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return null;
    return rows.filter((m) => {
      if (activeType !== "all" && m.type !== activeType) return false;
      if (activeAgent !== "all" && m.agent !== activeAgent) return false;
      return true;
    });
  }, [rows, activeType, activeAgent]);

  const agents = useMemo(() => {
    if (!rows) return [];
    return Array.from(
      new Set(rows.map((m) => m.agent).filter((a): a is string => !!a)),
    ).sort();
  }, [rows]);

  return (
    <div className="w-full h-svh overflow-auto bg-background">
      <div className="border-b px-6 py-5 flex items-center gap-3">
        <Brain className="h-5 w-5 text-foreground/80" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold leading-tight">Memory</h1>
          <p className="text-xs text-muted-foreground">
            Sessions, learnings, identity, principles, user facts, areas — the
            agent brain across sessions.
          </p>
        </div>
        {filtered && (
          <span className="text-xs text-muted-foreground">
            {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
          </span>
        )}
      </div>

      <div className="border-b px-6 py-3 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveType(t.value)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                activeType === t.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {agents.length > 0 && (
          <>
            <span className="text-xs text-muted-foreground/50 mx-1">|</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveAgent("all")}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeAgent === "all"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                All agents
              </button>
              {agents.map((a) => (
                <button
                  key={a}
                  onClick={() => setActiveAgent(a)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeAgent === a
                      ? "bg-foreground text-background"
                      : `${AGENT_COLORS[a] ?? ""} hover:bg-accent`
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-6 py-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30 p-4 flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Failed to load: {error}</span>
          </div>
        )}

        {!error && filtered === null && (
          <div className="text-sm text-muted-foreground">Loading…</div>
        )}

        {filtered && filtered.length === 0 && (
          <div className="rounded-xl border bg-muted/30 p-8 text-center">
            <Brain className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium">No memories yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              The Stop hook saves a <code>session_log</code> every four turns.
              Run a few turns to populate this view.
            </p>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border bg-card p-4 hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${TYPE_STYLES[m.type]}`}
                    >
                      {m.type.replace("_", " ")}
                    </span>
                    {m.agent && (
                      <span
                        className={`text-xs font-semibold ${AGENT_COLORS[m.agent] ?? "text-muted-foreground"}`}
                      >
                        {m.agent}
                      </span>
                    )}
                    {m.title && (
                      <span className="text-sm font-medium">{m.title}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatTimestamp(m.created_at)}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed font-sans">
                  {m.body}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

(MemoryPage as any).path = "/memory";
