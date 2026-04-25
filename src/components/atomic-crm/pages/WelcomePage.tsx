// WelcomePage — the default landing page for every fresh MyJarvis tenant.
// Editorial blueprint-style page that introduces what MyJarvis is.
// Tenant-specific identity (display name + initial) is read at runtime from
// the URL via getTenantIdentity() — no template placeholders to substitute.

import { getTenantIdentity } from "@/lib/tenant";

const T = {
  bg: "#FDF7F2",
  bg2: "#FAEFE5",
  ink: "#1C1917",
  ink2: "#57534E",
  ink3: "#A8A29E",
  peachDark: "#E8814E",
  line: "#EADDD0",
  accent: "#C4602A",
  white: "#FFFFFF",
  green: "#2A7A4B",
  greenSoft: "#E8F3EC",
  blue: "#3B6BA5",
  blueSoft: "#E3EDF7",
  plum: "#8E4585",
  plumSoft: "#F3E6F2",
};

const FONT = "Inter, system-ui, -apple-system, sans-serif";

const SECTIONS = [
  "The shape of your dashboard",
  "Your private AI workspace",
  "Voice — your assistant talks back",
  "The MCP — your conversational interface",
  "Your data, fully isolated",
  "What to do next",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: T.peachDark,
        textTransform: "uppercase",
        fontFamily: FONT,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: T.peachDark,
          textTransform: "uppercase",
          marginBottom: 6,
          fontFamily: FONT,
          margin: "0 0 6px 0",
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: T.ink,
          margin: 0,
          fontFamily: FONT,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 15,
        color: T.ink2,
        fontFamily: FONT,
        lineHeight: 1.7,
        margin: "0 0 14px",
        maxWidth: 760,
      }}
    >
      {children}
    </p>
  );
}

