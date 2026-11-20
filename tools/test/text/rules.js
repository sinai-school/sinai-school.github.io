// قواعد فحص النصوص المعروضة — تُحقن بالصفحة
window.__scanText = function (root, opt) {
  opt = opt || {};
  const out = [];
  const R = [
    ['قيمة برمجية ظاهرة', /(^|[^A-Za-z])(undefined|null|NaN|Infinity|\[object Object\]|Invalid Date|function\s*\(|=>)($|[^A-Za-z])/],
    ['إيميل مقلوب/أرقامه عربية', /(\.(com|net|org|iq|edu)@)|([A-Za-z][٠-٩]+@)|(@[A-Za-z.]*[٠-٩])/i],
    ['أرقام لاتينية وعربية مخلوطة بنفس الرقم', /[0-9][٠-٩]|[٠-٩][0-9]/],
    ['عامية بنص الواجهة', /(^|[\s«(])(هسه|هسّه|شلون|ماكو|اكو|هواية|خوش|ليش|شنو|منو|هيچ|هيج|چان|يكدر|تكدر|اكدر|ديگول|يطلعله|انرسل|ما انرسل|انحفظ|انحذف|انضاف|بعدين|هذني|هاي|هذولة|وياه|ويا|مالته|مالتك|مال)(?=$|[\s،.:؛!؟»)])/],
    ['عدد ومعدود (٣–١٠ مع مفرد)', /(^|[^\d٠-٩٫.,])([٣-٩]|١٠|[3-9]|10)\s+(طالب|مدرس|درجة|يوم|قسم|ملف|شعبة|صفحة|كتاب|تبليغ|مادة|حساب|موظف|صورة|سجل|ساعة|دقيقة|ثانية|شهر|سنة|حصة|غياب)(?=$|[\s،.:؛!؟)])/],
    ['تاريخ يبدأ بالسنة', /(^|[^\d٠-٩])([12][0-9]{3}|[١٢][٠-٩]{3})\s*[\/]\s*([01]?[0-9]|[٠١]?[٠-٩])\s*[\/]\s*([0-3]?[0-9]|[٠-٣]?[٠-٩])(?![\d٠-٩])/],
    ['كلمة مكررة', /(^|\s)([؀-ۿ]{2,})\s+\2(?=\s|$)/],
    ['نص إنكليزي بالواجهة', /(^|[^A-Za-z@./_-])(Loading|Error|Submit|Cancel|Save|Delete|Close|Back|Next|Login|Logout|Search|Yes|No|OK|true|false)(?=$|[^A-Za-z@./_-])/],
    ['علامات ترقيم مكررة/مقلوبة', /(،،|\.\.\.\.|؟؟|!!|\?)/],
  ];
  const AR = s => String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const yr = /([12][0-9]{3}|[١٢][٠-٩]{3})\s*[-–]\s*([12][0-9]{3}|[١٢][٠-٩]{3})/g;
  const skip = el => el.closest('input,textarea,select,script,style,code,pre,[contenteditable],.dxpage,.dxp,#pr221,svg,noscript,[data-noscan]');
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n; const seen = new Set();
  while ((n = tw.nextNode())) {
    const t = n.nodeValue; if (!t || !t.trim()) continue;
    const el = n.parentElement; if (!el || skip(el) || !vis(el)) continue;
    const full = (el.textContent || '').replace(/\s+/g, ' ').trim();
    for (const [k, re] of R) {
      const m = t.match(re); if (!m) continue;
      if (k === 'نص إنكليزي بالواجهة' && /dir="?ltr|EMIS|PDF|Word|Excel|WhatsApp|Telegram/i.test(el.outerHTML.slice(0, 200) + full)) continue;
      const key = k + '|' + m[0].trim();
      if (seen.has(key)) continue; seen.add(key);
      out.push({ k, m: m[0].trim().slice(0, 40), ctx: full.slice(Math.max(0, full.indexOf(m[0].trim()) - 40), full.indexOf(m[0].trim()) + 60) });
    }
    let y; yr.lastIndex = 0;
    while ((y = yr.exec(t))) { const a = +AR(y[1]), b = +AR(y[2]); if (a > b && a - b < 15) { const key = 'yr|' + y[0]; if (!seen.has(key)) { seen.add(key); out.push({ k: 'عام دراسي مقلوب (الأكبر أولاً)', m: y[0], ctx: full.slice(0, 100) }); } } }
  }
  // صور مكسورة
  root.querySelectorAll('img').forEach(im => { if (vis(im) && im.complete && !im.naturalWidth && !/^data:,$/.test(im.src)) out.push({ k: 'صورة لا تُعرض', m: (im.alt || '') , ctx: im.src.slice(0, 80) }); });
  // أزرار بلا نص ولا وصف
  root.querySelectorAll('button,a.btn,label.btn,[role=button]').forEach(b => { if (!vis(b)) return; const tx = (b.textContent || '').trim(); if (!tx && !b.getAttribute('title') && !b.getAttribute('aria-label') && !b.querySelector('svg,img')) out.push({ k: 'زر فارغ', m: b.outerHTML.slice(0, 60), ctx: '' }); });
  // نص يتجاوز صندوقه (مقطوع)
  if (!opt.noClip) root.querySelectorAll('button,.btn,th,h1,h2,h3,label,.chip,.tag,.badge').forEach(e => { if (!vis(e)) return; const cs = getComputedStyle(e); if ((cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) out.push({ k: 'نص مقطوع داخل عنصر', m: (e.textContent || '').trim().slice(0, 40), ctx: e.tagName }); });
  return out;
};
window.__scanStr = function (s) {
  const out = []; if (!s) return out; s = String(s).replace(/\s+/g, ' ');
  const R = [
    ['قيمة برمجية ظاهرة', /(^|[^A-Za-z])(undefined|null|NaN|Infinity|\[object Object\]|Invalid Date)($|[^A-Za-z])/],
    ['إيميل مقلوب/أرقامه عربية', /(\.(com|net|org|iq)@)|([A-Za-z][٠-٩]+@)|(@[A-Za-z.]*[٠-٩])/i],
    ['أرقام مخلوطة', /[0-9][٠-٩]|[٠-٩][0-9]/],
    ['عدد ومعدود', /(^|[^\d٠-٩٫.,/])([٣-٩]|١٠|[3-9]|10)\s+(طالب|مدرس|حصة|يوم|شهر|سنة|صفحة|شعبة|مادة|درجة|ملف|كتاب|قسم|موظف|سجل)(?=$|[\s،.:؛!؟)])/],
    ['كلمة مكررة', /(^|\s)((?!عبد|محمد|محمود|علي|احمد|حسين|حسن|جاسم|كاظم|عباس|عضو|ـ)[؀-ۿ]{3,})\s+\2(?=\s|$)/],
  ];
  for (const [k, re] of R) { const m = s.match(re); if (m) out.push({ k, m: m[0].trim().slice(0, 40), ctx: s.slice(Math.max(0, s.indexOf(m[0]) - 40), s.indexOf(m[0]) + 60) }); }
  const AR = x => String(x).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)); const yr = /([12][0-9]{3}|[١٢][٠-٩]{3})[\s‏‎]*[-–][\s‏‎]*([12][0-9]{3}|[١٢][٠-٩]{3})/g; let y;
  while ((y = yr.exec(s))) { const a = +AR(y[1]), b = +AR(y[2]); if (a > b && a - b < 15) out.push({ k: 'عام دراسي مقلوب', m: y[0], ctx: s.slice(Math.max(0, y.index - 40), y.index + 40) }); }
  return out;
};
window.__PF = [];
(function hook() {
  const go = () => {
    if (typeof dxRaster == 'function' && !dxRaster.__pf) { const o = dxRaster; dxRaster = function (pg) { try { (window.__scanStr(pg && pg.innerText || pg && pg.textContent)).forEach(x => { x.src = 'dx'; window.__PF.push(x); }); } catch (e) { } return o.apply(this, arguments); }; dxRaster.__pf = 1; }
    if (typeof exportSheets == 'function' && !exportSheets.__pf) { const o = exportSheets; exportSheets = function (fmt, name, sh) { try { (sh || []).forEach(m => { const parts = [m.title, m.sub, ...(m.foot || [])]; (m.rows || []).forEach(r => (r || []).forEach(c => parts.push(c && typeof c == 'object' ? c.v : c))); parts.forEach(t => window.__scanStr(t).forEach(x => { x.src = 'sheet:' + (m.title || '').slice(0, 40); window.__PF.push(x); })); }); } catch (e) { } return o.apply(this, arguments); }; exportSheets.__pf = 1; }
    if (typeof printHere221 == 'function' && !printHere221.__pf) { const o = printHere221; printHere221 = function () { try { const el = document.getElementById('pr221'); } catch (e) { } return o.apply(this, arguments); }; printHere221.__pf = 1; }
  };
  setInterval(go, 500);
})();
