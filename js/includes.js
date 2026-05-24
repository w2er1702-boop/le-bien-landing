/* ============================================================
   Le Bien — includes.js
   Replaces every <div data-include="path"></div> with the
   fetched HTML. Returns a Promise so other scripts can wait.
   Paths are resolved against the <base href> set by base.js.
   ============================================================ */
(function () {
  function loadInclude(el) {
    var src = el.getAttribute('data-include');
    if (!src) return Promise.resolve();
    return fetch(src, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('include fetch failed: ' + src + ' (' + res.status + ')');
        return res.text();
      })
      .then(function (html) {
        var tpl = document.createElement('template');
        tpl.innerHTML = html.trim();
        var frag = tpl.content;
        var parent = el.parentNode;
        // Replace the placeholder with the fetched content
        parent.insertBefore(frag, el);
        parent.removeChild(el);
      })
      .catch(function (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
      });
  }

  function loadAll() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    if (!nodes.length) return Promise.resolve();
    return Promise.all(nodes.map(loadInclude));
  }

  // Expose a promise that resolves once all includes are in the DOM.
  window.__LB_INCLUDES_READY = loadAll().then(function () {
    document.dispatchEvent(new CustomEvent('lb:includes-ready'));
  });
})();
