/* Solo archivos públicos de esta app. Nunca intercepta Supabase, sesiones ni audio privado. */
const BASE=new URL('./',self.registration.scope);
const PREFIX='jj-mundo-pwa:'+BASE.pathname+':';
const CACHE=PREFIX+'v0.5.0';
const CORE=['./','index.html','style.css','config.js','app.js','api.js','engines.js','extras.js','online.js','online-party.js','party-engine.js','arena-engine.js','online-arena.js','room-live.js','piano-chart.js','characters.js','pool.js','pool-engine.js','style-ui.js','questions.js','install.js','casino.js','casino-engine.js','game-guides.js','assets/art/headpat-strip.webp','assets/art/covers/never.webp','assets/art/covers/uno.webp','assets/art/covers/likely.webp','assets/art/covers/whatif.webp','assets/art/covers/playingcards.webp','assets/art/covers/ttt.webp','assets/art/covers/lottery.webp','assets/art/covers/draw.webp','assets/art/covers/piano.webp','assets/art/covers/truth.webp','assets/art/covers/bombitas.webp','assets/art/covers/pool.webp','assets/art/covers/wands.webp','assets/art/covers/puzzle.webp','assets/art/covers/shooter.webp','assets/art/covers/tournament.webp','vendor/bombitas-engine.js','manifest.webmanifest','assets/loading.svg','assets/puzzle-sky.svg','assets/julissa-jesus.jpg','assets/characters/jj-original.png','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/icon-maskable-512.png','assets/icons/apple-touch-icon.png'];
const ALLOWED=new Set(CORE.map(p=>new URL(p,BASE).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE.map(p=>new Request(new URL(p,BASE),{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting())});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==BASE.origin)return;
 const home=url.pathname===BASE.pathname||url.pathname===new URL('index.html',BASE).pathname;
 if(request.mode==='navigate'&&home){event.respondWith((async()=>{const cache=await caches.open(CACHE),saved=await cache.match(new URL('./',BASE).href);return saved||fetch(request)})());return}
 // Las consultas personalizadas, archivos desconocidos y peticiones externas se quedan fuera de la caché.
 if(!ALLOWED.has(url.href))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),saved=await cache.match(request);return saved||fetch(request)})());
});

