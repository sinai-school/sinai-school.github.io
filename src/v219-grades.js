/* ===== v219 — الدرجات: «غ» = غائب و«م» = مؤجل (طلب المستخدم) =====
   - إدخال الدرجات (الإدارة): كل خانات الفصلين ونصف السنة والنهائي والإكمال تقبل رقم أو غ أو م.
   - الحساب: الغائب يُحسب صفر ويبقى ضمن القسمة — مثلاً غ و٥٠ وغ ← (٠+٥٠+٠)÷٣ = ١٧.
     المؤجل (م) ما يُحسب: السعي/النهائية تبقى فارغة لحد ما تنكتب الدرجة، والحالة «مؤجل».
   - بوابة المدرس: يقبل غ/م، ومعدل الفصل الأول والثاني والسعي السنوي والدرجة النهائية تطلع تلقائياً من الدرجات المرسلة. */
(function () {
  "use strict";
  const W = window;
  const isNv = x => x !== void 0 && x !== null && x !== "";
  /* تحويل أي إدخال إلى: "" أو "غ" أو "م" أو رقم ٠–١٠٠ */
  const norm = v => {
    let t = String(v == null ? "" : v).trim().replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632).replace(/[۰-۹]/g, d => d.charCodeAt(0) - 1776).replace(",", ".");
    if (!t) return "";
    if (/^(غ|غائب|غياب|g)$/i.test(t)) return "غ";
    if (/^(م|مؤجل|موجل|مؤجلة|m)$/i.test(t)) return "م";
    const n = +t; if (isNaN(n)) return null;
    return Math.max(0, Math.min(100, Math.round(n)));
  };
  W.W219n = norm;
  const N = x => x === "غ" ? 0 : (x === "م" || !isNv(x) || isNaN(+x)) ? null : +x;
  /* متوسط مع قاعدة الغائب صفر؛ أي «م» أو خانة فارغة ← ما يطلع */
  const avg = L => { if (L.some(x => x === "م")) return ""; const v = L.map(N); if (v.some(x => x === null)) return ""; return Math.round(v.reduce((a, b) => a + b, 0) / v.length); };
  W.avg219 = avg;
  try {
    W.gv = function (id, sj) {
      const r = ((typeof GD != "undefined" ? GD : {})[id] || {})[sj]; if (!r) return {};
      if (Array.isArray(r)) { const av = (i, j) => avg([r[i], r[j]]); return { a: av(0, 1), m: isNv(r[2]) ? (isNaN(+r[2]) ? r[2] : +r[2]) : "", b: av(3, 4) }; }
      return { ...r };
    };
    W.calc = function (o) {
      o = o || {};
      const y = ["a", "m", "b"].some(k => o[k] === "م") ? "" : ["a", "m", "b"].every(k => isNv(o[k])) ? avg([o.a, o.m, o.b]) : "";
      const f = y !== "" && isNv(o.e) && o.e !== "م" ? avg([y, o.e]) : "";
      const k2 = f !== "" && f < 50 && isNv(o.k) && o.k !== "م" ? N(o.k) : "";
      const eff = k2 !== "" && k2 !== null ? k2 : f;
      const st = o.e === "م" ? "مؤجل" : f === "" ? "" : f >= 50 ? "ناجح" : (k2 === "" || k2 === null) ? (o.k === "م" ? "مؤجل" : "مكمل") : k2 >= 50 ? "ناجح بالإكمال" : "راسب";
      return { y, f, k: k2 === null ? "" : k2, eff, st };
    };
  } catch (e) { console.warn("v219", e); }

  /* ---------- بوابة المدرس: المعدلات والسعي تطلع تلقائياً ---------- */
  const L1 = ["الشهر الأول — الفصل الأول", "الشهر الثاني — الفصل الأول"], L2 = ["الشهر الأول — الفصل الثاني", "الشهر الثاني — الفصل الثاني"];
  const AUTO = {
    "معدل الفصل الأول": L1,
    "معدل الفصل الثاني": L2,
    "السعي السنوي": ["معدل الفصل الأول", "امتحان نصف السنة", "معدل الفصل الثاني"],
    "الدرجة النهائية": ["السعي السنوي", "امتحان آخر السنة"]
  };
  W.tgAuto219 = function (sk, lbl) {
    const G = W.G202 || {}; lbl = lbl || G.lbl;
    const val = (l, depth) => {
      const r = (G.rows || []).find(x => x.skey == sk && x.label == l && x.subj == G.sj);
      if (r && isNv(r.val)) return String(r.val);
      if (AUTO[l] && depth < 3) { const v = avg(AUTO[l].map(x => val(x, depth + 1))); return v === "" ? "" : String(v); }
      return "";
    };
    if (!AUTO[lbl]) return "";
    return val(lbl, 0);
  };
  W.tgIsAuto219 = l => !!AUTO[l || (W.G202 || {}).lbl];
  try { const st = document.createElement("style"); st.textContent = `input.au219{background:#eef7f1;color:#0f4d3c;font-weight:700}.g219{font-size:12px;margin:4px 0 8px}`; document.head.appendChild(st); } catch (e) { }
})();
