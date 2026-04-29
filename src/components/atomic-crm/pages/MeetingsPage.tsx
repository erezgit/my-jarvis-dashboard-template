import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "@/lib/api";

const T = {
  bg: "#FDF7F2",
  ink: "#1C1917",
  ink2: "#57534E",
  ink3: "#A8A29E",
  peachDark: "#E8814E",
  line: "#EADDD0",
  accent: "#C4602A",
  white: "#FFFFFF",
  green: "#2A7A4B",
  greenSoft: "#E8F3EC",
  red: "#B23A3A",
  redSoft: "#F7E5E2",
  blue: "#3B6BA5",
  blueSoft: "#E3EDF7",
  codeBg: "#F5EFE8",
};
const FONT = "Inter, system-ui, -apple-system, sans-serif";
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

type Meeting = {
  id: number;
  title: string;
  meeting_url: string;
  bot_id: string | null;
  status: string;
  summary: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; fg: string; label: string }> = {
    live: { bg: T.greenSoft, fg: T.green, label: "Live" },
    starting: { bg: T.blueSoft, fg: T.blue, label: "Starting" },
    ended: { bg: "#F0EAE3", fg: T.ink3, label: "Ended" },
    failed: { bg: T.redSoft, fg: T.red, label: "Failed" },
    scheduled: { bg: "#F0EAE3", fg: T.ink3, label: "Scheduled" },
  };
  const c = cfg[status] ?? { bg: "#F0EAE3", fg: T.ink3, label: status };
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        fontFamily: FONT,
      }}
    >
      {c.label}
    </span>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MeetingsPage() {
  const api = useApi();
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadMeetings = useCallback(async () => {
    try {
      const res = await api("/api/meetings");
      if (!res.ok) {
        setLoadError(`Failed to load meetings (${res.status})`);
        return;
      }
      const data = (await res.json()) as { meetings: Meeting[] };
      setMeetings(data.meetings);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    }
  }, [api]);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !meetingUrl.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api("/api/meetings", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), meeting_url: meetingUrl.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        setSubmitError(data.error || `Failed (${res.status})`);
        setSubmitting(false);
        return;
      }
      setTitle("");
      setMeetingUrl("");
      setShowForm(false);
      void loadMeetings();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100vh",
        fontFamily: FONT,
        color: T.ink,
        padding: "56px 8vw 80px",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            marginBottom: 36,
          }}
        >
          <div>
            <div
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: 11,
                fontWeight: 700,
                color: T.peachDark,
                marginBottom: 12,
              }}
            >
              Meetings
            </div>
            <h1
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Recordings, transcripts, and Jarvis live in the room.
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            style={{
              padding: "10px 18px",
              background: showForm ? T.white : T.peachDark,
              color: showForm ? T.ink : T.white,
              border: showForm ? `1px solid ${T.line}` : `1px solid ${T.peachDark}`,
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: FONT,
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            {showForm ? "Cancel" : "+ New meeting"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: 24,
              background: T.white,
              border: `1px solid ${T.line}`,
              borderRadius: 12,
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.ink2 }}>Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. R&D weekly sync"
                style={{
                  padding: "10px 12px",
                  border: `1px solid ${T.line}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: FONT,
                  background: T.bg,
                  color: T.ink,
                  outline: "none",
                }}
                disabled={submitting}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.ink2 }}>
                Google Meet URL
              </span>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                style={{
                  padding: "10px 12px",
                  border: `1px solid ${T.line}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: MONO,
                  background: T.bg,
                  color: T.ink,
                  outline: "none",
                }}
                disabled={submitting}
              />
            </label>
            {submitError && (
              <div
                style={{
                  padding: "10px 14px",
                  background: T.redSoft,
                  color: T.red,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                {submitError}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting || !title.trim() || !meetingUrl.trim()}
              style={{
                padding: "10px 18px",
                background: T.peachDark,
                color: T.white,
                border: 0,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting || !title.trim() || !meetingUrl.trim() ? 0.6 : 1,
                alignSelf: "flex-start",
                marginTop: 4,
              }}
            >
              {submitting ? "Starting…" : "Save & start recording"}
            </button>
          </form>
        )}

        {loadError && (
          <div
            style={{
              padding: "12px 16px",
              background: T.redSoft,
              color: T.red,
              borderRadius: 8,
              fontSize: 13.5,
              marginBottom: 16,
            }}
          >
            {loadError}
          </div>
        )}

        {meetings === null && !loadError ? (
          <div style={{ color: T.ink3, fontSize: 14 }}>Loading…</div>
        ) : meetings && meetings.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              background: T.white,
              border: `1px dashed ${T.line}`,
              borderRadius: 12,
              textAlign: "center",
              color: T.ink2,
              fontSize: 14.5,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
              No meetings yet.
            </div>
            Click <em>New meeting</em>, paste a Google Meet URL, and Jarvis joins as a
            silent recorder. The transcript lands here in real time.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(meetings ?? []).map((m) => (
              <Link
                key={m.id}
                to={`/meetings/${m.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    padding: "18px 22px",
                    background: T.white,
                    border: `1px solid ${T.line}`,
                    borderRadius: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 16,
                    alignItems: "center",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = T.peachDark)
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line)}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 16.5,
                        fontWeight: 600,
                        color: T.ink,
                        marginBottom: 6,
                      }}
                    >
                      {m.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: T.ink3,
                        fontFamily: MONO,
                        wordBreak: "break-all",
                      }}
                    >
                      {m.meeting_url}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 6,
                    }}
                  >
                    <StatusBadge status={m.status} />
                    <div style={{ fontSize: 12, color: T.ink3 }}>
                      {fmtDate(m.created_at)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
