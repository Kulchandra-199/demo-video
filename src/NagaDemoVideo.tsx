import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Sequence,
  Img,
  staticFile,
  Audio,
  useVideoConfig,
} from "remotion";
import { useAudioData, getWaveformPortion } from "@remotion/media-utils";
import Orb from "./Orb";

/* ───────── Brand Tokens ───────── */
const C = {
  navy: "#0a2540",
  blue: "#0094d7",
  teal: "#28b9d0",
  white: "#ffffff",
  offWhite: "#f4f7fa",
  lightGray: "#eef2f6",
  charcoal: "#1d1d1b",
  slate: "#475569",
  glass: "rgba(255,255,255,0.06)",
};

const FONT = "'Sofia Pro', sans-serif";

/* ───────── Hooks ───────── */
const useFade = (delay: number, dur = 12) => {
  const f = useCurrentFrame();
  return interpolate(f - delay, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

/* ───────── Talking Orb Component ─────────
    A glowing orb representing NAGA AI with brand colors
    Simulates talking/speaking animation in sync with audio */
const TalkingOrb: React.FC<{
  size?: number;
  speaking?: boolean;
  light?: boolean;
  audioAmplitude?: number;
}> = ({ size = 200, speaking = true, light = false, audioAmplitude = 0 }) => {
  const f = useCurrentFrame();

  // The audio amplitude is the primary driver - it comes from the actual audio waveform
  // When there's sound, the orb expands. When silent, it stays calm.
  const amp = Math.max(0, Math.min(audioAmplitude * 2, 1)); // Boost and clamp to 0-1

  // Gentle base pulse when speaking (subtle breathing)
  const basePulse = speaking ? 1 + Math.sin(f * 0.08) * 0.02 : 1;

  // Main scale driven by audio - this is the "talking" effect
  // When audio is loud, orb expands. When quiet, it contracts.
  const talkScale = 1 + amp * 0.12;

  // Glow intensity follows audio directly
  const glowOpacity = 0.3 + amp * 0.5;
  const glowSize = 1 + amp * 0.15;

  // Inner core brightness follows audio
  const coreOpacity = 0.2 + amp * 0.6;
  const coreSize = 1 + amp * 0.3;

  // Hover intensity for the Orb WebGL component
  const hoverIntensity = speaking ? 0.2 + amp * 0.6 : 0.15;

  return (
    <div style={{
      position: "relative",
      width: size,
      height: size,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Outer ambient glow - pulses with audio */}
      <div style={{
        position: "absolute",
        width: size * 1.5,
        height: size * 1.5,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.blue}${Math.floor(glowOpacity * 80).toString(16).padStart(2, '0')} 0%, ${C.teal}${Math.floor(glowOpacity * 40).toString(16).padStart(2, '0')} 30%, transparent 60%)`,
        filter: "blur(60px)",
        transform: `scale(${glowSize * basePulse})`,
      }} />

      {/* Main orb container */}
      <div style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        transform: `scale(${talkScale * basePulse})`,
      }}>
        <Orb
          hoverIntensity={hoverIntensity}
          rotateOnHover={false}
          forceHoverState={speaking}
          backgroundColor={light ? "#ffffff" : "#0a2540"}
        />
      </div>

      {/* Inner bright core - pulses with speech */}
      <div style={{
        position: "absolute",
        width: size * 0.25,
        height: size * 0.25,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,255,255,${coreOpacity}) 0%, ${C.teal}${Math.floor(coreOpacity * 60).toString(16).padStart(2, '0')} 50%, transparent 70%)`,
        transform: `scale(${coreSize})`,
        filter: "blur(8px)",
      }} />
    </div>
  );
};

/* ───────── Logo Component ───────── */
const LogoIntra: React.FC<{ size?: number; wordmark?: boolean; light?: boolean }> = ({
  size = 48,
  wordmark = false,
  light = false,
}) => {
  const src = light
    ? staticFile("icons/intralink-wordmark-light.svg")
    : wordmark
    ? staticFile("icons/intralink-wordmark.svg")
    : staticFile("icons/intralink-icon.svg");
  return <Img src={src} style={{ height: size, width: "auto" }} />;
};

/* ───────── Scene Entrance Wrapper ───────── */
const SceneEntrance: React.FC<{
  children: React.ReactNode;
  direction?: "left" | "right" | "bottom" | "top" | "scale" | "fade";
  duration?: number;
}> = ({ children, direction = "fade", duration = 18 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eased = 1 - Math.pow(1 - t, 3);
  const W = 1920;
  const H = 1080;

  let transform = "";
  if (direction === "left") transform = `translateX(${(1 - eased) * -W}px)`;
  if (direction === "right") transform = `translateX(${(1 - eased) * W}px)`;
  if (direction === "bottom") transform = `translateY(${(1 - eased) * H}px)`;
  if (direction === "top") transform = `translateY(${(1 - eased) * -H}px)`;
  if (direction === "scale") {
    const s = 0.6 + eased * 0.4;
    transform = `scale(${s})`;
  }
  if (direction === "fade") {
    return (
      <div style={{ position: "absolute", inset: 0, opacity: eased, willChange: "opacity" }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, transform, willChange: "transform" }}>
      {children}
    </div>
  );
};

/* ───────── Background Components ───────── */
const BgLight: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${C.white} 0%, ${C.offWhite} 100%)` }} />
);

const BgDark: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${C.navy} 0%, #0d2d4a 100%)` }} />
      <div style={{
        position: "absolute",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.blue}15 0%, transparent 70%)`,
        left: "30%",
        top: "40%",
        transform: "translate(-50%, -50%)",
        filter: "blur(40px)",
        opacity: 0.6 + Math.sin(f * 0.02) * 0.1,
      }} />
    </>
  );
};

/* ───────── Layout: Orb in background, Content centered on top ───────── */
const OrbContentLayout: React.FC<{
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  light?: boolean;
  titleDelay?: number;
  audioAmplitude?: number;
}> = ({ children, title, subtitle, light = false, titleDelay = 0, audioAmplitude = 0 }) => {
  const f = useCurrentFrame();
  const titleOp = interpolate(f, [titleDelay, titleDelay + 15], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(f, [titleDelay, titleDelay + 15], [30, 0], { extrapolateRight: "clamp" });

  const textColor = light ? C.navy : C.white;
  const subColor = light ? C.slate : C.teal;

  return (
    <AbsoluteFill style={{
      fontFamily: FONT,
      justifyContent: "center",
      alignItems: "center",
    }}>
      {light ? <BgLight /> : <BgDark />}

      {/* Large orb in background - reacts to audio */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 0.5,
        zIndex: 0,
      }}>
        <TalkingOrb size={900} speaking={true} light={light} audioAmplitude={audioAmplitude} />
      </div>

      {/* Content - Centered on top */}
      <div style={{
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        maxWidth: 900,
        padding: "0 60px",
      }}>
        {subtitle && (
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: subColor,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 12,
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
          }}>
            {subtitle}
          </div>
        )}
        <div style={{
          fontSize: 40,
          fontWeight: 800,
          color: textColor,
          lineHeight: 1.2,
          letterSpacing: -0.5,
          marginBottom: 24,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}>
          {title}
        </div>
        <div style={{
          opacity: interpolate(f, [titleDelay + 10, titleDelay + 25], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute",
        bottom: 30,
        left: 30,
        opacity: 0.5,
      }}>
        <LogoIntra size={18} wordmark light={!light} />
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 0 — Title (0–8s)
   ═══════════════════════════════════════ */
const TitleScene: React.FC = () => {
  const f = useCurrentFrame();
  const logoSc = spring({ frame: f, fps: 30, config: { damping: 14, stiffness: 60, mass: 1 } });
  const logoOp = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(f, [18, 38], [0, 320], { extrapolateRight: "clamp" });
  const subOp = interpolate(f, [30, 50], [0, 1], { extrapolateRight: "clamp" });
  const badgeOp = interpolate(f, [45, 65], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneEntrance direction="scale">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 28, fontFamily: FONT }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${C.white} 0%, ${C.offWhite} 100%)` }} />
        <div style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.blue}15 0%, transparent 70%)`,
          left: -200,
          top: -150,
          filter: "blur(80px)",
          opacity: 0.6 + Math.sin(f * 0.02) * 0.1,
        }} />
        <div style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.teal}10 0%, transparent 70%)`,
          right: -150,
          bottom: -100,
          filter: "blur(80px)",
          opacity: 0.5 + Math.cos(f * 0.02) * 0.1,
        }} />

        <div style={{ transform: `scale(${logoSc})`, opacity: logoOp, position: "relative", zIndex: 1 }}>
          <LogoIntra size={180} wordmark={true} />
        </div>

        <div style={{ width: lineW, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${C.blue}, ${C.teal})`, position: "relative", zIndex: 1 }} />

        <div style={{ opacity: subOp, fontSize: 28, color: C.slate, fontWeight: 500, textAlign: "center", position: "relative", zIndex: 1 }}>
          Institutional Intelligence Platform
        </div>

        <div style={{ opacity: badgeOp, display: "flex", gap: 14, position: "relative", zIndex: 1, marginTop: 12 }}>
          <div style={{ backgroundColor: C.navy, color: C.white, padding: "10px 28px", borderRadius: 10, fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", boxShadow: "0 8px 24px rgba(10,37,64,0.25)" }}>Project NAGA</div>
        </div>

        <div style={{ position: "absolute", bottom: 36, right: 48, opacity: 0.4 }}>
          <LogoIntra size={16} wordmark={false} />
        </div>
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 1 — The Opportunity (8–22s)
   ═══════════════════════════════════════ */
const OpportunityScene: React.FC<{ audioAmplitude?: number }> = ({ audioAmplitude = 0 }) => {
  const f = useCurrentFrame();
  const items = [
    "Thousands of client engagements across Asia, Europe, and North America",
    "Deep stakeholder relationships in Japan, Korea, China, and beyond",
    "Proven outcomes across semiconductors, robotics, manufacturing",
    "35+ years of accumulated experience",
  ];

  return (
    <SceneEntrance direction="fade">
      <OrbContentLayout title="35+ Years of Experience" subtitle="The Opportunity" light={false} audioAmplitude={audioAmplitude}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {items.map((item, i) => {
            const delay = 20 + i * 10;
            const op = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
            const x = interpolate(f, [delay, delay + 12], [30, 0], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                opacity: op,
                transform: `translateX(${x}px)`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: C.teal, marginTop: 8, flexShrink: 0 }} />
                <div style={{ fontSize: 18, color: C.white, opacity: 0.9, lineHeight: 1.5 }}>{item}</div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 28,
          padding: "20px 24px",
          background: `linear-gradient(135deg, ${C.blue}50, ${C.teal}40)`,
          borderRadius: 14,
          border: `1px solid ${C.teal}50`,
          opacity: interpolate(f, [70, 85], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          <div style={{ fontSize: 18, color: C.white, fontWeight: 600, lineHeight: 1.5 }}>
            The problem? Almost none of it is accessible.
          </div>
        </div>
      </OrbContentLayout>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 2 — What NAGA Is (22–38s)
   ═══════════════════════════════════════ */
const WhatIsScene: React.FC<{ audioAmplitude?: number }> = ({ audioAmplitude = 0 }) => {
  const f = useCurrentFrame();
  const points = [
    { not: "NOT a chatbot", is: "An intelligence layer" },
    { not: "NOT a search tool", is: "A knowledge synthesizer" },
    { not: "NOT another app", is: "Cross-platform integration" },
  ];

  return (
    <SceneEntrance direction="fade">
      <OrbContentLayout title="What I Am" subtitle="Intelligence Layer" light={true} audioAmplitude={audioAmplitude}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          {points.map((point, i) => {
            const delay = 15 + i * 15;
            const op = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
            const y = interpolate(f, [delay, delay + 12], [15, 0], { extrapolateRight: "clamp" });

            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: op,
                transform: `translateY(${y}px)`,
              }}>
                <div style={{ fontSize: 16, color: C.slate, textDecoration: "line-through", textDecorationColor: C.blue, textDecorationThickness: 2, opacity: 0.6 }}>
                  {point.not}
                </div>
                <div style={{ color: C.blue, fontSize: 20 }}>→</div>
                <div style={{ fontSize: 20, color: C.navy, fontWeight: 600 }}>{point.is}</div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 28,
          padding: "20px 24px",
          background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`,
          borderRadius: 14,
          opacity: interpolate(f, [70, 85], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          <div style={{ fontSize: 17, color: C.white, lineHeight: 1.5, textAlign: "center" }}>
            I sit across Salesforce, Microsoft 365, Teams, SharePoint, emails, and meetings — turning fragmented information into actionable knowledge.
          </div>
        </div>
      </OrbContentLayout>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 3 — Six Domains
   ═══════════════════════════════════════ */
const DomainsScene: React.FC<{ audioAmplitude?: number }> = ({ audioAmplitude = 0 }) => {
  const f = useCurrentFrame();
  const domains = [
    { num: "01", name: "Communication Intelligence", desc: "Meetings, emails, Teams → structured records" },
    { num: "02", name: "Opportunity Intelligence", desc: "Health scores, risk flags, recommendations" },
    { num: "03", name: "Client Intelligence", desc: "Complete client history & relationships" },
    { num: "04", name: "Employee Intelligence", desc: "Expertise discovery across the company" },
    { num: "05", name: "Market Entry Intelligence", desc: "35+ years of expansion experience" },
    { num: "06", name: "Outcome Intelligence", desc: "Learns from every deal & project" },
  ];

  return (
    <SceneEntrance direction="fade">
      <AbsoluteFill style={{
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <BgDark />

        {/* Large orb in background */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.5,
          zIndex: 0,
        }}>
          <TalkingOrb size={900} speaking={true} audioAmplitude={audioAmplitude} />
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 1000 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: C.teal,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 12,
            opacity: interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            Six Intelligence Domains
          </div>
          <div style={{
            fontSize: 36,
            fontWeight: 800,
            color: C.white,
            marginBottom: 28,
            opacity: interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            Every capability. One platform.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {domains.map((d, i) => {
              const delay = 15 + i * 10;
              const op = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
              const y = interpolate(f, [delay, delay + 12], [20, 0], { extrapolateRight: "clamp" });

              return (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  padding: "16px 18px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  opacity: op,
                  transform: `translateY(${y}px)`,
                  textAlign: "left",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 6, opacity: 0.7 }}>{d.num}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 4 }}>{d.name}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{d.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 30, left: 30, opacity: 0.5 }}>
          <LogoIntra size={18} wordmark light />
        </div>
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 5 — Competitive Advantage (85–105s)
   ═══════════════════════════════════════ */
const AdvantageScene: React.FC<{ audioAmplitude?: number }> = ({ audioAmplitude = 0 }) => {
  const f = useCurrentFrame();
  const questions = [
    "Which approaches worked for Japanese semiconductor companies entering Europe?",
    "Which stakeholders influence robotics expansion decisions?",
    "Which partnership models produced the strongest outcomes?",
  ];

  return (
    <SceneEntrance direction="fade">
      <OrbContentLayout title="Your Competitive Advantage" subtitle="No competitor has this" light={true} audioAmplitude={audioAmplitude}>
        <div style={{ fontSize: 18, color: C.navy, opacity: 0.9, marginBottom: 24, lineHeight: 1.6 }}>
          Every competitor has access to industry reports and general AI tools.
          <br /><br />
          <span style={{ color: C.blue, fontWeight: 600 }}>No competitor has access to Intralink's 35+ years.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {questions.map((q, i) => {
            const delay = 30 + i * 12;
            const op = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
            const x = interpolate(f, [delay, delay + 12], [25, 0], { extrapolateRight: "clamp" });

            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                opacity: op,
                transform: `translateX(${x}px)`,
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.white,
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 16, color: C.navy, lineHeight: 1.5 }}>{q}</div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 24,
          fontSize: 16,
          color: C.blue,
          fontWeight: 600,
          opacity: interpolate(f, [80, 95], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          This knowledge cannot be purchased. It can only be accumulated.
        </div>
      </OrbContentLayout>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 6 — Rollout Plan (105–130s)
   ═══════════════════════════════════════ */
const RolloutScene: React.FC<{ audioAmplitude?: number }> = ({ audioAmplitude = 0 }) => {
  const f = useCurrentFrame();
  const phases = [
    { num: "01", name: "Communication Intelligence", desc: "Eliminate manual administration" },
    { num: "02", name: "Opportunity Intelligence", desc: "Improve win rates & forecasting" },
    { num: "03", name: "Employee & Client Intel", desc: "Scale organisational knowledge" },
    { num: "04", name: "Market Entry & Outcome", desc: "Convert history to intelligence" },
    { num: "05", name: "Enterprise Platform", desc: "Full institutional memory" },
  ];

  const progressW = interpolate(f, [30, 120], [0, 100], { extrapolateRight: "clamp" });

  return (
    <SceneEntrance direction="fade">
      <OrbContentLayout title="Rollout Plan" subtitle="Five phases" light={false} audioAmplitude={audioAmplitude}>
        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", marginBottom: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressW}%`, borderRadius: 2, background: `linear-gradient(90deg, ${C.blue}, ${C.teal})` }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {phases.map((p, i) => {
            const delay = 20 + i * 12;
            const op = interpolate(f, [delay, delay + 10], [0, 1], { extrapolateRight: "clamp" });
            const y = interpolate(f, [delay, delay + 10], [15, 0], { extrapolateRight: "clamp" });

            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: op,
                transform: `translateY(${y}px)`,
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.white,
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {p.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.white }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>{p.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </OrbContentLayout>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 7 — Expected Returns (130–155s)
   ═══════════════════════════════════════ */
const ReturnsScene: React.FC<{ audioAmplitude?: number }> = ({ audioAmplitude = 0 }) => {
  const f = useCurrentFrame();
  const buckets = [
    { title: "OPERATIONAL", items: ["Less admin work", "Faster onboarding", "Reduced key-person risk"], color: C.blue },
    { title: "COMMERCIAL", items: ["Higher win rates", "Faster proposals", "Stronger client context"], color: C.teal },
    { title: "STRATEGIC", items: ["Permanent knowledge", "Compounding advantage", "Scalable expertise"], color: "#00c9a7" },
  ];

  return (
    <SceneEntrance direction="fade">
      <OrbContentLayout title="Expected Returns" subtitle="Three impact areas" light={true} audioAmplitude={audioAmplitude}>
        <div style={{ display: "flex", gap: 16 }}>
          {buckets.map((b, i) => {
            const delay = 15 + i * 18;
            const op = interpolate(f, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });
            const y = interpolate(f, [delay, delay + 15], [30, 0], { extrapolateRight: "clamp" });

            return (
              <div key={i} style={{
                flex: 1,
                background: `linear-gradient(135deg, ${b.color}15, ${b.color}08)`,
                borderRadius: 14,
                padding: 20,
                border: `1px solid ${b.color}30`,
                opacity: op,
                transform: `translateY(${y}px)`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: b.color, letterSpacing: 2, marginBottom: 14, opacity: 0.9 }}>
                  {b.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {b.items.map((item, j) => (
                    <div key={j} style={{ fontSize: 15, color: C.navy }}>• {item}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </OrbContentLayout>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 8 — Risks (155–175s)
   ═══════════════════════════════════════ */
const RisksScene: React.FC<{ audioAmplitude?: number }> = ({ audioAmplitude = 0 }) => {
  const f = useCurrentFrame();
  const risks = [
    { risk: "Data quality", mitigation: "Phase 1 establishes clean capture" },
    { risk: "Adoption", mitigation: "Passive capture — no behaviour change" },
    { risk: "Data sensitivity", mitigation: "RBAC + existing Salesforce permissions" },
    { risk: "AI accuracy", mitigation: "Draft outputs — no auto-commits" },
  ];

  return (
    <SceneEntrance direction="fade">
      <OrbContentLayout title="Risks & Mitigations" subtitle="Addressing concerns" light={false} audioAmplitude={audioAmplitude}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {risks.map((r, i) => {
            const delay = 15 + i * 10;
            const op = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
            const y = interpolate(f, [delay, delay + 12], [15, 0], { extrapolateRight: "clamp" });

            return (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 18,
                opacity: op,
                transform: `translateY(${y}px)`,
              }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.white, marginBottom: 8 }}>{r.risk}</div>
                <div style={{ fontSize: 14, color: C.teal, lineHeight: 1.5 }}>{r.mitigation}</div>
              </div>
            );
          })}
        </div>
      </OrbContentLayout>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 9 — Closing (175–195s)
   ═══════════════════════════════════════ */
const ClosingScene: React.FC<{ audioAmplitude?: number }> = ({ audioAmplitude = 0 }) => {
  const f = useCurrentFrame();
  const textOp = interpolate(f, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(f, [45, 65], [0, 1], { extrapolateRight: "clamp" });
  const ctaOp = interpolate(f, [65, 85], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneEntrance direction="fade">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
        <BgDark />

        {/* Large orb in background */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.5,
          zIndex: 0,
        }}>
          <TalkingOrb size={900} speaking={true} audioAmplitude={audioAmplitude} />
        </div>

        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 42, fontWeight: 700, color: C.white, marginBottom: 14, opacity: textOp, lineHeight: 1.3 }}>
            35+ years of experience.
            <br />
            <span style={{ color: C.teal }}>Now accessible to everyone.</span>
          </div>

          <div style={{ fontSize: 20, color: C.white, opacity: subOp * 0.85, maxWidth: 550, lineHeight: 1.5, margin: "0 auto" }}>
            NAGA converts that asset into intelligence — making every future engagement faster, sharper, and more successful.
          </div>

          <div style={{
            marginTop: 28,
            display: "inline-block",
            background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`,
            color: C.white,
            padding: "14px 36px",
            borderRadius: 10,
            fontSize: 17,
            fontWeight: 700,
            opacity: ctaOp,
            boxShadow: "0 10px 30px rgba(0,148,215,0.3)",
          }}>
            Ready to learn more?
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 30, opacity: interpolate(f, [80, 100], [0, 0.5], { extrapolateRight: "clamp" }) }}>
          <LogoIntra size={18} wordmark light />
        </div>
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   MAIN COMPOSITION
   ═══════════════════════════════════════ */
export const NagaDemoVideo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get audio data for visualization
  const audioData = useAudioData(staticFile("audio/naga_full_narration.wav"));

  // Calculate current audio amplitude (0-1) at the current frame
  // Use a wider window and multiple samples to get better energy representation
  const currentTimeInSeconds = f / fps;
  const waveformBars = audioData
    ? getWaveformPortion({
        audioData,
        startTimeInSeconds: Math.max(0, currentTimeInSeconds - 0.1),
        durationInSeconds: 0.2, // 200ms window
        numberOfSamples: 10, // Get 10 samples in the window
        channel: 0,
        normalize: true,
      })
    : [];

  // Take the maximum amplitude from the samples to capture peaks
  const maxAmplitude = waveformBars.length > 0
    ? Math.max(...waveformBars.map(bar => bar.amplitude))
    : 0;

  // Smooth the amplitude to avoid jarring transitions
  const audioAmplitude = Math.min(maxAmplitude * 1.5, 1); // Boost slightly and cap at 1

  // Scene timings based on audio durations (fps: 30)
  // TitleScene: 8 seconds (no audio intro)
  // ChatDemoScene removed
  // Total video: ~6.1 minutes
  const scenes = [
    { from: 0, dur: 240, comp: TitleScene },            // 0-8s: Title (no audio)
    { from: 240, dur: 1318, comp: OpportunityScene },    // 8-52s: intro audio (43.9s)
    { from: 1558, dur: 1073, comp: WhatIsScene },        // 52-88s: what_is audio (35.8s)
    { from: 2631, dur: 1923, comp: DomainsScene },      // 88-152s: domains audio (64.1s)
    { from: 4554, dur: 1196, comp: AdvantageScene },     // 152-192s: advantage audio (39.8s)
    { from: 5750, dur: 1752, comp: RolloutScene },       // 192-250s: rollout audio (58.4s)
    { from: 7502, dur: 1373, comp: ReturnsScene },       // 250-296s: returns audio (45.8s)
    { from: 8875, dur: 1232, comp: RisksScene },        // 296-337s: risks audio (41.0s)
    { from: 10107, dur: 874, comp: ClosingScene },      // 337-366s: closing audio (29.1s)
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.navy, fontFamily: FONT, overflow: "hidden" }}>
      {scenes.map((s, i) => {
        const Scene = s.comp;
        return (
          <Sequence key={i} from={s.from} durationInFrames={s.dur}>
            <Scene audioAmplitude={audioAmplitude} />
          </Sequence>
        );
      })}
      {/* Single merged audio track */}
      <Audio src={staticFile("audio/naga_full_narration.wav")} />
    </AbsoluteFill>
  );
};