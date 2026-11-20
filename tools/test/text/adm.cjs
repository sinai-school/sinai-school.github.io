const { chromium } = require('playwright'); const fs = require('fs');
const W = +process.argv[2] || 1366, OUT = process.argv[3], USER = process.env.U || 'tstown', PASS = process.env.P || 'Test-1234';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: W < 500 ? 780 : 820 }, hasTouch: W < 500, isMobile: W < 500 });
  await ctx.route(/sinai\.7svyn82yzr\.workers\.dev/, async r => { const u = new URL(r.request().url()); const resp = await fetch('http://127.0.0.1:8787' + u.pathname + u.search, { method: r.request().method(), headers: r.request().headers(), body: r.request().postDataBuffer() }).catch(() => null); if (!resp) return r.abort(); r.fulfill({ status: resp.status, headers: Object.fromEntries(resp.headers), body: Buffer.from(await resp.arrayBuffer()) }); });
  await ctx.route(/googleapis|gstatic|cdnjs|jsdelivr|unpkg/, r => r.abort());
  await ctx.addInitScript({ path: '/home/claude/scratch/c/rules.js' });
  const p = await ctx.newPage(); const errs = []; let cur = 'login';
  p.on('pageerror', e => errs.push([cur, e.message.slice(0, 200)])); p.on('dialog', d => d.dismiss());
  await p.goto('http://127.0.0.1:8811/' + (process.env.PAGE || 'index.html') + '#staff'); await p.waitForTimeout(2500);
  const pre = await p.evaluate(() => __scanText(document.body));
  const ins = await p.$$('input:visible'); await ins[0].fill(USER); await ins[1].fill(PASS);
  await p.getByRole('button', { name: /الدخول إلى الإدارة/ }).click();
  await p.waitForFunction(() => typeof V === 'object' && document.getElementById('app') && !document.getElementById('app').hidden, null, { timeout: 60000 });
  await p.waitForTimeout(8000);
  const ids = await p.evaluate(() => Object.keys(V).filter(k => { try { return typeof canSee != 'function' || canSee(k); } catch (e) { return true; } }));
  const res = { login: pre };
  for (const id of ids) {
    cur = id;
    res[id] = await p.evaluate(async id => { try { view(id); } catch (e) { return [{ k: 'استثناء', m: String(e).slice(0, 100) }]; } await new Promise(r => setTimeout(r, 1300));
      const o = __scanText(document.getElementById('app') || document.body);
      // افتح التبويبات/الأقسام الفرعية داخل القسم (أزرار التبويب)
      const tabs = [...document.querySelectorAll('#main .tabs button, #main .seg button, #main [role=tab]')].slice(0, 12);
      for (const t of tabs) { try { t.click(); await new Promise(r => setTimeout(r, 700)); __scanText(document.getElementById('main')).forEach(x => { x.tab = (t.textContent || '').trim().slice(0, 25); o.push(x); }); } catch (e) { } }
      document.querySelectorAll('#main details:not([open])').forEach(d => d.open = true); await new Promise(r => setTimeout(r, 300));
      __scanText(document.getElementById('main')).forEach(x => { x.tab = 'details'; o.push(x); });
      const seen = new Set(); return o.filter(x => { const k = x.k + x.m; if (seen.has(k)) return false; seen.add(k); return true; }); }, id);
  }
  fs.writeFileSync(OUT, JSON.stringify({ W, res, errs }, null, 1));
  const tot = Object.values(res).reduce((a, x) => a + x.length, 0);
  console.log(W, USER, 'sections', ids.length, 'findings', tot, 'errs', errs.length);
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
