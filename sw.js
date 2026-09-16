const CACHE='sukna21-v31-20260916-gatorade-silver';
const CORE=[
  './','./index.html','./css/style.css?v=20260916-gatorade-v31','./js/data.js?v=20260916-gatorade-v31','./js/app.js?v=20260916-gatorade-v31',
  './assets/sukna-logo.webp','./assets/mascot.webp','./assets/partners-strip.webp',
  './assets/ui/official-cover.webp','./assets/ui/stadium-page.webp','./assets/ui/accom-page.webp','./assets/icons/sepak-takraw.svg','./assets/official/majlis-perasmian.webp','./assets/official/majlis-penutupan.webp','./assets/official/tarikh-penting.webp','./assets/official/jadual-acara.webp','./assets/sponsors/logos/platinum/mbi.webp','./assets/sponsors/logos/platinum/kusel.webp','./assets/sponsors/logos/platinum/sd-guthrie.webp','./assets/sponsors/logos/platinum/ytsb.webp','./assets/sponsors/logos/gold/kdeb.webp','./assets/sponsors/logos/gold/scientex-bestari-jaya.webp','./assets/sponsors/logos/gold/sime-darby-property.webp','./assets/sponsors/logos/gold/alam-rancang.webp','./assets/sponsors/logos/gold/landasan-lumayan.webp','./assets/sponsors/logos/gold/avaland.webp','./assets/sponsors/logos/silver/cyberview.webp','./assets/sponsors/logos/silver/pnsb.webp','./assets/sponsors/logos/silver/worldwide-holdings.webp','./assets/sponsors/logos/silver/uem-sunrise.webp','./assets/sponsors/logos/silver/osk-property.webp','./assets/sponsors/logos/silver/gatorade.webp','./assets/sponsors/platinum.webp','./assets/sponsors/gold.webp','./assets/sponsors/silver.webp','./assets/official/flow-majlis-perasmian.webp'
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
  const url = new URL(req.url);
  const accept = req.headers.get('accept') || '';
  const isNav = req.mode === 'navigate' || accept.includes('text/html');
  const isCode = req.destination === 'script' || req.destination === 'style' || /\.(js|css)$/.test(url.pathname);

  if (isNav || isCode) {
    // Network-first for pages, JS and CSS so mobile Safari does not keep stale schedules.
    event.respondWith((async()=>{
      try {
        const fresh = await fetch(req, {cache:'no-store'});
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (e) {
        return (await caches.match(req)) || (isNav ? await caches.match('./index.html') : null) || Response.error();
      }
    })());
    return;
  }

  // Stale-while-revalidate for images and other static assets.
  event.respondWith((async()=>{
    const cached = await caches.match(req);
    const network = fetch(req, {cache:'no-cache'}).then(async resp => {
      if (resp && resp.ok) {
        const cache = await caches.open(CACHE);
        cache.put(req, resp.clone());
      }
      return resp;
    }).catch(()=>null);
    return cached || (await network) || Response.error();
  })());
});
