const { chromium } = require('playwright'); const fs=require('fs');
const D=JSON.parse(fs.readFileSync('dump.json'));
const W=+process.argv[2]||360, N=+process.argv[3]||10, KIND=process.argv[4]||'s', OFF=process.argv[5]==='off';
(async()=>{ const b=await chromium.launch(); const errs=[]; const sum={ok:0,bad:[]};
  const pick=D.acc.filter(a=>a.key===(process.env.SK||'ug5v60ar'));
  for(const a of pick){ const ctx=await b.newContext({viewport:{width:W,height:780},isMobile:W<500,hasTouch:W<500});
    let off=false;
    await ctx.route(/sinai\.7svyn82yzr\.workers\.dev/, async r=>{ if(off) return r.abort(); const u=new URL(r.request().url()); try{const resp=await fetch('http://127.0.0.1:8787'+u.pathname+u.search,{method:r.request().method(),headers:{'content-type':'text/plain','x-ip':String(1+Math.floor(Math.random()*200))},body:r.request().postDataBuffer()||undefined}); r.fulfill({status:resp.status,headers:Object.fromEntries(resp.headers),body:Buffer.from(await resp.arrayBuffer())});}catch(e){r.abort()} });
    await ctx.route(/googleapis|gstatic|cdnjs|jsdelivr|unpkg/, r=>r.abort());
    const p=await ctx.newPage(); let cur='load'; p.on('pageerror',e=>errs.push([a.key,cur,'JS',e.message.slice(0,200)])); p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|net::|Failed to load resource|Notification|push/i.test(m.text()))errs.push([a.key,cur,'CON',m.text().slice(0,200)])}); p.on('dialog',d=>d.dismiss());
    await p.goto('http://127.0.0.1:8811/'+(process.env.PAGE||'index.html'),{waitUntil:'load'}); await p.waitForTimeout(2500);
    // log in through the real UI path: psOpen + psAuth with phone; nid field filled
    await p.getByText(a.kind==='s'?'الطلاب':'المدرسون',{exact:false}).first().click(); await p.waitForTimeout(1200);
    await p.fill('#lgu',a.kind==='s'?'students':'Teacher'); await p.fill('#lgp',a.kind==='s'?'1968':'2026@'); await p.click('#lgbtn'); await p.waitForTimeout(3500);
    if(a.kind==='s'){ await p.fill('#pk226n',a.nid); await p.getByText('بحث عن اسمي').click(); await p.waitForTimeout(2500);
      const c=p.locator('[onclick*="pk226Pick"]').first(); if(await c.count()) await c.click(); await p.waitForTimeout(2500); }
    else { const c=p.locator('button,[onclick]').filter({hasText:a.name.split(' ').slice(0,3).join(' ')}).first(); if(await c.count()) await c.click(); await p.waitForTimeout(2500); }
    const r=await p.evaluate(async a=>{ const sl=ms=>new Promise(r=>setTimeout(r,ms)); const ph=document.getElementById('psp');
      if(!ph) return {err:'nophonefield',stage:window.PS&&PS.stage,txt:document.body.innerText.slice(0,250)};
      ph.value=a.phone; ph.dispatchEvent(new Event('input',{bubbles:true}));
      const f=ph.closest('form'); const nidI=f&&[...f.querySelectorAll('input')].find(i=>i!==ph&&i.id!=='psp2'&&i.type!=='checkbox'); let pre=nidI?nidI.value:'none'; if(nidI&&!nidI.value) nidI.value=a.nid;
      const bt=f&&[...f.querySelectorAll('button')].find(b=>!b.type||b.type==='submit'); bt?bt.click():f.requestSubmit(); await sl(4500);
      return {stage:PS.stage, err:PS.err, pre:pre?'filled':'empty'}; }, a);
    if(r.stage!=='in'){ console.log('LOGIN FAIL',JSON.stringify(r).slice(0,300)); await ctx.close(); continue; }
    await p.waitForTimeout(2500);

    await p.waitForTimeout(2500);
    const T=await p.evaluate(async()=>{ const sl=ms=>new Promise(r=>setTimeout(r,ms)); document.querySelectorAll('.modal,.zoom,#nm206,#miss215').forEach(e=>e.remove());
      for (let i=0;i<10&&!(PS.b&&PS.b.tg&&PS.b.tg.length);i++){ try{ await (window.psSync||(()=>0))(); }catch(e){} await sl(2500); }
      const tabs=[...document.querySelectorAll('#portal [onclick*="PS.tab"],#portal .ptab,#portal nav button')].map(b=>b.getAttribute('onclick')).slice(0,12);
      const miss=psMissing(); const pf=PS.b.profile=PS.b.profile||{}; miss.forEach(m=>{const k=Array.isArray(m)?m[0]:(m.k||m); pf[k]=pf[k]||'x';}); PS.b.photo=PS.b.photo||'x'; if(psMissing().length) return {stillMissing:JSON.stringify(psMissing()).slice(0,300)}; for (const t of ['g']) { try{ PS.tab=t; prender(); await sl(900);}catch(e){} const bx=[...document.querySelectorAll('.box')].find(b=>/درجات المدرسين/.test(b.textContent)); if(bx){ return {tab:t,rows:[...bx.querySelectorAll('tr')].slice(1).map(tr=>[...tr.cells].map(c=>c.textContent.trim()).slice(0,2).join(' | ')+(tr.cells[1]&&tr.cells[1].classList.contains('red')?' [RED]':''))}; } }
      return {none:1, tg:(PS.b&&PS.b.tg||[]).length, tabs}; });
    console.log(a.key, JSON.stringify(T,null,0));
    await ctx.close(); }
  console.log('errs',JSON.stringify(errs.slice(0,10)));
  await b.close(); })();
