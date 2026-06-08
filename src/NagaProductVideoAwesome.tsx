import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Img,
  staticFile,
} from "remotion";

/* ───────── Brand Tokens ───────── */
const C = {
  navy: "#0a2540",
  blue: "#0094d7",
  teal: "#28b9d0",
  white: "#ffffff",
  offWhite: "#f8fafc",
  lightGray: "#eef2f6",
  charcoal: "#1d1d1b",
  slate: "#475569",
  glass: "rgba(255,255,255,0.08)",
};

const FONT = "'Sofia Pro', sans-serif";
const TRANSITION = 20; // frames for enter/exit

/* ───────── Animation Hooks ───────── */
const useFade = (delay: number, dur = 15) => {
  const f = useCurrentFrame();
  return interpolate(f - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const useSlideY = (delay: number, dist = 50) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - delay, fps: 30, config: { damping: 14, stiffness: 90, mass: 1 } });
  return interpolate(p, [0, 1], [dist, 0]);
};

const useSlideX = (delay: number, dist = 60) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - delay, fps: 30, config: { damping: 14, stiffness: 90, mass: 1 } });
  return interpolate(p, [0, 1], [dist, 0]);
};

const useScale = (delay: number) => {
  const f = useCurrentFrame();
  return spring({ frame: f - delay, fps: 30, config: { damping: 12, stiffness: 80, mass: 1 } });
};

/* enter/exit for a scene of given duration */
const useSceneMotion = (duration: number) => {
  const f = useCurrentFrame();
  const enter = spring({ frame: f, fps: 30, config: { damping: 12, stiffness: 70, mass: 1 } });
  const exitStart = duration - TRANSITION;
  const exitRaw = interpolate(f, [exitStart, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(exitRaw, [0, 1], [1, 0]);
  const exitX = interpolate(exitRaw, [0, 1], [0, -80]);
  return { enter, exit, exitX, isExiting: f > exitStart };
};

/* ───────── Shared Components ───────── */
const LogoIntra: React.FC<{ size?: number; wordmark?: boolean }> = ({ size = 48, wordmark = false }) => {
  const src = wordmark ? staticFile("icons/intralink-wordmark.svg") : staticFile("icons/intralink-icon.svg");
  return <Img src={src} style={{ height: size, width: "auto" }} />;
};

const Footer: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <div style={{ position: "absolute", bottom: 28, right: 40, display: "flex", alignItems: "center", gap: 10, opacity: 0.45 }}>
    <LogoIntra size={18} wordmark={false} />
    <span style={{ fontSize: 12, fontWeight: 600, color: dark ? C.white : C.slate, letterSpacing: 1, textTransform: "uppercase" }}>Intralink</span>
  </div>
);

const SectionPill: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14, opacity: useFade(delay, 12) }}>
    <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.blue }} />
    <span style={{ fontSize: 14, fontWeight: 700, color: C.blue, letterSpacing: 2, textTransform: "uppercase" }}>{text}</span>
  </div>
);

