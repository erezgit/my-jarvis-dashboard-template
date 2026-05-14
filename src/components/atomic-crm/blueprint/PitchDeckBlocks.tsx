// PitchDeckBlocks.tsx — MJOS-028, refreshed MJOS-063
//
// Block library for the MAX Security Eyal pitch deck.
//
// Reference: /public/blueprints/max-security-eyal-pitch-deck.html (578 lines,
// archived). The reference is a stand-alone HTML file with absolutely-positioned
// slides, JS-driven slide navigation, keyboard arrows, dot indicators.
//
// MJOS-063 fixes (in order):
//   * Nav uses `position: absolute` so it stays CONTAINED within the deck
//     wrapper (PitchDocBlueprintPage's `absolute inset-0` box). Was `fixed`,
//     which broke out past the voice-panel column.
//   * Progress bar + play button match the voice-feed look (shared Slider
//     component, green-600 button, lucide Play/Pause).
//   * Progress is driven by a `requestAnimationFrame` loop polling
//     `audio.currentTime` (~60fps smooth) — NOT the audio element's
//     `timeupdate` event (~4Hz steppy). This mirrors the
//     `myjarvis-architecture.html` reference deck behavior.
//   * Auto-advance is a simple `autoPlayRef` boolean:
//       - first user play click ⇒ autoPlayRef=true
//       - on `ended`, if autoPlayRef && there's a next slide, setActive(+1)
//       - the active-change effect plays the new audio when autoPlayRef
//         is true
//       - manual dot click resets autoPlayRef=false (user has taken over)
//     Pausing mid-slide doesn't disable autoPlay — resume continues to
//     chain. Last slide ends naturally and the player resets.

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { BlockConfig } from "./BlockRenderer";

// ── Palette — copied from reference HTML's :root variables ────────────────
const T = {
  bg: "#F2F7FD",
  bg2: "#E5EEF9",
  ink: "#1C1917",
  ink2: "#57534E",
  ink3: "#A8A29E",
  sky: "#7AB4F4",
  skyDark: "#3B82C8",
  skySoft: "#D2E4FC",
  line: "#D0DEF0",
  accent: "#2A6AAC",
  green: "#2A7A4B",
  greenSoft: "#E8F3EC",
  amber: "#B87333",
  amberSoft: "#FCEFD9",
  blue: "#3B6BA5",
  blueSoft: "#E3EDF7",
  plum: "#8E4585",
  plumSoft: "#F3E6F2",
  red: "#B23A3A",
  redSoft: "#FBE5E5",
  hubspot: "#FF7A59",
  hubspotSoft: "#FFE7DF",
  outlook: "#0078D4",
  outlookSoft: "#DAEAF7",
  monday: "#FFCB00",
  mondaySoft: "#FFF4CC",
  mondayInk: "#6B5B00",
  white: "#FFFFFF",
} as const;

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

// ── Slide container styles ─────────────────────────────────────────────────
const slideContainerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "6vh 8vw 12vh",
  opacity: 0,
  transform: "translateY(20px)",
  transition:
    "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
  pointerEvents: "none",
  overflowY: "auto",
};

const slideContainerActiveStyle: React.CSSProperties = {
  opacity: 1,
  transform: "translateY(0)",
  pointerEvents: "auto",
};

// ── Block prop types ───────────────────────────────────────────────────────
type CoverProps = {
  mark: string;
  titleLine1: string;
  titleAccent: string;
  sub: string;
  micro: string;
};

type ArchSysBox = {
  variant: "hubspot" | "outlook" | "monday" | "dash" | "output";
  tag: string;
  name: string;
  desc: string;
};

type ChipVariant = "default" | "blue" | "green" | "amber" | "plum" | "red";

type ArchSlideProps = {
  chipText: string;
  chipVariant: ChipVariant;
  title: string;
  sources: ArchSysBox[];
  middle: ArchSysBox;
  outputs: ArchSysBox[];
};

type UseCaseFlowNode = {
  variant: "hubspot" | "outlook" | "monday" | "dash";
  label: string;
};

type UseCaseCard = {
  metric: boolean;
  tag: string;
  ttl: string;
  body?: string;
};

type UseCaseSlideProps = {
  chipText: string;
  chipVariant: ChipVariant;
  title: string;
  flowNodes: UseCaseFlowNode[];
  cards: UseCaseCard[];
};

