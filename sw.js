const CACHE = 'road-trip-v22';
const ASSETS = ['/', '/index.html', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting(); // activate immediately, don't wait for old tabs to close
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim(); // take control of all open tabs right away
});
self.addEventListener('fetch', e => e.respondWith(
  fetch(e.request).then(res => {
    // Always fetch fresh from network for HTML; fall back to cache for everything else
    if (e.request.url.includes('index.html') || e.request.url.endsWith('/')) {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
    }
    return res;
  }).catch(() => caches.match(e.request))
));
