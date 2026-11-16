/* ===== v235 (2026-11-16، طلب المستخدم) =====
   ١) أسماء طلاب الانتساب بالأحمر دائماً: كل شاشات النظام وبوابة المدرس، وكل الأوراق المطبوعة/المصدّرة
      (PDF وWord وExcel)، ونموذج مراقب الشعبة، وسجل درجات المدرسين.
   ٢) الدرجة الراسبة بالأحمر في الأوراق التي فيها اسم الطالب ودرجاته (أقل من ٥٠؛ «غ» = صفر).
      القاعدة نفسها (`gRed235`) في بوابة المدرس والطالب ودرجات المدرسين بالإدارة — مكانها سكربت v202.
   لا يغيّر أي بيانات — العرض فقط. */
(function () {
  const W = window, D = document;
  const RED = "#B00020";
  const nk = s => String(s == null ? "" : s).replace(/[ً-ٰٟـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
  let C = { t: 0, s: new Set() };
  /* أسماء طلاب الانتساب: من قائمة الطلبة (الإدارة) أو من نسخة البوابة (المدرس) */
  function ints() {
    const now = Date.now(); if (C.t && now - C.t < 4000) return C.s;
    const S = new Set();
    try { if (typeof STA == "function" && typeof isInt == "function") STA().forEach(s => { try { if (s && s.n && isInt(s)) S.add(nk(s.n)); } catch (e) { } }); } catch (e) { }
    try {
      if (!S.size && typeof SNAP != "undefined" && SNAP && SNAP.ent137 && SNAP.stu)
        SNAP.ent137.forEach((a, s) => (a || []).forEach((f, i) => { const n = (SNAP.stu[s] || [])[i]; if (f && n) S.add(nk(n)); }));
    } catch (e) { }
    C = { t: now, s: S }; return S;
  }
  W.int235 = n => ints().has(nk(n));
  const cellV = c => String(c != null && typeof c == "object" ? (c.v == null ? "" : c.v) : c == null ? "" : c);
  const red = (v, l) => !!(W.gRed235 && W.gRed235(v, l || ""));

  /* ---------- الشاشات ---------- */
  const st = D.createElement("style");
  st.textContent = `.int235{color:${RED}!important}.int235 *{color:${RED}!important}input.red235{color:${RED}!important;font-weight:700}`;
  D.head.appendChild(st);
  const SKIP = "input,textarea,select,option,[contenteditable],#lprev,.lpage,.dxpage,.dxp,#pr221,#lb206,svg,script,style,title";
  const own = () => { try { return typeof PS != "undefined" && PS && PS.kind == "s"; } catch (e) { return false; } };
  function mark(root) {
    if (own()) return;
    const S = ints(); if (!S.size || !root) return;
    const tw = D.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const t = n.nodeValue; if (!t || t.length < 7) continue;
      if (!S.has(nk(t.split(" — ")[0]))) continue;
      const el = n.parentElement;
      if (!el || el.classList.contains("int235") || el.closest(SKIP)) continue;
      el.classList.add("int235");
    }
  }
  let Q = [], qt = 0;
  const flush = () => { qt = 0; const L = Q; Q = []; L.forEach(x => { try { if (x.isConnected) mark(x); } catch (e) { } }); };
  new MutationObserver(ms => {
    ms.forEach(m => m.addedNodes.forEach(x => { if (x.nodeType == 1) Q.push(x); else if (x.nodeType == 3 && x.parentElement) Q.push(x.parentElement); }));
    if (Q.length && !qt) qt = requestAnimationFrame(flush);
  }).observe(D.documentElement, { childList: true, subtree: true });
  const all = () => { try { mark(D.body); } catch (e) { } };
  if (D.readyState == "loading") D.addEventListener("DOMContentLoaded", all); else all();
  setTimeout(all, 2500);

  /* ---------- الأوراق (PDF / Word / Excel / طباعة) ---------- */
  const GH = /الشهر|معدل|نصف السنة|السعي|امتحان|الدرجة|درجة|النهائية|الإكمال/, NOTG = /كتابة|رقم|القيد|الصفحة|المواليد|التولد|الهاتف|عدد|نسبة|النسبة/;
  function markSheet(m) {
    if (!m || !Array.isArray(m.rows) || !m.rows.length) return;
    const S = ints();
    const hi = m.rows.findIndex(r => Array.isArray(r) && r.some(c => c && typeof c == "object" && c.h));
    if (hi < 0) return;
    const hdr = m.rows[hi], H = hdr.map(c => cellV(c).trim());
    const ni = H.findIndex(t => /^(اسم الطالب|اسم الطالبة|الاسم|الطالب|اسم الطالب الرباعي)$/.test(t));
    if (ni < 0) return;
    const merged = hdr.some(c => c && typeof c == "object" && ((c.cs || 1) > 1 || (c.rs || 1) > 1)) || (m.hr || 1) > 1;
    const gi = merged ? [] : H.map((t, i) => GH.test(t) && !NOTG.test(t) && i != ni ? i : -1).filter(i => i >= 0);
    m.rows.forEach((r, ri) => {
      if (ri <= hi || !Array.isArray(r) || r.some(c => c && typeof c == "object" && c.h)) return;
      const box = i => { let c = r[i]; if (c == null || typeof c != "object") { c = { v: c == null ? "" : c }; r[i] = c; } return c; };
      const nm = cellV(r[ni]).trim();
      if (nm && (S.has(nk(nm)) || r.some(c => cellV(c).trim() == "انتساب"))) box(ni).red = 1;
      gi.forEach(i => { if (i < r.length && red(cellV(r[i]))) box(i).red = 1; });
    });
  }
  W.markSheet235 = markSheet;
  const wrapS = name => {
    try {
      const f = (0, eval)(name); if (typeof f != "function" || f.__235) return;
      const nf = function (fmt, nm, sheets) { try { const L = Array.isArray(sheets) ? sheets : Array.isArray(nm) ? nm : null; (L || []).forEach(markSheet); } catch (e) { console.warn("v235", e); } return f.apply(this, arguments); };
      nf.__235 = 1; W.__v235f = nf; (0, eval)(name + "=window.__v235f"); delete W.__v235f;
    } catch (e) { console.warn("v235 wrap", name, e); }
  };
  wrapS("exportSheets"); wrapS("pdfSheets");

  /* ---------- الاستمارات والسجلات المصممة (DX) ---------- */
  const DXN = { r_grd: 1, r_ctl: 1, f_muh: 1 };
  function paint(td) { td.style.color = RED; td.querySelectorAll("*").forEach(e => { e.style.color = RED; }); }
  function dxMark(host, k) {
    const S = ints();
    const T = [...host.querySelectorAll("table")];
    T.forEach(t => [...t.rows].forEach(tr => {
      const cs = [...tr.cells];
      cs.forEach(td => { const tx = nk(td.textContent); if (tx.length > 6 && S.has(tx)) paint(td); });
      /* سجل درجات المدرسين: الأعمدة ٣–٨ (معدل النصف الأول … الدرجة النهائية رقماً) */
      if (k == "r_grd" && cs.length >= 10 && /^[\d٠-٩]+$/.test(cs[0].textContent.trim())) cs.slice(2, 8).forEach(td => { if (red(td.textContent)) paint(td); });
    }));
  }
  const wrapDX = () => {
    try {
      if (typeof FXR == "undefined" || !FXR) return;
      Object.keys(DXN).forEach(k => {
        const F = FXR[k]; if (!F || typeof F.fill != "function" || F.fill.__235) return;
        const f = F.fill;
        const nf = function (host) {
          const r = f.apply(this, arguments);
          const post = () => { try { dxMark(host, k); } catch (e) { console.warn("v235 dx", e); } };
          if (r && typeof r.then == "function") return r.then(x => { post(); return x; });
          post(); return r;
        };
        nf.__235 = 1; F.fill = nf;
      });
    } catch (e) { console.warn("v235", e); }
  };
  wrapDX(); setTimeout(wrapDX, 3000);
})();
