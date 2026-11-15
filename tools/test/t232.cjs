const L = require('/home/claude/sinai-school.github.io/tools/test/lib.cjs'); const fs = require('fs');
const Wd = +process.argv[2] || 1366; const exp = JSON.parse(fs.readFileSync('exp.json', 'utf8'));
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const o = await L.staff(Wd); const p = o.p;
  await p.evaluate(() => view('l')); await p.waitForTimeout(1500);
  // 1) saved confirmations: auto average from board
  const got = await p.evaluate(async ids => { const out = {}; const W8 = ms => new Promise(r => setTimeout(r, ms));
    try { bxSub207(); } catch (e) { } for (let i = 0; i < 40 && bxN207() < 0; i++) await W8(500);
    for (const id of ids) { LSEL = id; LDRAFT = null; render(); await W8(60); const td = LDRAFT && LDRAFT.td; const el = document.querySelector('#lprev [data-k="avg"]');
      out[id] = { avg: td ? td.avg : undefined, src: td && td.avgSrc, shown: el ? el.textContent : null, c: td && td.c }; }
    LSEL = null; LDRAFT = null; HOLD = 0; render(); return { out, n: bxN207() }; }, Object.keys(exp));
  let good = 0, bad = [];
  for (const id in exp) { const e = exp[id], g = got.out[id]; const want = e.avg && +e.c == 6 ? e.avg : null; const have = g.avg == null || g.avg === '' ? null : String(g.avg);
    const vis = +e.c == 6 && e.dest != 'school'; const ar = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
    if (want === have && (!vis || g.shown === (want ? ar(want) : ''))) good++; else bad.push([id, e, g]); }
  ok(!bad.length, 'saved confirmations auto-average ' + good + '/' + Object.keys(exp).length + ' boards=' + got.n + (bad.length ? ' ' + JSON.stringify(bad.slice(0, 3)) : ''));
  // 2) new confirmation from board
  await p.evaluate(() => ltUse('tdarajat')); await p.waitForTimeout(800);
  const r2 = await p.evaluate(async () => { const W8 = ms => new Promise(r => setTimeout(r, ms));
    tdQ120('رسول مصطفى حسين'); await W8(400); const L0 = window._tdbx207 || []; const i = L0.findIndex(x => String(x.r[5]) == '515'); if (i < 0) return { err: 'not found', n: L0.length };
    const row = L0[i].r; tdBx207(i); await W8(300); const td = LDRAFT.td; const q = k => { const e = document.querySelector('#lprev [data-k="' + k + '"]'); return e ? e.textContent : null; };
    const boxes = [...document.querySelectorAll('#lprev table')].map(t => t.rows[0].cells[0].textContent.trim());
    return { board: row[6], avg: td.avg, src: td.avgSrc, shown: q('avg'), sum: q('sum'), en: q('en'), boxes, rows: td.rows.length }; });
  ok(r2.avg === '73.57' && r2.shown === '٧٣.٥٧' && r2.src == 'b' && String(r2.board) == '73.57', 'board pick → avg exactly board value ' + JSON.stringify(r2));
  ok(JSON.stringify(r2.boxes.slice(-4,-1)) == JSON.stringify(['المجموع', 'المعـــــدل', 'الرقـــم الامتحاني']), 'order: المجموع → المعدل → الرقم الامتحاني');
  await p.locator('#lprev').screenshot({ path: 'td_' + Wd + '.png' });
  // PDF
  const pdf = await p.evaluate(async () => { const T2 = new PDoc('A4', 'portrait'); await pLetter(T2, LDRAFT); return { n: T2.pages.length, img: T2.pages[0].toDataURL('image/jpeg', .8) }; });
  fs.writeFileSync('td_pdf_' + Wd + '.jpg', Buffer.from(pdf.img.split(',')[1], 'base64')); ok(pdf.n == 1, 'PDF one page');
  // manual edit of avg, exactness (no rounding)
  const r3 = await p.evaluate(async () => { const e = document.querySelector('#lprev [data-k="avg"]'); e.focus(); e.textContent = '٨٠٫٥'; e.dispatchEvent(new InputEvent('input', { bubbles: true })); const a = LDRAFT.td.avg, s = LDRAFT.td.avgSrc; e.blur(); await new Promise(r => setTimeout(r, 50)); const sh = e.textContent; LDRAFT.td.avg = '73.57'; LDRAFT.td.avgSrc = 'b'; render(); return { a, s, sh }; });
  ok(r3.a === '80.5' && r3.s == 'm' && r3.sh === '٨٠.٥', 'manual edit ' + JSON.stringify(r3));
  // dest school hides avg+en
  const r4 = await p.evaluate(async () => { tdDest('school'); await new Promise(r => setTimeout(r, 100)); const a = !!document.querySelector('#lprev [data-k="avg"]'), e = !!document.querySelector('#lprev [data-k="en"]'); tdDest('grad'); await new Promise(r => setTimeout(r, 100)); return { a, e, back: !!document.querySelector('#lprev [data-k="avg"]') }; });
  ok(!r4.a && !r4.e && r4.back, 'to-school hides avg & exam no ' + JSON.stringify(r4));
  // 3) td table tools
  const st = () => p.evaluate(() => ({ rows: LDRAFT.td.rows.map(r => r.sj + '=' + r.v), xc: LDRAFT.td.xc || [], xf: LDRAFT.td.xf || [], hid: LDRAFT.td.hid || {}, sum: document.querySelector('#lprev [data-k="sum"]') ? document.querySelector('#lprev [data-k="sum"]').textContent : null, bar: !document.getElementById('tb232').hidden, foc: document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : '' }));
  const s0 = await st().catch(() => null);
  await p.click('#lprev [data-k="sj:2"]'); await p.waitForTimeout(150); let s = await st(); ok(s.bar, 'bar shows on cell click');
  await p.screenshot({ path: 'bar_td_' + Wd + '.png' });
  await p.click('#tb232 button[onclick="tb232(\'ra\')"]'); await p.waitForTimeout(200); s = await st();
  ok(s.rows.length == 8 && s.rows[2] == '=' && s.bar && (Wd < 500 || s.foc == 'sj:2'), 'row above inserted at 3 ' + s.foc);
  await p.click('#lprev [data-k="sj:2"]'); await p.keyboard.type('مادة تجريبية'); await p.click('#lprev [data-k="v:2"]'); await p.keyboard.type('60'); await p.keyboard.press('Enter'); await p.waitForTimeout(200); s = await st();
  ok(s.rows[2] == 'مادة تجريبية=60' && s.sum == '٥٧٥', 'typed into new row, sum auto ' + s.sum);
  await p.click('#lprev [data-k="sj:2"]'); await p.click('#tb232 button[onclick="tb232(\'rd\')"]'); await p.waitForTimeout(200); s = await st(); ok(s.rows[3] == 'مادة تجريبية=60', 'row moved down');
  await p.click('#tb232 button[onclick="tb232(\'ru\')"]'); await p.waitForTimeout(200);
  await p.click('#tb232 button[onclick="tb232(\'rb\')"]'); await p.waitForTimeout(200); s = await st(); ok(s.rows.length == 9 && s.rows[3] == '=', 'row below');
  await p.click('#tb232 button[onclick="tb232(\'rx\')"]'); await p.waitForTimeout(200); await p.click('#lprev [data-k="sj:2"]'); await p.click('#tb232 button[onclick="tb232(\'rx\')"]'); await p.waitForTimeout(200); s = await st();
  ok(s.rows.length == 7 && s.sum == '٥١٥', 'rows deleted, sum back to 515');
  await p.click('#lprev [data-k="sj:0"]'); await p.click('#tb232 button[onclick="tb232(\'tc\')"]'); await p.waitForTimeout(200); s = await st(); ok(s.xc.length == 1 && (Wd < 500 || s.foc == 'xh:0'), 'extra column added');
  await p.click('#lprev [data-k="xh:0"]'); await p.keyboard.press('Control+A'); await p.keyboard.type('الملاحظات'); await p.click('#lprev [data-k="x:1:0"]'); await p.keyboard.type('جيد 5');
  await p.click('#lprev [data-k="sj:0"]'); await p.waitForTimeout(100);
  await p.click('#tb232 button[onclick="tb232(\'fa\')"]'); await p.waitForTimeout(200); await p.click('#lprev [data-k="xl:0"]'); await p.keyboard.press('Control+A'); await p.keyboard.type('التقدير'); await p.click('#lprev [data-k="xv:0"]'); await p.keyboard.type('جيد'); await p.waitForTimeout(100); s = await st();
  ok(s.xc[0] == 'الملاحظات' && s.xf.length == 1 && s.xf[0].l == 'التقدير' && s.xf[0].v == 'جيد', 'extra col header + field typed ' + JSON.stringify([s.xc, s.xf]));
  await p.locator('#lprev').screenshot({ path: 'td_extra_' + Wd + '.png' });
  const pdf2 = await p.evaluate(async () => { const T2 = new PDoc('A4', 'portrait'); await pLetter(T2, LDRAFT); const b = await buildLetterDocx(LDRAFT).then(x => !!x).catch(e => String(e)); return { n: T2.pages.length, img: T2.pages[0].toDataURL('image/jpeg', .8), docx: b }; });
  fs.writeFileSync('td_extra_pdf_' + Wd + '.jpg', Buffer.from(pdf2.img.split(',')[1], 'base64')); ok(pdf2.n == 1, 'PDF with extras one page, docx ' + pdf2.docx);
  await p.click('#lprev [data-k="avg"]'); await p.click('#tb232 button[onclick="tb232(\'fx\')"]'); await p.waitForTimeout(200); s = await st(); const noAvg = await p.$('#lprev [data-k="avg"]');
  ok(s.hid.avg == 1 && !noAvg, 'avg field deleted'); const rb = await p.$('button[onclick="tb232(\'fr\')"]'); ok(!!rb, 'restore button appears'); await rb.click(); await p.waitForTimeout(200);
  ok(!!(await p.$('#lprev [data-k="avg"]')) && (await p.evaluate(() => LDRAFT.td.avg)) == '73.57', 'avg restored with value');
  await p.click('#lprev [data-k="x:1:0"]'); await p.click('#tb232 button[onclick="tb232(\'tcx\')"]'); await p.waitForTimeout(200); await p.click('#lprev [data-k="xv:0"]'); await p.click('#tb232 button[onclick="tb232(\'fx\')"]'); await p.waitForTimeout(200); s = await st();
  ok(!s.xc.length && !s.xf.length && s.rows.length == 7, 'extra column & field removed → back to original');
  // save & reopen
  const sv = await p.evaluate(async () => { LDRAFT.to = '(اختبار)'; lSave(); await new Promise(r => setTimeout(r, 1500)); const id = LDRAFT.id; LSEL = null; LDRAFT = null; HOLD = 0; render(); await new Promise(r => setTimeout(r, 300)); LSEL = id; render(); await new Promise(r => setTimeout(r, 300)); const a = LDRAFT.td.avg; lDel(id); return a; });
  ok(sv == '73.57', 'saved and reopened keeps avg ' + sv);
  // 4) generic letter table
  await p.evaluate(() => { ltUse('blank'); }); await p.waitForTimeout(500); await p.evaluate(() => eAdd('tbl')); await p.waitForTimeout(300);
  const g = () => p.evaluate(() => LDRAFT.tbl);
  await p.evaluate(() => { LDRAFT.tbl = 'ت|الاسم|الملاحظات\n1|أحمد|أ\n2|باسم|ب\n3|جاسم|ج'; render(); }); await p.waitForTimeout(200);
  await p.click('#lprev [data-k="t:2:1"]'); await p.waitForTimeout(100); ok(!(await p.evaluate(() => document.getElementById('tb232').hidden)), 'bar on generic table');
  await p.screenshot({ path: 'bar_gen_' + Wd + '.png' });
  await p.click('#tb232 button[onclick="tb232(\'ra\')"]'); await p.waitForTimeout(200); ok((await g()) == 'ت|الاسم|الملاحظات\n1|أحمد|أ\n2||\n3|باسم|ب\n4|جاسم|ج', 'gen row above + renumber: ' + JSON.stringify(await g()));
  await p.click('#lprev [data-k="t:2:1"]'); await p.keyboard.type('جديد'); await p.click('#tb232 button[onclick="tb232(\'rd\')"]'); await p.waitForTimeout(200); ok((await g()) == 'ت|الاسم|الملاحظات\n1|أحمد|أ\n2|باسم|ب\n3|جديد|\n4|جاسم|ج', 'gen move down keeps serial: ' + JSON.stringify(await g()));
  await p.click('#tb232 button[onclick="tb232(\'cl\')"]'); await p.waitForTimeout(200); ok((await g()) == 'ت|الاسم||الملاحظات\n1|أحمد||أ\n2|باسم||ب\n3|جديد||\n4|جاسم||ج', 'gen col left: ' + JSON.stringify(await g()));
  await p.click('#tb232 button[onclick="tb232(\'cx\')"]'); await p.waitForTimeout(200); await p.click('#lprev [data-k="t:3:1"]'); await p.click('#tb232 button[onclick="tb232(\'cr\')"]'); await p.waitForTimeout(200); ok((await g()) == 'ت||الاسم|الملاحظات\n1||أحمد|أ\n2||باسم|ب\n3||جديد|\n4||جاسم|ج', 'gen col right: ' + JSON.stringify(await g()));
  await p.click('#tb232 button[onclick="tb232(\'cx\')"]'); await p.waitForTimeout(200); await p.click('#lprev [data-k="t:3:1"]'); await p.click('#tb232 button[onclick="tb232(\'rx\')"]'); await p.waitForTimeout(200); ok((await g()) == 'ت|الاسم|الملاحظات\n1|أحمد|أ\n2|باسم|ب\n3|جاسم|ج', 'gen delete → original: ' + JSON.stringify(await g()));
  await p.click('#lprev [data-k="t:0:1"]'); await p.click('#tb232 button[onclick="tb232(\'rx\')"]'); await p.waitForTimeout(200); ok((await g()).startsWith('ت|الاسم'), 'header row protected');
  await p.click('#lprev [data-k="t:3:2"]'); await p.click('#tb232 button[onclick="tb232(\'rb\')"]'); await p.waitForTimeout(200); ok((await g()).endsWith('\n4||'), 'gen row below last numbered');
  const pdf3 = await p.evaluate(async () => { LDRAFT.subj = 'اختبار'; LDRAFT.body = 'نص'; const T2 = new PDoc('A4', 'portrait'); await pLetter(T2, LDRAFT); return { n: T2.pages.length, img: T2.pages[0].toDataURL('image/jpeg', .7) }; });
  fs.writeFileSync('gen_pdf_' + Wd + '.jpg', Buffer.from(pdf3.img.split(',')[1], 'base64'));
  await p.click('#ptitle,h2').catch(() => { }); await p.waitForTimeout(100); ok(await p.evaluate(() => document.getElementById('tb232').hidden), 'bar hides on outside click');
  await p.evaluate(() => { LSEL = null; LDRAFT = null; HOLD = 0; render(); });
  ok(!o.errs.length, 'no JS errors ' + JSON.stringify(o.errs.slice(0, 5)));
  await o.b.close();
})().catch(e => { console.error('CRASH', e); process.exit(2); });
