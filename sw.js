/* إعدادية سيناء للبنين — v204: يفتح فوراً من الجهاز (حتى بدون إنترنت أو إنترنت ضعيف جداً)، والنسخة الجديدة تنزل بالخلفية وتتطبق وحدها.
   الملفات والصور المرفقة والخطوط والمكتبات تنحفظ بذاكرة دائمية ما تنمسح مع التحديثات، فتنفتح فوراً بعد أول مرة. */
const V='sinai-app-v8',EXT='sinai-ext',CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','img/logo_s.png','img/logo_ui.png','img/logo_m.png','img/logo_cal.png','img/img_cal2.png','img/j2eagle.png','img/j2seal.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(async c=>{
 /* ننقل النسخ المحفوظة من الذاكرة القديمة (حتى ما ينتظر تحميل جديد)، وبعدين نجيب الأحدث */
 const ks=(await caches.keys()).filter(k=>/^sinai-app/.test(k)&&k!=V);
 for(const u of CORE){let m=null;for(const k of ks){m=await (await caches.open(k)).match(u);if(m)break}
  try{const r=await fetch(u);if(r&&r.ok){await c.put(u,r);continue}}catch(x){}
  if(m)await c.put(u,m)}
}).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V&&/^sinai-app/.test(x)).map(x=>caches.open(V).then(c=>c.match('index.html')).then(m=>m?caches.delete(x):0)))).then(()=>self.clients.claim()))});
const put=(cn,key,res)=>{if(res&&(res.ok||res.type=='opaque')){const cp=res.clone();caches.open(cn).then(c=>c.put(key,cp)).catch(()=>{})}return res};
const page=()=>caches.open(V).then(c=>c.match('index.html').then(m=>m||c.match('./')));
let LASTV='';
async function fresh(){
 try{const r=await fetch('index.html',{cache:'no-cache'});if(!r||!r.ok)return;
  const t=await r.clone().text(),m=t.match(/window\.APP_VER="([^"]*)"/),v=m?m[1]:'';
  if(t.length<2e5||!v)return;
  const c=await caches.open(V),old=await c.match('index.html');let ov='';
  if(old){const ot=await old.text(),om=ot.match(/window\.APP_VER="([^"]*)"/);ov=om?om[1]:''}
  await c.put('index.html',new Response(t,{headers:{'Content-Type':'text/html; charset=utf-8'}}));
  if(ov&&v!=ov&&v!=LASTV){LASTV=v;(await self.clients.matchAll({type:'window'})).forEach(cl=>{try{cl.postMessage({t:'upd204',v})}catch(x){}})}
 }catch(x){}
}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET')return;const u=new URL(r.url),same=u.origin==location.origin;
 if(!same&&/(^|\.)script\.google(usercontent)?\.com$|(^|\.)api\.github\.com$/.test(u.hostname))return;
 if(same&&/version\.json$/.test(u.pathname)){e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>new Response('{}',{headers:{'Content-Type':'application/json'}})));return}
 const root=same&&(r.mode=='navigate'||u.pathname=='/'||/\/index\.html$/.test(u.pathname));
 if(root){
  if(r.headers.get('x-fresh')){e.respondWith(fetch('index.html',{cache:'no-cache'}).then(res=>res&&res.ok?put(V,'index.html',res):res).catch(()=>page().then(m=>m||Response.error())));return}
  /* يفتح فوراً من الجهاز، والأحدث ينزل بالخلفية */
  e.respondWith(page().then(m=>{if(m){e.waitUntil(fresh());return m}return fetch('index.html',{cache:'no-cache'}).then(res=>res&&res.ok?put(V,'index.html',res):res).catch(()=>fetch('index.html',{cache:'force-cache'}))}).catch(()=>page().then(m=>m||caches.match(r,{ignoreSearch:true})).then(m=>m||Response.error())));return}
 if(same){e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(res=>put(V,r,res)).catch(()=>m);if(m){e.waitUntil(n.catch(()=>{}));return m}return n}));return}
 /* ملفات المرفقات (/f/…) والخطوط والمكتبات: من الذاكرة الدائمية أولاً */
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>put(EXT,r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||Response.error()))))});
self.addEventListener('message',e=>{const d=e.data||{};if(d.t=='keep204'&&Array.isArray(d.u)){e.waitUntil(caches.open(EXT).then(async c=>{for(const u of d.u.slice(0,60)){try{if(await c.match(u))continue;const r=await fetch(u);if(r&&r.ok)await c.put(u,r)}catch(x){}}}))}if(d.t=='fresh204')e.waitUntil(fresh())});
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
