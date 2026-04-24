import { HeartHandshake } from "lucide-react";
import { PageShell, GuideMarkdown } from "@/components/page";

// Auto-generated from clients/lilah/my-jarvis/אימון-זוגי/README.md
// Do not hand-edit the SECTIONS array below; regenerate from the source markdown.

const SECTIONS: Array<{ label: string; body: string; source: string }> = [
  {
    "label": "מתודולוגיית אימון זוגי",
    "body": "# אימון זוגי\n\n## מבנה התיקייה\n\nתיקייה זו מכילה את כל הכרטיסיות הקשורות לפיתוח מתודולוגיית אימון זוגות.\n\n```\nאימון-זוגי/\n├── README.md\n├── 001-מתודולוגיית-אימון-זוגי/    # פיתוח הגישה הייחודית לאימון זוגות\n└── ...                              # כרטיסיות נוספות בהמשך\n```\n\n## כרטיסיות\n\n### 001 - מתודולוגיית אימון זוגי\nפיתוח המתודולוגיה: מחקר גישות, הגדרת ייחוד, עיצוב כלים ותהליכים.\n\n---\n\n**תאריך יצירה:** 27.02.2026\n",
    "source": "README.md"
  }
];

export function Guide011CouplesCoachingMethodology() {
  return (
    <div dir="rtl">
      <PageShell
        icon={HeartHandshake}
        iconColor="rose"
        title="מתודולוגיית אימון זוגי"
        subtitle="פיתוח גישה ייחודית לאימון זוגות — מחקר, ייחוד, כלים ותהליכים"
      >
        {SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <GuideMarkdown body={section.body} />
            <p className="text-[11px] text-muted-foreground/70 tracking-wide">
              מקור: {section.source}
            </p>
          </div>
        ))}
      </PageShell>
    </div>
  );
}

(Guide011CouplesCoachingMethodology as any).path = "/guides/couples-coaching-methodology";
