import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { COLORS } from "./theme";
import {
  SceneOpening,
  SceneBeauty,
  SceneKitchen,
  SceneValue,
  SceneCTA,
} from "./scenes";
import { Grain } from "./grain";

const T = 18; // 트랜지션 길이(프레임)

// 씬별 내레이션 배치 (절대 프레임). 측정된 길이에 맞춰 씬 안에 들어가도록 배치.
const VO = [
  { src: "audio/vo-1.wav", from: 18 },
  { src: "audio/vo-2.wav", from: 162 },
  { src: "audio/vo-3.wav", from: 342 },
  { src: "audio/vo-4.wav", from: 520 },
  { src: "audio/vo-5.wav", from: 705 },
];

export const LeBienPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={168}>
          <SceneOpening />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: T })} presentation={fade()} />

        <TransitionSeries.Sequence durationInFrames={198}>
          <SceneBeauty />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: T })} presentation={fade()} />

        <TransitionSeries.Sequence durationInFrames={198}>
          <SceneKitchen />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: T })} presentation={fade()} />

        <TransitionSeries.Sequence durationInFrames={198}>
          <SceneValue />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: T })} presentation={fade()} />

        <TransitionSeries.Sequence durationInFrames={210}>
          <SceneCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* 필름 그레인 — 전체에 은은하게 */}
      <Grain />

      {/* 배경음악 — 페이드 인/아웃, 내레이션이 묻히지 않게 낮은 볼륨 */}
      <Audio
        src={staticFile("audio/music.m4a")}
        volume={(f) =>
          interpolate(f, [0, 30, 690, 870, 900], [0, 0.22, 0.22, 0.18, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {/* 씬별 한국어 내레이션 (Yoona) */}
      {VO.map((v) => (
        <Sequence key={v.src} from={v.from}>
          <Audio src={staticFile(v.src)} volume={1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
