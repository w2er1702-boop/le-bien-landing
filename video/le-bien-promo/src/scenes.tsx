import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, SCRIM, SCRIM_CENTER } from "./theme";
import { BgVideo, FadeUp, RevealText, GoldRule, Kicker } from "./components";
import { playfair, notoKR } from "./fonts";

const padX = 150;

/** 1. 브랜드 오프닝 — 골드 실크 */
export const SceneOpening: React.FC = () => (
  <AbsoluteFill>
    <BgVideo src="scenes/01-opening.mp4" playbackRate={0.82} zoom="in" scrim={SCRIM} />
    <AbsoluteFill
      style={{
        justifyContent: "center",
        paddingLeft: padX,
        fontFamily: notoKR,
      }}
    >
      <FadeUp delay={6}>
        <Kicker>Premium Select Shop</Kicker>
      </FadeUp>
      <div style={{ height: 18 }} />
      <RevealText
        text="Le Bien"
        delay={18}
        perChar={4}
        style={{
          fontFamily: playfair,
          fontSize: 150,
          fontWeight: 600,
          color: COLORS.goldLight,
          lineHeight: 1,
        }}
      />
      <div style={{ height: 10 }} />
      <FadeUp delay={46}>
        <div style={{ fontSize: 40, fontWeight: 500, color: COLORS.white, letterSpacing: 14 }}>
          르 비 엔
        </div>
      </FadeUp>
      <div style={{ height: 28 }} />
      <FadeUp delay={58}>
        <div style={{ fontSize: 34, color: COLORS.textSub, fontWeight: 300 }}>
          당신의 일상에 좋은 것을
        </div>
      </FadeUp>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** 카테고리 컷 공통 레이아웃 */
const CategoryScene: React.FC<{
  src: string;
  align: "left" | "right";
  kicker: string;
  title: string;
  sub: string;
  playbackRate: number;
}> = ({ src, align, kicker, title, sub, playbackRate }) => {
  const scrim =
    align === "left"
      ? SCRIM
      : "linear-gradient(270deg, rgba(6,24,43,0.92) 0%, rgba(6,24,43,0.5) 45%, rgba(6,24,43,0.12) 100%)";
  return (
    <AbsoluteFill>
      <BgVideo src={src} playbackRate={playbackRate} zoom="in" scrim={scrim} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: align === "left" ? "flex-start" : "flex-end",
          padding: `0 ${padX}px`,
          textAlign: align,
          fontFamily: notoKR,
        }}
      >
        <FadeUp delay={6}>
          <Kicker>{kicker}</Kicker>
        </FadeUp>
        <div style={{ height: 22 }} />
        <FadeUp delay={16}>
          <div
            style={{
              fontFamily: notoKR,
              fontSize: 78,
              fontWeight: 700,
              color: COLORS.white,
              lineHeight: 1.12,
              letterSpacing: -1,
            }}
          >
            {title}
          </div>
        </FadeUp>
        <div style={{ height: 26, display: "flex", justifyContent: align === "right" ? "flex-end" : "flex-start", width: "100%" }}>
          <GoldRule delay={30} width={180} />
        </div>
        <FadeUp delay={40}>
          <div style={{ fontSize: 32, color: COLORS.textSub, fontWeight: 300 }}>{sub}</div>
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 2. 뷰티 · 건강기능식품 */
export const SceneBeauty: React.FC = () => (
  <CategoryScene
    src="scenes/02-beauty.mp4"
    align="right"
    kicker="Beauty · Health"
    title={"뷰티 · 건강기능식품"}
    sub="검증된 성분, 엄선된 브랜드"
    playbackRate={0.72}
  />
);

/** 3. 생활용품 · 주방용품 */
export const SceneKitchen: React.FC = () => (
  <CategoryScene
    src="scenes/03-kitchen.mp4"
    align="left"
    kicker="Living · Kitchen"
    title={"생활용품 · 주방용품"}
    sub="매일을 더 단정하게"
    playbackRate={0.72}
  />
);

/** 4. 가치 제안 — 3가지 약속 */
export const SceneValue: React.FC = () => {
  const pillars = [
    { en: "Curated", ko: "엄선된 셀렉션" },
    { en: "Members", ko: "회원 전용 혜택" },
    { en: "Fair Price", ko: "합리적인 가격" },
  ];
  return (
    <AbsoluteFill>
      <BgVideo src="scenes/04-texture.mp4" playbackRate={0.72} zoom="out" scrim={SCRIM_CENTER} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: notoKR }}>
        <FadeUp delay={6}>
          <Kicker style={{ textAlign: "center" }}>Why Le Bien</Kicker>
        </FadeUp>
        <div style={{ height: 46 }} />
        <div style={{ display: "flex", gap: 80, alignItems: "flex-start" }}>
          {pillars.map((p, i) => (
            <FadeUp key={p.en} delay={20 + i * 12} style={{ textAlign: "center", width: 320 }}>
              <div
                style={{
                  fontFamily: playfair,
                  fontSize: 30,
                  fontWeight: 600,
                  color: COLORS.gold,
                  fontStyle: "italic",
                  marginBottom: 18,
                }}
              >
                {`0${i + 1}`}
              </div>
              <div style={{ fontSize: 44, fontWeight: 700, color: COLORS.white }}>{p.ko}</div>
              <div style={{ height: 14 }} />
              <div style={{ fontSize: 22, letterSpacing: 4, color: COLORS.textSub }}>
                {p.en.toUpperCase()}
              </div>
            </FadeUp>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 5. CTA */
export const SceneCTA: React.FC = () => (
  <AbsoluteFill>
    <BgVideo src="scenes/01-opening.mp4" playbackRate={0.7} zoom="out" scrim={SCRIM_CENTER} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: notoKR }}>
      <RevealText
        text="Le Bien"
        delay={6}
        perChar={4}
        style={{ fontFamily: playfair, fontSize: 120, fontWeight: 600, color: COLORS.goldLight }}
      />
      <div style={{ height: 24 }} />
      <FadeUp delay={34}>
        <GoldRule delay={34} width={260} />
      </FadeUp>
      <div style={{ height: 30 }} />
      <FadeUp delay={42}>
        <div style={{ fontSize: 38, color: COLORS.white, fontWeight: 300, letterSpacing: 2 }}>
          당신의 일상에 좋은 것을
        </div>
      </FadeUp>
      <div style={{ height: 50 }} />
      <FadeUp delay={56}>
        <div
          style={{
            fontSize: 30,
            color: COLORS.gold,
            letterSpacing: 6,
            fontWeight: 500,
            border: `1px solid ${COLORS.gold}`,
            padding: "16px 40px",
            borderRadius: 4,
          }}
        >
          lebien.kr
        </div>
      </FadeUp>
    </AbsoluteFill>
  </AbsoluteFill>
);
