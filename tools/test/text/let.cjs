const L = require('/home/claude/sinai-school.github.io/tools/test/lib.cjs');
(async () => { const { b, p, errs } = await L.staff(1366);
  const R = await p.evaluate(async () => { const sl = ms => new Promise(r => setTimeout(r, ms)); const out = [];
    const st = STA().find(x => !x.x && /علمي/.test(x.s)) || STA()[0]; const tf = STF.find(x => /مستمر/.test(x.st || x.status || '') && x.name) || STF[0];
    for (const tp of TPL) { try { ltUse(tp.k); await sl(900);
        try { lPick('s', st.id); await sl(500); } catch (e) { }
        try { lPick('t', tf.id); await sl(500); } catch (e) { }
        const pg = document.querySelector('#main .paper, #main .lpaper, #main .letter, #main [contenteditable]')?.closest('.paper,.lpaper,.letter,.lp,.sheet') || document.querySelector('#main');
        const txt = (pg.innerText || '').replace(/\s+/g, ' ');
        const f = __scanStr(txt);
        const tok = (txt.match(/«[^»]{1,20}»/g) || []).filter(t => /الطالب|المدرس|الصف|التاريخ|العدد|الاسم/.test(t));
        out.push({ k: tp.k, t: tp.t, len: txt.length, f, tok: [...new Set(tok)].slice(0, 5), sample: txt.slice(0, 0) });
        LDRAFT = null; LSEL = null; HOLD = 0;
      } catch (e) { out.push({ k: tp.k, ex: String(e).slice(0, 120) }); } }
    return { st: st.n, tf: tf.name, out }; });
  require('fs').writeFileSync('/tmp/let.json', JSON.stringify(R, null, 1));
  console.log(R.st, '|', R.tf, 'templates', R.out.length, 'errs', JSON.stringify(errs).slice(0, 400));
  R.out.forEach(o => { if (o.ex || o.f.length || o.tok.length) console.log(o.k, o.t, o.ex || '', JSON.stringify(o.f), JSON.stringify(o.tok)); });
  await b.close(); })();
