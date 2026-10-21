// Service Worker: Offline-Shell. Seiten network-first, statische Dateien cache-first.
const VERSION = 'honigseele-v1';
// Pfade relativ zum Scope, damit es auch im Unterordner (GitHub Pages) funktioniert
const SCOPE = self.registration.scope;
const at = (p) => new URL(p, SCOPE).href;
const SHELL = ['./', 'behandlungen/', 'buchen/', 'shop/', 'konto/', 'kurse/', 'offline/', 'manifest.webmanifest', 'icons/icon-192.png'].map(at);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  const isPage = request.mode === 'navigate';
  if (isPage) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match(at('offline/')))),
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          if (res.ok && /\/(_next\/static|images|icons|fonts)\//.test(request.url)) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(request, copy));
          }
          return res;
        }),
    ),
  );
});
