/* ===== v208 (1 Nov 2026) — معالجة نهائية: الجدول الأسبوعي ما يختفي، تصحيحات القيد العام ما ترجع، أخف وأسرع =====
   (١) الحفظ: كل حفظ يرسل رقم نسخة الملف اللي عند الجهاز (base). جهاز بنسخة قديمة ما يكدر يكتب فوق الأحدث (الخادم يرفض stale)
       — هذا اللي صار: جهاز ثاني بنسخة قديمة حفظ بيانات المدرسين القديمة فوق الجديدة، فالجدول الورقي «ما يطابق البيانات» واختفى.
   (٢) الجدول الورقي المقفول: ينحفظ وياه مفتاح كل درس (المدرس|المادة|الشعب). إذا تغيّرت بيانات المدرسين بعدين، الجدول ينطابق بالمفاتيح
       ويبقى ظاهر — ما يختفي أبداً.
   (٣) القيد العام: زر الاختيار چان يعدّل نسخة قديمة من السجل (مو اللي بالقائمة الحالية) فالحفظ يطلع بالاسم القديم والبطاقة ترجع.
       هسه كل بطاقة تنربط بالسجل الحالي بالرقم، والقرار ينقفل (lk + وقته lkt) والخادم يفرضه على أي حفظ.
   (٤) السرعة: تحميل الأرشيف بالخلفية ملف واحد بالمرة ويوگف وإنت شغّال، ونشر البوابة التلقائي كل ٥ دقايق بدل كل دقيقة. */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v208", e); } };
  const TS = (m, k) => { try { (typeof toast == "function" ? toast : console.log)(m, k); } catch (e) { } };
  const isStaff = () => !!(typeof GX != "undefined" && GX.on);
  W.V208 = 1;

  /* ---------- (١) حفظ آمن: base + sid ---------- */
  const SID = Math.random().toString(36).slice(2) + Date.now().toString(36);
  async function reload208(p) {
    try {
      const r = await gxCall({ op: "one", p });
      if (!r || !r.ok) return;
      const rev = +r.rev || 0;
      GX.M.set(p, r.del ? { d: null, rev } : { d: JSON.parse(r.d), rev });
      GX.ack[p] = Math.max(GX.ack[p] || 0, rev);
      if (/^qaid\//.test(p) && typeof QPEND != "undefined") delete QPEND[p.slice(5)];
      gxNotify([p]);
    } catch (e) { }
  }
  W.reload208 = reload208;
  /* دمج ثلاثي: ينطبق على نسخة الخادم بس اللي هذا الجهاز غيّره فعلاً (مقارنة بالنسخة اللي كان شايفها).
     جهاز قديم ما غيّر بيانات المدرسين؟ يعني بياناته القديمة ما تنكتب فوق الجديدة — وتعديلك إنت ما يضيع ولا تطلع رسالة. */
  const C_ = v => canon(v === undefined ? null : v);
  const idOf = a => Array.isArray(a) && a.length && a.every(x => x && typeof x == "object" && !Array.isArray(x) && (x.id != null || x.i != null)) ? (x => x.id != null ? "id:" + x.id : "i:" + x.i) : null;
  function merge3(b, m, t) {
    const cb = C_(b), cm = C_(m);
    if (cm == cb) return t;
    const ct = C_(t);
    if (ct == cb || ct == cm) return m;
    if (typeof b == "string" && typeof m == "string" && typeof t == "string" && /^[\[{]/.test(m)) {
      try { return JSON.stringify(merge3(JSON.parse(b), JSON.parse(m), JSON.parse(t))); } catch (e) { return m; }
    }
    const k = idOf(m) || idOf(t);
    if (k && Array.isArray(b) && Array.isArray(m) && Array.isArray(t)) {
      const B = new Map(b.map(x => [k(x), x])), M = new Map(m.map(x => [k(x), x]));
      const out = [];
      for (const x of t) {
        const id = k(x);
        if (M.has(id)) out.push(B.has(id) ? merge3(B.get(id), M.get(id), x) : M.get(id));
        else if (!B.has(id)) out.push(x);          /* جديد من الجهاز الثاني */
        /* انحذف بهذا الجهاز → ما ينضاف */
      }
      const T0 = new Set(t.map(k));
      for (const x of m) { const id = k(x); if (!T0.has(id) && !B.has(id)) out.push(x); }  /* جديد من هذا الجهاز */
      return out;
    }
    if (b && m && t && typeof b == "object" && typeof m == "object" && typeof t == "object" && !Array.isArray(b) && !Array.isArray(m) && !Array.isArray(t)) {
      const o = {};
      for (const key of new Set([...Object.keys(t), ...Object.keys(m), ...Object.keys(b)])) {
        const v = merge3(b[key], m[key], t[key]);
        if (v !== undefined) o[key] = v;
      }
      return o;
    }
    return m;
  }
  W.merge208 = merge3;
  let ACT0 = Date.now();
  ["pointerdown", "keydown", "touchstart"].forEach(e => addEventListener(e, () => { ACT0 = Date.now(); }, { passive: true, capture: true }));
  on(() => {
    if (typeof gxPut != "function") return;
    gxPut = async function (p, d) {
      if (!SY_RE.test(p)) throw gxErr("invalid_argument", "path");
      if (RO) throw gxErr("invalid_argument", "ro");
      const prev = GX.M.get(p); let base = prev ? (+prev.rev || 0) : 0;
      const baseD = prev && prev.d !== undefined ? prev.d : undefined;
      let n = d == null ? null : syNorm(d);
      if (n != null && new TextEncoder().encode(canon(n)).length > 256 * 1024) throw gxErr("invalid_argument", "big");
      GX.M.set(p, { d: n, rev: base });
      gxNotify([p]); GX.pend[p] = (GX.pend[p] || 0) + 1;
      try {
        for (let tries = 0; ; tries++) {
          let body;
          if (n == null) body = { op: "put", p, del: 1 };
          else { const t = canon(n); body = { op: "put", p, d: t, h: syH(t) }; }
          body.base = base; body.sid = SID;
          const r = await gxCall(body);
          if (r && (r.err == "stale" || r.err == "upd") && tries < 4) {
            const s = await gxCall({ op: "one", p });
            if (!s || !s.ok) throw gxErr("unavailable", "one");
            const theirs = s.del ? null : JSON.parse(s.d);
            base = +s.rev || 0;
            if (baseD === undefined || n == null || theirs == null) {
              /* ما نعرف شنو تغيّر — نخلي نسخة الخادم */
              GX.M.set(p, { d: theirs, rev: base }); GX.ack[p] = Math.max(GX.ack[p] || 0, base);
              if (/^qaid\//.test(p) && typeof QPEND != "undefined") delete QPEND[p.slice(5)];
              gxNotify([p]);
              if (Date.now() - ACT0 < 8000) TS("انحفظ تعديل أحدث من جهاز ثاني وتحدّثت البيانات — إذا تعديلك الأخير ما ظهر سوّه مرة ثانية.", "err");
              return;
            }
            n = merge3(baseD, n, theirs);
            continue;
          }
          if (!r || !r.ok) {
            if (r && (r.err == "ro" || r.err == "path" || r.err == "data" || r.err == "big")) { GX.rev = 0; setTimeout(gxPoll, 50); throw gxErr("invalid_argument", r.err); }
            throw gxErr("unavailable", r && r.err || "bad");
          }
          GX.ack[p] = Math.max(GX.ack[p] || 0, +r.rev || 0);
          if (tries) {
            /* انحفظت النسخة المدموجة — الشاشة تاخذها (فيها تعديلك + تعديل الجهاز الثاني) */
            GX.M.set(p, { d: n, rev: +r.rev || 0 });
            if (/^qaid\//.test(p) && typeof QPEND != "undefined") delete QPEND[p.slice(5)];
            gxNotify([p]);
          } else { const e = GX.M.get(p); if (e) e.rev = Math.max(e.rev || 0, +r.rev || 0); }
          if (r.mod) await reload208(p);
          setSync("ok", "متصل — محفوظ");
          return;
        }
      } catch (e) { if (e && e.code == "unavailable") { GX.rev = 0; setTimeout(gxPoll, 4e3); } throw e; }
      finally { GX.pend[p]--; }
    };
  });

  /* ---------- (٢) الجدول الورقي ما يختفي ---------- */
  const ukey = u => T_()[u.t] + "|" + u.sj + "|" + u.secs.join(",");
  function T_() { return typeof T != "undefined" && Array.isArray(T) ? T : []; }
  let RM208 = null, UKSAVE = 0;
  W.tt208 = () => RM208;
  on(() => {
    if (typeof P == "undefined" || typeof P.tt != "function") return;
    const _pt = P.tt;
    P.tt = function (...a) {
      try { if (TT && Array.isArray(TT.g) && TT.g.length == NS && !STALE && TT.sig == sig()) TT.uk = U.map(ukey); } catch (e) { }
      return _pt.apply(P, a);
    };
  });
  on(() => {
    if (typeof applyTT != "function") return;
    const _ap = applyTT;
    applyTT = function () {
      const res = _ap.apply(this, arguments);
      try {
        if (STALE && TT && TT.lock && Array.isArray(TT.uk) && Array.isArray(TT.g) && TT.g.length == NS && U.length) {
          const idx = {}; U.forEach((u, i) => { idx[ukey(u)] = i; });
          let miss = 0, n = 0;
          const G = TT.g.map(a => a.map(r => { const x = r.slice(); while (x.length < 7) x.push(-1); return x.map(v => { if (v == null || v < 0) return -1; n++; const j = idx[TT.uk[v]]; if (j === undefined) { miss++; return -1; } return j; }); }));
          g = G; STALE = 0; R = [];
          try { rooms(); } catch (e) { }
          RM208 = { miss, n, at: Date.now() };
          /* مدير النظام: الجدول المطابق ينحفظ بالمفاتيح الجديدة (حتى بباقي الأجهزة يطلع نفسه) */
          if (!miss && typeof TOWN != "undefined" && TOWN && !RO && !UKSAVE) {
            UKSAVE = 1;
            setTimeout(() => { try { TT.g = g; TT.sig = sig(); TT.uk = U.map(ukey); P.tt(); } catch (e) { } UKSAVE = 0; }, 800);
          }
          if (miss) TS("بيانات بعض المدرسين تغيّرت: " + (typeof toAr == "function" ? toAr(miss) : miss) + " حصة بالجدول الورقي ما إلها مدرس مطابق — راجعها بالجدول", "err");
        } else if (!STALE && TT && TT.lock && !Array.isArray(TT.uk) && g.length && typeof TOWN != "undefined" && TOWN && !RO && !UKSAVE && READY.cfg && READY.tt) {
          UKSAVE = 1;
          setTimeout(() => { try { if (!STALE && TT.sig == sig()) { TT.uk = U.map(ukey); P.tt(); } } catch (e) { } UKSAVE = 0; }, 1500);
        }
      } catch (e) { console.warn("v208 tt", e); }
      return res;
    };
  });

  /* أول فتح لمدير النظام: يحفظ مفاتيح الجدول الورقي مرة وحدة */
  {
    let n = 0; const iv = setInterval(() => {
      try {
        if (++n > 40) return clearInterval(iv);
        if (typeof TOWN == "undefined" || !TOWN || RO || !READY.cfg || !READY.tt || !TT || !TT.lock || STALE || !g.length) return;
        clearInterval(iv);
        if (!Array.isArray(TT.uk) && TT.sig == sig()) { TT.uk = U.map(ukey); P.tt(); }
      } catch (e) { }
    }, 5000);
  }

  /* ---------- (٣) القيد العام: البطاقة تعدّل السجل الحالي، والقرار ينقفل ---------- */
  let qdRef = null, qdMap = null, stRef = null, stMap = null;
  const curR = i => { if (typeof QD == "undefined") return null; if (qdRef !== QD || !qdMap || qdMap.size != QD.length) { qdRef = QD; qdMap = new Map(QD.map(r => [r.i, r])); } return qdMap.get(i) || null; };
  const curS = id => { if (typeof ST == "undefined") return null; if (stRef !== ST || !stMap || stMap.size != ST.length) { stRef = ST; stMap = new Map(ST.map(s => [s.id, s])); } return stMap.get(id) || null; };
  on(() => {
    if (typeof W.q205 != "function") return;
    const _q = W.q205;
    W.q205 = function () {
      const Q = _q.apply(this, arguments);
      try {
        if (Q && Array.isArray(Q.rev)) {
          for (const it of Q.rev) {
            if (it.r && it.r.i) { const r = curR(it.r.i); if (r) it.r = r; }
            if (it.s && it.s.id) { const s = curS(it.s.id); if (s) it.s = s; }
          }
          for (let i = Q.rev.length - 1; i >= 0; i--) { const r = Q.rev[i].r; if (r && r.lk) Q.rev.splice(i, 1); }
        }
      } catch (e) { }
      return Q;
    };
  });
  /* حفظ ملف القيد: يحتفظ بالقفل ووقته، وأي قفل جديد ياخذ وقت هسه (الخادم ياخذ الأحدث) */
  on(() => {
    if (typeof qSaveChunk != "function") return;
    const KEEP = ["i", "pg", "n", "r", "y", "nt", "im", "lk", "lkt", "bd"];
    const strip = r => { const o = {}; for (const k of KEEP) if (r[k] != null && r[k] !== "") o[k] = r[k]; return o; };
    qSaveChunk = function (c) {
      try {
        const raw = isStaff() && GX.M.get("qaid/" + c);
        const srv = raw && raw.d && raw.d.list ? raw.d.list : [];
        const by = {}; srv.forEach(x => { by[x.i] = x; });
        QD.forEach(r => {
          if (r.c != c || !r.lk) return;
          const s = by[r.i];
          if (!s || s.n != r.n || s.lk != r.lk || !r.lkt) r.lkt = Date.now();
        });
      } catch (e) { }
      const list = QD.filter(r => r.c == c).map(strip);
      QPEND[c] = JSON.stringify(list);
      if (!DB) return;
      const ref = DB.doc("qaid/" + c);
      q(ref.path, () => retry(() => list.length ? ref.set({ list }) : ref.delete()));
    };
  });
  /* تعديل يدوي لاسم بالقيد = قرار جديد (وقت جديد) */
  on(() => {
    if (typeof qSave != "function") return;
    const _s = qSave;
    qSave = function (id) { const r = curR(id); if (r) { r.lk = r.lk || "يدوي"; r.lkt = Date.now() + 1; } return _s.apply(this, arguments); };
  });
  ["qFix205", "q206Sys", "q206Por", "qSkip205"].forEach(nm => on(() => {
    if (typeof W[nm] != "function") return;
    const _f = W[nm];
    W[nm] = async function (i, ...a) {
      let r = null;
      try { const Q = W.q205 && W.q205(); r = Q && Q.rev[i] && Q.rev[i].r; } catch (e) { }
      const res = await _f.call(this, i, ...a);
      try { if (r && QD.includes(r)) { r.lkt = Date.now(); if (!r.lk) r.lk = nm == "qSkip205" ? "اتركه" : "يدوي"; qSaveChunk(r.c); } } catch (e) { }
      return res;
    };
  }));

  /* ---------- (٤) السرعة ---------- */
  let ACT = Date.now();
  ["pointerdown", "keydown", "touchstart", "wheel"].forEach(e => addEventListener(e, () => { ACT = Date.now(); }, { passive: true, capture: true }));
  /* نشر البوابة التلقائي: كل ٥ دقايق بالأكثر (النشر بعد أي حفظ يبقى فوري) */
  on(() => {
    if (typeof gxSnapPush != "function") return;
    const _p = gxSnapPush; let last = 0;
    gxSnapPush = function (force) {
      if (!force && Date.now() - last < 3e5) return Promise.resolve(1);
      if (!force && Date.now() - ACT < 2e4) return Promise.resolve(1);
      last = Date.now(); return _p.apply(this, arguments);
    };
  });
  /* تحميل الأرشيف بالخلفية: ملف واحد بالمرة، ويستنى لما توكف عن الشغل ٨ ثواني. فتح ملف بيدك يمشي فوراً */
  let INT = 0, chain = Promise.resolve();
  on(() => {
    ["av207", "url207", "ap207"].forEach(nm => {
      const _f = W[nm]; if (typeof _f != "function") return;
      W[nm] = function () { INT = Date.now(); return _f.apply(this, arguments); };
    });
    try { if (typeof aView != "undefined" && W.av207) aView = W.av207; } catch (e) { }
    const _b = W.blob207; if (typeof _b != "function") return;
    W.blob207 = function (a, ...x) {
      const bg = W.pf207 && W.pf207.run && Date.now() - INT > 3000;
      if (!bg) return _b.call(this, a, ...x);
      const job = chain.then(async () => {
        while (Date.now() - ACT < 8000 || D.hidden) await new Promise(r => setTimeout(r, 2000));
        return _b.call(this, a, ...x);
      });
      chain = job.catch(() => { });
      return job;
    };
  });
})();
