const CACHE = 'bytecore-shell-v5';
const BYTECORE_CACHES = new Set([
  'bytecore-shell-v1',
  'bytecore-shell-v2',
  'bytecore-shell-v3',
  'bytecore-shell-v4',
  CACHE
]);

const SHELL = [
  './',
  './index.html',
  './academics.html',
  './styles/bytecore-2-1.css',
  './styles/reference-bytecore.css',
  './styles/bytecore.css',
  './app.js',
  './spatial.js',
  './three-world-core.js',
  './three-world.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => BYTECORE_CACHES.has(key) && key !== CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(
          (cached) => cached || caches.match('./index.html')
        )
      )
  );
});
