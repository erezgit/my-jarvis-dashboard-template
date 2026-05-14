import type { PagesFunction } from "@cloudflare/workers-types";
import { getDb } from "../../_lib/db";
import { json, requireUser, type Env } from "../../_lib/auth";

type MemoryRow = {
  id: string;
  agent: string | null;
  type:
    | "session_log"
    | "learning"
    | "user_fact"
    | "area"
    | "principle"
    | "identity";
  title: string | null;
  body: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  const url = new URL(request.url);
  const agent = url.searchParams.get("agent");
  const type = url.searchParams.get("type");

  const sql = getDb(env);
  const rows = (await sql/* sql */ `
    SELECT
      id,
      agent,
      type,
      title,
      body,
      metadata,
      created_at
    FROM memories
    WHERE (${agent}::text IS NULL OR agent = ${agent})
      AND (${type}::text  IS NULL OR type  = ${type})
    ORDER BY created_at DESC
    LIMIT 200
  `) as MemoryRow[];

  return json(rows);
};
