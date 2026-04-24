import { ClipboardList } from "lucide-react";
import { PageShell, GuideMarkdown } from "@/components/page";

// Auto-generated from clients/lilah/my-jarvis/Docs/אוטומציות/אוטומציית-סיכום-פגישה/תבנית-2-הכנה-למפגש-הבא.md
// Do not hand-edit the SECTIONS array below; regenerate from the source markdown.

const SECTIONS: Array<{ label: string; body: string; source: string }> = [
  {
    "label": "תבנית 2 — הכנה למפגש הבא",
    "body": "# הכנה למפגש הבא - [שם המתאמנת]\n\n**מפגש קודם:** [מספר]\n**תאריך המפגש הקודם:** DD/MM/YYYY\n**מפגש הבא:** [מספר]\n**תאריך מתוכנן:** DD/MM/YYYY\n\n---\n\n## 1. מעקב אחר משימות מהמפגש הקודם\n\n### משימות שנתנו:\n- [ ] **[משימה 1]** - [תיאור קצר]\n- [ ] **[משימה 2]** - [תיאור קצר]\n- [ ] **[משימה 3]** - [תיאור קצר]\n\n### שאלות לבדיקה:\n- האם עשתה את המשימות?\n- מה עבד? מה לא עבד?\n- מה למדה מהתהליך?\n\n---\n\n## 2. נושאים שנשארו פתוחים\n\n### נושא 1: [שם הנושא]\n**למה צריך לחזור:**\n[הסבר]\n\n**שאלות לשאול:**\n- [שאלה 1]\n- [שאלה 2]\n\n### נושא 2: [שם הנושא]\n**למה צריך לחזור:**\n[הסבר]\n\n**שאלות לשאול:**\n- [שאלה 1]\n- [שאלה 2]\n\n---\n\n## 3. דברים לעקוב אחריהם\n\n### מצב/אירוע שצריך לעקוב:\n- **[אירוע/מצב]** - [למה חשוב לבדוק]\n- **[אירוע/מצב]** - [למה חשוב לבדוק]\n\n---\n\n## 4. כלים/מושגים לחזור עליהם\n\n### כלי: [שם הכלי]\n**למה לחזור:**\n[הסבר]\n\n**איך לחזור:**\n- [דרך 1]\n- [דרך 2]\n\n---\n\n## 5. תחומים להעמקה\n\n### תחום: [נושא להעמקה]\n**למה להעמיק:**\n[הסבר]\n\n**כיוון אפשרי:**\n[רעיונות לעבודה]\n\n---\n\n## 6. התראות ונקודות לשים לב\n\n### 🚨 קריטי:\n- [דבר שחייב לטפל בו]\n\n### ⚠️ חשוב:\n- [דבר שכדאי לטפל בו]\n\n### 💡 רעיון:\n- [משהו שאפשר לנסות]\n\n---\n\n## 7. מטרות המפגש הבא (טיוטה)\n\n**מה אני רוצה שנשיג במפגש הבא:**\n1. [מטרה 1]\n2. [מטרה 2]\n3. [מטרה 3]\n\n---\n\n## 8. חומרים/משאבים להכין\n\n- [ ] [חומר 1]\n- [ ] [חומר 2]\n- [ ] [חומר 3]\n\n---\n\n## 9. הערות אישיות\n\n[מקום חופשי לכל מחשבה/תזכורת נוספת]\n\n---\n\n**עודכן:** DD/MM/YYYY\n",
    "source": "תבנית-2-הכנה-למפגש-הבא.md"
  }
];

export function Guide009TemplateNextSessionPrep() {
  return (
    <div dir="rtl">
      <PageShell
        icon={ClipboardList}
        iconColor="blue"
        title="תבנית 2 — הכנה למפגש הבא"
        subtitle="תבנית הכנה למאמנת לפני מפגש"
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

(Guide009TemplateNextSessionPrep as any).path = "/guides/template-next-session-prep";
