import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/** 매 프레임 시드를 바꿔 실시간 필름 그레인을 만든다 (아주 은은하게) */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 12;
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="lb-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={seed}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#lb-grain)" />
      </svg>
    </AbsoluteFill>
  );
};
