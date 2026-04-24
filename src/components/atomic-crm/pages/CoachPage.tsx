import { PageShell, SectionCard, Callout } from "@/components/page";
import { Heart, Sparkles, Leaf } from "lucide-react";

function Bullet({
  tone,
  title,
  body,
}: {
  tone: string;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3 py-2">
      <span
        className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${tone}`}
        aria-hidden
      />
      <div>
        <p className="text-sm text-foreground font-medium">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {body}
        </p>
      </div>
    </li>
  );
}

export function CoachPage() {
  return (
    <PageShell
      icon={Heart}
      iconColor="rose"
      title="לילך כמאמנת"
      subtitle="יומן הצמיחה האישי שלך."
    >
      {/* Intro callout — sets the personal tone */}
      <Callout tone="rose">
        המקום הפרטי שלך להתבוננות — מה שעובד, מה שאת עוד מגלה, ומה שמתחדד אצלך
        לאט. אף אחד אחר לא רואה את המקום הזה.
      </Callout>

      {/* Strengths */}
      <SectionCard
        title="כוחות לשמר"
        subtitle="מה שכבר עובד — הקול, המעשה, הנוכחות שלך שבתוך המפגש."
      >
        <ul className="divide-y divide-border/60">
          <Bullet
            tone="bg-emerald-500"
            title="נוכחות בגובה העיניים"
            body="את לא מתנשאת, לא מחלקת עצות מהר. את נשארת במקום שבו הלקוחה נמצאת."
          />
          <Bullet
            tone="bg-emerald-500"
            title="שאלות שחושפות, לא שמאשרות"
            body="את שואלת כדי להוציא לאור, לא כדי לקבל את התשובה שכבר את חושבת עליה."
          />
          <Bullet
            tone="bg-emerald-500"
            title="שתיקה ארוכה"
            body="את יודעת לחכות. זה אחד הדברים החזקים ביותר שיש לך בתוך מפגש."
          />
        </ul>
      </SectionCard>

      {/* Growth edges */}
      <SectionCard
        title="שיפורים בתהליך"
        subtitle="אזורי חידוד — נקודות לשים עליהן לב, לא להלקות את עצמך."
      >
        <ul className="divide-y divide-border/60">
          <Bullet
            tone="bg-amber-500"
            title="סיום מפגש"
            body="לפעמים מסיימים בלי לסכם את הצעד הבא. להוסיף משפט אחד פשוט: ״עד הפעם הבאה, מה את לוקחת איתך?״"
          />
          <Bullet
            tone="bg-amber-500"
            title="להגיד כן ליותר שקט"
            body="כשנוצר שקט לא נעים, הדחף הוא למלא. כדאי לתת לו עוד כמה שניות לפני שאת מדברת."
          />
          <Bullet
            tone="bg-amber-500"
            title="שימוש בסיפור אישי"
            body="סיפור משלך זה כלי חזק, אבל יש לו מחיר — הוא שם אותך במרכז. לבדוק לפני שמשתמשים בו אם הוא באמת משרת את הלקוחה."
          />
        </ul>
      </SectionCard>

      {/* Weekly insights — empty state */}
      <SectionCard
        title="תובנות השבוע"
        subtitle="מה שצץ לך מתוך המפגשים — לפני שזה נשכח."
      >
        <div className="flex items-start gap-3 rounded-lg border border-dashed bg-background/40 p-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted text-muted-foreground shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              עדיין לא נוספו תובנות השבוע
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              אחרי שתסכמי מפגשים חדשים, התובנות שלך כמאמנת יצטברו כאן
              אוטומטית — מה עבד, מה הפתיע אותך, מה את לוקחת הלאה.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Gentle weekly prompt */}
      <Callout tone="rose" icon={Leaf} title="שאלה לעצמך לסוף השבוע">
        מה למדת השבוע על עצמך כמאמנת — לא על הלקוחות שלך?
      </Callout>
    </PageShell>
  );
}
