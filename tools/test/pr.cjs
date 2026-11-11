const L = require('./lib.cjs');
(async () => { const { b, p, errs } = await L.staff(1366);
  await p.evaluate(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; window.__pg = document.querySelectorAll('#pr221 .pg, #pr221 img, #pr221 > *').length; }; });
  const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const ids = (await p.evaluate(() => Object.keys(V))).filter(x => !ONLY.length || ONLY.includes(x)); const R = [];
  for (const id of ids) { p.cur = id; const t0 = Date.now();
    const r = await p.evaluate(async id => { const sl = ms => new Promise(r => setTimeout(r, ms)); view(id); await sl(id.startsWith('fx_') ? 2500 : 700);
      const bn = [...document.querySelectorAll('#main button, #main [onclick]')].find(e => e.offsetParent && /^طباعة/.test(e.textContent.trim()) && e.textContent.trim().length < 40);
      if (!bn) return null; const label = bn.textContent.trim().slice(0, 24); window.__printed = 0; window.__pg = 0; const steps = [];
      try { bn.click(); } catch (e) { return { label, ex: String(e).slice(0, 150) }; }
      for (let i = 0; i < 150 && !window.__printed; i++) { await sl(300);
        const dl = [...document.querySelectorAll('.zoom.inst,.zoom')].filter(e => e.getClientRects().length && getComputedStyle(e).display !== 'none' && e.querySelector('button')).pop();
        if (dl) { const B = [...dl.querySelectorAll('button')].filter(e => e.getClientRects().length); const tx = e => e.textContent.trim(); const go = B.find(e => /^(🖨\s*)?طباعة( الآن| الكل)?$/.test(tx(e))) || B.find(e => /^طباعة/.test(tx(e)) && !/تعديل/.test(tx(e))) || B.find(e => /متابعة|استمر/.test(tx(e))) || B.find(e => /طباعة/.test(tx(e)) && !/تعديل|قبل/.test(tx(e))); const k = go ? go.textContent.trim().slice(0, 18) : 'NOBTN:' + [...dl.querySelectorAll('button')].map(e => e.textContent.trim().slice(0, 10)).join('/'); if (steps[steps.length - 1] !== k || i % 12 == 0) { steps.push(k); if (go) go.click(); } } }
      const out = { label, steps, printed: window.__printed, pg: window.__pg, t: [...document.querySelectorAll('.toast,#toast')].map(x => x.textContent).filter(Boolean).join('|').slice(0, 50) };
      document.querySelectorAll('#pr221,.zoom.inst').forEach(e => e.remove()); document.documentElement.classList.remove('p221'); return out; }, id).catch(e => ({ ex: 'EVAL ' + String(e).slice(0, 100) }));
    if (r) { r.ms = Date.now() - t0; R.push([id, r]); console.log(id, JSON.stringify(r)); } }
  console.log('tried', R.length, 'printed', R.filter(x => x[1].printed).length, 'pages', R.reduce((a, x) => a + (x[1].pg || 0), 0));
  console.log('FAILED', JSON.stringify(R.filter(x => !x[1].printed)).slice(0, 2500));
  console.log('ERRS', JSON.stringify(errs).slice(0, 1500)); await b.close(); })();
