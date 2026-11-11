const L = require('./lib.cjs');
(async () => { for (const W of [1366, 360]) { const { b, p, errs } = await L.staff(W);
  const ids = await p.evaluate(() => Object.keys(V)); const miss = {}; let total = 0, icons = 0, badIc = 0;
  for (const id of ['h', ...ids]) { p.cur = id;
    const r = await p.evaluate(async id => { try { view(id); } catch (e) { return { m: ['EX ' + e], n: 0 }; } await new Promise(r => setTimeout(r, 500));
      const m = [], seen = new Set(); let n = 0, ic = 0, bad = 0;
      document.querySelectorAll('#app [onclick],#app [onchange],#app [oninput],body>[onclick]').forEach(e => { for (const a of ['onclick', 'onchange', 'oninput']) { const s = e.getAttribute(a); if (!s) continue; n++;
        try { new Function(s); } catch (x) { m.push('SYNTAX ' + s.slice(0, 60)); }
        const re = /(?:^|[;{(\s!&|?:,=])([A-Za-z_$][\w$]*)\s*\(/g; let k; while ((k = re.exec(s))) { const f = k[1]; if (seen.has(f) || /^(if|for|while|return|function|typeof|new|switch|catch|event|this|confirm|alert|prompt|parseInt|parseFloat|Number|String|Boolean|Array|Object|JSON|Math|Date|setTimeout|encodeURIComponent|decodeURIComponent|void)$/.test(f)) continue; seen.add(f);
          let ok = false; try { ok = typeof (0, eval)(f) === 'function'; } catch (x) { } if (!ok) m.push(f + ' ← ' + s.slice(0, 50)); } } });
      document.querySelectorAll('#app button svg, #app .ic svg, #nav svg').forEach(s => { ic++; const r = s.getBoundingClientRect(); if (s.offsetParent !== null && (r.width < 4 || r.height < 4 || !s.innerHTML.trim())) bad++; });
      document.querySelectorAll('#app button').forEach(bn => { if (bn.offsetParent !== null && !bn.textContent.trim() && !bn.querySelector('svg,img') && !bn.getAttribute('aria-label') && !bn.title) m.push('EMPTYBTN ' + bn.outerHTML.slice(0, 70)); });
      document.querySelectorAll('#app img').forEach(i => { if (i.complete && i.naturalWidth === 0 && i.getAttribute('src')) m.push('IMG ' + (i.getAttribute('src') || '').slice(0, 50)); });
      return { m, n, ic, bad }; }, id);
    total += r.n; icons += r.ic || 0; badIc += r.bad || 0; if (r.m.length) miss[id] = r.m; }
  console.log(W, 'handlers', total, 'icons', icons, 'badIcons', badIc, 'problems', JSON.stringify(miss).slice(0, 2500), 'errs', JSON.stringify(errs).slice(0, 500));
  await b.close(); } })();
