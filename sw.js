const CACHE='sukna21-v1';
const CORE=['./','./index.html','./css/style.css','./js/data.js','./js/app.js','./assets/sukna-logo.webp','./assets/mascot.webp','./assets/partners-strip.webp','./assets/hero-bg.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;}).catch(()=>caches.match('./index.html'))));});
