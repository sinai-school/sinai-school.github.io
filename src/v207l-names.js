/* ===== v207l — مطابقة أسماء القيد العام تنحل وحدها حسب البطاقة الموحدة (اسم البوابة) =====
   - البطاقة تطابق اسم الصف (أو اسم الصف يكمّلها) ← اسم الصف صحيح ← يتصحح القيد
   - البطاقة تطابق اسم القيد (أو القيد يكمّلها) ← اسم القيد صحيح ← يتصحح النظام
   - البطاقة أطول وتكمّل الاثنين ← اسم البطاقة يتعتمد بالاثنين
   - غير هيج (طالب ثاني، أو بلا بطاقة، أو تعارض) ← يبقى لاختيارك */
(function () {
  "use strict";
  const W = window;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v207l", e); } };
  const NZ = s => String(s || "").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim().replace(/(^|\s)(عبد|ابو)\s+/g, "$1$2");
  const sq = s => NZ(s).replace(/ /g, "");
  const eq = (x, y) => !!x && !!y && sq(x) == sq(y);
  const ext = (x, y) => { const a = NZ(x), b = NZ(y); return !!a && !!b && a.length > b.length && (a + " ").startsWith(b + " "); };
  function decide(it) {
    const a = it.s && it.s.n, b = it.r && it.r.n, p = it.pn;
    if (!a || !b || !p) return "";
    const aOk = eq(a, p) || ext(a, p), bOk = eq(b, p) || ext(b, p);
    if (aOk && bOk) return NZ(a).length >= NZ(b).length ? "qFix205" : "q206Sys";
    if (aOk) return "qFix205";
    if (bOk) return "q206Sys";
    if (ext(p, a) && ext(p, b)) return "q206Por";
    return "";
  }
  let busy = 0, last = 0;
  async function run() {
    if (busy || !W.GXOWN || typeof W.q205 != "function") return;
    if (typeof guard == "function") { try { if (guard()) return; } catch (e) { return; } }
    const Q = W.q205(); if (!Q || !Q.rev || !Q.rev.length) return;
    const jobs = []; Q.rev.forEach((it, i) => { const f = decide(it); if (f && typeof W[f] == "function") jobs.push([i, f]); });
    if (!jobs.length) return;
    busy = 1; const _c = W.confirm, _r = W.render; let n = 0;
    try {
      W.confirm = () => true;
      for (let k = jobs.length - 1; k >= 0; k--) { const [i, f] = jobs[k]; try { await W[f](i); n++; } catch (e) { } }
    } finally { W.confirm = _c; busy = 0; }
    try { if (n && typeof toast == "function") toast("انحلّت " + (typeof toAr == "function" ? toAr(n) : n) + " مطابقة اسم وحدها حسب البطاقة الموحدة ✓"); } catch (e) { }
    try { if (typeof render == "function") render(); } catch (e) { }
  }
  W.names207l = run;
  on(() => setInterval(() => { if (Date.now() - last > 20000 && !document.hidden) { last = Date.now(); run(); } }, 5000));
})();
