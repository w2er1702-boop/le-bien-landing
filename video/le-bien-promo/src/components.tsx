import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { COLORS } from "./theme";

/** 전체 화면 배경 AI 영상 — 살짝 줌(Ken Burns) + 스크림 오버레이 */
export const BgVideo: React.FC<{
  src: string;
  /** 5초 클립을 컷 길이에 맞춰 늘려 더 느리고 고급스럽게 */
  playbackRate?: number;
  /** 켄번스 줌 방향 */
  zoom?: "in" | "out";
  scrim?: string;
  startFrom?: number;
}> = ({ src, playbackRate = 0.85, zoom = "in", scrim, startFrom = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], zoom === "in" ? [1.04, 1.14] : [1.14, 1.04], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <OffthreadVideo
          src={staticFile(src)}
          playbackRate={playbackRate}
          startFrom={startFrom}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {scrim ? <AbsoluteFill style={{ background: scrim }} /> : null}
    </AbsoluteFill>
  );
};

/** 아래에서 위로 페이드인 — delay(프레임) 단위로 순차 등장 */
export const FadeUp: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 28, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 28 });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const ty = interpolate(s, [0, 1], [y, 0]);
  return <div style={{ opacity, transform: `translateY(${ty}px)`, ...style }}>{children}</div>;
};

/** 글자 단위 등장 워드마크 (Le Bien 같은 짧은 텍스트용) */
export const RevealText: React.FC<{
  text: string;
  delay?: number;
  perChar?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, perChar = 3, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "inline-flex", ...style }}>
      {text.split("").map((ch, i) => {
        const s = spring({
          frame: frame - delay - i * perChar,
          fps,
          config: { damping: 200 },
          durationInFrames: 24,
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
              whiteSpace: "pre",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** 가운데서 양옆으로 그려지는 금색 라인 */
export const GoldRule: React.FC<{ delay?: number; width?: number }> = ({
  delay = 0,
  width = 220,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 30 });
  return (
    <div
      style={{
        width: interpolate(s, [0, 1], [0, width]),
        height: 2,
        background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
        opacity: s,
      }}
    />
  );
};

/** 작은 라벨(KICKER) — 자간 넓은 골드 캡션 */
export const Kicker: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      color: COLORS.gold,
      letterSpacing: 8,
      fontSize: 22,
      fontWeight: 500,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);
