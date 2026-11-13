const { chromium } = require('playwright');
exports.open = async (W, hash) => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: W < 500 ? 780 : 820 }, hasTouch: W < 500, isMobile: W < 500 });
  await ctx.route(/sinai\.7svyn82yzr\.workers\.dev/, async r => { const u = new URL(r.request().url()); const resp = await fetch('http://127.0.0.1:8787' + u.pathname + u.search, { method: r.request().method(), headers: { 'content-type': 'text/plain', 'x-ip': String(1 + Math.floor(Math.random() * 200)) }, body: r.request().postDataBuffer() || undefined }); r.fulfill({ status: resp.status, headers: Object.fromEntries(resp.headers), body: Buffer.from(await resp.arrayBuffer()) }); });
  await ctx.route(/googleapis|gstatic|cdnjs|jsdelivr|unpkg/, r => r.abort());
  const p = await ctx.newPage(); const errs = []; p.cur = '';
  p.on('pageerror', e => errs.push([p.cur, 'JS', e.message.slice(0, 220)]));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errs.push([p.cur, 'CON', m.text().slice(0, 220)]); });
  p.on('dialog', d => d.dismiss());
  await p.goto('http://127.0.0.1:8811/'+(process.env.PAGE||'index.html') + (hash || ''), { waitUntil: 'load' }); await p.waitForTimeout(2500);
  return { b, ctx, p, errs };
};
exports.staff = async (W, U) => { const o = await exports.open(W, '#staff'); const p = o.p;
  const ins = await p.$$('input:visible'); await ins[0].fill(U || 'tstown'); await ins[1].fill('Test-1234');
  await p.getByRole('button', { name: /الدخول إلى الإدارة/ }).click();
  await p.waitForFunction(() => typeof V === 'object' && !document.getElementById('app').hidden, null, { timeout: 60000 });
  await p.waitForTimeout(7000); return o; };
