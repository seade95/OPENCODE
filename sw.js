const CACHE = 'eduverse-v1';
const SHELL = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-512.svg',
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
  '/js/app.js',
  '/css/style.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-regular-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
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
  if (url.pathname.match(/\.(mp3|mp4|ogg|wav)$/) || url.hostname.includes('youtube')) {
    e.respondWith(networkFirst(request));
    return;
  }
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    return;
  }
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
