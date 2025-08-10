// Robust App Shell service worker
const CACHE_VERSION = 'routinier-cache-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // HTML pages: network first, fallback to cache (keeps app fresh when online)
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }

  // Same-origin static assets: cache first (fast & offline)
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(networkFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const fresh = await fetch(req);
  const cache = await caches.open(CACHE_VERSION);
  cache.put(req, fresh.clone());
  return fresh;
}

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    const cache = await caches.open(CACHE_VERSION);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    // For navigation requests, fallback to shell index
    if (req.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw e;
  }
}
