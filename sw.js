/* J.A.R.V.I.S service worker — uygulamayı kurulabilir + çevrimdışı yapar.
   Kabuğu önbelleğe alır; canlı veriler (hava durumu, Wikipedia) ağdan gelir. */
const CACHE = "jarvis-v1";
const SHELL = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Canlı API'leri (hava durumu, Wikipedia, konum) önbelleğe alma — her zaman ağdan
  if (url.origin !== self.location.origin) return;
  // Uygulama kabuğu: önce önbellek, sonra ağ
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
