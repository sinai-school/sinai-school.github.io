/* ===== v213 (5 Nov 2026) — الاستمارات: «التصميم الأصلي» + «إرجاع تعديلاتي»، وكتاب «صحة صدور وثيقة مدرسية» يتعبّى وحده ===== */
(function () {
  "use strict";
  const on = fn => { try { return fn(); } catch (e) { console.warn("v213", e); } };

  /* ---------- (١) الاستمارات: الرجوع للتصميم الأصلي (كل الطلاب والشعب + مكان الختم) مع إمكانية التراجع ---------- */
  const ovCount = D => { let n = 0; on(() => { for (const s in (D.ov || {})) if (D.ov[s] && Object.keys(D.ov[s]).length) n++; for (const s in (D.stpos || {})) if (D.stpos[s] && Object.keys(D.stpos[s]).length) n++; }); return n; };
  const reload = () => { on(() => { FXB = null; FXP = null; }); on(() => render()); };
  window.fxOrig213 = () => {
    const D = fxDoc(FX.id);
    if (!ovCount(D)) { toast("الاستمارة أصلاً على التصميم الأصلي"); return; }
    fxSave(FX.id, { bak213: { ov: D.ov || {}, stpos: D.stpos || {}, at: new Date().toISOString() }, ov: {}, stpos: {} });
    on(() => { FX.ed = 0; });
    reload();
    toast("رجعت الاستمارة للتصميم الأصلي — إذا تريد تعديلاتك اضغط «إرجاع تعديلاتي»");
  };
  window.fxUndo213 = () => {
    const D = fxDoc(FX.id), b = D.bak213;
    if (!b) return;
    fxSave(FX.id, { ov: b.ov || {}, stpos: b.stpos || {}, bak213: 0 });
    reload();
    toast("رجعت تعديلاتك السابقة");
  };
  if (typeof V != "undefined" && V.fx) {
    const _vfx = V.fx;
    V.fx = function () {
      let h = _vfx.apply(this, arguments);
      on(() => {
        if (typeof h != "string" || !FXR[FX.id]) return;
        const D = fxDoc(FX.id), n = ovCount(D);
        const b = (n ? `<button class="btn ghost sm" onclick="ask(this,fxOrig213)" title="يمسح كل التعديلات اليدوية لهذي الاستمارة (كل الطلاب والشعب) ومكان الختم">${ic("rld")} التصميم الأصلي</button>` : "")
          + (D.bak213 ? `<button class="btn ghost sm" onclick="ask(this,fxUndo213)" title="يرجّع التعديلات اللي انمسحت">${ic("undo")} إرجاع تعديلاتي</button>` : "");
        if (!b) return;
        const i = h.indexOf('<div class="tools fxt">'); if (i < 0) return;
        const j = h.indexOf("</div>", i); if (j < 0) return;
        h = h.slice(0, j) + b + h.slice(j);
      });
      return h;
    };
  }

  /* ---------- (٢) كتاب «صحة صدور وثيقة مدرسية»: آخر رقم وثيقة + تاريخ اليوم تلقائياً ---------- */
  const K = "sihha_w", LS = "sihha213";
  const RE_N = /(المرقمة:\s*\()([^)]*)(\))/, RE_A = /(ذي العدد:\s*\()([^)]*)(\))/, RE_D = /(بتاريخ:\s*\()([^)]*)(\))/;
  const isS = b => /صحة صدور الوثيقة/.test(String(b || ""));
  const real = v => { const t = String(v == null ? "" : v).replace(/‏/g, "").trim(); return t && !/^[.\s…ـ]+$/.test(t) && !/«/.test(t) ? t : ""; };
  const today = () => { const d = new Date(); return toAr([d.getDate(), d.getMonth() + 1, d.getFullYear()].join("/")); };
  function last213() {
    let best = null;
    on(() => (typeof LET != "undefined" ? LET : []).forEach(l => {
      if (!l || !isS(l.body)) return;
      const b = String(l.body), n = real((b.match(RE_N) || [])[2]), a = real((b.match(RE_A) || [])[2]);
      if (!n && !a) return;
      const at = String(l.updated || l.date || "");
      if (!best || at > best.at) best = { n, a, at };
    }));
    on(() => { const c = JSON.parse(localStorage.getItem(LS) || "null"); if (c && (c.n || c.a) && (!best || String(c.at) > best.at)) best = c; });
    return best;
  }
  const put = (b, re, v) => v ? b.replace(re, (m, p, x, s) => p + v + s) : b;
  function fill213() {
    const L = typeof LDRAFT != "undefined" && LDRAFT; if (!L || !isS(L.body)) return;
    const z = last213(); let b = String(L.body);
    if (z) { b = put(b, RE_N, z.n); b = put(b, RE_A, z.a); }
    b = put(b, RE_D, today());
    L.body = b;
  }
  if (typeof ltUse == "function") {
    const _lu = ltUse;
    ltUse = function (k2) {
      const r = _lu.apply(this, arguments);
      if (k2 == K) { on(fill213); on(() => render()); }
      return r;
    };
  }
  /* اختيار الطالب: الاسم والصف وسنة التولد تنملي وحدها (إذا سنة التولد ما موجودة تبقى نقاط تملّيها بإيدك) */
  if (typeof tplFill == "function") {
    const _tf = tplFill;
    tplFill = function (L, o) {
      if (!(typeof LTPLK != "undefined" && LTPLK == K && o && o.s && L && isS(L.body))) return _tf.apply(this, arguments);
      const s = o.s;
      let by = s.by || "";
      if (!by) on(() => { const I = typeof INF != "undefined" && INF && INF[s.id]; const m = I && String(I.dob || (I.x || {}).dob || "").match(/(19|20)\d\d/); if (m) by = m[0]; });
      const r = _tf.call(this, L, { ...o, s: by && !s.by ? { ...s, by } : s });
      on(() => { if (r && r.body) r.body = String(r.body).replace(/تولد:\s*\(\s*\)/, "تولد: (..........)"); });
      return r;
    };
  }
  /* بعد الحفظ: نتذكر آخر رقم وثيقة (احتياط بالجهاز إذا الخادم بطيء) */
  if (typeof lSave == "function") {
    const _ls = lSave;
    lSave = function () {
      const r = _ls.apply(this, arguments);
      on(() => {
        const L = LDRAFT; if (!L || !isS(L.body)) return;
        const b = String(L.body), n = real((b.match(RE_N) || [])[2]), a = real((b.match(RE_A) || [])[2]);
        if (n || a) localStorage.setItem(LS, JSON.stringify({ n, a, at: new Date().toISOString() }));
      });
      return r;
    };
  }
})();

