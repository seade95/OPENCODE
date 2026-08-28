const CACHE = 'eduverse-v6';
const OFFLINE_URL = '/offline.html';

const SHELL = [
  '/',
  '/index.html',
  '/admin.html',
  '/superadmin.html',
  '/login.html',
  '/school-portal.html',
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-512.svg',
  '/css/style.css',
  '/js/auth.js',
  '/js/namespace.js',
  '/js/data.js',
  '/js/ui.js',
  '/js/events.js',
  '/js/app.js',
  '/js/admin.js',
  '/js/teacher.js',
  '/js/student.js',
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
  '/js/screen-protection.js',
  '/js/firebase-config.js',
  '/js/firestore-adapter.js',
  '/js/superadmin.js',
  '/js/data-sync.js',
  '/js/subdomain-middleware.js',
  '/js/path-router.js',
  '/js/feature-upgrades.js',
  '/js/features/timetable.js',
  '/js/features/hostel.js',
  '/js/features/calendar.js',
  '/js/features/website.js',
  '/js/features/cbt.js',
  '/js/features/scoregrid.js',
  '/js/features/aitools.js',
  '/js/features/misc-features.js',
  '/js/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2',
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

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Media / streaming — network-first
  if (url.pathname.match(/\.(mp3|mp4|ogg|wav)$/) || url.hostname.includes('youtube')) {
    e.respondWith(networkFirst(request));
    return;
  }

  // All navigation and static assets — cache-first with background refresh
  // This gives instant loads after the first visit
  e.respondWith(cacheFirstWithRefresh(request));
});

async function cacheFirstWithRefresh(request) {
  const cached = await caches.match(request);
  // Return cached response immediately (instant load)
  // Then fetch from network in background to keep cache fresh
  var fetchPromise = fetch(request).then(function(res) {
    if (res && res.ok) {
      var clone = res.clone();
      caches.open(CACHE).then(function(cache) { cache.put(request, clone); });
    }
    return res;
  }).catch(function() { return cached || new Response('Offline', { status: 503 }); });

  if (cached) {
    // Fire background fetch without awaiting
    fetchPromise.catch(function() {});
    return cached;
  }

  // Nothing cached — wait for network (or offline fallback)
  return fetchPromise;
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

// Listen for messages from the client
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
