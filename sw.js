/* إعدادية سيناء للبنين — يفتح التطبيق من الجهاز فوراً حتى بدون إنترنت، والتحديث ينزل بالخلفية */
const V='sinai-app-v5',CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
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
/* إشعارات التبليغات بصوت: الخادم يبعث تنبيه، وهنا نجيب عنوان آخر تبليغ ونعرضه */
const PCH='sinai-push';
async function pushShow(){
 let title='إعدادية سيناء للبنين',body='وصلك تبليغ جديد — اضغط حتى تشوفه',tag='sinai-note';
 try{
  const c=await caches.open(PCH),m=await c.match('ctx');
  if(m){
   const x=await m.json(),ctl=new AbortController,tm=setTimeout(()=>ctl.abort(),8000);
   const r=await fetch(x.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(x.body),signal:ctl.signal,redirect:'follow'});
   clearTimeout(tm);
   const j=await r.json();
   if(j&&/^(wrong|wrongnid|notreg|locked|neednid)$/.test(j.err||''))await c.delete('ctx');
   const N=(j&&j.notes)||[],sm=await c.match('shown'),shown=sm?await sm.json():[];
   const n=N.find(z=>z&&z.id&&shown.indexOf(String(z.id))<0);
   if(n){title=(n.from?n.from+': ':'')+(n.title||'تبليغ جديد');body=String(n.body||'').slice(0,200)||body;tag='n'+n.id;shown.push(String(n.id));await c.put('shown',new Response(JSON.stringify(shown.slice(-300))))}
  }
 }catch(e){}
 return self.registration.showNotification(title,{body,tag,renotify:true,icon:'icon-192.png',badge:'icon-192.png',vibrate:[300,150,300,150,500],silent:false,dir:'rtl',lang:'ar',data:{u:'./'}});
}
self.addEventListener('push',e=>{e.waitUntil(pushShow().then(r=>r,()=>self.registration.showNotification('إعدادية سيناء للبنين',{body:'وصلك تبليغ جديد',icon:'icon-192.png',tag:'sinai-note'})))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{for(const c of L){if('focus' in c){try{c.postMessage({t:'nt91'})}catch(x){}return c.focus()}}return clients.openWindow('./#notes')}))});
