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

// Intralink Brand Colors
const BRAND = {
  blue: "#0094d7",
  teal: "#28b9d0",
  charcoal: "#1d1d1b",
  white: "#ffffff",
  lightGray: "#f5f5f5",
};

const FONT_FAMILY = "'Sofia Pro', sans-serif";

// Logo Component
const Logo: React.FC<{ size?: number; showWordmark?: boolean }> = ({
  size = 48,
  showWordmark = false,
}) => {
  const logoSrc = showWordmark
    ? staticFile("icons/intralink-wordmark.svg")
    : staticFile("icons/intralink-icon.svg");

  return (
    <Img
      src={logoSrc}
      style={{
        height: size,
        width: "auto",
      }}
    />
  );
};

// Fade In Animation Helper
const useFadeIn = (startFrame: number, duration: number = 15) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame - startFrame,
    [0, duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};

// Slide Animation Helper
const useSlideUp = (startFrame: number, distance: number = 50) => {
  const frame = useCurrentFrame();
  const progress = spring({
    frame: frame - startFrame,
    fps: 30,
    config: { damping: 15, stiffness: 100 },
  });
  return interpolate(progress, [0, 1], [distance, 0]);
};

// Scene 1: Logo Intro (0-2 seconds)
const LogoIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 12, stiffness: 80 },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.white,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        <Logo size={120} showWordmark={true} />
      </div>
      <div
        style={{
          opacity: taglineOpacity,
          fontSize: 32,
          color: BRAND.charcoal,
          fontWeight: 400,
        }}
      >
        Never miss a meeting moment
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: Problem Statement (2-5 seconds)
const ProblemStatement: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = useFadeIn(0);
  const titleY = useSlideUp(0, 40);

  const items = [
    { text: "Missing important discussions", delay: 15 },
    { text: "Notes scattered everywhere", delay: 25 },
    { text: "Hours spent catching up", delay: 35 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.white,
        padding: 80,
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ maxWidth: 900 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: BRAND.charcoal,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginBottom: 60,
          }}
        >
          Sound familiar?
        </div>

        {items.map((item, index) => {
          const opacity = useFadeIn(item.delay, 20);
          const x = useSlideUp(item.delay, 30);

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                marginBottom: 32,
                opacity,
                transform: `translateY(${x}px)`,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: BRAND.teal,
                }}
              />
              <span style={{ fontSize: 36, color: BRAND.charcoal }}>
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: Solution - Join Meeting (5-10 seconds)
const JoinMeeting: React.FC = () => {
  const frame = useCurrentFrame();

  const containerScale = spring({
    frame,
    fps: 30,
    config: { damping: 15, stiffness: 100 },
  });

  const textOpacity = useFadeIn(20);
  const textY = useSlideUp(20, 20);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.lightGray,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700, color: BRAND.charcoal }}>
          One click to join
        </div>
        <div style={{ fontSize: 28, color: BRAND.blue, marginTop: 12 }}>
          Bot joins your meeting automatically
        </div>
      </div>

      {/* Actual App Screenshot */}
      <div
        style={{
          transform: `scale(${containerScale})`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          width: 900,
          height: 506,
        }}
      >
        <Img
          src={staticFile("screenshots/home.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: Bot Records (10-15 seconds)
const BotRecords: React.FC = () => {
  const frame = useCurrentFrame();

  const pulseOpacity = interpolate(
    frame % 30,
    [0, 15, 30],
    [1, 0.5, 1]
  );

  const waveScale = interpolate(
    frame % 60,
    [0, 60],
    [1, 1.5]
  );

  const textOpacity = useFadeIn(0);
  const mockupScale = spring({
    frame: frame - 10,
    fps: 30,
    config: { damping: 15, stiffness: 100 },
  });

  // Transcription animation
  const words = ["Let's", "discuss", "the", "roadmap", "for", "Q2..."];
  const visibleWords = Math.floor(interpolate(frame, [40, 90], [0, words.length], {
    extrapolateRight: "clamp",
  }));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.white,
        padding: 80,
        display: "flex",
        gap: 60,
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Left side - Recording indicator */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Pulse waves */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 80 + i * 40,
                height: 80 + i * 40,
                borderRadius: "50%",
                border: `2px solid ${BRAND.teal}`,
                opacity: (1 - i * 0.3) * pulseOpacity,
                transform: `scale(${waveScale})`,
              }}
            />
          ))}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: BRAND.blue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: pulseOpacity,
            }}
          >
            <Logo size={40} />
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 36,
            fontWeight: 600,
            color: BRAND.charcoal,
            opacity: textOpacity,
          }}
        >
          Recording...
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 24,
            color: BRAND.teal,
            opacity: textOpacity,
          }}
        >
          00:12:34
        </div>
      </div>

      {/* Right side - Live transcript */}
      <div
        style={{
          flex: 1.5,
          backgroundColor: BRAND.lightGray,
          borderRadius: 16,
          padding: 40,
          transform: `scale(${mockupScale})`,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: BRAND.charcoal,
            marginBottom: 24,
            opacity: textOpacity,
          }}
        >
          Live Transcript
        </div>
        <div style={{ fontSize: 24, color: BRAND.charcoal, lineHeight: 1.6 }}>
          {words.slice(0, visibleWords).map((word, i) => (
            <span
              key={i}
              style={{
                opacity: interpolate(
                  frame,
                  [40 + i * 10, 50 + i * 10],
                  [0.3, 1],
                  { extrapolateRight: "clamp" }
                ),
              }}
            >
              {word}{" "}
            </span>
          ))}
          <span
            style={{
              opacity: frame % 30 < 15 ? 1 : 0,
              color: BRAND.blue,
            }}
          >
            |
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Get Transcript & AI Summary (15-20 seconds)
const TranscriptReady: React.FC = () => {
  const frame = useCurrentFrame();

  const headerOpacity = useFadeIn(0);
  const cardScale = spring({
    frame: frame - 15,
    fps: 30,
    config: { damping: 12, stiffness: 80 },
  });

  const summaryOpacity = useFadeIn(30);

  // Key points animation
  const points = [
    "Q2 roadmap priorities discussed",
    "3 action items assigned",
    "Decision: Launch beta by June 15",
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.lightGray,
        padding: 80,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: BRAND.charcoal,
          marginBottom: 40,
          opacity: headerOpacity,
        }}
      >
        Meeting Complete
      </div>

      <div
        style={{
          display: "flex",
          gap: 40,
          transform: `scale(${cardScale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Transcript Card */}
        <div
          style={{
            flex: 1,
            backgroundColor: BRAND.white,
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: BRAND.charcoal,
              marginBottom: 20,
            }}
          >
            Full Transcript
          </div>
          <div style={{ fontSize: 18, color: BRAND.charcoal, opacity: 0.7, lineHeight: 1.6 }}>
            Speaker 1: Let's discuss the Q2 roadmap priorities...<br/>
            Speaker 2: I think we should focus on the AI features first...<br/>
            Speaker 1: Agreed, let's assign action items...
          </div>
        </div>

        {/* AI Summary Card */}
        <div
          style={{
            flex: 1,
            backgroundColor: BRAND.white,
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
            borderLeft: `4px solid ${BRAND.blue}`,
            opacity: summaryOpacity,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: BRAND.blue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: BRAND.white,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              AI
            </div>
            <span style={{ fontSize: 24, fontWeight: 600, color: BRAND.charcoal }}>
              AI Summary
            </span>
          </div>

          {points.map((point, i) => {
            const pointOpacity = useFadeIn(45 + i * 10);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  opacity: pointOpacity,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: BRAND.teal,
                  }}
                />
                <span style={{ fontSize: 18, color: BRAND.charcoal }}>{point}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 6: Call to Action (20-25 seconds)
const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 10, stiffness: 60 },
  });

  const buttonScale = spring({
    frame: frame - 20,
    fps: 30,
    config: { damping: 8, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.teal} 100%)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ transform: `scale(${scale})` }}>
        <Logo size={100} showWordmark={true} />
      </div>

      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: BRAND.white,
          textAlign: "center",
          opacity: useFadeIn(15),
        }}
      >
        Focus on the conversation.<br />
        We'll handle the notes.
      </div>

      <div
        style={{
          backgroundColor: BRAND.white,
          color: BRAND.blue,
          padding: "20px 48px",
          borderRadius: 12,
          fontSize: 28,
          fontWeight: 600,
          transform: `scale(${buttonScale})`,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        }}
      >
        Start Free Trial
      </div>
    </AbsoluteFill>
  );
};

// Main Demo Video Composition
export const DemoVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.white, fontFamily: FONT_FAMILY }}>
      {/* Scene 1: Logo Intro - 0-2 seconds */}
      <Sequence from={0} durationInFrames={60}>
        <LogoIntro />
      </Sequence>

      {/* Scene 2: Problem - 2-5 seconds */}
      <Sequence from={60} durationInFrames={90}>
        <ProblemStatement />
      </Sequence>

      {/* Scene 3: Join Meeting - 5-10 seconds */}
      <Sequence from={150} durationInFrames={150}>
        <JoinMeeting />
      </Sequence>

      {/* Scene 4: Bot Records - 10-15 seconds */}
      <Sequence from={300} durationInFrames={150}>
        <BotRecords />
      </Sequence>

      {/* Scene 5: Transcript Ready - 15-20 seconds */}
      <Sequence from={450} durationInFrames={150}>
        <TranscriptReady />
      </Sequence>

      {/* Scene 6: CTA - 20-25 seconds */}
      <Sequence from={600} durationInFrames={150}>
        <CallToAction />
      </Sequence>
    </AbsoluteFill>
  );
};