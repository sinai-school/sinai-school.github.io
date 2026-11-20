/* ===== v254 (2026-11-21، فحص شامل بطلب المستخدم): العدد والمعدود بالعربية الفصحى — عرض فقط =====
   «٥ حصة» ← «٥ حصص»، «١٠ طالب» ← «١٠ طلاب»، «٣ سنة و٧ شهر و١٥ يوم» ← «٣ سنوات و٧ أشهر و١٥ يوماً».
   القاعدة: آخر رقمين ٣–١٠ ← جمع؛ ١١–٩٩ ← مفرد منصوب (المذكر يأخذ «اً»)؛ غير ذلك كما هو.
   يمر على نصوص الشاشة (الإدارة والبوابة) والأوراق المطبوعة (exportSheets)، ولا يلمس: الخانات، النص القابل للتعديل،
   الاستمارات والكتب المصممة (.dxpg/.dxpage/#pr221)، ولا البيانات المحفوظة. */
(function () {
  "use strict";
  const W = window, D = document;
  const PL = { "طالب": "طلاب", "مدرس": "مدرسين", "حصة": "حصص", "يوم": "أيام", "شهر": "أشهر", "سنة": "سنوات", "ساعة": "ساعات", "دقيقة": "دقائق", "صفحة": "صفحات", "شعبة": "شعب", "مادة": "مواد", "درجة": "درجات", "ملف": "ملفات", "كتاب": "كتب", "قسم": "أقسام", "حساب": "حسابات", "موظف": "موظفين", "صورة": "صور", "سجل": "سجلات", "تبليغ": "تبليغات", "غياب": "غيابات", "مرفق": "مرفقات", "قاعة": "قاعات", "طالبة": "طالبات", "مدرسة": "مدرسات" };
  const ACC = { "طالب": "طالباً", "مدرس": "مدرساً", "يوم": "يوماً", "شهر": "شهراً", "ملف": "ملفاً", "كتاب": "كتاباً", "قسم": "قسماً", "حساب": "حساباً", "موظف": "موظفاً", "سجل": "سجلاً", "تبليغ": "تبليغاً", "غياب": "غياباً", "مرفق": "مرفقاً" };
  const NOUNS = Object.keys(PL).sort((a, b) => b.length - a.length).join("|");
  const RE = new RegExp("(^|[^0-9٠-٩٫.,/\\-])([0-9٠-٩]{1,6})(\\s+)(" + NOUNS + ")(?=$|[\\s،.:؛!؟)\\]»\\-–—]|<)", "g");
  const num = s => +String(s).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  function fix(t) {
    if (!t || t.length < 3 || !/[0-9٠-٩]\s+[؀-ۿ]/.test(t)) return t;
    return t.replace(RE, (m, pre, n, sp, w) => {
      const v = num(n), r = v % 100;
      if (r >= 3 && r <= 10) return pre + n + sp + PL[w];
      if (r >= 11 && r <= 99 && ACC[w]) return pre + n + sp + ACC[w];
      return m;
    });
  }
  W.ar254 = fix;
  const SKIP = "input,textarea,select,script,style,code,pre,[contenteditable],.dxpg,.dxpage,.dxp,#pr221,[data-noscan],[data-nogram],svg";
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { const p = root.parentElement; if (p && !p.closest(SKIP)) { const v = fix(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; } return; }
    if (root.nodeType !== 1 || root.closest && root.closest(SKIP)) return;
    const tw = D.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; const L = [];
    while ((n = tw.nextNode())) if (/[0-9٠-٩]\s+[؀-ۿ]/.test(n.nodeValue)) L.push(n);
    L.forEach(t => { const p = t.parentElement; if (!p || p.closest(SKIP)) return; const v = fix(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; });
  }
  W.ar254Walk = walk;
  let Q = new Set(), tm = 0;
  const flush = () => { tm = 0; const L = [...Q]; Q.clear(); L.forEach(n => { if (n.isConnected) walk(n); }); };
  const mo = new MutationObserver(ms => { for (const m of ms) { if (m.type === "characterData") Q.add(m.target); else m.addedNodes.forEach(n => Q.add(n)); } if (!tm) tm = setTimeout(flush, 40); });
  const start = () => { walk(D.body); mo.observe(D.body, { childList: true, subtree: true, characterData: true }); };
  if (D.body) start(); else D.addEventListener("DOMContentLoaded", start);
  /* الأوراق المطبوعة/المصدّرة */
  function fixSheet(m) {
    if (!m || typeof m != "object") return;
    ["title", "sub", "t", "h"].forEach(k => { if (typeof m[k] == "string") m[k] = fix(m[k]); });
    if (Array.isArray(m.foot)) m.foot = m.foot.map(x => typeof x == "string" ? fix(x) : x);
    (m.rows || []).forEach(r => Array.isArray(r) && r.forEach((c, i) => { if (typeof c == "string") r[i] = fix(c); else if (c && typeof c.v == "string") c.v = fix(c.v); }));
  }
  function wrapX() {
    if (typeof exportSheets != "function") return false; if (exportSheets._v254) return true;
    const prev = exportSheets;
    exportSheets = function (fmt, name, sheets) { try { (sheets || []).forEach(fixSheet); } catch (e) { } return prev.apply(this, arguments); };
    exportSheets._v254 = 1; return true;
  }
  if (!wrapX()) { let k = 0; const t = setInterval(() => { if (wrapX() || ++k > 60) clearInterval(t); }, 250); }
})();
