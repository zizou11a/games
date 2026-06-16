// ═══════════════════════════════════════════
//  Playx Service Worker — sw.js
//  Offline support · Cache · Fast loading
// ═══════════════════════════════════════════

const CACHE_NAME   = 'playx-v1';
const STATIC_CACHE = 'playx-static-v1';

// Files to cache immediately on install
const PRECACHE = [
  '/playx.html',
  '/games.html',
  '/leaderboard.html',
  '/shadow-runner.html',
  '/quiz.html',
  '/word-blitz.html',
  '/404.html',
  '/xp.js',
  '/profilebar.js',
  '/supabase.js',
  '/auth-ui.js',
  '/manifest.json',
];

// ── Install ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE).catch(err => {
        console.warn('[SW] Precache partial fail:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== STATIC_CACHE)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch (Cache First for assets, Network First for pages) ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and external requests (Supabase API, fonts)
  if (request.method !== 'GET') return;
  if (!url.origin.includes(self.location.origin) &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) return;

  // Fonts & static assets → Cache First
  if (url.hostname.includes('fonts') ||
      request.destination === 'image' ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.json')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages → Network First with offline fallback
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirst(request));
    return;
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline fallback page
    const fallback = await caches.match('/404.html');
    return fallback || new Response('<h1>You are offline</h1>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// ── Background Sync (score submission) ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-scores') {
    event.waitUntil(syncPendingScores());
  }
});

async function syncPendingScores() {
  // When back online, re-send any scores saved while offline
  const pending = await getPendingScores();
  for (const score of pending) {
    try {
      await fetch('/api/scores', {
        method: 'POST',
        body: JSON.stringify(score),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch { break; }
  }
}

async function getPendingScores() { return []; }

// ── Push Notifications (daily challenge) ──
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Playx', {
      body:    data.body || "Today's Word Blitz challenge is ready! 🔥",
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-72.png',
      data:    { url: data.url || '/word-blitz.html' },
      actions: [
        { action: 'play',   title: '▶ Play Now' },
        { action: 'later',  title: 'Later'      },
      ],
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'play') {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
