# CLAUDE.md

Guidance for AI assistants working in this repository. Read this **before** editing files.

---

## 1. Project at a glance

**르비엔 (Le Bien)** — a Korean multi-category e-commerce site (뷰티 / 건강기능식품 / 생활용품 / 주방용품 등). It is a **fully static** marketing/demo site hosted on GitHub Pages at `https://w2er1702-boop.github.io/le-bien-landing/`. There is no backend; "auth", "cart", and "wishlist" are mocks backed by `localStorage`. The landing page (`index.html`) plus ~37 sub-pages cover the entire flow (category listings, product details, account, help, support, brand story, 404).

Background on intent and the original page inventory lives in `HANDOFF_PROMPT.md`. The user-facing deploy/usage doc is `README.md`.

### Hard constraints (do not break)

- **Vanilla only.** No frameworks (React/Vue/Next), no bundlers (Vite/Webpack), no utility CSS (Tailwind). External deps are limited to the Pretendard + Playfair Display CDN fonts and `picsum.photos` placeholder images.
- **Static hosting.** No server-side code, no real network APIs. Anything that needs a server should be a mock with an `alert(...)` or a `localStorage` write.
- **GitHub Pages friendly.** Site is served from the `/le-bien-landing/` subpath, not root. URL resolution is handled by `js/base.js` (see §4).
- **Do not introduce new colors or fonts.** Use the existing CSS variables in `:root`.
- **Do not rename existing component classes** (`.pcard`, `.btn--gold`, `.section-head`, `.promo-card--navy`, `.product-grid--4`, etc.) — the CSS is large and class-based, renames silently break pages.

---

## 2. Directory layout

```
le-bien-landing/
├── index.html                    # Landing (hero carousel, hot/online/members/new sections)
├── 404.html                      # GitHub Pages 404
├── about.html                    # Brand story
├── brand.html                    # Brand hub (uses brands.json)
├── events.html                   # Event/promotion hub
├── membership.html               # Membership benefits
├── search.html                   # Search results (listing template w/ ?q=)
│
├── category/{beauty,health,living,kitchen,food,fashion}.html
│       # 4 active + 2 placeholder ("준비중") categories.
│       # All driven by listing.js via body[data-listing-*] attrs.
│
├── event/{hot,online,members,new}.html
│       # Promotion pages, same listing template.
│
├── product/lb-{b,h,k,l}-00{1..5}.html
│       # 20 product detail pages. Each is a thin shell with
│       # <body data-product-id="..."> — product.js fills it from products.json.
│
├── account/{login,signup,mypage,orders,wishlist,cart}.html
├── help/{terms,privacy,refund,faq,shipping,returns}.html
├── support/{notices,notice,inquiry,qna,partnership,business,bulk,center,stores}.html
│
├── partials/
│   ├── header.html               # util bar + main header + (mobile) menu
│   └── footer.html               # trust strip + link columns + legal
│
├── css/
│   └── style.css                 # ~2.2k lines — design tokens + every component
│
├── js/
│   ├── base.js                   # MUST load first in <head>. Sets <base href>.
│   ├── includes.js               # Fetches data-include="..." partials.
│   ├── state.js                  # window.LB = { cart, wishlist, recent, user }.
│   ├── main.js                   # Carousel, mobile menu, countdown, top btn, home grids.
│   ├── listing.js                # Category/event/search/brand/all listings.
│   └── product.js                # PDP — gallery, price box, qty, cart/wish, tabs.
│
├── data/
│   ├── products.json             # 20 products. Source of truth for cards/PDP.
│   ├── categories.json           # Keyed by category slug.
│   ├── events.json               # Keyed by event slug.
│   ├── brands.json               # Array (has `key` + `matchBrands`).
│   ├── notices.json
│   └── faqs.json
│
├── assets/
│   └── og-image.svg              # 1200×630 OG image.
│
├── README.md                     # User-facing deploy/run docs (Korean).
├── HANDOFF_PROMPT.md             # Original page-build brief (history).
└── .claude/
    └── launch.json               # `npx --yes http-server . -p 8765 -c-1 --silent`
```

---

## 3. Running locally

