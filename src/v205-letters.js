/* ===== v205 (29 Oct 2026) — إصلاحات: ترقيم الكتب بعد «بلا»، نشر البوابة فوراً بعد أي حفظ، البوابة تتحدث خلال ثواني ===== */
(function () {
  "use strict";
  const on = fn => { try { return fn(); } catch (e) { console.warn("v205", e); } };
  const dg = x => String(x == null ? "" : x).replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[۰-۹]/g, c => "۰۱۲۳۴۵۶۷۸۹".indexOf(c)).trim();
  const isBla = x => /^\s*بلا\s*$/.test(String(x == null ? "" : x));
  const LK = "ltno205";

  /* ---------- (١) العدد: آخر رقم صادر حقيقي + ١ (كتاب «بلا» أو بدون عدد ما يأثر على التسلسل) ---------- */
  function lastNo205(iso) {
    const y = String(iso || "").slice(0, 4); let mx = 0;
    const take = (no, d) => { const n = dg(no); if (/^\d{1,6}$/.test(n) && String(d || "").slice(0, 4) == y) mx = Math.max(mx, +n); };
    on(() => (typeof LET != "undefined" ? LET : []).forEach(l => { if (!l.nonum) take(l.no, l.date); }));
    on(() => (typeof ML != "undefined" ? ML : []).forEach(m => { if (m && m.k == "out") take(m.no, m.date); }));
    on(() => { if (typeof LC70 != "undefined" && LC70 && LC70.no) take(LC70.no, (LC70.y || "") + "-"); });
    on(() => { const c = JSON.parse(localStorage.getItem(LK) || "null"); if (c) take(c.no, (c.y || "") + "-"); });
    return mx;
  }
  (window.W205 = window.W205 || {}).lastNo = lastNo205;
  function tplIsBla() {
    try { if (typeof LTPLK == "undefined" || !LTPLK) return false; const t = (typeof TPL != "undefined" ? TPL : []).find(x => x.k == LTPLK); return !!(t && t.L && isBla(t.L.no)); } catch (e) { return false; }
  }
  if (typeof lNew == "function") {
    const _ln = lNew;
    lNew = function (base) {
      /* «نسخ ككتاب جديد» من كتاب عدده بلا: العدد يرجع تلقائي */
      let b = base;
      if (b && (b.id || !tplIsBla()) && isBla(b.no)) b = { ...b, no: "" };
      const r = _ln.call(this, b);
      on(() => {
        if (!LDRAFT || LDRAFT.nonum) return;
        if (tplIsBla() && isBla(LDRAFT.no)) return; /* نموذج رسمي عدده «بلا» بالأصل (استفسار، تعهد…) */
        const nx = lastNo205(LDRAFT.date) + 1, cur = dg(LDRAFT.no);
        if (!/^\d+$/.test(cur) || +cur < nx) LDRAFT.no = String(nx);
        if (typeof render == "function") render();
      });
      return r;
    };
  }
  /* كل كتاب ينحفظ برقم حقيقي: نحفظ الرقم بالجهاز أيضاً (احتياط إذا الخادم بطيء) */
  if (typeof lSave == "function") {
    const _ls = lSave;
    lSave = function () {
      const r = _ls.apply(this, arguments);
      on(() => { const L = LDRAFT; const n = dg(L && L.no); if (L && /^\d+$/.test(n)) { const y = String(L.date || "").slice(0, 4), c = JSON.parse(localStorage.getItem(LK) || "null"); if (!c || c.y != y || +c.no < +n) localStorage.setItem(LK, JSON.stringify({ no: +n, y })); } });
      return r;
    };
  }
})();
