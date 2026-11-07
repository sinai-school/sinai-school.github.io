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
