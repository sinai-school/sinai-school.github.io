const V='sinai-app-v3',CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const net=(r,key)=>fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(key,cp))}return res});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET')return;const u=new URL(r.url),nav=r.mode=='navigate',same=u.origin==location.origin;
 if(same&&/version\.json$/.test(u.pathname)){e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>new Response('{}',{headers:{'Content-Type':'application/json'}})));return}
 if(same){const root=u.pathname=='/'||u.pathname=='/index.html',key=root?'index.html':r;if(r.headers.get('x-fresh')){e.respondWith(net(r,key));return}
  e.respondWith(caches.match(key).then(m=>{const n=net(r,key).catch(()=>m);if(m){e.waitUntil(n.catch(()=>{}));return m}return n}));return}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res})))});
