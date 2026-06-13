import React from "react";
import { Composition } from "remotion";
import { LeBienPromo } from "./LeBienPromo";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LeBienPromo"
      component={LeBienPromo}
      durationInFrames={900} // 30초 @ 30fps
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
