# 르비엔 Le Bien — 종합쇼핑몰 랜딩 페이지

뷰티 · 건강기능식품 · 생활용품 · 주방용품을 다루는 종합쇼핑몰 **르비엔(Le Bien)** 의 브랜드 랜딩 페이지입니다.
Vanilla HTML5 + CSS3 + JavaScript(ES6+)로만 작성된 정적 사이트이며, GitHub Pages로 배포해 사용합니다. 실제 구매는 향후 식스샵 스토어에서 처리하므로 현재 모든 상품·카테고리 링크는 `#` 자리표시자입니다.

---

## 📁 폴더 구조

```
le-bien-landing/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── data/
│   └── products.json       # 20개 상품 (카테고리당 5개)
├── assets/
│   └── og-image.svg        # 카카오톡 공유 미리보기용 1200x630
└── README.md
```

---

## 🖥 로컬 실행 방법

외부 의존성이 폰트 CDN뿐이므로 어떤 정적 서버에서든 실행됩니다. `index.html`을 직접 더블클릭해 `file://`로 열면 `fetch('./data/products.json')`이 CORS로 막히므로 **반드시 로컬 서버로** 띄우세요.

### 방법 1. Python (가장 간편)

```bash
cd le-bien-landing
python -m http.server 8000
```

브라우저에서 [http://localhost:8000](http://localhost:8000) 접속.

### 방법 2. Node (npx)

```bash
npx serve .
```

### 방법 3. VS Code Live Server

1. VS Code에서 `le-bien-landing` 폴더 열기
2. 확장 마켓에서 **Live Server** (Ritwick Dey) 설치
3. `index.html` 우클릭 → **Open with Live Server**

---

## 🚀 GitHub Pages 배포 절차

1. **공개 저장소 생성** — GitHub에서 `le-bien-landing` 같은 이름으로 **Public** 저장소를 만듭니다.
2. **파일 push**

   ```bash
   cd le-bien-landing
   git init
   git add .
   git commit -m "Initial commit: Le Bien landing"
   git branch -M main
   git remote add origin https://github.com/w2er1702-boop/le-bien-landing.git
   git push -u origin main
   ```

3. **Pages 활성화** — 저장소 페이지 상단의 **Settings → Pages**로 이동
4. **Source** 섹션에서

   - **Branch:** `main`
   - **Folder:** `/ (root)`

   선택 후 **Save**
5. 1~2분 뒤 같은 페이지 상단에 발급되는 URL을 확인합니다. 보통 형식은
   `https://w2er1702-boop.github.io/le-bien-landing/`

### 배포 후 반드시 교체할 자리표시자

`index.html`의 OG 메타에 들어있는 URL을 실제 값으로 바꿔주세요.

```html
<meta property="og:url" content="https://w2er1702-boop.github.io/le-bien-landing/">
```

→

```html
<meta property="og:url" content="https://your-id.github.io/le-bien-landing/">
```

---

## 💬 카카오톡 공유 미리보기 디버깅

처음 한 번 공유한 OG 정보는 카카오 서버에 캐싱됩니다. 메타태그를 수정한 뒤에도 미리보기가 갱신되지 않는다면 **카카오 디벨로퍼스 캐시 초기화 도구**를 사용하세요.

1. 카카오 디벨로퍼스 캐시 초기화 페이지로 이동
   👉 [https://developers.kakao.com/tool/clear/og](https://developers.kakao.com/tool/clear/og)
2. 배포된 사이트 URL(예: `https://your-id.github.io/le-bien-landing/`) 입력 후 **초기화**
3. 카카오톡에서 친구·나에게 보내기로 다시 공유해 미리보기 갱신 확인

### OG 이미지가 깨져 보일 때 체크리스트

- [ ] `og:image` URL이 **절대 경로(https://...)** 인지 (상대경로는 일부 메신저에서 인식 못함 — 배포 후 절대 URL 권장)
- [ ] 이미지가 **공개적으로 접근 가능**한지 (private 저장소 X)
- [ ] 사이즈 **1200×630 권장** (현재 `assets/og-image.svg`가 이 사이즈)
- [ ] HTTPS인지 (GitHub Pages는 자동 HTTPS)

> 일부 메신저는 SVG OG 이미지를 지원하지 않을 수 있습니다. 그럴 경우 동일 디자인을 PNG로 익스포트해 `og-image.png`로 저장한 뒤 `og:image` 경로만 바꿔주면 됩니다.

---

## 🛒 식스샵 스토어 연결 시 작업

쇼핑몰이 정식 오픈되면 아래 두 군데의 `#`을 실제 URL로 교체하세요.

### 1. `data/products.json` — 상품별 링크

```diff
- "link": "#"
+ "link": "https://lebien.sixshop.com/product/lb-b-001"
```

### 2. `index.html` — 카테고리 nav, 퀵카테고리, "전체보기", CTA 버튼

다음 위치의 `href="#"`을 실제 카테고리/기획전 URL로 교체:

- `.catnav__list` 4개 (`뷰티`/`건강기능식품`/`생활용품`/`주방용품`)
- `.quickcat__card` 4개
- `.hero__slide` 안의 CTA 버튼 4개
- `.section-head__more` (MD's Pick 전체보기)
- `.story` 안의 "브랜드 이야기" 버튼
- 헤더의 `로그인`/`회원가입`/`장바구니`

### 3. (선택) 기능 확장 시 손볼 곳

- **검색**: 현재 `#searchInput`은 UI만 있고 submit이 막혀 있습니다 (`onsubmit="event.preventDefault();"`). 식스샵 검색 결과 페이지로 연동하려면 form의 `action`을 그쪽 URL로 변경하고 input의 `name`을 식스샵 검색 파라미터에 맞추세요.
- **장바구니 뱃지**: `.cart__badge`는 정적 `0`입니다. 카운트를 실데이터로 채우려면 식스샵 측 세션·쿠키 연동이 필요합니다.

---

## ✅ 검수 체크리스트

배포 직후 다음을 확인하세요.

- [ ] 320px · 375px · 768px · 1024px · 1440px 폭에서 레이아웃 깨짐 없음
- [ ] 히어로 캐러셀이 5초 간격으로 자동 롤링되고, 화살표/도트 조작 시 7초간 정지 후 재개
- [ ] MD's Pick 8개 상품이 정상 노출 (카테고리 골고루 섞여서)
- [ ] 일부 이미지 URL을 의도적으로 망가뜨려도 SVG 폴백이 표시됨 (`window.__fallbackImg`)
- [ ] 모든 링크 `#` — 클릭해도 콘솔 오류 없음
- [ ] 카카오톡 공유 시 OG 이미지·타이틀·디스크립션이 정상 노출
- [ ] Tab 키만으로 헤더 → 카테고리 → 히어로 화살표 → 카드 → 푸터까지 이동 가능, 포커스 골드 outline 보임
- [ ] Lighthouse Performance 90+ / Accessibility 95+

---

## 🎨 디자인 토큰

추후 디자인 수정 시 `css/style.css` 상단의 `:root` 변수만 바꾸면 전체에 반영됩니다.

| 토큰                  | 값         | 용도                       |
|-----------------------|------------|----------------------------|
| `--color-primary`     | `#0A2540`  | 딥 네이비 — 텍스트/푸터/배지 |
| `--color-accent`      | `#C9A961`  | 골드 — 로고·CTA·강조       |
| `--color-bg`          | `#FFFFFF`  | 메인 배경                  |
| `--color-bg-soft`     | `#F8F9FB`  | 보조 배경/검색바           |
| `--color-text`        | `#1A1A1A`  | 본문                       |
| `--color-text-sub`    | `#5F6B7A`  | 보조 텍스트                |
| `--color-border`      | `#E5E7EB`  | 라인                       |
| `--color-hot`         | `#E32227`  | 할인율 · HOT 배지          |

---

## 📜 라이선스

본 코드는 르비엔(Le Bien) 브랜드의 랜딩 페이지로 작성되었습니다.
이미지(`picsum.photos`)는 데모용 placeholder이며, 실제 운영 시 자체 촬영 컷으로 교체하세요.

© 2026 Le Bien.
