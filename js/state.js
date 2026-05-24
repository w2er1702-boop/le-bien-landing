/* ============================================================
   Le Bien — state.js
   Client-side state via localStorage:
     LB.cart      — array of { id, qty }
     LB.wishlist  — array of product ids
     LB.recent    — LRU list of product ids (max 10)
     LB.user      — { email, nickname } | null
   Fires 'lb:state' on window after every mutation, with detail
   { type: 'cart' | 'wishlist' | 'recent' | 'user' }.
   ============================================================ */
(function () {
  var KEY = { cart: 'lb_cart', wish: 'lb_wishlist', recent: 'lb_recent', user: 'lb_user' };
  var MAX_RECENT = 10;

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function emit(type) {
    try {
      window.dispatchEvent(new CustomEvent('lb:state', { detail: { type: type } }));
    } catch (e) {}
  }

  /* ---------- Cart ---------- */
  var cart = {
    list: function () { return read(KEY.cart, []); },
    count: function () {
      return cart.list().reduce(function (acc, it) { return acc + (it.qty || 0); }, 0);
    },
    has: function (id) {
      return cart.list().some(function (it) { return it.id === id; });
    },
    add: function (id, qty) {
      qty = qty || 1;
      var items = cart.list();
      var found = false;
      items.forEach(function (it) {
        if (it.id === id) { it.qty += qty; found = true; }
      });
      if (!found) items.push({ id: id, qty: qty });
      write(KEY.cart, items);
      emit('cart');
    },
    update: function (id, qty) {
      qty = Math.max(0, qty | 0);
      var items = cart.list();
      if (qty === 0) {
        items = items.filter(function (it) { return it.id !== id; });
      } else {
        items.forEach(function (it) { if (it.id === id) it.qty = qty; });
      }
      write(KEY.cart, items);
      emit('cart');
    },
    remove: function (id) { cart.update(id, 0); },
    clear: function () { write(KEY.cart, []); emit('cart'); }
  };

  /* ---------- Wishlist ---------- */
  var wishlist = {
    list: function () { return read(KEY.wish, []); },
    count: function () { return wishlist.list().length; },
    has: function (id) { return wishlist.list().indexOf(id) !== -1; },
    toggle: function (id) {
      var ids = wishlist.list();
      var idx = ids.indexOf(id);
      if (idx === -1) ids.push(id); else ids.splice(idx, 1);
      write(KEY.wish, ids);
      emit('wishlist');
      return ids.indexOf(id) !== -1;
    },
    add: function (id) { if (!wishlist.has(id)) wishlist.toggle(id); },
    remove: function (id) { if (wishlist.has(id)) wishlist.toggle(id); }
  };

  /* ---------- Recently viewed ---------- */
  var recent = {
    list: function () { return read(KEY.recent, []); },
    add: function (id) {
      var ids = recent.list().filter(function (x) { return x !== id; });
      ids.unshift(id);
      if (ids.length > MAX_RECENT) ids = ids.slice(0, MAX_RECENT);
      write(KEY.recent, ids);
      emit('recent');
    },
    clear: function () { write(KEY.recent, []); emit('recent'); }
  };

  /* ---------- User (mock auth) ---------- */
  var user = {
    get: function () { return read(KEY.user, null); },
    isLoggedIn: function () { return !!user.get(); },
    login: function (email, nickname) {
      var u = {
        email: String(email || '').trim(),
        nickname: String(nickname || (email || '').split('@')[0] || '회원').trim()
      };
      write(KEY.user, u);
      emit('user');
      return u;
    },
    logout: function () {
      try { localStorage.removeItem(KEY.user); } catch (e) {}
      emit('user');
    }
  };

  /* ---------- Header decoration (badges + auth UI) ---------- */
  function applyHeaderState() {
    var cartBadge = document.querySelector('.cart__badge');
    if (cartBadge) {
      var c = cart.count();
      cartBadge.textContent = String(c);
      cartBadge.hidden = c === 0;
      var cartLink = cartBadge.closest('.cart');
      if (cartLink) cartLink.setAttribute('aria-label', '장바구니 (' + c + ')');
    }
    var wishBadge = document.querySelector('.wishlist__badge');
    if (wishBadge) {
      var w = wishlist.count();
      wishBadge.textContent = String(w);
      wishBadge.hidden = w === 0;
    }
    var u = user.get();
    var loggedIn = !!u;
    document.querySelectorAll('[data-auth="logged-in"]').forEach(function (el) {
      el.hidden = !loggedIn;
    });
    document.querySelectorAll('[data-auth="logged-out"]').forEach(function (el) {
      el.hidden = loggedIn;
    });
    document.querySelectorAll('.util-bar__user-name').forEach(function (el) {
      el.textContent = u ? u.nickname : '';
    });
    var logoutLink = document.querySelector('.util-bar__logout');
    if (logoutLink && !logoutLink.dataset.bound) {
      logoutLink.dataset.bound = '1';
      logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        user.logout();
      });
    }
  }

  window.addEventListener('lb:state', applyHeaderState);
  document.addEventListener('lb:includes-ready', applyHeaderState);
  // also run on plain DOM ready in case there are no includes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHeaderState);
  } else {
    applyHeaderState();
  }

  /* ---------- Format helpers (shared) ---------- */
  function formatNum(n) { return Number(n || 0).toLocaleString('ko-KR'); }
  function formatWon(n) { return formatNum(n) + '원'; }

  window.LB = {
    cart: cart,
    wishlist: wishlist,
    recent: recent,
    user: user,
    formatNum: formatNum,
    formatWon: formatWon
  };
})();
