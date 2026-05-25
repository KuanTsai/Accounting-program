// Cache version — bump this with every release to purge stale caches
const CACHE = 'kotomo-v0.3.1';

// Pre-cache only truly static assets (icons never change)
const PRECACHE = [
  '/Accounting-program/icons/icon-192.png',
  '/Accounting-program/icons/icon-512.png',
  '/Accounting-program/icons/favicon.png',
  '/Accounting-program/icons/og-cover.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // External CDN (React, Firebase, fonts) → cache-first (they never change)
  if (url.origin !== self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        });
      })
    );
    return;
  }

  // Own app files → network-first, cache as offline fallback
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(cached => cached || caches.match('/Accounting-program/'))
    )
  );
});
