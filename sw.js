// Service Worker minimal — active le plein écran PWA sur Android
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
