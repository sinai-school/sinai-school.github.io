/* ===== v207m — تأييد الدرجات من البوردات =====
   تكتب اسم الخريج (أو رقمه الامتحاني) ← تطلع نتائجه من البوردات المقروءة ← تختار ← ينملي الكتاب:
   الاسم، الصف والفرع، العام الدراسي، الدور، الرقم الامتحاني، ودرجات المواد بالضبط مثل البورد (المجموع يتطابق). */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v207m", e); } };
  const E = s => (typeof esc == "function" ? esc(s) : String(s == null ? "" : s));
  const A = v => (typeof toAr == "function" ? toAr(v) : v);
  const NZ = t => String(t || "").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/\s+/g, " ").trim();
  const DG = v => String(v == null ? "" : v).replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[۰-۹]/g, c => "۰۱۲۳۴۵۶۷۸۹".indexOf(c));
  const num = v => { const t = DG(v); if (/صفر/.test(t)) return "0"; const m = t.match(/\d+(\.\d+)?/); return m ? m[0] : ""; };

  /* اسم المادة بالبورد ← مفتاح المادة بالنظام */
  function canon(c) {
    const s = NZ(c).replace(/^ال/, "");
    if (/اسلام|دين/.test(s)) return "إسلامية";
    if (/عرب/.test(s)) return "عربي";
    if (/انكل|انجل|نكليز|نجليز/.test(s)) return "إنكليزي";
    if (/كرد/.test(s)) return "كردي";
    if (/رياضيات/.test(s)) return "رياضيات";
    if (/فيزي/.test(s)) return "فيزياء";
    if (/كيمي/.test(s)) return "كيمياء";
    if (/احيا|احياء|حياتي/.test(s)) return "احياء";
    if (/تاريخ/.test(s)) return "تاريخ";
    if (/جغراف/.test(s)) return "جغرافية";
    if (/اقتصاد/.test(s)) return "اقتصاد";
    if (/اجتماع/.test(s)) return "اجتماع";
    if (/فلسف/.test(s)) return "فلسفة";
    if (/حاسوب|حاسبات/.test(s)) return "حاسوب";
    if (/فرنس/.test(s)) return "فرنسية";
    if (/فني/.test(s)) return "فنية";
    if (/رياض/.test(s)) return "رياضة";
    return "";
  }
  const brKey = br => { const s = NZ(br); return /ادب/.test(s) ? "adabi" : /احيا/.test(s) ? "ahy" : /تطبيق/.test(s) ? "tat" : "ilmi"; };
  const roundTxt = r => { const s = String(r || "").replace(/الدور\s*/g, "").trim(); return /محاول/.test(s) ? "الأول" : s || "الأول"; };
  const pass = r => /ناجح/.test(NZ(r[4] || "")) && !/غير/.test(NZ(r[4] || ""));
  const RO = r => /ثالث/.test(r) ? 3 : /ثاني/.test(r) ? 2 : 1;

  function tdBx(i) {
    const x = (W._tdbx207 || [])[i]; if (!x) return;
    const L = LDRAFT; if (!L || !L.td) { toast("افتح «تأييد درجات» من نماذج الكتب", "err"); return; }
    const { b, r } = x, td = L.td, old = td.cl || tdLbl(td);
    td.c = 6; td.b = brKey(b.br); td.dest = "grad"; gxRows(td);
    const tpl = td.rows.map(z => z.k), cols = b.cols || [], g = r[3] || [];
    const rows = [], used = new Set;
    cols.forEach((c, i2) => {
      const k = canon(c), v = num(g[i2]);
      if (k == "فنية" || k == "رياضة") return;
      rows.push({ k: k || "", sj: k ? (typeof fullN == "function" ? fullN(k) : c) : String(c), v, i: i2 });
    });
    rows.sort((p, q) => { const a = tpl.indexOf(p.k), c2 = tpl.indexOf(q.k); return (a < 0 ? 99 + p.i : a) - (c2 < 0 ? 99 + q.i : c2); });
    td.rows = rows.map(z => { used.add(z.k); return { k: z.k, sj: z.sj, v: z.v }; });
    let s = 0; td.rows.forEach(z => { if (z.v !== "") s += +z.v; });
    const tot = num(r[5]);
    td.sum = tot && +tot != s ? tot : null; td.sumw = null;
    td.en = num(r[1]) || ""; td.cl = tdLbl(td);
    tdSwap(L, old, td.cl); tdSwap(L, td.nm, r[2]); td.nm = r[2];
    let body = String(L.body || "");
    body = body.replace(/للعام الدراسي \([^)]*\)/, "للعام الدراسي (" + String(b.yr || "") + ")");
    body = body.replace(/من الدور \([^)]*\)/, "من الدور (" + roundTxt(b.round) + ")");
    if (!/كان أحد طلاب مدرستنا/.test(body)) body = body.replace("أحد طلاب مدرستنا", "كان أحد طلاب مدرستنا");
    L.body = body;
    const e = D.getElementById("tdq120"); if (e) e.innerHTML = "";
    render();
    const miss = td.rows.filter(z => z.v === "").length;
    toast(td.sum ? "كُتبت الدرجات — المجموع حسب البورد" : miss ? "كُتبت الدرجات — " + A(miss) + " مادة بدون درجة بالبورد" : "كُتب الاسم والرقم الامتحاني والدرجات من البورد ✓", td.sum || miss ? "err" : "");
  }
  W.tdBx207 = tdBx;

  function boardHTML(v) {
    if (typeof W.bxFind207 != "function") return "";
    try { if (typeof W.bxSub207 == "function") W.bxSub207(); } catch (e) { }
    const n = typeof W.bxN207 == "function" ? W.bxN207() : 0;
    if (n < 0) { clearTimeout(W._tdbxT); W._tdbxT = setTimeout(() => { const i = D.querySelector('input[placeholder^="اكتب اسم الطالب أو الخريج"]'); if (i && i.value.trim()) tdQ120(i.value); }, 1200); return `<h4>من البوردات</h4><p class="muted" style="margin:0 0 6px">جارٍ تحميل البوردات…</p>`; }
    const R = (W.bxFind207(v) || []).slice();
    /* لكل طالب: النتيجة الناجحة أولاً */
    const key = x => num(x.r[1]) || NZ(x.r[2]);
    const G = new Map; R.forEach(x => { const k = key(x); if (!G.has(k)) G.set(k, []); G.get(k).push(x); });
    const R2 = []; G.forEach(L => { L.sort((x, y) => (pass(y.r) - pass(x.r)) || String(y.b.yr).localeCompare(String(x.b.yr)) || RO(y.b.round) - RO(x.b.round)); R2.push(...L); });
    R.length = 0; R.push(...R2);
    const top = R.slice(0, 25); W._tdbx207 = top;
    if (!top.length) return "";
    return `<h4>من البوردات (بالرقم الامتحاني والدرجات)</h4>` + top.map((x, i) => {
      const ok = pass(x.r);
      return `<button class="gsi" onclick="tdBx207(${i})"><b>${E(x.r[2])}</b><span>السادس ${E(GX_BR[brKey(x.b.br)] || x.b.br || "")} — ${E(A(String(x.b.yr || "")))} — ${E(x.b.round || "")} — <b style="color:${ok ? "#1b6b3a" : "#b00020"}">${E(x.r[4] || "")}</b> — رقم ${E(A(num(x.r[1])))}</span></button>`;
    }).join("");
  }

  on(() => {
    if (typeof tdQ120 != "function") return;
    const _q = tdQ120;
    W.tdQ120 = function (v) {
      _q.apply(this, arguments);
      try {
        const e = D.getElementById("tdq120"); if (!e) return;
        const q = String(v || "").trim(); if (q.length < 2) return;
        const h = boardHTML(q); if (!h) return;
        let cur = e.innerHTML;
        if (/لم أجد هذا الاسم/.test(cur)) cur = "";
        e.innerHTML = h + cur;
      } catch (x) { console.warn(x); }
    };
  });
  /* تحميل البوردات أول ما ينفتح كتاب التأييد */
  on(() => { if (typeof tdView != "function") return; const _v = tdView; tdView = function () { try { if (typeof W.bxSub207 == "function") W.bxSub207(); } catch (e) { } return _v.apply(this, arguments); }; });
})();
