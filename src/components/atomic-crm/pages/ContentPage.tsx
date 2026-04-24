import { PageShell } from "@/components/page";
import { Button } from "@/components/ui/button";
import { ImageIcon, Plus, FileText, CheckCircle2, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ContentCard = {
  id: string;
  title: string;
  kind: string;
  updated: string;
  body?: string;
};

// Placeholder data. Matches the 2 Instagram drafts seeded in
// sql/002_seed_lilach.sql. Swap for a useApi() fetch when a
// /api/content endpoint lands.
const draftsSeed: ContentCard[] = [
  {
    id: "draft-1",
    title: "נטיית החזרתיות — המטריה שלמדה אותנו על ביטחון עצמי",
    kind: "פוסט אינסטגרם",
    updated: "14 בנובמבר",
    body: "טיוטה על נטיית החזרתיות ואיך היא משפיעה על הביטחון העצמי. חסר: פתיח וקריאה לפעולה.",
  },
  {
    id: "draft-2",
    title: "איך לזהות את הקול הפנימי שמנהל אותך",
    kind: "פוסט אינסטגרם",
    updated: "9 בנובמבר",
    body: "שלוש שאלות שחושפות את הקול הפנימי. עדיין בשלב ניסוח — חסר עיצוב לקרוסלה.",
  },
];

const readySeed: ContentCard[] = [];
const publishedSeed: ContentCard[] = [];

function Column({
  title,
  count,
  tone,
  icon: Icon,
  children,
  empty,
}: {
  title: string;
  count: number;
  tone: string;
  icon: LucideIcon;
  children: React.ReactNode;
  empty: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col min-h-[220px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${tone}`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
          {count}
        </span>
      </div>

      {count === 0 ? (
        <div className="rounded-lg border border-dashed bg-background/40 p-6 text-center flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {empty}
          </p>
        </div>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}

function Card({ card }: { card: ContentCard }) {
  return (
    <div className="rounded-lg border bg-background/60 p-4 hover:bg-background transition-colors cursor-pointer">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {card.kind}
        </span>
        <span className="text-[10px] text-muted-foreground">{card.updated}</span>
      </div>
      <h4 className="text-sm font-semibold text-foreground leading-snug mb-2">
        {card.title}
      </h4>
      {card.body ? (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {card.body}
        </p>
      ) : null}
    </div>
  );
}

export function ContentPage() {
  const drafts = draftsSeed;
  const ready = readySeed;
  const published = publishedSeed;

  return (
    <PageShell
      icon={ImageIcon}
      iconColor="violet"
      title="תוכן"
      subtitle="צנרת פרסום — מטיוטה, דרך מה שמוכן לצאת, ועד למה שכבר פורסם."
      actions={
        <Button disabled className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          צור תוכן חדש
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Column
          title="טיוטות"
          count={drafts.length}
          tone="bg-amber-500/15 text-amber-600"
          icon={FileText}
          empty="עדיין אין טיוטות. התחילי לרשום רעיון חדש."
        >
          {drafts.map((c) => (
            <Card key={c.id} card={c} />
          ))}
        </Column>

        <Column
          title="מוכן לפרסום"
          count={ready.length}
          tone="bg-blue-500/15 text-blue-600"
          icon={CheckCircle2}
          empty="אין עדיין תוכן מוכן לצאת. כשטיוטה תהיה גמורה, גררי אותה לכאן."
        >
          {ready.map((c) => (
            <Card key={c.id} card={c} />
          ))}
        </Column>

        <Column
          title="פורסם"
          count={published.length}
          tone="bg-emerald-500/15 text-emerald-600"
          icon={Send}
          empty="היסטוריית הפרסומים תופיע כאן."
        >
          {published.map((c) => (
            <Card key={c.id} card={c} />
          ))}
        </Column>
      </div>
    </PageShell>
  );
}
