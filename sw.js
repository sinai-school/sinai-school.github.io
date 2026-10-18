/* إعدادية سيناء للبنين — يفتح التطبيق من الجهاز فوراً حتى بدون إنترنت، والتحديث ينزل بالخلفية */
const V='sinai-app-v3',CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.match(u).then(m=>m||c.add(u)).catch(()=>{})))).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V&&/^sinai-app/.test(x)).map(x=>caches.open(V).then(c=>c.match('index.html')).then(m=>m?caches.delete(x):0)))).then(()=>self.clients.claim()))});
const put=(key,res)=>{if(res&&(res.ok||res.type=='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(key,cp)).catch(()=>{})}return res};
const net=(r,key)=>fetch(r,{cache:'no-store'}).then(res=>res&&res.ok?put(key,res):res);
const page=()=>caches.open(V).then(c=>c.match('index.html').then(m=>m||c.match('./')));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET')return;const u=new URL(r.url),same=u.origin==location.origin;
 if(!same&&/(^|\.)script\.google(usercontent)?\.com$|(^|\.)api\.github\.com$/.test(u.hostname))return;
 if(same&&/version\.json$/.test(u.pathname)){e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>new Response('{}',{headers:{'Content-Type':'application/json'}})));return}
 const root=same&&(r.mode=='navigate'||u.pathname=='/'||/\/index\.html$/.test(u.pathname));
 if(root){if(r.headers.get('x-fresh')){e.respondWith(net(r,'index.html'));return}
  e.respondWith(page().then(m=>m||fetch(r).then(res=>res&&res.ok?put('index.html',res):res)).catch(()=>page().then(m=>m||Response.error())));return}
 if(same){e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(res=>put(r,res)).catch(()=>m);if(m){e.waitUntil(n.catch(()=>{}));return m}return n}));return}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>put(r,res))))});
