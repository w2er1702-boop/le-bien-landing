/* ============================================================
   Le Bien — base.js
   Must load FIRST in <head>. Sets <base href> so every link
   in every page (and inside fetched partials) resolves against
   the site root, regardless of folder depth or host.
   - GitHub Pages: /le-bien-landing/
   - Local dev (http://localhost:PORT/): /
   ============================================================ */
(function () {
  var marker = '/le-bien-landing/';
  var path = location.pathname;
  var base;
  var i = path.indexOf(marker);
  if (i === 0 || i > 0) {
    base = path.substring(0, i + marker.length);
  } else {
    base = '/';
  }
  // Insert <base> as the first element in <head> so it takes effect for all
  // subsequent relative URLs (links, scripts, stylesheets).
  var b = document.createElement('base');
  b.href = base;
  var head = document.head || document.getElementsByTagName('head')[0];
  if (head.firstChild) head.insertBefore(b, head.firstChild);
  else head.appendChild(b);
  window.__LB_BASE = base;
})();
