/* ===== v217 (2026-11-07) — سرعة لوحة «حسابات وتبليغات البوابة» =====
   قبل: كل ٢٠–٣٠ ثانية (وبكل فتح وبعد كل عملية) الجهاز يسحب كل الحسابات والمعلومات والتبليغات والمشاهدات (~١ م.ب)
   من أكثر من مكان بنفس الوقت — فالنظام يثقل والتحديث يتأخر.
   هسه: أي سحب (op:"pull") يمر من هنا: الطلبات المتزامنة تصير طلب واحد، والجهاز يرسل بصمات اللي عنده
   والخادم يرجع بس الأجزاء اللي تغيّرت (عادةً بضع كيلوبايت). */
(function () {
  const W = window;
  if (W.__v217) return; W.__v217 = 1;
  const SEC = ["acc", "prof", "notes", "seen"], ONE = ["reports", "unv", "nids", "rel", "tgc"];
  let ST = null;            /* { h:{…}, bk:{acc:[[…]…], prof:…, notes:…, seen:[{…}…]}, one:{…} } */
  try { const x = JSON.parse(localStorage.getItem("pull217") || "null"); if (x && x.h && x.bk) ST = x; } catch (e) { }
  const save = () => { try { localStorage.setItem("pull217", JSON.stringify(ST)); } catch (e) { try { localStorage.removeItem("pull217"); } catch (x) { } } };
  function build() {
    const o = { ok: 1, sheet: "", v217: 1 };
    for (const k of ["acc", "prof", "notes"]) o[k] = [].concat(...ST.bk[k].map(x => x || []));
    o.notes.sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
    o.seen = Object.assign({}, ...ST.bk.seen.map(x => x || {}));
    for (const k of ONE) o[k] = ST.one[k];
    return o;
  }
  function merge(r) {
    if (!ST) ST = { h: {}, bk: {}, one: {} };
    let ch = 0;
    for (const k of SEC) {
      const B = (ST.bk[k] = ST.bk[k] || []);
      for (const i in (r.bk || {})[k] || {}) { B[i] = r.bk[k][i]; ch = 1; }
      for (let i = 0; i < 16; i++) if (B[i] == null) B[i] = k == "seen" ? {} : [];
      ST.h[k] = r.h[k];
    }
    for (const k of ONE) { if (k in r) { ST.one[k] = r[k]; ch = 1; } ST.h[k] = r.h[k]; }
    if (ch) save();
    const o = build(); o.__same = !ch; return o;
  }
  let RUN = null, LAST = 0, LASTR = null;
  function pull(orig, args) {
    if (RUN) return RUN;                                     /* طلبات بنفس اللحظة = طلب واحد */
    if (LASTR && Date.now() - LAST < 4000) return Promise.resolve(Object.assign({}, LASTR, { __same: 1 }));
    const b0 = Object.assign({}, args[0]);
    b0.hs = ST ? ST.h : {};
    const a = [b0].concat([].slice.call(args, 1));
    RUN = (async () => {
      try {
        const r = await orig.apply(this, a);
        if (!r || !r.ok) return r;
        if (!r.v217) { /* خادم قديم — نفس الشكل القديم */ ST = null; return r; }
        LASTR = merge(r); LAST = Date.now(); return Object.assign({}, LASTR);
      } finally { RUN = null; }
    })();
    return RUN;
  }
  function wrap() {
    if (typeof W.api != "function" || W.api.__v217) return;
    const orig = W.api;
    const f = function (b) {
      try { if (b && b.a == "admin" && b.op == "pull" && !b.hs) return pull.call(this, orig, arguments); } catch (e) { }
      if (b && b.a == "admin" && b.op && b.op != "pull") { LAST = 0; }   /* بعد أي عملية: السحب الجاي يروح للخادم */
      return orig.apply(this, arguments);
    };
    f.__v217 = 1;
    try { W.api = f; (0, eval)("api=window.api"); } catch (e) { }
  }
  wrap();
  addEventListener("load", wrap);
  setTimeout(wrap, 3000); setTimeout(wrap, 15000);
  setInterval(wrap, 60000);
})();

