/* ===== v207g — الأرشيف بدون إنترنت + صور سجل القيود بقسمها وبصفحاتها بالقيد العام ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v207g", e); } };
  const A = v => typeof toAr == "function" ? toAr(v) : String(v);
  const E = s => typeof esc == "function" ? esc(s) : String(s == null ? "" : s);
  const I = n => typeof ic == "function" ? ic(n) : "";
  const IDB = () => W.IDB207;
  const arc = () => (typeof ARC != "undefined" ? ARC : []);
  const isF = a => a && a.src == "db" && (/^image\//.test(a.type || "") || /pdf/.test(a.type || ""));

  /* ---------- ١) قائمة الأرشيف نفسها محفوظة بالجهاز (تطلع حتى بدون إنترنت) ---------- */
  let saveT = 0;
  const saveArc = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { const L = arc().filter(a => a && a.id && a.sec != "grd"); if (L.length && IDB()) IDB().put("arc207", { L, at: Date.now() }); } catch (e) { } }, 2000); };
  on(() => {
    if (typeof refresh != "function") return;
    const _r = refresh;
    refresh = function () { try { if (typeof AREADY != "undefined" && AREADY && arc().length) saveArc(); } catch (e) { } return _r.apply(this, arguments); };
  });
  async function restoreArc() {
    try {
      if (arc().length || !IDB()) return;
      const c = await IDB().get("arc207"); if (!c || !c.L || arc().length) return;
      ARC = c.L; if (typeof AREADY != "undefined" && !AREADY && navigator.onLine === false) AREADY = 1;
      try { if (typeof render == "function" && typeof cur != "undefined" && cur == "z") render(); } catch (e) { }
    } catch (e) { }
  }

  /* ---------- ٢) تحميل كل ملفات الأرشيف للجهاز بالخلفية (مرة وحدة)، فتنفتح بلحظة وبدون إنترنت ---------- */
  const PF = { n: 0, ok: 0, run: 0, fail: 0 };
  W.pf207 = PF;
  async function prefetch() {
    if (PF.run || typeof W.blob207 != "function" || !W.has207) return;
    if (navigator.onLine === false) return;
    const c = navigator.connection; if (c && c.saveData) return;
    const L = arc().filter(isF);
    if (!L.length) return;
    PF.run = 1; PF.n = L.length; PF.ok = 0; PF.fail = 0;
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { }); } catch (e) { }
    /* الأولوية: البوردات الحديثة أول، وبعدين صور القيود والسجلات */
    const pr = a => (a.sec == "brd" ? 0 : a.sec == "qyd" ? 1 : 2) * 1e4 - (parseInt(a.yr) || 0);
    L.sort((x, y) => pr(x) - pr(y));
    const todo = [];
    for (const a of L) { if (await W.has207(a)) PF.ok++; else todo.push(a); }
    paint();
    let i = 0;
    const work = async () => {
      while (i < todo.length) {
        if (navigator.onLine === false) { await new Promise(r => setTimeout(r, 15000)); continue; }
        const a = todo[i++];
        try { await W.blob207(a); PF.ok++; } catch (e) { PF.fail++; }
        paint();
      }
    };
    await Promise.all([work(), work(), work()]);
    PF.run = 0; paint();
    if (PF.fail) { PF.fail = 0; setTimeout(prefetch, 120000); }
  }
  let pT = 0;
  function paint() { clearTimeout(pT); pT = setTimeout(() => { const e = D.getElementById("pf207"); if (e) e.outerHTML = chip(); }, 400); }
  const chip = () => !PF.n ? `<span id="pf207"></span>` : PF.ok >= PF.n
    ? `<span id="pf207" class="pf207 ok">✓ كل ملفات الأرشيف (${A(PF.n)}) محفوظة بالجهاز — تنفتح فوراً وبدون إنترنت</span>`
    : `<span id="pf207" class="pf207">⬇ جارٍ حفظ الأرشيف بالجهاز للفتح بدون إنترنت: ${A(PF.ok)} / ${A(PF.n)}</span>`;
  const st = D.createElement("style");
  st.textContent = `.pf207{display:inline-block;font-size:12.5px;padding:4px 10px;border-radius:999px;background:var(--sunk,#eef1ee);color:var(--muted,#555);margin:4px 0}.pf207.ok{color:#1e5a46}
.qy207 .t small{display:block;font-weight:400;color:var(--muted,#666);font-size:12.5px}`;
  D.head.appendChild(st);
  W.addEventListener("online", () => setTimeout(prefetch, 3000));

  /* يبدأ وحده بعد ما ينفتح النظام (لمدير النظام) — ما يحتاج يفتح الأرشيف */
  on(() => {
    let tries = 0;
    const tick = setInterval(() => {
      try {
        if (++tries > 200) return clearInterval(tick);
        if (!(typeof OWN != "undefined" && OWN) && !W.GXOWN) return;
        restoreArc();
        if (typeof aSub == "function" && typeof DB != "undefined" && DB) aSub();
        if (typeof AREADY != "undefined" && AREADY && arc().some(isF)) { clearInterval(tick); migrate(); setTimeout(prefetch, 4000); }
      } catch (e) { }
    }, 2500);
  });

  /* ---------- ٣) صور «قيود اعدادية سيناء للبنين» مو بوردات: تنتقل لقسم «صور سجل القيود» ---------- */
  on(() => { if (typeof ASEC != "undefined") ASEC.qyd = "صور سجل القيود"; });
  const isQyd = a => a && a.sec == "brd" && /قيود/.test(String(a.title || "") + " " + String(a.cls || "") + " " + String(a.name || ""));
  let MIG = 0;
  function migrate() {
    if (MIG || !W.GXOWN || typeof aPut != "function") return; MIG = 1;
    const L = arc().filter(isQyd);
    L.forEach(a => {
      const n = (String(a.title || "").match(/\((\d+)\)\s*$/) || [])[1] || "";
      a.sec = "qyd"; a.yr = ""; a.cls = "سجل القيود";
      a.n = +n || a.n || 0;
      a.title = "سجل القيود — صورة (" + (n || "") + ")";
      try { aPut(a); } catch (e) { }
    });
    if (L.length) { try { toast("انتقلت " + A(L.length) + " صورة من البوردات إلى «صور سجل القيود»"); } catch (e) { } }
    linkQaid();
  }
  W.mig207g = () => { MIG = 0; migrate(); };

  /* تبويب «صور سجل القيود» بجنب تبويبات الأرشيف */
  on(() => {
    if (typeof V == "undefined" || typeof V.z != "function") return;
    const _vz = V.z;
    V.z = function () {
      let h = _vz.apply(this, arguments);
      try {
        if (typeof ASEL != "undefined" && ASEL) return h;
        const n = arc().filter(a => a.sec == "qyd").length;
        const btn = `<button class="${AS0 == "qyd" ? "on" : ""}" onclick="aTab('qyd')">صور سجل القيود (${A(n)})</button>`;
        h = h.replace(/(<div class="seg">(?:(?!<\/div>)[\s\S])*?aTab\('brd'\)[\s\S]*?)(<\/div>)/, (m, a, b) => a.indexOf("aTab('qyd')") >= 0 ? m : a + btn + b);
        if (AS0 == "qyd") h = h.replace(/<span class="sub">[^<]*<\/span>/, `<span class="sub">صور صفحات سجل القيود العام — كل صورة مربوطة بصفحتها</span>`);
        if (typeof AQ == "undefined" || !String(AQ).trim()) h = h.replace(/(<div class="sel207">)/, chip() + "$1");
      } catch (e) { }
      return h;
    };
  });
  /* قائمة صور القيود: بالترتيب، وكل صورة بيها رقم صفحتها والأسماء اللي بيها من القيد العام */
  const qdAll = () => (typeof QD != "undefined" ? QD : []);
  function qydList() {
    const L = arc().filter(a => a.sec == "qyd").sort((x, y) => (+x.pg || 1e9) - (+y.pg || 1e9) || (x.n || 0) - (y.n || 0));
    if (!L.length) return typeof emptyState == "function" ? emptyState("ما بيه صور بعد", "") : "";
    const row = a => {
      const names = a.pg ? qdAll().filter(x => +x.pg == +a.pg).map(x => x.n) : [];
      return `<div class="arw207 qy207"><span class="t">${a.pg ? "صفحة القيد " + A(a.pg) : E(a.title || "")}<small>${names.length ? E(names.slice(0, 4).join("، ")) + (names.length > 4 ? "…" : "") : a.pg ? "" : "بانتظار ربطها بصفحتها"}</small></span><span class="b"><button class="btn sm" onclick="av207('${a.id}')">${I("eye") || ""}فتح</button><button class="btn ghost sm" onclick="ap207('${a.id}')">${I("print")} طباعة</button><button class="btn ghost sm" onclick="aGet('${a.id}')">${I("inst")} تنزيل</button></span></div>`;
    };
    return `<div class="box"><h3>صور سجل القيود <span class="sub">(${A(L.length)})</span></h3>${L.map(row).join("")}</div>`;
  }
  on(() => {
    if (typeof aResHTML != "function") return;
    const _ar = aResHTML;
    aResHTML = function () {
      try { if (typeof AS0 != "undefined" && AS0 == "qyd" && !(typeof AQ != "undefined" && String(AQ).trim())) return qydList(); } catch (e) { }
      return _ar.apply(this, arguments);
    };
  });
  /* العارض: صور القيود بالترتيب حسب رقم الصفحة */
  on(() => {
    const _o = W.av207; if (typeof _o != "function") return;
    W.av207 = function (id) {
      const a = arc().find(x => x.id == id);
      if (a && a.sec == "qyd") { try { ARC.sort((x, y) => (x.sec == "qyd" && y.sec == "qyd") ? ((+x.pg || 1e9) - (+y.pg || 1e9) || (x.n || 0) - (y.n || 0)) : 0); } catch (e) { } }
      return _o.apply(this, arguments);
    };
    try { aView = W.av207; } catch (e) { }
  });

  /* ---------- ٤) ربط كل صورة بصفحتها بالقيد العام: الطالب بتلك الصفحة تطلع صورته بملفه ---------- */
  let LQ = 0;
  function linkQaid() {
    if (!W.GXOWN || typeof QD == "undefined") return;
    try { if (typeof qSub == "function") qSub(); } catch (e) { }
    if (!(typeof QREADY != "undefined" && QREADY) || !QD.length) { if (++LQ < 60) setTimeout(linkQaid, 5000); return; }
    const L = arc().filter(a => a.sec == "qyd" && a.pg);
    const ch = new Set();
    L.forEach(a => {
      const im = "arch:" + a.id;
      qdAll().forEach(x => { if (+x.pg == +a.pg && x.im != im && (!x.im || /^arch:/.test(x.im) || a.force)) { x.im = im; ch.add(x.c); } });
    });
    if (ch.size && typeof qSaveChunk == "function") { ch.forEach(c => { try { qSaveChunk(c); } catch (e) { } }); }
  }
  W.lq207 = linkQaid;
  /* صورة القيد من الأرشيف: qImgGet يفهم «arch:<id>» */
  on(() => {
    if (typeof qImgGet != "function") return;
    const _q = qImgGet;
    qImgGet = async function (id) {
      if (!/^arch:/.test(String(id || ""))) return _q.apply(this, arguments);
      if (QIMG[id]) return QIMG[id];
      try { if (typeof aSub == "function") aSub(); } catch (e) { }
      for (let t = 0; t < 20 && !arc().some(x => x.id == id.slice(5)); t++) await new Promise(r => setTimeout(r, 500));
      const a = arc().find(x => x.id == id.slice(5)); if (!a) return null;
      try { QIMG[id] = await W.url207(a); } catch (e) { return null; }
      return QIMG[id];
    };
  });
  on(() => {
    if (typeof qZoom != "function") return;
    const _z = qZoom;
    qZoom = function (id) { if (/^arch:/.test(String(id || "")) && W.av207) return W.av207(id.slice(5)); return _z.apply(this, arguments); };
  });

  /* ---------- ٥) البحث بالبوردات: كل نتائج الطالب (الدور الأول والثاني والثالث وكل السنين) مجمّعة ---------- */
  const RO = r => /ثالث/.test(r) ? 3 : /ثاني/.test(r) ? 2 : 1;
  on(() => {
    const _f = W.bxFind207; if (typeof _f != "function") return;
    W.bxFind207 = function (q) {
      const R = _f.apply(this, arguments) || [];
      /* نجمع نتائج نفس الطالب: نفس الرقم الامتحاني، أو نفس الاسم الكامل */
      const NZ = t => String(t || "").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, " ").trim();
      R.forEach(x => { x.k = NZ(x.r[2]); });
      const firstYr = {}; R.forEach(x => { const y = String(x.b.yr || ""); if (!firstYr[x.k] || y > firstYr[x.k]) firstYr[x.k] = y; });
      return R.sort((x, y) => firstYr[y.k].localeCompare(firstYr[x.k]) || x.k.localeCompare(y.k, "ar") || String(y.b.yr).localeCompare(String(x.b.yr)) || RO(x.b.round) - RO(y.b.round));
    };
  });
})();
