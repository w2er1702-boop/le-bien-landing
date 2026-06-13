# 르비엔 Le Bien — 30초 브랜드 홍보영상

AI로 생성한 무드 배경 영상 위에 [Remotion](https://www.remotion.dev/)으로 브랜드 텍스트·로고·트랜지션을 입혀 코드로 렌더링하는 30초(16:9, 1080p) 홍보영상입니다.

최종 결과물: [`le-bien-promo.mp4`](./le-bien-promo.mp4)

## 구성 (30초 / 900프레임 @ 30fps)

| 구간 | 장면 | 배경 영상 |
|------|------|-----------|
| 0–5.6s | 브랜드 오프닝 — `Le Bien` 워드마크 + "당신의 일상에 좋은 것을" | 골드 실크 |
| 5.6–12s | 뷰티 · 건강기능식품 | 코스메틱 플랫레이 |
| 12–18s | 생활용품 · 주방용품 | 키친 라이프스타일 |
| 18–24s | Why Le Bien — 엄선된 셀렉션 / 회원 전용 혜택 / 합리적인 가격 | 골드 보케 |
| 24–30s | CTA — `Le Bien` + `lebien.kr` | 골드 실크 |

브랜드 컬러(딥네이비 `#0A2540`, 골드 `#C9A961`)와 세리프 워드마크는 `css/style.css`의 디자인 토큰을 그대로 따랐습니다.

## 에셋 출처

- `public/scenes/0X-*.png` — AI 이미지 생성(nano_banana)으로 만든 브랜드 무드 컷
- `public/scenes/0X-*.mp4` — 위 이미지를 image-to-video(Kling 3.0)로 5초 애니메이션한 배경 클립
- `public/audio/music.m4a` — AI 생성(Sonilo) 인스트루멘털 배경음악 30초
- `public/audio/vo-1~5.wav` — AI 생성(Inworld TTS, `Yoona (ko)`) 씬별 한국어 내레이션
- `public/fonts/*.woff2` — Playfair Display(영문) · Noto Sans KR(국문). 렌더 환경의 폰트 CDN 차단을 피하려고 로컬 번들로 포함

오디오 합성은 `src/LeBienPromo.tsx`에서 처리합니다. 배경음악은 볼륨 페이드 인/아웃(0.18~0.22), 내레이션은 측정된 길이에 맞춰 씬별 절대 프레임에 배치했습니다.

## 사용법

```bash
npm install

# 미리보기 스튜디오 (브라우저에서 실시간 편집)
npm start

# mp4 렌더링 → out/le-bien-promo.mp4
npm run render
```

## 수정 포인트

- 문구·타이밍: `src/scenes.tsx`, `src/LeBienPromo.tsx`
- 색상·폰트: `src/theme.ts`, `src/fonts.ts`
- 배경 교체: `public/scenes/`의 mp4 파일만 바꾸면 됨
- 세로(9:16 숏폼) 버전이 필요하면 `src/Root.tsx`에 1080×1920 컴포지션을 추가하면 됩니다.

> 참고: CTA의 `lebien.kr`은 푸터 이메일(`cs@lebien.kr`) 기준 브랜드 도메인입니다. 실제 배포 주소(`w2er1702-boop.github.io/le-bien-landing`)로 바꾸려면 `src/scenes.tsx`의 `SceneCTA`를 수정하세요.
