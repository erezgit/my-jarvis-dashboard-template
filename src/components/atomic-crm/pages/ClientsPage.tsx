import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, CalendarClock } from "lucide-react";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageShell } from "@/components/page";
import { cn } from "@/lib/utils";

type ClientType = "individual" | "couple" | "student" | "lead";
type ClientStatus = "active" | "paused" | "archived";

type Client = {
  id: string;
  name: string;
  type: ClientType;
  goal: string | null;
  status: ClientStatus;
  phone: string | null;
  email: string | null;
  notes: string | null;
  session_count: number;
  last_session_at: string | null;
  created_at: string;
};

const TYPE_LABELS: Record<ClientType, string> = {
  individual: "פרטי",
  couple: "זוגי",
  student: "סטודנטית",
  lead: "ליד",
};

const TYPE_TONES: Record<ClientType, string> = {
  individual: "bg-blue-500/15 text-blue-700 border-blue-300/40",
  couple: "bg-violet-500/15 text-violet-700 border-violet-300/40",
  student: "bg-emerald-500/15 text-emerald-700 border-emerald-300/40",
  lead: "bg-amber-500/15 text-amber-700 border-amber-300/40",
};

const STATUS_DOT: Record<ClientStatus, string> = {
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  archived: "bg-slate-400",
};

const STATUS_LABEL: Record<ClientStatus, string> = {
  active: "פעילה",
  paused: "מושהית",
  archived: "בארכיון",
};

export function ClientsPage() {
  const api = useApi();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api("/api/clients");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Client[];
      setClients(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בטעינה");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell
      icon={Users}
      iconColor="emerald"
      title="לקוחות"
      subtitle={
        loading
          ? "טוען..."
          : clients.length === 0
            ? "עוד אין לקוחות — התחילי עם הלקוחה הראשונה"
            : `${clients.length} לקוחות רשומות`
      }
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              לקוחה חדשה
            </Button>
          </DialogTrigger>
          <AddClientDialog
            onCreated={async () => {
              setDialogOpen(false);
              await load();
            }}
          />
        </Dialog>
      }
    >
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          שגיאה: {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">טוען...</p>
      ) : clients.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/50 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-medium">עוד אין לקוחות</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            לחצי על "לקוחה חדשה" כדי להוסיף את הלקוחה הראשונה.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {clients.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
        </ul>
      )}
    </PageShell>
  );
}

function ClientCard({ client }: { client: Client }) {
  return (
    <li>
      <Link
        to={`/clients/${client.id}`}
        className="block rounded-xl border bg-card p-4 hover:border-foreground/20 hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 font-semibold text-sm">
            {client.name.trim().charAt(0)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium truncate">{client.name}</h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] text-muted-foreground",
                )}
                title={STATUS_LABEL[client.status]}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    STATUS_DOT[client.status],
                  )}
                />
                {STATUS_LABEL[client.status]}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn("font-normal", TYPE_TONES[client.type])}
              >
                {TYPE_LABELS[client.type]}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="h-3 w-3" />
                {client.session_count} מפגשים
              </span>
            </div>

            {client.goal ? (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {client.goal}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}

function AddClientDialog({ onCreated }: { onCreated: () => void | Promise<void> }) {
  const api = useApi();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    type: ClientType;
    goal: string;
  }>({
    name: "",
    type: "individual",
    goal: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api("/api/clients", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          goal: form.goal.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm({ name: "", type: "individual", goal: "" });
      await onCreated();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "שגיאה ביצירה");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent dir="rtl" className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>לקוחה חדשה</DialogTitle>
        <DialogDescription>
          הוסיפי לקוחה חדשה לרשימה. שדות נוספים אפשר להשלים בעמוד הלקוחה.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="client-name">שם *</Label>
          <Input
            id="client-name"
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="שם מלא"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-type">סוג</Label>
          <select
            id="client-type"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as ClientType })
            }
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="individual">פרטי</option>
            <option value="couple">זוגי</option>
            <option value="student">סטודנטית</option>
            <option value="lead">ליד</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-goal">מטרה (אופציונלי)</Label>
          <Textarea
            id="client-goal"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            placeholder="מה המטרה של העבודה איתה?"
            rows={3}
          />
        </div>

        {formError && (
          <p className="text-sm text-destructive">שגיאה: {formError}</p>
        )}

        <DialogFooter>
          <Button
            type="submit"
            disabled={submitting || !form.name.trim()}
          >
            {submitting ? "שומרת..." : "הוסיפי לקוחה"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
