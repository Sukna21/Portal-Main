const CACHE='sukna21-postevent-v40-20260923-hero-font';
const CORE=[
  './','./index.html','./results.html','./highlights.html','./archive.html',
  './css/style.css?v=20260923-hero-font-v40','./js/data.js?v=20260923-hero-font-v40','./js/app.js?v=20260923-hero-font-v40','./js/postevent.js?v=20260923-hero-font-v40',
  './assets/sukna-logo.webp','./assets/mascot.webp','./assets/partners-strip.webp',
  './assets/postevent/juara-keseluruhan.webp','./assets/postevent/olahragawan-olahragawati.webp',
  './assets/official/majlis-perasmian.webp','./assets/official/majlis-penutupan.webp',
  './assets/ui/stadium-page.webp','./assets/ui/accom-page.webp'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).catch(()=>{}));
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  const req=event.request, url=new URL(req.url);
  const accept=req.headers.get('accept')||'';
  const isNav=req.mode==='navigate'||accept.includes('text/html');
  const isCode=req.destination==='script'||req.destination==='style'||/\.(js|css)$/.test(url.pathname);
  if(isNav||isCode){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        if(fresh&&fresh.ok) (await caches.open(CACHE)).put(req,fresh.clone());
        return fresh;
      }catch(e){
        return (await caches.match(req))||(isNav?await caches.match('./index.html'):null)||Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(req);
    const network=fetch(req,{cache:'no-cache'}).then(async resp=>{
      if(resp&&resp.ok) (await caches.open(CACHE)).put(req,resp.clone());
      return resp;
    }).catch(()=>null);
    return cached||(await network)||Response.error();
  })());
});
