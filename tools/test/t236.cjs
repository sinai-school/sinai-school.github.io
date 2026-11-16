/* v236 — التواريخ: يوم/شهر/سنة دائماً، والعام الدراسي الأصغر أولاً (بالشاشة والاستمارات والأوراق) */
const L = require('./lib.cjs');
(async () => { const { b, p, errs } = await L.staff(+(process.argv[2] || 1366));
  const R = await p.evaluate(async () => { const sl = ms => new Promise(r => setTimeout(r, ms)); const out = {};
    const host = document.createElement('div'); host.className = 'dxpage'; host.innerHTML = '<table><tr><td id="a1">2026-2025</td><td id="a2">سنة التخرج ٢٠٢٦ - ٢٠٢٥</td><td id="a3">2026-11-17</td><td id="a4">٢٠٢٦/١١/١٧</td><td id="a5"><a href="#">2026-11-17</a></td><td id="a6">07701234567</td></tr></table>';
    document.getElementById('main').appendChild(host); await sl(400);
    const g = id => document.getElementById(id).textContent.replace(/‏/g, '|');
    out.dom = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map(g);
    /* الترتيب البصري: «٢٠٢٥» يمين «٢٠٢٦» */
    const r = document.createRange(), tn = document.getElementById('a1').firstChild, s = tn.nodeValue; const pos = t => { const i = s.indexOf(t); r.setStart(tn, i); r.setEnd(tn, i + 4); return r.getBoundingClientRect().x; };
    out.visual_2025_right_of_2026 = pos('٢٠٢٥') > pos('٢٠٢٦');
    host.remove();
    const sh = sheet137('العام الدراسي 2026-2025', ['ت', 'اسم الطالب', 'التاريخ'], [['1', { v: 'س', l: 1 }, '2026-11-17'], ['2', 'ص', '٢٠٢٥/٢٠٢٦']]);
    dates236(sh); out.sheet = JSON.stringify(sh.rows.slice(1).map(r => r[2].v || r[2])).replace(/\\u200f|‏/g, '|'); out.title = (sh.title || '').replace(/‏/g, '|');
    out.wrapped = !!(exportSheets.__235);
    return out; });
  console.log(JSON.stringify(R)); console.log('errs', JSON.stringify(errs.slice(0, 5))); await b.close(); })();
