import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CalendarClock,
  Target,
  Sparkles,
  Activity,
  StickyNote,
} from "lucide-react";
import { useApi } from "@/lib/api";
import {
  PageShell,
  SectionCard,
  cleanMarkdownBody,
  initials,
} from "@/components/page";
import { GuideMarkdown } from "@/components/page/GuideMarkdown";
import { cn } from "@/lib/utils";

type ClientDetail = {
  id: string;
  name: string;
  type: "individual" | "couple" | "student" | "lead";
  goal: string | null;
  status: "active" | "paused" | "archived";
  phone: string | null;
  email: string | null;
  notes: string | null;
  session_count: number;
  created_at: string;
  updated_at: string;
  sessions: {
    id: string;
    scheduled_at: string;
    summary: string | null;
    created_at: string;
  }[];
};

const TYPE_LABELS = {
  individual: "פרטי",
  couple: "זוגי",
  student: "סטודנטית",
  lead: "ליד",
} as const;

const STATUS_LABELS = {
  active: "פעילה",
  paused: "מושהית",
  archived: "בארכיון",
} as const;

const STATUS_TONES = {
  active: {
    bg: "bg-emerald-50",
    border: "border-emerald-200/70",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
  },
  paused: {
    bg: "bg-amber-50",
    border: "border-amber-200/70",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  archived: {
    bg: "bg-stone-100",
    border: "border-stone-200/70",
    text: "text-stone-700",
    dot: "bg-stone-400",
  },
} as const;

const TYPE_TONES = {
  individual: {
    bg: "bg-blue-50",
    border: "border-blue-200/70",
    text: "text-blue-800",
  },
  couple: {
    bg: "bg-violet-50",
    border: "border-violet-200/70",
    text: "text-violet-800",
  },
  student: {
    bg: "bg-emerald-50",
    border: "border-emerald-200/70",
    text: "text-emerald-800",
  },
  lead: {
    bg: "bg-amber-50",
    border: "border-amber-200/70",
    text: "text-amber-800",
  },
} as const;

// DD.MM.YYYY — date-only for session timeline badges (LTR)
const dateOnlyFmt = new Intl.DateTimeFormat("he-IL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// Short ordinal month for the pill: "28 ינו׳"
const datePillFmt = new Intl.DateTimeFormat("he-IL", {
  day: "2-digit",
  month: "short",
});

const yearFmt = new Intl.DateTimeFormat("he-IL", { year: "numeric" });

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api(`/api/clients/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ClientDetail;
        if (!cancelled) setClient(data);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "שגיאה בטעינה");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !client) {
    return (
      <PageShell title="טוען..." iconColor="emerald">
        <p className="text-sm text-muted-foreground">טוענת את פרטי הלקוחה…</p>
      </PageShell>
    );
  }

  if (error || !client) {
    return (
      <PageShell title="לקוחה לא נמצאה" iconColor="rose">
        <p className="text-sm text-muted-foreground">
          {error ?? "לא נמצאה לקוחה לפי המזהה."}
        </p>
        <Link
          to="/clients"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה לרשימת הלקוחות
        </Link>
      </PageShell>
    );
  }

  const statusTone = STATUS_TONES[client.status];
  const typeTone = TYPE_TONES[client.type];
  const lastSession = client.sessions[0] ?? null;

  return (
    <div className="-mx-6 -my-8 px-6 py-8 min-h-svh bg-gradient-to-b from-amber-50/60 via-amber-50/30 to-stone-50/60">
      <div className="mx-auto max-w-4xl">
        {/* Back link */}
        <Link
          to="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה לכל הלקוחות
        </Link>

        {/* Hero */}
        <header className="mb-6 flex items-start gap-4">
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold",
              "bg-gradient-to-br from-rose-200/80 to-amber-200/80",
              "text-rose-900/80 shadow-sm",
            )}
            aria-hidden
          >
            {initials(client.name)}
          </div>
          <div className="min-w-0 pt-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
              {client.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {TYPE_LABELS[client.type]} · {client.session_count} מפגשים
            </p>
          </div>
        </header>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <StatChip
            icon={Activity}
            label="סטטוס"
            value={STATUS_LABELS[client.status]}
            toneBg={statusTone.bg}
            toneBorder={statusTone.border}
            toneText={statusTone.text}
            dot={statusTone.dot}
          />
          <StatChip
            icon={Sparkles}
            label="סוג"
            value={TYPE_LABELS[client.type]}
            toneBg={typeTone.bg}
            toneBorder={typeTone.border}
            toneText={typeTone.text}
          />
          <StatChip
            icon={CalendarDays}
            label="מפגשים"
            value={String(client.session_count)}
            toneBg="bg-blue-50"
            toneBorder="border-blue-200/70"
            toneText="text-blue-800"
          />
          <StatChip
            icon={CalendarClock}
            label="מפגש אחרון"
            value={
              lastSession
                ? dateOnlyFmt.format(new Date(lastSession.scheduled_at))
                : "—"
            }
            toneBg="bg-stone-50"
            toneBorder="border-stone-200/70"
            toneText="text-stone-700"
            dir="ltr"
          />
        </div>

        {/* Goal card — primary, above the fold */}
        <SectionCard eyebrow="מטרת האימון" variant={client.goal ? "amber" : "default"}>
          {client.goal ? (
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 mt-0.5 text-amber-600 shrink-0" />
              <p className="text-[15px] text-foreground leading-relaxed">
                {client.goal}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              עוד לא הוגדרה מטרה ללקוחה הזו.
            </p>
          )}
        </SectionCard>

        {/* Sessions timeline */}
        <section className="mt-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              מפגשים · ציר הזמן
            </h2>
            <span className="text-xs text-muted-foreground">
              {client.sessions.length} סה״כ
            </span>
          </div>

          {client.sessions.length === 0 ? (
            <SectionCard>
              <div className="flex items-start gap-3 text-muted-foreground">
                <CalendarDays className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="text-sm">
                  תעדי את המפגש הראשון בעמוד{" "}
                  <Link to="/session" className="text-primary hover:underline">
                    מפגש
                  </Link>
                  .
                </p>
              </div>
            </SectionCard>
          ) : (
            <ol className="relative space-y-4">
              {/* Connecting line (RTL: runs down the right side) */}
              <span
                className="absolute top-4 bottom-4 right-[19px] w-px bg-gradient-to-b from-rose-200 via-amber-200/60 to-transparent pointer-events-none"
                aria-hidden
              />
              {client.sessions.map((s, idx) => (
                <SessionTimelineItem
                  key={s.id}
                  session={s}
                  index={client.sessions.length - idx}
                />
              ))}
            </ol>
          )}
        </section>

        {/* Notes — subtle, muted, less visual weight */}
        {client.notes ? (
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote className="h-3.5 w-3.5 text-muted-foreground/60" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                הערות
              </h3>
            </div>
            <div className="rounded-lg border border-dashed border-stone-300/60 bg-stone-50/50 p-4">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  toneBg,
  toneBorder,
  toneText,
  dot,
  dir,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  toneBg: string;
  toneBorder: string;
  toneText: string;
  dot?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 flex items-center gap-2.5",
        toneBg,
        toneBorder,
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", toneText)} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </p>
        <p
          className={cn("text-sm font-semibold truncate flex items-center gap-1.5", toneText)}
          dir={dir}
        >
          {dot ? (
            <span
              className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)}
              aria-hidden
            />
          ) : null}
          {value}
        </p>
      </div>
    </div>
  );
}

function SessionTimelineItem({
  session,
  index,
}: {
  session: ClientDetail["sessions"][number];
  index: number;
}) {
  const date = new Date(session.scheduled_at);
  const body = cleanMarkdownBody(session.summary);

  return (
    <li className="relative pr-12">
      {/* Date pill — sits on the timeline axis */}
      <div className="absolute top-0 right-0 flex h-10 w-10 flex-col items-center justify-center rounded-full bg-white border border-rose-200 shadow-sm text-center leading-tight">
        <span className="text-[10px] font-semibold text-rose-700" dir="ltr">
          {datePillFmt.format(date)}
        </span>
        <span className="text-[8px] font-medium text-rose-500/70" dir="ltr">
          {yearFmt.format(date)}
        </span>
      </div>

      <article className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Card header */}
        <header className="px-5 py-3 border-b bg-gradient-to-l from-amber-50/40 to-transparent flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 min-w-6 px-1.5 items-center justify-center rounded-md bg-rose-500/10 text-rose-700 text-xs font-semibold">
              #{index}
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              מפגש
            </h3>
          </div>
          <time
            className="text-xs text-muted-foreground"
            dateTime={session.scheduled_at}
            dir="ltr"
          >
            {dateOnlyFmt.format(date)}
          </time>
        </header>

        {/* Card body — markdown-rendered */}
        {body ? (
          <div className="px-5 py-4">
            <GuideMarkdown body={body} />
          </div>
        ) : (
          <div className="px-5 py-4">
            <p className="text-sm text-muted-foreground italic">
              לא נשמר סיכום למפגש הזה.
            </p>
          </div>
        )}
      </article>
    </li>
  );
}
