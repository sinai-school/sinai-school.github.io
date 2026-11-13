const { chromium } = require('playwright'); const fs=require('fs');
const D=JSON.parse(fs.readFileSync('dump.json'));
const W=+process.argv[2]||360, N=+process.argv[3]||10, KIND=process.argv[4]||'s', OFF=process.argv[5]==='off';
(async()=>{ const b=await chromium.launch(); const errs=[]; const sum={ok:0,bad:[]};
  const accs=D.acc.filter(a=>a.kind===KIND&&a.nid); const pick=accs.filter((_,i)=>i%Math.max(1,Math.floor(accs.length/N))===0).slice(0,N);
  for(const a of pick){ const ctx=await b.newContext({viewport:{width:W,height:780},isMobile:W<500,hasTouch:W<500});
    let off=false;
    await ctx.route(/sinai\.7svyn82yzr\.workers\.dev/, async r=>{ if(off) return r.abort(); const u=new URL(r.request().url()); try{const resp=await fetch('http://127.0.0.1:8787'+u.pathname+u.search,{method:r.request().method(),headers:{'content-type':'text/plain','x-ip':String(1+Math.floor(Math.random()*200))},body:r.request().postDataBuffer()||undefined}); r.fulfill({status:resp.status,headers:Object.fromEntries(resp.headers),body:Buffer.from(await resp.arrayBuffer())});}catch(e){r.abort()} });
    await ctx.route(/googleapis|gstatic|cdnjs|jsdelivr|unpkg/, r=>r.abort());
    const p=await ctx.newPage(); let cur='load'; p.on('pageerror',e=>errs.push([a.key,cur,'JS',e.message.slice(0,200)])); p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|net::|Failed to load resource|Notification|push/i.test(m.text()))errs.push([a.key,cur,'CON',m.text().slice(0,200)])}); p.on('dialog',d=>d.dismiss());
    await p.goto('http://127.0.0.1:8811/index.html',{waitUntil:'load'}); await p.waitForTimeout(2500);
    // log in through the real UI path: psOpen + psAuth with phone; nid field filled
    await p.getByText(a.kind==='s'?'الطلاب':'المدرسون',{exact:false}).first().click(); await p.waitForTimeout(1200);
    await p.fill('#lgu',a.kind==='s'?'students':'Teacher'); await p.fill('#lgp',a.kind==='s'?'1968':'2026@'); await p.click('#lgbtn'); await p.waitForTimeout(3500);
    if(a.kind==='s'){ await p.fill('#pk226n',a.nid); await p.getByText('بحث عن اسمي').click(); await p.waitForTimeout(2500);
      const nm=a.name.split(' ').slice(0,2).join(' '); const c=p.locator('button,[onclick]').filter({hasText:nm}).first(); if(await c.count()) await c.click(); await p.waitForTimeout(2500); }
    else { const c=p.locator('button,[onclick]').filter({hasText:a.name.split(' ').slice(0,3).join(' ')}).first(); if(await c.count()) await c.click(); await p.waitForTimeout(2500); }
    const r=await p.evaluate(async a=>{ const sl=ms=>new Promise(r=>setTimeout(r,ms)); const ph=document.getElementById('psp');
      if(!ph) return {err:'nophonefield',stage:window.PS&&PS.stage,txt:document.body.innerText.slice(0,250)};
      ph.value=a.phone; ph.dispatchEvent(new Event('input',{bubbles:true}));
      const f=ph.closest('form'); const nidI=f&&[...f.querySelectorAll('input')].find(i=>i!==ph&&i.id!=='psp2'&&i.type!=='checkbox'); let pre=nidI?nidI.value:'none'; if(nidI&&!nidI.value) nidI.value=a.nid;
      const bt=f&&[...f.querySelectorAll('button')].find(b=>!b.type||b.type==='submit'); bt?bt.click():f.requestSubmit(); await sl(4500);
      return {stage:PS.stage, err:PS.err, pre:pre?'filled':'empty'}; }, a);
    if(r.stage!=='in'){ sum.bad.push([a.key,JSON.stringify(r).slice(0,200)]); await ctx.close(); continue; }
    await p.waitForTimeout(2500);
    // close modals (notifications prompt etc)
    const tabs=await p.evaluate(()=>[...document.querySelectorAll('.daytabs button')].map(b=>b.textContent.trim()));
    const tr=[];
    for(let i=0;i<tabs.length;i++){ cur=tabs[i]; const x=await p.evaluate(async i=>{const bs=[...document.querySelectorAll('.daytabs button')]; if(!bs[i])return 'nobtn'; const oc=bs[i].getAttribute('onclick')||''; if(bs[i].disabled){ try{ new Function(oc)(); }catch(e){ return 'EX '+e } } else bs[i].click(); await new Promise(r=>setTimeout(r,700));
        const over=document.documentElement.scrollWidth>innerWidth+2; const lat=[...document.querySelectorAll('#portal *, body > *')].filter(e=>e.children.length===0&&/\d/.test(e.textContent)&&!e.closest('input,textarea,a,[dir=ltr],.ltr,code')&&/(^|[^A-Za-z@.\/:_-])\d+([^A-Za-z@.\/:_-]|$)/.test(e.textContent)&&e.offsetParent).map(e=>e.textContent.trim().slice(0,30)).slice(0,3);
        return {over,lat,len:document.body.innerText.length};},i); tr.push([tabs[i],x]); }
    if(OFF){ off=true; await p.reload({waitUntil:'load'}).catch(()=>{}); await p.waitForTimeout(4000); const s=await p.evaluate(()=>({stage:window.PS&&PS.stage,off:window.PS&&PS.off,len:document.body.innerText.length,txt:document.body.innerText.slice(0,260)})).catch(e=>({e:String(e)})); tr.push(['OFFLINE',s]); off=false; }
    sum.ok++; sum[a.key]=tr; await ctx.close(); }
  fs.writeFileSync(`portal_${KIND}_${W}${OFF?'_off':''}.json`,JSON.stringify({sum,errs},null,1));
  console.log(KIND,W,'ok',sum.ok,'bad',JSON.stringify(sum.bad).slice(0,800),'errs',errs.length,JSON.stringify(errs.slice(0,8)));
  await b.close(); })();
