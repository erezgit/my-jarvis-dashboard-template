import { PageShell, SectionCard } from "@/components/page";
import { Network } from "lucide-react";

const DIAGRAM_URL =
  "https://pub-f9d4dc80715b4656bb344d288227078e.r2.dev/diagrams/myjarvis-architecture.jpg";

export function PlatformArchitecturePage() {
  return (
    <PageShell
      icon={Network}
      iconColor="violet"
      title="Platform Architecture"
      subtitle="MyJarvis as isolated environment as a service."
    >
      <SectionCard
        title="System diagram"
        subtitle="Control plane, shared services, and per-tenant stacks."
      >
        <img
          src={DIAGRAM_URL}
          alt="MyJarvis platform architecture diagram"
          className="w-full rounded-md border"
        />
      </SectionCard>

      <SectionCard
        title="Control plane"
        subtitle="Shared across all tenants."
      >
        <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>
            <span className="font-medium text-foreground">MyJarvis Website</span>{" "}
            (Cloudflare Pages) — entry point where users sign up with Google.
          </li>
          <li>
            <span className="font-medium text-foreground">Provisioning Worker</span>{" "}
            (Durable Object) — orchestrates new tenant creation end to end.
          </li>
          <li>
            <span className="font-medium text-foreground">Admin Neon DB</span>{" "}— central
            tenants routing table.
          </li>
          <li>
            <span className="font-medium text-foreground">MCP Worker</span>{" "}— universal
            router. Reads admin on every call to resolve caller → tenant.
          </li>
        </ul>
      </SectionCard>

      <SectionCard
        title="Per-tenant stack"
        subtitle="Replicated for every user. Fully isolated."
      >
        <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>
            <span className="font-medium text-foreground">GitHub repo</span>{" "}— forked
            from the dashboard template.
          </li>
          <li>
            <span className="font-medium text-foreground">Cloudflare Pages</span>{" "}— React
            SPA plus /api/* Pages Functions.
          </li>
          <li>
            <span className="font-medium text-foreground">Voice Worker (DO)</span>{" "}—
            WebSocket fan-out for realtime audio playback.
          </li>
          <li>
            <span className="font-medium text-foreground">R2 bucket</span>{" "}— per-tenant
            audio storage.
          </li>
          <li>
            <span className="font-medium text-foreground">Neon DB</span>{" "}— per-tenant
            Postgres.
          </li>
        </ul>
      </SectionCard>

      <SectionCard
        title="Current tenants"
        subtitle="Five tenants converging to one unified Dashboard template."
      >
        <ul className="divide-y divide-border/60">
          {[
            { name: "Erez", state: "Standard — seeds admin row one" },
            { name: "Lilach", state: "Migrate Clerk → WorkOS, add voice stack" },
            { name: "Daniel", state: "Migrate from Vercel + Supabase" },
            { name: "Flame King", state: "Migrate from Vercel + Supabase" },
            { name: "OS (merged)", state: "Absorb OS features into template, then migrate" },
          ].map(({ name, state }) => (
            <li key={name} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium text-foreground">{name}</span>
              <span className="text-muted-foreground">{state}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        title="Three flows"
        subtitle="Everything a user ever does with the platform."
      >
        <ol className="list-decimal ms-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>
            <span className="font-medium text-foreground">Signup</span> (one-time):
            myjarvis.com → WorkOS → Provisioning Worker → new tenant stack plus admin row → redirect to dashboard.
          </li>
          <li>
            <span className="font-medium text-foreground">MCP OAuth</span> (one-time):
            claude mcp add → WorkOS → MCP reads admin → session token minted.
          </li>
          <li>
            <span className="font-medium text-foreground">Runtime</span> (every call):
            Claude → MCP Worker → tenant /api/voice → TTS → R2 → Neon → DO → browser.
          </li>
        </ol>
      </SectionCard>
    </PageShell>
  );
}
