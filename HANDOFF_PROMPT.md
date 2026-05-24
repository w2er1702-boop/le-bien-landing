# 르비엔(Le Bien) 쇼핑몰 — 전체 페이지 구축 핸드오프 프롬프트

> 이 문서 전체를 새 Claude Code 채팅에 복사해 붙여넣으세요. 그것만으로 작업이 그대로 이어집니다.

---

## 📌 작업 지시

이전 세션에서 르비엔(Le Bien) 종합쇼핑몰의 **랜딩 페이지**를 완성하고 GitHub Pages에 배포했습니다. 이번 작업의 목표는 **랜딩 페이지의 모든 `#` 자리표시자 링크에 실제 페이지를 붙여서 한 채의 사이트로 완성하는 것**입니다. 68개의 `#` 링크를 페이지 14~18개로 정리해서 만들어주세요 (자세한 인벤토리는 아래).

---

## 1. 현재 상태 (절대 깨뜨리지 말 것)

### 배포된 사이트
- **라이브 URL**: https://w2er1702-boop.github.io/le-bien-landing/
- **GitHub 저장소**: https://github.com/w2er1702-boop/le-bien-landing
- **로컬 경로**: `C:\Users\Windows10\Desktop\AI연습용\le-bien-landing\`

### 완성되어 있는 파일들 (수정 시 신중하게)
```
le-bien-landing/
├── index.html              # 메인 랜딩 (코스트코식 구조, 9개 섹션)
├── css/style.css           # 디자인 시스템 + 모든 컴포넌트 (모바일 우선)
├── js/main.js              # 캐러셀·카운트다운·상품 fetch·푸터 아코디언
├── data/products.json      # 20개 상품 (4 카테고리 × 5)
├── assets/og-image.svg     # 카카오 공유용 1200×630
├── README.md               # 배포·실행·디버깅 안내
├── .gitignore
└── .claude/launch.json     # 로컬 개발 서버 설정 (npx http-server)
```

### 기술 스택 (변경 금지)
- **Vanilla HTML5 + CSS3 + JavaScript(ES6+)**
- **프레임워크·번들러 사용 금지** — 외부 의존은 Pretendard·Playfair Display CDN 폰트만
- **GitHub Pages 정적 호스팅** — 서버사이드 코드 불가
- 데이터는 JSON 파일 fetch로 처리
- 로컬 서버: `npx --yes http-server . -p 8765 -c-1 --silent` (이미 `.claude/launch.json`에 설정됨)

### 디자인 시스템 (CSS 변수)
```css
--color-primary: #0A2540;      /* 딥 네이비 */
--color-primary-deep: #06182B;
--color-accent: #C9A961;       /* 골드 */
--color-accent-soft: #E5C880;
--color-bg: #FFFFFF;
--color-bg-soft: #F4F6F9;
--color-text: #1A1A1A;
--color-text-sub: #5F6B7A;
--color-border: #E5E7EB;
--color-hot: #E32227;          /* 할인·HOT */
--radius: 6px;
--container: 1280px;
```
- **폰트**: 한글 본문 Pretendard, 영문 로고/헤드라인 Playfair Display
- **브레이크포인트**: 640px / 1024px / 1280px (모바일 우선)
- **톤**: 코스트코식 정보 밀도 + 르비엔의 프리미엄 셀렉트샵 (딥네이비+골드)

### 재사용 가능한 기존 컴포넌트 (이미 CSS에 정의됨)
- `.pcard` 상품 카드 (이미지·배지·할인스티커·회원가칩·별점)
- `.chip` / `.btn` / `.btn--gold` / `.btn--gold-outline` / `.btn--gold-lg`
- `.section-head` (좌측 타이틀+서브, 우측 전체보기)
- `.product-grid` / `.product-grid--4` / `.product-grid--5`
- `.promo-card--navy` / `.promo-card--cream`
- `.countdown` (마감 타이머)
- 헤더 / 푸터 / 카테고리 nav / 모바일 메뉴 / floating top button

---

## 2. 만들어야 할 페이지 인벤토리

### Group A — 카테고리·상품 (사용 빈도 최상, 먼저)

| 페이지 | 경로 | 비고 |
|---|---|---|
| 1. 카테고리 — 뷰티 | `/category/beauty.html` | products.json에서 category=beauty 필터 |
| 2. 카테고리 — 건강기능식품 | `/category/health.html` | category=health |
| 3. 카테고리 — 생활용품 | `/category/living.html` | category=living |
| 4. 카테고리 — 주방용품 | `/category/kitchen.html` | category=kitchen |
| 5. 카테고리 — 식품·베이커리 | `/category/food.html` | 빈 카테고리 → "준비중" placeholder + 알림신청 폼 |
| 6. 카테고리 — 패션·잡화 | `/category/fashion.html` | 빈 카테고리 → "준비중" |
| 7. 기획전 — 핫딜 | `/event/hot.html` | discountRate ≥ 40 또는 tags has '핫딜' |
| 8. 기획전 — 온라인 단독 | `/event/online.html` | tags has '온라인단독' |
| 9. 기획전 — 멤버스 PICK | `/event/members.html` | 전체 카테고리 추천 8개 |
| 10. 기획전 — 신상품 | `/event/new.html` | tags has 'NEW' |
| 11. 브랜드관 | `/brand.html` | 브랜드별 카드 그리드 (Le Bien · 메종 르비엔 · 정관장 협력관 등) |
| 12. 기획전 허브 | `/events.html` | 진행 중인 모든 기획전 목록 |
| 13. 상품 상세 | `/product/{id}.html` × 20 | id=lb-b-001 형식. **템플릿 하나로 처리하고 JS로 데이터 주입 가능** |
| 14. 검색 결과 | `/search.html?q=...` | products.json에서 brand/name/categoryLabel 검색 |

> 💡 **상품 상세 20개를 일일이 HTML로 만들지 말 것**: `/product.html?id=lb-b-001` 형태로 단일 템플릿 + querystring으로 처리하세요. 단, GitHub Pages SEO/공유성을 위해 빌드 스크립트 없이 가능한 한 정적 URL이 좋다면 — 그땐 `product/lb-b-001.html` 처럼 빈 셸 파일 20개를 만들고 같은 JS로 데이터를 채워도 됩니다. 둘 다 동등하니 단순한 쪽을 택하세요.

### Group B — 회원·계정 (필수)

| 페이지 | 경로 | 비고 |
|---|---|---|
| 15. 로그인 | `/account/login.html` | 폼 UI만 (이메일·비밀번호·자동로그인·SNS 로그인 버튼) |
| 16. 회원가입 | `/account/signup.html` | 약관동의·이메일인증·기본정보·마케팅수신 4단계 stepper |
| 17. 마이페이지 | `/account/mypage.html` | 주문내역·쿠폰·포인트·1:1문의 등 대시보드 카드 |
| 18. 주문조회 | `/account/orders.html` | 비회원/회원 둘 다 가능 |
| 19. 위시리스트 | `/account/wishlist.html` | localStorage 연동, 빈 상태 일러스트 포함 |
| 20. 장바구니 | `/account/cart.html` | localStorage 연동, 합계·할인·배송비 계산 |
| 21. 멤버십 안내 | `/membership.html` | 혜택·등급·가입 CTA |

### Group C — 이용안내·약관 (정적 콘텐츠)

| 페이지 | 경로 |
|---|---|
| 22. 이용약관 | `/help/terms.html` |
| 23. 개인정보처리방침 | `/help/privacy.html` |
| 24. 청약철회 및 환불정책 | `/help/refund.html` |
| 25. 자주묻는질문(FAQ) | `/help/faq.html` |
| 26. 배송 안내 | `/help/shipping.html` |
| 27. 반품·교환 안내 | `/help/returns.html` |

> 약관 본문은 표준 한국 전자상거래 약관 템플릿을 사용하되, 사업자명/연락처는 `[더미]` 로 표기 (현재 README와 일관).

### Group D — 고객지원

| 페이지 | 경로 | 비고 |
|---|---|---|
| 28. 공지사항 목록 | `/support/notices.html` | data/notices.json 필요 (5~10개 더미) |
| 29. 공지사항 상세 | `/support/notice.html?id=N` | 단일 템플릿 |
| 30. 1:1 문의 | `/support/inquiry.html` | 폼 UI만 |
| 31. 상품 Q&A | `/support/qna.html` | 게시판형 목록 |
| 32. 제휴·입점 문의 | `/support/partnership.html` | 폼 (회사명·담당자·이메일·상품군·내용) |
| 33. 사업자 회원 안내 | `/support/business.html` | 혜택 안내 + 신청 폼 |
| 34. 대량주문 안내 | `/support/bulk.html` | 견적 요청 폼 |
| 35. 고객센터 | `/support/center.html` | 전화·이메일·운영시간 + FAQ 링크 |
| 36. 매장찾기 | `/support/stores.html` | 지점 목록 카드 (현재는 온라인 전용임을 명시 + 협업 매장 0~3개) |

### Group E — 브랜드·기타

| 페이지 | 경로 | 비고 |
|---|---|---|
| 37. 브랜드 스토리 | `/about.html` | 르비엔 — 좋은 것만 모으다, 셀렉션 기준, 팀, 연혁 |
| 38. 404 페이지 | `/404.html` | GitHub Pages는 `/404.html` 자동 인식 |

### Group F — 외부 링크 (페이지 만들지 말 것)

- 인스타그램, 카카오채널, 유튜브, 네이버 블로그 → 실제 SNS URL이 생기면 그때 교체
- App Store / Google Play → 앱이 없으므로 당분간 비활성화(`aria-disabled`) 또는 "준비중" 알림 페이지로

---

## 3. 추천 구현 전략

### 3-1. 공통 헤더/푸터 — JS 인클루드 패턴
중복을 줄이기 위해, 헤더·푸터·카테고리 nav를 별도 파일로 분리:

```
/partials/
  ├── header.html
  ├── footer.html
  └── mobile-menu.html
