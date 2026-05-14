# MyJarvis Dashboard — Template

This is the **canonical template** for per-tenant MyJarvis dashboards. Every tenant's dashboard is a fork of this repo (via the Provisioning Worker) with tenant-specific placeholders substituted.

## Placeholders

Before this repo becomes a running dashboard, these placeholders must be substituted. The Provisioning Worker (`erezgit/my-jarvis-provisioning`) does this automatically on tenant creation. For manual setups, run the substitution yourself.

| Placeholder | Example | Filled by |
|---|---|---|
| `__TENANT__` | `lilach`, `daniel`, `yogev` | Provisioning Worker at fork time (step 3: github-substitute-placeholders) |
| `__VOICE_PUBLIC_URL__` | `https://pub-abc123.r2.dev` | Provisioning Worker after R2 bucket create (step 6) |
| `{{tenant_slug}}` | `lilach` | In `sql/099_seed.sql` body text (skills/KB) |
| `{{operator_name}}` | `Lilach` | In `sql/099_seed.sql` body text — capitalized first name |
| `{{operator_handle}}` | `lilachi` | In `sql/099_seed.sql` body text — lowercase login handle |
| `{{neon_project_id}}` | `green-meadow-12345678` | In `sql/099_seed.sql` body text |
| `{{r2_public_host}}` | `pub-abc123.r2.dev` | In `sql/099_seed.sql` body text |

Two more values are CF Pages secrets, NOT committed:

| Secret | Purpose |
|---|---|
| `TENANT_OWNER_USER_ID` | WorkOS `user.id` — enforced in every `/api/*` handler so only the owner can use their dashboard |
| `DATABASE_URL` | Neon pooled connection string for this tenant's own DB |
| `WORKOS_CLIENT_SECRET` | WorkOS backend secret (shared across tenants) |
| `OPENAI_API_KEY` | OpenAI Bearer for TTS (shared across tenants) |
| `VOICE_API_KEY` | Shared bearer the MCP Worker uses to authenticate POST `/api/voice` |

Files touched by placeholder substitution:
- `package.json` — `name`, deploy script `--project-name`
- `wrangler.toml` — `name`, `VOICE_PUBLIC_URL`, R2 `bucket_name`
- `scripts/smoke.mjs` — `BASE` URL

Manual substitution recipe:
```bash
sed -i '' 's/__TENANT__/<slug>/g' package.json wrangler.toml scripts/smoke.mjs
sed -i '' "s|__VOICE_PUBLIC_URL__|$VOICE_PUBLIC_URL|g" wrangler.toml
```

After substitution, `grep -rn __TENANT__ .` should return zero hits.

## Stack

- **Frontend:** React 19 + Vite + Tailwind + shadcn
- **Backend:** Cloudflare Pages Functions (in `functions/`)
- **DB:** Neon Postgres (per-tenant project)
- **Auth:** WorkOS AuthKit — single shared MyJarvis org, tenant ownership enforced via `TENANT_OWNER_USER_ID` secret at every `/api/*` handler
- **Voice:** shared `my-jarvis-voice-channel` Worker with per-tenant Durable Object instances; R2 per tenant

## Consolidated voice-channel Worker

The `VoiceChannel` Durable Object class lives in a separate repo (`my-jarvis-voice-channel`) — **one shared Worker across all tenants**, per-tenant DO instances keyed by `__TENANT__`. This template does NOT ship a `workers/voice-channel/` directory. `wrangler.toml`'s `[[durable_objects.bindings]]` points at the shared Worker via `script_name = "my-jarvis-voice-channel"`.

Deploying a bad change to the voice-channel Worker affects every tenant — use caution. Revisit per-tenant workers after ~10 tenants if blast radius becomes an issue.

## Pre-push gate

Every change must pass before push (CF Pages auto-deploys `main`; a failed deploy = user-facing outage):

```
npm run typecheck && npm run lint && npm run build
```

## SQL — schema + seed

The template ships **three layers** of SQL, applied in order by the provisioner against a freshly created Neon project:

1. **Core schema** — `sql/001_init.sql` (users, meetings, etc.) + `sql/002_meetings.sql`.
2. **Brain schema** — `sql/008_dashboard_brain.sql` (projects, goals, tickets, agents, memories), `sql/009_skills.sql` (skills table), `sql/010_mcp_activity.sql` (MCP audit feed).
3. **Seed rows** — `sql/099_seed.sql`. Jarvis agent, one Project/Goal/Ticket pointing at TELOS onboarding, 5 skills (telos, ceo, dashboard, pitch-deck, mjos-algorithm), 7 system-standards KB pages, 3 demo pitch decks.

The seed file uses `{{operator_name}}` / `{{tenant_slug}}` / `{{operator_handle}}` / `{{neon_project_id}}` / `{{r2_public_host}}` placeholders inside skill + KB bodies; the provisioner substitutes them before applying the SQL. Regenerate the seed from the live source dashboard with `node scripts/gen-seed.mjs` (reads from `integrations/erez-database-url` — only runs on the home machine).

## Pages — what ships out of the box

The default sidebar (8 entries) and the routes in `src/components/atomic-crm/root/CRM.tsx` reflect the dashboard's locked **page taxonomy**: Home, Goals, Projects, Tickets, Agents, Skills, Memory, Knowledge Base. Plus catchalls `/kb-doc/*` and `/pitch-doc/*`. Plus per-domain detail routes (`/goals/:slug`, `/projects/:slug`, `/tickets/:slug`, `/skills/:slug`). Plus `/dashboard-architecture` and `/settings`.

**Meetings** route is registered in `CRM.tsx` but the sidebar entry is off by default — flip it on in `nav-items.tsx` once the tenant is using meetings.

The seeded TELOS onboarding (ticket `MJOS-001`) is the first thing a new operator interacts with. `HomePage.tsx` surfaces it as the primary affordance.

## Known debt

- `scripts/smoke.mjs` still imports `@clerk/backend` from the Clerk era. The dashboard runs on WorkOS AuthKit now. Smoke is broken until it's ported to WorkOS user-management. Do not rely on `npm run smoke` yet.
