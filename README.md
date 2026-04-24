# my-jarvis-dashboard-template

Canonical template repo for per-tenant MyJarvis dashboards. The **Provisioning
Worker** forks this repo into `erezgit/my-jarvis-dashboard-{tenant}` for every
new tenant and substitutes `__TENANT__` / `__VOICE_PUBLIC_URL__` placeholders
before triggering the first Cloudflare Pages build.

---

## Placeholders — what gets substituted

| Placeholder | Substitution point | When |
|---|---|---|
| `__TENANT__` | tenant slug, lowercase, e.g. `lilach`, `daniel`, `flameking` | Step 1 of provisioning: immediately after the fork, before first commit |
| `__VOICE_PUBLIC_URL__` | `https://pub-<r2-bucket-hash>.r2.dev` | Step 4 of provisioning: after R2 bucket is created + made public |

Every other per-tenant value (`DATABASE_URL`, `OPENAI_API_KEY`, `VOICE_API_KEY`)
is injected via `wrangler pages secret put` at step 7 of provisioning — not by
file substitution.

### Files that contain placeholders

- `package.json` — 2× `__TENANT__` (name, deploy script `--project-name`)
- `wrangler.toml` — 3× `__TENANT__` (Pages project name, R2 bucket, voice-channel DO script name) + 1× `__VOICE_PUBLIC_URL__`
- `scripts/smoke.mjs` — 1× `__TENANT__` (default BASE URL)

### Dry-substitution check

After clone, the Provisioning Worker runs:

```bash
sed -i '' 's/__TENANT__/<slug>/g' package.json wrangler.toml scripts/smoke.mjs
sed -i '' "s|__VOICE_PUBLIC_URL__|$VOICE_PUBLIC_URL|g" wrangler.toml
```

Any reference to `__TENANT__` after substitution = bug. CI can grep for leftover
`__*__` placeholders as a gate.

---

## What's deliberately NOT in this template

- **`workers/voice-channel/wrangler.toml`** — deleted. The Provisioning Worker
  publishes the VoiceChannel DO class to a per-tenant Worker via the CF Workers
  Script API (reading `workers/voice-channel/index.ts` directly). Tenants don't
  `wrangler deploy` from inside their dashboard clone — provisioning handles it.
- **Seed SQL with tenant-specific data** — `sql/001_init.sql` creates the schema,
  `sql/002_seed_lilach.sql` is a *sample* seed from the first client. Copy, adjust,
  commit per-tenant. The Provisioning Worker runs `sql/001_init.sql` against the
  new Neon project; seed is manual.
- **Client-specific branding** — logos, colors, copy. Applied by the tenant's
  own Claude Code agent after onboarding per `generic-setup-guide.md` §12.

## Known drift (to be addressed in Ship 4 — Lilach Conformance)

- `scripts/smoke.mjs` still imports `@clerk/backend`. The stack moved to WorkOS
  AuthKit; this script is currently non-functional. Kai owns the WorkOS rewrite.
- Historically this README described upstream Atomic CRM. This rewrite replaces
  that content.

---

## Provisioning flow (for reference — lives in `my-jarvis-provisioning` Worker)

1. Fork `erezgit/my-jarvis-dashboard-template` → `erezgit/my-jarvis-dashboard-{tenant}` (GitHub API)
2. `sed` substitute `__TENANT__` across the 3 files above; commit + push
3. Create Neon project → capture `DATABASE_URL`
4. Create R2 bucket + make public → capture `VOICE_PUBLIC_URL`
5. Publish per-tenant voice-channel Worker (CF Workers Script API)
6. Substitute `__VOICE_PUBLIC_URL__` in `wrangler.toml`; commit + push
7. Create CF Pages project (Git-connected, Vite preset, nodejs_compat)
8. Set secrets on Pages project: `DATABASE_URL`, `OPENAI_API_KEY`, `VOICE_API_KEY`
9. Trigger first build; wait for green
10. Apply `sql/001_init.sql` against the new Neon project
11. INSERT into `admin.tenants`: tenant_slug, workos_user_id, github_repo, neon_project_id, cf_pages_project, dashboard_url, r2_bucket_name, voice_worker_name, status='active'
12. Return `dashboard_url` to the requester

See `~/Workspace/jarvis-pai/new-user-setup/generic-setup-guide.md` for the full
manual flow the Provisioning Worker automates.

---

## Local development (inside an instantiated tenant dashboard)

```bash
npm install
npm run dev              # Vite dev server on :5173
npm run typecheck        # tsc --noEmit
npm run lint             # ESLint
npm run build            # production build → dist/
npm run deploy           # wrangler pages deploy (needs CLOUDFLARE_API_TOKEN)
```

## Stack

- **Frontend**: React 19 + Vite 7, Tailwind 4, Radix, shadcn/ui, react-router 7
- **Auth**: WorkOS AuthKit (`@workos-inc/authkit-react`)
- **DB**: Neon Postgres via `@neondatabase/serverless`
- **Host**: Cloudflare Pages + Pages Functions (`functions/api/*`)
- **Voice**: R2 bucket (audio storage) + VoiceChannel Durable Object (WebSocket fan-out)
- **Audit**: writes to shared `mcp_activity` table in supabase-jarvis (tenant_id scoping)

## Repos in the ecosystem

| Repo | Purpose |
|---|---|
| `erezgit/my-jarvis-dashboard-template` | **This repo** — canonical template |
| `erezgit/my-jarvis-dashboard-{tenant}` | Per-tenant fork, provisioned automatically |
| `erezgit/my-jarvis-mcp` | Remote MCP server (tools, OAuth) |
| `erezgit/my-jarvis-provisioning` | Provisioning Worker (this repo's automator) |
| `erezgit/my-jarvis-website` | Marketing + signup front door |

## Licence

See `LICENSE.md`.
