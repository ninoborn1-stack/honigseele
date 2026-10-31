// Service Worker: Offline-Shell.
// Seiten und Daten immer frisch vom Server (mit Revalidierung), nur unveränderliche Dateien
// (gehashte _next/static, Bilder, Icons, Schriften) aus dem Cache. Die Version wird beim Build
// gestempelt (scripts/stamp-sw.mjs) – jeder Deploy bekommt einen neuen Cache.
const VERSION = 'honigseele-__BUILD__';
// Pfade relativ zum Scope, damit es auch im Unterordner (GitHub Pages) funktioniert
const SCOPE = self.registration.scope;
const at = (p) => new URL(p, SCOPE).href;
const SHELL = ['offline/', 'manifest.webmanifest', 'icons/icon-192.png'].map(at);
const IMMUTABLE = /\/(_next\/static|images|icons|fonts|brand)\//;

self.addEventListener('install', (event) => {
  // Neue Version übernimmt sofort, statt zu warten, bis alle Tabs geschlossen sind
  self.skipWaiting();
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).catch(() => undefined));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;

  // Unveränderliche Dateien: Cache zuerst
  if (IMMUTABLE.test(request.url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Seiten und Daten (HTML, RSC-Payload): immer beim Server nachfragen, offline aus dem Cache
  event.respondWith(
    fetch(request, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok && request.mode === 'navigate') {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request).then((r) => r || (request.mode === 'navigate' ? caches.match(at('offline/')) : Response.error()))),
  );
});
