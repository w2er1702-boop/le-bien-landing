/* ============================================================
   Le Bien — listing.js
   Powers category / event / search / brand pages by reading
   body[data-listing-*] attributes and rendering a product grid.

   body attributes:
     data-listing-type = "category" | "event" | "search" | "brand" | "all"
     data-listing-key  = "beauty" | "hot" | "le-bien" | ...
     data-page-cat     = sets active nav (optional)
   ============================================================ */

(function () {
  'use strict';

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
    var type = document.body.getAttribute('data-listing-type');
    if (!type) return;
    boot(type, document.body.getAttribute('data-listing-key') || '');
  });

  function boot(type, key) {
    Promise.all([
      fetch('data/products.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
      fetch('data/categories.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
      fetch('data/events.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
      fetch('data/brands.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
    ]).then(function (results) {
      var products = results[0];
      var categories = results[1];
      var events = results[2];
      var brands = results[3];

      var meta = resolveMeta(type, key, categories, events, brands);
      renderHero(meta);

      // Empty/placeholder category (e.g. food, fashion)
      if (meta.placeholder) {
        renderPlaceholder(meta);
        return;
      }

      var subset = filterProducts(type, key, products);
      bindSort(subset, meta);
      renderList(subset, meta);
    }).catch(function (err) {
      // eslint-disable-next-line no-console
      console.warn('listing failed:', err);
      var grid = document.getElementById('lgrid');
      if (grid) {
        grid.innerHTML = '<li style="grid-column:1/-1;padding:24px;text-align:center;color:var(--color-text-sub);">상품 정보를 불러오지 못했습니다.</li>';
      }
    });
  }

  /* -------- meta resolution -------- */
  function resolveMeta(type, key, categories, events, brands) {
    if (type === 'category') {
      var c = categories[key];
      if (!c) return fallbackMeta('카테고리');
      return {
        crumb: ['카테고리', c.label],
        title: c.label,
        subtitle: c.subtitle || '',
        flag: c.title || '',
        placeholder: !c.available,
        emptyMsg: !c.available ? (c.subtitle || '곧 르비엔에서 만나보세요.') : '',
        tone: 'soft'
      };
    }
    if (type === 'event') {
      var e = events[key];
      if (!e) return fallbackMeta('기획전');
      return {
        crumb: ['기획전', e.label],
        title: e.label,
        subtitle: e.subtitle || '',
        flag: e.title || '',
        tone: e.tone === 'members' ? 'accent' : 'accent'
      };
    }
    if (type === 'brand') {
      var b = brands.find(function (x) { return x.key === key; });
      if (!b) return fallbackMeta('브랜드');
      return {
        crumb: ['브랜드관', b.name],
        title: b.name,
        subtitle: b.desc || b.tagline || '',
        flag: b.tagline || '',
        tone: 'accent'
      };
    }
    if (type === 'search') {
      var params = new URLSearchParams(location.search);
      var q = params.get('q') || '';
      return {
        crumb: ['검색 결과', q ? '"' + q + '"' : ''],
        title: q ? '"' + q + '" 검색 결과' : '검색',
        subtitle: q ? '입력하신 키워드에 맞는 상품입니다.' : '검색어를 입력해 주세요.',
        flag: 'SEARCH',
        tone: 'soft',
        searchQuery: q
      };
    }
    if (type === 'all') {
      return {
        crumb: ['전체상품'],
        title: '전체상품',
        subtitle: '르비엔이 셀렉한 모든 상품',
        flag: 'ALL',
        tone: 'soft'
      };
    }
    return fallbackMeta('상품');
  }
  function fallbackMeta(label) {
    return { crumb: [label], title: label, subtitle: '', flag: label, tone: 'soft' };
  }

  /* -------- hero render -------- */
  function renderHero(meta) {
    var hero = document.getElementById('lhero');
    if (!hero) return;
    hero.className = 'pagehero ' + (meta.tone === 'accent' ? 'pagehero--accent' : '');
    var crumbParts = ['<a href="index.html">홈</a>'];
    (meta.crumb || []).forEach(function (c) {
      if (c) crumbParts.push('<span class="pagehero__crumb-sep">›</span>' + escapeHTML(c));
    });
    hero.innerHTML =
      '<div class="container">' +
        '<p class="pagehero__crumb">' + crumbParts.join('') + '</p>' +
        '<h1 class="pagehero__title">' + escapeHTML(meta.title) + '</h1>' +
        (meta.subtitle ? '<p class="pagehero__sub">' + escapeHTML(meta.subtitle) + '</p>' : '') +
      '</div>';
    // also set document title if not already done
    var t = '르비엔 — ' + meta.title;
    if (!document.title || /^르비엔/.test(document.title) === false) {
      document.title = t;
    }
  }

  /* -------- placeholder (food / fashion) -------- */
  function renderPlaceholder(meta) {
    var grid = document.getElementById('lgrid');
    var toolbar = document.querySelector('.listing__toolbar');
    if (toolbar) toolbar.hidden = true;
    if (!grid) return;
    grid.outerHTML =
      '<div class="listing__empty">' +
        '<div class="listing__empty-icon" aria-hidden="true">🌱</div>' +
        '<h3>곧 만나보실 수 있습니다</h3>' +
        '<p>' + escapeHTML(meta.emptyMsg || '준비 중입니다.') + '</p>' +
        '<p style="font-size:12px;color:var(--color-text-mute);">오픈 알림을 신청하시면 가장 먼저 알려드립니다.</p>' +
        '<form onsubmit="event.preventDefault(); var v = this.email.value.trim(); if (v) { alert(\'알림 신청이 접수되었습니다.\\n\' + v); this.reset(); }">' +
          '<input type="email" name="email" required placeholder="이메일 주소" />' +
          '<button type="submit" class="btn btn--gold">알림 신청</button>' +
        '</form>' +
      '</div>';
  }

  /* -------- filtering -------- */
  function filterProducts(type, key, all) {
    if (type === 'category') {
      return all.filter(function (p) { return p.category === key; });
    }
    if (type === 'event') {
      if (key === 'hot') {
        return all.filter(function (p) {
          return (p.tags && p.tags.indexOf('핫딜') !== -1) || (p.discountRate || 0) >= 40;
        });
      }
      if (key === 'online') {
        return all.filter(function (p) { return p.tags && p.tags.indexOf('온라인단독') !== -1; });
      }
      if (key === 'members') {
        // top-rated across all categories
        return all.slice().sort(function (a, b) {
          return (b.rating - a.rating) || ((b.discountRate || 0) - (a.discountRate || 0));
        }).slice(0, 12);
      }
      if (key === 'new') {
        var news = all.filter(function (p) { return p.tags && p.tags.indexOf('NEW') !== -1; });
        if (news.length < 4) {
          var rest = all.filter(function (p) { return news.indexOf(p) === -1; }).sort(function (a, b) { return b.rating - a.rating; });
          return news.concat(rest).slice(0, 8);
        }
        return news;
      }
      return all;
    }
    if (type === 'brand') {
      return all.filter(function (p) { return p.brand === keyToBrandName(key); });
    }
    if (type === 'search') {
      var params = new URLSearchParams(location.search);
      var q = (params.get('q') || '').trim().toLowerCase();
      var cat = params.get('cat') || 'all';
      if (!q) return [];
      var pool = cat === 'all' ? all : all.filter(function (p) { return p.category === cat; });
      return pool.filter(function (p) {
        var hay = (p.brand + ' ' + p.name + ' ' + (p.categoryLabel || '') + ' ' + (p.tags || []).join(' ')).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }
    if (type === 'all') return all.slice();
    return [];
  }

  // brand "key" → brand "name" map cache (built on first call)
  var _brandKeyToName = null;
  function keyToBrandName(key) {
    if (_brandKeyToName) return _brandKeyToName[key];
    // fallback: best-effort using last fetched brands.json via window cache
    var bs = window.__LB_BRANDS || [];
    _brandKeyToName = {};
    bs.forEach(function (b) { _brandKeyToName[b.key] = b.matchBrands && b.matchBrands[0] || b.name; });
    return _brandKeyToName[key];
  }
  // expose a setter we use right after fetch
  var _origBoot = boot;
  boot = function (type, key) {
    // intercept: stash brands once fetched
    var origFetch = Promise.all;
    return _origBoot.call(this, type, key);
  };
  // simpler: capture brands in fetch promise above. Patch _brandKeyToName build:
  // We rebuild here from `brands` passed via window after fetch.
  document.addEventListener('lb:brands-loaded', function (e) {
    _brandKeyToName = null;
    window.__LB_BRANDS = e.detail || [];
  });

  /* -------- sorting + render -------- */
  function bindSort(arr, meta) {
    var sel = document.getElementById('lsort');
    if (!sel) return;
    sel.addEventListener('change', function () {
      renderList(arr, meta);
    });
  }
  function sortBy(arr, key) {
    var copy = arr.slice();
    switch (key) {
      case 'price-asc':   copy.sort(function (a, b) { return a.salePrice - b.salePrice; }); break;
      case 'price-desc':  copy.sort(function (a, b) { return b.salePrice - a.salePrice; }); break;
      case 'discount':    copy.sort(function (a, b) { return (b.discountRate || 0) - (a.discountRate || 0); }); break;
      case 'rating':      copy.sort(function (a, b) { return b.rating - a.rating; }); break;
      case 'reviews':     copy.sort(function (a, b) { return b.reviewCount - a.reviewCount; }); break;
      default: /* recommended — keep order */ break;
    }
    return copy;
  }

  function renderList(arr, meta) {
    var grid = document.getElementById('lgrid');
    var count = document.getElementById('lcount');
    var empty = document.getElementById('lempty');
    if (!grid) return;

    var sortKey = (document.getElementById('lsort') || {}).value || 'recommended';
    var sorted = sortBy(arr, sortKey);
    if (count) count.textContent = String(sorted.length);

    if (sorted.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    var build = (window.LBcommon && window.LBcommon.buildProductCard);
    if (!build) {
      grid.innerHTML = '<li style="grid-column:1/-1;color:var(--color-text-sub);padding:24px;text-align:center;">상품 카드 빌더를 찾지 못했습니다.</li>';
      return;
    }
    grid.innerHTML = '';
    var frag = document.createDocumentFragment();
    sorted.forEach(function (p) { frag.appendChild(build(p)); });
    grid.appendChild(frag);
  }

  /* -------- utils -------- */
  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
