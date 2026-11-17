/* v237 — (١) التاريخ: اليوم يمين، الشهر بالوسط، السنة يسار (بالشاشة). (٢) نافذة «تعديل الجدول قبل الطباعة»: أعمدة/صفوف/أوراق */
const L = require('./lib.cjs');
(async () => { const { b, p, errs } = await L.staff(+(process.argv[2] || 1366));
  const R = await p.evaluate(async () => { const sl = ms => new Promise(r => setTimeout(r, ms)); const out = {};
    /* (١) ترتيب التاريخ بصرياً */
    const d = document.createElement('div'); d.style.cssText = 'direction:rtl;font-size:20px'; d.id = 'dt237';
    d.innerHTML = '<span id="x1">تاريخ الكتاب 2026-11-17</span><br><span id="x2">17/11/2026</span><br><span id="x3">٢٠٢٦/١١/١٧ م</span>';
    document.getElementById('main').appendChild(d); await sl(400);
    const order = id => { const el = document.getElementById(id), tn = el.firstChild, s = tn.nodeValue, r = document.createRange();
      const at = t => { const i = s.indexOf(t); r.setStart(tn, i); r.setEnd(tn, i + t.length); return r.getBoundingClientRect().x; };
      const day = at('١٧'), mon = at('١١'), yr = at('٢٠٢٦'); return { txt: s.replace(/‏/g, '|'), dayRight: day > mon && mon > yr }; };
    out.dates = ['x1', 'x2', 'x3'].map(order); d.remove();
    /* (٢) نافذة التعديل */
    let cap = null; const ES = exportSheets; window.exportSheets = async (f, n, s) => { cap = s; };
    const sh = [sheet137('اختبار الأعمدة', ['ت', 'الاسم الرباعي', 'العنوان الوظيفي', 'ملاحظات'], [['1', { v: 'أ ب ج د', l: 1 }, 'مدير', ''], ['2', { v: 'هـ و ز ح', l: 1 }, 'مدرس', ''], ['3', { v: 'ط ي ك ل', l: 1 }, 'مدرس', '']])];
    const pr = v202Exp('pdf', 'اختبار ٢٣٧', sh); await sl(600);
    const clk = sel => { const e = document.querySelector(sel); if (!e) throw new Error('no ' + sel); e.click(); };
    clk('.zoom [data-ed]'); await sl(500);
    clk('[data-cadd="0:1"]'); await sl(150);          // عمود بعد الاسم
    clk('[data-cdel="0:4"]'); await sl(150);          // حذف «ملاحظات» (صار رقم ٤)
    clk('[data-ins="0:1"]'); await sl(150);           // صف تحت الصف الأول
    clk('[data-del="0:3"]'); await sl(150);           // حذف صف (الأصلي الثاني)
    clk('[data-pdup="0"]'); await sl(150);            // تكرار الورقة
    clk('[data-pnew="1"]'); await sl(150);            // ورقة فارغة بعد الثانية
    clk('[data-pdel="1"]'); await sl(150);            // حذف النسخة المكررة
    const td = document.querySelector('[data-s="0"][data-r="0"][data-c="2"]'); td.innerText = 'الهاتف';
    clk('.zoom [data-ok]'); await pr; await sl(300);
    window.exportSheets = ES;
    out.sheets = (cap || []).map(m => ({ title: m.title, sheet: m.sheet, rows: m.rows.map(r => r.map(c => (c && typeof c == 'object' ? c.v : c))) , ww: Array.isArray(m.ww) ? m.ww.length : null }));
    return out; });
  console.log(JSON.stringify(R, null, 0)); console.log('errs', JSON.stringify(errs.slice(0, 5))); await b.close(); })();
