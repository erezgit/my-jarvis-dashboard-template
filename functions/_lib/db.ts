import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Env } from "./auth";

/**
 * Returns a tagged-template SQL function backed by Neon's HTTP driver.
 * No pooling needed — each Worker invocation gets a fresh, short-lived
 * connection over HTTPS. Neon handles actual pool management server-side.
 *
 *   const sql = getDb(env);
 *   const rows = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
 */
export function getDb(env: Env): NeonQueryFunction<false, false> {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set — run `wrangler pages secret put DATABASE_URL`",
    );
  }
  return neon(env.DATABASE_URL);
}
