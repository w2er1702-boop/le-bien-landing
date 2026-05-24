/* ============================================================
   Le Bien — product.js
   Powers /product/{id}.html. Reads the product id from
   body[data-product-id] or filename, fetches data, fills UI,
   and wires cart / wishlist / quantity / tabs.
   ============================================================ */

(function () {
  'use strict';

  function whenReady(fn) {
    var dom = new Promise(function (resolve) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resolve);
      else resolve();
    });
    var inc = window.__LB_INCLUDES_READY || Promise.resolve();
    Promise.all([dom, inc]).then(fn);
  }

  whenReady(boot);

  function getId() {
    var id = document.body.getAttribute('data-product-id');
    if (id) return id;
    var m = location.pathname.match(/\/product\/([^/?#]+?)(?:\.html)?$/);
    return m ? m[1] : null;
  }

  function boot() {
    var id = getId();
    if (!id) return showError('상품 id를 찾을 수 없습니다.');
    fetch('data/products.json', { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (all) {
        var p = all.find(function (x) { return x.id === id; });
        if (!p) return showError('해당 상품을 찾을 수 없습니다.');
        render(p, all);
        try { window.LB && window.LB.recent && window.LB.recent.add(p.id); } catch (e) {}
      })
      .catch(function () { showError('상품 정보를 불러오지 못했습니다.'); });
  }

  function showError(msg) {
    var root = document.getElementById('pdpRoot');
    if (!root) return;
    root.innerHTML =
      '<div class="container" style="padding:60px 0;text-align:center;">' +
        '<h1 style="margin:0 0 8px;font-size:22px;color:var(--color-primary);">' + esc(msg) + '</h1>' +
        '<p style="color:var(--color-text-sub);">' +
          '<a href="index.html" style="color:var(--color-accent);text-decoration:underline;">홈으로 돌아가기</a>' +
        '</p>' +
      '</div>';
  }

  function render(p, all) {
    document.title = p.brand + ' ' + p.name + ' — 르비엔 Le Bien';

    // crumb
    var crumb = document.getElementById('pdpCrumb');
    if (crumb) {
      crumb.innerHTML =
        '<a href="index.html">홈</a>' +
        '<span class="pagehero__crumb-sep">›</span>' +
        '<a href="' + categoryUrl(p.category) + '">' + esc(p.categoryLabel) + '</a>' +
        '<span class="pagehero__crumb-sep">›</span>' +
        esc(p.brand);
    }

    // gallery — main + 4 thumbs from same seed variations
    var mainImg = document.getElementById('pdpMainImg');
    var thumbs = document.getElementById('pdpThumbs');
    var seed = (p.image.match(/seed\/([^/]+)/) || [])[1] || p.id;
    var variants = [
      p.image,
      'https://picsum.photos/seed/' + seed + '-a/600/600',
      'https://picsum.photos/seed/' + seed + '-b/600/600',
      'https://picsum.photos/seed/' + seed + '-c/600/600'
    ];
    if (mainImg) {
      mainImg.src = variants[0];
      mainImg.alt = p.brand + ' ' + p.name;
      mainImg.onerror = function () { window.__fallbackImg(mainImg, p.categoryLabel); };
    }
    if (thumbs) {
      thumbs.innerHTML = '';
      variants.forEach(function (src, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', (i + 1) + '번째 이미지');
        if (i === 0) b.classList.add('is-active');
        var im = document.createElement('img');
        im.src = src; im.loading = 'lazy'; im.alt = '';
        im.onerror = function () { window.__fallbackImg(im, p.categoryLabel); };
        b.appendChild(im);
        b.addEventListener('click', function () {
          mainImg.src = src;
          Array.prototype.forEach.call(thumbs.children, function (c) { c.classList.remove('is-active'); });
          b.classList.add('is-active');
        });
        thumbs.appendChild(b);
      });
    }

    // info
    setText('pdpBrand', p.brand);
    setText('pdpName', p.name);
    var stars = (function () {
      var full = Math.round(p.rating);
      return '★★★★★☆☆☆☆☆'.slice(5 - full, 10 - full);
    })();
    setHTML('pdpRating',
      '<span class="stars" aria-hidden="true">' + stars + '</span> ' +
      '<strong>' + p.rating.toFixed(1) + '</strong> · 리뷰 ' + fmt(p.reviewCount) + '개'
    );

    // price box
    var priceBox = document.getElementById('pdpPrice');
    if (priceBox) {
      var html = '';
      html += '<div class="pdp__price-row1">';
      if (p.discountRate > 0) html += '<span class="discount">' + p.discountRate + '%</span>';
      html += '<span class="sale">' + fmt(p.salePrice) + '<span class="won">원</span></span>';
      html += '</div>';
      if (p.originalPrice > p.salePrice) {
        html += '<div class="pdp__price-row2"><del>' + fmt(p.originalPrice) + '원</del> 정가</div>';
      }
      if (p.memberPrice && p.memberPrice < p.salePrice) {
        html += '<div class="pdp__price-member"><span>회원가 (즉시할인 ₩' + fmt(p.instantDiscount || 0) + ')</span>' +
                '<span class="val">' + fmt(p.memberPrice) + '<span style="font-size:13px;margin-left:2px;">원</span></span></div>';
      }
      priceBox.innerHTML = html;
    }

    // meta list
    var meta = document.getElementById('pdpMeta');
    if (meta) {
      meta.innerHTML =
        '<dt>브랜드</dt><dd>' + esc(p.brand) + '</dd>' +
        '<dt>구성</dt><dd>' + esc(p.unit || '-') + '</dd>' +
        '<dt>카테고리</dt><dd><a href="' + categoryUrl(p.category) + '">' + esc(p.categoryLabel) + '</a></dd>' +
        '<dt>배송</dt><dd>5만원 이상 무료배송 · 평일 14:00 이전 결제 시 익일 출고</dd>' +
        '<dt>혜택</dt><dd>' + ((p.tags || []).join(', ') || '-') + '</dd>';
    }

    // qty + actions
    var qtyInput = document.getElementById('pdpQty');
    var qtyMinus = document.getElementById('pdpQtyMinus');
    var qtyPlus  = document.getElementById('pdpQtyPlus');
    var totalEl  = document.getElementById('pdpTotal');
    function recalcTotal() {
      var q = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      qtyInput.value = q;
      if (totalEl) totalEl.textContent = fmt(p.salePrice * q) + '원';
    }
    if (qtyInput && totalEl) {
      qtyInput.addEventListener('input', recalcTotal);
      qtyMinus && qtyMinus.addEventListener('click', function () {
        qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
        recalcTotal();
      });
      qtyPlus && qtyPlus.addEventListener('click', function () {
        qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1;
        recalcTotal();
      });
      recalcTotal();
    }

    // wishlist
    var wishBtn = document.getElementById('pdpWish');
    function refreshWish() {
      if (!wishBtn || !window.LB) return;
      var has = window.LB.wishlist.has(p.id);
      wishBtn.classList.toggle('is-active', has);
      wishBtn.setAttribute('aria-pressed', has ? 'true' : 'false');
      wishBtn.title = has ? '위시리스트에서 제거' : '위시리스트에 추가';
    }
    if (wishBtn && window.LB) {
      wishBtn.addEventListener('click', function () {
        window.LB.wishlist.toggle(p.id);
        refreshWish();
      });
      window.addEventListener('lb:state', refreshWish);
      refreshWish();
    }

    // cart
    var cartBtn = document.getElementById('pdpCart');
    var buyBtn  = document.getElementById('pdpBuy');
    if (cartBtn && window.LB) {
      cartBtn.addEventListener('click', function () {
        var q = Math.max(1, parseInt(qtyInput.value, 10) || 1);
        window.LB.cart.add(p.id, q);
        alert('장바구니에 담았습니다.');
      });
    }
    if (buyBtn && window.LB) {
      buyBtn.addEventListener('click', function () {
        var q = Math.max(1, parseInt(qtyInput.value, 10) || 1);
        window.LB.cart.add(p.id, q);
        location.href = 'account/cart.html';
      });
    }

    // tabs
    document.querySelectorAll('.pdp__tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        document.querySelectorAll('.pdp__tab').forEach(function (t) { t.classList.remove('is-active'); });
        document.querySelectorAll('.pdp__panel').forEach(function (pn) { pn.classList.remove('is-active'); });
        tab.classList.add('is-active');
        var pane = document.querySelector('.pdp__panel[data-pane="' + target + '"]');
        if (pane) pane.classList.add('is-active');
      });
    });

    // tab content fill
    setText('pdpReviewCount', fmt(p.reviewCount) + '개의 리뷰');
    setText('pdpRatingAvg', p.rating.toFixed(1));
    var reviewList = document.getElementById('pdpReviews');
    if (reviewList) reviewList.innerHTML = buildMockReviews(p);

    // recommended (4 from same category)
    var rec = document.getElementById('pdpRec');
    if (rec && window.LBcommon) {
      var sameCat = all.filter(function (x) { return x.category === p.category && x.id !== p.id }).slice(0, 4);
      if (sameCat.length === 0) {
        sameCat = all.filter(function (x) { return x.id !== p.id; }).slice(0, 4);
      }
      rec.innerHTML = '';
      var frag = document.createDocumentFragment();
      sameCat.forEach(function (x) { frag.appendChild(window.LBcommon.buildProductCard(x)); });
      rec.appendChild(frag);
    }
  }

  function buildMockReviews(p) {
    var samples = [
      { name: '김**', rating: 5, body: '구매 후 일주일째 잘 쓰고 있어요. 가격 대비 만족도 최상입니다.', date: '2026-05-12' },
      { name: '이**', rating: 5, body: '두 번째 구매예요. 다른 곳보다 회원가가 확실히 좋아서 계속 르비엔에서 사게 됩니다.', date: '2026-05-08' },
      { name: '박**', rating: 4, body: '품질은 좋아요. 배송이 하루 정도 더 빨랐으면 합니다.', date: '2026-04-28' }
    ];
    return samples.map(function (r) {
      var stars = '★★★★★☆☆☆☆☆'.slice(5 - r.rating, 10 - r.rating);
      return '<li style="padding:14px 0;border-bottom:1px solid var(--color-border-light);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--color-text-sub);margin-bottom:4px;">' +
          '<span><strong style="color:var(--color-primary);">' + r.name + '</strong> · <span style="color:var(--color-accent);">' + stars + '</span></span>' +
          '<span>' + r.date + '</span>' +
        '</div>' +
        '<p style="margin:0;font-size:13px;line-height:1.6;color:var(--color-text);">' + esc(r.body) + '</p>' +
      '</li>';
    }).join('');
  }

  function categoryUrl(cat) {
    var known = ['beauty', 'health', 'living', 'kitchen', 'food', 'fashion'];
    if (known.indexOf(cat) !== -1) return 'category/' + cat + '.html';
    return 'index.html';
  }

  function fmt(n) { return Number(n || 0).toLocaleString('ko-KR'); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  function setHTML(id, v) { var el = document.getElementById(id); if (el) el.innerHTML = v; }
})();
