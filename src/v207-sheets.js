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
  /* v219 (طلب المستخدم، حسب مخطط المدرسة): القاعة سروات × رحلات (افتراضي ٣ سروات × ٦ رحلات، القاعة ٩ = ٥ × ٥).
     الرحلة يكعد عليها طالب واحد، أو طالبين من صفين مختلفين (مثلاً رابع + خامس) لما العدد أكثر من الرحلات.
     الرحلة اللي ورا/كدام رحلة بيها طالب واحد بنفس السرة ما تكون من نفس الصف. */
  const ST7 = { t: "m", halls: 16, cols: 3, rows: 6, seed: 1, hall: 0, door: "fr", doors: {}, lay: { "9": [5, 5] }, pair: 1 };
  Object.assign(ST7, LG("seat207", {}));
  if (!ST7.v219) { ST7.cols = 3; ST7.rows = 6; ST7.lay = { "9": [5, 5] }; ST7.pair = 1; ST7.v219 = 1; }
  if (!ST7.lay || typeof ST7.lay != "object") ST7.lay = {};
  const T = (m, k) => { try { toast(m, k); } catch (e) { } };
  const save7 = () => LS("seat207", { t: ST7.t, halls: ST7.halls, cols: ST7.cols, rows: ST7.rows, lay: ST7.lay, pair: ST7.pair, seed: ST7.seed, door: ST7.door, doors: ST7.doors, v215: 1, v218: 1, v219: 1 });
  const DOORS = [["fr", "أمام يمين"], ["fl", "أمام يسار"], ["br", "خلف يمين"], ["bl", "خلف يسار"]];
  const doorOf = hi => (ST7.doors && ST7.doors[hi]) || ST7.door || "fr";
  const colName = (c, cols) => cols == 3 ? ["السرة اليمنى", "السرة الوسطى", "السرة اليسرى"][c] : cols == 2 ? ["السرة اليمنى", "السرة اليسرى"][c] : "السرة " + AD(c + 1);
  const gradeOf = s => String(s.s || "").split(" ")[0];
  const grpOf = s => String(s.s || "").split(" ").slice(0, -1).join(" ") || s.s;
  const layOf = hi => { const l = ST7.lay && ST7.lay[String(hi + 1)]; const c = Math.max(1, +(l && l[0]) || +ST7.cols || 3), r = Math.max(1, +(l && l[1]) || +ST7.rows || 6); return [c, r]; };
  function students7() {
    let L = (typeof STA == "function" ? STA() : []).filter(s => s.s && !/تجريبي/.test(s.s));
    if (ST7.t == "f") L = L.filter(s => gradeOf(s) != "السادس");
    return L;
  }
  let PC7 = null;
  function plan7() {
    const L0 = students7(), ck = JSON.stringify([ST7.t, ST7.halls, ST7.rows, ST7.cols, ST7.lay, ST7.pair, ST7.seed, L0.length, L0.map(s => s.n + "|" + s.s).join(",")]);
    if (PC7 && PC7.k == ck) return PC7.P;
    const P = plan7x(L0); PC7 = { k: ck, P }; return P;
  }
  function plan7x(L) {
    const H = Math.max(1, +ST7.halls || 16), per = ST7.pair ? 2 : 1;
    const LAY = Array.from({ length: H }, (_, i) => layOf(i)), DK = LAY.map(([c, r]) => c * r), CAP = DK.map(d => d * per);
    const R = rng(ST7.seed * 7919 + (ST7.t == "f" ? 3 : 1));
    /* التوزيع على القاعات: كل صف وفرع موزّع على القاعات حسب حجم كل قاعة (القاعة الكبيرة تاخذ أكثر) */
    const groups = {}; L.forEach(s => { (groups[grpOf(s)] = groups[grpOf(s)] || []).push(s); });
    const order = ["الرابع العلمي", "الرابع الأدبي", "الخامس العلمي", "الخامس الأدبي", "السادس العلمي", "السادس الأدبي"];
    const gk = Object.keys(groups).sort((a, b) => ((order.indexOf(a) + 1) || 99) - ((order.indexOf(b) + 1) || 99));
    const halls = Array.from({ length: H }, () => []), gc = halls.map(() => ({}));
    gk.forEach(g => {
      const S = shuf(groups[g].slice().sort((a, b) => String(a.s).localeCompare(String(b.s), "ar") || String(a.n).localeCompare(String(b.n), "ar")), R);
      S.forEach(s => {
        let best = 0, bv = Infinity;
        halls.forEach((h, i) => { const v = ((gc[i][g] || 0) + 1) / DK[i] * 1000 + (h.length + 1) / DK[i]; if (v < bv) { bv = v; best = i; } });
        halls[best].push(s); gc[best][g] = (gc[best][g] || 0) + 1;
      });
    });
    const over = halls.filter((h, i) => h.length > CAP[i]).length;
    const placed = halls.map((h, hi) => seat7(h, LAY[hi][0], LAY[hi][1], rng(ST7.seed * 104729 + hi * 31 + 7)));
    const totCap = CAP.reduce((a, b) => a + b, 0);
    return { L, H, LAY, DK, CAP, totCap, halls, placed, over, gk };
  }
  const KEYS = [gradeOf, gradeOf, grpOf, s => s.s || ""];
  function seat7(list, cols, rows, R) {
    const d = cols * rows, n = list.length, per = ST7.pair ? 2 : 1;
    if (n > d * per) return null;
    for (let lv = 0; lv < KEYS.length; lv++) for (let t = 0; t < 16; t++) {
      const g = tryDesks(list, cols, rows, rng(Math.floor(R() * 1e9) + lv * 13 + t), KEYS[lv], lv == 0, t);
      if (g) return { cols, rows, desks: g, lv: lv <= 1 ? 0 : lv - 1 };
    }
    /* احتياط أخير: توزيع بالتناوب */
    const desks = Array.from({ length: d }, () => []), q = {}; list.forEach(s => (q[s.s] = q[s.s] || []).push(s));
    const QK = Object.keys(q), seq = []; while (seq.length < n) QK.forEach(g => { if (q[g].length) seq.push(q[g].pop()); });
    seq.forEach((s, i) => desks[i % d].push(s));
    return { cols, rows, desks, lv: 3 };
  }
  function tryDesks(list, cols, rows, R, key, hz, tr) {
    const d = cols * rows, n = list.length, by = {};
    list.forEach(s => { const g = key(s); (by[g] = by[g] || []).push(s); });
    const G = Object.keys(by), cnt = {}; G.forEach(g => { cnt[g] = by[g].length; by[g] = shuf(by[g], R); });
    const pm = Math.max(0, n - d);
    let p = ST7.pair ? pm + Math.floor(tr / 4) : pm; while (p > pm && n - 2 * p < 0) p--;
    const sg = n - 2 * p, e = d - p - sg;
    /* الرحلة الثنائية لازم صفين مختلفين: الأكثر عدداً ما يكدر يتجاوز (الفرديات + الثنائيات) */
    const mx = Math.max(0, ...G.map(g => cnt[g])); if (mx > sg + p) return null;
    /* نوع كل رحلة: ٢ = طالبين، ١ = طالب، ٠ = فارغة — موزعة بالتساوي على القاعة */
    const typ = new Array(d).fill(1), idx = []; for (let i = 0; i < d; i++) { const r = Math.floor(i / cols), c = i % cols; idx.push(i); }
    const spread = (k, pool, v) => { if (tr >= 4) { shuf(pool, R).slice(0, k).forEach(i => typ[i] = v); return; } for (let j = 0; j < k; j++) { const i = pool[Math.floor((j + (tr % 2 ? .5 : 0)) * pool.length / k) % pool.length]; typ[i] = v; } };
    if (e > 0) { const ch = idx.filter(i => (Math.floor(i / cols) + i % cols) % 2 == (tr % 4 > 1 ? 0 : 1)); const pool = ch.length >= e ? ch : idx; spread(e, pool, 0); }
    if (p > 0) { const ones = idx.filter(i => typ[i] == 1), ch = ones.filter(i => (Math.floor(i / cols) + i % cols) % 2 == (tr % 4 > 1 ? 1 : 0)); spread(p, ch.length >= p ? ch : ones, 2); }
    const grid = new Array(d).fill(null);
    let steps = 0;
    const sameSingle = (j, g) => j >= 0 && grid[j] && grid[j].length == 1 && grid[j][0] === g;
    const ok1 = (i, g) => { const r = Math.floor(i / cols), c = i % cols; if (r > 0 && sameSingle(i - cols, g)) return false; if (hz && c > 0 && sameSingle(i - 1, g)) return false; return true; };
    const dfs = i => {
      if (++steps > 15000) return false;
      if (i == d) return true;
      const t = typ[i];
      if (t == 0) { grid[i] = []; if (dfs(i + 1)) return true; grid[i] = null; return false; }
      const opts = shuf(G.filter(g => cnt[g] > 0), R).sort((a, b) => cnt[b] - cnt[a]);
      if (t == 1) {
        for (const g of opts) { if (!ok1(i, g)) continue; grid[i] = [g]; cnt[g]--; if (dfs(i + 1)) return true; cnt[g]++; grid[i] = null; }
        return false;
      }
      for (let a = 0; a < opts.length; a++) for (let b = a + 1; b < opts.length; b++) {
        const g1 = opts[a], g2 = opts[b]; grid[i] = [g1, g2]; cnt[g1]--; cnt[g2]--;
        if (dfs(i + 1)) return true; cnt[g1]++; cnt[g2]++; grid[i] = null;
        if (steps > 15000) return false;
      }
      return false;
    };
    if (!dfs(0)) return null;
    return grid.map(gs => gs.map(g => by[g].pop()).sort((x, y) => String(x.s).localeCompare(String(y.s), "ar")));
  }
  W.seat207Plan = plan7;
  W.seat215Door = (hi, k) => { if (hi < 0) { ST7.door = k; ST7.doors = {}; } else { ST7.doors = ST7.doors || {}; ST7.doors[hi] = k; } save7(); rr(); };
  /* أوراق أرقام القاعات: A4 بالعرض، الشعار + «قاعة رقم -n-» بخط كبير */
  W.seat215Signs = async how => {
    const dg = v => parseInt(String(v || "").replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632)) || 0;
    const H = Math.max(1, +ST7.halls || 16), a = Math.max(1, dg((D.getElementById("sg215a") || {}).value) || 1), b = Math.min(H, dg((D.getElementById("sg215b") || {}).value) || H);
    if (a > b) return T("الأرقام خاطئة", "err");
    T("جارٍ تجهيز الأوراق…");
    let logo = (W.LOGO215 && W.LOGO215.s) || "img/logo_s.png";
    if (!/^data:/.test(logo)) { try { const bl = await (await fetch(logo)).blob(); logo = await new Promise(ok => { const r = new FileReader; r.onload = () => ok(r.result); r.readAsDataURL(bl); }); } catch (e) { } }
    const F = "'Noto Naskh Arabic','Amiri',serif";
    const pg = n => `<div style="width:1123px;height:794px;box-sizing:border-box;padding:30px;background:#fff;font-family:${F};direction:rtl"><div style="width:100%;height:100%;box-sizing:border-box;border:8px double #0f4d3c;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:26px 30px 22px">
<div style="display:flex;align-items:center;gap:24px"><img src="${logo}" style="width:150px;height:150px"><div style="text-align:right"><div style="font:700 46px/1.3 ${F};color:#0f4d3c">إعدادية سيناء للبنين</div><div style="font:600 24px/1.5 ${F};color:#7a6420">${exName()} ${yrTxt()}</div></div></div>
<div style="text-align:center;line-height:1"><div style="font:700 120px/1.15 ${F};color:#111;white-space:nowrap">قاعة رقم</div><div style="font:700 250px/1 ${F};color:#0f4d3c;white-space:nowrap;direction:ltr">-${AD(n)}-</div></div>
<div style="font:600 21px/1.4 ${F};color:#555">المديرية العامة لتربية بغداد الرصافة الأولى</div></div></div>`;
    const wrap = D.createElement("div"); wrap.style.cssText = "position:fixed;left:-40000px;top:0"; D.body.appendChild(wrap);
    try {
      const pages = [];
      for (let n = a; n <= b; n++) {
        wrap.innerHTML = pg(n); const el = wrap.firstElementChild;
        await Promise.all([...el.querySelectorAll("img")].map(im => im.complete ? 0 : new Promise(ok => { im.onload = im.onerror = ok; setTimeout(ok, 4000); })));
        try { await D.fonts.ready; } catch (e) { }
        pages.push(await dxRaster(el, "", 1.6));
      }
      const blob = pdfJpegs(pages, 841.89, 595.28), nm = "أرقام القاعات " + AD(a) + "-" + AD(b);
      W.__sg215 = blob;
      /* v224: lPrintPdf70 ما موجودة أصلاً — زر «طباعة» چان ينزّل PDF بدل ما يفتح نافذة الطباعة. هسه يطبع من نفس طريق النظام (printHere221، A4 بالعرض) */
      if (how == "print" && typeof W.printHere221 == "function") {
        await W.printHere221(pages.map(pp => ({ w: 297, h: 210, html: `<div class="pg221 %SZ%"><img src="${URL.createObjectURL(new Blob([pp.jpg], { type: "image/jpeg" }))}" alt=""></div>` })), nm);
      } else await saveFile(nm + ".pdf", blob);
    } catch (e) { console.warn(e); T("تعذّر تجهيز الأوراق", "err"); } finally { wrap.remove(); }
  };
  W.seat207Set = (k, v) => { const dg = x => parseInt(String(x).replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632)) || 0; if (k == "lc" || k == "lr") { const hi = Math.min(ST7.hall || 0, (+ST7.halls || 16) - 1), key = String(hi + 1), cur = layOf(hi), nv = Math.max(1, Math.min(12, dg(v) || 0)); if (nv) { cur[k == "lc" ? 0 : 1] = nv; ST7.lay[key] = cur; if (cur[0] == ST7.cols && cur[1] == ST7.rows) delete ST7.lay[key]; } save7(); rr(); return; } if (k == "lreset") { delete ST7.lay[String((ST7.hall || 0) + 1)]; save7(); rr(); return; } if (k == "pair") { ST7.pair = v ? 1 : 0; save7(); rr(); return; } if (k == "t") ST7.t = v; else if (k == "new") ST7.seed = (ST7.seed || 1) + 1; else if (k == "hall") ST7.hall = +v; else ST7[k] = Math.max(1, parseInt(String(v).replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632)) || ST7[k]); save7(); rr(); };
  const exName = () => ST7.t == "f" ? "امتحانات نهاية السنة" : "امتحانات نصف السنة";
  function hallModel(P, hi) {
    const pl = P.placed[hi]; const [cols, rows] = P.LAY[hi];
    let base = 0; for (let k = 0; k < hi; k++) base += P.halls[k].length;
    const dr = doorOf(hi), DR = "🚪 الباب";
    const isD = c => (c == 0 && dr == "fr") || (c == cols - 1 && dr == "fl");
    const head = [[...(isD(0) ? [{ v: DR, h: 1, bg: "#fde9b8" }] : []), { v: "السبورة — مقدمة القاعة", h: 1, cs: cols - ((dr == "fr" || dr == "fl") ? 1 : 0) }, ...(dr == "fl" ? [{ v: DR, h: 1, bg: "#fde9b8" }] : [])],
      Array.from({ length: cols }, (_, c) => ({ v: colName(c, cols), h: 1, fz: .9 }))];
    const R = []; let no = base;
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const dk = pl ? pl.desks[r * cols + c] || [] : [];
        row.push(dk.length ? { v: dk.map(s => AD(++no) + "\n" + s.n + "\n" + s.s).join("\n─────\n") } : { v: "—", bg: "#f3f3f3" });
      }
      R.push(row);
    }
    if (dr == "br" || dr == "bl") R.push(Array.from({ length: cols }, (_, c) => (c == 0 && dr == "br") || (c == cols - 1 && dr == "bl") ? { v: DR, h: 1, bg: "#fde9b8" } : { v: "", nb: 1 }));
    const cnt = {}; P.halls[hi].forEach(s => { const g = grpOf(s); cnt[g] = (cnt[g] || 0) + 1; });
    const sc = Math.min(cols, 3);
    const stat = [{ v: "إحصائية القاعة (" + AD(hi + 1) + ")", h: 1, cs: cols }];
    const sRows = [[{ v: "عدد الطلبة الكلي: " + AD(P.halls[hi].length) + " طالب", b: 1, cs: cols, fz: 1.1 }], ...(() => { const G = P.gk.filter(g => cnt[g]).map(g => ({ v: g + "\n" + AD(cnt[g]) + " طالب", b: 1 })), out = []; for (let i = 0; i < G.length; i += cols) { const r = G.slice(i, i + cols); while (r.length < cols) r.push({ v: "", nb: 1 }); out.push(r); } return out; })()];
    const two = pl && pl.desks.some(x => x.length > 1);
    return {
      title: "خارطة جلوس الطلبة — " + exName() + " " + yrTxt(), sub: "القاعة رقم (" + AD(hi + 1) + ") — جهة الباب: " + (DOORS.find(x => x[0] == dr) || DOORS[0])[1],
      sheet: ("قاعة " + (hi + 1)).slice(0, 31), orient: cols > 3 ? "landscape" : "portrait", paper: "A4", fs: two ? (cols > 3 ? 8 : 9) : 10, hr: 1, drh: two ? 30 : 44,
      rows: [...head, ...R, [{ v: "", nb: 1, cs: cols }], stat, ...sRows], ww: new Array(cols).fill(1), xw: new Array(cols).fill(cols > 3 ? 24 : 30),
      foot: ["", "المدير\nفراس حسن كاظم"]
    };
  }
  function sumModel(P) {
    const head = [{ v: "القاعة", h: 1 }, ...P.gk.map(g => ({ v: g, h: 1 })), { v: "المجموع", h: 1 }, { v: "أرقام الجلوس", h: 1 }];
    let base = 0;
    const rows = P.halls.map((h, i) => { const r = [AD(i + 1), ...P.gk.map(g => AD(h.filter(s => grpOf(s) == g).length)), { v: AD(h.length), b: 1 }, h.length ? AD(base + 1) + " – " + AD(base + h.length) : "—"]; base += h.length; return r; });
    const tot = ["المجموع", ...P.gk.map(g => AD(P.L.filter(s => grpOf(s) == g).length)), { v: AD(P.L.length), b: 1 }, ""];
    return { title: "توزيع الطلبة على القاعات — " + exName() + " " + yrTxt(), sheet: "التوزيع", orient: "portrait", paper: "A4", fs: 11, hr: 1, rows: [head, ...rows, tot.map(v => typeof v == "object" ? { ...v, h: 1 } : { v, h: 1 })], ww: [1.2, ...P.gk.map(() => 1.6), 1.2, 1.8], xw: [10, ...P.gk.map(() => 16), 10, 16], foot: ["", "المدير\nفراس حسن كاظم"] };
  }
  function seatView() {
    const P = plan7();
    const ok = P.placed.every((g, i) => g || !P.halls[i].length);
    const hi = Math.min(ST7.hall || 0, P.H - 1);
    CURX = P.L.length && ok ? { name: "خارطة جلوس الطلبة — " + exName(), sheets: () => [sumModel(P), ...P.halls.flatMap((h, i) => h.length ? [hallModel(P, i)] : [])] } : null;
    const inp = (k, l, w) => `<label class="sub">${l} <input value="${AD(ST7[k])}" inputmode="numeric" style="width:${w || 60}px" onchange="seat207Set('${k}',this.value)"></label>`;
    const prev = P.placed[hi] ? (typeof modelHTML == "function" ? modelHTML(hallModel(P, hi)) : "") : "";
    const [hc, hr] = layOf(hi), custom = !!(ST7.lay && ST7.lay[String(hi + 1)]);
    const hinp = (k, l, v) => `<label class="sub">${l} <input value="${AD(v)}" inputmode="numeric" style="width:46px" onchange="seat207Set('${k}',this.value)"></label>`;
    return `<div class="vh"><h2>خارطة جلوس الطلبة</h2><span class="sub">توزيع آلي على القاعات حسب حجم كل قاعة — في الرحلة طالب واحد أو طالبان من صفين مختلفين، ولا يجلس طالب خلف طالب من الصف نفسه</span></div>
<div class="tools">${segB(ST7.t, [["m", "امتحانات نصف السنة"], ["f", "امتحانات نهاية السنة (بدون السادس)"]], "seat207Set.bind(0,'t')")}</div>
<div class="tools">${inp("halls", "عدد القاعات")}${inp("cols", "السروات بكل قاعة", 46)}${inp("rows", "الرحلات بكل سرة", 46)}<label class="sub"><input type="checkbox" ${ST7.pair ? "checked" : ""} onchange="seat207Set('pair',this.checked)"> طالبين بالرحلة (صفين مختلفين) عند الحاجة</label><button class="btn ghost sm" onclick="seat207Set('new')">${I("refresh")} توزيع جديد</button></div>
<p class="muted" style="margin:0 0 6px">المقاعد الكلية: ${AD(P.totCap)} لـ ${AD(P.L.length)} طالب${Object.keys(ST7.lay || {}).length ? " — قاعات بحجم خاص: " + Object.keys(ST7.lay).sort((a, b) => a - b).map(k => "القاعة " + AD(k) + " (" + AD(ST7.lay[k][0]) + " سروات × " + AD(ST7.lay[k][1]) + " رحلات)").join("، ") : ""}</p>
${P.over ? `<div class="banner err">${I("alert")} الطلبة (${AD(P.L.length)}) أكثر من مقاعد القاعات (${AD(P.totCap)}). زيد عدد القاعات أو الرحلات.</div>` : ""}
${(() => { const r = P.placed.map((g, i) => g && g.lv ? i + 1 : 0).filter(Boolean); return r.length && !P.over ? `<div class="banner">${I("alert")} القاعات (${r.map(AD).join("، ")}): بسبب الأعداد، بعض الطلاب المتتاليين من المرحلة نفسها لكن من فرع أو شعبة مختلفة.</div>` : ""; })()}
<div class="box"><h3>التوزيع على القاعات (${AD(P.L.length)} طالب)</h3><div class="tw">${typeof modelHTML == "function" ? modelHTML(sumModel(P)) : ""}</div></div>
<div class="box"><h3>القاعة</h3><div class="tools" style="flex-wrap:wrap">${P.halls.map((h, i) => `<button class="btn ${i == hi ? "" : "ghost"} sm" onclick="seat207Set('hall',${i})">${AD(i + 1)}</button>`).join("")}</div>
<div class="tools"><span class="sub">حجم القاعة (${AD(hi + 1)}):</span>${hinp("lc", "سروات", hc)}${hinp("lr", "رحلات كل سرة", hr)}<span class="sub">= ${AD(hc * hr)} رحلة</span>${custom ? `<button class="btn ghost sm" onclick="seat207Set('lreset')">رجّعها مثل باقي القاعات</button>` : ""}</div>
<div class="tools"><span class="sub">جهة باب القاعة (${AD(hi + 1)}):</span>${DOORS.map(([k, t]) => `<button class="btn ${doorOf(hi) == k ? "" : "ghost"} sm" onclick="seat215Door(${hi},'${k}')">${t}</button>`).join("")}<button class="btn ghost sm" onclick="seat215Door(-1,'${doorOf(hi)}')">الجهة نفسها لكل القاعات</button></div>
<div class="tw seat207">${prev}</div></div>
<div class="box"><h3>${I("doc")} أوراق أرقام القاعات</h3><p class="muted" style="margin:0 0 8px">ورقة بالعرض لكل قاعة: شعار المدرسة و«قاعة رقم -١-» بخط كبير — تنلصق على باب القاعة.</p><div class="tools"><label class="sub">من <input id="sg215a" value="١" inputmode="numeric" style="width:46px"></label><label class="sub">إلى <input id="sg215b" value="${AD(P.H)}" inputmode="numeric" style="width:46px"></label><button class="btn sm" onclick="seat215Signs('pdf')">${I("doc")} PDF</button><button class="btn ghost sm" onclick="seat215Signs('print')">${I("print")} طباعة</button></div></div>
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
    const fmt = d => (W.dmy207 ? W.dmy207(d.getDate(), d.getMonth() + 1, d.getFullYear()) : AD(d.getDate()) + "/" + AD(d.getMonth() + 1) + "/" + AD(d.getFullYear()));
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
    return `<div class="vh"><h2>سجلات الحضور</h2><span class="sub">ورقة واحدة بالعرض لكل الأسبوع: وقت الحضور والتوقيع ووقت الانصراف والتوقيع لكل يوم</span></div>
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
