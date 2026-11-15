/* ===== v232 — تأييد الدرجات: حقل «المعدل» (من البورد الوزاري حصراً) + أدوات تعديل الجداول في نماذج الكتب =====
   1) المعدل: خانة بين «المجموع» و«الرقم الامتحاني». قيمتها = عمود المعدل في البورد المقروء (brdx r[6]) كما هو
      بلا حساب ولا تقريب. تُكتب عند اختيار الطالب من البوردات، أو تلقائياً لتأييد محفوظ إذا تطابق الرقم الامتحاني
      والاسم والمجموع مع سطر واحد في البورد. لا تُحسب من الدرجات أبداً.
   2) الجداول: الضغط على أي خانة جدول في ورقة الكتاب يُظهر شريط أدوات (صف أعلى/أسفل، حذف الصف، تحريك، عمود يمين/يسار،
      حذف العمود). في تأييد الدرجات: صفوف المواد بأي موضع، أعمدة إضافية (td.xc + r.x)، وحقول إضافية (td.xf)،
      وحذف/إرجاع الحقول الأصلية (td.hid). */
(function () {
  "use strict";
  const W = window, D = document;
  if (typeof tdTblHTML != "function" || typeof tdTblPDF != "function" || typeof tRows != "function") return;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v232", e); } };
  const A = v => (typeof toAr == "function" ? toAr(v) : String(v == null ? "" : v));
  const E = s => (typeof esc == "function" ? esc(s) : String(s == null ? "" : s));
  const T = (m, k) => { try { toast(m, k || ""); } catch (e) { } };
  const DG = v => String(v == null ? "" : v).replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[۰-۹]/g, c => "۰۱۲۳۴۵۶۷۸۹".indexOf(c));
  const NZ = t => String(t || "").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/\s+/g, " ").trim();
  const num = v => { const m = DG(v).match(/\d+(\.\d+)?/); return m ? m[0] : ""; };

  /* ---------- المعدل ---------- */
  /* قيمة البورد كما هي: أرقام وفاصلة عشرية فقط — بلا تقريب ولا إعادة حساب */
  const avgNorm = v => {
    const t = DG(v).replace(/[٫,،]/g, ".").replace(/[^\d.]/g, "");
    if (!/^\d+(\.\d+)?$/.test(t)) return "";
    return +t > 0 ? t : "";
  };
  const avgT = td => (td.avg == null || td.avg === "" ? "" : A(String(td.avg)));
  W.avg232 = avgNorm;

  const hid = td => td.hid || {};
  const XC = td => (Array.isArray(td.xc) ? td.xc : []);
  const XF = td => (Array.isArray(td.xf) ? td.xf : []);
  const showSum = td => +td.c == 6 && !hid(td).sum;
  const showAvg = td => +td.c == 6 && td.dest != "school" && !hid(td).avg;
  const showEn = td => +td.c == 6 && td.dest != "school" && !hid(td).en;
  const colW = td => { const n = XC(td).length, e = n == 1 ? 16 : n == 2 ? 14 : 12, k = (100 - n * e) / 100; return [6 * k, 36 * k, 13 * k, 45 * k].concat(XC(td).map(() => e)); };
  const LBL_AVG = "المعـــــدل";

  /* تأييد محفوظ قبل هذا التحديث: يُملأ المعدل من البورد إذا تطابق الرقم الامتحاني والاسم والمجموع */
  let tries = 0, rt = 0;
  function autoAvg(L) {
    const td = L && L.td; if (!td || +td.c != 6 || td.avgSrc || (td.avg != null && td.avg !== "")) return;
    const en = gxNum(td.en); if (en.length < 4 || typeof W.bxFind207 != "function") return;
    try { if (typeof W.bxSub207 == "function") W.bxSub207(); } catch (e) { }
    const n = typeof W.bxN207 == "function" ? W.bxN207() : -1;
    if (n < 0) {
      if (tries < 10) { tries++; clearTimeout(rt); rt = setTimeout(() => { if (LDRAFT === L && D.getElementById("lprev") && !(D.activeElement && D.activeElement.closest && D.activeElement.closest("#lprev,input,textarea,select"))) on(() => render()); else if (LDRAFT === L) autoAvg(L) || 0; }, 1500); }
      return;
    }
    const s = tdSum(td), nm = NZ(td.nm);
    const R = (W.bxFind207(en) || []).filter(x => num(x.r[1]) == en && NZ(x.r[2]) == nm && num(x.r[5]) !== "" && +num(x.r[5]) == +s && avgNorm(x.r[6]));
    const S = new Set(R.map(x => avgNorm(x.r[6])));
    if (S.size == 1) { td.avg = [...S][0]; td.avgSrc = "b"; return 1; }
  }

  /* اختيار الطالب من البوردات: المعدل = عمود المعدل بالبورد كما هو */
  on(() => {
    const _bx = W.tdBx207; if (typeof _bx != "function") return;
    W.tdBx207 = function (i) {
      on(() => { const x = (W._tdbx207 || [])[i], L = LDRAFT; if (x && L && L.td) { L.td.avg = avgNorm(x.r[6]); L.td.avgSrc = "b"; if (L.td.hid && L.td.hid.avg) delete L.td.hid.avg; } });
      return _bx.apply(this, arguments);
    };
  });
  /* اختيار طالب حالي أو خريج من القائمة القديمة: المعدل السابق لا يبقى (يُبحث عنه في البورد من جديد) */
  on(() => { const _s = tdStu; tdStu = function (id) { on(() => { const L = LDRAFT; if (L && L.td && id) { L.td.avg = null; delete L.td.avgSrc; } }); return _s.apply(this, arguments); }; });
  on(() => { if (typeof tdGrad120 != "function") return; const _g = tdGrad120; tdGrad120 = function () { on(() => { const L = LDRAFT; if (L && L.td) { L.td.avg = null; delete L.td.avgSrc; } }); return _g.apply(this, arguments); }; });

  /* ---------- الورقة (المعاينة القابلة للتعديل) ---------- */
  tdTblHTML = function (L) {
    const td = L.td; if (!td) return "";
    const B = "border:1px solid #000;padding:1.2mm 2mm;text-align:center;font-weight:700", H = B + ";background:" + TDG, box = "border:3px double #000;margin:3mm 0 0";
    const xc = XC(td), w = colW(td);
    let h = `<div style="${box}"><table style="width:100%;border-collapse:collapse;font-size:12.5pt;table-layout:fixed"><colgroup>${w.map(x => `<col style="width:${x.toFixed(2)}%">`).join("")}</colgroup>
<tr><td rowspan="2" style="${H}">ت</td><td rowspan="2" style="${H}">المـواد الدراسيـة</td><td colspan="2" style="${H};padding:.6mm">الدرجـــــة</td>${xc.map((c, j) => `<td rowspan="2" style="${H}" ${CE("xh:" + j)}>${E(A(c))}</td>`).join("")}</tr><tr><td style="${H};padding:.6mm;font-size:11.5pt">رقماً</td><td style="${H};padding:.6mm;font-size:11.5pt">كتابـــــة</td></tr>
${td.rows.map((r, i) => `<tr><td style="${B}">${A(i + 1)}</td><td style="${B}" ${CE("sj:" + i)}>${E(r.sj)}</td><td style="${B}" ${CE("v:" + i)}>${E(tdNumT(r.v))}</td><td style="${B}" ${CE("w:" + i)}>${E(tdRowW(r))}</td>${xc.map((c, j) => `<td style="${B}" ${CE("x:" + i + ":" + j)}>${E(A((r.x || [])[j] || ""))}</td>`).join("")}</tr>`).join("")}</table></div>`;
    const one = (lab, val, kL, kV, ls) => `<div style="${box};margin-top:1.2mm"><table style="width:100%;border-collapse:collapse;font-size:12.5pt;table-layout:fixed"><colgroup><col style="width:31%"><col style="width:69%"></colgroup><tr><td style="${H}" ${kL ? CE(kL) : ""}>${E(lab)}</td><td style="${B}${ls ? ";letter-spacing:.5px" : ""}" ${CE(kV)}>${E(val)}</td></tr></table></div>`;
    if (showSum(td)) {
      const s2 = tdSum(td);
      h += `<div style="${box};margin-top:1.2mm"><table style="width:100%;border-collapse:collapse;font-size:12.5pt;table-layout:fixed"><colgroup><col style="width:24%"><col style="width:10%"><col style="width:66%"></colgroup>
<tr><td rowspan="2" style="${H};font-size:16pt">المجموع</td><td style="${H};padding:.6mm;font-size:11pt">رقماً</td><td style="${H};padding:.6mm;font-size:11pt">كتابـــــة</td></tr>
<tr><td style="${B}" ${CE("sum")}>${E(s2 === "" ? "" : A(s2))}</td><td style="${B};font-weight:600" ${CE("sumw")}>${E(tdSumW(td))}</td></tr></table></div>`;
    }
    if (showAvg(td)) h += one(LBL_AVG, avgT(td), "", "avg", 1);
    if (showEn(td)) h += one("الرقـــم الامتحاني", A(td.en || ""), "", "en", 1);
    XF(td).forEach((f, i) => { h += one(A(f.l || ""), A(f.v || ""), "xl:" + i, "xv:" + i, 0); });
    return h;
  };

  /* ---------- PDF / الطباعة ---------- */
  tdTblPDF = async function (Dc, L, lm, rm, k2, pf, mm) {
    const td = L.td; if (!td) return;
    const tw = rm - lm, Wc = colW(td).map(f => f / 100 * tw), hh = k2 * 6.6 * mm, rh = k2 * 7.6 * mm, gap = 1.2 * mm, xc = XC(td), xf = XF(td);
    const cell = (c, x0, y, w, h, t, o = {}) => { if (o.bg) { c.fillStyle = o.bg; c.fillRect(x0, y, w, h); } c.strokeStyle = "#000"; c.lineWidth = 1.1; c.strokeRect(x0, y, w, h); c.fillStyle = "#000"; c.font = pf(k2 * (o.sz || 12.5), o.b === 0 ? 0 : 1); c.textAlign = "center"; c.fillText(String(t == null ? "" : t), x0 + w / 2, y + h / 2 + .3 * mm, w - 2.5 * mm); };
    const dbl = (c, y, h) => { c.strokeStyle = "#000"; c.lineWidth = 1.6; c.strokeRect(lm - .9 * mm, y - .9 * mm, tw + 1.8 * mm, h + 1.8 * mm); c.lineWidth = 1; c.strokeRect(lm - .3 * mm, y - .3 * mm, tw + .6 * mm, h + .6 * mm); };
    const nf = (showAvg(td) ? 1 : 0) + (showEn(td) ? 1 : 0) + xf.length, step = gap + .9 * mm;
    const need = 2 * hh + td.rows.length * rh + (showSum(td) ? 2 * hh + step : 0) + nf * (rh + step) + 4 * mm;
    Dc.gap(k2 * 3); Dc.ensure(need); const c = Dc.x; let y = Dc.y + 1 * mm;
    let xr = rm; cell(c, xr - Wc[0], y, Wc[0], 2 * hh, "ت", { bg: TDG }); xr -= Wc[0]; cell(c, xr - Wc[1], y, Wc[1], 2 * hh, "المـواد الدراسيـة", { bg: TDG }); xr -= Wc[1];
    cell(c, xr - Wc[2] - Wc[3], y, Wc[2] + Wc[3], hh, "الدرجـــــة", { bg: TDG }); cell(c, xr - Wc[2], y + hh, Wc[2], hh, "رقماً", { bg: TDG, sz: 11.5 }); cell(c, xr - Wc[2] - Wc[3], y + hh, Wc[3], hh, "كتابـــــة", { bg: TDG, sz: 11.5 });
    let xe = xr - Wc[2] - Wc[3]; xc.forEach((t, j) => { cell(c, xe - Wc[4 + j], y, Wc[4 + j], 2 * hh, A(t), { bg: TDG }); xe -= Wc[4 + j]; });
    let yy = y + 2 * hh;
    td.rows.forEach((r, i) => { let x1 = rm; [A(i + 1), r.sj, tdNumT(r.v), tdRowW(r)].concat(xc.map((t, j) => A((r.x || [])[j] || ""))).forEach((t, j) => { cell(c, x1 - Wc[j], yy, Wc[j], rh, t); x1 -= Wc[j]; }); yy += rh; });
    dbl(c, y, yy - y);
    if (showSum(td)) {
      yy += step; const y2 = yy, P = [.24, .10, .66].map(f => f * tw); let x1 = rm;
      cell(c, x1 - P[0], yy, P[0], 2 * hh, "المجموع", { bg: TDG, sz: 16 }); x1 -= P[0]; cell(c, x1 - P[1], yy, P[1], hh, "رقماً", { bg: TDG, sz: 11 }); cell(c, x1 - P[1] - P[2], yy, P[2], hh, "كتابـــــة", { bg: TDG, sz: 11 });
      const s2 = tdSum(td); cell(c, x1 - P[1], yy + hh, P[1], hh, s2 === "" ? "" : A(s2)); cell(c, x1 - P[1] - P[2], yy + hh, P[2], hh, tdSumW(td), { b: 0 }); yy += 2 * hh; dbl(c, y2, yy - y2);
    }
    const one = (lab, val) => { yy += step; const y3 = yy, F = [.31, .69].map(f => f * tw); cell(c, rm - F[0], yy, F[0], rh, lab, { bg: TDG }); cell(c, rm - F[0] - F[1], yy, F[1], rh, val); yy += rh; dbl(c, y3, yy - y3); };
    if (showAvg(td)) one(LBL_AVG, avgT(td));
    if (showEn(td)) one("الرقـــم الامتحاني", A(td.en || ""));
    xf.forEach(f => one(A(f.l || ""), A(f.v || "")));
    Dc.y = yy; Dc.adv(k2 * 3 * mm);
  };

  /* ---------- Word ---------- */
  on(() => {
    const _bd = buildLetterDocx;
    buildLetterDocx = async function (L) {
      if (!L || !L.td) return _bd.apply(this, arguments);
      const td = L.td, xc = XC(td), n = 4 + xc.length, cl = s => String(s == null ? "" : s).replace(/\|/g, "/"), pad = a => { a = a.map(cl); while (a.length < n) a.push(""); return a.join("|"); };
      const R3 = [pad(["ت", "المواد الدراسية", "الدرجة رقماً", "الدرجة كتابةً"].concat(xc))];
      td.rows.forEach((r, i) => R3.push(pad([i + 1, r.sj, tdNumT(r.v), tdRowW(r)].concat(xc.map((t, j) => (r.x || [])[j] || "")))));
      if (showSum(td)) R3.push(pad(["", "المجموع", tdSum(td), tdSumW(td)]));
      if (showAvg(td)) R3.push(pad(["", "المعدل", "", td.avg || ""]));
      if (showEn(td)) R3.push(pad(["", "الرقم الامتحاني", "", td.en || ""]));
      XF(td).forEach(f => R3.push(pad(["", f.l || "", "", f.v || ""])));
      return _bd.call(this, { ...tdPrep(L), td: null, tbl: R3.join("\n") });
    };
  });

  /* ---------- الكتابة داخل الخانات الجديدة ---------- */
  const txt = el => String(el.innerText || "").replace(/‏/g, "").replace(/\n+/g, " ").trim();
  on(() => {
    const _in = tdIn;
    tdIn = function (el) {
      const L = LDRAFT;
      if (L && L.td && el && el.dataset) {
        const td = L.td, k = el.dataset.k || "", p = k.split(":"), t = txt(el);
        if (k == "avg") { td.avg = DG(t).replace(/[٫,،]/g, ".").replace(/[^\d.]/g, ""); td.avgSrc = "m"; return; }
        if (p[0] == "xl" || p[0] == "xv") { const f = XF(td)[+p[1]]; if (f) f[p[0] == "xl" ? "l" : "v"] = t; return; }
        if (p[0] == "xh") { if (XC(td)[+p[1]] != null) td.xc[+p[1]] = t; return; }
        if (p[0] == "x") { const r = td.rows[+p[1]]; if (r) { if (!Array.isArray(r.x)) r.x = []; while (r.x.length <= +p[2]) r.x.push(""); r.x[+p[2]] = t; } return; }
      }
      return _in.apply(this, arguments);
    };
  });
  D.addEventListener("focusout", e => { const el = e.target && e.target.closest ? e.target.closest('#lprev [data-k="avg"]') : null; if (el && LDRAFT && LDRAFT.td) el.textContent = avgT(LDRAFT.td); }, true);

  /* ---------- المعاينة تبقى داخل الورقة: إذا زاد المحتوى (حقل المعدل، صفوف أو حقول إضافية) يُصغَّر قليلاً مثل ملف الـPDF ---------- */
  let ft = 0;
  function fit() {
    const pg = D.querySelector("#lprev .lpage"); if (!pg || !LDRAFT || !LDRAFT.td) return;
    const inner = [...pg.children].find(x => x.tagName == "DIV" && /position:\s*relative/.test(x.getAttribute("style") || "")); if (!inner) return;
    const bk = LDRAFT.lh == "bk";
    for (const k of [1, .96, .92, .88, .84, .8, .76, .72, .68]) {
      inner.style.zoom = k == 1 ? "" : String(k);
      const q = pg.getBoundingClientRect(), lim = q.top + q.height * (1 - (bk ? 29.5 : 23) / 297);
      if (inner.getBoundingClientRect().bottom <= lim + 1) break;
    }
  }
  const fitSoon = ms => { clearTimeout(ft); ft = setTimeout(() => on(fit), ms || 0); };
  D.addEventListener("input", e => { if (LDRAFT && LDRAFT.td && e.target && e.target.closest && e.target.closest("#lprev")) fitSoon(250); }, true);
  on(() => { const lp = () => D.getElementById("lprev"); new MutationObserver(M => { const l = lp(); if (!l || !LDRAFT || !LDRAFT.td) return; for (const m of M) { if (m.type == "childList" && (m.target === l || [...m.addedNodes].some(n => n.nodeType == 1 && (n.id == "lprev" || (n.querySelector && n.querySelector("#lprev")))))) { fitSoon(0); return; } } }).observe(D.body, { childList: true, subtree: true }); });

  /* ================= أدوات الجداول ================= */
  let SEL = null;           /* {L, kind:"t"|"td"|"f", i, j, f} */
  const coarse = () => { try { return matchMedia("(pointer:coarse)").matches; } catch (e) { return false; } };
  const keyOf = s => !s ? "" : s.kind == "t" ? "t:" + s.i + ":" + s.j : s.kind == "td" ? (s.i < 0 ? "xh:" + (s.j - 4) : s.j >= 4 ? "x:" + s.i + ":" + (s.j - 4) : (s.j == 2 ? "v:" : s.j == 3 ? "w:" : "sj:") + s.i) : s.f == "sum" ? "sum" : s.f == "avg" ? "avg" : s.f == "en" ? "en" : "xv:" + s.f;
  function selOf(el) {
    const L = LDRAFT; if (!L || !el || !el.dataset) return null;
    const k = el.dataset.k || "", p = k.split(":");
    if (!L.td) { if (p[0] == "t" && p.length == 3) return { L, kind: "t", i: +p[1], j: +p[2] }; return null; }
    if (p[0] == "sj") return { L, kind: "td", i: +p[1], j: 1 };
    if (p[0] == "v") return { L, kind: "td", i: +p[1], j: 2 };
    if (p[0] == "w") return { L, kind: "td", i: +p[1], j: 3 };
    if (p[0] == "x") return { L, kind: "td", i: +p[1], j: 4 + +p[2] };
    if (p[0] == "xh") return { L, kind: "td", i: -1, j: 4 + +p[1] };
    if (k == "sum" || k == "sumw") return { L, kind: "f", f: "sum" };
    if (k == "avg" || k == "en") return { L, kind: "f", f: k };
    if (p[0] == "xl" || p[0] == "xv") return { L, kind: "f", f: +p[1] };
    return null;
  }
  const bar = () => {
    let b = D.getElementById("tb232");
    if (!b) { b = D.createElement("div"); b.id = "tb232"; b.hidden = true; b.setAttribute("role", "toolbar"); b.setAttribute("aria-label", "أدوات الجدول"); b.setAttribute("data-noar", "1"); b.addEventListener("mousedown", e => { if (!(e.target && e.target.closest && e.target.closest("input,select"))) e.preventDefault(); }); D.body.appendChild(b); }
    return b;
  };
  const mark = () => { D.querySelectorAll("#lprev .s232").forEach(x => x.classList.remove("s232")); if (!SEL) return null; const el = D.querySelector('#lprev [data-k="' + keyOf(SEL) + '"]'); if (el) el.classList.add("s232"); return el; };
  function hide() { SEL = null; const b = D.getElementById("tb232"); if (b) b.hidden = true; mark(); }
  const btn = (op, t, cls, ti) => `<button type="button" class="btn ghost sm ${cls || ""}" onclick="tb232('${op}')"${ti ? ` title="${ti}" aria-label="${ti}"` : ""}>${t}</button>`;
  function show() {
    const s = SEL; if (!s || s.L !== LDRAFT || !D.getElementById("lprev")) return hide();
    const b = bar(); let h = "";
    const rowG = `<span class="g"><b>الصف</b>${btn("ra", "＋ أعلى", "", "إضافة صف أعلى الصف المحدد")}${btn("rb", "＋ أسفل", "", "إضافة صف أسفل الصف المحدد")}${btn("ru", "▲", "", "تحريك الصف إلى الأعلى")}${btn("rd", "▼", "", "تحريك الصف إلى الأسفل")}${btn("rx", "حذف", "x", "حذف الصف المحدد")}</span>`;
    if (s.kind == "t") {
      h = `<span class="t">الصف ${A(s.i + 1)} · العمود ${A(s.j + 1)}</span>${rowG}<span class="g"><b>العمود</b>${btn("cr", "＋ يمين", "", "إضافة عمود يمين العمود المحدد")}${btn("cl", "＋ يسار", "", "إضافة عمود يسار العمود المحدد")}${btn("cx", "حذف", "x", "حذف العمود المحدد")}</span>`;
    } else if (s.kind == "td") {
      const ex = s.j >= 4;
      h = `<span class="t">${s.i < 0 ? "عنوان عمود إضافي" : "المادة " + A(s.i + 1)}</span>${s.i < 0 ? "" : rowG}<span class="g"><b>العمود</b>${btn("tc", "＋ عمود", "", "إضافة عمود جديد إلى الجدول")}${ex ? btn("tcx", "حذف", "x", "حذف العمود المحدد") : ""}</span><span class="g"><b>الحقول</b>${btn("fa", "＋ حقل", "", "إضافة حقل جديد أسفل الجدول")}</span>`;
    } else {
      const nh = Object.keys(hid(s.L.td)).filter(k => hid(s.L.td)[k]).length;
      h = `<span class="t">${s.f == "sum" ? "حقل المجموع" : s.f == "avg" ? "حقل المعدل" : s.f == "en" ? "حقل الرقم الامتحاني" : "حقل إضافي"}</span><span class="g"><b>الحقول</b>${btn("fa", "＋ حقل", "", "إضافة حقل جديد")}${typeof s.f == "number" ? btn("fu", "▲", "", "تحريك الحقل إلى الأعلى") + btn("fd", "▼", "", "تحريك الحقل إلى الأسفل") : ""}${btn("fx", "حذف", "x", "حذف الحقل المحدد")}${nh ? btn("fr", "إرجاع المحذوف", "", "إرجاع الحقول الأصلية المحذوفة") : ""}</span>`;
    }
    b.innerHTML = h + `<button type="button" class="c" onclick="tb232('close')" aria-label="إغلاق أدوات الجدول" title="إغلاق">✕</button>`;
    b.hidden = false; mark();
  }
  /* بعد إعادة الرسم: نرجع للخانة نفسها حتى تتكرر العملية بسهولة */
  function back() {
    setTimeout(() => {
      if (!SEL || SEL.L !== LDRAFT) return hide();
      const el = mark(); if (!el) return hide();
      if (!coarse()) on(() => { el.focus({ preventScroll: true }); const r = D.createRange(); r.selectNodeContents(el); r.collapse(false); const g = getSelection(); g.removeAllRanges(); g.addRange(r); });
      on(() => { const q = el.getBoundingClientRect(); if (q.top < 70 || q.bottom > innerHeight - 90) el.scrollIntoView({ block: "center" }); });
      show();
    }, 30);
  }
  D.addEventListener("focusin", e => {
    const el = e.target && e.target.closest ? e.target.closest("#lprev [data-k]") : null; if (!el) return;
    const s = selOf(el); if (s) { SEL = s; show(); } else hide();
  }, true);
  D.addEventListener("pointerdown", e => {
    if (!SEL) return; const t = e.target;
    if (t && t.closest && (t.closest("#tb232") || t.closest("#lprev [data-k]"))) return;
    hide();
  }, true);

  /* ترقيم عمود «ت»: الصفوف المرقّمة 1..n تبقى متسلسلة بعد الإضافة/الحذف/التحريك */
  const isN = v => /^\d+$/.test(DG(v).trim());
  function serial(R, h0) {
    const F = R.map((r, i) => i >= h0 && isN(r[0])); let k = 0;
    for (let i = h0; i < R.length; i++) if (F[i]) { k++; if (+DG(R[i][0]) != k) return null; }
    return k ? F : null;
  }
  function tOp(op) {
    const s = SEL, L = s.L; let R = tRows(L.tbl); if (!R.length) return hide();
    const n = Math.max(1, ...R.map(r => r.length)); R.forEach(r => { while (r.length < n) r.push(""); });
    const h0 = L.thead !== 0 && L.thead !== "0" ? 1 : 0;
    let i = Math.min(Math.max(0, s.i), R.length - 1), j = Math.min(Math.max(0, s.j), n - 1);
    const F = serial(R, h0), blank = () => Array(n).fill(n == 1 ? ".........." : "");
    const numbered = at => !!F && ((at > 0 && F[at - 1]) || (at < F.length && F[at]) || (at == h0 && F.some(Boolean)));
    if (op == "ra" || op == "rb") {
      let at = op == "ra" ? i : i + 1; if (at < h0) at = h0;
      const nb = numbered(at); R.splice(at, 0, blank()); if (F) F.splice(at, 0, nb); i = at;
    } else if (op == "rx") {
      if (R.length <= 1) return T("لا يمكن حذف الصف الوحيد — استعمل «حذف الجدول» من الأعلى", "err");
      if (h0 && i == 0) return T("صف العناوين لا يُحذف — عدّل نصّه مباشرة أو احذف الجدول", "err");
      R.splice(i, 1); if (F) F.splice(i, 1); i = Math.min(i, R.length - 1);
    } else if (op == "ru" || op == "rd") {
      const k = op == "ru" ? i - 1 : i + 1; if (i < h0 || k < h0 || k >= R.length) return;
      const a = R[i]; R[i] = R[k]; R[k] = a; if (F) { const f = F[i]; F[i] = F[k]; F[k] = f; } i = k;
    } else if (op == "cr" || op == "cl") {
      if (n >= 12) return T("بلغ الجدول الحدّ الأعلى لعدد الأعمدة", "err");
      const at = op == "cr" ? j : j + 1; R.forEach(r => r.splice(at, 0, "")); j = at;
      if (F && at == 0) { /* عمود جديد قبل عمود التسلسل: التسلسل ينتقل معه كما هو */ }
    } else if (op == "cx") {
      if (n <= 1) return T("لا يمكن حذف العمود الوحيد — استعمل «حذف الجدول» من الأعلى", "err");
      R.forEach(r => r.splice(j, 1)); j = Math.min(j, n - 2);
      if (F && s.j == 0) F.fill(false);
    } else return;
    if (F && op[0] == "r") { let k = 0; R.forEach((r, x) => { if (F[x]) r[0] = String(++k); }); }
    if (R[0].length == 1) R.forEach(r => { if (!String(r[0]).trim()) r[0] = ".........."; });
    L.tbl = R.map(r => r.map(c => String(c).replace(/\|/g, "/")).join("|")).join("\n");
    SEL = { L, kind: "t", i, j }; on(() => render()); back();
  }
  function tdOp(op) {
    const s = SEL, L = s.L, td = L.td; let i = s.i, j = s.j;
    if (op == "ra" || op == "rb") {
      if (td.rows.length >= 20) return T("بلغ الجدول الحدّ الأعلى لعدد المواد", "err");
      const at = Math.min(td.rows.length, Math.max(0, op == "ra" ? i : i + 1)); td.rows.splice(at, 0, { k: "", sj: "", v: "" }); i = at; j = 1;
    } else if (op == "rx") {
      if (td.rows.length <= 1) return T("لا يمكن حذف المادة الوحيدة في الجدول", "err");
      const r = td.rows[i]; if (!r) return hide(); td.rows.splice(i, 1); if (gxNum(r.v) !== "") { td.sum = null; td.sumw = null; } i = Math.min(i, td.rows.length - 1);
    } else if (op == "ru" || op == "rd") {
      const k = op == "ru" ? i - 1 : i + 1; if (k < 0 || k >= td.rows.length) return; const a = td.rows[i]; td.rows[i] = td.rows[k]; td.rows[k] = a; i = k;
    } else if (op == "tc") {
      if (XC(td).length >= 3) return T("يمكن إضافة ثلاثة أعمدة على الأكثر في هذا النموذج", "err");
      td.xc = XC(td).concat([".........."]); i = -1; j = 4 + td.xc.length - 1;
    } else if (op == "tcx") {
      const c = j - 4; if (c < 0 || c >= XC(td).length) return;
      td.xc.splice(c, 1); td.rows.forEach(r => { if (Array.isArray(r.x)) r.x.splice(c, 1); });
      if (!td.xc.length) { delete td.xc; td.rows.forEach(r => { delete r.x; }); }
      if (i < 0) { i = 0; j = 1; } else j = XC(td).length ? Math.min(j, 3 + XC(td).length) : 1;
    } else return;
    SEL = { L, kind: "td", i, j }; on(() => render()); back();
  }
  function fOp(op) {
    const s = SEL, L = (s && s.L) || LDRAFT; if (!L || !L.td) return; const td = L.td; let f = s ? s.f : null;
    if (op == "fa") {
      if (XF(td).length >= 6) return T("يمكن إضافة ستة حقول على الأكثر في هذا النموذج", "err");
      td.xf = XF(td).concat([{ l: "..........", v: "" }]); SEL = { L, kind: "f", f: td.xf.length - 1 };
    } else if (op == "fx") {
      if (typeof f == "number") { td.xf.splice(f, 1); if (!td.xf.length) delete td.xf; SEL = td.xf ? { L, kind: "f", f: Math.min(f, td.xf.length - 1) } : null; }
      else if (f) { td.hid = Object.assign({}, td.hid, { [f]: 1 }); SEL = null; T("حُذف الحقل — يمكن إرجاعه من زر «إرجاع الحقول المحذوفة» أعلى الورقة"); }
    } else if (op == "fu" || op == "fd") {
      if (typeof f != "number") return; const k = op == "fu" ? f - 1 : f + 1; if (k < 0 || k >= XF(td).length) return;
      const a = td.xf[f]; td.xf[f] = td.xf[k]; td.xf[k] = a; SEL = { L, kind: "f", f: k };
    } else if (op == "fr") { delete td.hid; }
    else return;
    on(() => render()); if (SEL) back(); else hide();
  }
  W.tb232 = function (op) {
    on(() => {
      if (op == "close") return hide();
      if (op == "fa" || op == "fr") { if (!LDRAFT || !LDRAFT.td) return; if (SEL && SEL.L !== LDRAFT) SEL = null; return fOp(op); }
      const s = SEL; if (!s || s.L !== LDRAFT) return hide();
      if (s.kind == "t") return tOp(op);
      if (s.kind == "td") return tdOp(op);
      return fOp(op);
    });
  };

  /* ---------- شريط الأدوات أعلى الورقة: تلميح + أزرار الحقول ---------- */
  const HINT = `<span class="sub h232">اضغط على أي خانة في الجدول لإضافة أو حذف صف أو عمود في موضعها.</span>`;
  on(() => {
    const _tv = tdView;
    tdView = function () {
      on(() => autoAvg(LDRAFT));
      let h = _tv.apply(this, arguments);
      on(() => {
        const td = LDRAFT.td, nh = Object.keys(hid(td)).filter(k => hid(td)[k]).length, mk = "حذف آخر سطر</button>";
        const add = `<button class="btn ghost sm" onclick="tb232('fa')">${typeof ic == "function" ? ic("plus") : "＋"} حقل</button>${nh ? `<button class="btn ghost sm" onclick="tb232('fr')">إرجاع الحقول المحذوفة (${A(nh)})</button>` : ""}`;
        if (h.includes(mk)) h = h.replace(mk, mk + add);
        const end = '<div class="letter-wrap tdwrap">';
        if (h.includes(end)) h = h.replace(end, end.replace("<div", `<p class="muted h232" style="margin:0 0 6px">اضغط على أي خانة في الجدول أو الحقول لإضافة أو حذف صف أو عمود أو حقل في موضعه.</p><div`));
      });
      return h;
    };
  });
  on(() => {
    if (typeof eView != "function") return; const _ev = eView;
    eView = function () {
      let h = _ev.apply(this, arguments);
      on(() => { const mk = `onclick="eDrop('tbl')">حذف الجدول</button>`; if (h.includes(mk)) h = h.replace(mk, mk + HINT); });
      return h;
    };
  });

  on(() => {
    const st = D.createElement("style"); st.id = "css232";
    st.textContent = `#tb232{position:fixed;z-index:1200;left:8px;right:8px;margin-inline:auto;width:fit-content;bottom:calc(12px + env(safe-area-inset-bottom,0px));max-width:calc(100vw - 16px);box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 10px;padding:8px 12px;background:#fff;border:1px solid #cfd9d4;border-radius:14px;box-shadow:0 8px 28px rgba(15,45,38,.22);direction:rtl;font-family:inherit}
#tb232[hidden]{display:none}
#tb232 .t{font-weight:700;color:#14493f;font-size:13px;white-space:nowrap}
#tb232 .g{display:inline-flex;align-items:center;gap:4px;padding-inline-start:10px;border-inline-start:1px solid #e1e8e4}
#tb232 .g>b{font-size:12px;color:#5b6b64;font-weight:700;margin-inline-end:2px}
#tb232 .btn{margin:0;padding:5px 9px;min-height:32px;font-size:13px;white-space:nowrap}
#tb232 .btn.x{color:#b00020}
#tb232 .c{border:0;background:none;color:#5b6b64;font-size:15px;cursor:pointer;padding:4px 8px;border-radius:8px;min-height:32px}
#tb232 .c:hover{background:#f0f3f1}
#lprev [data-k].s232{outline:2px solid #b8860b!important;background:#fff8dc}
.h232{font-size:12.5px}
@media (max-width:560px){#tb232{gap:6px}#tb232 .g{padding-inline-start:0;border:0}#tb232 .t{width:100%;text-align:center}}
@media print{#tb232{display:none!important}}`;
    D.head.appendChild(st);
  });
})();
