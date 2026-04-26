const CACHE_NAME = 'gomi-kaishuu-v1';
const STATIC_ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Firebase・CDN はネットワーク優先（キャッシュしない）
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('unpkg.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // ローカルリソースはキャッシュ優先、失敗時はネットワーク
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
