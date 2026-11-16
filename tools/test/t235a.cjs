/* v235 — الإدارة: أسماء الانتساب بالأحمر (الشاشات/الأوراق/نموذج المراقب/سجل درجات المدرسين) */
const L = require('./lib.cjs');
(async () => { const { b, p, errs } = await L.staff(+(process.argv[2] || 1366));
  const R = await p.evaluate(async () => { const sl = ms => new Promise(r => setTimeout(r, ms)); const out = {};
    const red = el => el && /176, 0, 32|b00020/i.test(getComputedStyle(el).color);
    const INT = STA().filter(isInt); out.nInt = INT.length; const one = INT.find(s => s.s == 'الرابع الأدبي أ') || INT[0];
    /* شاشة قائمة الطلاب */
    view('p'); await sl(1500);
    const els = [...document.querySelectorAll('#main *')].filter(e => e.childElementCount == 0 && e.textContent.trim() == one.n);
    out.listRed = els.length ? els.every(red) : 'notfound';
    const other = STA().find(s => !isInt(s) && s.s == one.s); const oe = [...document.querySelectorAll('#main *')].filter(e => e.childElementCount == 0 && e.textContent.trim() == other.n);
    out.otherNotRed = oe.length ? !oe.some(red) : 'notfound';
    /* نموذج مراقب الشعبة */
    const M = nlModel(one.s, 'mon'); const rr = M.rows.slice(1); out.monRed = rr.filter(r => r[1].red).map(r => r[1].v).sort().join('|') == STA().filter(s => s.s == one.s && isInt(s)).map(s => s.n).sort().join('|');
    out.monRedN = rr.filter(r => r[1].red).length;
    /* الأوراق: سجل درجات بنمط sheet137 */
    const sh = sheet137('اختبار', ['ت', 'اسم الطالب', 'الشهر الأول', 'معدل الفصل الأول', 'رقم القيد', 'الدرجة النهائية كتابة', 'ملاحظات'], [['1', { v: one.n, l: 1 }, '45', '٦٠', '12', 'ثلاثون', ''], ['2', { v: other.n, l: 1 }, 'غ', '50', '3', '', ''], ['3', { v: 'طالب تجريبي', l: 1 }, '80', '30', '', '', 'انتساب']]);
    markSheet235(sh); const g = (r, c) => !!(sh.rows[r][c] && sh.rows[r][c].red);
    out.sheet = { int1: g(1, 1), m45: g(1, 2), m60: g(1, 3), qaid12: g(1, 4), words: g(1, 5), other: g(2, 1), ghaib: g(2, 2), m50: g(2, 3), noteInt: g(3, 1), m30: g(3, 3) };
    /* exportSheets يمرّ بالتعليم */
    let cap = null; const pdf0 = window.pdfSheets; out.wrapped = !!(exportSheets.__235);
    /* سجل درجات المدرسين (DX) لمدرس يدرّس الشعبة */
    const ti = U.find(u => u.secs.some(si => SN[si] == one.s)).t;
    view('fx_r_grd'); await sl(2500);
    try { FX.o = Object.assign(FX.o || {}, { t: String(ti) }); } catch (e) { }
    render(); await sl(4000);
    const tds = [...document.querySelectorAll('#main td')].filter(td => td.textContent.trim() == one.n);
    out.dxFound = tds.length; out.dxRed = tds.length ? tds.every(td => /176, 0, 32|b00020/i.test(getComputedStyle(td.querySelector('*') || td).color)) : 'n/a';
    return out; });
  console.log(JSON.stringify(R)); console.log('errs', JSON.stringify(errs.slice(0, 5))); await b.close(); })();
