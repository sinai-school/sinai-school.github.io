const { chromium } = require('playwright'); const fs=require('fs');
const D=JSON.parse(fs.readFileSync('dump.json'));
const W=+process.argv[2]||360, N=+process.argv[3]||10, KIND=process.argv[4]||'s', OFF=process.argv[5]==='off';
(async()=>{ const b=await chromium.launch(); const errs=[]; const sum={ok:0,bad:[]};
  const pick=D.acc.filter(a=>a.kind==='t'&&a.nid&&(process.env.TK||'st024').split(',').includes(a.key));
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

    const T=await p.evaluate(async()=>{ const sl=ms=>new Promise(r=>setTimeout(r,ms)); const out={};
      const sel=()=>[...document.querySelectorAll('.g202 select')]; const opts=s=>[...s.options].map(o=>o.textContent.trim()); const has=()=>!!document.getElementById('gs_all');
      PS.tab='d'; prender(); await sl(1500);
      let S=sel(); out.start={selects:S.map(opts),table:has(),rows:document.querySelectorAll('.g202 input[id^=gv_]').length};
      const sjS=S.find(s=>s.getAttribute('onchange').includes('G202.sj')); out.subjects=sjS?opts(sjS):[];
      out.per={};
      for(const sj of out.subjects.filter(x=>!/اختر/.test(x))){ sjS && (sjS.value=sj, sjS.dispatchEvent(new Event('change'))); await sl(500); S=sel();
        const sc=S.find(s=>s.getAttribute('onchange').startsWith('G202.sec=this')); out.per[sj]={secs:opts(sc),tableBefore:has()};
        const first=[...sc.options].find(o=>o.value); sc.value=first.value; sc.dispatchEvent(new Event('change')); await sl(500);
        out.per[sj].tableAfter=has(); out.per[sj].banner=(document.querySelector('.g234')||{}).textContent||''; out.per[sj].rows=document.querySelectorAll('.g202 input[id^=gv_]').length; }
      /* إرسال تجريبي لطالب واحد ثم مسحه */
      const inp=document.querySelector('.g202 input[id^=gv_]'); if(!inp){out.html=(document.querySelector('.g202')||{}).innerText;return out;} const sk=inp.id.slice(3); const before=inp.value; inp.value='77';
      await v202GSend(sk); await sl(2500);
      G202.rows=null; await v202GLoad(); await sl(1500); const row=(G202.rows||[]).find(x=>x.skey==sk&&x.label==G202.lbl&&x.val=='77');
      out.sent={subj:row&&row.subj,val:row&&row.val,uiSj:G202.sj,uiSec:G202.sec};
      const inp2=document.getElementById('gv_'+sk); if(inp2){ inp2.value=before; await v202GSend(sk); await sl(1500);} 
      /* الإرسال بدون اختيار */
      G202.sec=''; prender(); await sl(400); const t0=document.getElementById('gs_all'); out.noSecTable=!!t0;
      return out; });
    console.log(a.key, JSON.stringify(T,null,0));
    await ctx.close(); }
  console.log('errs',JSON.stringify(errs.slice(0,10)));
  await b.close(); })();