```

각 페이지에서:
```html
<div data-include="/partials/header.html"></div>
<main>...</main>
<div data-include="/partials/footer.html"></div>
<script src="/js/includes.js"></script>
<script src="/js/main.js"></script>
```

`js/includes.js`는 ~20줄 짜리 fetch + innerHTML 주입 로직. main.js 초기화 전에 끝나도록 await로 동기화.

> 주의: GitHub Pages 절대 경로(`/partials/...`)는 `https://w2er1702-boop.github.io/le-bien-landing/`가 base라서 안 통합니다. **상대경로(`./partials/header.html` 또는 `../partials/...`) 또는 `<base>` 태그 사용**으로 처리하세요. `<base href="/le-bien-landing/">`을 추천.

### 3-2. 데이터 파일 확장

```
data/
├── products.json     # 기존
├── categories.json   # 카테고리 메타 (이름·서브타이틀·배너이미지·SEO)
├── brands.json       # 브랜드관용
├── notices.json      # 공지사항 더미 데이터
├── faqs.json         # FAQ Q&A 페어
├── reviews.json      # 상품 상세 리뷰 (선택)
└── events.json       # 진행 중 기획전 메타
```

### 3-3. 페이지 템플릿 (4개로 모두 커버)

1. **`listing.html`** — 카테고리·기획전·검색결과 공용. URL/data 속성으로 필터 결정.
2. **`product.html`** — 상품 상세 (이미지 갤러리, 옵션, 가격박스, 탭으로 상세설명/리뷰/배송/Q&A)
3. **`form.html`** — 로그인/회원가입/문의/제휴/대량주문 공용 폼 컨테이너 (필드만 다름)
4. **`article.html`** — 약관/공지/안내문 등 정적 콘텐츠 공용

