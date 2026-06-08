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
  offWhite: "#f4f7fa",
  lightGray: "#eef2f6",
  charcoal: "#1d1d1b",
  slate: "#475569",
  glass: "rgba(255,255,255,0.06)",
};

const FONT = "'Sofia Pro', sans-serif";
const W = 1920;
const H = 1080;

/* ───────── Hooks ───────── */
const useFade = (delay: number, dur = 12) => {
  const f = useCurrentFrame();
  return interpolate(f - delay, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

const useSlideY = (delay: number, dist = 60) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - delay, fps: 30, config: { damping: 14, stiffness: 100, mass: 1 } });
  return interpolate(p, [0, 1], [dist, 0]);
};

const useSlideX = (delay: number, dist = 80) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - delay, fps: 30, config: { damping: 14, stiffness: 100, mass: 1 } });
  return interpolate(p, [0, 1], [dist, 0]);
};

const useScale = (delay: number, from = 0.8) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - delay, fps: 30, config: { damping: 12, stiffness: 90, mass: 1 } });
  return interpolate(p, [0, 1], [from, 1]);
};

/* ───────── Shared ───────── */
const LogoIntra: React.FC<{ size?: number; wordmark?: boolean; light?: boolean }> = ({ size = 48, wordmark = false, light = false }) => {
  const src = light
    ? staticFile("icons/intralink-wordmark-light.svg")
    : wordmark
    ? staticFile("icons/intralink-wordmark.svg")
    : staticFile("icons/intralink-icon.svg");
  return <Img src={src} style={{ height: size, width: "auto" }} />;
};

const FooterMark: React.FC<{ light?: boolean }> = ({ light = false }) => {
  const op = useFade(20, 20);
  return (
    <div style={{ position: "absolute", bottom: 36, right: 48, opacity: op * 0.4, display: "flex", alignItems: "center", gap: 10, zIndex: 10 }}>
      <LogoIntra size={16} wordmark={false} light={light} />
      <span style={{ fontSize: 12, fontWeight: 700, color: light ? C.white : C.slate, letterSpacing: 2, textTransform: "uppercase" }}>Intralink</span>
    </div>
  );
};

/* ───────── Cinematic Backgrounds ───────── */
const BgGradient: React.FC<{ colors: [string, string] }> = ({ colors }) => (
  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`, zIndex: 0 }} />
);

const BgOrbs: React.FC<{ color: string }> = ({ color }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, left: -200 + Math.sin(f * 0.008) * 60, top: -150 + Math.cos(f * 0.006) * 50, filter: "blur(80px)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`, right: -150 + Math.cos(f * 0.007) * 40, bottom: -100 + Math.sin(f * 0.009) * 60, filter: "blur(80px)", zIndex: 0, pointerEvents: "none" }} />
    </>
  );
};

/* ───────── Huge Type Helper ───────── */
const MegaText: React.FC<{ children: React.ReactNode; color?: string; delay?: number; size?: number }> = ({ children, color = C.navy, delay = 0, size = 120 }) => {
  const sc = useScale(delay, 0.85);
  const op = useFade(delay, 14);
  return (
    <div style={{ fontSize: size, fontWeight: 800, color, lineHeight: 1.05, letterSpacing: -2, opacity: op, transform: `scale(${sc})`, transformOrigin: "center center" }}>
      {children}
    </div>
  );
};

const SubText: React.FC<{ children: React.ReactNode; color?: string; delay?: number; size?: number }> = ({ children, color = C.slate, delay = 0, size = 28 }) => {
  const y = useSlideY(delay, 30);
  const op = useFade(delay, 16);
  return <div style={{ fontSize: size, fontWeight: 500, color, lineHeight: 1.4, opacity: op, transform: `translateY(${y}px)` }}>{children}</div>;
};

/* ───────── SCENE ENTRANCE WRAPPER ─────────
   Slides the entire scene in from off-screen during the first 18 frames.
   This creates proper cinematic transitions between scenes. */
