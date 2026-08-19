const CACHE_NAME = 'titikpadel-app-v10';
const STATIC_ASSETS = [
  './index.html',
  './booking.html',
  './style.css',
  './app.js',
  './booking.js',
  './manifest.json'
];

// 1. Install Service Worker & Tangani Asset secara Aman
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Menggunakan Promise.allSettled agar jika ada 1 file yang gagal/tidak ada, 
      // tidak membuat proses instalasi service worker error total.
      return Promise.allSettled(
        STATIC_ASSETS.map(asset => cache.add(asset).catch(err => console.warn('Gagal cache asset:', asset, err)))
      );
    })
  );
  self.skipWaiting();
});

// 2. Aktivasi & Bersihkan Cache Lama
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

// 3. Pesan untuk Skip Waiting dari app.js
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 4. Fetch Handler dengan Proteksi Status 206 (Partial Content) & Audio Stream
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Abaikan request non-GET atau protokol selain http/https
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Lewati cache untuk file audio (.mp3) atau request dengan header range (mencegah error 206)
  if (url.pathname.endsWith('.mp3') || event.request.headers.has('range')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Hanya simpan ke cache jika respons benar-benar sukses (status 200)
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});