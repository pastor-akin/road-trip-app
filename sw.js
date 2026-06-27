const CACHE = 'road-trip-v28';
const ASSETS = ['/road-trip-app/', '/road-trip-app/index.html', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // External APIs — always network, never cache
  if (url.includes('nominatim') || url.includes('osrm') || url.includes('overpass') ||
      url.includes('tomtom') || url.includes('open-meteo') || url.includes('openstreetmap')) {
    return;
  }

  // App shell (HTML + Leaflet) — cache-first, update in background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      // Return cache instantly if available, otherwise wait for network
      return cached || networkFetch;
    })
  );
});
