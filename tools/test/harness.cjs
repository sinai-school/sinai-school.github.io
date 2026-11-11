const { chromium } = require('playwright');
const W = +process.argv[2] || 1366, H = W < 500 ? 780 : 820, OUT = process.argv[3];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 500, isMobile: W < 500 });
  await ctx.route(/sinai\.7svyn82yzr\.workers\.dev/, async r => { const u = new URL(r.request().url()); const resp = await fetch('http://127.0.0.1:8787' + u.pathname + u.search, { method: r.request().method(), headers: { 'content-type': r.request().headers()['content-type'] || 'text/plain' }, body: r.request().postDataBuffer() || undefined }); r.fulfill({ status: resp.status, headers: Object.fromEntries(resp.headers), body: Buffer.from(await resp.arrayBuffer()) }); });
  await ctx.route(/googleapis|gstatic|cdnjs|jsdelivr|unpkg/, r => r.abort());
  const p = await ctx.newPage(); const errs = []; let cur = 'login';
  p.on('pageerror', e => errs.push([cur, 'JS', e.message.slice(0, 220)]));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errs.push([cur, 'CON', m.text().slice(0, 220)]); });
  p.on('dialog', d => d.dismiss());
  await p.goto('http://127.0.0.1:8811/index.html#staff', { waitUntil: 'load' }); await p.waitForTimeout(2500);
  const ins = await p.$$('input:visible'); await ins[0].fill('tstown'); await ins[1].fill('Test-1234');
  await p.getByRole('button', { name: /الدخول إلى الإدارة/ }).click();
  await p.waitForFunction(() => typeof V === 'object' && document.getElementById('app') && !document.getElementById('app').hidden, null, { timeout: 60000 });
  await p.waitForTimeout(8000);
  const ids = await p.evaluate(() => Object.keys(V));
  const res = [];
  for (const id of ids) {
    cur = id; const t0 = Date.now();
    const r = await p.evaluate(async id => { try { view(id); } catch (e) { return { ex: String(e).slice(0, 200) }; } await new Promise(r => setTimeout(r, 900));
      const m = document.getElementById('main'); const t = document.getElementById('ptitle');
      const over = document.documentElement.scrollWidth > innerWidth + 2;
      const wide = [...m.querySelectorAll('*')].filter(e => { const rc = e.getBoundingClientRect(); return rc.width > 0 && (rc.right > innerWidth + 3 || rc.left < -3) && !e.closest('.tw,.scroll,.grid,table,[style*="overflow"],.ox,.hs,.dj206,.tblw') && getComputedStyle(e).position !== 'fixed'; }).length;
      const toasts = [...document.querySelectorAll('.toast,#toast')].map(x => x.textContent).filter(x => /خطأ|تعذّر|فشل|error/i.test(x));
      return { title: t ? t.textContent : '', len: m.innerText.trim().length, btn: m.querySelectorAll('button').length, over, wide, toasts }; }, id);
    r.ms = Date.now() - t0; r.id = id; res.push(r);
  }
  require('fs').writeFileSync(OUT, JSON.stringify({ W, res, errs }, null, 1));
  await p.screenshot({ path: OUT.replace('.json', '.png') });
  console.log(W, 'sections', ids.length, 'errors', errs.length);
  await b.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
