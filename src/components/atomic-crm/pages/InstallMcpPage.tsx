// InstallMcpPage — landing page that ships with every fresh tenant.
// Shows the customer how to install the MyJarvis Dashboard MCP in Claude Desktop.
// The MCP itself is the same URL for every customer; OAuth at install time
// (via WorkOS AuthKit) binds the customer's session to their tenant.

import { useState } from "react";
import { getTenantIdentity } from "@/lib/tenant";

const T = {
  bg: "#FDF7F2",
  ink: "#1C1917",
  ink2: "#57534E",
  ink3: "#A8A29E",
  peachDark: "#E8814E",
  line: "#EADDD0",
  accent: "#C4602A",
  white: "#FFFFFF",
  code: "#1A1A1A",
  codeBg: "#F5EFE8",
};

const FONT = "Inter, system-ui, -apple-system, sans-serif";
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

const MCP_URL = "https://my-jarvis-mcp.myjarvis.workers.dev/mcp";

const CONFIG_SNIPPET = `{
  "mcpServers": {
    "my-jarvis": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${MCP_URL}"]
    }
  }
}`;

const SKILL_URL =
  "https://raw.githubusercontent.com/erezgit/my-jarvis-dashboard-template/main/.claude/skills/myjarvis-dashboard/SKILL.md";

const SKILL_INSTALL_COMMAND = `Fetch this URL and save it as a Claude skill at ~/.claude/skills/myjarvis-dashboard/SKILL.md:

${SKILL_URL}`;

const STEPS = [
  {
    n: "01",
    title: "Open Claude Desktop's config file",
    body: "On macOS, the file lives at ~/Library/Application Support/Claude/claude_desktop_config.json. On Windows, at %APPDATA%\\Claude\\claude_desktop_config.json. Create it if it doesn't exist.",
  },
  {
    n: "02",
    title: "Paste the snippet below",
    body: "If the file already has other MCP servers, merge the my-jarvis entry into the existing mcpServers object — don't overwrite. Save the file.",
  },
  {
    n: "03",
    title: "Restart Claude Desktop",
    body: "Quit the app fully and re-open it. The MCP server will appear in the status indicator at the bottom of the chat input.",
  },
  {
    n: "04",
    title: "Authenticate on first use",
    body: "The first time Claude calls a tool, your browser will open to the MyJarvis sign-in page. Sign in with the same account you used here. The token is bound to your dashboard from then on.",
  },
];