// ── Helpers ────────────────────────────────────────────────────────────────
function renderTitleLines(title: string, accentLine?: string) {
  const lines = title.split("|").map((l) => l.trim());
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {accentLine === line ? (
        <span style={{ color: T.skyDark, fontWeight: 500, fontStyle: "italic" }}>{line}</span>
      ) : (
        line
      )}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

function chipStyle(variant: ChipVariant): React.CSSProperties {
  const map: Record<string, [string, string]> = {
    default: [T.skySoft, T.accent],
    blue: [T.blueSoft, T.blue],
    green: [T.greenSoft, T.green],
    amber: [T.amberSoft, T.amber],
    plum: [T.plumSoft, T.plum],
    red: [T.redSoft, T.red],
  };
  const [bg, color] = map[variant] ?? map.default;
  return {
    display: "inline-block",
    padding: "5px 12px",
    background: bg,
    color,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 18,
    letterSpacing: 0.3,
  };
}

function sysBoxStyle(variant: ArchSysBox["variant"]): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "18px 20px",
    borderRadius: 14,
    background: T.white,
    border: `1px solid ${T.line}`,
    position: "relative",
  };
  if (variant === "dash") {
    return {
      ...base,
      background: "linear-gradient(135deg, #3B82C8, #8E4585)",
      border: "1px solid transparent",
      color: T.white,
    };
  }
  if (variant === "output") {
    return { ...base, background: T.skySoft, border: "1px solid transparent" };
  }
  return base;
}

function sysTagStyle(variant: ArchSysBox["variant"]): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    padding: "3px 9px",
    borderRadius: 6,
  };
  switch (variant) {
    case "hubspot":
      return { ...base, background: T.hubspotSoft, color: T.hubspot };
    case "outlook":
      return { ...base, background: T.outlookSoft, color: T.outlook };
    case "monday":
      return { ...base, background: T.mondaySoft, color: T.mondayInk };
    case "dash":
      return { ...base, background: "rgba(255,255,255,0.2)", color: T.white };
    case "output":
      return { ...base, background: T.accent, color: T.white };
  }
}

function fnodeStyle(variant: UseCaseFlowNode["variant"]): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 12.5,
    fontWeight: 600,
  };
  switch (variant) {
    case "hubspot":
      return { ...base, background: T.hubspotSoft, color: T.hubspot };
    case "outlook":
      return { ...base, background: T.outlookSoft, color: T.outlook };
    case "monday":
      return { ...base, background: T.mondaySoft, color: T.mondayInk };
    case "dash":
      return {
        ...base,
        background: `linear-gradient(135deg, ${T.skyDark}, ${T.plum})`,
        color: T.white,
      };
  }
}