/* ===== v213b — الكتب الرسمية: اسم المدرس بدون اللقب (طلب المستخدم: «ما اريد اللقب») ===== */
(function () {
  "use strict";
  const on = fn => { try { return fn(); } catch (e) { console.warn("v213b", e); } };
  /* الاسم الرباعي فقط («عبد …» اسم واحد)؛ إذا الرابع نسبة مثل «الساعدي» فهو لقب وينشال */
  function noLaqab(n) {
    const w = (typeof FSD != "undefined" && FSD.nW) ? FSD.nW(n) : String(n || "").trim().split(/\s+/);
    let o = w.slice(0, 4);
    if (o.length == 4 && /^ال\S+(ي|ى|يه|ية)$/.test(o[3])) o = o.slice(0, 3);
    return o.join(" ") || String(n || "");
  }
  window.noLaqab213 = noLaqab;
  if (typeof tplFill == "function") {
    const _tf = tplFill;
    tplFill = function (L, o) {
      if (o && o.t && o.t.name) o = { ...o, t: { ...o.t, name: noLaqab(o.t.name) } };
      return _tf.call(this, L, o);
    };
  }
  /* اختيار المدرس من القائمة (حتى بالكتاب الحر): الاسم ينكتب بدون لقب */
  if (typeof lPick == "function") {
    const _lp = lPick;
    lPick = function (kind, v) {
      if (kind != "t") return _lp.apply(this, arguments);
      const f = (typeof STF != "undefined" ? STF : []).find(x => x.id == v);
      if (!f || !f.name) return _lp.apply(this, arguments);
      const old = f.name, nn = noLaqab(old);
      if (nn == old) return _lp.apply(this, arguments);
      f.name = nn;
      try { return _lp.apply(this, arguments); } finally { f.name = old; on(() => render()); }
    };
  }
})();
