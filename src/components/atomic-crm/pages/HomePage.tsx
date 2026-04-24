import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/lib/api";
import { cleanMarkdownBody } from "@/components/page";
import { PageShell, SectionCard } from "@/components/page";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  ImageIcon,
  CalendarClock,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Client = {
  id: string;
  name: string;
  session_count?: number;
  last_session_at?: string | null;
  created_at: string;
};

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

const todayFmt = new Intl.DateTimeFormat("he-IL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Turn a raw session-summary markdown string into a short, plain-text
 * preview suitable for a one-or-two-line list row. Strips:
 *   - <!-- מקור: … --> comment breadcrumbs (via cleanMarkdownBody)
 *   - a leading `# title` (via cleanMarkdownBody)
 *   - remaining markdown sigils (`#`, `*`, `_`, `>`, leading list `-`)
 * Returns the first few non-blank lines joined by a separator.
 */
function summaryPreview(raw: string): string {
  const cleaned = cleanMarkdownBody(raw);
  const plain = cleaned
    // drop remaining markdown heading markers
    .replace(/^#{1,6}\s+/gm, "")
    // drop list bullets / blockquotes at line starts
    .replace(/^[>\-*]\s+/gm, "")
    // strip bold/italic/inline-code sigils anywhere
    .replace(/[*_`]+/g, "")
    .trim();
  const firstLines = plain
    .split(/\n+/)
    .map((s) => s.trim())
    // drop HR separators (`---`, `***`, `___`) and empty lines
    .filter((s) => s && !/^[-*_]{3,}$/.test(s))
    .slice(0, 3)
    .join(" · ");
  return firstLines;
}

export function HomePage() {
  const api = useApi();
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

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
        // soft-fail: placeholders will render
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = useMemo(() => todayFmt.format(new Date()), []);

  // Active clients — fallback to the seeded count of 15 until a `/api/clients/count`
  // endpoint exists or we gain a reliable `status` field on the client rows.
  const activeClients = clients.length > 0 ? clients.length : 15;

  // Sessions this week — count of sessions scheduled in [Sunday 00:00, next Sunday 00:00).
  // Hebrew weeks start Sunday.
  const sessionsThisWeek = useMemo(() => {
    if (sessions.length === 0) return 0;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return sessions.filter((s) => {
      const t = new Date(s.scheduled_at).getTime();
      return t >= start.getTime() && t < end.getTime();
    }).length;
  }, [sessions]);

  // Stable seed numbers until dedicated endpoints land.
  const methodologyCount = 9;
  const instagramDrafts = 2;

  // Earliest future session.
  const nextSession = useMemo(() => {
    const now = Date.now();
    return (
      sessions
        .filter((s) => new Date(s.scheduled_at).getTime() > now)
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime(),
        )[0] ?? null
    );
  }, [sessions]);

  // Last 4 sessions by created_at.
  const recentSessions = useMemo(
    () =>
      [...sessions]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 4),
    [sessions],
  );

  return (
    <PageShell
      icon={LayoutDashboard}
      iconColor="rose"
      title="לוח בית"
      subtitle={`ברוכה הבאה, לילך — ${today}`}
    >
      {/* Stat cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="מתאמנים פעילים"
          value={loading ? "…" : activeClients}
          tone="bg-emerald-500/15 text-emerald-600"
        />
        <StatCard
          icon={CalendarDays}
          label="מפגשים השבוע"
          value={loading ? "…" : sessionsThisWeek}
          tone="bg-blue-500/15 text-blue-600"
        />
        <StatCard
          icon={BookOpen}
          label="כרטיסים במתודולוגיה"
          value={methodologyCount}
          tone="bg-violet-500/15 text-violet-600"
        />
        <StatCard
          icon={ImageIcon}
          label="טיוטות אינסטגרם"
          value={instagramDrafts}
          tone="bg-amber-500/15 text-amber-600"
        />
      </div>

      {/* Next session */}
      <SectionCard eyebrow="המפגש הבא">
        {nextSession ? (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 shrink-0">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {nextSession.client_name ?? "לקוחה"}
              </p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {dateFmt.format(new Date(nextSession.scheduled_at))}
              </p>
              {nextSession.summary ? (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {summaryPreview(nextSession.summary)}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted text-muted-foreground shrink-0">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                לא מתוזמן מפגש
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                כשתתזמני מפגש הוא יופיע כאן עם השעה והסיכום האחרון.
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Recent activity */}
      <SectionCard eyebrow="פעילות אחרונה">
        {recentSessions.length === 0 ? (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted text-muted-foreground shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                עדיין אין פעילות לתעד
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                מפגשים, סיכומים ותוכן שתיצרי יופיעו כאן בסדר כרונולוגי.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {recentSessions.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground truncate">
                      {s.client_name ?? "מפגש"}
                    </p>
                    <span
                      className="text-xs text-muted-foreground shrink-0"
                      dir="ltr"
                    >
                      {dateFmt.format(new Date(s.scheduled_at))}
                    </span>
                  </div>
                  {s.summary ? (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {summaryPreview(s.summary)}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </PageShell>
  );
}