The site **must** be served over HTTP — opening `index.html` via `file://` breaks `fetch('data/...json')` and the partial include system (CORS).

```bash
# Pick one
python -m http.server 8000              # → http://localhost:8000
npx --yes http-server . -p 8765 -c-1    # matches .claude/launch.json
```

There is **no build step, no test runner, no linter**. Verification = open the page in a browser and confirm:
1. Console has no errors.
2. Header/footer render (proves includes loaded).
3. Product grids fill in (proves `data/products.json` fetched).
4. Cart/wishlist badges respond to clicks (proves `state.js` wired up).

---

## 4. The `<base href>` + includes system (critical)

GitHub Pages serves this site at `/le-bien-landing/`, but locally it lives at `/`. Hardcoding either breaks the other. The fix:

1. **`js/base.js` must be the first `<script>` inside `<head>` of every page.** It injects a `<base href="...">` element that resolves to:
   - `/le-bien-landing/` on GitHub Pages
   - `/` on localhost

2. **All asset paths are written as if from site root**, e.g. `href="css/style.css"`, `src="js/main.js"`, `data-include="partials/header.html"`, `fetch('data/products.json')`. The `<base>` tag rewrites them. **Do not** use `../`, `./`, or absolute paths beginning with `/`.

3. **`js/includes.js`** walks every `<div data-include="partials/foo.html"></div>`, fetches it, and replaces the div with the partial. It exposes `window.__LB_INCLUDES_READY` (a Promise) and fires `document` event `lb:includes-ready` when done.

4. **Page scripts wait for includes before binding handlers** using a `whenReady()` helper that `Promise.all`s DOM ready + `__LB_INCLUDES_READY`. Copy that pattern if you add new scripts that touch the header/footer.

**The script load order matters and is the same on every page:**

```html
<head>
  <script src="js/base.js"></script>   <!-- FIRST. before any other resource -->
  ...
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <div data-include="partials/header.html"></div>
  <main>...</main>
  <div data-include="partials/footer.html"></div>

  <script src="js/includes.js"></script>  <!-- runs immediately, exposes promise -->
  <script src="js/state.js"></script>     <!-- defines window.LB -->
  <script src="js/main.js"></script>      <!-- common UI; waits for includes -->
  <!-- Optional, page-specific: -->
  <script src="js/listing.js"></script>   <!-- on listing pages -->
  <script src="js/product.js"></script>   <!-- on PDPs -->
</body>
```

If you add a new page, copy this skeleton from an existing similar page (e.g. `category/beauty.html` for a listing, `product/lb-b-001.html` for a PDP, `account/login.html` for a form).

---

## 5. Page templates (one template, many pages)

Most non-static pages are thin shells that get configured via `<body>` data attributes; the JS does the work.

### Listing pages — `js/listing.js`

```html
<body data-listing-type="category|event|search|brand|all"
      data-listing-key="beauty|hot|online|members|new|le-bien|..."
      data-page-cat="beauty">   <!-- optional: highlights nav -->
  ...
  <section id="lhero" class="pagehero"></section>
  ...
  <ul class="product-grid product-grid--4" id="lgrid"></ul>
  <div class="listing__empty" id="lempty" hidden>...</div>
</body>
```

- `data-listing-type="category"` + `data-listing-key="beauty"` → filters `products.json` where `category === 'beauty'`.
- `data-listing-type="event"` keys: `hot`, `online`, `members`, `new` (filter rules in `listing.js` `filterProducts()`).
- Category metadata (label, subtitle, `available: false` → placeholder) comes from `data/categories.json`. Placeholder categories render an email-signup form instead of a grid.
- Search reads `?q=...&cat=...` from the URL.
- Sorting is hooked up via `#lsort`.

### Product detail pages — `js/product.js`

```html
<body data-product-id="lb-b-001">
  ...
  <!-- IDs that product.js fills: pdpCrumb, pdpMainImg, pdpThumbs, pdpBrand,
       pdpName, pdpRating, pdpPrice, pdpMeta, pdpQty, pdpQtyMinus, pdpQtyPlus,
       pdpTotal, pdpWish, pdpCart, pdpBuy, .pdp__tab/.pdp__panel, pdpRec -->
</body>
```

