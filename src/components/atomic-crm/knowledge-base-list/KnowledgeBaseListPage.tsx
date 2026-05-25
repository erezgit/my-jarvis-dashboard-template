import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Library, ChevronDown, ChevronRight } from "lucide-react";
import { useApi } from "../../../lib/api";
import { resolveIcon } from "./iconMap";

// MJOS-143 — data-driven Knowledge Base index.
//
// The tree is DERIVED from page slugs: the slug is the single source of truth
// for hierarchy (kb-doc/<root>/<...>/<leaf> — a materialized path). Pages carry
// their own chrome (nav_label/nav_icon/nav_order) on page_content; folder
// chrome (label/icon/order) lives in nav_folders keyed by the stripped slug
// path (the DB analog of Docusaurus _category_.json). Icons resolve from a
// name string via iconMap. Data: GET /api/kb-nav.
//
// Adding a KB page = insert ONE page_content row (optionally with nav fields).
// A new curated folder = one nav_folders row. No code change, no deploy.
// (The previous hardcoded `folders` tree is gone — it drifted from reality.)

type ApiPage = {
  page_slug: string;
  nav_label: string | null;
  nav_icon: string | null;
  nav_order: number | null;
};
type ApiFolder = {
  slug_path: string;
  label: string;
  icon: string | null;
  sort_order: number;
};

type TreeNode = {
  key: string;
  label: string;
  icon: string | null;
  order: number;
  to?: string; // set for leaf pages only
  children: TreeNode[];
};

function titleCase(seg: string): string {
  return seg
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function buildTree(pages: ApiPage[], folders: ApiFolder[]): TreeNode[] {
  const folderMeta = new Map(folders.map((f) => [f.slug_path, f]));
  const root: TreeNode = { key: "", label: "", icon: null, order: 0, children: [] };
  const byPath = new Map<string, TreeNode>();

  function ensureFolder(path: string): TreeNode {
    const existing = byPath.get(path);
    if (existing) return existing;
    const segs = path.split("/");
    const parentPath = segs.slice(0, -1).join("/");
    const parent = parentPath ? ensureFolder(parentPath) : root;
    const meta = folderMeta.get(path);
    const node: TreeNode = {
      key: path,
      label: meta?.label ?? titleCase(segs[segs.length - 1]),
      icon: meta?.icon ?? "Folder",
      order: meta?.sort_order ?? 999,
      children: [],
    };
    parent.children.push(node);
    byPath.set(path, node);
    return node;
  }

  for (const p of pages) {
    const stripped = p.page_slug.replace(/^(kb-doc|pitch-doc)\//, "");
    const segs = stripped.split("/");
    const folderPath = segs.slice(0, -1).join("/");
    const parent = folderPath ? ensureFolder(folderPath) : root;
    parent.children.push({
      key: p.page_slug,
      label: p.nav_label ?? titleCase(segs[segs.length - 1]),
      icon: p.nav_icon,
      order: p.nav_order ?? 999,
      to: "/" + p.page_slug,
      children: [],
    });
  }

  const sortRec = (n: TreeNode) => {
    n.children.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    n.children.forEach(sortRec);
  };
  sortRec(root);
  return root.children;
}

const isFolder = (n: TreeNode) => n.children.length > 0;

function countLeaves(n: TreeNode): number {
  if (!isFolder(n)) return 1;
  return n.children.reduce((s, c) => s + countLeaves(c), 0);
}

function EntryRow({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const Icon = resolveIcon(node.icon);
  return (
    <Link
      to={node.to!}
      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors"
      style={depth ? { paddingLeft: 12 + depth * 16 } : undefined}
    >
      <div className="w-7 h-7 rounded-md flex items-center justify-center bg-muted/60 shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <span className="text-sm text-foreground truncate">{node.label}</span>
    </Link>
  );
}

function SubFolder({
  folder,
  depth,
  openMap,
  setOpenMap,
}: {
  folder: TreeNode;
  depth: number;
  openMap: Record<string, boolean>;
  setOpenMap: (m: Record<string, boolean>) => void;
}) {
  const key = folder.key;
  const open = !!openMap[key];
  const Icon = resolveIcon(folder.icon);
  const Chevron = open ? ChevronDown : ChevronRight;
  const padLeft = 8 + (depth - 1) * 16;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpenMap({ ...openMap, [key]: !open })}
        className="w-full flex items-center gap-2 rounded-md py-1.5 mt-1 hover:bg-muted/40 transition-colors text-left"
        style={{ paddingLeft: padLeft, paddingRight: 8 }}
      >
        <Chevron className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <div className="w-5 h-5 rounded flex items-center justify-center bg-muted/60 shrink-0">
          <Icon className="w-3 h-3 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground truncate">{folder.label}</span>
        <span className="ml-auto text-xs text-muted-foreground">{countLeaves(folder)}</span>
      </button>
      {open && (
        <div className="flex flex-col">
          {folder.children.map((c) =>
            isFolder(c) ? (
              <SubFolder key={c.key} folder={c} depth={depth + 1} openMap={openMap} setOpenMap={setOpenMap} />
            ) : (
              <EntryRow key={c.key} node={c} depth={depth} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function FolderCard({
  folder,
  isOpen,
  onToggle,
  openMap,
  setOpenMap,
}: {
  folder: TreeNode;
  isOpen: boolean;
  onToggle: () => void;
  openMap: Record<string, boolean>;
  setOpenMap: (m: Record<string, boolean>) => void;
}) {
  const Icon = resolveIcon(folder.icon);
  const Chevron = isOpen ? ChevronDown : ChevronRight;
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <button type="button" onClick={onToggle} className="w-full flex items-center gap-2.5 text-left">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-stone-500/15">
          <Icon className="w-4 h-4 text-stone-600 dark:text-stone-400" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{folder.label}</h2>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{countLeaves(folder)}</span>
          <Chevron className="w-4 h-4" />
        </span>
      </button>
      {isOpen && (
        <div className="flex flex-col mt-2.5">
          {folder.children.map((c) =>
            isFolder(c) ? (
              <SubFolder key={c.key} folder={c} depth={1} openMap={openMap} setOpenMap={setOpenMap} />
            ) : (
              <EntryRow key={c.key} node={c} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function KnowledgeBaseListPage() {
  const api = useApi();
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [openSubFolders, setOpenSubFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api("/api/kb-nav");
        if (!res.ok) throw new Error(`/api/kb-nav ${res.status}`);
        const data = (await res.json()) as { pages: ApiPage[]; folders: ApiFolder[] };
        if (alive) setTree(buildTree(data.pages ?? [], data.folders ?? []));
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = tree.reduce((n, f) => n + countLeaves(f), 0);
  const toggleFolder = (key: string) => setOpenFolders((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="max-w-5xl px-6 pb-10 pt-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-500/15">
            <Library className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
            <p className="text-sm text-muted-foreground">
              Archive of pages backed by <code>kb-doc/*</code> and <code>pitch-doc/*</code> rows. {total} pages.
            </p>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-red-600">Failed to load: {error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tree.map((f) => (
            <FolderCard
              key={f.key}
              folder={f}
              isOpen={!!openFolders[f.key]}
              onToggle={() => toggleFolder(f.key)}
              openMap={openSubFolders}
              setOpenMap={setOpenSubFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
}

(KnowledgeBaseListPage as unknown as { path: string }).path = "/knowledge-base";
