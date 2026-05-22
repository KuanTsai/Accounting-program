const CACHE = 'kotomo-v1';
const ASSETS = [
  '/Accounting-program/',
  '/Accounting-program/index.html',
  '/Accounting-program/manifest.json',
  '/Accounting-program/icons/icon-192.png',
  '/Accounting-program/icons/icon-512.png',
  '/Accounting-program/project/styles.css',
  '/Accounting-program/project/app.jsx',
  '/Accounting-program/project/ios-frame.jsx',
  '/Accounting-program/project/tweaks-panel.jsx',
  '/Accounting-program/project/fox.jsx',
  '/Accounting-program/project/categories.jsx',
  '/Accounting-program/project/screen-home.jsx',
  '/Accounting-program/project/screen-add.jsx',
  '/Accounting-program/project/screen-stats.jsx',
  '/Accounting-program/project/screen-diary.jsx',
  '/Accounting-program/project/screen-profile.jsx',
  '/Accounting-program/project/screen-budget.jsx',
  '/Accounting-program/project/screen-vault.jsx',
  '/Accounting-program/project/screen-new-goal.jsx',
  '/Accounting-program/project/screen-pot-action.jsx',
  '/Accounting-program/project/screen-categories.jsx',
  '/Accounting-program/project/screen-fox.jsx',
  '/Accounting-program/project/screen-onboarding.jsx',
  '/Accounting-program/project/screen-close.jsx',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/Accounting-program/'));
    })
  );
});
