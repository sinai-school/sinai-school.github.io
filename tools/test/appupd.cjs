const L=require('./lib.cjs'); const fs=require('fs'); const R='/home/claude/sinai-school.github.io/';
const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ const S=await L.staff(1366,'tststf'); const P=await L.open(360,''); await sl(3000);
  const v0=JSON.parse(fs.readFileSync(R+'version.json')).v, v1=v0.replace(/-v[0-9a-z]+$/,'-vT'+Date.now()%1000);
  const idx0=fs.readFileSync(R+'index.html','utf8'); fs.copyFileSync(R+'index.html','/tmp/idx.bak'); fs.copyFileSync(R+'version.json','/tmp/ver.bak');
  try{ fs.writeFileSync(R+'index.html',idx0.replace('window.APP_VER="'+v0+'";','window.APP_VER="'+v1+'";')); fs.writeFileSync(R+'version.json',JSON.stringify({v:v1}));
    const t0=Date.now(), got={}; while(Date.now()-t0<40000){ for(const [k,o] of [['staff',S.p],['portal',P.p]]) if(!got[k]){ const v=await o.p?.evaluate?.(()=>window.APP_VER).catch(()=>null) ?? await o.evaluate(()=>window.APP_VER).catch(()=>null); if(v===v1) got[k]=((Date.now()-t0)/1000).toFixed(1);} if(got.staff&&got.portal)break; await sl(300);} console.log('app/page update seconds',JSON.stringify(got)); console.log(await S.p.evaluate(async()=>[window.APP_VER, await (await fetch('version.json?t='+Date.now())).text(), typeof __chkUpd, location.href]));
    const still=await S.p.evaluate(()=>!document.getElementById('app').hidden).catch(()=>'?'); console.log('staff still logged in after update:',still);
  } finally { fs.copyFileSync('/tmp/idx.bak',R+'index.html'); fs.copyFileSync('/tmp/ver.bak',R+'version.json'); }
  await S.b.close(); await P.b.close(); })();
