const CACHE = 'scene-v1';
const ASSETS = ['/repertoire/', '/repertoire/sw.js'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Firebase et Cloudinary : toujours réseau, jamais cache
  if(e.request.url.includes('firestore') ||
     e.request.url.includes('firebase') ||
     e.request.url.includes('cloudinary')){
    e.respondWith(
      fetch(e.request).catch(() => new Response('', {status: 503}))
    );
    return;
  }
  // Tout le reste : cache en priorité, réseau en fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(response => {
        if(response.ok){
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
