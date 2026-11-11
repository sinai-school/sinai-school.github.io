/* ===== v216 (7 Nov 2026) — تعديل ملف الطالب/المدرس بالنظام يوصل للبوابة وحده =====
   الخادم يكتب التصحيح بمعلومات البوابة (rev216_)، و inbox (كل ٢٠ ثانية) يرجع pu (وقت آخر تعديل) والملف إذا تغيّر.
   هنا: نرسل pu اللي عندنا، وإذا وصل ملف أحدث نحدّث الشاشة (بدون ما نمسح شي الطالب/المدرس كاتبه وما انرسل بعد). */
(function () {
  "use strict";
  const W = window, D = document;
  const editing = () => { const a = D.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)); };
  let WAIT = null;
  const apply = r => {
    if (typeof PS == "undefined" || !PS.b) return;
    if (editing()) { WAIT = r; return; }
    WAIT = null;
    let p = Object.assign({}, PS.b.profile || {}, r.profile || {});
    try { if (typeof pq130Mine == "function") pq130Mine().forEach(x => { if (x.b && x.b.a == "save") p = Object.assign(p, x.b.info || {}); }); } catch (e) { }
    PS.b.profile = p; PS.b.pu = r.pu;
    try { if (typeof psKeep == "function") psKeep(); } catch (e) { }
    try { if (typeof prender == "function") prender(); } catch (e) { }
  };
  D.addEventListener("focusout", () => setTimeout(() => { if (WAIT && !editing()) apply(WAIT); }, 300));
  const hook = () => {
    if (typeof api71 != "function" || api71.__v216) return !!(typeof api71 == "function");
    const _a = api71;
    const f = async function (b, ms) {
      try { if (b && b.a == "inbox" && typeof PS != "undefined" && PS.b && PS.b.pu) b = Object.assign({}, b, { pu: PS.b.pu }); } catch (e) { }
      const r = await _a.call(this, b, ms);
      try {
        if (r && r.ok && b && typeof PS != "undefined" && PS.b && b.key == PS.key) {
          if (b.a == "inbox" && r.profile && r.pu && r.pu != PS.b.pu) apply(r);
          else if ((b.a == "login" || b.a == "reg") && r.pu) PS.b.pu = r.pu;
        }
      } catch (e) { }
      return r;
    };
    f.__v216 = 1; api71 = f; return true;
  };
  if (!hook()) { const t = setInterval(() => { if (hook()) clearInterval(t); }, 500); }
})();
