const CACHE_NAME = 'lepoint-city-v1';
const STATIC_ASSETS = [
  '/lepoint-city/index.html',
  '/lepoint-city/map.html',
  '/lepoint-city/game.html',
  '/lepoint-city/scoreboard.html',
  '/lepoint-city/admin.html',
  '/lepoint-city/css/common.css',
  '/lepoint-city/js/config.js',
  '/lepoint-city/js/auth.js',
  '/lepoint-city/js/api.js',
  '/lepoint-city/js/audio.js',
  '/lepoint-city/js/gps.js',
  '/lepoint-city/js/broadcast.js',
  '/lepoint-city/js/chat.js',
  '/lepoint-city/js/scoreboard-engine.js',
  '/lepoint-city/js/games/memory.js',
  '/lepoint-city/js/games/whack.js',
  '/lepoint-city/js/games/quiz.js',
  '/lepoint-city/js/games/snake.js',
  '/lepoint-city/assets/icons/icon-192.png',
  '/lepoint-city/assets/icons/icon-512.png',
  '/lepoint-city/manifest.json'
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

  if (url.hostname === 'script.google.com') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