이 4개로 위 38개 페이지를 다 만들 수 있습니다. 차이는 데이터/필드/콘텐츠뿐.

### 3-4. 상태 관리 — localStorage

- 장바구니: `lb_cart` (배열: `[{id, qty}]`)
- 위시리스트: `lb_wishlist` (배열: `[id]`)
- 최근 본 상품: `lb_recent` (LRU 10개)
- 로그인 상태: `lb_user` (mock — 닉네임만 저장하는 더미)

장바구니 뱃지(`.cart__badge`)는 localStorage 변경 감지해서 헤더에서 자동 업데이트.

### 3-5. 라우팅 — 기본만, SPA 금지

GitHub Pages는 SPA 라우팅이 까다로우니 **각 페이지가 실제 HTML 파일**이 되도록 유지. 단, 상품 상세는 querystring(`?id=lb-b-001`)이 가장 간단.

---

## 4. 빌드 순서 (권장)

이 순서로 만들면 의존성이 자연스럽게 풀립니다.

1. **공통 인프라**: `partials/header.html`, `partials/footer.html`, `js/includes.js`, `js/state.js`(localStorage), 그리고 기존 `index.html`을 partials 사용 형태로 리팩토링
2. **`listing.html` 템플릿**: 4개 카테고리(뷰티/건기식/생활/주방) + 4개 기획전(핫딜/온라인단독/멤버스/신상품) → 8 페이지가 한 번에 풀림
3. **`product.html` 템플릿**: 20개 상품 상세 + 최근 본 / 함께 산 상품 추천 슬롯
4. **`cart.html` + `wishlist.html`**: localStorage 기반, 비어있을 때 일러스트
5. **`account/login.html` + `account/signup.html`**: 폼 + 클라이언트 검증
6. **`mypage.html` + `orders.html`**: 로그인 더미 상태에서 보이는 대시보드
7. **약관·정책 6종**: `article.html` 템플릿으로 콘텐츠만 다름
8. **고객지원 9종**: 문의 폼들 + notices/qna 목록
9. **브랜드 스토리·멤버십·매장찾기·검색결과·기획전 허브·404**
10. **마지막**: 빈 카테고리(식품/패션) 페이지, 알림신청 폼