/* ───────── Ambient Background ───────── */
const AmbientBg: React.FC = () => {
  const f = useCurrentFrame();
  const orbs = [
    { cx: 200, cy: 200, r: 300, color: C.blue, speed: 0.3 },
    { cx: 1600, cy: 800, r: 350, color: C.teal, speed: 0.2 },
    { cx: 900, cy: 600, r: 250, color: C.navy, speed: 0.4 },
    { cx: 400, cy: 900, r: 280, color: C.blue, speed: 0.25 },
  ];
  return (
    <AbsoluteFill style={{ zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${C.offWhite}, ${C.white})` }} />
      {orbs.map((o, i) => {
        const ox = Math.sin(f * 0.01 * o.speed + i * 2) * 40;
        const oy = Math.cos(f * 0.012 * o.speed + i * 2) * 30;
        const pulse = interpolate(f % 120, [0, 60, 120], [0.03, 0.06, 0.03], { extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: o.cx + ox - o.r,
              top: o.cy + oy - o.r,
              width: o.r * 2,
              height: o.r * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${o.color}${Math.round(pulse * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
              filter: "blur(60px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────── Transition Overlay ───────── */
const TransitionBar: React.FC<{ color?: string }> = ({ color = C.blue }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [0, TRANSITION], [0, 1920], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: w,
        height: 4,
        background: `linear-gradient(90deg, ${color}, ${C.teal})`,
        zIndex: 100,
        boxShadow: `0 0 20px ${color}60`,
      }}
    />
  );
};

/* ───────── Scene Wrapper with Enter/Exit ───────── */
const SceneWrap: React.FC<{ children: React.ReactNode; duration: number; from: "left" | "right" | "bottom" | "top" | "scale"; dark?: boolean }> = ({
  children,
  duration,
  from,
  dark = false,
}) => {
  const { enter, exit, exitX } = useSceneMotion(duration);
  let x = 0, y = 0, s = 1;
  if (from === "left") x = interpolate(enter, [0, 1], [-120, 0]);
  if (from === "right") x = interpolate(enter, [0, 1], [120, 0]);
  if (from === "bottom") y = interpolate(enter, [0, 1], [80, 0]);
  if (from === "top") y = interpolate(enter, [0, 1], [-80, 0]);
  if (from === "scale") s = interpolate(enter, [0, 1], [0.85, 1]);
  const opacity = interpolate(enter, [0, 0.6], [0, 1]) * exit;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <AmbientBg />
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", transform: `translate3d(${x + exitX}px, ${y}px, 0) scale(${s})`, opacity }}>
        {children}
      </div>
      <TransitionBar color={dark ? C.teal : C.blue} />
      <Footer dark={dark} />
    </AbsoluteFill>
  );
};

/* ───────── Icons ───────── */
const IconGlobe = ({ s = 20, c = C.teal }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const IconUsers = ({ s = 20, c = C.teal }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconChart = ({ s = 20, c = C.teal }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
);
const IconTrophy = ({ s = 20, c = C.teal }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
);
const IconMessage = ({ s = 20, c = C.blue }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const IconDatabase = ({ s = 20, c = C.blue }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
);
const IconSearch = ({ s = 20, c = C.blue }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const IconUserCheck = ({ s = 20, c = C.blue }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
);
const IconBrain = ({ s = 20, c = C.blue }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);
const IconFileText = ({ s = 20, c = C.blue }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
);
const IconMic = ({ s = 20, c = C.white }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const IconTarget = ({ s = 20, c = C.white }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const IconBriefcase = ({ s = 20, c = C.white }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);
const IconTeam = ({ s = 20, c = C.white }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconMap = ({ s = 20, c = C.white }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
);
const IconAward = ({ s = 20, c = C.white }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);
const IconSettings = ({ s = 20, c = C.white }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconTrending = ({ s = 20, c = C.white }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
const IconChess = ({ s = 20, c = C.white }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M8 22l4-10 4 10"/><path d="M12 12V8a2 2 0 0 1 4 0v4"/><path d="M12 8V4a2 2 0 0 0-4 0v4"/><circle cx="12" cy="2" r="1"/><path d="M4 22h16"/></svg>
);
const IconLock = ({ s = 20, c = C.navy }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const IconSparkles = ({ s = 20, c = C.navy }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

/* ═══════════════════════════════════════
   SCENE 0 — Title Card
   ═══════════════════════════════════════ */
const TitleScene: React.FC = () => {
  const f = useCurrentFrame();
  const s = spring({ frame: f, fps: 30, config: { damping: 12, stiffness: 80 } });
  const op = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(f, [25, 50], [0, 1], { extrapolateRight: "clamp" });
  const badgeOp = interpolate(f, [45, 70], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 28, fontFamily: FONT }}>
      <div style={{ transform: `scale(${s})`, opacity: op }}>
        <LogoIntra size={160} wordmark={true} />
      </div>
      <div style={{ opacity: subOp, fontSize: 24, color: C.slate, fontWeight: 500, textAlign: "center", maxWidth: 900, lineHeight: 1.5 }}>
        Institutional Intelligence Platform &nbsp;|&nbsp; Product Overview
      </div>
      <div style={{ opacity: badgeOp, display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
        <div style={{ backgroundColor: C.navy, color: C.white, padding: "10px 24px", borderRadius: 10, fontSize: 16, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", boxShadow: "0 8px 24px rgba(10,37,64,0.25)" }}>Project NAGA</div>
        <div style={{ backgroundColor: C.lightGray, color: C.slate, padding: "10px 24px", borderRadius: 10, fontSize: 15, fontWeight: 600 }}>June 2025 &nbsp;|&nbsp; Confidential</div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 1 — The Opportunity
   ═══════════════════════════════════════ */
const OpportunityScene: React.FC = () => {
  const bullets = [
    { text: "Thousands of client engagements across Asia, Europe, and North America", icon: IconGlobe },
    { text: "Deep relationships with stakeholders in Japan, Korea, China, and beyond", icon: IconUsers },
    { text: "Proven outcomes across semiconductors, robotics, manufacturing, and government", icon: IconChart },
    { text: "A track record no competitor can replicate", icon: IconTrophy },
  ];

  return (
    <AbsoluteFill style={{ padding: "80px 100px", fontFamily: FONT, justifyContent: "center" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <SectionPill text="The Opportunity" />
        <div style={{ fontSize: 44, fontWeight: 700, color: C.navy, marginBottom: 28, opacity: useFade(6, 18), transform: `translateY(${useSlideY(6, 25)}px)` }}>
          13 years of accumulated experience
        </div>

        <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            {bullets.map((b, i) => {
              const op = useFade(18 + i * 10, 14);
              const y = useSlideY(18 + i * 10, 20);
              const sc = spring({ frame: useCurrentFrame() - (18 + i * 10), fps: 30, config: { damping: 10, stiffness: 120 } });
              const Icon = b.icon;
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, opacity: op, transform: `translateY(${y}px)` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${C.teal}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, transform: `scale(${sc})` }}>
                    <Icon s={22} c={C.teal} />
                  </div>
                  <span style={{ fontSize: 22, color: C.charcoal, lineHeight: 1.5 }}>{b.text}</span>
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1, background: `linear-gradient(145deg, ${C.navy} 0%, ${C.blue} 100%)`, borderRadius: 24, padding: 44, opacity: useFade(55, 18), transform: `translateX(${useSlideX(55, 40)}px)`, boxShadow: "0 20px 50px rgba(10,37,64,0.25)" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.white, marginBottom: 16, lineHeight: 1.3 }}>The problem is that almost none of it is accessible.</div>
            <div style={{ fontSize: 18, color: C.white, opacity: 0.85, lineHeight: 1.6 }}>It lives in incomplete Salesforce records, emails no one searches, and meetings no one transcribed. As Intralink grows, this becomes a structural risk — and a structural opportunity.</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 2 — What NAGA Is
   ═══════════════════════════════════════ */
const WhatIsScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ padding: "80px 100px", fontFamily: FONT, justifyContent: "center" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <SectionPill text="What NAGA Is" delay={0} />
        <div style={{ fontSize: 48, fontWeight: 700, color: C.navy, marginBottom: 36, opacity: useFade(6, 18), transform: `translateY(${useSlideY(6, 25)}px)` }}>Intralink&apos;s institutional intelligence platform</div>

        <div style={{ display: "flex", gap: 30, marginBottom: 44 }}>
          {[
            { label: "Not a chatbot", delay: 20, icon: IconMessage },
            { label: "Not a search tool", delay: 30, icon: IconSearch },
            { label: "The intelligence layer", delay: 40, icon: IconBrain },
          ].map((item, i) => {
            const op = useFade(item.delay, 14);
            const y = useSlideY(item.delay, 20);
            const isLast = i === 2;
            const Icon = item.icon;
            return (
              <div key={i} style={{ flex: 1, backgroundColor: isLast ? C.navy : C.lightGray, borderRadius: 20, padding: "32px 28px", opacity: op, transform: `translateY(${y}px)`, boxShadow: isLast ? "0 16px 48px rgba(10,37,64,0.2)" : "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: isLast ? "rgba(255,255,255,0.1)" : `${C.blue}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon s={24} c={isLast ? C.white : C.blue} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: isLast ? 0.7 : 0.5, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", color: isLast ? C.white : C.slate }}>{isLast ? "What it is" : "What it is not"}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: isLast ? C.white : C.charcoal }}>{item.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{ background: `linear-gradient(145deg, ${C.blue} 0%, ${C.teal} 100%)`, borderRadius: 20, padding: 40, opacity: useFade(55, 16), transform: `scale(${useScale(55)})`, boxShadow: "0 16px 48px rgba(0,148,215,0.2)" }}>
          <div style={{ fontSize: 22, color: C.white, fontWeight: 500, lineHeight: 1.6, textAlign: "center" }}>The goal: every employee, on any engagement, immediately has access to what Intralink already knows.</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 3 — What It Solves
   ═══════════════════════════════════════ */
const SolvesScene: React.FC = () => {
  const items = [
    { problem: "Meeting outcomes not captured", solution: "Auto summaries & Salesforce sync", icon: IconMessage },
    { problem: "CRM data depends on discipline", solution: "Automated updates from every call", icon: IconDatabase },
    { problem: "Research already done before", solution: "Historical pattern matching", icon: IconSearch },
    { problem: "Expertise hard to find", solution: "Expert & relationship discovery", icon: IconUserCheck },
    { problem: "Knowledge leaves with employees", solution: "Permanent institutional record", icon: IconBrain },
    { problem: "Proposals take too long", solution: "Precedents surfaced instantly", icon: IconFileText },
  ];

  return (
    <AbsoluteFill style={{ padding: "70px 90px", fontFamily: FONT, justifyContent: "center" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%" }}>
        <SectionPill text="What It Solves" delay={0} />
        <div style={{ fontSize: 42, fontWeight: 700, color: C.navy, marginBottom: 44, opacity: useFade(6, 16), transform: `translateY(${useSlideY(6, 20)}px)` }}>Six problems. One platform.</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
          {items.map((item, i) => {
            const op = useFade(16 + i * 8, 14);
            const y = useSlideY(16 + i * 8, 20);
            const sc = spring({ frame: useCurrentFrame() - (16 + i * 8), fps: 30, config: { damping: 10, stiffness: 120 } });
            const Icon = item.icon;
            return (
              <div key={i} style={{ backgroundColor: C.white, borderRadius: 18, padding: 30, opacity: op, transform: `translateY(${y}px)`, boxShadow: "0 6px 24px rgba(10,37,64,0.06)", borderLeft: `4px solid ${C.teal}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: `${C.blue}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, transform: `scale(${sc})` }}>
                  <Icon s={24} c={C.blue} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.slate, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Problem</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: C.navy, marginBottom: 14, lineHeight: 1.3 }}>{item.problem}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>What NAGA Delivers</div>
                <div style={{ fontSize: 16, color: C.charcoal, lineHeight: 1.5 }}>{item.solution}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 4 — Six Intelligence Domains
   ═══════════════════════════════════════ */
const DomainsScene: React.FC = () => {
  const domains = [
    { title: "Communication Intelligence", desc: "Meetings, emails, Teams → structured records, actions, Salesforce updates", delay: 0, icon: IconMic },
    { title: "Opportunity Intelligence", desc: "Health scores, risk flags, next-best-action, similar historical deals", delay: 10, icon: IconTarget },
    { title: "Client Intelligence", desc: "Complete client view — history, relationships, activity, strategic context", delay: 20, icon: IconBriefcase },
    { title: "Employee Intelligence", desc: "Expertise discovery — who has done what, where, with whom", delay: 30, icon: IconTeam },
    { title: "Market Entry Intelligence", desc: "13 years of experience searchable by region, sector, and outcome", delay: 40, icon: IconMap },
    { title: "Outcome Intelligence", desc: "Learns from every won deal, lost opportunity, and completed project", delay: 50, icon: IconAward },
  ];

  return (
    <AbsoluteFill style={{ padding: "70px 90px", fontFamily: FONT, justifyContent: "center" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%" }}>
        <SectionPill text="Six Intelligence Domains" delay={0} />
        <div style={{ fontSize: 42, fontWeight: 700, color: C.navy, marginBottom: 44, opacity: useFade(6, 16), transform: `translateY(${useSlideY(6, 20)}px)` }}>Every capability. One architecture.</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
          {domains.map((d, i) => {
            const op = useFade(d.delay + 14, 14);
            const y = useSlideY(d.delay + 14, 20);
            const sc = spring({ frame: useCurrentFrame() - (d.delay + 14), fps: 30, config: { damping: 10, stiffness: 120 } });
            const Icon = d.icon;
            return (
              <div key={i} style={{ background: `linear-gradient(145deg, ${C.blue} 0%, ${C.teal} 100%)`, borderRadius: 20, padding: 32, opacity: op, transform: `translateY(${y}px)`, boxShadow: "0 14px 40px rgba(0,148,215,0.18)", color: C.white }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, transform: `scale(${sc})` }}>
                  <Icon s={24} c={C.white} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Domain 0{i + 1}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>{d.title}</div>
                <div style={{ fontSize: 16, fontWeight: 400, opacity: 0.9, lineHeight: 1.5 }}>{d.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 5 — Competitive Advantage
   ═══════════════════════════════════════ */
const AdvantageScene: React.FC = () => {
  const points = [
    "Which approaches have worked for Japanese semiconductor companies entering Europe?",
    "Which stakeholders consistently influence robotics expansion decisions?",
    "Which partnership models have produced the strongest outcomes?",
  ];

  return (
    <AbsoluteFill style={{ padding: "80px 100px", fontFamily: FONT, justifyContent: "center" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <SectionPill text="Competitive Advantage" delay={0} />
        <div style={{ fontSize: 46, fontWeight: 700, color: C.navy, marginBottom: 24, opacity: useFade(6, 18), transform: `translateY(${useSlideY(6, 25)}px)`, lineHeight: 1.2 }}>No competitor has access to Intralink&apos;s 13 years of experience.</div>
        <div style={{ fontSize: 22, color: C.slate, marginBottom: 48, maxWidth: 800, lineHeight: 1.5, opacity: useFade(14, 14) }}>This is knowledge that cannot be purchased. It can only be accumulated over time — and Intralink has already accumulated it.</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {points.map((p, i) => {
            const op = useFade(30 + i * 12, 14);
            const x = useSlideX(30 + i * 12, 30);
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, opacity: op, transform: `translateX(${x}px)`, backgroundColor: `${C.blue}08`, borderRadius: 16, padding: "20px 24px" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: C.teal, marginTop: 8, flexShrink: 0 }} />
                <span style={{ fontSize: 22, color: C.navy, lineHeight: 1.5, maxWidth: 900 }}>{p}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 6 — Rollout Plan
   ═══════════════════════════════════════ */
const RolloutScene: React.FC = () => {
  const phases = [
    { num: "01", title: "Communication Intelligence", time: "Months 1–2", goal: "Eliminate manual administration", delay: 0 },
    { num: "02", title: "Opportunity Intelligence", time: "Months 3–4", goal: "Improve win rates and forecasting", delay: 10 },
    { num: "03", title: "Employee & Client Intelligence", time: "Months 5–6", goal: "Scale organisational knowledge", delay: 20 },
    { num: "04", title: "Market Entry & Outcome Intelligence", time: "Months 7–9", goal: "Convert history into business intelligence", delay: 30 },
    { num: "05", title: "Enterprise Intelligence Platform", time: "Months 10–12", goal: "Full institutional memory — live and learning", delay: 40 },
  ];

  return (
    <AbsoluteFill style={{ padding: "70px 90px", fontFamily: FONT, justifyContent: "center" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <SectionPill text="Rollout Plan" delay={0} />
        <div style={{ fontSize: 42, fontWeight: 700, color: C.navy, marginBottom: 44, opacity: useFade(6, 16), transform: `translateY(${useSlideY(6, 20)}px)` }}>Five phases. 12 months. Contained risk.</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {phases.map((p, i) => {
            const op = useFade(p.delay + 14, 14);
            const x = useSlideX(p.delay + 14, i % 2 === 0 ? -30 : 30);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, opacity: op, transform: `translateX(${x}px)` }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 18, fontWeight: 700, flexShrink: 0, boxShadow: "0 6px 16px rgba(0,148,215,0.25)" }}>{p.num}</div>
                <div style={{ flex: 1, backgroundColor: C.white, borderRadius: 16, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, boxShadow: "0 4px 16px rgba(10,37,64,0.06)" }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 15, color: C.slate }}>{p.goal}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.blue, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{p.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 14, opacity: useFade(70, 14) }}>
          <div style={{ width: 80, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${C.blue}, ${C.teal})` }} />
          <div style={{ fontSize: 18, color: C.blue, fontWeight: 600 }}>Phase 1 delivers measurable value within 60 days.</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 7 — Expected Returns
   ═══════════════════════════════════════ */
const ReturnsScene: React.FC = () => {
  const cards = [
    { label: "Operational", items: ["Material reduction in manual CRM work", "Faster onboarding from day one", "Reduced key-person dependency"], color: C.blue, delay: 0, icon: IconSettings },
    { label: "Commercial", items: ["Higher win rates through better intelligence", "Faster proposal development", "Stronger client engagement context"], color: C.teal, delay: 12, icon: IconTrending },
    { label: "Strategic", items: ["Permanent preservation of institutional knowledge", "Compounding advantage with every engagement", "Scalable expertise without proportional headcount"], color: C.navy, delay: 24, icon: IconChess },
  ];

  return (
    <AbsoluteFill style={{ padding: "70px 90px", fontFamily: FONT, justifyContent: "center" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%" }}>
        <SectionPill text="Expected Returns" delay={0} />
        <div style={{ fontSize: 42, fontWeight: 700, color: C.navy, marginBottom: 44, opacity: useFade(6, 16), transform: `translateY(${useSlideY(6, 20)}px)` }}>Operational, Commercial, Strategic.</div>

        <div style={{ display: "flex", gap: 24 }}>
          {cards.map((c, i) => {
            const op = useFade(c.delay + 16, 14);
            const y = useSlideY(c.delay + 16, 20);
            const sc = spring({ frame: useCurrentFrame() - (c.delay + 16), fps: 30, config: { damping: 10, stiffness: 100 } });
            const Icon = c.icon;
            return (
              <div key={i} style={{ flex: 1, backgroundColor: c.color, borderRadius: 22, padding: 36, opacity: op, transform: `translateY(${y}px)`, boxShadow: `0 16px 40px ${c.color}40`, color: C.white }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, transform: `scale(${sc})` }}>
                  <Icon s={26} c={C.white} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.75, letterSpacing: 1, textTransform: "uppercase", marginBottom: 18 }}>{c.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {c.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.white, marginTop: 8, flexShrink: 0, opacity: 0.8 }} />
                      <span style={{ fontSize: 17, lineHeight: 1.5, opacity: 0.95 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 8 — Risks & Mitigations
   ═══════════════════════════════════════ */
const RisksScene: React.FC = () => {
  const risks = [
    { risk: "Data quality of historical records", mitigation: "Phase 1 establishes clean capture; historical enrichment is incremental", icon: IconDatabase },
    { risk: "Employee adoption", mitigation: "Phase 1 starts with passive capture — no behaviour change required", icon: IconUsers },
    { risk: "Salesforce data sensitivity", mitigation: "Role-based access controls; NAGA respects existing permissions", icon: IconLock },
    { risk: "AI accuracy on sensitive outputs", mitigation: "All AI outputs surfaced as drafts — no automatic commits without review", icon: IconSparkles },
  ];

  return (
    <AbsoluteFill style={{ padding: "70px 90px", fontFamily: FONT, justifyContent: "center" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%" }}>
        <SectionPill text="Key Risks & Mitigations" delay={0} />
        <div style={{ fontSize: 42, fontWeight: 700, color: C.navy, marginBottom: 44, opacity: useFade(6, 16), transform: `translateY(${useSlideY(6, 20)}px)` }}>Known risks. Planned mitigations.</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22 }}>
          {risks.map((r, i) => {
            const op = useFade(16 + i * 10, 14);
            const y = useSlideY(16 + i * 10, 20);
            const sc = spring({ frame: useCurrentFrame() - (16 + i * 10), fps: 30, config: { damping: 10, stiffness: 120 } });
            const Icon = r.icon;
            return (
              <div key={i} style={{ backgroundColor: C.white, borderRadius: 18, padding: 30, opacity: op, transform: `translateY(${y}px)`, boxShadow: "0 6px 24px rgba(10,37,64,0.06)" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: `${C.blue}10`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, transform: `scale(${sc})` }}>
                  <Icon s={24} c={C.blue} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.slate, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Risk</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: C.navy, marginBottom: 14, lineHeight: 1.3 }}>{r.risk}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Mitigation</div>
                <div style={{ fontSize: 16, color: C.charcoal, lineHeight: 1.5 }}>{r.mitigation}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 9 — Closing
   ═══════════════════════════════════════ */
const ClosingScene: React.FC = () => {
  const f = useCurrentFrame();
  const s = spring({ frame: f, fps: 30, config: { damping: 12, stiffness: 80 } });
  const textOp = interpolate(f, [12, 28], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(f, [28, 44], [0, 1], { extrapolateRight: "clamp" });
  const btnScale = spring({ frame: f - 45, fps: 30, config: { damping: 8, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)`, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 32, fontFamily: FONT }}>
      <div style={{ transform: `scale(${s})` }}>
        <LogoIntra size={120} wordmark={true} />
      </div>

      <div style={{ fontSize: 46, fontWeight: 700, color: C.white, textAlign: "center", maxWidth: 1000, lineHeight: 1.2, opacity: textOp }}>
        Intralink&apos;s 13 years of experience is the company&apos;s most valuable and most underused asset.
      </div>

      <div style={{ fontSize: 24, color: C.white, textAlign: "center", maxWidth: 900, lineHeight: 1.5, opacity: subOp }}>
        NAGA is the mechanism for converting that asset into intelligence.
      </div>

      <div style={{ marginTop: 12, backgroundColor: C.white, color: C.navy, padding: "18px 48px", borderRadius: 14, fontSize: 22, fontWeight: 700, transform: `scale(${btnScale})`, boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}>
        The build is scoped. The rollout is phased. The risk is contained.
      </div>

      <div style={{ fontSize: 16, color: C.white, opacity: 0.6, marginTop: 8, letterSpacing: 1 }}>
        Project NAGA &nbsp;|&nbsp; Intralink &nbsp;|&nbsp; Confidential &nbsp;|&nbsp; June 2025
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   MAIN COMPOSITION
   ═══════════════════════════════════════ */
export const NagaProductVideoAwesome: React.FC = () => {
  const D = [
    { from: 0, dur: 90, fromDir: "scale" as const, dark: false },
    { from: 90, dur: 210, fromDir: "left" as const, dark: false },
    { from: 300, dur: 210, fromDir: "bottom" as const, dark: false },
    { from: 510, dur: 300, fromDir: "right" as const, dark: false },
    { from: 810, dur: 300, fromDir: "left" as const, dark: false },
    { from: 1110, dur: 210, fromDir: "scale" as const, dark: false },
    { from: 1320, dur: 300, fromDir: "bottom" as const, dark: false },
    { from: 1620, dur: 240, fromDir: "right" as const, dark: false },
    { from: 1860, dur: 240, fromDir: "left" as const, dark: false },
    { from: 2100, dur: 240, fromDir: "scale" as const, dark: true },
  ];

  const scenes = [
    TitleScene,
    OpportunityScene,
    WhatIsScene,
    SolvesScene,
    DomainsScene,
    AdvantageScene,
    RolloutScene,
    ReturnsScene,
    RisksScene,
    ClosingScene,
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.white, fontFamily: FONT, overflow: "hidden" }}>
      {D.map((d, i) => {
        const Scene = scenes[i];
        return (
          <Sequence key={i} from={d.from} durationInFrames={d.dur}>
            <SceneWrap duration={d.dur} from={d.fromDir} dark={d.dark}>
              <Scene />
            </SceneWrap>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
