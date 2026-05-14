import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Library,
  Network,
  Workflow,
  Cog,
  GitBranch,
  UserCog,
  ListChecks,
  Map,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

// Template Knowledge Base index (MJOS-074).
// Ships with one folder: System Standards — the 7 KB pages seeded into
// page_content at provisioning time. Tenants extend this list as they author
// new kb-doc/* pages.

type KBEntry = {
  label: string;
  to: string;
  icon: LucideIcon;
};

type KBFolder = {
  label: string;
  icon: LucideIcon;
  entries: KBEntry[];
};

const folders: KBFolder[] = [
  {
    label: "System Standards",
    icon: LayoutDashboard,
    entries: [
      { label: "Dashboard Architecture", to: "/kb-doc/system-standards/dashboard-architecture", icon: Network },
      { label: "System Diagram", to: "/kb-doc/system-standards/system-diagram", icon: Map },
      { label: "Operating Model", to: "/kb-doc/system-standards/operating-model", icon: Cog },
      { label: "Persona Stack", to: "/kb-doc/system-standards/persona-stack", icon: UserCog },
      { label: "Knowledge Taxonomy", to: "/kb-doc/system-standards/knowledge-taxonomy", icon: GitBranch },
      { label: "Data Flows", to: "/kb-doc/system-standards/data-flows", icon: Workflow },
      { label: "Page Inventory", to: "/kb-doc/system-standards/page-inventory", icon: ListChecks },
    ],
  },
];

function EntryRow({ entry }: { entry: KBEntry }) {
  const Icon = entry.icon;
  return (
    <Link
      to={entry.to}
      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors"
    >
      <div className="w-7 h-7 rounded-md flex items-center justify-center bg-muted/60 shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <span className="text-sm text-foreground truncate">{entry.label}</span>
    </Link>
  );
}

function FolderCard({
  folder,
  isOpen,
  onToggle,
}: {
  folder: KBFolder;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = folder.icon;
  const Chevron = isOpen ? ChevronDown : ChevronRight;
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 text-left"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-stone-500/15">
          <Icon className="w-4 h-4 text-stone-600 dark:text-stone-400" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{folder.label}</h2>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{folder.entries.length}</span>
          <Chevron className="w-4 h-4" />
        </span>
      </button>
      {isOpen && (
        <div className="flex flex-col mt-2.5">
          {folder.entries.map((e) => (
            <EntryRow key={e.to} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}

export function KnowledgeBaseListPage() {
  const total = folders.reduce((n, f) => n + f.entries.length, 0);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    "System Standards": true,
  });

  const toggleFolder = (label: string) => {
    setOpenFolders((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
              Pages backed by <code>kb-doc/*</code> rows. {total} pages.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {folders.map((f) => (
          <FolderCard
            key={f.label}
            folder={f}
            isOpen={!!openFolders[f.label]}
            onToggle={() => toggleFolder(f.label)}
          />
        ))}
      </div>
    </div>
  );
}

(KnowledgeBaseListPage as unknown as { path: string }).path = "/knowledge-base";
