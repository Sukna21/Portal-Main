const CACHE='sukna21-v3-20260915';
const CORE=[
  './','./index.html','./css/style.css?v=20260915c','./js/data.js?v=20260915c','./js/app.js?v=20260915c',
  './assets/sukna-logo.webp','./assets/mascot.webp','./assets/partners-strip.webp',
  './assets/ui/official-cover.webp','./assets/ui/stadium-page.webp','./assets/ui/accom-page.webp','./assets/icons/sepak-takraw.svg','./assets/official/aturcara-penuh.webp'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).catch(()=>{}));
});

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  const isNav = req.mode === 'navigate' || (req.headers.get('accept')||'').includes('text/html');

  if (isNav) {
    // Network-first so portal updates are visible immediately after deployment.
    event.respondWith((async()=>{
      try {
        const fresh = await fetch(req, {cache:'no-store'});
        const cache = await caches.open(CACHE);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Stale-while-revalidate for static assets.
  event.respondWith((async()=>{
    const cached = await caches.match(req);
    const network = fetch(req).then(async resp => {
      if (resp && resp.ok) {
        const cache = await caches.open(CACHE);
        cache.put(req, resp.clone());
      }
      return resp;
    }).catch(()=>null);
    return cached || (await network) || Response.error();
  })());
});