If `data-product-id` is missing, `getId()` falls back to parsing the URL pathname (`/product/{id}.html`). To add a new product: append to `products.json`, then `cp product/lb-b-001.html product/lb-x-001.html` and change `data-product-id` (or just rely on the URL fallback).

### Card builder

`window.LBcommon.buildProductCard(product)` (in `main.js`) builds the standard `.pcard` `<li>`. Reuse it instead of re-implementing card HTML — it handles discount badges, tag colors, member price, fallback images, etc.

### Image fallback

Every `<img>` for product/hero content uses `onerror="window.__fallbackImg(this, '라벨')"`. The function (in `main.js`) swaps in an inline SVG with the Le Bien wordmark. Keep using this — don't import a CDN library.

---

## 6. Client state — `window.LB`

`js/state.js` is the only state layer. It mutates `localStorage` and fires a `lb:state` `CustomEvent` on `window` after every change.

```js
LB.cart.list()         // [{id, qty}, ...]
LB.cart.count()        // total quantity (header badge)
LB.cart.add(id, qty)
LB.cart.update(id, qty) // qty=0 removes
LB.cart.remove(id)
LB.cart.clear()

LB.wishlist.list() / .has(id) / .toggle(id) / .add(id) / .remove(id)

LB.recent.add(id)       // LRU, max 10. PDP calls this on view.
LB.recent.list()
LB.recent.clear()

LB.user.get()           // {email, nickname} | null
LB.user.isLoggedIn()
LB.user.login(email, nickname)
LB.user.logout()

LB.formatNum(n)         // 1234567 → "1,234,567"
LB.formatWon(n)         // appends "원"
```

`state.js` also auto-updates header badges (`.cart__badge`, `.wishlist__badge`) and toggles `[data-auth="logged-in"]` / `[data-auth="logged-out"]` elements via `applyHeaderState()` whenever state changes or includes finish loading.

**localStorage keys:** `lb_cart`, `lb_wishlist`, `lb_recent`, `lb_user`.

---

## 7. Data files

All under `data/`, fetched via relative path (which resolves against `<base href>`).

| File | Shape | Notes |
|---|---|---|
| `products.json` | array of product objects | `id`, `category`, `categoryLabel`, `brand`, `name`, `unit`, `originalPrice`, `salePrice`, `memberPrice`, `discountRate`, `instantDiscount`, `tags[]`, `rating`, `reviewCount`, `image`. Product IDs follow `lb-{b\|h\|k\|l}-NNN` (beauty / health / kitchen / living). |
| `categories.json` | object keyed by slug | `{label, title, subtitle, icon, heroBg, heroTone, available}`. `available: false` triggers placeholder rendering. |
| `events.json` | object keyed by slug | `{label, title, subtitle, tone, rule}`. |
| `brands.json` | array | `{key, name, tagline, desc, productCount, matchBrands[]}` — `matchBrands` lets a brand "key" map to one or more `product.brand` strings. |
| `notices.json`, `faqs.json` | array | Static dummy content for support pages. |

When adding products, keep `id` unique and follow the existing naming so URLs (`product/{id}.html`) stay predictable. **Add a corresponding HTML shell in `product/`** unless the user explicitly opts into the querystring-only approach.

---

## 8. Design system (CSS)

All tokens are CSS variables on `:root` at the top of `css/style.css`. Use them; don't hardcode hex.

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#0A2540` | Deep navy — text, footer, nav |
| `--color-primary-deep` | `#06182B` | Pressed/hover navy |
| `--color-accent` | `#C9A961` | Gold — logo, CTAs, highlights |
| `--color-accent-soft` / `--color-accent-light` | `#E5C880` / `#FAF3DD` | Soft golds |
| `--color-bg` / `--color-bg-soft` / `--color-bg-softer` | `#FFFFFF` / `#F4F6F9` / `#FAFBFC` | Backgrounds |
| `--color-text` / `--color-text-sub` / `--color-text-mute` | `#1A1A1A` / `#5F6B7A` / `#8A95A3` | Text hierarchy |
| `--color-border` / `--color-border-light` | `#E5E7EB` / `#F1F3F6` | Lines |
| `--color-hot` / `--color-hot-bg` | `#E32227` / `#FFF0F0` | Discount / HOT |
| `--radius` / `--radius-sm` | `6px` / `4px` | Corner radii |
| `--container` | `1280px` | Page max-width |
| `--font-ko` / `--font-en` | Pretendard / Playfair Display | Body / display |

