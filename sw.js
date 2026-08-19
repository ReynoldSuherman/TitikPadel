const CACHE_NAME = 'titikpadel-app-v3';
const STATIC_ASSETS = [
  './index.html',
  './booking.html',
  './about-owner.html',
  './style.css',
  './booking.js',
  './playlist-engine.js',
  './manifest.json',
  './Logo/Logo_Padel.svg',
  './Logo/logo.png',
  './founder.png',
  './Music/Hiper Funtime.mp3',
  './Music/Jazzy Padelist.mp3',
  './Music/Lo-fi Padeltime.mp3',
  './Music/Vaporwavy Apdel.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});