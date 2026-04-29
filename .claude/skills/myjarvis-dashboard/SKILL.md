---
name: myjarvis-dashboard
description: Update the MyJarvis dashboard — read data, write data, edit layout. Use whenever asked to add a page, edit a page, change the sidebar, fix the dashboard, query the database, write a knowledge base entry, or anything that touches the user's MyJarvis dashboard. Triggered by — "dashboard", "add a page", "edit a page", "sidebar", "knowledge base", "kb page", "query the data", "update my dashboard".
---

# MyJarvis Dashboard

The user's MyJarvis dashboard is a React app. **Layout is in code (TSX). Data is in their own Neon Postgres.** Both are managed through the **MyJarvis MCP** — no git, no npm, no shell.

## Three operations — that's the whole job

| Goal | Tool | Notes |
|---|---|---|
| **Read data** | `query_db("SELECT …")` | Read-only against the live database. |
| **Write data** | `apply_migration("INSERT/UPDATE/DELETE …" or DDL)` | 2-phase: tested on a Neon preview branch first, auto-promoted on success. Despite the name, this is the right tool for both schema changes AND data writes. |
| **Edit layout** | `push_files([…], branch="preview/<topic>")` → `poll_build_status(branch)` until `success` → `ship(branch)` | Build gate is automatic; `ship` only merges if green. |

Anything that doesn't fit one of these three is probably out of scope for this skill.

## Where things live in the code

```
src/components/atomic-crm/
├── root/CRM.tsx                  # routes — every page is a <Route> here
├── layout/CrmSidebar.tsx         # sidebar — top items + expandable groups
├── pages/<Name>Page.tsx          # one TSX file per dashboard page
└── …
src/components/kb/
├── KbPage.tsx                    # generic renderer for content stored in page_content
└── sections/                     # 13 section types (markdown, table, kpi_cards, …)
```

## Where things live in the data

| Table | What |
|---|---|
| `page_content` (jsonb) | Long-form pages rendered by `<KbPage slug="…" />`. One row per slug. |
| `<your-domain-tables>` | Typed tenant data (e.g. `contacts`, `tasks`, `paamon_groups`). Read in TSX via the dashboard's `/api/[resource]` endpoint with the per-table allowlist. |

To add a brand-new domain table: write a `CREATE TABLE` via `apply_migration`, then add the table name to the allowlist in `functions/api/[resource]/index.ts` (a code edit + ship).

## Recipes

### Read data

```
query_db("SELECT * FROM contacts WHERE created_at > now() - interval '7 days'")
```

### Add or edit knowledge base content (no redeploy)

```
apply_migration("""
  INSERT INTO page_content (page_slug, content) VALUES
  ('my-new-page', '{"sections":[{"type":"markdown","body":"…"}]}'::jsonb)
  ON CONFLICT (page_slug) DO UPDATE SET content = EXCLUDED.content
""")
```

If the route already exists in `CRM.tsx`, you're done. Otherwise: register a route (one TSX edit + ship) so the page is reachable.

### Add a page with custom layout (redeploy)

```
push_files([
  { path: "src/components/atomic-crm/pages/MyNewPage.tsx", content: "<full TSX>" },
  { path: "src/components/atomic-crm/root/CRM.tsx", content: "<patched routes>" },
  { path: "src/components/atomic-crm/layout/CrmSidebar.tsx", content: "<patched nav>" }
], branch="preview/add-mynewpage", message="feat: add MyNewPage")

poll_build_status("preview/add-mynewpage")  # repeat until status='success'
ship("preview/add-mynewpage", "feat: MyNewPage")
```

### Change a sidebar entry / hide a page / move to KB

Edit `CrmSidebar.tsx` (and remove the route from `CRM.tsx` if hiding entirely). Same `push_files → poll → ship` flow.

### Add a new domain table

```
apply_migration("CREATE TABLE my_table ( … )")
```

Then a code edit + ship to add `'my_table'` to the allowlist in `functions/api/[resource]/index.ts` if you want the frontend to read it.

## Sidebar convention

- Keep ~6 high-priority pages in the sidebar. Group them with `NavGroupSection` (top items + expandable groups).
- Everything else lives in the knowledge base — surfaced through the `/knowledge-base` list page.
- Icons come from `lucide-react`. Pick the closest semantic match to the page's content.

## Build gate — what to do when it fails

`poll_build_status` returns one of:

- `status: "success"` → safe to `ship`.
- `status: "failed"` → call `get_build_logs(deploy_id)`, fix the error, push again to the same preview branch.
- `retry.escalated: true` → 3 strikes. **Stop.** Tell the user, don't keep retrying. The branch is poisoned; abandon it.

Never call `ship` until you've seen `status: "success"` on the preview branch. `ship` re-checks before merging, but you should never make it do that work.

## What this skill does NOT cover

- **Voice, MCP setup, provisioning** — separate skills/tools.
- **Atomic-CRM upstream conventions** (ra-core forms, shadcn primitives) — see `frontend-dev` in the same repo.
- **Design vocabulary** (Studio vs Editorial typography, ColorBlocks, etc.) — separate skill, coming later.
