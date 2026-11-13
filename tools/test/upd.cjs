const L=require('./lib.cjs'); const fs=require('fs'); const { chromium } = require('playwright');
const T=JSON.parse(fs.readFileSync('upd_target.json'));
const sl=ms=>new Promise(r=>setTimeout(r,ms));
async function portal(a){ const o=await L.open(360,''); const p=o.p;
  await p.getByText(a.kind==='s'?'الطلاب':'المدرسون',{exact:false}).first().click(); await sl(1200);
  await p.fill('#lgu',a.kind==='s'?'students':'Teacher'); await p.fill('#lgp',a.kind==='s'?'1968':'2026@'); await p.click('#lgbtn'); await sl(3500);
  await p.evaluate(a=>psOpen(a.kind,a.key,a.name),a); await sl(2500);
  const r=await p.evaluate(async a=>{const ph=document.getElementById('psp'); if(!ph) return 'nophone:'+PS.stage; ph.value=a.phone; const f=ph.closest('form'); const n=[...f.querySelectorAll('input')].find(i=>i!==ph&&i.type!=='checkbox'); if(n&&!n.value)n.value=a.nid; const b=[...f.querySelectorAll('button')].find(b=>!b.type||b.type==='submit'); b.click(); await new Promise(r=>setTimeout(r,4500)); return PS.stage;},a);
  if(r!=='in') throw new Error('portal login '+a.key+' '+r); return o; }
const has=(p,m)=>p.evaluate(m=>{ if(document.body.innerText.includes(m))return 1; for(let i=0;i<localStorage.length;i++){const v=localStorage.getItem(localStorage.key(i)); if(v&&v.includes(m))return 2;} try{ if(typeof ST!=='undefined'&&JSON.stringify(ST).includes(m))return 3;}catch(e){} try{ if(window.PS&&JSON.stringify(PS.b||{}).includes(m))return 4;}catch(e){} return 0;},m).catch(()=>0);
async function race(pages,m,max){ const t0=Date.now(), got={}; while(Date.now()-t0<max){ for(const [k,p] of Object.entries(pages)) if(!(k in got)&&await has(p,m)) got[k]=((Date.now()-t0)/1000).toFixed(1); if(Object.keys(got).length===Object.keys(pages).length)break; await sl(300);} return got; }
(async()=>{
  const O=await L.staff(1366); const S=await L.staff(1366,'tststf'); const Pt=await portal(T.t); const Ps=await portal(T.s);
  console.log('all logged in');
  // 1) owner renames target student → measure arrival
  const M1='اختبارأ'+Date.now()%1000;
  const t0=Date.now(); await O.p.evaluate(([id,m])=>{const s=ST.find(x=>x.id===id); s.n=s.n+' '+m; P.st();},[T.sid,M1]);
  // teacher portal shows students in "طلابي" tab; open it so text check works
  await Pt.p.evaluate(()=>{const b=[...document.querySelectorAll('.daytabs button')].find(b=>/طلاب/.test(b.textContent)); b&&b.click();}).catch(()=>{});
  const g1=await race({staff:S.p,teacher:Pt.p,student:Ps.p},M1,150000); console.log('1) owner edit → arrival seconds',JSON.stringify(g1));
  // 2) permission account edit → owner + portal
  const M2='اختبارب'+Date.now()%1000;
  await S.p.evaluate(([id,m])=>{const s=ST.find(x=>x.id===id); s.n=s.n+' '+m; P.st();},[T.sid,M2]);
  const g2=await race({owner:O.p,teacher:Pt.p,student:Ps.p},M2,150000); console.log('2) staff edit → arrival seconds',JSON.stringify(g2));
  // 3) STALE: staff goes offline, owner edits another student + config; staff edits a third student + config offline; staff back online
  await S.ctx.setOffline(true); await sl(1500);
  const M3='اختبارج'+Date.now()%1000, M4='اختبارد'+Date.now()%1000;
  await O.p.evaluate(([id,m])=>{const s=ST.find(x=>x.id===id); s.n=s.n+' '+m; P.st(); AB=37; P.cfg();},[T.other,M3]); await sl(4000);
  await S.p.evaluate(([id,m])=>{const s=ST[ST.length-1]; s.n=s.n+' '+m; P.st(); TMS=TMS; window.__ab=AB; P.cfg();},[T.other,M4]); await sl(2000);
  await S.ctx.setOffline(false); await sl(25000);
  const srv=async p=>{const r=await fetch('http://127.0.0.1:8787/',{method:'POST',body:JSON.stringify({})}).catch(()=>null); return r;};
  const chk=await O.p.evaluate(([m3,m4])=>({ownerHasM3:JSON.stringify(ST).includes(m3),ownerHasM4:JSON.stringify(ST).includes(m4),AB}),[M3,M4]);
  const chk2=await S.p.evaluate(([m3,m4])=>({staffHasM3:JSON.stringify(ST).includes(m3),staffHasM4:JSON.stringify(ST).includes(m4),AB,queue:document.body.innerText.match(/محفوظ[^\n]{0,40}/)?.[0]||''}),[M3,M4]);
  console.log('3) stale staff device:',JSON.stringify(chk),JSON.stringify(chk2));
  // 4) read-only account cannot write
  const R=await L.staff(1366,'tstro'); const M5='اختباره'; await R.p.evaluate(m=>{try{ST[0].n+=' '+m;P.st();}catch(e){}},M5); await sl(6000);
  const g5=await has(O.p,M5); console.log('4) read-only write reached owner?',g5?'YES (BAD)':'no');
  const errs=[...O.errs,...S.errs,...Pt.errs,...Ps.errs,...R.errs]; console.log('errs',JSON.stringify(errs).slice(0,800));
  for(const o of [O,S,Pt,Ps,R]) await o.b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1)});
