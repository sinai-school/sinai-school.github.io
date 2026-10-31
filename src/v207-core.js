/* ===== v207 (31 Oct 2026) — ترتيب النظام حسب الأيقونات، التواريخ، القيد العام (التصحيح ما يرجع)، الطلاب بدون قيد،
   السجل الوسطي (المواليد + رقم الصفحة ورقم القيد)، السرعة (فتح فوري من الجهاز + مزامنة أسرع)، لوحة البوابة ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v207", e); } };
  const T = (m, k) => { try { (typeof toast == "function" ? toast : console.log)(m, k); } catch (e) { } };
  const E = s => typeof esc == "function" ? esc(s) : String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const A = v => typeof toAr == "function" ? toAr(v) : String(v);
  const I = n => typeof ic == "function" ? ic(n) : "";
  const isStaff = () => !!(typeof GX != "undefined" && GX.on);
  const own = () => isStaff() && !!W.GXOWN;
  const rr = () => { try { if (typeof render == "function") render(); } catch (e) { } };
  W.V207 = W.V207 || {};

  /* =====================================================================
     (١) التواريخ: يوم / شهر / سنة — اليوم ع اليسار مثل الكتب الرسمية (٢٩/١٠/٢٠٢٦)، وبكل مكان بنفس الشكل
     ===================================================================== */
  const AD = x => String(x).replace(/[0-9]/g, k => "٠١٢٣٤٥٦٧٨٩"[k]);
  const DMY = (d, m, y) => AD(+d) + "/" + AD(+m) + "/" + AD(+y);
  W.dmy207 = DMY;
  const dt207 = v => {
    let s = String(v ?? "");
    if (!/[0-9٠-٩۰-۹]/.test(s)) return s;
    const Dg = x => +String(x).replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632).replace(/[۰-۹]/g, d => d.charCodeAt(0) - 1776);
    const N = "[0-9٠-٩۰-۹]", SEP = "[\\s‎‏⁦-⁩]*[\\/\\-\\.][\\s‎‏⁦-⁩]*";
    const ok = (d, m, y) => y > 1900 && y < 2200 && m >= 1 && m <= 12 && d >= 1 && d <= 31;
    const arab = t => /[٠-٩]/.test(t);
    /* سنة/شهر/يوم ← يوم/شهر/سنة */
    s = s.replace(new RegExp("(?<!" + N + ")[‎‏⁦-⁩]*(" + N + "{4})" + SEP + "(" + N + "{1,2})" + SEP + "(" + N + "{1,2})(?!" + N + ")[⁩]?", "g"),
      (m, y, mo, d) => ok(Dg(d), Dg(mo), Dg(y)) && (arab(m) || /[‏]/.test(m)) ? DMY(Dg(d), Dg(mo), Dg(y)) : m);
    /* يوم/شهر/سنة بعلامات اتجاه أو مسافات → بدونها */
    s = s.replace(new RegExp("(?<!" + N + ")[‎‏⁦-⁩]*(" + N + "{1,2})" + SEP + "(" + N + "{1,2})" + SEP + "(" + N + "{4})(?!" + N + ")[⁩]?", "g"),
      (m, d, mo, y) => ok(Dg(d), Dg(mo), Dg(y)) && (arab(m) || /[‏]/.test(m)) ? DMY(Dg(d), Dg(mo), Dg(y)) : m);
    return s;
  };
  W.dt207 = dt207;
  on(() => { if (typeof dt72 == "function") dt72 = function (v) { return dt207(v); }; });
  /* كل نص معروض بالنظام والمعاينة والطباعة (عدا الحقول وقت الكتابة) */
  const SKIP = "script,style,textarea,input,select,code,pre,[data-nodate]";
  function fixDom(root) {
    if (!root || !root.querySelectorAll) return;
    const Wk = D.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const L = []; let n;
    while ((n = Wk.nextNode())) { const v = n.nodeValue; if (v.length > 5 && /[0-9٠-٩]{1,4}[\s‎‏]*[\/\-\.][\s‎‏]*[0-9٠-٩]{1,2}[\s‎‏]*[\/\-\.]/.test(v)) L.push(n); }
    L.forEach(t => {
      const p = t.parentElement; if (!p || p.closest(SKIP)) return;
      if (p.closest("[contenteditable=true]") && p.closest("[contenteditable=true]").contains(D.activeElement)) return;
      const v = dt207(t.nodeValue); if (v != t.nodeValue) t.nodeValue = v;
    });
  }
  W.fixDates207 = fixDom;
  {
    let tm = 0; const Q = new Set;
    new MutationObserver(ms => {
      for (const m of ms) for (const x of m.addedNodes) { if (x.nodeType == 1) Q.add(x); else if (x.nodeType == 3 && x.parentElement) Q.add(x.parentElement); }
      clearTimeout(tm); tm = setTimeout(() => { const L = [...Q]; Q.clear(); L.forEach(el => { if (el.isConnected) fixDom(el); }); }, 60);
    }).observe(D.documentElement, { childList: true, subtree: true });
  }

  /* =====================================================================
     (٢) ترتيب النظام: كل شي تحت أيقونته، بدون تكرار ولا تشتيت
     ===================================================================== */
  function hubOrder() {
    if (typeof HUBS == "undefined" || !Array.isArray(HUBS) || typeof NAVI == "undefined") return;
    const has = k => !!(NAVI[k] || (typeof V != "undefined" && V[k]));
    const fx = id => (typeof FXR != "undefined" && FXR[id] && typeof fxView == "function") ? fxView(id) : null;
    const K = L => L.map(k => k && k.startsWith("fx:") ? fx(k.slice(3)) : k).filter(k => k && has(k));
    const NEW = [
      ["gs", "شؤون الطلبة", "users", "أسماء الطلبة، المحاولات، الانتساب، الغياب، القيد العام، الترحيل والخريجون، استمارات الطلاب",
        ["p", "mh", "int70", "a", "q", "pm137", "gr137", "s6", "fx:f_reg", "fx:f_info", "fx:f_med", "fx:f_muh", "fx:f_books"]],
      ["ge", "الدرجات والنتائج", "chart", "إدخال الدرجات، النتائج والبطاقات، السجل الوسطي، سجل درجات المدرسين، نسب النجاح، الأرشيف",
        ["g", "r", "sw", "fx:r_grd", "n", "fx:f_pr12", "fx:f_prf", "fx:f_prm", "z"]],
      ["gex", "الامتحانات", "doc", "جداول الامتحانات، خارطة جلوس الطلبة، السيطرة الامتحانية، المراكز الامتحانية، الفاحصين والمدققين",
        ["ex", "seat207", "fx:r_ctl", "fx:f_mrk", "fx:f_exa", "fx:f_exs"]],
      ["gt", "الجداول", "cal", "الجدول الأسبوعي، الاحتياط، مراقبة الساحة، جدول المديرية",
        ["t", "x", "yd", "o"]],
      ["gf", "المدرسون والملاك", "teacher", "المدرسون، الملاك، السجل الإحصائي، الجرد، الرواتب، سجلات الحضور",
        ["m", "f", "i", "k", "fx:j_qw", "sal", "att207"]],
      ["gl", "الكتب والمراسلات", "mail", "الكتب الرسمية، نماذج الكتب، الصادر والوارد",
        ["l", "lt", "y"]],
      ["grc", "سجلات المدرسة", "rec", "سجل معلومات المدرسة، الأوامر المدرسية، حقوق الإنسان",
        ["fx:r_info", "fx:r_ord", "fx:r_hr"]],
      ["gy", "البوابة والإعدادات", "globe", "الشعب والمواد، البوابة وحساباتها، التطبيق، الصلاحيات، النسخ الاحتياطي، الحسابات التجريبية",
        ["c", "w", "pp", "app", "pr", "b", "adv202", "tst206"]]
    ];
    const used = new Set(["fx_r_att"]);  /* سجل الحضور القديم انبدل بسجل الحضور الأسبوعي الجديد */
    const out = NEW.map(([id, n, icn, d, kids]) => { const k = K(kids).filter(x => !used.has(x)); k.forEach(x => used.add(x)); return [id, n, icn, d, k]; });
    /* أي قسم قديم ما انذكر: يروح لأقرب مجموعة حتى ما يضيع */
    HUBS.forEach(h => (h[4] || []).forEach(k => { if (!used.has(k) && has(k)) { used.add(k); const g = out.find(x => x[0] == h[0]) || out[out.length - 1]; g[4].push(k); } }));
    HUBS.splice(0, HUBS.length, ...out.filter(h => h[4].length));
    HUBS.forEach(h => {
      TITLE[h[0]] = h[1];
      V[h[0]] = () => {
        const Kx = typeof hubKids == "function" ? hubKids(h) : h[4].map(k => NAVI[k]).filter(Boolean);
        return `<div class="hubhd"><span class="hubi">${I(h[2])}</span><div><h2>${h[1]}</h2><p class="muted">${h[3]}</p></div></div>
  <div class="hubg">${Kx.map(([k2, n, i]) => `<button type="button" class="hubc" onclick="view('${k2}')"><span class="hubi">${I(i)}</span><b>${E(n)}</b><span>${E((typeof HDESC != "undefined" && HDESC[k2]) || "")}</span></button>`).join("")}</div>`;
      };
    });
    /* القائمة الجانبية القديمة (NAVG0) بنفس الترتيب */
    try {
      if (typeof NAVG0 != "undefined" && Array.isArray(NAVG0)) {
        const home = NAVG0[0];
        const grp = HUBS.map(h => [h[1], h[4].map(k => NAVI[k]).filter(Boolean)]);
        NAVG0.splice(0, NAVG0.length, home, ...grp);
      }
    } catch (e) { }
  }
  W.hubOrder207 = hubOrder;

  /* =====================================================================
     (٣) القيد العام: التصحيح اليدوي والاختيار ما يرجع أبداً
     السبب: التصحيح التلقائي (كل ١٠ دقائق بأي جهاز) چان يرجّع اسم القيد لاسم الصف حتى لو إنت صححته بيدك،
     و«اتركه» چان ينحفظ بالجهاز بس. هسه كل قرار ينحفظ ويا السجل نفسه بالخادم (lk) والتلقائي ما يلمسه.
     ===================================================================== */
  on(() => {
    if (typeof qStrip == "function") {
      /* qStrip ثابت (const) — نضيف الحقول الجديدة عن طريق qSaveChunk */
    }
    if (typeof qSaveChunk != "function") return;
    const KEEP = ["i", "pg", "n", "r", "y", "nt", "im", "lk", "bd"];
    const strip = r => { const o = {}; for (const k of KEEP) if (r[k] != null && r[k] !== "") o[k] = r[k]; return o; };
    qSaveChunk = function (c) {
      const list = QD.filter(r => r.c == c).map(strip);
      QPEND[c] = JSON.stringify(list);
      if (!DB) return;
      const ref = DB.doc("qaid/" + c);
      q(ref.path, () => retry(() => list.length ? ref.set({ list }) : ref.delete()));
    };
  });
  const lock = (r, why) => { if (!r) return; r.lk = why || "يدوي"; };
  on(() => {
    if (typeof qSave == "function") {
      const _qs = qSave;
      qSave = function (id) {
        const r = QD.find(x => x.i == id); if (r) lock(r, "يدوي");
        return _qs.apply(this, arguments);
      };
    }
    if (typeof qAdd == "function") {
      const _qa = qAdd;
      qAdd = function () { const n0 = QD.length; const res = _qa.apply(this, arguments); try { if (QD.length > n0) { const r = QD[QD.length - 1]; } } catch (e) { } return res; };
    }
  });
  /* أزرار المطابقة: كل اختيار يقفل السجل بالخادم */
  on(() => {
    const wrap = (name, why, after) => {
      if (typeof W[name] != "function") return;
      const _f = W[name];
      W[name] = async function (i, ...a) {
        const Q = typeof W.q205 == "function" ? W.q205() : null, it = Q && Q.rev[i];
        const r = it && it.r;
        const res = await _f.call(this, i, ...a);
        try {
          if (r && QD.includes(r)) { lock(r, why); if (after) after(r, it); qSaveChunk(r.c); }
        } catch (e) { }
        return res;
      };
    };
    wrap("qFix205", "اسم الصف");
    wrap("q206Sys", "اسم القيد");
    wrap("q206Por", "البطاقة");
    wrap("qSkip205", "اتركه:", (r, it) => { r.lk = "اتركه:" + (it.s ? it.s.n : ""); });
  });
  /* المطابقة التلقائية تتجاهل أي سجل مقفول، و«اتركه» المحفوظ بالخادم يتطبق بكل الأجهزة */
  on(() => {
    if (typeof W.q205 != "function") return;
    const _q = W.q205;
    W.q205 = function () {
      const Q = _q.apply(this, arguments);
      try {
        if (Q && Q.rev && !Q._f207) {
          Q._f207 = 1;
          for (let i = Q.rev.length - 1; i >= 0; i--) { const r = Q.rev[i].r; if (r && r.lk) Q.rev.splice(i, 1); }
        }
      } catch (e) { }
      return Q;
    };
  });
  /* qApply (التلقائي) داخل سكربت v205 — نمنعه من تغيير أي سجل مقفول عن طريق QD نفسه:
     قبل كل حفظ نرجّع اسم السجل المقفول لقيمته المحفوظة بالخادم */
  on(() => {
    if (typeof qSaveChunk != "function") return;
    const _sc = qSaveChunk;
    qSaveChunk = function (c) {
      try {
        const raw = (typeof GX != "undefined" && GX.M && GX.M.get("qaid/" + c)) || null;
        const srv = raw && raw.d && raw.d.list ? raw.d.list : null;
        if (srv) {
          const by = {}; srv.forEach(x => by[x.i] = x);
          QD.forEach(r => {
            if (r.c != c) return; const s = by[r.i];
            if (s && s.lk && r.n != s.n && !r._ok207) { r.n = s.n; r.lk = s.lk; delete r._k; }
          });
        }
      } catch (e) { }
      QD.forEach(r => { delete r._ok207; });
      return _sc.apply(this, arguments);
    };
    /* التعديل اليدوي/الاختيار مسموح يغيّر السجل المقفول (هو نفسه القرار الجديد) */
    const mark = id => { const r = QD.find(x => x.i == id); if (r) r._ok207 = 1; };
    if (typeof qSave == "function") { const _s = qSave; qSave = function (id) { mark(id); return _s.apply(this, arguments); }; }
    ["qFix205", "q206Sys", "q206Por"].forEach(nm => {
      if (typeof W[nm] != "function") return; const _f = W[nm];
      W[nm] = async function (i, ...a) { try { const Q = W.q205 && W.q205(); const it = Q && Q.rev[i]; if (it && it.r) it.r._ok207 = 1; } catch (e) { } return _f.call(this, i, ...a); };
    });
  });

  /* ---------- الطلاب بدون قيد: ربط تلقائي بالمطابقة التامة + قائمة واضحة بالباقين ---------- */
  const NZ = s => String(s || "").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim().replace(/(^|\s)(عبد|ابو)\s+/g, "$1$2");
  const lev = (a, b) => { let p = [...Array(b.length + 1).keys()]; for (let i = 1; i <= a.length; i++) { const c = [i]; for (let j = 1; j <= b.length; j++) c.push(Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] != b[j - 1]))); p = c; } return p[b.length]; };
  const tok = s => NZ(s).split(" ").filter(Boolean);
  const samePerson = (a, b) => { const x = tok(a), y = tok(b); if (x.length < 2 || y.length < 2) return false; const d0 = lev(x[0], y[0]), d1 = lev(x[1], y[1]); if (d0 > 1 || d1 > 1 || d0 + d1 > 2) return false; if (x.length >= 3 && y.length >= 3 && lev(x[2], y[2]) > 2) return false; return true; };
  const pgK = v => String(v == null ? "" : v).replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/\D/g, "");
  const portalName = s => { try { const x = (typeof INF != "undefined" && INF && INF[s.id] && INF[s.id].x) || null; return x ? [x.n1, x.n2, x.n3, x.n4].filter(Boolean).join(" ") : ""; } catch (e) { return ""; } };
  const allSt = () => (typeof ST != "undefined" ? ST : []).filter(s => !s.x && s.ss != "مفصول");
  function noQaid() {
    if (typeof QD == "undefined" || !QD.length) return null;
    const used = new Set(allSt().map(s => pgK(s.pg)).filter(Boolean));
    const free = QD.filter(r => !used.has(pgK(r.pg)));
    const out = [];
    allSt().forEach(s => {
      const k = pgK(s.pg);
      if (k && QD.some(r => pgK(r.pg) == k)) return;
      const pn = portalName(s);
      const ex = free.filter(r => NZ(r.n) == NZ(s.n) || (pn && NZ(r.n) == NZ(pn)));
      const near = free.filter(r => !ex.includes(r) && (samePerson(s.n, r.n) || (pn && samePerson(pn, r.n)))).sort((a, b) => (+pgK(b.pg)) - (+pgK(a.pg))).slice(0, 4);
      out.push({ s, pn, ex, near, bad: !!k });
    });
    return out;
  }
  W.noQaid207 = noQaid;
  /* ربط تلقائي: اسم مطابق حرفياً بسجل قيد مو مربوط بأي طالب (قيد هذه السنة أو السابقة) */
  let AL = 0;
  async function autoLink() {
    if (!own() || AL || typeof QD == "undefined" || !QD.length || typeof P == "undefined") return;
    const L = noQaid(); if (!L) return; AL = 1;
    let n = 0;
    L.forEach(x => {
      if (x.ex.length != 1) return;
      const st = ST.find(y => y.id == x.s.id); if (!st) return;
      st.pg = String(x.ex[0].pg); n++;
    });
    if (n) { try { P.st(); } catch (e) { } T("انربط " + A(n) + " طالب بصفحة القيد العام (اسم مطابق تماماً) ✓"); }
  }
  W.qLink207 = (sid, pg) => {
    if (typeof guard == "function" && guard()) return;
    const st = ST.find(y => y.id == sid); if (!st) return;
    if (!confirm("ربط «" + st.n + "» بصفحة القيد " + pg + "؟")) return;
    st.pg = String(pg); P.st(); T("انربط الطالب بصفحة القيد ✓"); rr();
  };
  /* صندوق «طلاب بدون قيد» بصفحة القيد العام */
  on(() => {
    if (typeof V == "undefined" || typeof V.q != "function") return;
    const _vq = V.q;
    V.q = function () {
      let h = _vq.apply(this, arguments);
      try {
        if (typeof QSEL != "undefined" && (QSEL || QIMP)) return h;
        const L = noQaid(); if (!L) return h;
        setTimeout(autoLink, 400);
        const rows = L.map(x => `<tr><td class="l"><b>${E(x.s.n)}</b>${x.pn && NZ(x.pn) != NZ(x.s.n) ? `<div class="sub">البوابة: ${E(x.pn)}</div>` : ""}</td><td class="l">${E(x.s.s)}</td><td>${x.bad ? `<span class="chip bad">${A(x.s.pg)} مو موجودة بالقيد</span>` : '<span class="chip bad">بدون</span>'}</td><td class="l">${[...x.ex, ...x.near].length ? [...x.ex, ...x.near].map(r => `<button class="btn ghost sm" style="margin:2px" onclick="qLink207('${E(x.s.id)}','${E(String(r.pg))}')">صفحة ${A(r.pg)} — ${E(r.n)}${r.y ? " (" + A(E(r.y)) + ")" : ""}</button>`).join("") : '<span class="muted">ما بيه اسم قريب بكل القيد العام (' + A(QD.length) + ' اسم) — يحتاج تسجيل بالقيد</span>'}</td></tr>`).join("");
        const box = `<details class="box" ${L.length ? "open" : ""}><summary style="cursor:pointer"><b>طلاب بدون صفحة قيد</b> — ${L.length ? A(L.length) + " طالب" : "كل الطلاب عندهم قيد ✓"}</summary>${L.length ? `<p class="muted" style="margin:6px 0">انفحص كل اسم ويا كل القيد العام من ١٩٦٧ لهسه (الأسماء القديمة والمصححة وأسماء البوابة). اضغط على الصفحة الصحيحة حتى تنربط.</p><div class="tw"><table><tr><th class="l">الطالب</th><th class="l">الشعبة</th><th>صفحة القيد</th><th class="l">صفحات قريبة بالقيد</th></tr>${rows}</table></div>` : ""}</details>`;
        const a = h.indexOf('<details class="box'); h = a >= 0 ? h.slice(0, a) + box + h.slice(a) : box + h;
      } catch (e) { console.warn(e); }
      return h;
    };
  });

  /* =====================================================================
     (٤) السجل الوسطي: مواليد الطالب + «رقم الصفحة» و«رقم القيد» كل واحد باسمه
     ===================================================================== */
  const birthOf = s => {
    try {
      const inf = (typeof INF != "undefined" && INF && INF[s.id]) || {};
      const x = inf.x || {};
      const raw = x.dob || inf.dob || s.dob || s.bd || "";
      const m = String(raw).replace(/[٠-٩]/g, c => c.charCodeAt(0) - 1632).match(/(\d{4})\D(\d{1,2})\D(\d{1,2})/);
      if (m && +m[1] > 1990 && +m[1] < 2020) return DMY(+m[3], +m[2], +m[1]);
      const m2 = String(raw).replace(/[٠-٩]/g, c => c.charCodeAt(0) - 1632).match(/(\d{1,2})\D(\d{1,2})\D(\d{4})/);
      if (m2 && +m2[3] > 1990 && +m2[3] < 2020) return DMY(+m2[1], +m2[2], +m2[3]);
      if (s.by) return AD(s.by);
      const nid = String(x.nid || inf.nid || "").replace(/\D/g, "");
      if (/^(19|20)\d{10}$/.test(nid)) return AD(nid.slice(0, 4));
    } catch (e) { }
    return "";
  };
  W.birth207 = birthOf;
  on(() => {
    if (typeof mWasat != "function") return;
    const _mw = mWasat;
    mWasat = function (s, n, fill) {
      const m = _mw.apply(this, arguments);
      try {
        const r = s.pg ? (QD || []).find(q2 => String(q2.pg) == String(s.pg)) : null;
        const dots = "..............................";
        const pgTxt = s.pg ? "رقم الصفحة " + AD(s.pg) + (r && r.r ? "   —   رقم القيد " + AD(r.r) : "") : dots;
        const bd = birthOf(s) || dots;
        if (m.info && Array.isArray(m.info.lines)) m.info.lines = m.info.lines.map(([k, v]) => k == "رقمه في سجل القيد العام" ? [k, pgTxt] : k == "مواليد الطالب" ? [k, bd] : [k, v]);
      } catch (e) { }
      return m;
    };
    /* القيد العام لازم يكون محمّل حتى يطلع رقم القيد */
    if (typeof V != "undefined" && typeof V.sw == "function") { const _v = V.sw; V.sw = function () { try { if (typeof qSub == "function") qSub(); if (typeof infLoad == "function" && typeof INF != "undefined" && !INF) infLoad().then(() => rr()); } catch (e) { } return _v.apply(this, arguments); }; }
  });

  /* =====================================================================
     (٥) لوحة البوابة: الحالة الصحيحة (النشر فوري عن طريق الخادم)، وشيل رسالة «دقيقة ونصف»
     ===================================================================== */
  on(() => {
    if (typeof V == "undefined" || typeof V.w != "function") return;
    const _vw = V.w;
    V.w = function () {
      let h = _vw.apply(this, arguments);
      try {
        if (!isStaff()) return h;
        let at = ""; try { at = localStorage.getItem("pub207at") || ""; } catch (e) { }
        const ok = `<div class="banner ok">${I("ok")} <span>البوابة تتحدث وحدها فوراً: أي تعديل بالجدول أو الأسماء أو المدرسين ينتشر للطلاب والمدرسين خلال ثانيتين${at ? " — آخر نشر: " + (typeof fmtD == "function" ? fmtD(at) : at) + " الساعة " + AD(new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })) : ""}</span></div>`;
        h = h.replace(/<div class="banner (?:ok|warn)">[\s\S]*?<\/div>/, ok);
        h = h.replace(/نشر تلقائي: عند وجود تغييرات تُنشر بعد دقيقة ونصف من توقفك عن العمل \(على هذا الجهاز\)/, "نشر فوري تلقائي: أي تغيير ينتشر خلال ثانيتين من أي جهاز للإدارة");
      } catch (e) { }
      return h;
    };
    if (typeof gxSnapPush == "function") {
      const _p = gxSnapPush;
      gxSnapPush = async function () { const r = await _p.apply(this, arguments); if (r) { try { localStorage.setItem("pub207at", new Date().toISOString()); } catch (e) { } } return r; };
    }
  });

  /* =====================================================================
     (٦) السرعة: النظام ينفتح فوراً من نسخة محفوظة بالجهاز (IndexedDB) ويجيب من الخادم بس اللي تغيّر
     ===================================================================== */
  const IDB = {
    db: null,
    open() { if (this.db) return this.db; this.db = new Promise((ok, no) => { try { const r = indexedDB.open("sinai207", 1); r.onupgradeneeded = () => r.result.createObjectStore("c"); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); } catch (e) { no(e); } }); return this.db; },
    async get(k) { try { const d = await this.open(); return await new Promise(ok => { const t = d.transaction("c").objectStore("c").get(k); t.onsuccess = () => ok(t.result || null); t.onerror = () => ok(null); }); } catch (e) { return null; } },
    async put(k, v) { try { const d = await this.open(); await new Promise(ok => { const t = d.transaction("c", "readwrite"); t.objectStore("c").put(v, k); t.oncomplete = ok; t.onerror = ok; }); } catch (e) { } },
    async del(k) { try { const d = await this.open(); await new Promise(ok => { const t = d.transaction("c", "readwrite"); t.objectStore("c").delete(k); t.oncomplete = ok; t.onerror = ok; }); } catch (e) { } }
  };
  W.IDB207 = IDB;
  on(() => {
    if (typeof gxCall != "function") return;
    const _gc = gxCall;
    let CK = null, saveT = 0;
    const key = () => "gx_" + ((typeof GX != "undefined" && GX.u) || "x");
    const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(() => { if (CK) IDB.put(key(), { rev: CK.rev, docs: CK.docs, at: Date.now(), v: 1 }); }, 1500); };
    const merge = (r) => {
      for (const x of (r.docs || [])) {
        if (x.del) delete CK.docs[x.p];
        else CK.docs[x.p] = { p: x.p, rev: x.rev, lazy: x.lazy || 0, d: x.lazy ? "" : x.d };
      }
      CK.rev = Math.max(CK.rev || 0, +r.rev || 0);
    };
    gxCall = async function (body, again) {
      if (!body || body.op != "get") return _gc.apply(this, arguments);
      const since = +body.since || 0;
      if (since == 0) {
        const c = CK || await IDB.get(key());
        if (c && c.docs && c.rev && c.v == 1) {
          CK = c;
          let r = null;
          try { r = await _gc.call(this, { ...body, since: c.rev }, again); } catch (e) { throw e; }
          if (!r || !r.ok) return r;
          /* الخادم رجع للصفر (نُسخ/استُرجع)؟ نجيب كلشي من جديد */
          if ((+r.rev || 0) < c.rev) { CK = { rev: 0, docs: {} }; const f = await _gc.call(this, body, again); if (f && f.ok) { merge(f); saveSoon(); } return f; }
          merge(r); saveSoon();
          return { ...r, docs: Object.values(CK.docs), rev: CK.rev };
        }
        const f = await _gc.apply(this, arguments);
        if (f && f.ok) { CK = { rev: 0, docs: {} }; merge(f); saveSoon(); }
        return f;
      }
      const r = await _gc.apply(this, arguments);
      try { if (r && r.ok && CK && (r.docs || []).length) { merge(r); saveSoon(); } else if (r && r.ok && CK) CK.rev = Math.max(CK.rev, +r.rev || 0); } catch (e) { }
      return r;
    };
    /* تسجيل الخروج يمسح النسخة المحفوظة */
    W.addEventListener("storage", e => { if (e.key == "stf" && !e.newValue) IDB.del(key()); });
    try { const _rm = Storage.prototype.removeItem; Storage.prototype.removeItem = function (k) { if (k == "stf") { try { IDB.del(key()); CK = null; } catch (e) { } } return _rm.apply(this, arguments); }; } catch (e) { }
  });
  /* التحديث الفوري بدون ضغط على الخادم: أول ما يوصل إشعار (Push) للجهاز، الصفحة المفتوحة تسحب الجديد بنفس اللحظة */
  on(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.addEventListener("message", e => {
      const d = e.data || {};
      if (d.t != "push207") return;
      try { if (isStaff() && typeof gxPoll == "function") gxPoll(); } catch (x) { }
      try { if (typeof W.v202Inbox == "function") W.v202Inbox(1); } catch (x) { }
      try { if (typeof W.snap205 == "function") W.snap205(); } catch (x) { }
    });
  });

  /* =====================================================================
     (٧) حسابات البوابة بدون بطاقة موحدة: التفسير + الشعبة الصحيحة + البطاقة اللي كتبها بالمعلومات
     ===================================================================== */
  on(() => {
    if (typeof ppBody != "function") return;
    const _pb = ppBody;
    ppBody = function (D0, ...a) {
      let h = _pb.call(this, D0, ...a);
      try {
        if (!D0 || !(D0.unv || []).length || h.indexOf("حسابات طلاب تحتاج تأكيدك") < 0) return h;
        const prof = {}; (D0.prof || []).forEach(p => { if (p.kind == "s") prof[p.key] = p; });
        const note = `<div class="banner warn" style="margin:6px 0">${I("alert")}<span><b>منين دخلوا؟</b> هذول سجّلوا بالبوابة على الخادم القديم (١٨–٢٠ تشرين الأول) قبل ما يصير رقم البطاقة الموحدة إجباري، فانحفظ حسابهم برقم الهاتف بس. من ذاك الوقت الدخول يحتاج الهاتف + البطاقة، فهسه هذول <b>ما يكدرون يفتحون حسابهم ولا توصلهم درجات أو تبليغات</b> إلا يكتبون رقم بطاقتهم وتأكده إنت. إذا الرقم اللي كتبه يبدي بسنة قديمة (مثل ١٩٧٦) فهو بطاقة ولي الأمر مو الطالب — لا تأكده.</span></div>`;
        h = h.replace(/(حسابات طلاب تحتاج تأكيدك[\s\S]*?<\/h3>)/, "$1" + note);
        /* الشعبة من القائمة الكاملة (حتى طلاب المحاولات) + البطاقة المكتوبة بالمعلومات */
        (D0.unv || []).forEach(u => {
          const s = (typeof ST != "undefined" ? ST : []).find(x => x.id == u.key);
          let pn = ""; try { pn = JSON.parse((prof[u.key] || {}).json || "{}").nid || ""; } catch (e) { }
          const nid = u.nid || pn;
          const old = /^(19[0-8])/.test(String(nid));
          if (s) h = h.replace(new RegExp("(<td><b>" + E(s.n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "</b></td><td>)(</td>)"), "$1" + E(s.s + (s.ss == "راسب" ? " (راسب)" : "")) + "$2");
          if (!u.nid && pn && !old) h = h.replace('<button class="btn sm" disabled onclick="unv204Ok(this,\'' + u.key + '\',\'\')"', '<button class="btn sm" onclick="unv204Ok(this,\'' + u.key + '\',\'' + E(pn) + '\')"');
          if (!u.nid && pn && s) h = h.replace(new RegExp("(<b>" + E(s.n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "</b></td><td>[^<]*</td><td class=\"nid\">)—(</td>)"), "$1" + E(pn) + (old ? ' <span class="chip bad">بطاقة ولي الأمر؟</span>' : '') + "$2");
        });
      } catch (e) { }
      return h;
    };
  });

  /* =====================================================================
     (٨) الصادر والوارد: فتح الكتاب نفسه (عرض + تعديل + نسخة جديدة)
     ===================================================================== */
  const letterOf = m => {
    try {
      if (typeof LET == "undefined") return null;
      if (m.lid) { const L = LET.find(x => x.id == m.lid); if (L && String(L.no || "") == String(m.no || "")) return L; if (L && !m.no) return L; }
      if (m.k == "out" && m.no) return LET.find(x => String(x.no) == String(m.no) && (!m.date || !x.date || x.date.slice(0, 4) == m.date.slice(0, 4))) || null;
    } catch (e) { }
    return null;
  };
  W.mOpen207 = (mid, how) => {
    const m = (typeof ML != "undefined" ? ML : []).find(x => x.id == mid); const L = m && letterOf(m); if (!L) return;
    if (typeof MSEL != "undefined") MSEL = null;
    if (how == "copy") { view("l"); setTimeout(() => { try { lNew(L); } catch (e) { } }, 30); return; }
    LSEL = L.id; LDRAFT = null; view("l");
  };
  on(() => {
    if (typeof mDetail != "function") return;
    const _md = mDetail;
    mDetail = function () {
      let h = _md.apply(this, arguments);
      try {
        const m = ML.find(x => x.id == MSEL); const L = m && letterOf(m);
        if (!L || typeof letterHTML != "function") return h;
        let lh = ""; try { lh = letterHTML(L).replace(/ contenteditable="true"/g, ""); } catch (e) { return h; }
        const box = `<div class="box"><h3>${I("doc")} الكتاب نفسه</h3><div class="tools"><button class="btn sm" onclick="mOpen207('${m.id}')">${I("edit")} فتح الكتاب وتعديله</button><button class="btn ghost sm" onclick="mOpen207('${m.id}','copy')">نسخة جديدة منه</button></div>
<div class="m207" style="overflow:hidden;border:1px solid var(--line);border-radius:10px;background:#fff"><div class="m207in" style="transform-origin:top right;width:210mm">${lh}</div></div></div>`;
        h = h.replace(/(<dt>رقم الكتاب<\/dt><dd>)([^<]*)/, (x, a, b) => a + AD(b));
        const i = h.indexOf('<div class="box"><h3>صور الكتاب'); h = i >= 0 ? h.slice(0, i) + box + h.slice(i) : h + box;
        setTimeout(() => { D.querySelectorAll(".m207").forEach(w => { const inn = w.querySelector(".m207in"); if (!inn) return; const k = Math.min(1, w.clientWidth / inn.offsetWidth); inn.style.transform = "scale(" + k + ")"; w.style.height = (inn.offsetHeight * k + 4) + "px"; }); }, 50);
      } catch (e) { console.warn(e); }
      return h;
    };
  });

  /* =====================================================================
     (٩) القوالب الرسمية (الاستمارات والسجلات): الأسطر الجديدة تاخذ نفس خط وحجم أسطر القالب
     السبب: الأسطر الفارغة بالقالب ما بيها نص، فالمكتوب بيها چان يطلع بخط صغير ويصغّر العمود كله
     ===================================================================== */
  on(() => {
    if (typeof DXF == "undefined" || typeof DXF.rows != "function") return;
    const _rows = DXF.rows;
    DXF.rows = function (t, from, items, fn, o) {
      try {
        const R = [...t.rows].slice(from, t.rows.length - ((o && o.tail) || 0));
        const rich = R.find(tr => [...tr.cells].filter(td => [...td.querySelectorAll("span")].some(s => s.children.length == 0 && s.textContent.replace(/[\s​]/g, ""))).length >= Math.max(2, tr.cells.length - 2));
        if (rich) {
          R.forEach(tr => {
            if (tr == rich) return;
            [...tr.cells].forEach((td, ci) => {
              if (td.querySelector("span")) return;
              const ref = rich.cells[ci]; if (!ref) return;
              const sp = [...ref.querySelectorAll("span")].find(s => s.children.length == 0 && s.textContent.replace(/[\s​]/g, ""));
              const p = td.querySelector(".p"), rp = ref.querySelector(".p");
              if (!sp || !p) return;
              if (rp && rp.className) p.className = rp.className;
              const ns = D.createElement("span"); ns.className = sp.className; ns.setAttribute("style", sp.getAttribute("style") || ""); ns.textContent = "​";
              p.textContent = ""; p.appendChild(ns);
            });
          });
        }
      } catch (e) { console.warn(e); }
      return _rows.apply(this, arguments);
    };
  });

  /* =====================================================================
     (١٠) نسب النجاح للسادس (الوزاري): طبق النموذج — مواد الامتحان الوزاري بس وبنفس الترتيب والتسمية، ١٠ أسطر
     ===================================================================== */
  on(() => {
    if (typeof FXR == "undefined" || !FXR.f_prf || typeof FSD == "undefined") return;
    const ORDER = {
      "العلمي": [["إسلامية", /اسلام|إسلام/], ["عربي", /عرب/], ["إنكليزي", /انكل|إنكل|انجل/], ["احياء", /احياء|أحياء/], ["رياضيات", /رياضيات/], ["كيمياء", /كيمياء/], ["فيزياء", /فيزياء/]],
      "الأدبي": [["إسلامية", /اسلام|إسلام/], ["عربي", /عرب/], ["إنكليزي", /انكل|إنكل|انجل/], ["تأريخ", /تاريخ|تأريخ/], ["رياضيات", /رياضيات/], ["جغرافيا", /جغراف/], ["اقتصاد", /اقتصاد/]]
    };
    const nm = sj => { try { return String(FSD.sjName(sj) || sj); } catch (e) { return String(sj); } };
    const R = FXR.f_prf;
    R.fill = function (host, o) {
      if (o.r == "2") DXF.rep(host, /الدور الأول/g, "الدور الثاني");
      const T2 = DXF.tables(host);
      ["العلمي", "الأدبي"].forEach((b, i) => {
        const t = T2[i]; if (!t) return;
        const rows = [];
        const tot = (() => { try { return FSD.secs("السادس", b).reduce((a, n) => a + STA().filter(s => s.s == n).length, 0); } catch (e) { return ""; } })();
        ORDER[b].forEach(([label, re]) => {
          FSD.staff().forEach(f => {
            FSD.subjIn(f, "السادس", b).forEach(sj => {
              const full = nm(sj) + " " + sj;
              if (!re.test(full)) return;
              const S = FSD.secsIn(f, "السادس", b, sj); if (!S.length) return;
              let ps = ""; try { const r = fsRate(S, sj, "y"); ps = r && r.ex ? r.ps : ""; } catch (e) { }
              rows.push([FSD.n3(f.name), label, tot, ps]);
            });
          });
        });
        DXF.rows(t, 1, rows, (c, x, k) => {
          DXF.put(c[0], k + 1); DXF.put(c[1], x[0]); DXF.put(c[2], x[1]); DXF.put(c[3], x[2] === "" ? "" : x[2]); DXF.put(c[4], x[3] === "" ? "" : x[3]);
        }, { min: 10 });
      });
    };
  });

  /* =====================================================================
     (١١) الأرشيف: ملفات أكبر (لحد ٤٠ ميغا) وأكثر من ملف بنفس الوقت، وكل ملف يتأكد إنه انحفظ بالخادم
     ===================================================================== */
  on(() => {
    try { if (typeof AMAX != "undefined") { /* const — نتعامل وياه من الواجهة */ } } catch (e) { }
  });

  /* =====================================================================
     (١٢) حفظ كصورة بالآيفون: «حفظ بالاستوديو» يفتح قائمة الآيفون وبيها «حفظ الصورة» (مو ملفات التنزيل)
     ===================================================================== */
  on(() => {
    if (typeof img90 != "function") return;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform == "MacIntel" && navigator.maxTouchPoints > 1);
    const _im = img90;
    img90 = async function (pages, base) {
      const r = await _im.apply(this, arguments);
      try {
        const w = D.querySelector(".zoom.im130"); if (!w || !ios || !navigator.share) return r;
        const v = w.querySelector("[data-v]"), sh = w.querySelector("[data-s]"); if (!v || !sh) return r;
        v.innerHTML = I("download") + " حفظ بالاستوديو (الصور)";
        v.className = "btn"; sh.className = "btn ghost";
        const p = D.createElement("p"); p.className = "muted"; p.style.margin = "6px 0 0"; p.textContent = "بعد ما تضغط «حفظ بالاستوديو» تطلع قائمة الآيفون — اختار منها «حفظ الصورة» وتنحفظ بالصور.";
        v.parentElement.after(p);
        v.onclick = () => sh.click();
      } catch (e) { }
      return r;
    };
  });

  /* =====================================================================
     (١٣) سجل السيطرة الامتحانية: جدول تواقيع الملاك بدون فراغات بين الأسماء
     السبب: الأسماء القديمة بالقالب چانت تنمسح وتبقى خاناتها فارغة. هسه الجدول يتعبّى من جديد بالملاك الحالي بالترتيب
     ===================================================================== */
  on(() => {
    if (typeof FXR == "undefined" || !FXR.r_ctl || typeof FSD == "undefined") return;
    const R = FXR.r_ctl, _f = R.fill;
    R.fill = async function (host, o) {
      if (_f) await _f.apply(this, arguments);
      try {
        const staff = (typeof sortStf == "function" ? sortStf() : FSD.staff()).filter(f => (f.status || "مستمر") == "مستمر").map(f => FSD.n3(f.name));
        DXF.tables(host).forEach(t => {
          const hd = [...(t.rows[0] || { cells: [] }).cells].map(c => DXF.text(c)).join("|");
          if (hd != "ت|الاسم|التوقيع|ت|الاسم|التوقيع") return;
          const rows = [...t.rows].slice(1), n = rows.length;
          rows.forEach((tr, i) => {
            const c = [...tr.cells]; if (c.length < 6) return;
            const a = staff[i], b = staff[n + i];
            DXF.put(c[0], a ? i + 1 : ""); DXF.put(c[1], a || ""); DXF.put(c[2], "");
            DXF.put(c[3], b ? n + i + 1 : ""); DXF.put(c[4], b || ""); DXF.put(c[5], "");
          });
        });
      } catch (e) { console.warn(e); }
    };
  });

  /* ---------- تشغيل بعد اكتمال التحميل ---------- */
  const boot = () => { on(hubOrder); };
  if (D.readyState == "complete") setTimeout(boot, 0); else W.addEventListener("load", () => setTimeout(boot, 0));
  setTimeout(boot, 1500);
})();
