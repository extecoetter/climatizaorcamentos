const CACHE_NAME = "re-orcamento-v16-stability";
const ASSETS = [
  "./",
  "./index.html",
  "./sw.js"
];

self.addEventListener("message", function (event) {
  if (event && event.data && event.data.type === "SKIP_WAITING") {
    try { self.skipWaiting(); } catch (e) {}
  }
});

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      try { return self.skipWaiting(); } catch (e) {}
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_NAME) return caches.delete(k);
      }));
    }).then(function () {
      try { return self.clients.claim(); } catch (e) {}
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;

  // network-first para navegação (evita ficar preso em versão antiga)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put("./index.html", copy);
        });
        return res;
      }).catch(function () {
        return caches.match("./index.html");
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(req, copy);
        });
        return res;
      });
    })
  );
});
