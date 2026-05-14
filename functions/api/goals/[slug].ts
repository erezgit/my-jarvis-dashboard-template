import type { PagesFunction } from "@cloudflare/workers-types";
import { getDb } from "../../_lib/db";
import { json, requireUser, type Env } from "../../_lib/auth";

type GoalDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body: string;
  status: "active" | "paused" | "done" | "archived";
  project_id: string;
  project_slug: string | null;
  project_name: string | null;
  created_at: string;
  updated_at: string;
  tickets: {
    id: string;
    slug: string;
    title: string;
    status: string;
    tier: string | null;
    current_step: string | null;
    agent: string | null;
  }[];
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  try {
    await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  const slug = String(params.slug ?? "");
  if (!slug) return new Response("missing slug", { status: 400 });

  const sql = getDb(env);
  const rows = (await sql/* sql */ `
    SELECT
      g.id, g.slug, g.title, g.description, g.body, g.status,
      g.project_id, p.slug AS project_slug, p.name AS project_name,
      g.created_at, g.updated_at
    FROM goals g
    LEFT JOIN projects p ON p.id = g.project_id
    WHERE g.slug = ${slug}
    LIMIT 1
  `) as Omit<GoalDetail, "tickets">[];

  if (rows.length === 0) return new Response("not found", { status: 404 });
  const goal = rows[0];

  const tickets = (await sql/* sql */ `
    SELECT id, slug, title, status, tier, current_step, agent
    FROM tickets
    WHERE goal_id = ${goal.id}
    ORDER BY slug ASC
  `) as GoalDetail["tickets"];

  return json({ ...goal, tickets });
};
