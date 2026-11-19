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
})();
