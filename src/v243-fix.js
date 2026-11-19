/* ===== v243 (2026-11-19، طلبات المستخدم) =====
   ١) الكتب: «الصف» = الصف والفرع بدون الشعبة («السادس الأدبي» مو «السادس الأدبي ب») — gr243 (الاستبدال داخل tplFill/lPick/awLetter بـ tools/inject243.py).
   ٢) الكتب: اسم الموقِّع (المدير / وكالةً) ينعدل مباشرة على ورقة الكتاب — sig243 يرسم سطور التوقيع قابلة للتعديل (data-k="sig")، والقيمة تنحفظ بالكتاب (L.sig) وتطلع بالطباعة/PDF/Word.
   ٣) القيد العام: إضافة/تعديل اسم ← ربط فوري بالطالب بقوائم الأسماء (رقم الصفحة s.pg) إذا الاسم مطابق لطالب ما عنده قيد.
   ٤) إحصائية الشهادات: «ابتدائية» و«متوسطة» بدل «أخرى». */
(function () {
  "use strict";
  const W = window;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v243", e); } };
  const E = s => typeof esc == "function" ? esc(s) : String(s == null ? "" : s);

  /* ---------- ٢) التوقيع قابل للتعديل ---------- */
  W.sig243 = function (sigL, L) {
    try {
      const lines = typeof stIns == "function" ? stIns(sigL) : sigL;
      const src = (L && L.sig != null ? L.sig : (typeof L_SIG != "undefined" ? L_SIG : ""));
      const n = String(src || "").split("\n").filter(x => x.trim()).length;
      const ins = lines.length > sigL.length ? 1 : 0;
      const k = Math.min(lines.length, n + (n >= 2 ? ins : 0));
      const h = t => t ? E(t) : "&nbsp;";
      const head = lines.slice(0, k).map(h).join("<br>"), tail = lines.slice(k).map(h).join("<br>");
      return `<span contenteditable="true" data-k="sig" spellcheck="false" title="اضغط لتعديل اسم الموقِّع (مثلاً: المدير وكالةً)">${head}</span>${tail ? "<br>" + tail : ""}`;
    } catch (e) { return (sigL || []).map(t => t ? E(t) : "&nbsp;").join("<br>"); }
  };
  on(() => {
    if (typeof eIn != "function") return;
    const _e = eIn;
    eIn = function (el) {
      try {
        if (el && el.dataset && el.dataset.k == "sig" && typeof LDRAFT != "undefined" && LDRAFT && !LDRAFT.td) {
          const t = el.innerText.replace(/‏/g, "").replace(/ /g, " ");
          const v = t.split(/\n/).map(x => x.trim()).filter(Boolean).join("\n");
          LDRAFT.sig = v || " ";
          return;
        }
      } catch (e) { }
      return _e.apply(this, arguments);
    };
  });
  /* Enter بسطر التوقيع = سطر جديد (مثل نص الكتاب) */
  document.addEventListener("keydown", e => {
    const el = e.target && e.target.closest ? e.target.closest('#lprev [data-k="sig"]') : null;
    if (el && e.key == "Enter" && !e.shiftKey) { e.preventDefault(); try { document.execCommand("insertLineBreak"); } catch (x) { } try { eIn(el); } catch (x) { } }
  }, true);

  /* ---------- ٣) القيد العام ← قوائم الأسماء فوراً ---------- */
  const NZ = s => String(s || "").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim().replace(/(^|\s)(عبد|ابو)\s+/g, "$1$2");
  const pgK = v => String(v == null ? "" : v).replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/\D/g, "");
  const pName = s => { try { const x = (typeof INF != "undefined" && INF && INF[s.id] && INF[s.id].x) || null; return x ? [x.n1, x.n2, x.n3, x.n4].filter(Boolean).join(" ") : ""; } catch (e) { return ""; } };
  function link243(r) {
    if (!r || !r.pg || typeof ST == "undefined" || typeof QD == "undefined") return 0;
    const k = pgK(r.pg);
    if (ST.some(s => pgK(s.pg) == k)) return 0; /* مربوطة أصلاً */
    const have = new Set(QD.map(x => pgK(x.pg)));
    const free = ST.filter(s => !s.x && s.ss != "مفصول" && !(pgK(s.pg) && have.has(pgK(s.pg)) && pgK(s.pg) != k));
    const ex = free.filter(s => NZ(s.n) == NZ(r.n) || (pName(s) && NZ(pName(s)) == NZ(r.n)));
    if (ex.length == 1) {
      ex[0].pg = String(r.pg);
      try { if (typeof STV != "undefined") STV++; } catch (e) { }
      try { P.st(); } catch (e) { }
      try { toast("رُبط بالطالب «" + ex[0].n + "» — " + ex[0].s + " (رقم الصفحة " + (typeof toAr == "function" ? toAr(r.pg) : r.pg) + ")"); } catch (e) { }
      return 1;
    }
    if (ex.length > 1) { try { toast("يوجد أكثر من طالب بهذا الاسم في القوائم — اربطه يدوياً من «طلاب بدون صفحة قيد»", "err"); } catch (e) { } }
    return 0;
  }
  W.link243 = link243;
  on(() => {
    if (typeof qAdd == "function") {
      const _a = qAdd;
      qAdd = function () {
        const before = typeof QD != "undefined" ? new Set(QD.map(x => x.i)) : null;
        const r0 = _a.apply(this, arguments);
        on(() => { if (!before) return; const nw = QD.filter(x => !before.has(x.i)); nw.forEach(link243); });
        return r0;
      };
    }
    if (typeof qSave == "function") {
      const _s = qSave;
      qSave = function (id) {
        const r0 = _s.apply(this, arguments);
        on(() => { const r = QD.find(x => x.i == id); if (r) link243(r); });
        return r0;
      };
    }
  });
  /* ---------- ٥) الدرجة أقل من النصف حمراء فعلاً (تنسيق الجداول كان يغلب لون .red) ---------- */
  on(() => { const st = document.createElement("style"); st.id = "css243"; st.textContent = "td.red,td.red b,td.red span,.tw td.red,.tw td.red b,input.red235{color:#c62828!important}"; document.head.appendChild(st); });

  /* ---------- ٦) v243c: الاسم ورقم الصفحة بين قوائم الطلاب والقيد العام (طلب المستخدم) ----------
     - تعديل اسم طالب بالقوائم ← اسمه بسجل القيد المربوط (نفس رقم الصفحة، سجل واحد) يتعدل فوراً (قرار «اسم الصف» حتى الخادم ما يرجّعه).
     - تعديل رقم الصفحة للطالب بالقوائم (أ ← ب): إذا ماكو سجل بالصفحة ب، سجله القديم (أ) ينتقل لـ ب بشرط ما مربوط بطالب ثاني.
     - تعديل رقم الصفحة بسجل القيد (أ ← ب): الطالب المربوط بـ أ يصير ب. */
  const SNAP243 = new Map();
  const snap = () => { try { (typeof ST != "undefined" ? ST : []).forEach(x => SNAP243.set(x.id, { n: x.n, pg: pgK(x.pg) })); } catch (e) { } };
  const PEND = [];
  const qReady = () => typeof QD != "undefined" && QD.length && (typeof QREADY == "undefined" || QREADY);
  function applyQ() {
    if (!PEND.length) return;
    if (!qReady()) { try { if (typeof qSub == "function") qSub(); } catch (e) { } return setTimeout(applyQ, 1500); }
    const touched = new Set(), log = [];
    while (PEND.length) {
      const c = PEND.shift(); const st = (ST || []).find(x => x.id == c.id); if (!st) continue;
      if (c.n && c.pg) {
        const L = QD.filter(r => pgK(r.pg) == c.pg); if (L.length != 1) continue;
        const r = L[0]; if (r.n == st.n) continue;
        log.push({ i: r.i, pg: r.pg, old: r.n, nw: st.n, sid: st.id, at: new Date().toISOString(), why: "اسم الصف" });
        r.n = st.n; r.lk = "اسم الصف"; r.lkt = Date.now(); delete r._k; touched.add(r.c);
      }
      if (c.from && c.to) {
        if (QD.some(r => pgK(r.pg) == c.to)) continue;
        if ((ST || []).some(x => x.id != st.id && pgK(x.pg) == c.from)) continue;
        const L = QD.filter(r => pgK(r.pg) == c.from); if (L.length != 1) continue;
        L[0].pg = c.to; delete L[0]._k; touched.add(L[0].c);
      }
    }
    if (!touched.size) return;
    try { if (typeof qSort == "function") qSort(); } catch (e) { }
    touched.forEach(c => { try { qSaveChunk(c); } catch (e) { } });
    if (log.length) on(async () => { try { const ref = DB.doc("school/qfix205"); const d = await ref.get(); const L = (d.exists ? (d.data() || {}).list : []) || []; await ref.set({ list: L.concat(log).slice(-2000) }); } catch (e) { } });
    try { toast("تحدّث القيد العام تلقائياً (" + (typeof toAr == "function" ? toAr(touched.size) : touched.size) + ")"); } catch (e) { }
  }
  function wrapSt() {
    if (typeof P == "undefined" || !P || typeof P.st != "function") return false;
    if (P.st._v243) return true;
    const _st = P.st;
    P.st = function () {
      on(() => {
        if (!SNAP243.size) return;
        (ST || []).forEach(x => {
          const o = SNAP243.get(x.id); if (!o) return;
          const pg = pgK(x.pg), c = { id: x.id };
          if (o.n != x.n && pg && pg == o.pg) { c.n = 1; c.pg = pg; }
          if (o.pg && pg && o.pg != pg) { c.from = o.pg; c.to = pg; }
          if (c.n || c.from) PEND.push(c);
        });
      });
      const r = _st.apply(this, arguments);
      snap(); if (PEND.length) setTimeout(applyQ, 300);
      return r;
    };
    P.st._v243 = 1; return true;
  }
  setInterval(() => { if (!SNAP243.size && typeof ST != "undefined" && ST.length) snap(); wrapSt(); }, 2000);
  /* البيانات توصل من جهاز ثاني: نحدّث الصورة المحفوظة حتى ما نحسبها تعديل محلي */
  on(() => { if (typeof refresh == "function") { const _r = refresh; refresh = function () { const r = _r.apply(this, arguments); try { if (!PEND.length) snap(); } catch (e) { } return r; }; } });
  on(() => {
    if (typeof qSave != "function") return;
    const _q = qSave;
    qSave = function (id) {
      let old = ""; on(() => { const r = QD.find(x => x.i == id); if (r) old = pgK(r.pg); });
      const r0 = _q.apply(this, arguments);
      on(() => {
        const r = QD.find(x => x.i == id); const nw = r ? pgK(r.pg) : "";
        if (!old || !nw || old == nw) return;
        const L = (ST || []).filter(x => pgK(x.pg) == old); if (!L.length) return;
        L.forEach(x => { x.pg = nw; }); try { if (typeof STV != "undefined") STV++; } catch (e) { }
        snap(); try { P.st(); } catch (e) { }
        try { toast("تحدّث رقم الصفحة بقوائم الطلاب (" + L.map(x => x.n).join("، ") + ")"); } catch (e) { }
      });
      return r0;
    };
  });
})();