const SceneEntrance: React.FC<{ children: React.ReactNode; direction?: "left" | "right" | "bottom" | "top" | "scale"; duration?: number }> = ({ children, direction = "left", duration = 18 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eased = 1 - Math.pow(1 - t, 3);

  let transform = "";
  if (direction === "left") transform = `translateX(${(1 - eased) * -W}px)`;
  if (direction === "right") transform = `translateX(${(1 - eased) * W}px)`;
  if (direction === "bottom") transform = `translateY(${(1 - eased) * H}px)`;
  if (direction === "top") transform = `translateY(${(1 - eased) * -H}px)`;
  if (direction === "scale") {
    const s = 0.6 + eased * 0.4;
    transform = `scale(${s})`;
  }

  return (
    <div style={{ position: "absolute", inset: 0, transform, willChange: "transform" }}>
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════
   SCENE 0 — Title (0–3s)
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
        <BgGradient colors={[C.white, C.offWhite]} />
        <BgOrbs color={C.blue} />

        <div style={{ transform: `scale(${logoSc})`, opacity: logoOp, position: "relative", zIndex: 1 }}>
          <LogoIntra size={180} wordmark={true} />
        </div>

        <div style={{ width: lineW, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${C.blue}, ${C.teal})`, position: "relative", zIndex: 1 }} />

        <div style={{ opacity: subOp, fontSize: 28, color: C.slate, fontWeight: 500, textAlign: "center", position: "relative", zIndex: 1 }}>
          Institutional Intelligence Platform
        </div>

        <div style={{ opacity: badgeOp, display: "flex", gap: 14, position: "relative", zIndex: 1, marginTop: 12 }}>
          <div style={{ backgroundColor: C.navy, color: C.white, padding: "10px 28px", borderRadius: 10, fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", boxShadow: "0 8px 24px rgba(10,37,64,0.25)" }}>Project NAGA</div>
          <div style={{ backgroundColor: C.lightGray, color: C.slate, padding: "10px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600 }}>June 2025 &nbsp;|&nbsp; Confidential</div>
        </div>

        <FooterMark />
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 1 — Opportunity (3–10s)
   ═══════════════════════════════════════ */
const OpportunityScene: React.FC = () => {
  const f = useCurrentFrame();
  const bigSc = spring({ frame: f, fps: 30, config: { damping: 12, stiffness: 70, mass: 1 } });
  const bigOp = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(f, [12, 28], [0, 1], { extrapolateRight: "clamp" });
  const cardOp = interpolate(f, [32, 50], [0, 1], { extrapolateRight: "clamp" });
  const cardY = interpolate(f, [32, 50], [60, 0], { extrapolateRight: "clamp" });

  return (
    <SceneEntrance direction="right">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
        <BgGradient colors={[C.offWhite, C.white]} />
        <BgOrbs color={C.teal} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%", padding: "0 100px" }}>
          <div style={{ transform: `scale(${bigSc})`, opacity: bigOp, transformOrigin: "center center" }}>
            <div style={{ fontSize: 130, fontWeight: 800, color: C.navy, lineHeight: 0.95, letterSpacing: -4, textAlign: "center" }}>35+ YEARS</div>
            <div style={{ fontSize: 48, fontWeight: 600, color: C.blue, marginTop: 12, letterSpacing: -0.5, textAlign: "center" }}>of accumulated experience</div>
          </div>

          <div style={{ marginTop: 48, opacity: subOp }}>
            {[
              "Thousands of client engagements across Asia, Europe, and North America",
              "Deep stakeholder relationships in Japan, Korea, China, and beyond",
              "Proven outcomes across semiconductors, robotics, manufacturing",
            ].map((t, i) => (
              <div key={i} style={{ fontSize: 26, color: C.charcoal, marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: C.teal }} />
                {t}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, backgroundColor: C.navy, borderRadius: 24, padding: "40px 44px", maxWidth: 900, opacity: cardOp, transform: `translateY(${cardY}px)`, boxShadow: "0 24px 60px rgba(10,37,64,0.25)" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.white, lineHeight: 1.2 }}>The problem: almost none of it is accessible.</div>
            <div style={{ fontSize: 20, color: C.white, opacity: 0.85, marginTop: 14, lineHeight: 1.5 }}>Incomplete CRM records, unsearched emails, untranscribed meetings. As Intralink grows, this becomes a structural risk — and a structural opportunity.</div>
          </div>
        </div>

        <FooterMark />
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 2 — What NAGA Is (10–17s)
   ═══════════════════════════════════════ */
const WhatIsScene: React.FC = () => {
  const f = useCurrentFrame();
  const states = ["NOT A CHATBOT", "NOT A SEARCH TOOL", "THE INTELLIGENCE LAYER"];
  const cycle = 28;
  const active = Math.min(Math.floor(f / cycle), 2);
  const progress = (f % cycle) / cycle;
  const exitProgress = active >= 2 ? Math.max(0, (f - 65) / 20) : 0;

  return (
    <SceneEntrance direction="bottom">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
        <BgGradient colors={[C.white, C.offWhite]} />
        <BgOrbs color={C.blue} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, width: "100%", padding: "0 100px", textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.blue, letterSpacing: 3, textTransform: "uppercase", marginBottom: 28 }}>What NAGA Is</div>

          <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
            {states.map((s, i) => {
              const isActive = i === active;
              const isPast = i < active;
              const y = isPast ? -260 : isActive ? interpolate(progress, [0, 0.5], [180, 0]) : 260;
              const op = isPast ? 0 : isActive ? interpolate(progress, [0, 0.35], [0, 1]) : 0;
              const isLast = i === 2;
              return (
                <div key={i} style={{ position: "absolute", top: 0, left: 0, fontSize: 100, fontWeight: 800, color: isLast ? C.navy : C.slate, lineHeight: 1.0, letterSpacing: -3, opacity: op * (1 - exitProgress), transform: `translateY(${y}px)`, textDecoration: isLast ? "none" : "line-through", textDecorationColor: isLast ? "transparent" : C.teal, textDecorationThickness: 8 }}>
                  {s}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 48, background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`, borderRadius: 24, padding: 40, maxWidth: 950, opacity: interpolate(f, [70, 90], [0, 1], { extrapolateRight: "clamp" }), transform: `translateY(${interpolate(f, [70, 90], [40, 0], { extrapolateRight: "clamp" })}px)`, boxShadow: "0 24px 60px rgba(0,148,215,0.25)" }}>
            <div style={{ fontSize: 26, color: C.white, fontWeight: 500, lineHeight: 1.5 }}>The goal: every employee, on any engagement, immediately has access to what Intralink already knows.</div>
          </div>
        </div>

        <FooterMark />
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 3 — What It Solves (17–27s)
   ═══════════════════════════════════════ */
const SolvesScene: React.FC = () => {
  const f = useCurrentFrame();
  const pairs = [
    ["Missing meeting outcomes", "Auto summaries & Salesforce sync"],
    ["CRM needs discipline", "Automated updates from every call"],
    ["Research is repeated", "Historical pattern matching"],
    ["Expertise is invisible", "Expert & relationship discovery"],
    ["Knowledge walks out", "Permanent institutional record"],
    ["Proposals take weeks", "Precedents surfaced instantly"],
  ];

  return (
    <SceneEntrance direction="left">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
        <BgGradient colors={[C.offWhite, C.white]} />
        <BgOrbs color={C.teal} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, width: "100%", padding: "0 100px" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.blue, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>What It Solves</div>
          <div style={{ textAlign: "center" }}>
            <MegaText delay={4} size={95}>Six problems.<br />One platform.</MegaText>
          </div>

          <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 0, alignItems: "center" }}>
            {pairs.map((pair, i) => {
              const delay = 30 + i * 10;
              const op = interpolate(f, [delay, delay + 10], [0, 1], { extrapolateRight: "clamp" });
              const x = interpolate(f, [delay, delay + 10], [-50, 0], { extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 0, opacity: op, transform: `translateX(${x}px)`, padding: "16px 0", borderBottom: i < pairs.length - 1 ? `1px solid ${C.lightGray}` : "none" }}>
                  <span style={{ fontSize: 24, color: C.slate, fontWeight: 500, minWidth: 380 }}>{pair[0]}</span>
                  <span style={{ fontSize: 24, color: C.teal, margin: "0 18px" }}>→</span>
                  <span style={{ fontSize: 24, color: C.navy, fontWeight: 700 }}>{pair[1]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <FooterMark />
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 4 — Six Domains (27–37s)
   ═══════════════════════════════════════ */
const DomainsScene: React.FC = () => {
  const f = useCurrentFrame();
  const domains = [
    "Communication Intelligence",
    "Opportunity Intelligence",
    "Client Intelligence",
    "Employee Intelligence",
    "Market Entry Intelligence",
    "Outcome Intelligence",
  ];

  return (
    <SceneEntrance direction="right">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
        <BgGradient colors={[C.white, C.offWhite]} />
        <BgOrbs color={C.blue} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%", padding: "0 100px" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.blue, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>Six Intelligence Domains</div>
          <div style={{ textAlign: "center" }}>
            <MegaText delay={4} size={90}>Every capability.<br />One architecture.</MegaText>
          </div>

          <div style={{ marginTop: 44, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {domains.map((d, i) => {
              const delay = 35 + i * 8;
              const op = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
              const y = interpolate(f, [delay, delay + 12], [40, 0], { extrapolateRight: "clamp" });
              const sc = spring({ frame: f - delay, fps: 30, config: { damping: 10, stiffness: 130 } });
              return (
                <div key={i} style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`, borderRadius: 18, padding: "32px 28px", opacity: op, transform: `translateY(${y}px)`, boxShadow: "0 14px 36px rgba(0,148,215,0.18)", color: C.white }}>
                  <div style={{ fontSize: 36, fontWeight: 800, opacity: 0.25, marginBottom: 6 }}>0{i + 1}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, transform: `scale(${sc})`, transformOrigin: "left top" }}>{d}</div>
                </div>
              );
            })}
          </div>
        </div>

        <FooterMark />
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 5 — Competitive Advantage (37–44s)
   ═══════════════════════════════════════ */
const AdvantageScene: React.FC = () => {
  const f = useCurrentFrame();
  const headingOp = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const headingY = interpolate(f, [0, 18], [50, 0], { extrapolateRight: "clamp" });

  const questions = [
    "Which approaches have worked for Japanese semiconductor companies entering Europe?",
    "Which stakeholders consistently influence robotics expansion decisions?",
    "Which partnership models have produced the strongest outcomes?",
  ];

  return (
    <SceneEntrance direction="scale">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
        <BgGradient colors={[C.navy, "#0d2d4a"]} />
        <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(circle, ${C.blue}12 0%, transparent 70%)`, right: -250, top: -250, filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%", padding: "0 100px", textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.teal, letterSpacing: 3, textTransform: "uppercase", marginBottom: 28, opacity: useFade(0, 12) }}>Competitive Advantage</div>

          <div style={{ fontSize: 72, fontWeight: 800, color: C.white, lineHeight: 1.05, letterSpacing: -3, opacity: headingOp, transform: `translateY(${headingY}px)`, textAlign: "center" }}>
            No competitor has access to Intralink&apos;s 35+ years.
          </div>

          <div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 24 }}>
            {questions.map((q, i) => {
              const delay = 28 + i * 12;
              const op = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
              const x = interpolate(f, [delay, delay + 12], [-40, 0], { extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 18, opacity: op, transform: `translateX(${x}px)` }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: C.navy, fontSize: 16, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                  <div style={{ fontSize: 26, color: C.white, lineHeight: 1.4, opacity: 0.9 }}>{q}</div>
                </div>
              );
            })}
          </div>
        </div>

        <FooterMark light />
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 6 — Rollout (44–54s)
   ═══════════════════════════════════════ */
const RolloutScene: React.FC = () => {
  const f = useCurrentFrame();
  const phases = [
    { num: "01", title: "Communication Intelligence", time: "M1–2", sub: "Eliminate manual administration" },
    { num: "02", title: "Opportunity Intelligence", time: "M3–4", sub: "Improve win rates and forecasting" },
    { num: "03", title: "Employee & Client Intelligence", time: "M5–6", sub: "Scale organisational knowledge" },
    { num: "04", title: "Market Entry & Outcome", time: "M7–9", sub: "Convert history into business intelligence" },
    { num: "05", title: "Enterprise Platform", time: "M10–12", sub: "Full institutional memory — live and learning" },
  ];

  const progressW = interpolate(f, [25, 105], [0, 100], { extrapolateRight: "clamp" });

  return (
    <SceneEntrance direction="bottom">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
        <BgGradient colors={[C.white, C.offWhite]} />
        <BgOrbs color={C.blue} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, width: "100%", padding: "0 100px" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.blue, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>Rollout Plan</div>
          <div style={{ textAlign: "center" }}>
            <MegaText delay={4} size={90}>Five phases.<br />12 months.</MegaText>
          </div>

          <div style={{ marginTop: 40, height: 5, borderRadius: 3, backgroundColor: C.lightGray, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressW}%`, borderRadius: 3, background: `linear-gradient(90deg, ${C.blue}, ${C.teal})`, transition: "none" }} />
          </div>

          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 16 }}>
            {phases.map((p, i) => {
              const delay = 28 + i * 8;
              const op = interpolate(f, [delay, delay + 10], [0, 1], { extrapolateRight: "clamp" });
              const y = interpolate(f, [delay, delay + 10], [30, 0], { extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, opacity: op, transform: `translateY(${y}px)` }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 18, fontWeight: 800, flexShrink: 0, boxShadow: "0 6px 16px rgba(0,148,215,0.25)" }}>{p.num}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: C.navy }}>{p.title}</div>
                    <div style={{ fontSize: 17, color: C.slate, marginTop: 3 }}>{p.sub}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.blue, letterSpacing: 1, textTransform: "uppercase" }}>{p.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        <FooterMark />
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 7 — Expected Returns (54–62s)
   ═══════════════════════════════════════ */
const ReturnsScene: React.FC = () => {
  const f = useCurrentFrame();
  const buckets = [
    { title: "OPERATIONAL", items: ["Less admin", "Faster onboarding", "Reduced key-person risk"], color: C.blue, delay: 0 },
    { title: "COMMERCIAL", items: ["Higher win rates", "Faster proposals", "Stronger client context"], color: C.teal, delay: 20 },
    { title: "STRATEGIC", items: ["Permanent knowledge", "Compounding advantage", "Scalable expertise"], color: C.navy, delay: 40 },
  ];

  return (
    <SceneEntrance direction="left">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
        <BgGradient colors={[C.offWhite, C.white]} />
        <BgOrbs color={C.teal} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%", padding: "0 100px" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.blue, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>Expected Returns</div>
          <div style={{ textAlign: "center" }}>
            <MegaText delay={4} size={90}>Three impacts.<br />One platform.</MegaText>
          </div>

          <div style={{ marginTop: 44, display: "flex", gap: 24 }}>
            {buckets.map((b, i) => {
              const delay = 26 + b.delay;
              const op = interpolate(f, [delay, delay + 14], [0, 1], { extrapolateRight: "clamp" });
              const y = interpolate(f, [delay, delay + 14], [50, 0], { extrapolateRight: "clamp" });
              const sc = spring({ frame: f - delay, fps: 30, config: { damping: 12, stiffness: 90 } });
              return (
                <div key={i} style={{ flex: 1, backgroundColor: b.color, borderRadius: 24, padding: 44, opacity: op, transform: `translateY(${y}px)`, boxShadow: `0 24px 60px ${b.color}45`, color: C.white }}>
                  <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.65, letterSpacing: 2, textTransform: "uppercase", marginBottom: 22 }}>{b.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {b.items.map((item, j) => (
                      <div key={j} style={{ fontSize: 22, fontWeight: 500, opacity: 0.95, transform: `scale(${interpolate(f, [delay + 6 + j * 5, delay + 12 + j * 5], [0.9, 1], { extrapolateRight: "clamp" })})` }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <FooterMark />
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 8 — Risks (62–70s)
   ═══════════════════════════════════════ */
const RisksScene: React.FC = () => {
  const f = useCurrentFrame();
  const risks = [
    { title: "Data quality", sub: "Phase 1 establishes clean capture" },
    { title: "Adoption", sub: "Passive capture — no behaviour change needed" },
    { title: "Data sensitivity", sub: "RBAC + existing Salesforce permissions" },
    { title: "AI accuracy", sub: "Draft outputs — no auto-commits" },
  ];

  return (
    <SceneEntrance direction="right">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
        <BgGradient colors={[C.navy, "#0c2a44"]} />
        <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}08 0%, transparent 70%)`, left: -250, bottom: -250, filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%", padding: "0 100px", textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.teal, letterSpacing: 3, textTransform: "uppercase", marginBottom: 28, opacity: useFade(0, 12) }}>Risks & Mitigations</div>
          <div style={{ fontSize: 72, fontWeight: 800, color: C.white, lineHeight: 1.05, letterSpacing: -3, opacity: useFade(6, 16), transform: `translateY(${useSlideY(6, 30)}px)`, textAlign: "center" }}>Known risks.<br />Planned mitigations.</div>

          <div style={{ marginTop: 52, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22 }}>
            {risks.map((r, i) => {
              const delay = 30 + i * 10;
              const op = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
              const y = interpolate(f, [delay, delay + 12], [30, 0], { extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 32, opacity: op, transform: `translateY(${y}px)` }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: C.white, marginBottom: 10 }}>{r.title}</div>
                  <div style={{ fontSize: 18, color: C.white, opacity: 0.75, lineHeight: 1.5 }}>{r.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        <FooterMark light />
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   SCENE 9 — Closing (70–78s)
   ═══════════════════════════════════════ */
const ClosingScene: React.FC = () => {
  const f = useCurrentFrame();
  const s = spring({ frame: f, fps: 30, config: { damping: 14, stiffness: 70, mass: 1 } });
  const textOp = interpolate(f, [12, 28], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(f, [30, 46], [0, 1], { extrapolateRight: "clamp" });
  const btnSc = spring({ frame: f - 50, fps: 30, config: { damping: 10, stiffness: 100 } });

  return (
    <SceneEntrance direction="scale">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 32, fontFamily: FONT }}>
        <BgGradient colors={[C.navy, C.blue]} />
        <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}15 0%, transparent 60%)`, top: -300, left: "50%", marginLeft: -450, filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ transform: `scale(${s})`, position: "relative", zIndex: 1 }}>
          <LogoIntra size={140} wordmark={true} light />
        </div>

        <div style={{ fontSize: 48, fontWeight: 700, color: C.white, textAlign: "center", maxWidth: 1000, lineHeight: 1.2, opacity: textOp, position: "relative", zIndex: 1 }}>
          35+ years of experience. Intralink&apos;s most valuable and most underused asset.
        </div>

        <div style={{ fontSize: 26, color: C.white, textAlign: "center", maxWidth: 800, lineHeight: 1.5, opacity: subOp, position: "relative", zIndex: 1 }}>
          NAGA converts that asset into intelligence.
        </div>

        <div style={{ marginTop: 12, backgroundColor: C.white, color: C.navy, padding: "18px 48px", borderRadius: 14, fontSize: 22, fontWeight: 700, transform: `scale(${btnSc})`, boxShadow: "0 16px 48px rgba(0,0,0,0.3)", position: "relative", zIndex: 1 }}>
          The build is scoped. The rollout is phased. The risk is contained.
        </div>

        <div style={{ fontSize: 14, color: C.white, opacity: 0.5, marginTop: 16, letterSpacing: 2, position: "relative", zIndex: 1 }}>
          Project NAGA · Intralink · June 2025
        </div>

        <FooterMark light />
      </AbsoluteFill>
    </SceneEntrance>
  );
};

/* ═══════════════════════════════════════
   MAIN COMPOSITION
   ═══════════════════════════════════════ */
export const NagaProductVideoCinematic: React.FC = () => {
  const scenes = [
    { from: 0, dur: 90, comp: TitleScene },
    { from: 90, dur: 210, comp: OpportunityScene },
    { from: 300, dur: 210, comp: WhatIsScene },
    { from: 510, dur: 300, comp: SolvesScene },
    { from: 810, dur: 300, comp: DomainsScene },
    { from: 1110, dur: 210, comp: AdvantageScene },
    { from: 1320, dur: 300, comp: RolloutScene },
    { from: 1620, dur: 240, comp: ReturnsScene },
    { from: 1860, dur: 240, comp: RisksScene },
    { from: 2100, dur: 240, comp: ClosingScene },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.white, fontFamily: FONT, overflow: "hidden" }}>
      {scenes.map((s, i) => {
        const Scene = s.comp;
        return (
          <Sequence key={i} from={s.from} durationInFrames={s.dur}>
            <Scene />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
