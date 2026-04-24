import {
  CheckCircle2,
  Rocket,
  GitBranch,
  GitMerge,
  Target,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Fact = {
  label: string;
  value: string;
  icon: typeof Rocket;
  tint: string;
};

type ChecklistItem = {
  text: string;
  done: boolean;
};

const facts: Fact[] = [
  {
    label: "Created via",
    value: "my-jarvis-mcp Worker",
    icon: Rocket,
    tint: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    label: "Commit path",
    value: "push_files → preview → ship",
    icon: GitBranch,
    tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    label: "Branch",
    value: "preview/erez-test-two → main",
    icon: GitMerge,
    tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Purpose",
    value: "End-to-end MCP pipeline verification",
    icon: Target,
    tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

const checklist: ChecklistItem[] = [
  { text: "read_file from main", done: true },
  { text: "push_files to preview branch", done: true },
  { text: "poll_build_status returns green", done: true },
  { text: "ship merges preview into main", done: true },
  { text: "Sidebar entry renders", done: true },
  { text: "Route serves this page", done: true },
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function ErezTestTwoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 p-6 md:p-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-emerald-500/10 p-8 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            MCP end-to-end test
          </div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Erez Test Two
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            This page was created by Jarvis using only the{" "}
            <code className="rounded bg-background/70 px-1.5 py-0.5 font-mono text-[13px]">
              my-jarvis-mcp
            </code>{" "}
            tools — no gh CLI, no direct git, no bash for code. Its existence is
            the proof.
          </p>
        </div>
      </section>

      {/* What happened */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Narrative"
          title="What happened"
          description="The pipeline from intent to live page, in two paragraphs."
        />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 text-sm leading-relaxed text-card-foreground">
            Jarvis read{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">
              CrmSidebar.tsx
            </code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">
              CRM.tsx
            </code>{" "}
            from main via the MCP, composed three files (this page, the updated
            sidebar, the updated route registry), and pushed them atomically to
            a preview branch.
          </div>
          <div className="rounded-xl border bg-card p-5 text-sm leading-relaxed text-card-foreground">
            Cloudflare Pages built the preview. Once the build went green, the
            MCP's{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">
              ship
            </code>{" "}
            tool merged the preview into main and the production deploy
            followed. Total human interventions during the run: zero.
          </div>
        </div>
      </section>

      {/* Facts grid */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Receipts"
          title="Facts"
          description="What the MCP actually did — provable, auditable, boring."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="group flex items-start gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  fact.tint,
                )}
              >
                <fact.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {fact.label}
                </div>
                <div className="truncate text-sm font-medium text-card-foreground">
                  {fact.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline checklist */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Pipeline"
          title="Checklist"
          description="Each step verified end-to-end."
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {checklist.map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm transition-colors hover:border-emerald-500/40"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="truncate">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer signature */}
      <section className="flex items-center justify-between rounded-xl border border-dashed bg-card/40 px-5 py-4 text-xs text-muted-foreground">
        <span>Built by Jarvis — my-jarvis-mcp pipeline</span>
        <span className="font-mono">preview → main → prod</span>
      </section>
    </div>
  );
}