각 단계가 끝날 때마다 **`index.html`의 해당 `#` 링크를 실제 경로로 교체** → 작은 단위로 커밋 → GitHub Pages 자동 배포 확인.

---

## 5. 품질 기준 (지난 세션 기준 유지)

- 📱 **반응형**: 320px ~ 1440px 전 폭에서 깨짐 없음
- ♿ **접근성**: 시맨틱 태그, alt/aria, Tab 키만으로 모든 인터랙션, focus-visible 골드, WCAG AA 색대비
- 🎨 **디자인 일관성**: 위의 CSS 변수와 기존 컴포넌트 클래스를 **재사용**. 새 컬러·새 폰트 추가 금지
- ⚡ **성능**: 이미지 `loading="lazy"`, JSON fetch 캐싱, 폴리필 없이도 동작 (`window.__fallbackImg` 재사용)
- 🌐 **SEO/공유**: 모든 페이지에 OG 메타 (`og:url`은 페이지별로 다르게), `<title>`, `<meta description>` 필수
- 🛡️ **보안**: 사용자 입력은 `textContent`로 출력 (XSS 방지), `innerHTML`은 신뢰된 데이터만
- 📦 **콘솔 깨끗하게**: `console.log` 남기지 말 것

---

## 6. 작업 시작 시 첫 단계 (이 프롬프트를 받은 직후)

1. `git pull` 또는 GitHub 저장소 최신 상태 확인 (`https://github.com/w2er1702-boop/le-bien-landing`)
2. `npx http-server` 로 로컬 띄우고 현재 사이트 확인
3. **계획 확인** — 위 38개 페이지 중 사용자에게 **"오늘 어디까지 하시겠어요?"** 질문 (한 번에 다 만들면 컨텍스트 폭발). 권장 1차 범위: Group A의 8개 listing 페이지 + product 상세 템플릿 1개.
4. `partials/` 구조부터 잡고 `index.html`을 그 구조에 맞게 리팩토링 (한 번 해두면 38개 페이지 만들기 쉬워짐)

