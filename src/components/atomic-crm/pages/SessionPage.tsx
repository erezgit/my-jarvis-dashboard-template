import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useApi } from "@/lib/api";
import { PageShell, SectionCard, cleanMarkdownBody } from "@/components/page";
import { GuideMarkdown } from "@/components/page/GuideMarkdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarClock,
  UserRound,
  History,
  ListChecks,
  MessageSquareQuote,
  Wand2,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Client = { id: string; name: string };
type Session = {
  id: string;
  client_id: string;
  client_name: string | null;
  scheduled_at: string;
  summary: string | null;
  created_at: string;
};

const dateFmt = new Intl.DateTimeFormat("he-IL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function FrameworkSlot({
  icon: Icon,
  tone,
  title,
  body,
  bodyNode,
}: {
  icon: LucideIcon;
  tone: string;
  title: string;
  body: string;
  // Optional override — when provided, renders this node instead of the
  // plain <p>. Used for the session-summary slot, where `body` is
  // markdown that needs structured rendering.
  bodyNode?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed bg-background/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${tone}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      {bodyNode ?? (
        <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
      )}
    </div>
  );
}

export function SessionPage() {
  const api = useApi();
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [dump, setDump] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          api("/api/clients"),
          api("/api/sessions"),
        ]);
        if (cancelled) return;
        if (cRes.ok) setClients((await cRes.json()) as Client[]);
        if (sRes.ok) setSessions((await sRes.json()) as Session[]);
      } catch {
        // soft-fail
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) ?? null,
    [clients, selectedClientId],
  );

  const lastSessionForClient = useMemo(() => {
    if (!selectedClientId) return null;
    return (
      sessions
        .filter((s) => s.client_id === selectedClientId)
        .sort(
          (a, b) =>
            new Date(b.scheduled_at).getTime() -
            new Date(a.scheduled_at).getTime(),
        )[0] ?? null
    );
  }, [sessions, selectedClientId]);

  return (
    <PageShell
      icon={CalendarClock}
      iconColor="blue"
      title="מפגש"
      subtitle="הכנה לפני המפגש וסיכום אחריו. אוטומציה מלאה בדרך."
    >
      {/* ─────────────────────────── Top half: pre-session prep ─────────────────────── */}
      <SectionCard
        title="הכנה למפגש"
        subtitle="בחרי לקוחה כדי לטעון את הסיכום האחרון, תזכורת תוכנית העבודה ופתיחה מוצעת."
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700">
            לפני המפגש
          </span>
        </div>

        {/* Client picker */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted text-muted-foreground shrink-0">
            <UserRound className="w-4 h-4" />
          </div>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">
              {clients.length === 0
                ? "אין לקוחות — הוסיפי קודם לקוחה"
                : "בחרי לקוחה"}
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {!selectedClient ? (
          <div className="rounded-lg border border-dashed bg-background/40 px-4 py-3 mb-4">
            <p className="text-sm text-muted-foreground">טרם נבחר לקוח.</p>
          </div>
        ) : null}

        {/* Three-part framework */}
        <div className="grid gap-3 md:grid-cols-3">
          <FrameworkSlot
            icon={History}
            tone="bg-violet-500/15 text-violet-600"
            title="סיכום מהמפגש האחרון"
            body={
              selectedClient
                ? "לא נשמר סיכום מהמפגש האחרון. לאחר שתתעדי מפגש הוא יופיע כאן."
                : "בחרי לקוחה כדי לראות את הסיכום מהפעם שעברה."
            }
            bodyNode={
              lastSessionForClient?.summary
                ? (
                  <div className="max-h-72 overflow-y-auto pr-1 -mr-1">
                    <GuideMarkdown
                      body={cleanMarkdownBody(lastSessionForClient.summary)}
                    />
                  </div>
                )
                : undefined
            }
          />
          <FrameworkSlot
            icon={ListChecks}
            tone="bg-emerald-500/15 text-emerald-600"
            title="תזכורת תוכנית עבודה"
            body={
              selectedClient
                ? "תוכנית העבודה הפעילה תיטען כאן מתוך עמוד הלקוחה — המטרה, הצעדים הבאים, והמשימות הפתוחות."
                : "תוכנית העבודה הפעילה של הלקוחה תופיע כאן."
            }
          />
          <FrameworkSlot
            icon={MessageSquareQuote}
            tone="bg-amber-500/15 text-amber-600"
            title="פתיחה מוצעת"
            body={
              selectedClient
                ? "הצעה לפתיחה שתחבר בין הסיכום האחרון למטרה — תיבנה אוטומטית כשנחבר את המודל."
                : "משפט פתיחה שמחבר את המפגש הקודם למטרה הנוכחית."
            }
          />
        </div>

        {lastSessionForClient ? (
          <p className="text-xs text-muted-foreground mt-4" dir="ltr">
            Last session:{" "}
            {dateFmt.format(new Date(lastSessionForClient.scheduled_at))}
          </p>
        ) : null}
      </SectionCard>

      {/* ─────────────────────────── Bottom half: post-session dump ──────────────────── */}
      <SectionCard
        title="סיכום מפגש"
        subtitle="רשמי הכל כאחד — בלי לחשוב על מבנה. האוטומציה תחלץ סיכום, משימות ותזכורות."
      >
        <div className="flex items-center justify-end gap-3 mb-4">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700">
            בפיתוח
          </span>
        </div>

        <Textarea
          value={dump}
          onChange={(e) => setDump(e.target.value)}
          placeholder="מה קרה במפגש? על מה דיברנו, מה התחדש, מה המשימות, על מה להסתכל בפעם הבאה..."
          rows={8}
          className="resize-none mb-4"
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              האוטומציה תחלץ מהטקסט: סיכום נקי, משימות למעקב, ועדכון לתוכנית
              העבודה.
            </span>
          </div>
          <Button disabled className="gap-2">
            <Wand2 className="w-4 h-4" />
            הפעל אוטומציה
          </Button>
        </div>
      </SectionCard>
    </PageShell>
  );
}
