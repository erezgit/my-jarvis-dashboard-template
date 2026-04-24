import { Link } from "react-router-dom";
import { BookOpen, Layers, FileText } from "lucide-react";
import {
  methodologyCards,
  theoryAlbumChapters,
  guides,
} from "./methodology-registry";

type Section = {
  title: string;
  subtitle: string;
  icon: typeof BookOpen;
  accent: string;
  pages: { path: string; label: string }[];
};

const sections: Section[] = [
  {
    title: "כרטיסיות השיטה",
    subtitle: `${methodologyCards.length} כרטיסיות · עקרונות, תרגילים, מטאפורות`,
    icon: BookOpen,
    accent: "bg-blue-500/15 text-blue-600",
    pages: methodologyCards,
  },
  {
    title: "אלבום התאוריה",
    subtitle: `${theoryAlbumChapters.length} פרקים מתוך אלבום התאוריה המונטסורי`,
    icon: Layers,
    accent: "bg-violet-500/15 text-violet-600",
    pages: theoryAlbumChapters,
  },
  {
    title: "מדריכים ותבניות",
    subtitle: `${guides.length} מדריכים · תבניות מפגש, הרהורים, תסריטים`,
    icon: FileText,
    accent: "bg-amber-500/15 text-amber-600",
    pages: guides,
  },
];

export function MethodologyPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">מתודולוגיה</h1>
        <p className="mt-2 text-muted-foreground">
          הספרייה שלך — כרטיסיות השיטה, פרקי התאוריה, ומדריכים מעשיים.
        </p>
      </header>

      <div className="space-y-10">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${section.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {section.subtitle}
                  </p>
                </div>
              </div>

              {section.pages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  עוד לא נטען תוכן בקטגוריה הזו.
                </p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {section.pages.map((p) => (
                    <li key={p.path}>
                      <Link
                        to={p.path}
                        className="block rounded-lg border bg-card px-4 py-3 text-sm hover:bg-accent hover:border-foreground/20 transition-colors"
                      >
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
