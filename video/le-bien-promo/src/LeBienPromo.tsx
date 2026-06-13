import React from "react";
import { AbsoluteFill } from "remotion";
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
    </AbsoluteFill>
  );
};