**Breakpoints (mobile-first):** `640px`, `1024px`, `1280px`. Always write the base styles for mobile and progressively enhance with `@media (min-width: ...)`.

**Reusable components already in CSS** (don't duplicate): `.pcard`, `.btn` (`--primary` / `--gold` / `--gold-outline` / `--gold-lg` / `--ghost`), `.chip` (`--gold` / `--gold-line` / `--red` / `--navy-line`), `.section-head`, `.product-grid` (`--4` / `--5`), `.promo-card` (`--navy` / `--cream`), `.countdown`, `.pagehero`, `.listing__toolbar`, `.formwrap`, `.field`, `.input`, `.pdp__*`, `.footer__*`.

---

## 9. Accessibility / SEO conventions

These are already applied across the site; preserve them.

- Semantic HTML (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section aria-label="...">`).
- All images have `alt`. Decorative SVGs use `aria-hidden="true"`.
- Focus styles: `:focus-visible { outline: 2px solid var(--color-accent); }`. Don't strip it.
- Korean `lang="ko"` on `<html>`.
- Every page has `<title>`, `<meta name="description">`, OG tags (`og:type`, `og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `og:locale="ko_KR"`), and Twitter card tags. **`og:url` is page-specific** (full GitHub Pages URL).
- Inline SVG favicon (the gold "L" on navy) is shared verbatim across pages.

When user content is rendered, use `textContent` (or `escapeHTML` helper in `listing.js`). `innerHTML` is fine only for trusted, code-authored strings.

---

## 10. Conventions when adding pages

1. **Copy a sibling page** with the same shape (listing → copy `category/beauty.html`; form → `account/login.html`; static article → `help/terms.html`).
2. Update `<title>`, all `<meta>` (including the page-specific `og:url`), and any `<body data-*>` attributes.
3. Reference assets with **bare paths** (`css/style.css`, `js/main.js`, `partials/header.html`), never `../` — `<base>` handles depth.
4. Reuse classes from §8. If something genuinely doesn't exist, add it near the related block in `css/style.css` and use the existing tokens.
5. Link to the new page from anywhere relevant (often from `partials/header.html`, `partials/footer.html`, or `index.html`).
6. Open it in the browser, check the console, verify header/footer/state badges work.

---

## 11. Things NOT to do

- ❌ Add a framework, bundler, router, or any npm dependency to the runtime path.
- ❌ Use absolute paths (`/css/style.css`) — breaks GitHub Pages subpath. Use `css/style.css`.
- ❌ Use `../` paths — breaks the `<base href>` model. Use bare paths.
- ❌ Skip `js/base.js` on a new page, or move it after other `<script>`/`<link>` tags.
- ❌ Bind event handlers before `whenReady()` resolves on pages that use partials.
- ❌ Rename existing CSS classes or change component markup structure without updating CSS.
- ❌ Introduce new color tokens, fonts, or break the navy + gold + (hot red) palette.
- ❌ Leave `console.log` calls in committed code (use `console.warn` for genuine error paths only).
- ❌ Treat user inputs as trusted HTML — escape or use `textContent`.
- ❌ Hit any external API. Keep everything client-only.

---

## 12. Git workflow

- Default working branch for this assistant: **`claude/claude-md-docs-Ksfek`** (per session instructions). Develop and push there; do not push to `main` without explicit user request.
- Push with `git push -u origin <branch>` (retry with exponential backoff on transient network errors).
- Commit messages are written in **Korean** in this repo (see `git log`). Match the existing style — short, descriptive, action-first (예: "공지사항 더미 데이터 추가").
- Do **not** open a pull request unless the user asks for one.
- GitHub interactions go through the `mcp__github__*` tools, scoped to `w2er1702-boop/le-bien-landing`. The `gh` CLI is not available.