// ── Deck wrapper ──────────────────────────────────────────────────────────
function Deck({
  children,
  audioBase,
  rtl,
}: {
  children?: React.ReactNode;
  audioBase?: string;
  rtl?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // True once the user has clicked play. Carries play state across slides
  // so audio chains automatically. Manual dot navigation flips it off.
  const autoPlayRef = useRef(false);

  // Count slide children + apply active attribute.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const w = wrapperRef.current;
    if (!w) return;
    const slides = w.querySelectorAll<HTMLElement>("[data-slide]");
    setCount((prev) => (prev === slides.length ? prev : slides.length));
    slides.forEach((el, i) => {
      el.setAttribute("data-active", i === active ? "true" : "false");
      Object.assign(el.style, i === active ? slideContainerActiveStyle : {});
      if (i !== active) {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.pointerEvents = "none";
      }
    });
  });

  // Load audio for the active slide. If autoPlay is on, play it.
  useEffect(() => {
    if (!audioBase) return;
    const audio = audioRef.current;
    if (!audio) return;
    const padded = String(active + 1).padStart(2, "0");
    audio.src = `${audioBase}/slide-${padded}.mp3`;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (autoPlayRef.current) {
      void audio.play().catch(() => undefined);
    }
  }, [active, audioBase]);

  // rAF-driven progress polling — smooth at 60fps. Same pattern as
  // VoicePlayerInline + the reference HTML decks.
  useEffect(() => {
    if (!playing) return;
    const audio = audioRef.current;
    if (!audio) return;
    let raf = 0;
    const tick = () => {
      setCurrentTime(audio.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Keyboard: arrows navigate; spacebar toggles play (audio mode only)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive((c) => Math.min(c + 1, count - 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive((c) => Math.max(c - 1, 0));
      }
      if (e.key === "Home") setActive(0);
      if (e.key === "End") setActive(Math.max(0, count - 1));
      if (audioBase && e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, audioBase]);

  function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      autoPlayRef.current = true;
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }

  function onSeek(v: number[]) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const t = Math.max(0, Math.min(duration, v[0]));
    audio.currentTime = t;
    setCurrentTime(t);
  }

  return (
    <div
      ref={wrapperRef}
      dir={rtl ? "rtl" : "ltr"}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: T.bg,
        color: T.ink,
        fontFamily: rtl
          ? "'Heebo', 'Assistant', 'Rubik', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
          : FONT,
        letterSpacing: rtl ? 0 : "-0.011em",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'); @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap');`}</style>

      {children}

      {audioBase && (
        <audio
          ref={audioRef}
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onEnded={() => {
            if (autoPlayRef.current && active < count - 1) {
              setActive(active + 1);
            }
          }}
        />
      )}

      {/* Nav — CONTAINED within the deck wrapper via position:absolute */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 border-t px-6 py-3"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTopColor: T.line,
          boxShadow: "0 -2px 16px rgba(28,25,23,0.04)",
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className="shrink-0 whitespace-nowrap text-xs font-semibold tabular-nums"
            style={{ color: T.ink2, minWidth: 48 }}
          >
            {active + 1} / {count}
          </span>

          {audioBase && (
            <>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                  playing
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {playing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4" />
                )}
              </button>

              <span className="min-w-[40px] text-xs text-gray-500 tabular-nums">
                {formatTime(currentTime)}
              </span>

              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={onSeek}
                className="flex-1"
              />

              <span className="min-w-[40px] text-xs text-gray-500 tabular-nums">
                {formatTime(duration)}
              </span>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setActive((c) => Math.max(0, c - 1))}
            disabled={active === 0}
            style={navBtnStyle(active === 0)}
            aria-label="Previous slide"
          >
            ←
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  // Manual dot click = user has taken over; stop auto-advance.
                  autoPlayRef.current = false;
                  setActive(i);
                }}
                aria-label={`Slide ${i + 1}`}
                style={dotStyle(i === active)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setActive((c) => Math.min(count - 1, c + 1))}
            disabled={active === count - 1}
            style={navBtnStyle(active === count - 1)}
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    cursor: disabled ? "default" : "pointer",
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: T.ink,
    fontSize: 18,
    transition: "background 0.2s ease",
    opacity: disabled ? 0.25 : 1,
  };
}

function dotStyle(isActive: boolean): React.CSSProperties {
  return {
    width: isActive ? 20 : 7,
    height: 7,
    borderRadius: isActive ? 4 : "50%",
    background: isActive ? T.skyDark : T.ink3,
    opacity: isActive ? 1 : 0.3,
    cursor: "pointer",
    transition: "all 0.3s ease",
    flexShrink: 0,
    border: "none",
    padding: 0,
  };
}

// ── Slide block components ─────────────────────────────────────────────────

function CoverSlide({ mark, titleLine1, titleAccent, sub, micro }: CoverProps) {
  return (
    <section data-slide="cover" style={slideContainerStyle}>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: T.skyDark,
          marginBottom: 48,
        }}
      >
        {mark}
      </div>
      <h1
        style={{
          fontSize: "clamp(58px, 8.5vw, 120px)",
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
          margin: 0,
        }}
      >
        {titleLine1}
        <br />
        <span style={{ color: T.skyDark, fontWeight: 500, fontStyle: "italic" }}>
          {titleAccent}
        </span>
      </h1>
      <div
        style={{
          marginTop: 24,
          fontSize: "clamp(16px, 1.3vw, 20px)",
          color: T.ink2,
          fontWeight: 400,
          maxWidth: "56ch",
          lineHeight: 1.5,
        }}
      >
        {sub}
      </div>
      <div
        style={{
          fontSize: 12,
          color: T.ink3,
          letterSpacing: "0.02em",
          marginTop: 28,
        }}
      >
        {micro}
      </div>
    </section>
  );
}

function ArchitectureSlide({
  chipText,
  chipVariant,
  title,
  sources,
  middle,
  outputs,
}: ArchSlideProps) {
  return (
    <section data-slide="architecture" style={slideContainerStyle}>
      <div style={chipStyle(chipVariant)}>{chipText}</div>
      <h2
        style={{
          fontSize: "clamp(28px, 3.6vw, 48px)",
          fontWeight: 600,
          lineHeight: 1.08,
          letterSpacing: "-0.025em",
          maxWidth: "22ch",
          margin: 0,
        }}
      >
        {renderTitleLines(title)}
      </h2>
      <div
        style={{
          marginTop: 32,
          display: "grid",
          gridTemplateRows: "auto auto auto auto auto",
          gap: 14,
          maxWidth: 1080,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {(sources || []).map((s, i) => (
            <SysBox key={i} box={s} />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            color: T.skyDark,
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          ↓ &nbsp; ↓ &nbsp; ↓
        </div>
        <div style={{ maxWidth: 540, margin: "0 auto", width: "100%" }}>
          <SysBox box={middle} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            color: T.skyDark,
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          ↓ &nbsp; ↓
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          {(outputs || []).map((s, i) => (
            <SysBox key={i} box={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCaseSlide({
  chipText,
  chipVariant,
  title,
  flowNodes,
  cards,
}: UseCaseSlideProps) {
  return (
    <section data-slide="usecase" style={slideContainerStyle}>
      <div style={chipStyle(chipVariant)}>{chipText}</div>
      <h2
        style={{
          fontSize: "clamp(28px, 3.6vw, 48px)",
          fontWeight: 600,
          lineHeight: 1.08,
          letterSpacing: "-0.025em",
          maxWidth: "22ch",
          margin: 0,
        }}
      >
        {renderTitleLines(title)}
      </h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 22,
        }}
      >
        {(flowNodes || []).map((n, i) => (
          <React.Fragment key={i}>
            <div style={fnodeStyle(n.variant)}>{n.label}</div>
            {i < flowNodes.length - 1 && (
              <span style={{ color: T.ink3, fontSize: 16 }}>
                {i === flowNodes.length - 2 ? "→" : "+"}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
        }}
      >
        {(cards || []).map((c, i) => (
          <div
            key={i}
            style={{
              padding: "18px 20px",
              background: c.metric ? T.greenSoft : T.white,
              border: c.metric ? "1px solid transparent" : `1px solid ${T.line}`,
              borderRadius: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: c.metric ? T.green : T.skyDark,
              }}
            >
              {c.tag}
            </div>
            <div
              style={{
                fontSize: c.metric ? 22 : 15,
                fontWeight: 600,
                marginTop: 8,
                letterSpacing: "-0.01em",
                color: c.metric ? T.green : T.ink,
              }}
            >
              {c.ttl}
            </div>
            {c.body && (
              <p
                style={{
                  fontSize: 12.5,
                  color: T.ink2,
                  lineHeight: 1.55,
                  marginTop: 8,
                  margin: "8px 0 0 0",
                }}
              >
                {c.body}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SysBox({ box }: { box: ArchSysBox }) {
  return (
    <div style={sysBoxStyle(box.variant)}>
      <span style={sysTagStyle(box.variant)}>{box.tag}</span>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          marginTop: 10,
          letterSpacing: "-0.01em",
          color: box.variant === "dash" ? T.white : T.ink,
        }}
      >
        {box.name}
      </div>
      <div
        style={{
          fontSize: 12,
          color: box.variant === "dash" ? T.white : T.ink2,
          marginTop: 6,
          lineHeight: 1.45,
        }}
      >
        {box.desc}
      </div>
    </div>
  );
}

// ── Generic slide types ────────────────────────────────────────────────────

type Bullet = { title: string; body?: string };

type ContentSlideProps = {
  chipText?: string;
  chipVariant?: ChipVariant;
  title: string;
  lede?: string;
  bullets?: Bullet[];
};

type CompareColumn = {
  heading: string;
  tone?: "neutral" | "blue" | "plum" | "amber";
  bullets: Bullet[];
};

type CompareSlideProps = {
  chipText?: string;
  chipVariant?: ChipVariant;
  title: string;
  left: CompareColumn;
  right: CompareColumn;
};

type QuoteSlideProps = {
  chipText?: string;
  chipVariant?: ChipVariant;
  quote: string;
  attribution?: string;
  caption?: string;
};

type StackItem = { num?: string; title: string; body: string };

type StackSlideProps = {
  chipText?: string;
  chipVariant?: ChipVariant;
  title: string;
  lede?: string;
  items: StackItem[];
};

const slideTitleStyle: React.CSSProperties = {
  fontSize: "clamp(28px, 3.6vw, 48px)",
  fontWeight: 600,
  lineHeight: 1.08,
  letterSpacing: "-0.025em",
  maxWidth: "22ch",
  margin: 0,
};

const slideLedeStyle: React.CSSProperties = {
  marginTop: 18,
  fontSize: "clamp(15px, 1.2vw, 19px)",
  color: T.ink2,
  lineHeight: 1.55,
  maxWidth: "62ch",
};

function bulletCardStyle(): React.CSSProperties {
  return {
    padding: "16px 18px",
    background: T.white,
    border: `1px solid ${T.line}`,
    borderRadius: 12,
  };
}

function columnToneStyles(tone: CompareColumn["tone"] = "neutral"): {
  bg: string;
  border: string;
  heading: string;
} {
  switch (tone) {
    case "blue":
      return { bg: T.blueSoft, border: "transparent", heading: T.blue };
    case "plum":
      return { bg: T.plumSoft, border: "transparent", heading: T.plum };
    case "amber":
      return { bg: T.amberSoft, border: "transparent", heading: T.amber };
    default:
      return { bg: T.white, border: T.line, heading: T.skyDark };
  }
}

function ContentSlide({
  chipText,
  chipVariant = "default",
  title,
  lede,
  bullets,
}: ContentSlideProps) {
  return (
    <section data-slide="content" style={slideContainerStyle}>
      {chipText && <div style={chipStyle(chipVariant)}>{chipText}</div>}
      <h2 style={slideTitleStyle}>{renderTitleLines(title)}</h2>
      {lede && <p style={slideLedeStyle}>{lede}</p>}
      {bullets && bullets.length > 0 && (
        <div
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns:
              bullets.length === 4
                ? "repeat(4, 1fr)"
                : bullets.length >= 3
                  ? "repeat(3, 1fr)"
                  : `repeat(${bullets.length}, 1fr)`,
            gap: 16,
            maxWidth: 1080,
            width: "100%",
          }}
        >
          {bullets.map((b, i) => (
            <div key={i} style={bulletCardStyle()}>
              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: T.ink,
                  letterSpacing: "-0.005em",
                }}
              >
                {b.title}
              </div>
              {b.body && (
                <div
                  style={{
                    fontSize: 12.5,
                    color: T.ink2,
                    lineHeight: 1.55,
                    marginTop: 6,
                  }}
                >
                  {b.body}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CompareSlide({
  chipText,
  chipVariant = "default",
  title,
  left,
  right,
}: CompareSlideProps) {
  const renderColumn = (col: CompareColumn) => {
    const styles = columnToneStyles(col.tone);
    return (
      <div
        style={{
          padding: "20px 22px",
          background: styles.bg,
          border: `1px solid ${styles.border}`,
          borderRadius: 16,
          minHeight: "100%",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: styles.heading,
            marginBottom: 14,
          }}
        >
          {col.heading}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {col.bullets.map((b, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.ink,
                  letterSpacing: "-0.005em",
                }}
              >
                {b.title}
              </div>
              {b.body && (
                <div
                  style={{
                    fontSize: 12.5,
                    color: T.ink2,
                    lineHeight: 1.55,
                    marginTop: 4,
                  }}
                >
                  {b.body}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section data-slide="compare" style={slideContainerStyle}>
      {chipText && <div style={chipStyle(chipVariant)}>{chipText}</div>}
      <h2 style={slideTitleStyle}>{renderTitleLines(title)}</h2>
      <div
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          maxWidth: 1080,
          width: "100%",
        }}
      >
        {renderColumn(left)}
        {renderColumn(right)}
      </div>
    </section>
  );
}

function QuoteSlide({
  chipText,
  chipVariant = "default",
  quote,
  attribution,
  caption,
}: QuoteSlideProps) {
  return (
    <section data-slide="quote" style={slideContainerStyle}>
      {chipText && <div style={chipStyle(chipVariant)}>{chipText}</div>}
      <div
        style={{
          fontSize: "clamp(28px, 3.4vw, 44px)",
          fontWeight: 500,
          lineHeight: 1.22,
          letterSpacing: "-0.018em",
          color: T.ink,
          maxWidth: "28ch",
          paddingLeft: 18,
          borderLeft: `4px solid ${T.skyDark}`,
        }}
      >
        &ldquo;{quote}&rdquo;
      </div>
      {attribution && (
        <div
          style={{
            marginTop: 22,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 0.4,
            color: T.skyDark,
          }}
        >
          {attribution}
        </div>
      )}
      {caption && (
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            color: T.ink3,
            lineHeight: 1.55,
            maxWidth: "60ch",
          }}
        >
          {caption}
        </div>
      )}
    </section>
  );
}

function StackSlide({
  chipText,
  chipVariant = "default",
  title,
  lede,
  items,
}: StackSlideProps) {
  return (
    <section data-slide="stack" style={slideContainerStyle}>
      {chipText && <div style={chipStyle(chipVariant)}>{chipText}</div>}
      <h2 style={slideTitleStyle}>{renderTitleLines(title)}</h2>
      {lede && <p style={slideLedeStyle}>{lede}</p>}
      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
          maxWidth: 1080,
          width: "100%",
        }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              padding: "16px 20px",
              background: T.white,
              border: `1px solid ${T.line}`,
              borderRadius: 12,
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: T.skySoft,
                color: T.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {it.num ?? String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: T.ink,
                  letterSpacing: "-0.005em",
                }}
              >
                {it.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: T.ink2,
                  lineHeight: 1.55,
                  marginTop: 4,
                }}
              >
                {it.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type ImageSlideProps = {
  chipText?: string;
  chipVariant?: ChipVariant;
  title: string;
  lede?: string;
  imageUrl: string;
  imageAlt?: string;
  caption?: string;
};

function ImageSlide({
  chipText,
  chipVariant = "default",
  title,
  lede,
  imageUrl,
  imageAlt,
  caption,
}: ImageSlideProps) {
  return (
    <section data-slide="image" style={slideContainerStyle}>
      {chipText && <div style={chipStyle(chipVariant)}>{chipText}</div>}
      <h2 style={slideTitleStyle}>{renderTitleLines(title)}</h2>
      {lede && <p style={slideLedeStyle}>{lede}</p>}
      <div
        style={{
          marginTop: 16,
          width: "100%",
          maxWidth: 1100,
          alignSelf: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <img
          src={imageUrl}
          alt={imageAlt ?? title}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "62vh",
            objectFit: "contain",
            borderRadius: 16,
            border: `1px solid ${T.line}`,
            boxShadow: "0 8px 32px rgba(28,25,23,0.08)",
            background: T.white,
          }}
        />
        {caption && (
          <p
            style={{
              fontSize: 12,
              color: T.ink3,
              textAlign: "center",
              maxWidth: 720,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}

type FlowStep = {
  num?: string;
  title: string;
  body?: string;
  tone?: ChipVariant;
};

type FlowDiagramSlideProps = {
  chipText?: string;
  chipVariant?: ChipVariant;
  title: string;
  lede?: string;
  steps: FlowStep[];
};

function FlowDiagramSlide({
  chipText,
  chipVariant = "default",
  title,
  lede,
  steps,
}: FlowDiagramSlideProps) {
  const toneColor = (tone?: ChipVariant): string => {
    const map: Record<string, string> = {
      default: T.skyDark,
      blue: T.blue,
      green: T.green,
      amber: T.amber,
      plum: T.plum,
      red: T.red,
    };
    return map[tone ?? "default"] ?? T.skyDark;
  };
  return (
    <section data-slide="flow" style={slideContainerStyle}>
      {chipText && <div style={chipStyle(chipVariant)}>{chipText}</div>}
      <h2 style={slideTitleStyle}>{renderTitleLines(title)}</h2>
      {lede && <p style={slideLedeStyle}>{lede}</p>}
      <div
        style={{
          marginTop: 16,
          width: "100%",
          maxWidth: 1180,
          alignSelf: "center",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                flex: "1 1 160px",
                minWidth: 160,
                maxWidth: 220,
                padding: "14px 16px",
                background: T.white,
                border: `1px solid ${T.line}`,
                borderRadius: 12,
                borderTop: `3px solid ${toneColor(step.tone)}`,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {step.num !== undefined && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: toneColor(step.tone),
                    letterSpacing: "0.08em",
                  }}
                >
                  {step.num}
                </div>
              )}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.ink,
                  lineHeight: 1.3,
                  letterSpacing: "-0.005em",
                }}
              >
                {step.title}
              </div>
              {step.body && (
                <div
                  style={{
                    fontSize: 12,
                    color: T.ink2,
                    lineHeight: 1.45,
                  }}
                >
                  {step.body}
                </div>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.ink3,
                  fontSize: 18,
                  flex: "0 0 16px",
                  fontWeight: 300,
                }}
              >
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

// ── BlockConfig ───────────────────────────────────────────────────────────
export const pitchDeckConfig: BlockConfig = {
  components: {
    Deck,
    CoverSlide,
    ArchitectureSlide,
    UseCaseSlide,
    ContentSlide,
    CompareSlide,
    QuoteSlide,
    StackSlide,
    ImageSlide,
    FlowDiagramSlide,
  } as unknown as BlockConfig["components"],
};
