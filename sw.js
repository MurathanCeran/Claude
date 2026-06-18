/* J.A.R.V.I.S service worker — v3
   Strateji: uygulama kabuğu için ÖNCE AĞ (network-first) -> her açılışta
   en güncel sürüm gelir; ağ yoksa önbellekten açılır (çevrimdışı çalışır).
   Canlı API'ler (hava durumu, Wikipedia, konum) hiç önbeklenmez. */
const CACHE = "jarvis-v3";
const SHELL = ["./", "./index.html", "./jarvis-brain.js", "./manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // canlı API'leri elleme

  // ÖNCE AĞ: taze sürümü al, kopyasını önbelleğe yaz; ağ yoksa önbellek
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
  );
});
