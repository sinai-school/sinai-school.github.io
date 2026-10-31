/* ===== v207 — خارطة جلوس الطلبة (نصف السنة / نهاية السنة) + سجل حضور الملاك (أسبوعي بالعرض) + سجل حضور الإدارة ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v207s", e); } };
  const E = s => typeof esc == "function" ? esc(s) : String(s == null ? "" : s);
  const AD = x => String(x).replace(/[0-9]/g, k => "٠١٢٣٤٥٦٧٨٩"[k]);
  const I = n => typeof ic == "function" ? ic(n) : "";
  const LG = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } };
  const LS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const rr = () => { try { render(); } catch (e) { } };
  const yrTxt = () => { try { return AD(String(YR).replace(/[‎‏]/g, "").replace(/\s*-\s*/, "-")); } catch (e) { return ""; } };

  /* ---------- مولّد أرقام ثابت (نفس التوزيع بكل جهاز ولكل طباعة، إلا إذا اخترت «توزيع جديد») ---------- */
  const rng = seed => { let a = seed >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const shuf = (L, R) => { const a = [...L]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* =====================================================================
     خارطة جلوس الطلبة
     - نصف السنة: الرابع والخامس والسادس (العلمي والأدبي)
     - نهاية السنة: الرابع والخامس بس (السادس وزاري)
     - كل قاعة تاخذ أعداد متساوية من كل صف وفرع
     - ما يكعد طالب جنب أو ورا طالب من نفس الصف (فبالتالي ولا من نفس الشعبة)
     ===================================================================== */
  const ST7 = { t: "m", halls: 16, cap: 28, cols: 4, seed: 1, hall: 0 };
  Object.assign(ST7, LG("seat207", {}));
  const save7 = () => LS("seat207", { t: ST7.t, halls: ST7.halls, cap: ST7.cap, cols: ST7.cols, seed: ST7.seed });
  const gradeOf = s => String(s.s || "").split(" ")[0];
  const grpOf = s => String(s.s || "").split(" ").slice(0, -1).join(" ") || s.s;
  const short = s => { const p = String(s.s || "").split(" "); return (p[0] || "").replace("الرابع", "الرابع").replace("الخامس", "الخامس") + " " + (p[1] || "").replace("العلمي", "ع").replace("الأدبي", "أ").replace("الادبي", "أ") + " " + (p[2] || ""); };
  function students7() {
    let L = (typeof STA == "function" ? STA() : []).filter(s => s.s && !/تجريبي/.test(s.s));
    if (ST7.t == "f") L = L.filter(s => gradeOf(s) != "السادس");
    return L;
  }
  function plan7() {
    const L = students7(), H = Math.max(1, +ST7.halls || 16), cap = Math.max(10, +ST7.cap || 28), cols = Math.max(2, +ST7.cols || 4);
    const rows = Math.ceil(cap / cols), seats = rows * cols;
    const R = rng(ST7.seed * 7919 + (ST7.t == "f" ? 3 : 1));
    /* التوزيع على القاعات: كل صف وفرع بالتساوي */
    const groups = {}; L.forEach(s => { (groups[grpOf(s)] = groups[grpOf(s)] || []).push(s); });
    const order = ["الرابع العلمي", "الرابع الأدبي", "الخامس العلمي", "الخامس الأدبي", "السادس العلمي", "السادس الأدبي"];
    const gk = Object.keys(groups).sort((a, b) => ((order.indexOf(a) + 1) || 99) - ((order.indexOf(b) + 1) || 99));
    const halls = Array.from({ length: H }, () => []);
    gk.forEach(g => {
      const S = shuf(groups[g].slice().sort((a, b) => String(a.s).localeCompare(String(b.s), "ar") || String(a.n).localeCompare(String(b.n), "ar")), R);
      S.forEach(s => {
        let best = 0, bv = Infinity;
        halls.forEach((h, i) => { const v = h.filter(x => grpOf(x) == g).length * 1000 + h.length; if (v < bv) { bv = v; best = i; } });
        halls[best].push(s);
      });
    });
    const over = halls.filter(h => h.length > seats).length;
    /* الجلوس داخل القاعة: شبكة (صفوف × أعمدة)، الجار (يمين/يسار) واللي وراه/كدامه من صف دراسي مختلف */
    const placed = halls.map((h, hi) => seat7(h, rows, cols, rng(ST7.seed * 104729 + hi * 31 + 7)));
    return { L, H, cap, cols, rows, seats, halls, placed, over, gk };
  }
  function seat7(list, rows, cols, R) {
    const n = rows * cols, by = {};
    list.forEach(s => { (by[gradeOf(s)] = by[gradeOf(s)] || []).push(s); });
    const G = Object.keys(by), cnt = {}; G.forEach(g => { cnt[g] = by[g].length; by[g] = shuf(by[g], R); });
    let empty = n - list.length; if (empty < 0) return null;
    const grid = new Array(n).fill(null);
    let steps = 0;
    const okAt = (i, g) => { const r = Math.floor(i / cols), c = i % cols; if (c > 0 && grid[i - 1] === g) return false; if (r > 0 && grid[i - cols] === g) return false; return true; };
    const dfs = i => {
      if (++steps > 200000) return false;
      if (i == n) return true;
      const left = n - i, need = G.reduce((a, g) => a + cnt[g], 0);
      if (need > left) return false;
      const opts = shuf(G.filter(g => cnt[g] > 0), R).sort((a, b) => cnt[b] - cnt[a]);
      for (const g of opts) { if (!okAt(i, g)) continue; grid[i] = g; cnt[g]--; if (dfs(i + 1)) return true; cnt[g]++; grid[i] = null; }
      if (empty > 0) { empty--; grid[i] = ""; if (dfs(i + 1)) return true; empty++; grid[i] = null; }
      return false;
    };
    if (!dfs(0)) return null;
    /* نفس الصف الدراسي ما يتجاور، ونوزّع الشعب حتى حتى بالقطري ما يتكرر قدر الإمكان */
    const out = grid.map(g => g ? by[g].pop() : null);
    return out;
  }
  W.seat207Plan = plan7;
  W.seat207Set = (k, v) => { if (k == "t") ST7.t = v; else if (k == "new") ST7.seed = (ST7.seed || 1) + 1; else if (k == "hall") ST7.hall = +v; else ST7[k] = Math.max(1, parseInt(String(v).replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632)) || ST7[k]); save7(); rr(); };
  const exName = () => ST7.t == "f" ? "امتحانات نهاية السنة" : "امتحانات نصف السنة";
  function hallModel(P, hi) {
    const grid = P.placed[hi]; const cols = P.cols, rows = P.rows;
    let base = 0; for (let k = 0; k < hi; k++) base += P.halls[k].length;
    const head = [[{ v: "السبورة (مقدمة القاعة)", h: 1, cs: cols }]];
    const R = []; let no = 0;
    const seatNo = {}; if (grid) grid.forEach((s, i) => { if (s) seatNo[i] = ++no; });
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c, s = grid ? grid[i] : null;
        row.push(s ? { v: AD(base + seatNo[i]) + "\n" + s.n + "\n" + s.s } : { v: "—", bg: "#f3f3f3" });
      }
      R.push(row);
    }
    const cnt = {}; P.halls[hi].forEach(s => { const g = grpOf(s); cnt[g] = (cnt[g] || 0) + 1; });
    return {
      title: "خارطة جلوس الطلبة — " + exName() + " " + yrTxt(), sub: "القاعة (" + AD(hi + 1) + ") — عدد الطلبة " + AD(P.halls[hi].length) + " — " + P.gk.filter(g => cnt[g]).map(g => g + " " + AD(cnt[g])).join("، "),
      sheet: ("قاعة " + (hi + 1)).slice(0, 31), orient: "portrait", paper: "A4", fs: 10, hr: 1, drh: 44,
      rows: [...head, ...R], ww: new Array(cols).fill(1), xw: new Array(cols).fill(30),
      foot: ["مسؤول القاعة: ....................", "المدير\nفراس حسن كاظم"]
    };
  }
  function sumModel(P) {
    const head = [{ v: "القاعة", h: 1 }, ...P.gk.map(g => ({ v: g, h: 1 })), { v: "المجموع", h: 1 }, { v: "أرقام الجلوس", h: 1 }];
    let base = 0;
    const rows = P.halls.map((h, i) => { const r = [AD(i + 1), ...P.gk.map(g => AD(h.filter(s => grpOf(s) == g).length)), { v: AD(h.length), b: 1 }, h.length ? AD(base + 1) + " – " + AD(base + h.length) : "—"]; base += h.length; return r; });
    const tot = ["المجموع", ...P.gk.map(g => AD(P.L.filter(s => grpOf(s) == g).length)), { v: AD(P.L.length), b: 1 }, ""];
    return { title: "توزيع الطلبة على القاعات — " + exName() + " " + yrTxt(), sheet: "التوزيع", orient: "portrait", paper: "A4", fs: 11, hr: 1, rows: [head, ...rows, tot.map(v => typeof v == "object" ? { ...v, h: 1 } : { v, h: 1 })], ww: [1.2, ...P.gk.map(() => 1.6), 1.2, 1.8], xw: [10, ...P.gk.map(() => 16), 10, 16], foot: ["", "المدير\nفراس حسن كاظم"] };
  }
  function listModel(P, hi) {
    let base = 0; for (let k = 0; k < hi; k++) base += P.halls[k].length;
    const grid = P.placed[hi] || []; const L = []; let no = 0;
    grid.forEach(s => { if (s) L.push([AD(base + (++no)), { v: s.n, l: 1 }, s.s, ""]); });
    return { title: "قائمة طلبة القاعة (" + AD(hi + 1) + ") — " + exName() + " " + yrTxt(), sheet: ("قائمة " + (hi + 1)).slice(0, 31), orient: "portrait", paper: "A4", fs: 11, hr: 1, rows: [[{ v: "رقم الجلوس", h: 1 }, { v: "اسم الطالب", h: 1 }, { v: "الصف والشعبة", h: 1 }, { v: "التوقيع", h: 1 }], ...L], ww: [1.3, 5, 2.4, 2], xw: [10, 40, 20, 16] };
  }
  function seatView() {
    const P = plan7();
    const ok = P.placed.every((g, i) => g || !P.halls[i].length);
    const hi = Math.min(ST7.hall || 0, P.H - 1);
    CURX = P.L.length && ok ? { name: "خارطة جلوس الطلبة — " + exName(), sheets: () => [sumModel(P), ...P.halls.flatMap((h, i) => h.length ? [hallModel(P, i), listModel(P, i)] : [])] } : null;
    const inp = (k, l, w) => `<label class="sub">${l} <input value="${AD(ST7[k])}" inputmode="numeric" style="width:${w || 60}px" onchange="seat207Set('${k}',this.value)"></label>`;
    const prev = P.placed[hi] ? (typeof modelHTML == "function" ? modelHTML(hallModel(P, hi)) : "") : "";
    return `<div class="vh"><h2>خارطة جلوس الطلبة</h2><span class="sub">توزيع آلي على القاعات — أعداد متساوية من كل صف، وما يكعد طالب جنب أو ورا طالب من نفس صفه أو شعبته</span></div>
<div class="tools">${segB(ST7.t, [["m", "امتحانات نصف السنة"], ["f", "امتحانات نهاية السنة (بدون السادس)"]], "seat207Set.bind(0,'t')")}</div>
<div class="tools">${inp("halls", "عدد القاعات")}${inp("cap", "سعة القاعة")}${inp("cols", "أعمدة المقاعد", 50)}<button class="btn ghost sm" onclick="seat207Set('new')">${I("refresh")} توزيع جديد</button></div>
${P.over ? `<div class="banner err">${I("alert")} عدد الطلبة (${AD(P.L.length)}) أكثر من سعة ${AD(P.H)} قاعة × ${AD(P.seats)} مقعد. زيد عدد القاعات أو السعة.</div>` : ""}
${!ok && !P.over ? `<div class="banner err">${I("alert")} ما ينجح ترتيب بدون تجاور نفس الصف بهذي السعة — زيد أعمدة المقاعد أو السعة.</div>` : ""}
<div class="box"><h3>التوزيع على القاعات (${AD(P.L.length)} طالب)</h3><div class="tw">${typeof modelHTML == "function" ? modelHTML(sumModel(P)) : ""}</div></div>
<div class="box"><h3>القاعة</h3><div class="tools" style="flex-wrap:wrap">${P.halls.map((h, i) => `<button class="btn ${i == hi ? "" : "ghost"} sm" onclick="seat207Set('hall',${i})">${AD(i + 1)}</button>`).join("")}</div><div class="tw seat207">${prev}</div></div>
${expBar()}`;
  }

  /* =====================================================================
     سجل حضور الملاك (أسبوعي — الأحد للخميس بالعرض) وسجل حضور الإدارة (العطلة الصيفية: الأحد والثلاثاء)
     ===================================================================== */
  const AT7 = { k: "s", days: "5", start: "", paper: "A4" };
  Object.assign(AT7, LG("att207", {}));
  const save8 = () => LS("att207", AT7);
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const sunday = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + (d.getDay() >= 5 ? 7 : 0)); return iso(d); };
  const DN = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
  const staffIn = () => (typeof sortStf == "function" ? sortStf() : []).filter(f => (f.status || "مستمر") == "مستمر");
  const isAdm = f => /^مدير$|معاون|خدمة/.test(String(f.job || "")) || /عيسى محمد فاضل|بهاء مهدي سعيد/.test(String(f.name || ""));
  const admList = () => {
    const L = staffIn().filter(isAdm);
    const rank = f => /^مدير$/.test(f.job) ? 0 : /معاون/.test(f.job) ? 1 : /بهاء/.test(f.name) ? 2 : /عيسى/.test(f.name) ? 3 : 4;
    return L.sort((a, b) => rank(a) - rank(b) || ((+a.ord || 999) - (+b.ord || 999)));
  };
  const jobOf = f => /^مدير$/.test(f.job) ? "المدير" : /معاون/.test(f.job) ? "معاون المدير" : /بهاء/.test(f.name) ? "الكاتب" : /عيسى/.test(f.name) ? "مساعد مختبر" : /خدمة/.test(f.job) ? "موظف خدمة" : (f.job || "");
  const n4 = n => String(n || "").split(/\s+/).filter(Boolean).slice(0, 4).join(" ");
  function attModel() {
    const adm = AT7.k == "a";
    const di = AT7.days == "2" ? [0, 2] : [0, 1, 2, 3, 4];
    const st = AT7.start || sunday(); const d0 = new Date(st + "T12:00:00");
    const dates = di.map(i => { const d = new Date(d0); d.setDate(d.getDate() + i); return d; });
    const fmt = d => AD(d.getDate()) + "/" + AD(d.getMonth() + 1) + "/" + AD(d.getFullYear());
    const L = adm ? admList() : staffIn();
    const h1 = [{ v: "ت", h: 1, rs: 2 }, { v: "الاسم", h: 1, rs: 2 }, ...(adm ? [{ v: "العنوان الوظيفي", h: 1, rs: 2 }] : []), ...di.map((i, k) => ({ v: DN[i] + "  " + fmt(dates[k]), h: 1, cs: 4 }))];
    const h2 = di.flatMap(() => [{ v: "وقت الحضور", h: 1 }, { v: "التوقيع", h: 1 }, { v: "وقت الانصراف", h: 1 }, { v: "التوقيع", h: 1 }]);
    const rows = L.map((f, i) => [AD(i + 1), { v: n4(f.name), l: 1, b: 1 }, ...(adm ? [jobOf(f)] : []), ...di.flatMap(() => ["", "", "", ""])]);
    const per = di.length == 5 ? [1.05, 1.35, 1.05, 1.35] : [1.6, 2.2, 1.6, 2.2];
    return {
      title: adm ? "سجل حضور الإدارة" : "سجل حضور الملاك", sub: "للأسبوع من " + DN[di[0]] + " " + fmt(dates[0]) + " إلى " + DN[di[di.length - 1]] + " " + fmt(dates[dates.length - 1]),
      sheet: adm ? "حضور الإدارة" : "حضور الملاك", orient: "landscape", paper: AT7.paper || "A4", fs: adm ? 12 : 11, hr: 2, drh: adm ? 30 : 0, pad: adm ? 1 : .25, bs: 1, grow: adm ? 3 : 1.6,
      rows: [h1, h2, ...rows], ww: [0.55, adm ? 3.8 : 4.6, ...(adm ? [1.8] : []), ...di.flatMap(() => per)], xw: [5, 30, ...(adm ? [16] : []), ...di.flatMap(() => [9, 11, 9, 11])],
      foot: ["", "المدير\nفراس حسن كاظم"]
    };
  }
  W.att207Set = (k, v) => { AT7[k] = v; save8(); rr(); };
  function attView() {
    CURX = { name: AT7.k == "a" ? "سجل حضور الإدارة" : "سجل حضور الملاك", sheets: () => [attModel()] };
    const m = attModel();
    return `<div class="vh"><h2>سجلات الحضور</h2><span class="sub">ورقة وحدة بالعرض لكل الأسبوع: وقت الحضور والتوقيع ووقت الانصراف والتوقيع لكل يوم</span></div>
<div class="tools">${segB(AT7.k, [["s", "سجل حضور الملاك (" + AD(staffIn().length) + ")"], ["a", "سجل حضور الإدارة (" + AD(admList().length) + ")"]], "att207Set.bind(0,'k')")}</div>
<div class="tools">${segB(AT7.days, [["5", "الأحد – الخميس"], ["2", "الأحد والثلاثاء (العطلة الصيفية)"]], "att207Set.bind(0,'days')")}
<label class="sub">بداية الأسبوع (الأحد) <input type="date" value="${E(AT7.start || sunday())}" onchange="att207Set('start',this.value)"></label>
<label class="sub">الورق <select onchange="att207Set('paper',this.value)">${["A4", "A3"].map(p => `<option ${AT7.paper == p ? "selected" : ""}>${p}</option>`).join("")}</select></label></div>
${AT7.k == "a" ? `<p class="muted">سجل الإدارة: المدير والمعاونون والكاتب (بهاء) ومساعد المختبر (عيسى) وموظفو الخدمة.</p>` : ""}
<div class="box"><div class="tw">${typeof modelHTML == "function" ? modelHTML(m) : ""}</div></div>${expBar()}`;
  }

  /* ---------- تسجيل الأقسام ---------- */
  on(() => {
    V.seat207 = seatView; TITLE.seat207 = "خارطة جلوس الطلبة"; NAVI.seat207 = ["seat207", "خارطة جلوس الطلبة", "users"]; HDESC.seat207 = "توزيع الطلبة على القاعات لنصف السنة ونهاية السنة";
    V.att207 = attView; TITLE.att207 = "سجلات الحضور (الملاك والإدارة)"; NAVI.att207 = ["att207", "سجلات الحضور (الملاك والإدارة)", "cal"]; HDESC.att207 = "أسبوعي بالعرض: الحضور والانصراف والتوقيع — وسجل الإدارة للعطلة";
    const st = D.createElement("style");
    st.textContent = `.seat207 table.mt td{white-space:pre-line;min-width:80px;height:58px;font-size:12px;line-height:1.35}`;
    D.head.appendChild(st);
    if (typeof W.hubOrder207 == "function") W.hubOrder207();
  });
})();
