import type { PagesFunction } from "@cloudflare/workers-types";
import { getDb } from "../../_lib/db";
import { json, requireUser, type Env } from "../../_lib/auth";

type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  body: string;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
};

const ALLOWED_STATUS = new Set(["draft", "active", "archived"]);

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
    SELECT id, slug, name, description, body, status, created_at, updated_at
    FROM skills
    WHERE slug = ${slug}
    LIMIT 1
  `) as Skill[];

  if (rows.length === 0) return new Response("not found", { status: 404 });
  return json(rows[0]);
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  try {
    await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  const slug = String(params.slug ?? "");
  if (!slug) return new Response("missing slug", { status: 400 });

  let payload: Partial<Pick<Skill, "name" | "description" | "body" | "status">>;
  try {
    payload = await request.json();
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const sql = getDb(env);
  let touched = false;

  if (typeof payload.name === "string") {
    await sql/* sql */ `UPDATE skills SET name = ${payload.name} WHERE slug = ${slug}`;
    touched = true;
  }
  if (typeof payload.description === "string" || payload.description === null) {
    await sql/* sql */ `UPDATE skills SET description = ${payload.description} WHERE slug = ${slug}`;
    touched = true;
  }
  if (typeof payload.body === "string") {
    await sql/* sql */ `UPDATE skills SET body = ${payload.body} WHERE slug = ${slug}`;
    touched = true;
  }
  if (typeof payload.status === "string" && ALLOWED_STATUS.has(payload.status)) {
    await sql/* sql */ `UPDATE skills SET status = ${payload.status} WHERE slug = ${slug}`;
    touched = true;
  }

  if (!touched) return new Response("no updatable fields", { status: 400 });

  const rows = (await sql/* sql */ `
    SELECT id, slug, name, description, body, status, created_at, updated_at
    FROM skills
    WHERE slug = ${slug}
    LIMIT 1
  `) as Skill[];

  if (rows.length === 0) return new Response("not found", { status: 404 });
  return json(rows[0]);
};