const TOOLS = [
  { name: "read_file", role: "Read any file from your repo, on any branch.", cat: "Code" },
  { name: "write_file", role: "Commit a single file to a preview branch.", cat: "Code" },
  { name: "push_files", role: "Atomic multi-file commit. Bigger refactors land in one commit.", cat: "Code" },
  { name: "delete_file", role: "Remove a file from a preview branch.", cat: "Code" },
  { name: "ship", role: "Merge preview → main. Auto-gated on a green build.", cat: "Deploy" },
  { name: "poll_build_status", role: "Watch a Cloudflare Pages build in real time.", cat: "Deploy" },
  { name: "get_build_logs", role: "Structured error from a failed deploy — file, line, frame.", cat: "Debug" },
  { name: "query_db", role: "Read-only SQL against your Postgres.", cat: "Database" },
  { name: "apply_migration", role: "Two-phase Neon migration: preview, verify, auto-promote.", cat: "Database" },
  { name: "send_voice_message", role: "Speak to you via the dashboard voice feed.", cat: "Voice" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        fontSize: 11,
        fontWeight: 600,
        color: T.peachDark,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

export function InstallMcpPage() {
  const { displayName } = getTenantIdentity();
  const [copied, setCopied] = useState(false);
  const [skillCopied, setSkillCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONFIG_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleSkillCopy = async () => {
    try {
      await navigator.clipboard.writeText(SKILL_INSTALL_COMMAND);
      setSkillCopied(true);
      setTimeout(() => setSkillCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100vh",
        fontFamily: FONT,
        color: T.ink,
        padding: "56px 12vw 80px",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Hero */}
        <Eyebrow>Install the MyJarvis Dashboard MCP</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(36px, 4.5vw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          Connect Claude Desktop to {displayName}.
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.55,
            color: T.ink2,
            marginTop: 18,
            maxWidth: "64ch",
          }}
        >
          Paste one snippet into your Claude Desktop config, restart the app, and your
          Claude can read and write your repo, query and migrate your database, watch
          deploys, ship merges, and speak through your voice feed. Same MCP for every
          customer — the OAuth flow at first use binds it to <em>your</em> dashboard.
        </p>

        {/* Code snippet */}
        <div
          style={{
            marginTop: 28,
            background: T.codeBg,
            border: `1px solid ${T.line}`,
            borderRadius: 12,
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={handleCopy}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "6px 14px",
              background: copied ? T.accent : T.peachDark,
              color: T.white,
              border: 0,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: FONT,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <pre
            style={{
              margin: 0,
              padding: "20px 24px",
              fontFamily: MONO,
              fontSize: 13,
              color: T.code,
              lineHeight: 1.55,
              overflowX: "auto",
            }}
          >
            <code>{CONFIG_SNIPPET}</code>
          </pre>
        </div>

        {/* Steps */}
        <div style={{ marginTop: 56 }}>
          <Eyebrow>Setup, in four steps</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {STEPS.map((s) => (
              <div
                key={s.n}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr",
                  gap: 22,
                  padding: "20px 24px",
                  background: T.white,
                  border: `1px solid ${T.line}`,
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: T.peachDark,
                    fontFamily: MONO,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: T.ink,
                    }}
                  >
                    {s.title}
                  </div>
                  <div style={{ fontSize: 14, color: T.ink2, lineHeight: 1.55, marginTop: 6 }}>
                    {s.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools list */}
        <div style={{ marginTop: 56 }}>
          <Eyebrow>What Claude can do here</Eyebrow>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: 0,
              marginBottom: 18,
            }}
          >
            Ten tools. One conversation away.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {TOOLS.map((t) => (
              <div
                key={t.name}
                style={{
                  padding: "14px 18px",
                  background: T.white,
                  border: `1px solid ${T.line}`,
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.accent,
                  }}
                >
                  {t.name}
                </div>
                <div style={{ fontSize: 13, color: T.ink2, lineHeight: 1.5, marginTop: 4 }}>
                  {t.role}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: T.ink3,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontWeight: 600,
                    marginTop: 8,
                  }}
                >
                  {t.cat}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill install */}
        <div style={{ marginTop: 56 }}>
          <Eyebrow>Then teach Claude your dashboard</Eyebrow>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: 0,
              marginBottom: 14,
            }}
          >
            One more paste — install the dashboard skill.
          </h2>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.6,
              color: T.ink2,
              maxWidth: "64ch",
              margin: 0,
              marginBottom: 22,
            }}
          >
            The MCP gives Claude the tools. The skill gives Claude the playbook —
            where pages live, how the database is shaped, when to ship a redeploy
            vs. write a row. Paste the snippet below to your Claude. It'll fetch
            the skill from GitHub and save it locally; from then on, every Claude
            session you start knows how to update <em>your</em> dashboard.
          </p>

          <div
            style={{
              background: T.codeBg,
              border: `1px solid ${T.line}`,
              borderRadius: 12,
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={handleSkillCopy}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                padding: "6px 14px",
                background: skillCopied ? T.accent : T.peachDark,
                color: T.white,
                border: 0,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {skillCopied ? "Copied!" : "Copy"}
            </button>
            <pre
              style={{
                margin: 0,
                padding: "20px 24px",
                paddingRight: 88,
                fontFamily: MONO,
                fontSize: 13,
                color: T.code,
                lineHeight: 1.55,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              <code>{SKILL_INSTALL_COMMAND}</code>
            </pre>
          </div>

          <p
            style={{
              fontSize: 13,
              color: T.ink3,
              marginTop: 14,
              marginBottom: 0,
            }}
          >
            Or download{" "}
            <a
              href={SKILL_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: T.accent, textDecoration: "none", fontWeight: 600 }}
            >
              SKILL.md
            </a>{" "}
            and drop it in <code style={{ fontFamily: MONO, fontSize: 12 }}>~/.claude/skills/myjarvis-dashboard/</code>.
          </p>
        </div>

        {/* Footer note */}
        <div
          style={{
            marginTop: 56,
            padding: "20px 26px",
            background: T.white,
            borderLeft: `3px solid ${T.peachDark}`,
            borderRadius: "0 10px 10px 0",
            fontSize: 13.5,
            color: T.ink2,
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: T.ink, fontWeight: 600 }}>Need help?</strong> If
          Claude Desktop can't find the MCP after restart, double-check the JSON syntax
          (commas matter), and verify the file is at the exact path above. The first
          authentication opens a browser tab — pop-ups must be allowed for the WorkOS
          domain.
        </div>
      </div>
    </div>
  );
}
