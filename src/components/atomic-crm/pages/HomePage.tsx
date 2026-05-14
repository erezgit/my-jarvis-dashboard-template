import { useState } from "react";
import { Link } from "react-router-dom";

const BANNER_URL =
  "https://pub-f9d4dc80715b4656bb344d288227078e.r2.dev/assets/rick-field-banner.webp";

const SKY_DARK = "#3B82C8";
const BG = "#F2F7FD";
const BG2 = "#E5EEF9";
const LINE = "#D0DEF0";

type DeckCard = {
  slug: string;
  mark: string;
  titleLine1: string;
  titleAccent: string;
  sub: string;
  slides: string;
};

const decks: DeckCard[] = [
  {
    slug: "yaron/welcome",
    mark: "MyJarvis Dashboard",
    titleLine1: "Welcome,",
    titleAccent: "Yaron.",
    sub: "A short tour of what you've just stepped into — from a user-experience point of view.",
    slides: "5 slides · with voice",
  },
  {
    slug: "yaron/architecture",
    mark: "Architecture",
    titleLine1: "How it's",
    titleAccent: "wired, Yaron.",
    sub: "Six slides on the dashboard, the brain, and the voice — the technical companion to the welcome deck.",
    slides: "6 slides · with voice",
  },
  {
    slug: "yaron/rick-and-morty",
    mark: "Rick & Morty",
    titleLine1: "Wisdom from",
    titleAccent: "a drunk genius.",
    sub: "Ten quotes that range from cosmic to deeply unhelpful — because every good dashboard deserves a little nihilism.",
    slides: "10 slides · with voice",
  },
];

type ActionBtn = {
  label: string;
  command: string;
};

const actionButtons: ActionBtn[] = [
  {
    label: "Install bun",
    command: "curl -fsSL https://bun.sh/install | bash",
  },
  {
    label: "Install the plugin",
    command:
      "/plugin marketplace add erezgit/myjarvis-os-plugin && /plugin install myjarvis-os@myjarvis-os-plugin",
  },
  {
    label: "Tell Jarvis who you are",
    command:
      "Read https://raw.githubusercontent.com/erezgit/myjarvis-os-plugin/main/CLAUDE.md.template and adapt it to my workspace: set CLAUDE_PROJECT_DIR to ./ , swap {{OPERATOR_NAME}} with my name, save to ./CLAUDE.md.",
  },
  {
    label: "Wire your dashboard",
    command:
      "claude mcp add --transport http my-jarvis-mcp https://my-jarvis-mcp.myjarvis.workers.dev/mcp",
  },
];

function ActionButton({ label, command }: ActionBtn) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-between rounded-md border bg-white/70 px-3 py-2 text-xs font-medium transition-colors hover:bg-white"
      style={{ borderColor: LINE, color: SKY_DARK }}
    >
      <span>{copied ? "Copied" : label}</span>
      <span className="ml-2">↗</span>
    </button>
  );
}

export function HomePage() {
  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative mb-6 h-[512px] overflow-hidden rounded-xl bg-muted">
        <img
          src={BANNER_URL}
          alt="Rick standing in a sunset field of alien grass"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-bottom"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-8 pb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-md">Home</h1>
          <p className="mt-2 max-w-2xl text-base text-white/85 drop-shadow">
            A field. A man. Some plants with too many limbs. Welcome to the dashboard.
          </p>
        </div>
      </div>

      {/* Title row — heading on left, action buttons on right */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">For Yaron</h2>
          <p className="mt-1 text-muted-foreground">
            Three short decks. Open each to listen and read along.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {actionButtons.map((b) => (
            <ActionButton key={b.label} label={b.label} command={b.command} />
          ))}
        </div>
      </div>

      {/* Row of 3 deck cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {decks.map((d) => (
          <Link
            key={d.slug}
            to={`/pitch-doc/${d.slug}`}
            className="group relative flex h-72 flex-col overflow-hidden rounded-xl border p-7 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${BG} 0%, ${BG2} 100%)`,
              borderColor: LINE,
            }}
          >
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: SKY_DARK }}>
              {d.mark}
            </div>
            <h3 className="mt-8 text-3xl font-semibold leading-[1.05] tracking-tight text-stone-900">
              {d.titleLine1}
              <br />
              <span className="font-medium italic" style={{ color: SKY_DARK }}>
                {d.titleAccent}
              </span>
            </h3>

            <div className="mt-auto pt-6">
              <p className="text-sm leading-relaxed text-stone-600 line-clamp-2">{d.sub}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400">{d.slides}</span>
                <span className="text-xs font-semibold transition-transform group-hover:translate-x-0.5" style={{ color: SKY_DARK }}>
                  Open deck →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

HomePage.path = "/home";
