# MyJarvis Dashboard — Template

This is the **canonical template** for per-tenant MyJarvis dashboards. Every tenant's dashboard is a fork of this repo (via the Provisioning Worker) with tenant-specific placeholders substituted.

## Placeholders

Before this repo becomes a running dashboard, these placeholders must be substituted. The Provisioning Worker (`erezgit/my-jarvis-provisioning`) does this automatically on tenant creation. For manual setups, run the substitution yourself.

| Placeholder | Example | Filled by |
|---|---|---|
| `__TENANT__` | `lilach`, `daniel`, `yogev` | Provisioning Worker at fork time (step 3: github-substitute-placeholders) |
| `__VOICE_PUBLIC_URL__` | `https://pub-abc123.r2.dev` | Provisioning Worker after R2 bucket create (step 6) |

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

## Known debt

- `scripts/smoke.mjs` still imports `@clerk/backend` from the Clerk era. The dashboard runs on WorkOS AuthKit now. Smoke is broken until it's ported to WorkOS user-management. Do not rely on `npm run smoke` yet.
- Inline Atomic-CRM content (upstream `README.md` boilerplate, `ErezTestTwoPage`, sidebar labels, seed page text) is intentionally left as-is — tenants customize after fork. The template's job is infrastructure, not content.
