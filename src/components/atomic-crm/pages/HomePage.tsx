import { Link } from "react-router-dom";
import { Target, Sparkles, Ticket as TicketIcon } from "lucide-react";

// Pitch-deck palette (mirrors PitchDeckBlocks T.* constants).
const SKY_DARK = "#3B82C8";
const BG = "#F2F7FD";
const BG2 = "#E5EEF9";
const LINE = "#D0DEF0";

type StarterCard = {
  to: string;
  mark: string;
  titleLine1: string;
  titleAccent: string;
  sub: string;
  cta: string;
  icon: typeof Target;
};

// Template default home — three onboarding affordances. The seeded TELOS
// goal/project/ticket are the first thing every fresh tenant sees, so the
// landing page surfaces them prominently.
const cards: StarterCard[] = [
  {
    to: "/tickets/MJOS-001",
    mark: "First Conversation",
    titleLine1: "Update your",
    titleAccent: "TELOS.",
    sub: "Open the seeded MJOS-001 ticket and let Jarvis walk you through capturing who you are — roles, outcomes, principles, and how you work.",
    cta: "Open ticket →",
    icon: TicketIcon,
  },
  {
    to: "/goals/update-telos",
    mark: "Goal",
    titleLine1: "See the",
    titleAccent: "first goal.",
    sub: "The TELOS goal frames the onboarding conversation — read it once so you know what success looks like.",
    cta: "Open goal →",
    icon: Target,
  },
  {
    to: "/skills/telos",
    mark: "Skill",
    titleLine1: "Read the",
    titleAccent: "TELOS skill.",
    sub: "Jarvis follows this skill body as the conversation script. Glance at it so you know what to expect.",
    cta: "Open skill →",
    icon: Sparkles,
  },
];

export function HomePage() {
  return (
    <div className="w-full">
      <div className="mb-6 rounded-xl border bg-card px-8 py-10">
        <h1 className="text-4xl font-bold text-foreground">Welcome.</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Your dashboard is live. The fastest way to get value out of it is to
          run the TELOS onboarding — a short conversation with Jarvis that
          captures who you are and how you work.
        </p>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight">Start here</h2>
      <p className="mt-1 text-muted-foreground">
        Three places to begin. The ticket is the conversation; the goal frames
        it; the skill is the script.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.to}
              to={c.to}
              className="group relative flex h-72 flex-col overflow-hidden rounded-xl border p-7 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${BG} 0%, ${BG2} 100%)`,
                borderColor: LINE,
              }}
            >
              <div
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: SKY_DARK }}
              >
                <Icon className="h-3.5 w-3.5" />
                {c.mark}
              </div>
              <h3 className="mt-8 text-3xl font-semibold leading-[1.05] tracking-tight text-stone-900">
                {c.titleLine1}
                <br />
                <span
                  className="font-medium italic"
                  style={{ color: SKY_DARK }}
                >
                  {c.titleAccent}
                </span>
              </h3>

              <div className="mt-auto pt-6">
                <p className="text-sm leading-relaxed text-stone-600 line-clamp-3">
                  {c.sub}
                </p>
                <div className="mt-3 flex items-center justify-end">
                  <span
                    className="text-xs font-semibold transition-transform group-hover:translate-x-0.5"
                    style={{ color: SKY_DARK }}
                  >
                    {c.cta}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

HomePage.path = "/home";
