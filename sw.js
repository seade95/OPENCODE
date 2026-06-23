const CACHE = 'eduverse-v2';
const OFFLINE_URL = '/offline.html';

const SHELL = [
  '/',
  '/index.html',
  '/admin.html',
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-512.svg',
  '/css/style.css',
  '/js/data.js',
  '/js/ui.js',
  '/js/admin.js',
  '/js/teacher.js',
  '/js/student.js',
  '/js/features.js',
  '/js/features2.js',
  '/js/k12.js',
  '/js/admission.js',
  '/js/system.js',
  '/js/multitenant.js',
  '/js/eduverse.js',
  '/js/schoolprofile.js',
  '/js/payment-gateway.js',
  '/js/exam-simulation.js',
  '/js/report-builder.js',
  '/js/activity-games.js',
  '/js/alumni.js',
  '/js/handwriting-ocr.js',
  '/js/teacher-upload.js',
  '/js/subscription.js',
  '/js/offline-sync.js',
  '/js/screen-protection.js',
  '/js/superadmin.js',
  '/js/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-regular-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js',
  'https://js.paystack.co/v1/inline.js',
  'https://checkout.flutterwave.com/v3.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return c.addAll(SHELL).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Media / streaming — network-first
  if (url.pathname.match(/\.(mp3|mp4|ogg|wav)$/) || url.hostname.includes('youtube')) {
    e.respondWith(networkFirst(request));
    return;
  }

  // Skip non-GET
  if (request.method !== 'GET') return;

  // HTML navigation — network-first with offline fallback
  if (request.mode === 'navigate') {
    e.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Everything else — cache-first, falling back to network
  e.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    if (request.destination === 'document') {
      const fallback = await caches.match(OFFLINE_URL);
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await caches.match(OFFLINE_URL);
    return fallback || new Response('Offline', { status: 503 });
  }
}

// Listen for sync events from the client
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (e.data && e.data.type === 'CACHE_DATA') {
    if (e.data.urls && Array.isArray(e.data.urls)) {
      caches.open(CACHE).then(c => {
        e.data.urls.forEach(u => {
          if (typeof u === 'string') c.add(u).catch(() => {});
        });
      });
    }
  }
});

// Background Sync for data backup
self.addEventListener('sync', e => {
  if (e.tag === 'eduverse-data-sync') {
    e.waitUntil(syncData());
  }
});

async function syncData() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_TRIGGERED' });
  });
}
