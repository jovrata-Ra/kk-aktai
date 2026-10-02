/* KK aktai: darbas be interneto. Versija keičiasi su kiekvienu atnaujinimu. */
const V = "kk-aktai-0fb525fa4b";
const PRADZIA = ["./", "manifest.webmanifest", "icon-192.png", "apple-touch-icon.png"];
const CDN = [
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(PRADZIA).then(() =>
    Promise.all(CDN.map(u => fetch(u, {mode: "no-cors"}).then(r => c.put(u, r)).catch(() => {})))
  )));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    /* pirmiausia internetas, kad kolegos gautų naujausią versiją */
    e.respondWith(fetch(r).then(res => {
      if (res.ok) { const k = res.clone(); caches.open(V).then(c => c.put(r, k)); }
      return res;
    }).catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match("./"))));
    return;
  }
  if (u.hostname === "cdnjs.cloudflare.com" || u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    /* bibliotekos ir šriftai nesikeičia, todėl pirmiausia iš telefono */
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
      const k = res.clone(); caches.open(V).then(c => c.put(r, k)); return res;
    })));
  }
});
