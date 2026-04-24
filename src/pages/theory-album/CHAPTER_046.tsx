import { BookOpen } from "lucide-react";
import { PageShell, SectionCard } from "@/components/page";

const PAGES: { label: string; body: string }[] = [
  { label: "316", body: `### לרישה לנספחים בשפת המקור סרקו את הקוד הבא:

[QR CODE IMAGE]

### הלבה של הכניה היסודית - מרגרט אי סטפנסון /

The Core of the Elementary Classroom Margaret E. Stephenson

### נטיית טבעיות והינוך מונטסורי - מריו מונטסורי /

The Human Tendencies and Montessori Education Mario Montessori

### תמלול הרצאה של ד"ר מונטסורי על ארבעת שלבי ההתפתחות /

The Four Planes Of Development by Dr. Montessori | edit by Mario Montessori

### מאמר על תצפית מאת הילה פאטל /

OBSERVATION by Hilla Patell

---

316` },
];

function isEmpty(body: string): boolean {
  const letters = body.match(/[\u0590-\u05FFa-zA-Z]/g) || [];
  return letters.length < 50;
}

export function Chapter046() {
  return (
    <div dir="rtl">
      <PageShell
        icon={BookOpen}
        iconColor="violet"
        title="פרק 46 · עמודים 316"
        subtitle="אלבום תאוריה מונטסורי"
      >
        {PAGES.map((page) => (
          <SectionCard key={page.label} eyebrow={`עמוד ${page.label}`}>
            {isEmpty(page.body) ? (
              <p className="text-sm italic text-muted-foreground/70">אין תוכן בעמוד זה</p>
            ) : (
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {page.body}
              </div>
            )}
          </SectionCard>
        ))}
      </PageShell>
    </div>
  );
}

(Chapter046 as any).path = "/theory-album/046";
