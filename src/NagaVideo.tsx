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
  Audio,
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
};

const FONT = "'Sofia Pro', sans-serif";

/* ───────── Animation Helpers ───────── */
const fade = (delay: number, dur = 15) => {
  const f = useCurrentFrame();
  return interpolate(f - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const slideY = (delay: number, dist = 50) => {
  const f = useCurrentFrame();
  const p = spring({
    frame: f - delay,
    fps: 30,
    config: { damping: 14, stiffness: 90, mass: 1 },
  });
  return interpolate(p, [0, 1], [dist, 0]);
};

const slideX = (delay: number, dist = 60) => {
  const f = useCurrentFrame();
  const p = spring({
    frame: f - delay,
    fps: 30,
    config: { damping: 14, stiffness: 90, mass: 1 },
  });
  return interpolate(p, [0, 1], [dist, 0]);
};

const scaleIn = (delay: number) => {
  const f = useCurrentFrame();
  return spring({
    frame: f - delay,
    fps: 30,
    config: { damping: 12, stiffness: 80, mass: 1 },
  });
};

/* ───────── Shared Components ───────── */
const LogoIntra: React.FC<{ size?: number; wordmark?: boolean } > = ({
  size = 48,
  wordmark = false,
}) => {
  const src = wordmark
    ? staticFile("icons/intralink-wordmark.svg")
    : staticFile("icons/intralink-icon.svg");
  return <Img src={src} style={{ height: size, width: "auto" }} />;
};

const Divider: React.FC = () => (
  <div
    style={{
      width: 80,
      height: 4,
      borderRadius: 2,
      background: `linear-gradient(90deg, ${C.blue}, ${C.teal})`,
    }}
  />
);


/* ═══════════════════════════════════════
   SCENE 0  —  Intralink Intro  (0–2.5s)
   ═══════════════════════════════════════ */
const IntralinkIntro: React.FC = () => {
  const f = useCurrentFrame();
  const s = spring({ frame: f, fps: 30, config: { damping: 12, stiffness: 80 } });
  const op = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.white,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 28,
        fontFamily: FONT,
      }}
    >
      <div style={{ transform: `scale(${s})`, opacity: op }}>
        <LogoIntra size={140} wordmark={true} />
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 1  —  NAGA Title  (2.5–5.5s)
   ═══════════════════════════════════════ */
const NagaTitle: React.FC = () => {
  const f = useCurrentFrame();
  const s = spring({ frame: f, fps: 30, config: { damping: 12, stiffness: 70 } });
  const op = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(f, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const lineOp = interpolate(f, [40, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.white,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        fontFamily: FONT,
      }}
    >
      <div style={{ transform: `scale(${s})`, opacity: op }}>
        <Img
          src={staticFile("naga/naga-logo.png")}
          style={{ height: 200, width: "auto" }}
        />
      </div>

      <div
        style={{
          opacity: subOp,
          fontSize: 26,
          color: C.blue,
          fontWeight: 600,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        AI-Enabled Operational Intelligence Platform
      </div>

      <div
        style={{
          opacity: lineOp,
          fontSize: 22,
          color: C.slate,
          fontWeight: 500,
          marginTop: 4,
        }}
      >
        Where Intralink Knowledge Becomes Action.
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 2  —  Problem  (5.5–10s)
   ═══════════════════════════════════════ */
const ProblemScene: React.FC = () => {
  const tools = [
    { label: "Microsoft Teams", delay: 0, color: "#6264A7", icon: "icons/tools/teams.svg" },
    { label: "Email", delay: 8, color: "#0078D4", icon: "icons/tools/outlook.svg" },
    { label: "Excel", delay: 16, color: "#217346", icon: "icons/tools/excel.svg" },
    { label: "Notes", delay: 24, color: "#F5A623", icon: "icons/tools/notes.svg" },
    { label: "Recordings", delay: 32, color: "#E53935", icon: "icons/tools/recordings.svg" },
    { label: "Research", delay: 40, color: "#00897B", icon: "icons/tools/research.svg" },
    { label: "PowerPoint", delay: 48, color: "#D24726", icon: "icons/tools/powerpoint.svg" },
    { label: "Cloud Storage", delay: 56, color: "#0078D4", icon: "icons/tools/onedrive.svg" },
  ];

  const titleOp = fade(0, 20);
  const titleY = slideY(0, 30);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${C.offWhite} 0%, ${C.white} 100%)`,
        padding: 80,
        fontFamily: FONT,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.blue,
            marginBottom: 8,
            opacity: fade(0, 12),
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          The Problem
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: C.navy,
            marginBottom: 12,
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Knowledge is scattered
        </div>
        <div
          style={{
            fontSize: 26,
            color: C.slate,
            fontWeight: 500,
            marginBottom: 56,
            opacity: fade(10, 15),
            transform: `translateY(${slideY(10, 20)}px)`,
          }}
        >
          Intralink teams juggle 8+ disconnected tools every day
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}
        >
          {tools.map((t, i) => {
            const op = fade(t.delay, 16);
            const y = slideY(t.delay, 20);
            return (
              <div
                key={i}
                style={{
                  backgroundColor: t.color,
                  borderRadius: 16,
                  padding: "32px 16px",
                  textAlign: "center",
                  boxShadow: `0 8px 24px ${t.color}40`,
                  opacity: op,
                  transform: `translateY(${y}px)`,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: C.white,
                    margin: "0 auto 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                >
                  <Img
                    src={staticFile(t.icon)}
                    style={{
                      height: 30,
                      width: 30,
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: C.white,
                    lineHeight: 1.3,
                  }}
                >
                  {t.label}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 52,
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: fade(75, 18),
            transform: `translateY(${slideY(75, 15)}px)`,
          }}
        >
          <Divider />
          <div style={{ fontSize: 24, color: C.blue, fontWeight: 600 }}>
            Decisions are slower. Context is lost. Work is duplicated.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 3  —  Vision  (10–15s)
   ═══════════════════════════════════════ */
const VisionScene: React.FC = () => {
  const pillars = [
    { title: "Premium AI Models", subtitle: "Claude, OpenAI, Gemini \u0026 more", delay: 0 },
    { title: "Workflow Automation", subtitle: "Custom bots \u0026 task pipelines", delay: 12 },
    { title: "Auto Report Generation", subtitle: "Instant status \u0026 insight docs", delay: 24 },
    { title: "Salesforce Integration", subtitle: "CRM sync \u0026 deal tracking", delay: 36 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.white,
        padding: 80,
        fontFamily: FONT,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.blue,
            marginBottom: 10,
            opacity: fade(0, 14),
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          The Solution
        </div>

        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: C.navy,
            marginBottom: 14,
            opacity: fade(6, 18),
            transform: `translateY(${slideY(6, 25)}px)`,
          }}
        >
          NAGA — One Platform. Every Capability.
        </div>

        <div
          style={{
            fontSize: 22,
            color: C.slate,
            fontWeight: 500,
            marginBottom: 60,
            opacity: fade(14, 14),
          }}
        >
          Unified access to world-class AI, automation, and document generation.
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {pillars.map((p, i) => {
            const op = fade(p.delay, 16);
            const y = slideY(p.delay, 35);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: `linear-gradient(145deg, ${C.blue} 0%, ${C.teal} 100%)`,
                  borderRadius: 20,
                  padding: 36,
                  color: C.white,
                  opacity: op,
                  transform: `translateY(${y}px)`,
                  boxShadow: "0 12px 40px rgba(0,148,215,0.18)",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    opacity: 0.7,
                    marginBottom: 8,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  0{i + 1}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 16, fontWeight: 400, opacity: 0.9 }}>
                  {p.subtitle}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 50,
            textAlign: "center",
            opacity: fade(55, 16),
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              backgroundColor: C.navy,
              color: C.white,
              padding: "14px 36px",
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            <LogoIntra size={28} />
            Where Intralink Knowledge Becomes Action
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 4  —  Solution / Architecture  (15–22s)
   ═══════════════════════════════════════ */

const ArchNode: React.FC<{
  label: string;
  sub?: string;
  color?: string;
  delay: number;
  width?: number;
  icon?: string;
}> = ({ label, sub, color = C.blue, delay, width = 160, icon }) => {
  const op = fade(delay, 14);
  const y = slideY(delay, 20);
  return (
    <div
      style={{
        width,
        backgroundColor: C.white,
        borderRadius: 14,
        padding: "14px 18px",
        opacity: op,
        transform: `translateY(${y}px)`,
        boxShadow: "0 4px 16px rgba(10,37,64,0.08)",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {icon ? (
        <Img
          src={staticFile(icon)}
          style={{
            height: 28,
            width: 28,
            objectFit: "contain",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
        </div>
      )}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{sub}</div>
        )}
      </div>
    </div>
  );
};

const ArchConnector: React.FC<{ delay: number; vertical?: boolean; length?: number }> = ({
  delay,
  vertical = false,
  length = 40,
}) => {
  const op = fade(delay, 10);
  return (
    <div
      style={{
        width: vertical ? 2 : length,
        height: vertical ? length : 2,
        background: `linear-gradient(${vertical ? "180deg" : "90deg"}, ${C.blue}, ${C.teal})`,
        opacity: op,
        borderRadius: 1,
      }}
    />
  );
};

const SolutionScene: React.FC = () => {
  const headerOp = fade(0, 18);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.offWhite,
        padding: "50px 70px",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          color: C.navy,
          marginBottom: 8,
          opacity: headerOp,
        }}
      >
        NAGA: The Operational Intelligence Hub
      </div>
      <div
        style={{
          fontSize: 18,
          color: C.slate,
          marginBottom: 28,
          opacity: fade(8, 12),
        }}
      >
        A unified architecture connecting data, AI, and output.
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          height: "calc(100% - 110px)",
        }}
      >
        {/* LEFT — Data Sources */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "flex-end",
          }}
        >
          <ArchNode label="Microsoft Teams" sub="Meetings & Chat" color={C.blue} delay={10} icon="icons/tools/teams.svg" />
          <ArchNode label="Email & Outlook" sub="Comms & Calendar" color={C.blue} delay={22} icon="icons/tools/outlook.svg" />
          <ArchNode label="Salesforce" sub="CRM & Deal Pipeline" color={C.blue} delay={34} icon="icons/tools/salesforce.svg" />
          <ArchNode label="Cloud Storage" sub="SharePoint / OneDrive" color={C.blue} delay={46} icon="icons/tools/onedrive.svg" />
        </div>

        <ArchConnector delay={55} length={50} />

        {/* CENTER — NAGA Hub */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 220,
              background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
              borderRadius: 20,
              padding: "22px 26px",
              color: C.white,
              opacity: fade(55, 16),
              transform: `scale(${scaleIn(55)})`,
              boxShadow: "0 14px 40px rgba(10,37,64,0.22)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 700 }}>NAGA</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Operational Intelligence Hub</div>
          </div>

          <ArchConnector delay={65} vertical length={30} />

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
            }}
          >
            <ArchNode label="AI Engine" sub="Claude · OpenAI · Gemini" color={C.teal} delay={70} width={130} icon="icons/tools/ai-engine.svg" />
            <ArchNode label="Workflow" sub="Bots & Pipelines" color={C.teal} delay={78} width={130} icon="icons/tools/workflow.svg" />
            <ArchNode label="Reports" sub="Auto Generation" color={C.teal} delay={86} width={130} icon="icons/tools/reports.svg" />
          </div>
        </div>

        <ArchConnector delay={95} length={50} />

        {/* RIGHT — Outputs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          <ArchNode label="AI Summaries" sub="Meeting & Project" color={C.teal} delay={100} icon="icons/tools/summaries.svg" />
          <ArchNode label="PDF Reports" sub="Branded Templates" color={C.teal} delay={110} icon="icons/tools/pdf-report.svg" />
          <ArchNode label="Status Updates" sub="Auto-distributed" color={C.teal} delay={120} icon="icons/tools/status-update.svg" />
          <ArchNode label="Insights" sub="Searchable Knowledge" color={C.teal} delay={130} icon="icons/tools/insights.svg" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   SCENE 5  —  Security & Governance  (22–30s)
   ═══════════════════════════════════════ */

const IconShield: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#fff" strokeWidth="1.5" fill="rgba(255,255,255,0.15)" />
    <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconLockScan: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="#fff" strokeWidth="1.5" />
    <path d="M8 11V7a4 4 0 018 0v4" stroke="#fff" strokeWidth="1.5" />
    <path d="M3 15h18" stroke="#fff" strokeWidth="1.2" strokeDasharray="3 3" />
  </svg>
);

const IconClipboard: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="6" y="3" width="12" height="18" rx="2" stroke="#fff" strokeWidth="1.5" />
    <path d="M9 3h6" stroke="#fff" strokeWidth="1.5" />
    <path d="M9 8h6M9 12h4M9 16h6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconUsersLock: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3" stroke="#fff" strokeWidth="1.5" />
    <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="14" y="14" width="6" height="5" rx="1" stroke="#fff" strokeWidth="1.2" />
    <circle cx="17" cy="16.5" r="0.8" fill="#fff" />
  </svg>
);

const SecurityScene: React.FC = () => {
  const cards = [
    {
      title: "Centralized AI Governance",
      subtitle: "One Unified Enterprise AI Gateway",
      body: "Controlled access. Centralized monitoring. Auditability. Compliance enforcement. Approved AI providers only.",
      color: C.navy,
      icon: IconShield,
      delay: 0,
    },
    {
      title: "Sensitive Data Leak Prevention",
      subtitle: "Real-Time Prompt Scanning",
      body: "Every prompt and response is scanned. Detects client confidential data, passwords, API keys, financial data, PII, contracts, and internal project names.",
      color: C.blue,
      icon: IconLockScan,
      delay: 12,
    },
    {
      title: "Full AI Audit Trail",
      subtitle: "Every Interaction Logged",
      body: "Track who asked what, which agent was used, which documents were accessed, which model responded, and what actions were executed.",
      color: C.teal,
      icon: IconClipboard,
      delay: 24,
    },
    {
      title: "Role-Based Access Control",
      subtitle: "RBAC for AI Agents",
      body: "Agents inherit enterprise permissions. HR sees employee records. Finance sees invoices. Sales sees CRM. AI cannot access data the user itself cannot access.",
      color: C.slate,
      icon: IconUsersLock,
      delay: 36,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.white,
        padding: "60px 80px",
        fontFamily: FONT,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.blue,
            marginBottom: 8,
            opacity: fade(0, 12),
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Enterprise Security
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: C.navy,
            marginBottom: 8,
            opacity: fade(6, 16),
            transform: `translateY(${slideY(6, 20)}px)`,
          }}
        >
          AI Platform Security & Governance
        </div>
        <div
          style={{
            fontSize: 20,
            color: C.slate,
            fontWeight: 500,
            marginBottom: 40,
            opacity: fade(14, 12),
          }}
        >
          Built for regulated environments. Designed for trust.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
          }}
        >
          {cards.map((c, i) => {
            const op = fade(c.delay, 16);
            const y = slideY(c.delay, 20);
            return (
              <div
                key={i}
                style={{
                  backgroundColor: c.color,
                  borderRadius: 20,
                  padding: 32,
                  opacity: op,
                  transform: `translateY(${y}px)`,
                  boxShadow: `0 12px 32px ${c.color}35`,
                  color: C.white,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  {React.createElement(c.icon, { size: 26 })}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    opacity: 0.75,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {c.subtitle}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  {c.title}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    opacity: 0.9,
                    lineHeight: 1.6,
                  }}
                >
                  {c.body}
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
   SCENE 7  —  Vision CTA  (32.5–38s)
   ═══════════════════════════════════════ */
const VisionCTA: React.FC = () => {
  const f = useCurrentFrame();
  const s = scaleIn(0);
  const textOp = fade(12, 16);
  const subOp = fade(28, 16);
  const btnScale = scaleIn(45);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 28,
        fontFamily: FONT,
      }}
    >
      <div style={{ transform: `scale(${s})` }}>
        <Img
          src={staticFile("naga/naga-logo-white-v2.png")}
          style={{ height: 140, width: "auto" }}
        />
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: C.white,
          textAlign: "center",
          opacity: textOp,
        }}
      >
        The Long-Term Vision
      </div>

      <div
        style={{
          fontSize: 26,
          color: C.white,
          textAlign: "center",
          maxWidth: 900,
          lineHeight: 1.4,
          opacity: subOp,
        }}
      >
        From an operational assistant to Intralink’s central orchestration layer.
      </div>

      <div
        style={{
          fontSize: 19,
          color: C.white,
          textAlign: "center",
          maxWidth: 800,
          lineHeight: 1.5,
          opacity: subOp,
          fontWeight: 500,
        }}
      >
        An internal knowledge platform that drives cross-team coordination,
        prioritizes practical efficiency, and permanently retains institutional memory.
      </div>

      <div
        style={{
          marginTop: 12,
          backgroundColor: C.white,
          color: C.navy,
          padding: "16px 44px",
          borderRadius: 12,
          fontSize: 22,
          fontWeight: 700,
          transform: `scale(${btnScale})`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        Where Intralink Knowledge Becomes Action.
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════
   MAIN COMPOSITION
   ═══════════════════════════════════════ */
export const NagaVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.white, fontFamily: FONT }}>
      {/* ═══════ Synced to voice_naga_ai.mp3 (68.27s / 2048f @ 30fps) ═══════ */}

      <Audio src={staticFile("voice_naga_ai.mp3")} from={60} />

      {/* 0. Intralink Intro  0:00.000 – 0:02.000  (60f) */}
      <Sequence from={0} durationInFrames={60}>
        <IntralinkIntro />
      </Sequence>

      {/* 1. NAGA Title  0:02.000 – 0:07.500  (165f) */}
      <Sequence from={60} durationInFrames={165}>
        <NagaTitle />
      </Sequence>

      {/* 2. Problem  0:07.500 – 0:20.000  (375f) */}
      <Sequence from={225} durationInFrames={375}>
        <ProblemScene />
      </Sequence>

      {/* 3. Vision  0:20.000 – 0:29.500  (285f) */}
      <Sequence from={600} durationInFrames={285}>
        <VisionScene />
      </Sequence>

      {/* 4. Architecture  0:29.500 – 0:44.000  (435f) */}
      <Sequence from={885} durationInFrames={435}>
        <SolutionScene />
      </Sequence>

      {/* 5. Security & Governance  0:44.000 – 0:58.500  (435f) */}
      <Sequence from={1320} durationInFrames={435}>
        <SecurityScene />
      </Sequence>

      {/* 6. CTA  0:58.500 – 1:08.267  (293f) */}
      <Sequence from={1755} durationInFrames={293}>
        <VisionCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
