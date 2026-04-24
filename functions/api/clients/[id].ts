import type { PagesFunction } from "@cloudflare/workers-types";
import { getDb } from "../../_lib/db";
import { json, requireUser, type Env } from "../../_lib/auth";

type ClientDetail = {
  id: string;
  name: string;
  type: string;
  goal: string | null;
  status: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  session_count: number;
  created_at: string;
  updated_at: string;
  sessions: {
    id: string;
    scheduled_at: string;
    summary: string | null;
    created_at: string;
  }[];
};

export const onRequestGet: PagesFunction<Env, "id"> = async ({
  request,
  env,
  params,
}) => {
  try {
    await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  const id = String(params.id ?? "");
  if (!id) return json({ error: "client id required" }, { status: 400 });

  const sql = getDb(env);

  const clientRows = (await sql/* sql */ `
    SELECT id, name, type, goal, status, phone, email, notes, created_at, updated_at
    FROM clients
    WHERE id = ${id}::uuid
  `) as Omit<ClientDetail, "session_count" | "sessions">[];

  if (clientRows.length === 0) {
    return json({ error: "client not found" }, { status: 404 });
  }

  const sessionRows = (await sql/* sql */ `
    SELECT id, scheduled_at, summary, created_at
    FROM sessions
    WHERE client_id = ${id}::uuid
    ORDER BY scheduled_at DESC
  `) as ClientDetail["sessions"];

  const client = clientRows[0];
  const detail: ClientDetail = {
    ...client,
    session_count: sessionRows.length,
    sessions: sessionRows,
  };
  return json(detail);
};