---

## 7. 진행 상황 체크리스트

새 채팅에서 이 체크리스트를 그대로 가져가서, 완성된 항목에 `[x]` 표시하며 진행하세요.

### Group A — 카테고리·상품
- [ ] partials/header.html, footer.html 분리 + includes.js
- [ ] index.html을 partials 사용 형태로 리팩토링
- [ ] listing.html 템플릿
- [ ] /category/beauty.html
- [ ] /category/health.html
- [ ] /category/living.html
- [ ] /category/kitchen.html
- [ ] /category/food.html (준비중)
- [ ] /category/fashion.html (준비중)
- [ ] /event/hot.html
- [ ] /event/online.html
- [ ] /event/members.html
- [ ] /event/new.html
- [ ] /events.html (기획전 허브)
- [ ] /brand.html (브랜드관)
- [ ] product.html (단일 템플릿 + 20개 데이터 주입)
- [ ] /search.html

### Group B — 회원·계정
- [ ] /account/login.html
- [ ] /account/signup.html
- [ ] /account/mypage.html
- [ ] /account/orders.html
- [ ] /account/wishlist.html
- [ ] /account/cart.html
- [ ] /membership.html

### Group C — 이용안내
- [ ] /help/terms.html
- [ ] /help/privacy.html
- [ ] /help/refund.html
- [ ] /help/faq.html
- [ ] /help/shipping.html
- [ ] /help/returns.html

### Group D — 고객지원
- [ ] /support/notices.html
- [ ] /support/notice.html (상세 템플릿)
- [ ] /support/inquiry.html
- [ ] /support/qna.html
- [ ] /support/partnership.html
- [ ] /support/business.html
- [ ] /support/bulk.html
- [ ] /support/center.html
- [ ] /support/stores.html

### Group E — 브랜드·기타
- [ ] /about.html
- [ ] /404.html

### 마지막 정리
- [ ] 랜딩(`index.html`)의 모든 `#` 링크를 실제 경로로 교체
- [ ] 모든 페이지에 OG 메타 + 페이지별 title/description
- [ ] 모바일·데스크탑 전 페이지 회귀 점검
- [ ] Lighthouse Performance 90+ / Accessibility 95+
- [ ] GitHub Pages 라이브 확인

---

## 8. 사용자가 결정해야 할 사항 (작업 시작 전에 물어볼 것)

1. **상품 상세 URL 형식** — `/product.html?id=lb-b-001` 단일 템플릿(쉬움, SEO 약함) vs `/product/lb-b-001.html` 20개 셸 파일(SEO 강함, 관리 비용)
2. **약관 본문** — 표준 템플릿 채워 넣기 vs 자체 작성(추후 변호사 검토 권고) — 현재 가짜 사업자정보 상태이므로 표준 템플릿 권장
3. **장바구니/위시리스트 — 진짜 동작** — localStorage 더미 vs UI만 — 권장: localStorage 더미 (실제 사용 가능한 데모)
4. **로그인 — 실제 인증** — 불가 (정적 사이트). 가짜 로그인(이메일 입력하면 닉네임 저장) 권장
5. **첫 작업 범위** — Group A 전부? listing 템플릿만? 사용자가 한 번에 어느 정도 받고 싶은지

---

## 9. 무엇을 *하지* 말 것

- ❌ React/Vue/Next.js 등 프레임워크 도입
- ❌ 번들러(Vite/Webpack) 도입
- ❌ Tailwind 등 유틸리티 CSS 추가 (이미 디자인 시스템 있음)
- ❌ 외부 백엔드 API 호출 (정적 사이트)
- ❌ 새 컬러/폰트 무단 추가
- ❌ 기존 컴포넌트 클래스 이름 변경 (CSS 깨짐)
- ❌ `index.html`의 코스트코식 레이아웃 톤을 다른 느낌으로 임의 변경

---

준비됐으면 위 **6번 "작업 시작 시 첫 단계"** 부터 진행해 주세요.