/* ===== v217b — أي تغيير بالطلاب/الشعب/الجدول يوصل للمدرسين والطلاب وحده =====
   قبل: «المعلومات الخاصة» (شعب كل مدرس وأسماء طلابه studs2، معلومات الطالب) ما چانت تنرفع للخادم من رابط المدرسة
   (apiPush انطفى من أيام Google وpush120 بس داخل Claude) — آخر رفع چان 29/10، فالطالب المنقول يبقى عند المدرس.
   هسه: جهاز مدير النظام يرفعها كل ما تتغيّر (بعد أي حفظ خلال ثواني + فحص هادئ كل ٣٠ ثانية)، والمدرس/الطالب
   ياخذها بالفحص الخفيف (inbox) خلال ثواني بدون ما يطلع ويرجع. */
(function () {
  const W = window, D = document;
  if (W.__v217b) return; W.__v217b = 1;
  const LG = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const LS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
  /* ---------- (١) مدير النظام: رفع المعلومات الخاصة ---------- */
  const ready = () => { try { return !!(W.GXOWN && typeof READY != "undefined" && READY.st && READY.stf && READY.cfg && READY.tt && typeof g != "undefined" && g.length && !(typeof STALE != "undefined" && STALE) && !(typeof RO != "undefined" && RO) && typeof apiData == "function"); } catch (e) { return false; } };
  let BUSY = 0, AGAIN = 0, FAIL = 0, SALT0 = 0;
  /* الرواتب تتحمّل بعد الجاهزية بشوية — ما نرفع قبل ما توصل (وإلا «راتبي» يفرغ عند المدرس) */
  const salOk = () => { try { if (typeof salSub != "function") return true; salSub(); if (!SALT0) SALT0 = Date.now(); return !!(typeof SAL != "undefined" && SAL && Object.keys(SAL).length) || Date.now() - SALT0 > 20000; } catch (e) { return true; } };
  async function build() {
    try { if (typeof infLoad == "function") await infLoad(); } catch (e) { }
    const d = apiData();
    /* نفس إضافات push120: معلومات الطالب المعبّأة مسبقاً بالاستمارة (pre) */
    try {
      STA().forEach(s => {
        const i = typeof INF != "undefined" && INF && INF[s.id]; if (!i || !d.s[s.id]) return;
        const x = i.x || {}, pre = {};
        ["n1", "n2", "n3", "n4", "laqab", "m1", "m2", "m3", "dob", "nid", "gphone", "gr", "city", "hay", "mahalla", "zuqaq", "dar", "near", "email"].forEach(k => { if (x[k]) pre[k] = String(x[k]); });
        if (!pre.m1 && i.m && typeof splitName101 == "function") { const m = splitName101(i.m); if (m[0]) pre.m1 = m[0]; if (m[1]) pre.m2 = m[1]; if (m[2]) pre.m3 = m[2]; }
        if (!pre.dob && /^\d{4}-\d{2}-\d{2}$/.test(i.dob || "")) pre.dob = i.dob;
        const nd = digits(String(i.nid || "")).replace(/\D/g, ""); if (!pre.nid && nd.length == 12) pre.nid = nd;
        const gp = digits(String(s.p || "")).replace(/\D/g, ""); if (!pre.gphone && /^07\d{9}$/.test(gp)) pre.gphone = gp;
        if (Object.keys(pre).length) d.s[s.id].pre = Object.assign({}, d.s[s.id].pre || {}, pre);
      });
    } catch (e) { console.warn("v217b pre", e); }
    return d;
  }
  async function push217(force) {
    if (!ready() || !salOk()) return 0;
    if (BUSY) { AGAIN = 1; return 0; }
    BUSY = 1;
    try {
      const d = await build();
      if (!d || !d.s || !d.t || !Object.keys(d.s).length || !Object.keys(d.t).length) return 0;   /* ما نرفع نسخة فارغة أبداً */
      const h = hash(canon([d.s, d.t]));
      if (!force && LG("p217h") == h) return 1;
      const r = await api({ a: "admin", op: "push", data: d });
      if (r && r.ok) { LS("p217h", h); FAIL = 0; return 1; }
      FAIL++;
    } catch (e) { FAIL++; } finally { BUSY = 0; if (AGAIN) { AGAIN = 0; setTimeout(() => push217(), 1500); } }
    return 0;
  }
  W.push217 = push217;
  let PT = 0; const soon = () => { clearTimeout(PT); PT = setTimeout(() => push217(), 2500); };
  W.push217Soon = soon;
  /* بعد أي حفظ ينشر البوابة (الطلاب، الشعب، الجدول، الملاك…) */
  const hook = () => {
    if (typeof W.pub205 == "function" && !W.pub205.__v217) { const _p = W.pub205; const f = function () { const r = _p.apply(this, arguments); soon(); return r; }; f.__v217 = 1; W.pub205 = f; }
  };
  hook(); addEventListener("load", hook); setTimeout(hook, 4000);
  /* أول ما يجهز النظام، وبعدها فحص كل ٢٠ ثانية (يرفع بس إذا تغيّر شي — حتى التعديلات اللي توصل من أجهزة ثانية) */
  const idle = f => (W.requestIdleCallback ? W.requestIdleCallback(f, { timeout: 5000 }) : setTimeout(f, 50));
  setInterval(() => { try { if (!D.hidden || FAIL) idle(() => push217()); } catch (e) { } }, 30000);
  let first = 0; const ft = setInterval(() => { if (ready() && salOk()) { clearInterval(ft); if (!first) { first = 1; push217(); } } }, 3000);

  /* ---------- (٢) البوابة: المدرس والطالب ياخذون المعلومات الجديدة وحدهم ---------- */
  const busyForm = () => {
    try {
      const a = D.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return true;
      if (D.querySelector(".zoom, #pop204, #snd206")) return true;
      const P = D.getElementById("portal"); if (!P) return false;
      for (const el of P.querySelectorAll("input, textarea")) { if (el.type == "hidden" || el.type == "file" || el.type == "checkbox" || el.type == "radio" || el.type == "search") continue; if (el.value !== el.defaultValue) return true; }
    } catch (e) { }
    return false;
  };
  let PEND = 0;
  const redraw = () => { if (!PEND) return; if (busyForm()) return; PEND = 0; try { const y = W.scrollY; prender(); W.scrollTo(0, y); } catch (e) { } };
  setInterval(redraw, 3000);
  const hookIn = () => {
    if (typeof api71 != "function" || api71.__v217) return;
    const _a = api71;
    const f = async function (b) {
      try { if (b && b.a == "inbox" && typeof PS != "undefined" && PS.b) b.pvh = PS.b.__pvh || ""; } catch (e) { }
      const r = await _a.apply(this, arguments);
      try {
        if (r && r.ok && b && b.a == "inbox" && typeof PS != "undefined" && PS.b && r.pvh) {
          if (r.pvch && r.private && typeof r.private == "object") {
            const old = JSON.stringify(PS.b.private || null);
            PS.b.private = r.private; PS.b.__pvh = r.pvh;
            try { psKeep(); } catch (e) { }
            if (old != JSON.stringify(r.private)) { PEND = 1; redraw(); }
          } else PS.b.__pvh = r.pvh;
        }
      } catch (e) { }
      return r;
    };
    f.__v217 = 1;
    try { api71 = f; } catch (e) { }
  };
  hookIn(); addEventListener("load", hookIn); setTimeout(hookIn, 4000); setTimeout(hookIn, 15000);
})();
