// Shared Blueprint primitives — extracted so MAX Security and other pages can
// adopt the same cream/peach editorial layout used by BusinessBlueprintPage.
// BusinessBlueprintPage keeps its internal copies (zero-risk, no refactor of
// the canonical page); new pages should import from here.

import React from "react";

// ── Theme ──────────────────────────────────────────────────────────────────

export const T = {
  bg: "#FDF7F2",
  bg2: "#FAEFE5",
  ink: "#1C1917",
  ink2: "#57534E",
  ink3: "#A8A29E",
  peach: "#F4A27A",
  peachDark: "#E8814E",
  peachSoft: "#FCE4D2",
  line: "#EADDD0",
  accent: "#C4602A",
  green: "#2A7A4B",
  greenSoft: "#E8F3EC",
  amber: "#B87333",
  amberSoft: "#FCEFD9",
  blue: "#3B6BA5",
  blueSoft: "#E3EDF7",
  plum: "#8E4585",
  plumSoft: "#F3E6F2",
  white: "#FFFFFF",
  red: "#C0392B",
  redSoft: "#FDECEA",
} as const;

// ── Layout shell ───────────────────────────────────────────────────────────

export function BlueprintShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
        margin: "-16px -24px -16px -24px",
        padding: "40px 48px 80px",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

// ── Hero (page title) ──────────────────────────────────────────────────────

export function Hero({
  eyebrow,
  subEyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  subEyebrow?: string;
  title: string;
  lede?: React.ReactNode;
}) {
  return (
    <div style={{ textAlign: "center", padding: "32px 20px 40px", marginBottom: 28 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: T.peachDark,
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
          marginBottom: 14,
        }}
      >
        {eyebrow}
      </div>
      {subEyebrow && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: T.peachDark,
            textTransform: "uppercase",
            fontFamily: "Inter, sans-serif",
            marginBottom: 10,
          }}
        >
          {subEyebrow}
        </div>
      )}
      <h1
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: T.ink,
          fontFamily: "Inter, sans-serif",
          margin: "0 0 14px",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>
      {lede && (
        <p
          style={{
            fontSize: 16,
            color: T.ink2,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.65,
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────

export function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: T.peachDark,
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
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
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

export function Section({ children }: { children: React.ReactNode }) {
  return <section style={{ marginBottom: 60 }}>{children}</section>;
}

export function Divider() {
  return <div style={{ borderTop: `1px solid ${T.line}`, margin: "48px 0" }} />;
}

// ── Cards ──────────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  accentColor,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentColor?: string;
}) {
  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.line}`,
        borderRadius: 10,
        padding: "18px 22px",
        borderLeft: accentColor ? `4px solid ${accentColor}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({
  stat,
  label,
  body,
}: {
  stat: string;
  label: string;
  body?: string;
}) {
  return (
    <Card>
      <span
        style={{
          display: "block",
          fontSize: 36,
          fontWeight: 700,
          color: T.peachDark,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {stat}
      </span>
      <span
        style={{
          display: "block",
          color: T.ink3,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontFamily: "Inter, sans-serif",
          marginBottom: body ? 12 : 0,
        }}
      >
        {label}
      </span>
      {body && (
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: T.ink2,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.55,
          }}
        >
          {body}
        </p>
      )}
    </Card>
  );
}

export function QuoteBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderLeft: `3px solid ${T.peachDark}`,
        padding: "12px 20px",
        margin: "24px 0",
        background: T.bg2,
        fontStyle: "italic",
        color: T.ink2,
        borderRadius: "0 8px 8px 0",
        fontFamily: "Inter, sans-serif",
        fontSize: 15,
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

// ── Typography ─────────────────────────────────────────────────────────────

export function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 16,
        color: T.ink2,
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.7,
        marginBottom: 28,
        maxWidth: 760,
      }}
    >
      {children}
    </p>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 15,
        color: T.ink,
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.65,
        marginTop: 0,
        marginBottom: 14,
      }}
    >
      {children}
    </p>
  );
}

export function H3({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <h3
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: color || T.blue,
        fontFamily: "Inter, sans-serif",
        margin: "28px 0 10px",
      }}
    >
      {children}
    </h3>
  );
}

export function H4({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <h4
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: color || T.peachDark,
        fontFamily: "Inter, sans-serif",
        margin: "0 0 8px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </h4>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul
      style={{
        paddingLeft: 22,
        margin: "8px 0 14px",
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        color: T.ink,
        lineHeight: 1.65,
      }}
    >
      {children}
    </ul>
  );
}

export function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol
      style={{
        paddingLeft: 22,
        margin: "8px 0 14px",
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        color: T.ink,
        lineHeight: 1.65,
      }}
    >
      {children}
    </ol>
  );
}

export function LI({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: 6 }}>{children}</li>;
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <span style={{ fontWeight: 700, color: T.ink }}>{children}</span>;
}

// ── Tables ─────────────────────────────────────────────────────────────────

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div
      style={{
        overflowX: "auto",
        margin: "20px 0",
        borderRadius: 10,
        border: `1px solid ${T.line}`,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          background: T.white,
        }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  background: T.bg2,
                  color: T.peachDark,
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "10px 14px",
                  textAlign: "left",
                  borderBottom: `1px solid ${T.line}`,
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "10px 14px",
                    borderBottom: ri < rows.length - 1 ? `1px solid ${T.line}` : "none",
                    verticalAlign: "top",
                    color: T.ink,
                    lineHeight: 1.55,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Grids ──────────────────────────────────────────────────────────────────

export function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 16,
        margin: "20px 0",
      }}
    >
      {children}
    </div>
  );
}

export function Grid3({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        margin: "20px 0",
      }}
    >
      {children}
    </div>
  );
}

// ── Banner / callout strip ─────────────────────────────────────────────────

export function VersionBanner({
  badge,
  children,
}: {
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: T.peachSoft,
        border: `1px dashed ${T.peachDark}`,
        borderRadius: 8,
        padding: "12px 18px",
        margin: "0 0 28px",
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        color: T.ink2,
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          background: T.peachDark,
          color: T.white,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "3px 10px",
          borderRadius: 999,
          textTransform: "uppercase",
        }}
      >
        {badge}
      </span>
      <span>{children}</span>
    </div>
  );
}

// ── TOC (table of contents) ────────────────────────────────────────────────

export function TOC({ items }: { items: string[] }) {
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
          fontFamily: "Inter, sans-serif",
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
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: T.ink2,
              padding: "4px 0",
            }}
          >
            <span style={{ color: T.peachDark, fontWeight: 600, marginRight: 8 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pill / status badge ────────────────────────────────────────────────────

export function Pill({
  label,
  bg = T.peachSoft,
  color = T.peachDark,
}: {
  label: string;
  bg?: string;
  color?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: bg,
        color,
        fontFamily: "Inter, sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 999,
      }}
    >
      {label}
    </span>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────

export function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${T.line}`,
        marginTop: 60,
        paddingTop: 28,
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        color: T.ink2,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}
