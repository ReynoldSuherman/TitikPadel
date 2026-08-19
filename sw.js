const CACHE_NAME = 'titikpadel-tangerang-v7';
const STATIC_ASSETS = [
  './index.html',
  './booking.html',
  './about-owner.html',
  './style.css',
  './app.js',
  './booking.js',
  './manifest.json',
  './Logo/Logo_padel.svg',
  './Logo/logo.png',
  './founder.png'
];

// Install Event: Simpan aset statis dasar ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Hapus cache versi lama secara otomatis
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

// Fetch Event: Bypass audio MP3 & header Range untuk menghindari error put status 206
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Jangan cache file audio MP3 atau request dengan Range Header
  if (url.pathname.endsWith('.mp3') || event.request.headers.has('range')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Hanya simpan respon utuh (status 200)
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});