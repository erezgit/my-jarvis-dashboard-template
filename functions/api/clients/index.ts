import type { PagesFunction } from "@cloudflare/workers-types";
import { getDb } from "../../_lib/db";
import { json, requireUser, type Env } from "../../_lib/auth";

type ClientRow = {
  id: string;
  name: string;
  type: "individual" | "couple" | "student" | "lead";
  goal: string | null;
  status: "active" | "paused" | "archived";
  phone: string | null;
  email: string | null;
  notes: string | null;
  session_count: number;
  last_session_at: string | null;
  created_at: string;
  updated_at: string;
};

const ALLOWED_TYPES = new Set(["individual", "couple", "student", "lead"]);

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  const sql = getDb(env);
  const rows = (await sql/* sql */ `
    SELECT
      c.id,
      c.name,
      c.type,
      c.goal,
      c.status,
      c.phone,
      c.email,
      c.notes,
      c.created_at,
      c.updated_at,
      COALESCE(s.session_count, 0)::int AS session_count,
      s.last_session_at
    FROM clients c
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::int            AS session_count,
        MAX(scheduled_at)        AS last_session_at
      FROM sessions
      WHERE client_id = c.id
    ) s ON TRUE
    ORDER BY c.created_at DESC
  `) as ClientRow[];

  return json(rows);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  let body: {
    name?: unknown;
    type?: unknown;
    goal?: unknown;
    phone?: unknown;
    email?: unknown;
    notes?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return json({ error: "name is required" }, { status: 400 });

  const typeRaw = typeof body.type === "string" ? body.type : "individual";
  const type = ALLOWED_TYPES.has(typeRaw) ? typeRaw : "individual";

  const goal = typeof body.goal === "string" && body.goal.trim()
    ? body.goal.trim()
    : null;
  const phone = typeof body.phone === "string" && body.phone.trim()
    ? body.phone.trim()
    : null;
  const email = typeof body.email === "string" && body.email.trim()
    ? body.email.trim()
    : null;
  const notes = typeof body.notes === "string" && body.notes.trim()
    ? body.notes.trim()
    : null;

  const sql = getDb(env);
  const rows = (await sql/* sql */ `
    INSERT INTO clients (name, type, goal, phone, email, notes)
    VALUES (${name}, ${type}, ${goal}, ${phone}, ${email}, ${notes})
    RETURNING
      id, name, type, goal, status,
      phone, email, notes,
      created_at, updated_at,
      0::int AS session_count,
      NULL::timestamptz AS last_session_at
  `) as ClientRow[];

  return json(rows[0], { status: 201 });
};
