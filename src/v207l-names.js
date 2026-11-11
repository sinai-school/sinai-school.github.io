/* ===== v207l — مطابقة أسماء القيد العام تنحل وحدها حسب البطاقة الموحدة (اسم البوابة) =====
   - البطاقة تطابق اسم الصف (أو اسم الصف يكمّلها) ← اسم الصف صحيح ← يتصحح القيد
   - البطاقة تطابق اسم القيد (أو القيد يكمّلها) ← اسم القيد صحيح ← يتصحح النظام
   - البطاقة أطول وتكمّل الاثنين ← اسم البطاقة يتعتمد بالاثنين
   - غير هيج (طالب ثاني، أو بلا بطاقة، أو تعارض) ← يبقى لاختيارك */
(function () {
  "use strict";
  const W = window, D = document;
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
  /* v207m: كل مطابقة تنحل مرة وحدة بس (تنحفظ بالجهاز) وبدون رسائل متكررة — إذا رجعت نفس المطابقة تبقى لاختيارك */
  const pgK = v => String(v == null ? "" : v).replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/\D/g, "");
  const DK = "nm207m";
  const dGet = () => { try { return JSON.parse(localStorage.getItem(DK) || "[]"); } catch (e) { return []; } };
  const dPut = L => { try { localStorage.setItem(DK, JSON.stringify(L.slice(-3000))); } catch (e) { } };
  const jk = (it, f) => pgK(it.r && it.r.pg) + "|" + sq(it.r && it.r.n) + "|" + sq(it.s && it.s.n) + "|" + f;
  /* v207n: يشتغل مرة وحدة بس بعد ما يهدأ النظام (دقيقة من الفتح)، بدون رسائل وبدون إعادة رسم بكل خطوة — ما يثقّل النظام */
  let busy = 0, ran = 0;
  async function run() {
    if (busy || !W.GXOWN || typeof W.q205 != "function") return;
    if (typeof guard == "function") { try { if (guard()) return; } catch (e) { return; } }
    const Q = W.q205(); if (!Q || !Q.rev || !Q.rev.length) return;
    const done = new Set(dGet());
    const jobs = []; Q.rev.forEach((it, i) => { const f = decide(it); if (f && typeof W[f] == "function" && !done.has(jk(it, f))) jobs.push([i, f, jk(it, f)]); });
    if (!jobs.length) return;
    busy = 1; const _c = W.confirm, _t = W.toast, _r = W.render;
    const L = dGet(); jobs.slice(0, 30).forEach(j => L.push(j[2])); dPut(L);
    try {
      W.confirm = () => true; W.toast = () => { }; W.render = () => { };
      const J = jobs.slice(0, 30);
      for (let k = J.length - 1; k >= 0; k--) { const [i, f] = J[k]; try { await W[f](i); } catch (e) { } await new Promise(r => setTimeout(r, 30)); }
    } finally { W.confirm = _c; W.toast = _t; W.render = _r; busy = 0; }
  }
  W.names207l = run;
  const idle = fn => (W.requestIdleCallback ? W.requestIdleCallback(fn, { timeout: 5000 }) : setTimeout(fn, 200));
  on(() => setTimeout(() => idle(() => { if (!ran) { ran = 1; run(); } }), 60000));
})();
