#!/usr/bin/env node
// Generates 099_seed.sql for the template from Erez's Neon database.
// Skill bodies have "Erez" → {{operator_name}} placeholders so the
// provisioner substitutes per-tenant. KB pages + pitch decks are copied
// verbatim.

import { readFileSync, writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const dbUrlLine = readFileSync(
  "/Users/erezfern/Workspace/jarvis-pai/integrations/erez-database-url",
  "utf8",
).split("\n").find((l) => l.startsWith("DATABASE_URL_UNPOOLED="));
const DB_URL = dbUrlLine.slice("DATABASE_URL_UNPOOLED=".length).trim();
const sql = neon(DB_URL);

// SQL-escape a Postgres text literal — wrap with $$tag$$ to dodge quote
// escaping entirely. Pick a tag that isn't in the body.
function pgLiteral(s) {
  let tag = "T";
  while (s.includes(`$${tag}$`)) tag += "T";
  return `$${tag}$${s}$${tag}$`;
}

function scrubErez(body) {
  // Replace bare Erez/erez tokens with placeholder. Be conservative — only
  // when it's clearly the operator's name (whole word, with optional 's
  // possessive). Also swap erez-specific infra references (R2 bucket URL,
  // Neon project id, dashboard repo name) with placeholders the provisioner
  // can substitute at fork time.
  return body
    .replace(/\bErez's\b/g, "{{operator_name}}'s")
    .replace(/\bErez\b/g, "{{operator_name}}")
    .replace(/\berezfern\b/g, "{{operator_handle}}")
    .replace(/my-jarvis-dashboard-erez/g, "my-jarvis-dashboard-{{tenant_slug}}")
    .replace(/orange-sky-39481838/g, "{{neon_project_id}}")
    .replace(
      /pub-f9d4dc80715b4656bb344d288227078e\.r2\.dev/g,
      "{{r2_public_host}}",
    );
}

async function main() {
  const out = [];
  out.push("-- 099_seed.sql — template seed rows (MJOS-074).");
  out.push("--");
  out.push("-- Initial content every fresh tenant ships with:");
  out.push("--   - Jarvis agent (the only seeded persona)");
  out.push("--   - One Project (Update TELOS) + Goal + Ticket (MJOS-001) pointing at onboarding");
  out.push("--   - 5 skills: telos, ceo, dashboard, pitch-deck, mjos-algorithm");
  out.push("--   - 7 KB pages under kb-doc/system-standards/*");
  out.push("--   - 3 pitch decks under pitch-doc/yaron/* (placeholder content)");
  out.push("--");
  out.push("-- Skill bodies have {{operator_name}} placeholders the provisioner");
  out.push("-- substitutes per-tenant. KB pages + pitch decks are verbatim.");
  out.push("");

  // === 1. Agent: Jarvis ===
  out.push("-- =============================================================");
  out.push("-- Agents — template ships Jarvis only.");
  out.push("-- =============================================================");
  out.push("INSERT INTO agents (name, display_name, voice_kokoro, voice_mcp, color)");
  out.push("VALUES ('jarvis', 'Jarvis', 'am_echo', 'echo', '#58a6ff')");
  out.push("ON CONFLICT (name) DO NOTHING;");
  out.push("");

  // === 2. Project: Update TELOS ===
  out.push("-- =============================================================");
  out.push("-- The seeded onboarding loop: Project → Goal → Ticket.");
  out.push("-- =============================================================");
  out.push("INSERT INTO projects (slug, name, mission, status)");
  out.push("VALUES (");
  out.push("  'update-telos',");
  out.push("  'Update TELOS',");
  out.push("  'Onboard the operator: capture their roles, goals, principles, and operating context so Jarvis can serve them specifically.',");
  out.push("  'active'");
  out.push(")");
  out.push("ON CONFLICT (slug) DO NOTHING;");
  out.push("");

  out.push("-- One Goal under the project.");
  out.push("INSERT INTO goals (slug, project_id, title, description, status)");
  out.push("SELECT");
  out.push("  'update-telos',");
  out.push("  p.id,");
  out.push("  'Update TELOS',");
  out.push("  'Run the TELOS onboarding conversation. Capture who you are, what you care about, and how you work — once. Jarvis reads it at every session start so the dashboard serves you specifically, not generically.',");
  out.push("  'active'");
  out.push("FROM projects p WHERE p.slug = 'update-telos'");
  out.push("ON CONFLICT (slug) DO NOTHING;");
  out.push("");

  out.push("-- One Ticket — MJOS-001 — the conversation entry point.");
  out.push("INSERT INTO tickets (slug, agent, title, status, current_step, problem, goal_id, project_id)");
  out.push("SELECT");
  out.push("  'MJOS-001',");
  out.push("  'jarvis',");
  out.push("  'Conversation to update TELOS',");
  out.push("  'todo',");
  out.push("  'OBSERVE',");
  out.push("  'New operator just signed up. Open a conversation to capture their TELOS. Use skill://telos as the conversation script.',");
  out.push("  g.id,");
  out.push("  p.id");
  out.push("FROM goals g JOIN projects p ON p.id = g.project_id WHERE g.slug = 'update-telos'");
  out.push("ON CONFLICT (slug) DO NOTHING;");
  out.push("");

  // === 3. Skills ===
  out.push("-- =============================================================");
  out.push("-- Skills — TELOS onboarding script + 4 doctrine skills copied");
  out.push("-- from Erez's dashboard, scrubbed of operator-specific names.");
  out.push("-- =============================================================");

  // TELOS skill body (new, written here)
  const telosBody = JSON.stringify({
    blocks: [
      {
        type: "slide",
        title: "TELOS — Operator Onboarding",
        body: "Welcome. Before I can serve you, I need to understand who you are. Run this conversation with me once — it takes 10-15 minutes — and the output becomes the doc you and I both read at every session start.",
      },
      {
        type: "slide",
        title: "Outcomes",
        body: "What are your top 3-5 outcomes for the next 12 months? Not tasks — outcomes. Things you'll feel proud of if they happen.",
      },
      {
        type: "slide",
        title: "Roles",
        body: "Which roles are you operating in right now? Founder. Parent. Partner. Athlete. Investor. Friend. List the ones that take real attention.",
      },
      {
        type: "slide",
        title: "Principles",
        body: "What non-negotiable principles or constraints shape how you work? Things like — 'always voice-first', 'never ship before noon', 'family wins on Fridays.' These are the floor, not the ceiling.",
      },
      {
        type: "slide",
        title: "Patterns",
        body: "What ways of working have you found that consistently work for you? What patterns have failed? I'll remember both so I don't ask you to repeat mistakes you already learned from.",
      },
      {
        type: "slide",
        title: "Confirm",
        body: "Here's your TELOS. Edit anything wrong, then I'll save it as a KB doc at /kb-doc/system-standards/telos. You and I both read it at every session start. That's the loop.",
      },
    ],
  });

  out.push("-- telos: the onboarding conversation script.");
  out.push("INSERT INTO skills (slug, name, body)");
  out.push("VALUES (");
  out.push("  'telos',");
  out.push("  'TELOS — Operator Onboarding',");
  out.push(`  ${pgLiteral(telosBody)}`);
  out.push(")");
  out.push("ON CONFLICT (slug) DO NOTHING;");
  out.push("");

  // 4 skills copied from Erez DB
  const skillRows = await sql`SELECT slug, name, body FROM skills WHERE slug IN ('ceo','dashboard','pitch-deck','mjos-algorithm') ORDER BY slug`;
  for (const r of skillRows) {
    const scrubbed = scrubErez(r.body);
    out.push(`-- ${r.slug}: ${r.name}`);
    out.push("INSERT INTO skills (slug, name, body)");
    out.push("VALUES (");
    out.push(`  ${pgLiteral(r.slug)},`);
    out.push(`  ${pgLiteral(r.name)},`);
    out.push(`  ${pgLiteral(scrubbed)}`);
    out.push(")");
    out.push("ON CONFLICT (slug) DO NOTHING;");
    out.push("");
  }

  // === 4. KB pages (system-standards) ===
  out.push("-- =============================================================");
  out.push("-- KB pages — 7 system-standards rows from Erez's dashboard.");
  out.push("-- Copied verbatim (these are architecture docs, no operator");
  out.push("-- personalization).");
  out.push("-- =============================================================");

  const kbSlugs = [
    "kb-doc/system-standards/dashboard-architecture",
    "kb-doc/system-standards/system-diagram",
    "kb-doc/system-standards/operating-model",
    "kb-doc/system-standards/persona-stack",
    "kb-doc/system-standards/knowledge-taxonomy",
    "kb-doc/system-standards/data-flows",
    "kb-doc/system-standards/page-inventory",
  ];
  for (const slug of kbSlugs) {
    const rows = await sql`SELECT content FROM page_content WHERE page_slug = ${slug} LIMIT 1`;
    if (rows.length === 0) {
      out.push(`-- WARN: ${slug} not found in source DB; skipping.`);
      out.push("");
      continue;
    }
    const json = JSON.stringify(rows[0].content);
    const scrubbed = scrubErez(json);
    out.push(`-- ${slug}`);
    out.push("INSERT INTO page_content (page_slug, content)");
    out.push("VALUES (");
    out.push(`  ${pgLiteral(slug)},`);
    out.push(`  ${pgLiteral(scrubbed)}::jsonb`);
    out.push(")");
    out.push("ON CONFLICT (page_slug) DO NOTHING;");
    out.push("");
  }

  // === 5. Pitch decks (yaron/* — copied verbatim per ticket scope) ===
  out.push("-- =============================================================");
  out.push("-- Pitch decks — 3 Yaron decks, copied verbatim. The ticket scope");
  out.push("-- explicitly says 'we'll genericize later'. They demonstrate the");
  out.push("-- pitch-doc/* render path; tenants can replace with their own.");
  out.push("-- =============================================================");

  const pitchSlugs = ["pitch-doc/yaron/welcome", "pitch-doc/yaron/architecture", "pitch-doc/yaron/rick-and-morty"];
  for (const slug of pitchSlugs) {
    const rows = await sql`SELECT content FROM page_content WHERE page_slug = ${slug} LIMIT 1`;
    if (rows.length === 0) {
      out.push(`-- WARN: ${slug} not found in source DB; skipping.`);
      out.push("");
      continue;
    }
    // Pitch decks: scrub R2 host so image assets resolve against the tenant's
    // bucket. Yaron-specific copy stays per ticket scope (genericize later).
    const json = JSON.stringify(rows[0].content).replace(
      /pub-f9d4dc80715b4656bb344d288227078e\.r2\.dev/g,
      "{{r2_public_host}}",
    );
    out.push(`-- ${slug}`);
    out.push("INSERT INTO page_content (page_slug, content)");
    out.push("VALUES (");
    out.push(`  ${pgLiteral(slug)},`);
    out.push(`  ${pgLiteral(json)}::jsonb`);
    out.push(")");
    out.push("ON CONFLICT (page_slug) DO NOTHING;");
    out.push("");
  }

  const target = "/Users/erezfern/Workspace/jarvis-pai/my-jarvis-dashboard-template/sql/099_seed.sql";
  writeFileSync(target, out.join("\n") + "\n");
  console.log(`wrote ${target} (${out.length} lines)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
