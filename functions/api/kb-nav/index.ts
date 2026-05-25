import type { PagesFunction } from "@cloudflare/workers-types";
import { getDb } from "../../_lib/db";
import { json, requireUser, type Env } from "../../_lib/auth";

type PageRow = {
  page_slug: string;
  nav_label: string | null;
  nav_icon: string | null;
  nav_order: number | null;
};

type FolderRow = {
  slug_path: string;
  label: string;
  icon: string | null;
  sort_order: number;
};

/**
 * GET /api/kb-nav
 *
 * Data for the data-driven Knowledge Base index (MJOS-143). The TREE STRUCTURE
 * is derived client-side from the slug path (the slug is the single source of
 * truth for hierarchy — kb-doc/<root>/<...>/<leaf>, a materialized path). This
 * endpoint just ships the raw inputs:
 *   - pages:   visible page_content rows + their nav chrome (label/icon/order)
 *   - folders: nav_folders rows = curated folder chrome keyed by stripped path
 *              (the DB analog of Docusaurus _category_.json)
 * Folders without a row fall back to a title-cased slug segment on the client.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  try {
    const sql = getDb(env);
    const pages = (await sql/* sql */ `
      SELECT page_slug, nav_label, nav_icon, nav_order
      FROM page_content
      WHERE nav_hidden = false
      ORDER BY page_slug ASC
    `) as PageRow[];
    const folders = (await sql/* sql */ `
      SELECT slug_path, label, icon, sort_order
      FROM nav_folders
      ORDER BY sort_order ASC
    `) as FolderRow[];

    return json({ pages, folders });
  } catch (err) {
    return json(
      {
        error: "kb-nav failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
};
