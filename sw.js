const CACHE = 'scene-v2';
const ASSETS = [
  './',
  './index.html',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js',
];

// Installation — mise en cache des assets essentiels
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activation — supprimer les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — réseau d'abord, cache en fallback
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(e.request.url.includes('firestore.googleapis.com')) return;
  if(e.request.url.includes('googleapis.com/identitytoolkit')) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        if(response && response.status === 200){
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request).then(cached => {
          if(cached) return cached;
          return new Response('', { status: 408 });
        });
      })
  );
});
