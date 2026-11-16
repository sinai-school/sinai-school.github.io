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
      const red=el=>!!el&&/176, 0, 32/.test(getComputedStyle(el).color);
      const set=(sel,v,ev)=>{const e=document.querySelector(sel); e.value=v; e.dispatchEvent(new Event(ev||'change'));};
      PS.tab='d'; prender(); await sl(1200);
      set('.g202 select[onchange^="G202.sj"]','اجتماع'); await sl(500);
      set('.g202 select[onchange^="G202.sec=this"]','الرابع الأدبي أ'); await sl(500);
      /* شهري: ٤٥ أحمر، ٥٠ لا، غ أحمر */
      const ins=[...document.querySelectorAll('.g202 input[id^=gv_]')]; const t=(e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));return e.classList.contains('red235')};
      out.month={v45:t(ins[0],'45'),v50:t(ins[0],'50'),ar45:t(ins[0],'٤٥'),gh:t(ins[0],'غ'),m:t(ins[0],'م')}; ins[0].value='';
      /* أسماء الانتساب بالأحمر بقائمة المدرس */
      const names=[...document.querySelectorAll('.g202 td.l')]; out.intNames=names.filter(red).map(e=>e.textContent.trim().split(' ').length); out.rowsN=names.length;
      /* امتحان يومي */
      set('.g202 select[onchange^="G202.lbl"]','امتحان يومي'); await sl(600);
      out.exLbl=G202.lbl; out.exFields=document.querySelectorAll('.g202 input[type=date]').length;
      const mx=[...document.querySelectorAll('.g202 label')].find(l=>/الدرجة الكلية/.test(l.textContent)).querySelector('input'); mx.value='١٠'; mx.dispatchEvent(new Event('change')); await sl(500);
      const tp=[...document.querySelectorAll('.g202 label')].find(l=>/موضوع/.test(l.textContent)).querySelector('input'); tp.value='الفصل الثاني'; tp.dispatchEvent(new Event('change')); await sl(500);
      out.exLbl2=G202.lbl; out.banner=(document.querySelector('.g234')||{}).textContent;
      const I2=[...document.querySelectorAll('.g202 input[id^=gv_]')]; out.daily={v4:t(I2[0],'4'),v5:t(I2[0],'5'),v6:t(I2[0],'6')}; out.suffix=(I2[0].parentElement.textContent||'').trim();
      /* درجة أكبر من الكلية تُرفض */
      I2[0].value='12'; const sk=I2[0].id.slice(3); let msg=''; const T00=window.T0; await v202GSend(sk); await sl(1500);
      G202.rows=null; await v202GLoad(); await sl(1500); out.bigSaved=!!(G202.rows||[]).find(x=>x.skey==sk&&x.label==G202.lbl);
      document.getElementById('gv_'+sk).value='4'; await v202GSend(sk); await sl(1500); G202.rows=null; await v202GLoad(); await sl(1500);
      const row=(G202.rows||[]).find(x=>x.skey==sk&&x.label==G202.lbl); out.saved=row&&{label:row.label,val:row.val};
      prender(); await sl(800);
      const rec=document.querySelector('.gr204'); out.recHead=rec?[...rec.querySelectorAll('th')].map(e=>e.textContent).slice(2):null;
      out.recRed=rec?[...rec.querySelectorAll('td.red')].map(e=>e.textContent):null;
      /* شهري أحمر بالسجل */
      set('.g202 select[onchange^="G202.lbl"]','الشهر الثاني — الفصل الأول'); await sl(500);
      const I3=document.getElementById('gv_'+sk); I3.value='30'; await v202GSend(sk); await sl(1500); G202.rows=null; await v202GLoad(); await sl(1500); prender(); await sl(600);
      out.recRed2=[...document.querySelectorAll('.gr204 td.red')].map(e=>e.textContent);
      out.sk=sk; return out; });
    console.log(a.key, JSON.stringify(T));
    await ctx.close(); }
  console.log('errs',JSON.stringify(errs.slice(0,10)));
  await b.close(); })();