function Card({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.line}`,
        borderRadius: 10,
        padding: "18px 22px",
        borderLeft: accent ? `4px solid ${accent}` : undefined,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        borderTop: `1px solid ${T.line}`,
        margin: "48px 0",
      }}
    />
  );
}

function Hero({ displayName }: { displayName: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 20px 40px",
        marginBottom: 28,
      }}
    >
      <Eyebrow>MyJarvis · Your AI Dashboard · 2026</Eyebrow>
      <Eyebrow>Where conversations become outcomes</Eyebrow>
      <h1
        style={{
          fontSize: 38,
          fontWeight: 800,
          color: T.ink,
          fontFamily: FONT,
          margin: "0 0 16px",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        Welcome to MyJarvis,{" "}
        <span style={{ color: T.peachDark }}>{displayName}</span>
      </h1>
      <p
        style={{
          fontSize: 16,
          color: T.ink2,
          fontFamily: FONT,
          lineHeight: 1.65,
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        This is your private AI workspace — a fully isolated environment where
        your conversations turn into completed outcomes. Documents, decisions,
        voice notes, knowledge — all yours, all here, all routed through your
        own dedicated stack.
      </p>
    </div>
  );
}

function VersionBanner() {
  return (
    <div
      style={{
        background: T.bg2,
        border: `1px solid ${T.line}`,
        borderRadius: 10,
        padding: "16px 20px 16px 20px",
        marginBottom: 28,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <span
        style={{
          background: T.peachDark,
          color: T.white,
          padding: "4px 10px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: FONT,
          flexShrink: 0,
        }}
      >
        V1
      </span>
      <p
        style={{
          margin: 0,
          color: T.ink2,
          fontFamily: FONT,
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        Fresh tenant. Welcome page lives in the template. As your assistant
        builds you new pages — task lists, content, knowledge — they land in
        your sidebar and replace this view.
      </p>
    </div>
  );
}

function TOC() {
  return (
    <div
      style={{
        background: T.bg2,
        border: `1px solid ${T.line}`,
        borderRadius: 10,
        padding: "20px 28px",
        marginBottom: 48,
      }}
    >
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.peachDark,
          fontFamily: FONT,
        }}
      >
        On this page
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "4px 24px",
        }}
      >
        {SECTIONS.map((item, i) => (
          <div
            key={i}
            style={{
              fontFamily: FONT,
              fontSize: 13,
              color: T.ink2,
              padding: "4px 0",
            }}
          >
            <span
              style={{
                color: T.peachDark,
                fontWeight: 600,
                marginRight: 8,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShapeSection() {
  return (
    <section>
      <SectionHeader eyebrow="01 · Layout" title="The shape of your dashboard" />
      <Body>
        Three columns. The sidebar on the left holds your navigation — every
        page your assistant builds for you appears here. The center is the
        page itself. The voice panel on the right is your live audio feed:
        whenever the assistant speaks to you, the message lands here and plays.
      </Body>
      <Body>
        Pages here are real React components — not chat messages, not
        ephemeral. They persist, they version, they're yours.
      </Body>
    </section>
  );
}

function PrivateSection() {
  return (
    <section>
      <SectionHeader
        eyebrow="02 · Isolation"
        title="Your private AI workspace"
      />
      <Body>
        This dashboard runs on its own dedicated infrastructure — your own
        Cloudflare Pages project, your own Postgres database on Neon, your own
        R2 bucket for audio, your own Worker for realtime fan-out. Nothing is
        shared with another tenant at the data layer.
      </Body>
      <Card accent={T.green}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT,
            fontSize: 14,
            color: T.ink2,
            lineHeight: 1.6,
          }}
        >
          When your assistant writes a voice note, edits a page, or queries
          your data — those operations hit <strong>your</strong> stack. Other
          tenants on the platform run on completely separate infrastructure.
        </p>
      </Card>
    </section>
  );
}

function VoiceSection() {
  return (
    <section>
      <SectionHeader
        eyebrow="03 · Audio"
        title="Voice — your assistant talks back"
      />
      <Body>
        Open the panel on the right. Your assistant uses voice as a first-class
        channel: short status updates, decisions worth hearing, summaries at the
        end of long work sessions. Each message appears in the feed with its
        agent name, plays automatically when you're focused on the tab, and
        stays in your archive forever.
      </Body>
      <Body>
        Behind the scenes it's OpenAI text-to-speech, audio in your R2 bucket,
        a row in your Postgres, and a WebSocket fan-out from a shared
        voice-channel Worker — all wired up before you signed in for the
        first time.
      </Body>
    </section>
  );
}

function MCPSection() {
  return (
    <section>
      <SectionHeader
        eyebrow="04 · Conversational interface"
        title="The MCP — your conversational interface"
      />
      <Body>
        The dashboard you're looking at isn't where you spend most of your
        time. The chat is. From inside Claude Desktop or Claude Code, you talk
        to your assistant — and the assistant uses the MyJarvis MCP to write
        files, run database queries, deploy changes, send voice notes,
        everything.
      </Body>
      <Card accent={T.blue}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT,
            fontSize: 14,
            color: T.ink2,
            lineHeight: 1.6,
          }}
        >
          One MCP, every tenant. When you're authenticated, every tool call is
          scoped to your tenant: your repo, your database, your voice feed.
          The MCP knows who you are; it can't accidentally talk to someone
          else's stack.
        </p>
      </Card>
    </section>
  );
}

function DataSection() {
  return (
    <section>
      <SectionHeader
        eyebrow="05 · Data"
        title="Your data, fully isolated"
      />
      <Body>
        Each row in your dashboard's database belongs to your tenant — there's
        no <code style={{ fontFamily: "monospace", fontSize: 13 }}>tenant_id</code>{" "}
        column to filter on, because the database itself is yours. No SQL
        accident on the platform side could expose your data to another user.
        That's the entire point of the per-tenant Neon project.
      </Body>
      <Body>
        Voice transcripts, task lists, knowledge base entries, settings — they
        all live in your Postgres. Audio lives in your R2. The WorkOS token
        verifying your identity is checked against your tenant's owner ID
        before any data is returned.
      </Body>
    </section>
  );
}

function NextSection({ displayName }: { displayName: string }) {
  return (
    <section>
      <SectionHeader eyebrow="06 · Next" title="What to do next" />
      <Body>
        Open Claude Desktop or Claude Code. Tell your assistant what you want
        to build — a tasks page, a knowledge base, a daily planner, a meeting
        log, a content workshop. They build it here. The sidebar fills up.
        The dashboard becomes yours.
      </Body>
      <Card accent={T.plum}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT,
            fontSize: 14,
            color: T.ink2,
            lineHeight: 1.6,
          }}
        >
          Welcome again, {displayName}. The platform's built. The plumbing's
          done. From here it's all about what you want to ship.
        </p>
      </Card>
    </section>
  );
}

function Footer() {
  return (
    <div
      style={{
        borderTop: `1px solid ${T.line}`,
        marginTop: 60,
        paddingTop: 28,
        fontFamily: FONT,
        fontSize: 13,
        color: T.ink2,
        textAlign: "center",
      }}
    >
      <p style={{ margin: "0 0 8px" }}>
        MyJarvis · Welcome · 2026
      </p>
      <p style={{ margin: 0, color: T.ink3, fontSize: 12 }}>
        Edit this page or replace it entirely — it's just{" "}
        <code style={{ fontFamily: "monospace" }}>WelcomePage.tsx</code> in{" "}
        your tenant repo.
      </p>
    </div>
  );
}

export function WelcomePage() {
  const { displayName } = getTenantIdentity();

  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100vh",
        fontFamily: FONT,
        boxSizing: "border-box",
        margin: "-32px -24px -32px -24px",
        padding: "40px 48px 80px",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Hero displayName={displayName} />
        <VersionBanner />
        <TOC />

        <ShapeSection />
        <Divider />
        <PrivateSection />
        <Divider />
        <VoiceSection />
        <Divider />
        <MCPSection />
        <Divider />
        <DataSection />
        <Divider />
        <NextSection displayName={displayName} />

        <Footer />
      </div>
    </div>
  );
}
