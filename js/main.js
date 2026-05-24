/* ============================================================
   Le Bien — main.js
   Common UI behaviors + product-card builder shared across pages.
   Waits for header/footer includes to finish before binding.
   ============================================================ */

(function () {
  'use strict';

  /* ---------------------------------------------------------
   * Image fallback (exposed globally for inline onerror)
   * --------------------------------------------------------- */
  window.__fallbackImg = function (img, label) {
    if (img.dataset.fallback === '1') return;
    img.dataset.fallback = '1';
    var text = (label || img.alt || 'Le Bien').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
      '<rect width="400" height="400" fill="#0A2540"/>' +
      '<text x="200" y="195" font-family="Pretendard, Apple SD Gothic Neo, sans-serif" font-size="22" fill="#C9A961" text-anchor="middle" font-weight="700">Le Bien</text>' +
      '<text x="200" y="225" font-family="Pretendard, Apple SD Gothic Neo, sans-serif" font-size="18" fill="#FFFFFF" text-anchor="middle">' + text + '</text>' +
      '</svg>';
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };

  /* ---------------------------------------------------------
   * Boot — wait for partials (header/footer) before initing
   * --------------------------------------------------------- */
  function whenReady(fn) {
    var domReady = new Promise(function (resolve) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else { resolve(); }
    });
    var includes = window.__LB_INCLUDES_READY || Promise.resolve();
    Promise.all([domReady, includes]).then(fn);
  }

  whenReady(function () {
    initHeroCarousel();
    initMobileMenu();
    initFooterAccordion();
    initTopButton();
    initCountdown();
    initActiveNav();
    loadHomeProducts();
  });

  /* =========================================================
   * Hero Carousel
   * ========================================================= */
  function initHeroCarousel() {
    var track = document.getElementById('heroTrack');
    var dotsWrap = document.getElementById('heroDots');
    var counter = document.getElementById('heroCounter');
    var prevBtn = document.getElementById('heroPrev');
    var nextBtn = document.getElementById('heroNext');
    if (!track || !dotsWrap) return;

    var slides = Array.prototype.slice.call(track.children);
    var count = slides.length;
    var current = 0;
    var timer = null;
    var AUTO_MS = 5000;
    var RESUME_MS = 7000;

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hero-carousel__dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', (i + 1) + '번 슬라이드로 이동');
      b.addEventListener('click', function () { go(i); pauseAndResume(); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function update() {
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
      if (counter) counter.textContent = (current + 1) + ' / ' + count;
    }
    function go(i) { current = (i + count) % count; update(); }
    function next() { go(current + 1); }
    function prev() { go(current - 1); }

    function startAuto() { stopAuto(); timer = setInterval(next, AUTO_MS); }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    function pauseAndResume() { stopAuto(); setTimeout(startAuto, RESUME_MS); }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); pauseAndResume(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); pauseAndResume(); });

    var viewport = track.parentElement;
    if (viewport) {
      viewport.addEventListener('mouseenter', stopAuto);
      viewport.addEventListener('mouseleave', startAuto);
      viewport.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { next(); pauseAndResume(); }
        if (e.key === 'ArrowLeft')  { prev(); pauseAndResume(); }
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAuto(); else startAuto();
    });

    var touchX = null;
    track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) next(); else prev();
        pauseAndResume();
      }
      touchX = null;
    }, { passive: true });

    update();
    startAuto();
  }

  /* =========================================================
   * Mobile Menu
   * ========================================================= */
  function initMobileMenu() {
    var btn = document.getElementById('hamburgerBtn');
    var menu = document.getElementById('mobileMenu');
    var closeBtn = document.getElementById('mobileMenuClose');
    var backdrop = document.getElementById('mobileMenuBackdrop');
    if (!btn || !menu) return;

    function open() {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    }
    function close() {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }
    btn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  }

  /* =========================================================
   * Footer accordion (mobile)
   * ========================================================= */
  function initFooterAccordion() {
    var titles = document.querySelectorAll('.footer__title[data-accordion]');
    titles.forEach(function (t) {
      t.setAttribute('role', 'button');
      t.setAttribute('tabindex', '0');
      t.setAttribute('aria-expanded', 'false');
      function toggle() {
        var col = t.parentElement;
        var open = col.classList.toggle('is-open');
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      t.addEventListener('click', toggle);
      t.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  /* =========================================================
   * Top button
   * ========================================================= */
  function initTopButton() {
    var btn = document.getElementById('topBtn');
    if (!btn) return;
    function update() {
      btn.classList.toggle('is-visible', window.scrollY > 400);
    }
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    update();
  }

  /* =========================================================
   * Active nav highlight — based on body[data-page-cat]
   * ========================================================= */
  function initActiveNav() {
    var cat = document.body.getAttribute('data-page-cat');
    if (!cat) return;
    document.querySelectorAll('.catnav__list a[data-cat="' + cat + '"]').forEach(function (a) {
      a.classList.add('is-active');
    });
  }

  /* =========================================================
   * Countdown — counts down to next Sunday 23:59:59
   * ========================================================= */
  function initCountdown() {
    var box = document.getElementById('countdown');
    if (!box) return;
    var cells = {
      d: box.querySelector('[data-unit="d"]'),
      h: box.querySelector('[data-unit="h"]'),
      m: box.querySelector('[data-unit="m"]'),
      s: box.querySelector('[data-unit="s"]')
    };

    function nextDeadline() {
      var now = new Date();
      var d = new Date(now);
      var day = d.getDay();
      var daysUntilSun = (7 - day) % 7;
      d.setDate(d.getDate() + (daysUntilSun === 0 ? 7 : daysUntilSun));
      d.setHours(23, 59, 59, 999);
      return d;
    }
    var deadline = nextDeadline();

    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function tick() {
      var diff = Math.max(0, deadline - new Date());
      var day = Math.floor(diff / 86400000); diff -= day * 86400000;
      var hr  = Math.floor(diff / 3600000);  diff -= hr * 3600000;
      var min = Math.floor(diff / 60000);    diff -= min * 60000;
      var sec = Math.floor(diff / 1000);
      cells.d.textContent = pad(day);
      cells.h.textContent = pad(hr);
      cells.m.textContent = pad(min);
      cells.s.textContent = pad(sec);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* =========================================================
   * Home (landing) — multi-section product render
   * ========================================================= */
  function loadHomeProducts() {
    // Only run when there are home-style sections to fill.
    var any = document.querySelector('.product-grid[data-section]');
    if (!any) return;

    fetchProducts()
      .then(function (all) {
        renderSection('hot',     filterHot(all),     5);
        renderSection('online',  filterOnline(all),  5);
        renderSection('members', pickAcrossCats(all), 8);
        renderSection('new',     filterNew(all),     5);
      })
      .catch(function () {
        document.querySelectorAll('.product-grid[data-section]').forEach(function (grid) {
          grid.innerHTML =
            '<li style="grid-column: 1 / -1; padding: 24px; text-align:center; color: var(--color-text-sub);">' +
            '상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' +
            '</li>';
        });
      });
  }

  var _productsCache = null;
  function fetchProducts() {
    if (_productsCache) return Promise.resolve(_productsCache);
    return fetch('data/products.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('products.json fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (json) { _productsCache = json; return json; });
  }

  function filterHot(all) {
    var hot = all.filter(function (p) {
      return (p.tags && p.tags.indexOf('핫딜') !== -1) || (p.discountRate || 0) >= 40;
    });
    return uniqueByCategory(hot).slice(0, 5);
  }
  function filterOnline(all) {
    var online = all.filter(function (p) { return p.tags && p.tags.indexOf('온라인단독') !== -1; });
    if (online.length < 5) {
      var rest = all
        .filter(function (p) { return online.indexOf(p) === -1; })
        .sort(function (a, b) { return (b.discountRate || 0) - (a.discountRate || 0); });
      return online.concat(rest).slice(0, 5);
    }
    return uniqueByCategory(online).slice(0, 5);
  }
  function filterNew(all) {
    var news = all.filter(function (p) { return p.tags && p.tags.indexOf('NEW') !== -1; });
    if (news.length < 5) {
      var rest = all
        .filter(function (p) { return news.indexOf(p) === -1; })
        .sort(function (a, b) { return b.rating - a.rating; });
      return news.concat(rest).slice(0, 5);
    }
    return news.slice(0, 5);
  }
  function pickAcrossCats(all) {
    var byCat = {};
    all.forEach(function (p) { (byCat[p.category] = byCat[p.category] || []).push(p); });
    var order = ['beauty', 'health', 'living', 'kitchen'];
    var picked = [];
    order.forEach(function (c) {
      var arr = byCat[c] || [];
      picked.push.apply(picked, arr.slice(0, 2));
    });
    if (picked.length < 8) {
      all.forEach(function (p) { if (picked.length < 8 && picked.indexOf(p) === -1) picked.push(p); });
    }
    return picked.slice(0, 8);
  }
  function uniqueByCategory(arr) {
    var seen = {};
    var out = [];
    arr.forEach(function (p) {
      if (!seen[p.category]) { seen[p.category] = 1; out.push(p); }
    });
    arr.forEach(function (p) { if (out.indexOf(p) === -1) out.push(p); });
    return out;
  }

  function renderSection(sectionName, products, limit) {
    var grid = document.querySelector('.product-grid[data-section="' + sectionName + '"]');
    if (!grid) return;
    grid.innerHTML = '';
    var frag = document.createDocumentFragment();
    products.slice(0, limit).forEach(function (p) { frag.appendChild(buildProductCard(p)); });
    grid.appendChild(frag);
  }

  /* =========================================================
   * Product card (reused by listing / brand / search / product)
   * ========================================================= */
  function buildProductCard(p) {
    var li = document.createElement('li');

    var a = document.createElement('a');
    a.href = 'product/' + p.id + '.html';
    a.className = 'pcard';
    a.setAttribute('aria-label', p.brand + ' ' + p.name + ' ' + formatWon(p.salePrice));

    var media = document.createElement('div');
    media.className = 'pcard__media';

    if (p.discountRate && p.discountRate > 0) {
      var set = document.createElement('span');
      set.className = 'pcard__badge-set';
      var dBadge = document.createElement('span');
      dBadge.className = 'pcard__badge pcard__badge--discount';
      dBadge.textContent = '-' + p.discountRate + '%';
      set.appendChild(dBadge);
      media.appendChild(set);
    }

    if (p.tags && p.tags.length) {
      var tagWrap = document.createElement('span');
      tagWrap.className = 'pcard__tags';
      p.tags.slice(0, 3).forEach(function (tag) {
        var el = document.createElement('span');
        el.className = 'pcard__tag ' + classForTag(tag);
        el.textContent = tag;
        tagWrap.appendChild(el);
      });
      media.appendChild(tagWrap);
    }

    if (p.instantDiscount && p.instantDiscount > 0) {
      var instant = document.createElement('span');
      instant.className = 'pcard__instant';
      instant.textContent = '₩' + formatNum(p.instantDiscount) + ' 즉시할인';
      media.appendChild(instant);
    }

    var img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = p.image;
    img.alt = p.brand + ' ' + p.name;
    var label = p.categoryLabel || '';
    img.onerror = function () { window.__fallbackImg(img, label); };
    media.appendChild(img);

    var body = document.createElement('div');
    body.className = 'pcard__body';

    var brand = document.createElement('p');
    brand.className = 'pcard__brand';
    brand.textContent = p.brand;

    var name = document.createElement('p');
    name.className = 'pcard__name';
    name.textContent = p.name;

    var unit = null;
    if (p.unit) {
      unit = document.createElement('span');
      unit.className = 'pcard__unit';
      unit.textContent = p.unit;
    }

    var priceRow = document.createElement('div');
    priceRow.className = 'pcard__price-row';
    if (p.discountRate && p.discountRate > 0 && p.originalPrice > p.salePrice) {
      var orig = document.createElement('span');
      orig.className = 'pcard__price-original';
      orig.textContent = formatWon(p.originalPrice);
      priceRow.appendChild(orig);

      var disc = document.createElement('span');
      disc.className = 'pcard__discount';
      disc.textContent = '-' + p.discountRate + '%';
      priceRow.appendChild(disc);
    }

    var sale = document.createElement('span');
    sale.className = 'pcard__price-sale';
    sale.innerHTML = formatNum(p.salePrice) + '<span class="won">원</span>';

    var member = null;
    if (p.memberPrice && p.memberPrice < p.salePrice) {
      member = document.createElement('span');
      member.className = 'pcard__member';
      var lbl = document.createElement('span');
      lbl.className = 'pcard__member-label';
      lbl.textContent = '회원가';
      var val = document.createElement('span');
      val.className = 'pcard__member-price';
      val.innerHTML = formatNum(p.memberPrice) + '<span class="won">원</span>';
      member.appendChild(lbl);
      member.appendChild(val);
    }

    var meta = document.createElement('div');
    meta.className = 'pcard__meta';
    var stars = document.createElement('span');
    stars.className = 'pcard__stars';
    stars.setAttribute('aria-hidden', 'true');
    stars.textContent = renderStars(p.rating);
    meta.appendChild(stars);
    meta.appendChild(document.createTextNode(' ' + p.rating.toFixed(1)));
    var rev = document.createElement('span');
    rev.className = 'pcard__review';
    rev.textContent = '(' + formatNum(p.reviewCount) + ')';
    meta.appendChild(rev);

    body.appendChild(brand);
    body.appendChild(name);
    if (unit) body.appendChild(unit);
    body.appendChild(priceRow);
    body.appendChild(sale);
    if (member) body.appendChild(member);
    body.appendChild(meta);

    a.appendChild(media);
    a.appendChild(body);
    li.appendChild(a);
    return li;
  }

  function classForTag(tag) {
    if (tag === 'BEST') return 'pcard__tag--gold';
    if (tag === 'NEW') return '';
    if (tag === '1+1' || tag === '핫딜') return 'pcard__tag--red';
    if (tag === '온라인단독' || tag === '회원특가') return 'pcard__tag--line';
    return '';
  }

  function formatNum(n) { return Number(n || 0).toLocaleString('ko-KR'); }
  function formatWon(n) { return formatNum(n) + '원'; }
  function renderStars(rating) {
    var full = Math.round(rating);
    return '★★★★★☆☆☆☆☆'.slice(5 - full, 10 - full);
  }

  /* Expose for other page scripts (listing.js, product.js, etc.) */
  window.LBcommon = {
    fetchProducts: fetchProducts,
    buildProductCard: buildProductCard,
    classForTag: classForTag,
    formatNum: formatNum,
    formatWon: formatWon,
    renderStars: renderStars
  };
})();
