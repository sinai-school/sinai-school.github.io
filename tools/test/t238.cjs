// v238: بوابة الأرشفة — اختبار شامل على الخادم المحلي (node tools/test/t238.cjs <عرض>)
const L = require('./lib.cjs'), fs = require('fs');
const W = +(process.argv[2] || 1366), OUT = [], ok = (n, c, x) => { OUT.push([c ? 'OK ' : 'BAD', n, x || '']); console.log(c ? 'OK ' : 'BAD', n, x || ''); };
const SYN = '/home/claude/scratch/syn/', SAMP = '/home/claude/scratch/samp/';
(async () => {
  const { b, p, errs } = await L.staff(W);
  try {
    await p.evaluate(() => view('ar238')); await p.waitForFunction(() => Object.values(AR238.books).filter(b => b.kind == 'q').length >= 59, null, { timeout: 60000 }).catch(() => 0);
    const nb = await p.evaluate(() => Object.values(AR238.books).filter(b => b.kind == 'q').length);
    ok('auto 59 books from القيد العام', nb == 59, nb);
    const r1 = await p.evaluate(() => { const b = AR238.books.q1, b59 = AR238.books.q59; return [b.p0, b.p1, b59.p0, b59.p1]; });
    ok('ranges book1/59', JSON.stringify(r1) == '["1","199","13488","13545"]', r1);
    const cards = await p.$$eval('.ar-b', L => L.length); ok('book cards', cards >= 59, cards);
    // open book 3, upload two images via file chooser
    await p.evaluate(() => { AR238.book = 'q3'; render(); }); await p.waitForTimeout(800);
    const tiles = await p.$$eval('.ar-t', L => L.length); ok('book 3 tiles = 198', tiles == 198, tiles);
    let [fc] = await Promise.all([p.waitForEvent('filechooser'), p.evaluate(() => up238('q', '400'))]);
    await fc.setFiles([SYN + 'dark.jpg', SAMP + 'b71n0u1er1cl2sv.jpg']); await p.waitForTimeout(6000);
    const pre = await p.$$eval('#ar238u .ar-ui', L => L.map(e => [e.querySelector('input').value, (e.querySelector('.ar-unm') || {}).textContent || '']));
    ok('upload preview pages 400,401 with names', pre.length == 2 && /٤٠٠/.test(pre[0][0]) && pre[0][1].length > 3 && pre[1][1].length > 3, JSON.stringify(pre));
    const qn = await p.evaluate(() => [ (QD.find(r => r.pg == '400') || {}).n, (QD.find(r => r.pg == '401') || {}).n ]);
    ok('names match QD exactly', pre[0][1].includes(qn[0]) && pre[1][1].includes(qn[1]), qn.join(' | '));
    await p.click('#aru_go'); await p.waitForFunction(() => /اكتمل/.test((document.getElementById('aru_pr') || {}).textContent || '') || !document.getElementById('ar238u'), null, { timeout: 60000 }).catch(() => 0);
    await p.waitForTimeout(1500);
    const has = await p.evaluate(() => [!!AR238.P.get('q|400') && AR238.P.get('q|400').v, !!AR238.P.get('q|401') && AR238.P.get('q|401').v]);
    ok('pages saved', has.every(Boolean), has);
    const st = await p.evaluate(() => gxCall({ op: 'ar238', f: 'st' }));
    ok('server stats', st.pages == 2 && st.bytes > 100000, JSON.stringify(st));
    // full-size image fetch & quality
    const dim = await p.evaluate(async () => { const a = AR238.P.get('q|400'); const r = await fetch(new URL(GX.url).origin + '/ar238', { method: 'POST', body: JSON.stringify({ tok: GX.tok, id: a.v }) }); const bl = await r.blob(); const bm = await createImageBitmap(bl); return [bl.type, bl.size, bm.width, bm.height, r.headers.get('content-type')]; });
    ok('image served full-res webp', dim[2] >= 1700 && /webp|jpeg/.test(dim[4]), dim);
    // unauthorized access
    const un = await p.evaluate(async () => { const r = await fetch(new URL(GX.url).origin + '/ar238', { method: 'POST', body: JSON.stringify({ tok: 'x', id: AR238.P.get('q|400').v }) }); return r.text(); });
    ok('no token → refused', /auth/.test(un), un);
    // viewer
    await p.evaluate(() => view238('q', '400')); await p.waitForTimeout(2500);
    const vw = await p.evaluate(() => { const el = document.getElementById('ar238v'); const im = el.querySelector('.ar-vi'); return [el.querySelector('.ar-vtt').textContent, im.naturalWidth, el.querySelector('.ar-vl').hidden, el.querySelector('.ar-vp').textContent.slice(0, 120)]; });
    ok('viewer shows page + student', /القيد رقم ٣/.test(vw[0]) && vw[1] > 1000 && vw[2], JSON.stringify(vw));
    await p.evaluate(() => { document.querySelector('#ar238v [data-a="zi"]').click(); document.querySelector('#ar238v [data-a="next"]').click(); }); await p.waitForTimeout(1500);
    ok('next page', await p.evaluate(() => /صفحة ٤٠١/.test(document.querySelector('.ar-vtt').textContent)));
    // replace with note
    [fc] = await Promise.all([p.waitForEvent('filechooser'), p.evaluate(() => AR238Rep())]);
    await fc.setFiles([SYN + 'wood.jpg']); await p.waitForTimeout(4500);
    const blocked = await p.$eval('#aru_go', e => e.disabled); ok('replace needs confirm', blocked);
    await p.check('#ar238u .ar-chk input'); await p.fill('#ar238u .ar-unt', 'زُوِّد بوثيقة تخرج'); await p.waitForTimeout(300);
    await p.click('#aru_go'); await p.waitForTimeout(6000);
    const nv = await p.evaluate(() => { const a = AR238.P.get('q|401'); return [a.nv, a.nt]; });
    ok('replaced → version 2 with note', nv[0] == 2 && /وثيقة/.test(nv[1]), nv);
    const vers = await p.evaluate(() => gxCall({ op: 'ar238', f: 'vers', bk: 'q', pg: '401' }));
    ok('history 2 versions', vers.L.length == 2, vers.L.map(v => v.nt).join(' / '));
    await p.evaluate(id => gxCall({ op: 'ar238', f: 'set', bk: 'q', pg: '401', v: id }), vers.L[1].id); await p.evaluate(() => AR238load(1)); await p.waitForTimeout(800);
    ok('restore old version', await p.evaluate(id => AR238.P.get('q|401').v == id, vers.L[1].id));
    // القيد العام record shows portal image
    await p.evaluate(() => { const el = document.getElementById('ar238v'); el && el.remove(); }); 
    await p.waitForTimeout(1700);
    const qr = await p.evaluate(() => { const r = QD.find(x => x.pg == '400'); return [r.im, JSON.stringify(qStrip(r)), (() => { let o; qSaveChunk.call(null, '__none__'); return 1; })()]; });
    ok('QD record im → portal (display only)', /^ar238:400:/.test(qr[0]), qr[0]);
    const strip = await p.evaluate(() => { const r = QD.find(x => x.pg == '400'); let got; const o = DB; return null; });
    const saved = await p.evaluate(() => { const r = QD.find(x => x.pg == '400'); const c = r.c; const _q = window.__q; qSaveChunk(c); return QPEND[c].includes('ar238:') ? 'LEAK' : 'clean'; });
    ok('saving القيد keeps original link', saved == 'clean', saved);
    await p.evaluate(() => { view('q'); QSEL = QD.find(x => x.pg == '400').i; HOLD = 1; render(); }); await p.waitForTimeout(3000);
    const qimg = await p.evaluate(() => { const im = [...document.querySelectorAll('#main img')].find(i => /^blob:/.test(i.src)); return im ? im.naturalWidth : 0; });
    ok('القيد العام detail shows portal image', qimg > 500, qimg);
    // mid records
    await p.evaluate(() => { HOLD = 0; view('ar238'); AR238.tab = 'w'; AR238.book = null; AR238.form = { kind: 'w' }; render(); }); await p.waitForTimeout(500);
    await p.fill('#arf_yr', '2024-2023'); await p.fill('#arf_t', 'الصف الرابع'); await p.click('.ar-form .btn:not(.ghost)'); await p.waitForTimeout(1500);
    const wb = await p.evaluate(() => Object.values(AR238.books).filter(b => b.kind == 'w').map(b => [b.yr, b.title]));
    ok('mid record created, year normalized', wb.length == 1 && wb[0][0] == '2023-2024', JSON.stringify(wb));
    const wid = await p.evaluate(() => AR238.book);
    [fc] = await Promise.all([p.waitForEvent('filechooser'), p.evaluate(id => up238(id, ''), wid)]);
    await fc.setFiles([SAMP + 'b71q11xjrejd0vv.jpg', SAMP + 'b7w2wvmy1yhgisq.jpg', SYN + 'gray.jpg']); await p.waitForTimeout(6000);
    await p.click('#aru_go'); await p.waitForTimeout(8000);
    const wp = await p.evaluate(id => [...AR238.P.values()].filter(r => r.bk == id && r.v).map(r => r.pg).sort(), wid);
    ok('mid record 3 pages', wp.join() == '1,2,3', wp);
    await p.evaluate(() => AR238UX && AR238UX()); 
    const sw = await p.evaluate(async id => { const a = AR238.P.get(id + '|1').v, b2 = AR238.P.get(id + '|2').v; await gxCall({ op: 'ar238', f: 'swap', bk: id, p1: '1', p2: '2' }); await AR238load(1); return [AR238.P.get(id + '|1').v == b2, AR238.P.get(id + '|2').v == a]; }, wid);
    ok('reorder pages', sw.every(Boolean), sw);
    // old boards
    await p.evaluate(() => { AR238.book = null; AR238.tab = 'b'; AR238.cls = 's6i'; AR238.rd = 2; render(); }); await p.waitForTimeout(400);
    const yrs = await p.$$eval('.ar-b', L => L.length); ok('old boards years grid', yrs >= 25, yrs);
    const bid = await p.evaluate(async () => { const r = await gxCall({ op: 'ar238', f: 'books', L: [{ kind: 'b', yr: '1995-1996', cls: 's6i', rd: 2 }] }); await AR238load(1); return r.ids[0]; });
    ok('old board book', /^b/.test(bid) && await p.evaluate(id => AR238.books[id].cls == 's6i' && AR238.books[id].rd == 2, bid));
    // search
    await p.evaluate(() => { AR238.book = null; AR238.tab = 's'; AR238.q = QD.find(x => x.pg == '400').n; render(); }); await p.waitForTimeout(500);
    const sr = await p.$$eval('#ar_res tr', L => L.length); ok('search finds student', sr >= 2, sr);
    // archive (z) no longer has mid records tab
    await p.evaluate(() => view('z')); await p.waitForTimeout(1200);
    const z = await p.evaluate(() => document.getElementById('main').innerHTML);
    ok('archive: no rec tab', !/aTab\('rec'\)/.test(z) && /بوابة الأرشفة/.test(z));
    // hub on home
    await p.evaluate(() => view('h')); await p.waitForTimeout(800);
    ok('home hub card', await p.evaluate(() => /بوابة الأرشفة الإلكترونية/.test(document.getElementById('main').textContent)));
    // permission account cannot access
    ok('JS errors', !errs.length, JSON.stringify(errs.slice(0, 5)));
  } catch (e) { ok('EXC', false, e.stack.slice(0, 400)); }
  await b.close();
  const st2 = await L.staff(W, 'tststf'); 
  const r = await st2.p.evaluate(() => gxCall({ op: 'ar238', f: 'idx', since: 0 }).catch(e => e));
  ok('staff (non-owner) refused', r && r.err == 'role', JSON.stringify(r).slice(0, 80));
  const vis = await st2.p.evaluate(() => /بوابة الأرشفة/.test(document.getElementById('main').textContent));
  ok('staff does not see hub', !vis);
  await st2.b.close();
  fs.writeFileSync('/tmp/t238-' + W + '.json', JSON.stringify(OUT));
  console.log(OUT.filter(x => x[0] == 'BAD').length ? 'FAILED' : 'ALL OK');
})();
