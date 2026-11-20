/* =====================================================================
   v238 (2026-11-17): بوابة الأرشفة الإلكترونية — لمدير النظام فقط
   - سجلات القيد العام: القيود ١–٥٩ (وما يُضاف كل عام)، كل قيد من صفحة … إلى صفحة …
     صورة كل صفحة مربوطة تلقائياً بالطالب صاحب رقم الصفحة في القيد العام (مطابقة تامة بالرقم).
   - أرشيف السجلات الوسطية: سجل لكل عام دراسي (يُضاف يدوياً).
   - أرشيف البورد الوزاري القديم (الثالث المتوسط والسادس العلمي والأدبي، الدوران).
   - القص التلقائي على حدود الورقة (مع تعديل يدوي بالزوايا)، دقة عالية (WebP)، تكبير/تصغير/طباعة/تنزيل،
     والاستبدال ينشئ نسخة جديدة مع ملاحظة (ماذا زُوِّد)، والنسخ السابقة محفوظة وتُسترجع.
   - الفهرس محفوظ بالجهاز (IndexedDB) ويتحدّث بالتغييرات فقط؛ الصور تُحفظ بالجهاز بعد أول فتح.
   ===================================================================== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = f => { try { return f(); } catch (e) { console.error("v238", e); } };
  const E = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const AD = v => (typeof toAr == "function" ? toAr(v) : String(v == null ? "" : v).replace(/[0-9]/g, k => "٠١٢٣٤٥٦٧٨٩"[k]));
  const EN = v => String(v == null ? "" : v).replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632).replace(/[۰-۹]/g, d => d.charCodeAt(0) - 1776);
  const T0 = (m, k) => on(() => toast(m, k));
  const IC = (n, c) => on(() => ic(n, c)) || "";
  const isOwn = () => !!(W.GXOWN || (typeof TOWN != "undefined" && TOWN && typeof OWN != "undefined" && OWN));
  const gxOn = () => typeof GX != "undefined" && GX && GX.on && GX.tok;
  const YRS = s => { const m = /^(\d{4})\s*[-–\/]\s*(\d{4})$/.exec(EN(s).trim()); if (!m) return ""; let a = +m[1], b = +m[2]; if (a > b) [a, b] = [b, a]; return b - a === 1 ? a + "-" + b : ""; };
  /* رقم الصفحة: أرقام + حرف عربي اختياري (2183أ) — نفس الخادم */
  const PG = v => { const t = EN(v).replace(/\s+/g, "").trim(); return /^\d{1,6}[ء-ي]?$/.test(t) ? String(+t.match(/^\d+/)[0]) + t.replace(/^\d+/, "") : ""; };
  const PGN = p => parseInt(p, 10) || 0;
  const pgCmp = (a, b) => PGN(a) - PGN(b) || String(a).localeCompare(String(b), "ar");
  const CLS = { m3: "الثالث المتوسط", s6i: "السادس العلمي", s6a: "السادس الأدبي" };
  const RD = { 1: "الدور الأول", 2: "الدور الثاني" };
  const OLDY = (() => { const L = []; for (let y = 1988; y <= 2012; y++) L.push(y + "-" + (y + 1)); return L.reverse(); })();
  const MAXL = 4000, WQ = .9, TH = 360; /* دقة عالية: حتى ٤٠٠٠ بكسل (دقة الصورة الأصلية إن كانت أقل) */

  /* ---------------- ICONS ---------------- */
  on(() => Object.assign(ICON, {
    ar238: "M4 4h16v5H4zM6 9v11h12V9M9 13h6M12 3v1",
    arup: "M12 16V4M7 9l5-5 5 5M4 16v4h16v-4",
    arrot: "M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5",
    arcrop: "M6 2v16h16M2 6h16v16",
    arprint: "M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z",
    arzin: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4M8 11h6M11 8v6",
    arzout: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4M8 11h6",
    arhist: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2",
    arnext: "M15 6l-6 6 6 6", arprev: "M9 6l6 6-6 6",
    arfit: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
    ardl: "M12 4v12M7 11l5 5 5-5M4 20h16"
  }));

  /* ---------------- STATE ---------------- */
  const AR = W.AR238 = {
    tab: "q", book: null, sub: "", cls: "m3", rd: 1, q: "", filt: "all", rv: 0, store: "", ready: 0,
    books: {}, P: new Map(), names: null, qdRef: null, qdLen: -1, edit: null, form: null, mig: null, err: ""
  };
  const key = (bk, pg) => bk + "|" + pg;
  const page = (bk, pg) => { const r = AR.P.get(key(bk, pg)); return r && r.v ? r : null; };

  /* ---------------- IndexedDB ---------------- */
  let IDB = null;
  const idb = () => IDB || (IDB = new Promise((ok, no) => {
    try { const r = indexedDB.open("sinai238", 1); r.onupgradeneeded = () => { const d = r.result; ["kv", "img"].forEach(s => { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s); }); }; r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); } catch (e) { no(e); }
  }));
  const idbGet = (st, k) => idb().then(d => new Promise(ok => { try { const r = d.transaction(st).objectStore(st).get(k); r.onsuccess = () => ok(r.result); r.onerror = () => ok(undefined); } catch (e) { ok(undefined); } })).catch(() => undefined);
  const idbPut = (st, k, v) => idb().then(d => new Promise(ok => { try { const t = d.transaction(st, "readwrite"); t.objectStore(st).put(v, k); t.oncomplete = () => ok(1); t.onerror = () => ok(0); } catch (e) { ok(0); } })).catch(() => 0);
  const idbDel = (st, k) => idb().then(d => new Promise(ok => { try { const t = d.transaction(st, "readwrite"); t.objectStore(st).delete(k); t.oncomplete = () => ok(1); t.onerror = () => ok(0); } catch (e) { ok(0); } })).catch(() => 0);
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { }

  /* ---------------- SERVER ---------------- */
  const base = () => { try { return new URL(GX.url).origin; } catch (e) { return ""; } };
  async function call(f, o) {
    const r = await gxCall(Object.assign({ op: "ar238", f }, o || {}));
    if (r && r.err) throw r;
    return r;
  }
  async function raw(path, body, isBin) {
    for (let t = 0; t < 2; t++) {
      const b = isBin ? body(GX.tok) : JSON.stringify(Object.assign({ tok: GX.tok }, body));
      let r;
      try { r = await fetch(base() + path, { method: "POST", headers: { "Content-Type": isBin ? "application/octet-stream" : "text/plain;charset=utf-8" }, body: b }); }
      catch (e) { throw { err: "net" }; }
      const ct = r.headers.get("Content-Type") || "";
      if (/json/.test(ct)) {
        const j = await r.json().catch(() => ({ err: "bad" }));
        if (j.err == "auth" && !t && typeof gxRelogin == "function" && (await gxRelogin()) == 1) continue;
        return j;
      }
      return r;
    }
    return { err: "auth" };
  }
  const sigMime = u8 => u8[0] === 0xFF && u8[1] === 0xD8 ? "image/jpeg" : u8[0] === 0x89 && u8[1] === 0x50 ? "image/png" : u8[8] === 0x57 && u8[9] === 0x45 && u8[10] === 0x42 && u8[11] === 0x50 ? "image/webp" : "application/octet-stream";
  /* صورة نسخة (كاملة أو مصغّرة): الذاكرة ← الجهاز ← الخادم */
  const MEM = new Map();
  function memSet(k, url) { MEM.set(k, url); if (MEM.size > 700) { const [k0, u0] = MEM.entries().next().value; MEM.delete(k0); try { URL.revokeObjectURL(u0); } catch (e) { } } return url; }
  const INFL = {};
  function img(vid, thumb) {
    const k = (thumb ? "t:" : "f:") + vid;
    if (MEM.has(k)) return Promise.resolve(MEM.get(k));
    return INFL[k] || (INFL[k] = (async () => {
      let b = await idbGet("img", k);
      if (!(b instanceof Blob) || !b.size) {
        const r = await raw("/ar238", { id: vid, t: thumb ? 1 : 0 });
        if (!r || r.err) { if (r && r.err == "none" && thumb) return ""; throw r || { err: "net" }; }
        const x = r.headers.get("X-B64");
        if (x) { const s = atob((await r.text()).trim()); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); b = new Blob([u], { type: x }); }
        else { const ab = new Uint8Array(await r.arrayBuffer()); b = new Blob([ab], { type: sigMime(ab) }); }
        if (b.size) idbPut("img", k, b);
      }
      return memSet(k, URL.createObjectURL(b));
    })().finally(() => { delete INFL[k]; }));
  }
  async function imgBlob(vid) { const u = await img(vid, 0); return (await fetch(u)).blob(); }

  /* ---------------- INDEX ---------------- */
  function applyIdx(r) {
    if (r.full) { AR.books = {}; AR.P = new Map(); }
    (r.books || []).forEach(b => { AR.books[b.id] = b; });
    (r.pages || []).forEach(a => { const o = { bk: a[0], pg: a[1], v: a[2], rv: a[3], at: a[4], w: a[5], h: a[6], sz: a[7], nv: a[8], nt: a[9] }; AR.P.set(key(o.bk, o.pg), o); });
    AR.rv = Math.max(AR.rv && !r.full ? AR.rv : 0, +r.rv || 0); if (r.store) AR.store = r.store;
  }
  let LOADP = null, AGAIN = null, SAVET = 0;
  function saveIdx() { clearTimeout(SAVET); SAVET = setTimeout(() => idbPut("kv", "idx", { u: GX.u, rv: AR.rv, store: AR.store, books: AR.books, P: [...AR.P.values()] }), 800); }
  function load(quiet) {
    if (!isOwn() || !gxOn()) return Promise.resolve();
    if (LOADP) return AGAIN || (AGAIN = LOADP.then(() => { AGAIN = null; return load(quiet); })); /* تحميل جارٍ: نعيد مرة واحدة بعده حتى لا تفوتنا تغييرات العملية الأخيرة */
    return (LOADP = (async () => {
      if (!AR.ready) {
        const c = await idbGet("kv", "idx");
        if (c && c.u == GX.u && c.P) { AR.books = c.books || {}; AR.P = new Map(c.P.map(o => [key(o.bk, o.pg), o])); AR.rv = c.rv || 0; AR.store = c.store || ""; AR.ready = 1; patchQD(1); rerender(); }
      }
      const r = await call("idx", { since: AR.rv });
      const ch = r.full || (r.books || []).length || (r.pages || []).length;
      applyIdx(r); AR.ready = 1; AR.err = "";
      if (ch) { saveIdx(); patchQD(1); rerender(); }
      await initBooks();
    })().catch(e => { AR.err = e && (e.msg || e.err) || "net"; if (!quiet) rerender(); }).finally(() => { LOADP = null; }));
  }
  const inView = () => typeof cur != "undefined" && cur == "ar238";
  function rerender() { if (inView()) on(() => { if (typeof refresh == "function") refresh(); else render(); }); }
  setInterval(() => { if (inView() && !D.hidden && !BUSY) load(1); }, 45000);

  /* ---------------- القيد العام: أسماء كل صفحة + تقسيم القيود ---------------- */
  const QDa = () => (typeof QD != "undefined" && Array.isArray(QD)) ? QD : [];
  function names() {
    const L = QDa();
    if (AR.names && AR.qdRef === L && AR.qdLen === L.length) return AR.names;
    const M = new Map();
    L.forEach(r => { const p = PG(r && r.pg); if (!p) return; let a = M.get(p); if (!a) M.set(p, a = []); a.push(r); });
    AR.names = M; AR.qdRef = L; AR.qdLen = L.length; return M;
  }
  /* التقسيم من القيد العام: لكل رقم قيد أصغر وأكبر صفحة */
  function qRanges() {
    const R = {};
    QDa().forEach(r => { const n = parseInt(EN(r && r.r), 10), p = PGN(PG(r && r.pg)); if (!(n >= 1) || !p) return; const o = R[n] || (R[n] = { n, p0: p, p1: p, c: 0 }); o.p0 = Math.min(o.p0, p); o.p1 = Math.max(o.p1, p); o.c++; });
    return Object.values(R).sort((a, b) => a.n - b.n);
  }
  const qBooks = () => Object.values(AR.books).filter(b => b.kind == "q" && !b.del).sort((a, b) => a.n - b.n);
  let INIT = 0;
  async function initBooks() {
    if (INIT || qBooks().length) return;
    const R = qRanges(); if (R.length < 5) return; /* القيد العام لم يتحمّل بعد */
    /* تتداخل؟ (بيانات غير مرتبة) — لا نحفظ شيئاً تلقائياً، يبقى للمراجعة */
    for (let i = 1; i < R.length; i++) if (R[i].p0 <= R[i - 1].p1) return;
    INIT = 1;
    try { await call("books", { L: R.map(o => ({ kind: "q", n: o.n, p0: String(o.p0), p1: String(o.p1) })) }); setTimeout(() => load(1), 0); /* لا ننتظر load هنا: initBooks تُستدعى من داخل load */ }
    catch (e) { INIT = 0; }
  }
  function bookOfPg(pg) { const n = PGN(pg); return qBooks().find(b => n >= PGN(b.p0) && n <= PGN(b.p1)) || null; }

  /* ---------------- ربط صور القيد العام بالبوابة ----------------
     كل طالب له صفحة مؤرشفة في البوابة: صورة صفحته (ملفه، القيد العام) تأتي من البوابة (آخر نسخة) بدل الصورة القديمة.
     الربط للعرض فقط: الحفظ (qSaveChunk) يكتب الرابط الأصلي كما هو — بيانات القيد لا تتغيّر. */
  const ORIG = new WeakMap(); let SAVING = 0;
  function patchQD(force) {
    if (!AR.ready) return;
    const L = QDa(); if (!L.length) return;
    if (!force && L === patchQD.ref && L.length === patchQD.len && patchQD.rv === AR.rv) return;
    patchQD.ref = L; patchQD.len = L.length; patchQD.rv = AR.rv;
    for (const r of L) {
      if (!r) continue;
      const p = PG(r.pg), a = p && page("q", p), d = Object.getOwnPropertyDescriptor(r, "im"), patched = d && d.get && ORIG.has(r);
      if (a) {
        const id = "ar238:" + p + ":" + a.v;
        if (patched) { r._ar238 = id; continue; }
        ORIG.set(r, r.im);
        Object.defineProperty(r, "im", { configurable: true, enumerable: true, get() { return SAVING ? ORIG.get(this) : this._ar238 || ORIG.get(this); }, set(x) { ORIG.set(this, x); } });
        Object.defineProperty(r, "_ar238", { configurable: true, enumerable: false, writable: true, value: id });
      } else if (patched) {
        const o = ORIG.get(r); delete r.im; if (o != null) r.im = o; delete r._ar238;
      }
    }
  }
  setInterval(() => { if (!AR.ready) return; patchQD(0); if (!INIT && isOwn() && gxOn() && !qBooks().length && QDa().length > 1000) initBooks(); }, 1500);
  on(() => {
    if (typeof qSaveChunk != "function") return;
    const _s = qSaveChunk;
    qSaveChunk = function () { SAVING++; try { return _s.apply(this, arguments); } finally { SAVING--; } };
  });
  on(() => {
    if (typeof qImgGet != "function") return;
    const _q = qImgGet;
    qImgGet = async function (id) {
      const m = /^ar238:([^:]+):(.+)$/.exec(String(id || ""));
      if (!m) return _q.apply(this, arguments);
      if (QIMG[id]) return QIMG[id];
      try { QIMG[id] = await img(m[2], 0); } catch (e) { QIMG[id] = null; delete QIMG[id]; }
      return QIMG[id] || null;
    };
  });
  on(() => {
    if (typeof qZoom != "function") return;
    const _z = qZoom;
    qZoom = function (id) { const m = /^ar238:([^:]+):/.exec(String(id || "")); if (m) return view238("q", m[1]); return _z.apply(this, arguments); };
  });
  /* «استبدال صورة الصفحة» من القيد العام → نسخة جديدة في البوابة (مع الملاحظة) */
  on(() => {
    if (typeof qPhoto != "function") return;
    const _p = qPhoto;
    qPhoto = function (id, file) {
      const r = QDa().find(x => x.i == id), p = r && PG(r.pg);
      if (!r || !p || !file || !isOwn() || !gxOn()) return _p.apply(this, arguments);
      return upOpen({ bk: "q", files: [file], start: p, one: 1 });
    };
  });
  /* القيد العام: ملاحظة صغيرة تحت الصورة بأن مصدرها البوابة */
  on(() => {
    if (typeof qDetail != "function") return;
    const _d = qDetail;
    qDetail = function () { on(() => patchQD(0)); return _d.apply(this, arguments); };
  });

  /* ======================================================================
     معالجة الصور: كشف حدود الورقة، تصحيح المنظور، الترميز
     ====================================================================== */
  async function decode(src) {
    /* src: File/Blob → ImageBitmap باتجاه EXIF */
    try { return await createImageBitmap(src, { imageOrientation: "from-image" }); } catch (e) { }
    const u = URL.createObjectURL(src);
    try { const im = new Image(); im.decoding = "async"; im.src = u; await im.decode(); return im; } finally { setTimeout(() => URL.revokeObjectURL(u), 3000); }
  }
  const dims = b => [b.width || b.naturalWidth, b.height || b.naturalHeight];
  function canvas(w, h) { const c = D.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }

  /* كشف الورقة على نسخة صغيرة (٦٤٠ بكسل): الورقة فاتحة ومحايدة اللون مقارنة بالأرضية.
     يرجع {q:[[x,y]×4 بنسبة 0..1 — أعلى يسار، أعلى يمين، أسفل يمين، أسفل يسار], c:"ok"|"low"|"full"} */
  function detect(bm) {
    const [w0, h0] = dims(bm), S = 640, sc = S / Math.max(w0, h0), w = Math.max(8, Math.round(w0 * sc)), h = Math.max(8, Math.round(h0 * sc));
    const c = canvas(w, h), x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(bm, 0, 0, w, h);
    const px = x.getImageData(0, 0, w, h).data, N = w * h, Lm = new Float32Array(N), Ca = new Float32Array(N), Cb = new Float32Array(N);
    for (let i = 0, j = 0; i < N; i++, j += 4) { const r = px[j], g = px[j + 1], b = px[j + 2]; Lm[i] = .299 * r + .587 * g + .114 * b; Ca[i] = r - g; Cb[i] = (r + g) / 2 - b; }
    /* تنعيم ٥×٥ — يذيب الكتابة والخطوط الرفيعة في لون الورقة */
    const blur = A => { const T = new Float32Array(N), B = new Float32Array(N), R = 3;
      for (let y = 0; y < h; y++) { let s = 0; const o = y * w; for (let xx = -R; xx < w; xx++) { if (xx + R < w) s += A[o + xx + R]; if (xx - R - 1 >= 0) s -= A[o + xx - R - 1]; if (xx >= 0) T[o + xx] = s / (Math.min(w - 1, xx + R) - Math.max(0, xx - R) + 1); } }
      for (let xx = 0; xx < w; xx++) { let s = 0; for (let y = -R; y < h; y++) { if (y + R < h) s += T[(y + R) * w + xx]; if (y - R - 1 >= 0) s -= T[(y - R - 1) * w + xx]; if (y >= 0) B[y * w + xx] = s / (Math.min(h - 1, y + R) - Math.max(0, y - R) + 1); } }
      return B; };
    const L2 = blur(Lm), A2 = blur(Ca), B2 = blur(Cb);
    /* لون الورقة من وسط الصورة (الورقة تملأ الوسط دائماً) — المتوسط والانحراف لكل قناة، بدون الحبر الغامق */
    const smp = []; for (let y = Math.floor(h * .3); y < h * .7; y += 2) for (let xx = Math.floor(w * .3); xx < w * .7; xx += 2) smp.push(y * w + xx);
    const Lsm = smp.map(k => L2[k]).sort((a, b) => a - b), lcut = Lsm[Math.floor(Lsm.length * .25)];
    const S2 = smp.filter(k => L2[k] >= lcut);
    const st3 = A => { let m = 0; S2.forEach(k => m += A[k]); m /= S2.length; let v = 0; S2.forEach(k => v += (A[k] - m) * (A[k] - m)); return [m, Math.sqrt(v / S2.length)]; };
    const [mA, sA] = st3(A2), [mB, sB] = st3(B2), Lref = Lsm[Math.floor(Lsm.length * .8)];
    /* قصّ آمن: نحذف فقط ما هو «أرضية بوضوح» ومتصل بحافة الصورة — أغمق بكثير من الورقة (طاولة/ظل) أو لونه مختلف بوضوح (يد، خشب، قماش).
       الورقة نفسها (حتى بإضاءة غير متساوية أو حواف الصفحات) لا تُقصّ أبداً. */
    const tolC = Math.max(24, 4 * Math.hypot(sA, sB)), st = new Int32Array(N); let sp = 0;
    const flood = lmin => { const BGp = new Uint8Array(N), G = new Uint8Array(N); for (let i = 0; i < N; i++) BGp[i] = L2[i] < lmin || Math.hypot(A2[i] - mA, B2[i] - mB) > tolC ? 1 : 0;
      sp = 0; const push = k => { if (BGp[k] && !G[k]) { G[k] = 1; st[sp++] = k; } };
      for (let xx = 0; xx < w; xx++) { push(xx); push((h - 1) * w + xx); } for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
      while (sp) { const k = st[--sp], y = (k / w) | 0, xx = k - y * w; if (xx > 0) push(k - 1); if (xx < w - 1) push(k + 1); if (y > 0) push(k - w); if (y < h - 1) push(k + w); }
      return G; };
    let BG = flood(.42 * Lref);
    /* أرضية فاتحة نسبياً (بلاط/طاولة رمادية): نقبلها كأرضية فقط إذا كانت ملساء بلا كتابة ولا خطوط — الورقة فيها حبر وخطوط دائماً */
    { const BG2 = flood(.66 * Lref); let n = 0, e = 0;
      for (let y = 1; y < h - 1; y++) for (let xx = 1; xx < w - 1; xx++) { const k = y * w + xx; if (!BG2[k] || BG[k]) continue; n++; if (Math.abs(Lm[k + 1] - Lm[k - 1]) + Math.abs(Lm[k + w] - Lm[k - w]) > 46) e++; }
      if (n > N * .01 && e / n < .02) BG = BG2; }
    /* الورقة = كل ما ليس أرضية، ونأخذ المكوّن المتصل بوسط الصورة */
    const C = new Uint8Array(N); { let k0 = Math.floor(h / 2) * w + Math.floor(w / 2); if (BG[k0]) { for (let d = 1; d < Math.min(w, h) / 3 && BG[k0]; d++) k0 = Math.floor(h / 2) * w + Math.floor(w / 2) + d; }
      sp = 0; if (!BG[k0]) { C[k0] = 1; st[sp++] = k0; }
      while (sp) { const k = st[--sp], y = (k / w) | 0, xx = k - y * w; const nb = [xx > 0 ? k - 1 : -1, xx < w - 1 ? k + 1 : -1, y > 0 ? k - w : -1, y < h - 1 ? k + w : -1]; for (const q of nb) if (q >= 0 && !BG[q] && !C[q]) { C[q] = 1; st[sp++] = q; } } }
    let area = 0; for (let i = 0; i < N; i++) area += C[i];
    const frac = area / N;
    const full = { q: [[0, 0], [1, 0], [1, 1], [0, 1]], c: "full" };
    if (frac > .97) return full;
    if (frac < .15) return Object.assign(full, { c: "low" });
    /* نقاط الحافة + الزوايا الأولية (أقصى x±y) */
    const B = []; let tl = null, tr = null, br = null, bl = null, vTL = 1e9, vTR = -1e9, vBR = -1e9, vBL = -1e9;
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      const k = y * w + xx; if (!C[k]) continue;
      if (xx === 0 || xx === w - 1 || y === 0 || y === h - 1 || !C[k - 1] || !C[k + 1] || !C[k - w] || !C[k + w]) B.push([xx, y]);
      const s = xx + y, d = xx - y;
      if (s < vTL) { vTL = s; tl = [xx, y]; } if (s > vBR) { vBR = s; br = [xx, y]; } if (d > vTR) { vTR = d; tr = [xx, y]; } if (-d > vBL) { vBL = -d; bl = [xx, y]; }
    }
    let Q = [tl, tr, br, bl];
    /* خط لكل ضلع: نقاط الحافة القريبة من الضلع ← ملاءمة (مع حذف الأبعد ٣٠٪ وإعادة الملاءمة) ← تقاطع الخطوط. تكرار مرتين */
    const tls = pts => { let mx = 0, my = 0; pts.forEach(p => { mx += p[0]; my += p[1]; }); mx /= pts.length; my /= pts.length; let sxx = 0, sxy = 0, syy = 0; pts.forEach(p => { const u = p[0] - mx, v = p[1] - my; sxx += u * u; sxy += u * v; syy += v * v; }); const ang = .5 * Math.atan2(2 * sxy, sxx - syy); return { p: [mx, my], d: [Math.cos(ang), Math.sin(ang)] }; };
    const dist = (l, p) => Math.abs((p[0] - l.p[0]) * l.d[1] - (p[1] - l.p[1]) * l.d[0]);
    const fit = (a, b, tf) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy); if (len < 10) return null;
      const nx = -dy / len, ny = dx / len, tol = Math.max(4, len * tf); let pts = [];
      for (const p of B) { const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (len * len); if (t < .06 || t > .94) continue; if (Math.abs((p[0] - a[0]) * nx + (p[1] - a[1]) * ny) <= tol) pts.push(p); }
      if (pts.length < len * .2) return null;
      const l = tls(pts); pts = pts.map(p => [p, dist(l, p)]).sort((x, y) => x[1] - y[1]).slice(0, Math.ceil(pts.length * .7)).map(x => x[0]); return tls(pts);
    };
    const X = (l1, l2) => { const det = l1.d[0] * (-l2.d[1]) - l1.d[1] * (-l2.d[0]); if (Math.abs(det) < 1e-6) return null; const rx = l2.p[0] - l1.p[0], ry = l2.p[1] - l1.p[1], t = (rx * (-l2.d[1]) - ry * (-l2.d[0])) / det; return [l1.p[0] + t * l1.d[0], l1.p[1] + t * l1.d[1]]; };
    for (const tf of [.06, .025]) {
      const Ls = [fit(Q[0], Q[1], tf), fit(Q[1], Q[2], tf), fit(Q[2], Q[3], tf), fit(Q[3], Q[0], tf)];
      if (!Ls.every(Boolean)) break;
      const Q2 = [X(Ls[3], Ls[0]), X(Ls[0], Ls[1]), X(Ls[1], Ls[2]), X(Ls[2], Ls[3])];
      if (Q2.every(p => p && p[0] > -w * .05 && p[0] < w * 1.05 && p[1] > -h * .05 && p[1] < h * 1.05)) Q = Q2; else break;
    }
    /* ضمان عدم قصّ أي جزء من الورقة: الشكل الرباعي يجب أن يحوي كل نقاطها؛ وإلا نوسّعه، وأخيراً المستطيل المحيط */
    const inside = (Qx, px, py) => { let sg = 0; for (let k = 0; k < 4; k++) { const a = Qx[k], b = Qx[(k + 1) % 4], cr = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]); if (cr) { const g = cr > 0 ? 1 : -1; if (!sg) sg = g; else if (g !== sg) return false; } } return true; };
    const outN = Qx => { let n = 0; for (let k = 0; k < B.length; k += 2) if (!inside(Qx, B[k][0], B[k][1])) n++; return n * 2; };
    const cx = Q.reduce((s, p) => s + p[0], 0) / 4, cy = Q.reduce((s, p) => s + p[1], 0) / 4, grow = (Qx, f) => Qx.map(p => [cx + (p[0] - cx) * f, cy + (p[1] - cy) * f]);
    let Qs = grow(Q, 1.012), ok2 = false;
    for (let f = 1.012; f <= 1.08; f += .012) { Qs = grow(Q, f); if (outN(Qs) <= B.length * .004) { ok2 = true; break; } }
    if (!ok2) { let x0 = w, y0 = h, x1 = 0, y1 = 0; for (const p of B) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } const m = Math.max(w, h) * .01; Qs = [[x0 - m, y0 - m], [x1 + m, y0 - m], [x1 + m, y1 + m], [x0 - m, y1 + m]]; }
    Q = Qs.map(p => [Math.min(w, Math.max(0, p[0])), Math.min(h, Math.max(0, p[1]))]);
    /* حافة قريبة جداً من حافة الصورة: نلصقها بها (الورقة تكمل خارج الإطار) */
    const sn = Math.max(w, h) * .025; Q = Q.map(([px, py]) => [px < sn ? 0 : px > w - sn ? w : px, py < sn ? 0 : py > h - sn ? h : py]);
    /* الثقة: نسبة مساحة الورقة إلى مساحة الشكل الرباعي، وتباين الإضاءة داخلها وخارجها */
    const qa = Math.abs(Q.reduce((s, p, i) => { const n = Q[(i + 1) % 4]; return s + p[0] * n[1] - n[0] * p[1]; }, 0)) / 2;
    let li = 0, ni = 0, lo = 0, no = 0; for (let i = 0; i < N; i += 3) { if (C[i]) { li += Lm[i]; ni++; } else { lo += Lm[i]; no++; } }
    const ratio = area / Math.max(1, qa), contrast = (ni ? li / ni : 0) - (no ? lo / no : 0);
    const c2 = ok2 && ratio > .8 && ratio < 1.15 && contrast > 15 && frac > .2 ? "ok" : "low";
    return { q: Q.map(p => [p[0] / w, p[1] / h]), c: c2 };
  }
  /* تصحيح المنظور: الشكل الرباعي ← مستطيل بدقة الصورة الأصلية (حتى MAXL) */
  function homog(src, dst) {
    /* يحل H بحيث dst→src (8 مجاهيل) */
    const A = [], bb = [];
    for (let i = 0; i < 4; i++) { const [x, y] = dst[i], [u, v] = src[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); bb.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); bb.push(v); }
    const n = 8; for (let i = 0; i < n; i++) { let mx = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[mx][i])) mx = k; [A[i], A[mx]] = [A[mx], A[i]];[bb[i], bb[mx]] = [bb[mx], bb[i]]; const p = A[i][i] || 1e-12; for (let k = i + 1; k < n; k++) { const f = A[k][i] / p; for (let j = i; j < n; j++) A[k][j] -= f * A[i][j]; bb[k] -= f * bb[i]; } }
    const x = new Array(n); for (let i = n - 1; i >= 0; i--) { let s = bb[i]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / (A[i][i] || 1e-12); }
    return [...x, 1];
  }
  const rotQ = (q, k) => { let Q = q.map(p => p.slice()); for (let i = 0; i < ((k % 4) + 4) % 4; i++) Q = Q.map(([x, y]) => [1 - y, x]); return Q; };
  async function render238(bm, q, rot, maxL) {
    /* bm: الصورة الأصلية، q: الزوايا بنسب (قبل التدوير)، rot: تدوير ×٩٠ بعد القص */
    const [w0, h0] = dims(bm); maxL = maxL || MAXL;
    const P = q.map(([x, y]) => [x * w0, y * h0]);
    const dst = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    let ow = Math.max(dst(P[0], P[1]), dst(P[3], P[2])), oh = Math.max(dst(P[0], P[3]), dst(P[1], P[2]));
    const s = Math.min(1, maxL / Math.max(ow, oh)); ow = Math.max(1, Math.round(ow * s)); oh = Math.max(1, Math.round(oh * s));
    let out;
    const axis = Math.abs(P[0][1] - P[1][1]) < 2 && Math.abs(P[3][1] - P[2][1]) < 2 && Math.abs(P[0][0] - P[3][0]) < 2 && Math.abs(P[1][0] - P[2][0]) < 2;
    if (axis) {
      out = canvas(ow, oh); const x = out.getContext("2d"); x.imageSmoothingQuality = "high"; x.fillStyle = "#fff"; x.fillRect(0, 0, ow, oh);
      x.drawImage(bm, P[0][0], P[0][1], P[1][0] - P[0][0], P[3][1] - P[0][1], 0, 0, ow, oh);
    } else {
      /* المصدر بدقة كافية فقط (لا نحمّل ٥٠ ميغا بكسل بالذاكرة) */
      const ss = Math.min(1, 1.15 * Math.max(ow, oh) / Math.max(dst(P[0], P[1]), dst(P[0], P[3]), 1)), sw = Math.max(1, Math.round(w0 * ss)), sh = Math.max(1, Math.round(h0 * ss));
      const sc = canvas(sw, sh), sx = sc.getContext("2d", { willReadFrequently: true }); sx.imageSmoothingQuality = "high"; sx.drawImage(bm, 0, 0, sw, sh);
      const S = sx.getImageData(0, 0, sw, sh).data;
      const Hm = homog(P.map(p => [p[0] * ss, p[1] * ss]), [[0, 0], [ow, 0], [ow, oh], [0, oh]]);
      out = canvas(ow, oh); const ox = out.getContext("2d"), O = ox.createImageData(ow, oh), od = O.data;
      for (let y = 0; y < oh; y++) {
        if (y % 160 === 0) await new Promise(r => setTimeout(r, 0));
        const yc = y + .5;
        for (let x = 0; x < ow; x++) {
          const xc = x + .5, z = Hm[6] * xc + Hm[7] * yc + 1, u = (Hm[0] * xc + Hm[1] * yc + Hm[2]) / z - .5, v = (Hm[3] * xc + Hm[4] * yc + Hm[5]) / z - .5;
          let x0 = Math.floor(u), y0 = Math.floor(v); const fx = u - x0, fy = v - y0;
          const o = (y * ow + x) * 4;
          if (x0 < 0) x0 = 0; if (y0 < 0) y0 = 0; let x1 = x0 + 1, y1 = y0 + 1; if (x1 >= sw) x1 = x0 = sw - 1; if (y1 >= sh) y1 = y0 = sh - 1;
          const a = (y0 * sw + x0) * 4, b = (y0 * sw + x1) * 4, c = (y1 * sw + x0) * 4, d = (y1 * sw + x1) * 4;
          for (let k = 0; k < 3; k++) od[o + k] = (S[a + k] * (1 - fx) + S[b + k] * fx) * (1 - fy) + (S[c + k] * (1 - fx) + S[d + k] * fx) * fy;
          od[o + 3] = 255;
        }
      }
      ox.putImageData(O, 0, 0);
    }
    rot = ((rot || 0) % 4 + 4) % 4;
    if (!rot) return out;
    const r = rot % 2 ? canvas(out.height, out.width) : canvas(out.width, out.height), rx = r.getContext("2d");
    rx.translate(r.width / 2, r.height / 2); rx.rotate(rot * Math.PI / 2); rx.drawImage(out, -out.width / 2, -out.height / 2); return r;
  }
  let WEBP = null;
  const blobOf = (c, t, q) => new Promise(ok => { try { c.toBlob(b => ok(b), t, q); } catch (e) { ok(null); } });
  async function encode(c, q, thumb) {
    if (WEBP == null) { const b = await blobOf(canvas(2, 2), "image/webp", .8); WEBP = !!(b && b.type == "image/webp"); }
    if (WEBP) { const b = await blobOf(c, "image/webp", q); if (b && b.type == "image/webp") return b; }
    return blobOf(c, "image/jpeg", thumb ? .78 : .92);
  }
  /* v250: ضغط ذكي للأرشيف — أعلى دقة ممكنة ضمن ~٦٥٠ ك.ب للصفحة (حتى تكفي المساحة المجانية ١٣٥٠٠+ صفحة)
     يبدأ ٣٢٠٠ بكسل جودة ٠٫٨٦، ولا ينزل أبداً تحت ٢٤٠٠ بكسل جودة ٠٫٧٢ (الخط اليدوي يبقى واضحاً) */
  const ARCT = 650 * 1024, ASTEP = [[3200, .86], [3200, .8], [2800, .8], [2800, .75], [2400, .75], [2400, .72]];
  async function encodeArc(c) {
    let b = null;
    for (const [L, q] of ASTEP) { b = await encode(scaled(c, L), q); if (b && b.size <= ARCT) return b; }
    return b;
  }
  function scaled(c, L) { const s = Math.min(1, L / Math.max(c.width, c.height)); if (s >= 1) return c; const o = canvas(c.width * s, c.height * s), x = o.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(c, 0, 0, o.width, o.height); return o; }
  /* PDF → صور الصفحات */
  async function pdfPages(file) {
    await lib("pdf"); await lib("pdfw"); const L = W.pdfjsLib; L.GlobalWorkerOptions.workerSrc = LIBS.pdfw;
    const doc = await L.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise, out = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const pg = await doc.getPage(i), v0 = pg.getViewport({ scale: 1 }), s = Math.min(4, MAXL / Math.max(v0.width, v0.height)), v = pg.getViewport({ scale: s });
      const c = canvas(v.width, v.height), x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: x, viewport: v }).promise;
      const b = await blobOf(c, "image/png"); out.push(new File([b], file.name.replace(/\.pdf$/i, "") + " — " + i + ".png", { type: "image/png" }));
    }
    return out;
  }

  /* ======================================================================
     الواجهة
     ====================================================================== */
  const bookTitle = b => !b ? "" : b.kind == "q" ? "القيد رقم " + AD(b.n) : b.kind == "w" ? "السجل الوسطي للعام الدراسي " + AD(b.yr) + (b.title ? " — " + E(b.title) : "") : "البورد الوزاري — " + (CLS[b.cls] || "") + " — " + (RD[b.rd] || "") + " — " + AD(b.yr);
  const bookPlain = b => !b ? "" : b.kind == "q" ? "القيد رقم " + b.n : b.kind == "w" ? "السجل الوسطي " + b.yr + (b.title ? " — " + b.title : "") : "البورد الوزاري " + (CLS[b.cls] || "") + " " + (RD[b.rd] || "") + " " + b.yr;
  function pgList(b) {
    if (!b) return [];
    if (b.kind == "q") {
      const a = PGN(b.p0), z = PGN(b.p1), S = new Set(); for (let n = a; n <= z && n - a < 3000; n++) S.add(String(n));
      for (const p of names().keys()) { const n = PGN(p); if (n >= a && n <= z) S.add(p); }
      for (const r of AR.P.values()) if (r.bk == "q" && r.v) { const n = PGN(r.pg); if (n >= a && n <= z) S.add(r.pg); }
      return [...S].sort(pgCmp);
    }
    return [...AR.P.values()].filter(r => r.bk == b.id && r.v).map(r => r.pg).sort(pgCmp);
  }
  const bkCount = b => b.kind == "q" ? [...AR.P.values()].filter(r => r.bk == "q" && r.v && PGN(r.pg) >= PGN(b.p0) && PGN(r.pg) <= PGN(b.p1)).length : [...AR.P.values()].filter(r => r.bk == b.id && r.v).length;
  const nmList = (pg, max) => { const L = names().get(pg) || []; return L.slice(0, max || 3).map(r => E(r.n)).join("، ") + (L.length > (max || 3) ? "…" : ""); };
  const fsz = n => !n ? "٠" : n >= 1073741824 ? AD((n / 1073741824).toFixed(2)) + " غ.ب" : n >= 1048576 ? AD((n / 1048576).toFixed(1)) + " م.ب" : AD(Math.max(1, Math.round(n / 1024))) + " ك.ب";
  const dt = ms => { try { const d = new Date(+ms); return AD(d.getDate()) + "‏/‏" + AD(d.getMonth() + 1) + "‏/‏" + AD(d.getFullYear()); } catch (e) { return ""; } };

  function tile(bk, pg, b) {
    const a = page(bk, pg), nm = bk == "q" ? nmList(pg, 2) : "";
    return `<button type="button" class="ar-t${a ? "" : " miss"}" onclick="${a ? `view238('${bk}','${E(pg)}')` : `up238('${bk}','${E(pg)}')`}">
      <span class="ar-th">${a ? `<img data-ar238="${a.v}" alt="">` : `<i>${IC("plus")}</i>`}${a && a.nv > 1 ? `<em title="عدد النسخ">${AD(a.nv)}</em>` : ""}</span>
      <b>صفحة ${AD(pg)}</b>${bk == "q" ? `<span class="${nm ? "" : "warn"}">${nm || "لا يوجد اسم بهذه الصفحة"}</span>` : ""}</button>`;
  }
  function hydrate() {
    const L = D.querySelectorAll("img[data-ar238]:not([data-l])"); if (!L.length) return;
    const io = hydrate.io || (hydrate.io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const im = e.target; hydrate.io.unobserve(im);
      img(im.dataset.ar238, 1).then(u => { if (u) im.src = u; else img(im.dataset.ar238, 0).then(u2 => im.src = u2).catch(() => im.classList.add("err")); }).catch(() => im.classList.add("err"));
    }), { rootMargin: "600px" }));
    L.forEach(im => { im.dataset.l = 1; const k = "t:" + im.dataset.ar238; if (MEM.has(k)) im.src = MEM.get(k); else io.observe(im); });
  }
  new MutationObserver(() => { if (inView() || D.getElementById("ar238v")) { clearTimeout(hydrate.t); hydrate.t = setTimeout(hydrate, 30); } }).observe(D.documentElement, { childList: true, subtree: true });

  const tabs = () => `<div class="seg ar-seg">${[["q", "القيد العام"], ["w", "السجلات الوسطية"], ["b", "البورد الوزاري القديم"], ["s", "البحث"]].map(([k, t]) => `<button class="${AR.tab == k && !AR.book ? "on" : ""}" onclick="AR238.tab='${k}';AR238.book=null;AR238.form=null;render()">${t}</button>`).join("")}</div>`;
  function head() {
    const tot = [...AR.P.values()].filter(r => r.v), q = tot.filter(r => r.bk == "q").length, nq = names().size, sz = tot.reduce((s, r) => s + (r.sz || 0), 0);
    return `<div class="vh"><h2>بوابة الأرشفة الإلكترونية</h2><span class="sub">صفحات القيد المؤرشفة ${AD(q)} من ${AD(nq)} — كل الصفحات ${AD(tot.length)} (${fsz(sz)})</span></div>
      ${AR.err ? `<div class="banner err">تعذّر الاتصال بالخادم الآن — المعروض آخر نسخة محفوظة بالجهاز. <button class="btn sm" onclick="AR238.err='';AR238L()">إعادة المحاولة</button></div>` : ""}
      ${AR.mig && AR.mig.n ? `<div class="banner">نقل صور القيد السابقة إلى البوابة: ${AD(AR.mig.d)} من ${AD(AR.mig.n)}${AR.mig.f ? " — تعذّر " + AD(AR.mig.f) : ""}</div>` : ""}
      ${tabs()}`;
  }
  function vQ() {
    const B = qBooks();
    if (AR.form == "ranges") return head() + rangesForm();
    if (!B.length) return head() + (AR.ready ? `<div class="box"><b>جارٍ إعداد تقسيم القيود من القيد العام…</b><p class="muted">يُقسَّم تلقائياً حسب «رقم القيد» و«رقم الصفحة» المسجلين في القيد العام.</p><div class="tools"><button class="btn" onclick="AR238.form='ranges';render()">إعداد التقسيم يدوياً</button></div></div>` : `<div class="banner">جارٍ التحميل…</div>`);
    return head() + `<div class="tools"><button class="btn" onclick="up238('q','')">${IC("arup")} رفع صفحات</button><button class="btn ghost" onclick="AR238.form='ranges';HOLD=1;render()">${IC("edit")} تقسيم القيود (من صفحة … إلى صفحة …)</button><button class="btn ghost" onclick="AR238.tab='s';render()">${IC("search")} بحث</button></div>
      <div class="ar-books">${B.map(b => { const n = PGN(b.p1) - PGN(b.p0) + 1, c = bkCount(b), pc = Math.min(100, Math.round(c / Math.max(1, n) * 100));
        return `<button type="button" class="ar-b" onclick="AR238.book='${b.id}';AR238.filt='all';render();scrollTo(0,0)"><b>القيد رقم ${AD(b.n)}</b><span>الصفحات ${AD(b.p0)} – ${AD(b.p1)}</span><i class="ar-bar"><s style="width:${pc}%"></s></i><em>${c >= n ? "مكتمل " : ""}${AD(c)} من ${AD(n)}</em></button>`; }).join("")}</div>`;
  }
  function rangesForm() {
    const B = qBooks(), R = qRanges(), byN = {}; R.forEach(o => byN[o.n] = o);
    const rows = (B.length ? B : R.map(o => ({ n: o.n, p0: String(o.p0), p1: String(o.p1) })));
    return `<div class="box hl"><h3>تقسيم القيود — من صفحة … إلى صفحة …</h3>
      <p class="muted">كل قيد ومدى صفحاته. القيم الأولى مأخوذة من القيد العام (رقم القيد ورقم الصفحة لكل طالب). عدّل أي رقم مباشرة، أو أضف قيداً جديداً كل عام دراسي.</p>
      <div class="tw"><table class="ar-rt"><tr><th>رقم القيد</th><th>من صفحة</th><th>إلى صفحة</th><th>عدد الصفحات</th><th class="l">حسب القيد العام</th><th></th></tr>
      ${rows.map((b, i) => { const o = byN[b.n]; const diff = o && (String(o.p0) != String(b.p0) || String(o.p1) != String(b.p1)); return `<tr data-i="${i}"><td><input class="ar-n" inputmode="numeric" value="${AD(b.n)}"></td><td><input class="ar-p0" inputmode="numeric" value="${AD(b.p0)}"></td><td><input class="ar-p1" inputmode="numeric" value="${AD(b.p1)}"></td><td>${AD(PGN(b.p1) - PGN(b.p0) + 1)}</td><td class="l ${diff ? "warn" : "sub"}">${o ? AD(o.p0) + " – " + AD(o.p1) + " (" + AD(o.c) + " طالب)" : "—"}</td><td><button class="btn ghost sm" onclick="this.closest('tr').remove()">حذف</button></td></tr>`; }).join("")}
      </table></div>
      <div class="tools"><button class="btn ghost" onclick="AR238RAdd()">${IC("plus")} إضافة قيد</button><button class="btn ghost" onclick="AR238RFill()">ملء من القيد العام</button><button class="btn" onclick="AR238RSave(this)">${IC("ok")} حفظ التقسيم</button><button class="btn ghost" onclick="AR238.form=null;HOLD=0;render()">إلغاء</button></div></div>`;
  }
  W.AR238RAdd = () => { const t = D.querySelector(".ar-rt"); if (!t) return; const L = [...t.querySelectorAll("tr[data-i]")], last = L[L.length - 1], n = last ? PGN(EN(last.querySelector(".ar-n").value)) + 1 : 1, p = last ? PGN(EN(last.querySelector(".ar-p1").value)) + 1 : 1; const tr = D.createElement("tr"); tr.dataset.i = "n"; tr.innerHTML = `<td><input class="ar-n" inputmode="numeric" value="${AD(n)}"></td><td><input class="ar-p0" inputmode="numeric" value="${AD(p)}"></td><td><input class="ar-p1" inputmode="numeric" value="${AD(p + 199)}"></td><td></td><td class="l sub">جديد</td><td><button class="btn ghost sm" onclick="this.closest('tr').remove()">حذف</button></td>`; t.querySelector("tbody").appendChild(tr); tr.querySelector(".ar-p1").focus(); };
  W.AR238RFill = () => { const R = qRanges(), t = D.querySelector(".ar-rt"); if (!t) return; [...t.querySelectorAll("tr[data-i]")].forEach(tr => tr.remove()); R.forEach(o => { const tr = D.createElement("tr"); tr.dataset.i = "f"; tr.innerHTML = `<td><input class="ar-n" value="${AD(o.n)}"></td><td><input class="ar-p0" value="${AD(o.p0)}"></td><td><input class="ar-p1" value="${AD(o.p1)}"></td><td>${AD(o.p1 - o.p0 + 1)}</td><td class="l sub">${AD(o.c)} طالب</td><td><button class="btn ghost sm" onclick="this.closest('tr').remove()">حذف</button></td>`; t.querySelector("tbody").appendChild(tr); }); };
  W.AR238RSave = async btn => {
    const t = D.querySelector(".ar-rt"); if (!t) return;
    const L = [...t.querySelectorAll("tr[data-i]")].map(tr => ({ kind: "q", n: PGN(EN(tr.querySelector(".ar-n").value)), p0: PG(tr.querySelector(".ar-p0").value), p1: PG(tr.querySelector(".ar-p1").value) }));
    const bad = L.find(o => !o.n || !o.p0 || !o.p1 || PGN(o.p1) < PGN(o.p0)); if (bad) return T0("تحقق من أرقام القيد " + AD(bad.n || "") + " — «إلى صفحة» يجب أن تكون أكبر من «من صفحة»", "err");
    const S = L.slice().sort((a, b) => PGN(a.p0) - PGN(b.p0)); for (let i = 1; i < S.length; i++) if (PGN(S[i].p0) <= PGN(S[i - 1].p1)) return T0("صفحات القيد " + AD(S[i].n) + " تتداخل مع القيد " + AD(S[i - 1].n), "err");
    if (new Set(L.map(o => o.n)).size != L.length) return T0("رقم قيد مكرر", "err");
    const old = qBooks().filter(b => !L.some(o => o.n == b.n)).map(b => ({ kind: "q", n: b.n, p0: b.p0, p1: b.p1, del: 1 }));
    btn.disabled = true; btn.textContent = "جارٍ الحفظ…";
    try { await call("books", { L: [...L, ...old] }); await load(1); AR.form = null; HOLD = 0; render(); T0("حُفظ تقسيم القيود"); }
    catch (e) { btn.disabled = false; btn.textContent = "حفظ التقسيم"; T0(e && e.msg || "تعذّر الحفظ — تحقق من الاتصال", "err"); }
  };
  function vBook() {
    const b = AR.books[AR.book]; if (!b) { AR.book = null; return V.ar238(); }
    const L = pgList(b), has = L.filter(p => page(b.id == "q" || b.kind == "q" ? "q" : b.id, p)), bk = b.kind == "q" ? "q" : b.id;
    const F = AR.filt == "miss" ? L.filter(p => !page(bk, p)) : AR.filt == "has" ? L.filter(p => page(bk, p)) : L;
    const back = b.kind == "q" ? "q" : b.kind;
    return `<div class="vh"><h2>${bookTitle(b)}</h2><span class="sub">${b.kind == "q" ? "الصفحات " + AD(b.p0) + " – " + AD(b.p1) + " — " : ""}المؤرشف ${AD(has.length)}${b.kind == "q" ? " من " + AD(L.length) : " صفحة"}</span></div>
      <div class="tools"><button class="btn ghost" onclick="AR238.book=null;AR238.tab='${back}';render()">رجوع</button><button class="btn" onclick="up238('${bk}','')">${IC("arup")} ${b.kind == "q" ? "رفع صفحات" : "إضافة صفحات"}</button>
      ${b.kind == "q" ? `<div class="seg">${[["all", "الكل"], ["has", "المؤرشفة"], ["miss", "الناقصة (" + AD(L.length - has.length) + ")"]].map(([k, t]) => `<button class="${AR.filt == k ? "on" : ""}" onclick="AR238.filt='${k}';render()">${t}</button>`).join("")}</div>` : `<button class="btn ghost" onclick="AR238Edit('${b.id}')">${IC("edit")} تعديل</button>${has.length ? `<button class="btn ghost" onclick="AR238Print('${b.id}')">${IC("arprint")} طباعة السجل كاملاً</button>` : ""}`}</div>
      ${AR.form && AR.form.id == b.id ? bookForm(b.kind, b) : ""}
      ${b.note ? `<p class="muted">${E(b.note)}</p>` : ""}
      <div class="ar-grid">${F.map(p => tile(bk, p, b)).join("") || `<div class="box empty"><b>${b.kind == "q" ? "لا توجد صفحات بهذا الاختيار" : "لا توجد صفحات بعد"}</b>${b.kind == "q" ? "" : "اضغط «إضافة صفحات» واختر صور السجل أو ملف PDF — تُرتَّب حسب أسماء الملفات."}</div>`}</div>`;
  }
  function bookForm(kind, b) {
    b = b || {}; const id = b.id || "";
    return `<div class="box hl ar-form"><h3>${id ? "تعديل" : "إضافة"} ${kind == "w" ? "سجل وسطي" : "بورد وزاري"}</h3><div class="fgrid">
      <label>العام الدراسي<input id="arf_yr" dir="ltr" inputmode="numeric" placeholder="2023-2024" value="${E(b.yr || "")}"></label>
      ${kind == "b" ? `<label>الصف<select id="arf_cls">${Object.entries(CLS).map(([k, t]) => `<option value="${k}" ${(b.cls || AR.cls) == k ? "selected" : ""}>${t}</option>`).join("")}</select></label><label>الدور<select id="arf_rd">${[1, 2].map(k => `<option value="${k}" ${(b.rd || AR.rd) == k ? "selected" : ""}>${RD[k]}</option>`).join("")}</select></label>` : ""}
      <label class="wide">العنوان (اختياري)<input id="arf_t" placeholder="${kind == "w" ? "مثل: الصف الرابع — الكورس الأول" : "مثل: الجزء الأول"}" value="${E(b.title || "")}"></label>
      <label class="wide">ملاحظات<input id="arf_n" value="${E(b.note || "")}"></label></div>
      <div class="tools"><button class="btn" onclick="AR238Save('${kind}','${id}',this)">${IC("ok")} حفظ</button><button class="btn ghost" onclick="AR238.form=null;HOLD=0;render()">إلغاء</button>${id ? `<button class="btn danger" onclick="ask(this,()=>AR238Del('${id}'))">حذف</button>` : ""}</div></div>`;
  }
  W.AR238Edit = id => { AR.form = { id }; HOLD = 1; render(); };
  W.AR238Save = async (kind, id, btn) => {
    const yr = YRS(D.getElementById("arf_yr").value); if (!yr) return T0("اكتب العام الدراسي مثل 2023-2024", "err");
    const o = { kind, id: id || undefined, yr, title: D.getElementById("arf_t").value.trim(), note: D.getElementById("arf_n").value.trim() };
    if (kind == "b") { o.cls = D.getElementById("arf_cls").value; o.rd = +D.getElementById("arf_rd").value; }
    btn.disabled = true;
    try { const r = await call("books", { L: [o] }); await load(1); AR.form = null; HOLD = 0; if (!id && r.ids && r.ids[0]) AR.book = r.ids[0]; render(); T0("حُفظ"); }
    catch (e) { btn.disabled = false; T0(e && e.msg || "تعذّر الحفظ", "err"); }
  };
  W.AR238Del = async id => {
    const b = AR.books[id]; if (!b) return; const n = bkCount(b);
    if (n && !confirm("في هذا السجل " + n + " صفحة. حذفه يخفي صفحاته من البوابة (تبقى محفوظة في الخادم). متأكد؟")) return;
    try { await call("books", { L: [Object.assign({}, b, { del: 1 })], force: 1 }); await load(1); AR.form = null; AR.book = null; HOLD = 0; render(); T0("حُذف"); }
    catch (e) { T0(e && e.msg || "تعذّر الحذف", "err"); }
  };
  function vW() {
    const B = Object.values(AR.books).filter(b => b.kind == "w" && !b.del).sort((a, b) => String(b.yr).localeCompare(String(a.yr)) || (a.ord || 0) - (b.ord || 0) || String(a.title).localeCompare(String(b.title), "ar"));
    const G = {}; B.forEach(b => (G[b.yr] = G[b.yr] || []).push(b));
    return head() + `<div class="tools"><button class="btn" onclick="AR238.form={kind:'w'};HOLD=1;render()">${IC("plus")} إضافة سجل وسطي لعام دراسي</button></div>
      ${AR.form && AR.form.kind == "w" && !AR.form.id ? bookForm("w") : ""}
      ${Object.keys(G).length ? Object.keys(G).sort().reverse().map(y => `<div class="box"><h3>السجل الوسطي للعام الدراسي ${AD(y)}</h3><div class="ar-books">${G[y].map(b => `<button type="button" class="ar-b" onclick="AR238.book='${b.id}';render();scrollTo(0,0)"><b>${b.title ? E(b.title) : "السجل الوسطي"}</b><span>${AD(y)}</span><em>${AD(bkCount(b))} صفحة</em></button>`).join("")}</div></div>`).join("")
        : `<div class="box empty"><b>لا توجد سجلات وسطية بعد</b>اضغط «إضافة سجل وسطي لعام دراسي»، ثم افتحه وأضف صفحاته.</div>`}`;
  }
  function vB() {
    const B = Object.values(AR.books).filter(b => b.kind == "b" && !b.del && b.cls == AR.cls && +b.rd == +AR.rd);
    const yrs = [...new Set([...OLDY, ...B.map(b => b.yr)])].sort().reverse();
    return head() + `<div class="tools"><div class="seg">${Object.entries(CLS).map(([k, t]) => `<button class="${AR.cls == k ? "on" : ""}" onclick="AR238.cls='${k}';render()">${t}</button>`).join("")}</div><div class="seg">${[1, 2].map(k => `<button class="${+AR.rd == k ? "on" : ""}" onclick="AR238.rd=${k};render()">${RD[k]}</button>`).join("")}</div></div>
      <p class="muted">بوردات الأعوام ١٩٨٨–٢٠١٣. بوردات ٢٠١٣‏-‏٢٠١٤ وما بعدها في «الأرشيف» داخل النظام كما هي.</p>
      <div class="ar-books">${yrs.map(y => { const L = B.filter(b => b.yr == y); if (!L.length) return `<button type="button" class="ar-b miss" onclick="AR238NewB('${y}')"><b>${AD(y)}</b><span>${CLS[AR.cls]} — ${RD[AR.rd]}</span><em>${IC("plus")} إضافة</em></button>`; return L.map(b => `<button type="button" class="ar-b" onclick="AR238.book='${b.id}';render();scrollTo(0,0)"><b>${AD(y)}</b><span>${b.title ? E(b.title) : CLS[b.cls] + " — " + RD[b.rd]}</span><em>${AD(bkCount(b))} صفحة</em></button>`).join(""); }).join("")}
      <button type="button" class="ar-b miss" onclick="AR238.form={kind:'b'};HOLD=1;render()"><b>عام آخر</b><span>أي عام دراسي</span><em>${IC("plus")} إضافة</em></button></div>
      ${AR.form && AR.form.kind == "b" && !AR.form.id ? bookForm("b") : ""}`;
  }
  W.AR238NewB = async y => {
    try { const r = await call("books", { L: [{ kind: "b", yr: y, cls: AR.cls, rd: AR.rd }] }); await load(1); if (r.ids && r.ids[0]) { AR.book = r.ids[0]; render(); up238(r.ids[0], ""); } }
    catch (e) { T0(e && e.msg || "تعذّر الإنشاء", "err"); }
  };
  function vS() {
    const q = AR.q;
    return head() + `<div class="qsearch"><span class="qs-i">${IC("search")}</span><input id="ar_q" type="search" autocomplete="off" enterkeyhint="search" placeholder="اسم الطالب، أو رقم الصفحة، أو رقم القيد ثم الصفحة (مثل: ١٢ ٢٣٠٠)" value="${E(q)}" oninput="AR238.q=this.value;clearTimeout(window._arq);window._arq=setTimeout(()=>{const e=document.getElementById('ar_res');if(e)e.innerHTML=AR238Res()},90)"></div><div id="ar_res">${res()}</div>`;
  }
  function res() {
    const q = AR.q.trim(); if (!q) return `<p class="muted">اكتب جزءاً من اسم الطالب (من القيد العام) أو رقم صفحة.</p>`;
    const T = typeof qTok == "function" ? qTok(q) : q.split(/\s+/), N = T.filter(t => /^\d+$/.test(EN(t))).map(EN), Wd = T.filter(t => !/^\d+$/.test(EN(t)));
    let L = QDa();
    if (Wd.length) L = L.filter(r => on(() => gMatch(r.n, Wd)));
    if (N.length) L = L.filter(r => N.every(n => PG(r.pg) == n || String(r.r) == n || String(r.y || "").includes(n)));
    if (!Wd.length && N.length == 1 && !L.length) L = [];
    const out = L.slice(0, 200);
    let h = `<p class="muted">${AD(L.length)} نتيجة${L.length > 200 ? " — أول ٢٠٠" : ""}</p>`;
    h += out.length ? `<div class="tw"><table><tr><th class="l">اسم الطالب</th><th>رقم القيد</th><th>الصفحة</th><th>السنة</th><th>صورة الصفحة</th></tr>${out.map(r => { const p = PG(r.pg), a = p && page("q", p); return `<tr><td class="l"><b>${E(r.n)}</b></td><td>${AD(r.r || "")}</td><td>${AD(r.pg || "")}</td><td>${AD(r.y || "")}</td><td>${a ? `<button class="btn sm" onclick="view238('q','${E(p)}')">عرض</button>` : p ? `<button class="btn ghost sm" onclick="up238('q','${E(p)}')">${IC("plus")} رفع</button>` : ""}</td></tr>`; }).join("")}</table></div>` : "";
    if (N.length == 1 && !Wd.length) { const p = PG(N[0]); if (p) h = `<div class="box"><b>صفحة ${AD(p)}</b> — ${page("q", p) ? `<button class="btn sm" onclick="view238('q','${p}')">عرض الصورة</button>` : `<button class="btn ghost sm" onclick="up238('q','${p}')">رفع صورتها</button>`} <span class="sub">${nmList(p, 4)}</span></div>` + h; }
    return h;
  }
  W.AR238Res = res;
  W.AR238L = () => load();

  /* القسم نفسه */
  const V238 = () => {
    on(() => { CURX = null; });
    if (!isOwn()) return on(() => emptyState("هذا القسم خاص بمدير النظام", "")) || "";
    if (!gxOn()) return `<div class="box empty"><b>بوابة الأرشفة تعمل من حساب «مدير النظام» على رابط المدرسة</b>سجّل الدخول بحساب مدير النظام.</div>`;
    if (!AR.ready && !LOADP) load(); else if (AR.ready && Date.now() - (AR.t || 0) > 20000) { AR.t = Date.now(); load(1); }
    on(() => { if (typeof qSub == "function") qSub(); });
    setTimeout(migStart, 15000);
    if (AR.book) return vBook();
    return AR.tab == "w" ? vW() : AR.tab == "b" ? vB() : AR.tab == "s" ? vS() : vQ();
  };

  /* ======================================================================
     عارض الصفحة: تكبير/تصغير/سحب/تدوير، السابقة/التالية، الطباعة، التنزيل، الاستبدال، النسخ
     ====================================================================== */
  let VW = null;
  function sibs(bk, pg) {
    if (bk == "q") { const b = bookOfPg(pg); const L = b ? pgList(b).filter(p => page("q", p)) : [...AR.P.values()].filter(r => r.bk == "q" && r.v).map(r => r.pg).sort(pgCmp); return L; }
    return pgList(AR.books[bk]);
  }
  W.view238 = function (bk, pg) {
    pg = PG(pg) || pg; const a = page(bk, pg); if (!a) return up238(bk, pg);
    let el = D.getElementById("ar238v");
    if (!el) {
      el = D.createElement("div"); el.id = "ar238v"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
      el.innerHTML = `<div class="ar-vt"><button class="btn ghost sm" data-a="x" aria-label="إغلاق">✕</button><b class="ar-vtt"></b><span class="ar-vts"></span><span class="sp"></span>
        <button class="btn ghost sm" data-a="prev" title="السابقة">${IC("arnext")}</button><button class="btn ghost sm" data-a="next" title="التالية">${IC("arprev")}</button>
        <button class="btn ghost sm" data-a="zo" title="تصغير">${IC("arzout")}</button><button class="btn ghost sm" data-a="zi" title="تكبير">${IC("arzin")}</button><button class="btn ghost sm" data-a="fit" title="ملء الشاشة">${IC("arfit")}</button><button class="btn ghost sm" data-a="rot" title="تدوير العرض">${IC("arrot")}</button>
        <button class="btn ghost sm" data-a="info">المعلومات</button></div>
        <div class="ar-vs"><img class="ar-vi" alt="" draggable="false"><div class="ar-vl">جارٍ تحميل الصورة…</div></div>
        <aside class="ar-vp"></aside>`;
      D.body.appendChild(el); wireViewer(el);
      try { history.pushState({ ar238v: 1 }, ""); } catch (e) { }
    }
    VW = VW || { z: 1, x: 0, y: 0, r: 0, info: innerWidth > 900 };
    VW.bk = bk; VW.pg = pg; VW.z = 1; VW.x = 0; VW.y = 0; VW.r = 0;
    el.classList.toggle("info", !!VW.info);
    showPage();
  };
  function close238() { const el = D.getElementById("ar238v"); if (el) { el.remove(); VW && (VW.bk = null); } }
  W.addEventListener("popstate", () => { if (D.getElementById("ar238v")) close238(); if (D.getElementById("ar238c")) D.getElementById("ar238c").remove(); });
  async function showPage() {
    const el = D.getElementById("ar238v"); if (!el || !VW.bk) return;
    const { bk, pg } = VW, a = page(bk, pg); if (!a) return close238();
    const b = bk == "q" ? bookOfPg(pg) : AR.books[bk];
    el.querySelector(".ar-vtt").textContent = (bk == "q" ? (b ? "القيد رقم " + AD(b.n) + " — " : "") : bookPlain(b) + " — ") + "صفحة " + AD(pg);
    const S = sibs(bk, pg), i = S.indexOf(pg);
    el.querySelector(".ar-vts").textContent = i >= 0 ? AD(i + 1) + " / " + AD(S.length) : "";
    el.querySelector('[data-a="prev"]').disabled = i <= 0; el.querySelector('[data-a="next"]').disabled = i < 0 || i >= S.length - 1;
    panel();
    const im = el.querySelector(".ar-vi"), ld = el.querySelector(".ar-vl"); ld.hidden = false; ld.textContent = "جارٍ تحميل الصورة…";
    const tk = MEM.get("t:" + a.v); if (tk) { im.src = tk; im.classList.add("blur"); } else im.removeAttribute("src");
    tf();
    try {
      const u = await img(a.v, 0); if (VW.pg != pg || VW.bk != bk) return;
      im.src = u; await im.decode().catch(() => 0); im.classList.remove("blur"); ld.hidden = true;
    } catch (e) { if (VW.pg == pg) { ld.innerHTML = `تعذّر تحميل الصورة الآن. <button class="btn sm" onclick="view238('${bk}','${E(pg)}')">إعادة المحاولة</button>`; } return; }
    /* تجهيز السابقة والتالية */
    [S[i - 1], S[i + 1]].filter(Boolean).forEach(p => { const x = page(bk, p); if (x) img(x.v, 0).catch(() => 0); });
  }
  function tf() { const el = D.getElementById("ar238v"); if (!el) return; el.querySelector(".ar-vi").style.transform = `translate(${VW.x}px,${VW.y}px) scale(${VW.z}) rotate(${VW.r * 90}deg)`; }
  async function panel() {
    const el = D.getElementById("ar238v"); if (!el) return; const p = el.querySelector(".ar-vp"), { bk, pg } = VW, a = page(bk, pg);
    const N = bk == "q" ? (names().get(pg) || []) : [];
    const b = bk == "q" ? bookOfPg(pg) : null;
    const warnR = bk == "q" && b && N.some(r => r.r && +EN(r.r) != b.n);
    p.innerHTML = `${bk == "q" ? `<h4>الطالب في هذه الصفحة</h4>${N.length ? N.map(r => `<div class="ar-nm"><b>${E(r.n)}</b><span>رقم القيد ${AD(r.r || "—")} — السنة ${AD(r.y || "—")}</span><button class="btn ghost sm" onclick="AR238Stu('${E(r.i)}')">فتح في القيد العام</button></div>`).join("") : `<p class="warn">لا يوجد في القيد العام اسم مسجّل برقم الصفحة ${AD(pg)}.</p>`}${warnR ? `<p class="warn">تنبيه: رقم القيد في القيد العام يختلف عن تقسيم القيود (القيد ${AD(b.n)}).</p>` : ""}` : ""}
      <h4>الصورة الحالية</h4><p class="sub">${dt(a.at)} — ${a.w ? AD(a.w) + "×" + AD(a.h) + " بكسل — " : ""}${fsz(a.sz || 0)}${a.nv > 1 ? " — النسخة " + AD(a.nv) : ""}</p>
      <label class="ar-nt">ملاحظة هذه النسخة (ماذا زُوِّد / ما الذي تغيّر)<textarea rows="2" id="ar_vnt" placeholder="مثل: زُوِّد بوثيقة تخرج بتاريخ …">${E(a.nt || "")}</textarea></label>
      <button class="btn ghost sm" onclick="AR238Nt(this)">حفظ الملاحظة</button>
      <div class="ar-va">
        <button class="btn" onclick="AR238Rep()">${IC("arup")} استبدال بصورة أحدث</button>
        <button class="btn ghost" onclick="AR238Recrop()">${IC("arcrop")} إعادة القص</button>
        <button class="btn ghost" onclick="AR238Pr()">${IC("arprint")} طباعة</button>
        <button class="btn ghost" onclick="AR238Dl()">${IC("ardl")} تنزيل</button>
        <button class="btn ghost" onclick="AR238Hist()">${IC("arhist")} النسخ السابقة${a.nv > 1 ? " (" + AD(a.nv - 1) + ")" : ""}</button>
        ${bk != "q" ? `<button class="btn ghost" onclick="AR238Mv(-1)">تقديم الصفحة</button><button class="btn ghost" onclick="AR238Mv(1)">تأخير الصفحة</button>` : ""}
        <button class="btn danger" onclick="ask(this,()=>AR238PDel())">حذف الصفحة</button></div>
      <div id="ar_hist"></div>`;
  }
  W.AR238Stu = id => { close238(); on(() => { view("q"); QSEL = id; HOLD = 1; render(); scrollTo(0, 0); }); };
  W.AR238Nt = async btn => { const v = D.getElementById("ar_vnt").value.trim(); btn.disabled = true; try { await call("set", { bk: VW.bk, pg: VW.pg, nt: v }); await load(1); T0("حُفظت الملاحظة"); } catch (e) { T0("تعذّر الحفظ", "err"); } btn.disabled = false; };
  W.AR238Hist = async () => {
    const box = D.getElementById("ar_hist"); if (!box) return; box.innerHTML = `<p class="sub">جارٍ التحميل…</p>`;
    try {
      const r = await call("vers", { bk: VW.bk, pg: VW.pg }), a = page(VW.bk, VW.pg);
      box.innerHTML = `<h4>كل نسخ هذه الصفحة (الأحدث أولاً)</h4>` + (r.L || []).map((v, i) => `<div class="ar-ver ${a && a.v == v.id ? "cur" : ""}"><img data-ar238="${v.id}" alt=""><div><b>${dt(v.at)}${a && a.v == v.id ? " — الحالية" : ""}</b><span>${E(v.nt || "بدون ملاحظة")}</span><span class="sub">${fsz(v.sz || 0)}</span></div><div class="ar-vb"><button class="btn ghost sm" onclick="AR238VSee('${v.id}')">عرض</button>${a && a.v == v.id ? "" : `<button class="btn ghost sm" onclick="ask(this,()=>AR238VSet('${v.id}'))">اعتمادها</button>`}</div></div>`).join("");
    } catch (e) { box.innerHTML = `<p class="warn">تعذّر التحميل</p>`; }
  };
  W.AR238VSee = async id => { const el = D.getElementById("ar238v"); if (!el) return; const im = el.querySelector(".ar-vi"); try { im.src = await img(id, 0); el.querySelector(".ar-vl").hidden = false; el.querySelector(".ar-vl").textContent = "تعرض الآن نسخة سابقة — اضغط «المعلومات» ثم «اعتمادها» لجعلها الحالية"; } catch (e) { T0("تعذّر التحميل", "err"); } };
  W.AR238VSet = async id => { try { await call("set", { bk: VW.bk, pg: VW.pg, v: id }); await load(1); showPage(); T0("اعتُمدت النسخة"); } catch (e) { T0("تعذّر", "err"); } };
  W.AR238PDel = async () => { const { bk, pg } = VW; try { await call("set", { bk, pg, del: 1 }); await load(1); close238(); render(); T0("حُذفت الصفحة — نسخها محفوظة ويمكن رفعها من جديد"); } catch (e) { T0("تعذّر الحذف", "err"); } };
  W.AR238Mv = async d => {
    const { bk, pg } = VW, S = sibs(bk, pg), i = S.indexOf(pg), j = i + d; if (i < 0 || j < 0 || j >= S.length) return;
    try { await call("swap", { bk, p1: pg, p2: S[j] }); await load(1); VW.pg = S[j]; showPage(); render(); } catch (e) { T0("تعذّر", "err"); }
  };
  W.AR238Rep = () => { const { bk, pg } = VW; pick(files => upOpen({ bk, files, start: pg, one: 1 })); };
  W.AR238Recrop = async () => {
    const { bk, pg } = VW, a = page(bk, pg); if (!a) return;
    try { const bl = await imgBlob(a.v); const f = new File([bl], "page-" + pg, { type: bl.type }); upOpen({ bk, files: [f], start: pg, one: 1, recrop: 1 }); } catch (e) { T0("تعذّر تحميل الصورة", "err"); }
  };
  W.AR238Dl = async () => {
    const { bk, pg } = VW, a = page(bk, pg); if (!a) return; const b = bk == "q" ? bookOfPg(pg) : AR.books[bk];
    try { const bl = await imgBlob(a.v), ext = /webp/.test(bl.type) ? "webp" : /png/.test(bl.type) ? "png" : "jpg"; const nm = (bk == "q" ? "القيد " + (b ? b.n : "") + " — صفحة " + pg : bookPlain(b) + " — صفحة " + pg) + "." + ext; if (typeof saveFile == "function") await saveFile(nm, bl); else { const u = URL.createObjectURL(bl), l = D.createElement("a"); l.href = u; l.download = nm; l.click(); setTimeout(() => URL.revokeObjectURL(u), 4000); } } catch (e) { T0("تعذّر التنزيل", "err"); }
  };
  /* الطباعة: الصورة كاملة على الورقة (A4 افتراضياً، وA3 للصفحات الكبيرة)، الاتجاه حسب شكل الصورة */
  async function printImgs(L, name) {
    const sz = (localStorage.getItem("ar238ps") || "A4") == "A3" ? [297, 420] : [210, 297];
    const pages = [];
    for (const v of L) { const u = await img(v.v, 0); const land = (v.w || 1) > (v.h || 1); pages.push({ w: land ? sz[1] : sz[0], h: land ? sz[0] : sz[1], html: `<div class="pg221 %SZ%"><img src="${u}" alt="" style="object-position:center"></div>` }); }
    if (typeof W.printHere221 == "function") return W.printHere221(pages, name);
    const w = W.open(""); if (w) { w.document.write(pages.map(p => p.html.replace("%SZ%", "")).join("")); w.print(); }
  }
  W.AR238Pr = async () => {
    const { bk, pg } = VW, a = page(bk, pg); if (!a) return;
    const ch = prompt("حجم الورق للطباعة: اكتب A4 أو A3", localStorage.getItem("ar238ps") || "A4"); if (ch == null) return;
    localStorage.setItem("ar238ps", /3/.test(ch) ? "A3" : "A4");
    try { await printImgs([a], "صفحة " + pg); } catch (e) { T0("تعذّرت الطباعة", "err"); }
  };
  W.AR238Print = async id => {
    const b = AR.books[id]; if (!b) return; const L = pgList(b).map(p => page(id, p)).filter(Boolean);
    if (!L.length) return; T0("جارٍ تجهيز " + AD(L.length) + " صفحة للطباعة…");
    try { await printImgs(L, bookPlain(b)); } catch (e) { T0("تعذّرت الطباعة", "err"); }
  };
  function wireViewer(el) {
    const st = el.querySelector(".ar-vs"), im = el.querySelector(".ar-vi");
    const go = d => { const S = sibs(VW.bk, VW.pg), i = S.indexOf(VW.pg), j = i + d; if (i >= 0 && j >= 0 && j < S.length) { VW.pg = S[j]; VW.z = 1; VW.x = 0; VW.y = 0; showPage(); } };
    el.addEventListener("click", e => {
      const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a;
      if (a == "x") { try { history.back(); } catch (x) { } setTimeout(close238, 50); }
      else if (a == "prev") go(-1); else if (a == "next") go(1);
      else if (a == "zi") { VW.z = Math.min(12, VW.z * 1.4); tf(); } else if (a == "zo") { VW.z = Math.max(.3, VW.z / 1.4); tf(); }
      else if (a == "fit") { VW.z = 1; VW.x = 0; VW.y = 0; tf(); } else if (a == "rot") { VW.r = (VW.r + 1) % 4; tf(); }
      else if (a == "info") { VW.info = !VW.info; el.classList.toggle("info", VW.info); }
    });
    st.addEventListener("wheel", e => { e.preventDefault(); const f = e.deltaY < 0 ? 1.15 : 1 / 1.15, r = st.getBoundingClientRect(), cx = e.clientX - r.left - r.width / 2, cy = e.clientY - r.top - r.height / 2, z2 = Math.min(12, Math.max(.3, VW.z * f)), k = z2 / VW.z; VW.x = cx - (cx - VW.x) * k; VW.y = cy - (cy - VW.y) * k; VW.z = z2; tf(); }, { passive: false });
    const P = new Map(); let p0 = null, last = 0;
    st.addEventListener("pointerdown", e => { st.setPointerCapture(e.pointerId); P.set(e.pointerId, [e.clientX, e.clientY]); if (P.size == 1) p0 = { x: VW.x, y: VW.y, cx: e.clientX, cy: e.clientY, t: Date.now() }; if (P.size == 2) { const [a, b] = [...P.values()]; p0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: VW.z, x: VW.x, y: VW.y, mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2 }; } });
    st.addEventListener("pointermove", e => { if (!P.has(e.pointerId)) return; P.set(e.pointerId, [e.clientX, e.clientY]);
      if (P.size == 1 && p0 && p0.cx != null) { VW.x = p0.x + e.clientX - p0.cx; VW.y = p0.y + e.clientY - p0.cy; tf(); }
      else if (P.size == 2 && p0 && p0.d) { const [a, b] = [...P.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), r = st.getBoundingClientRect(), z2 = Math.min(12, Math.max(.3, p0.z * d / p0.d)), cx = p0.mx - r.left - r.width / 2, cy = p0.my - r.top - r.height / 2, k = z2 / p0.z; VW.z = z2; VW.x = cx - (cx - p0.x) * k; VW.y = cy - (cy - p0.y) * k; tf(); } });
    const up = e => { const was = p0 && p0.cx != null && P.size == 1 ? p0 : null; P.delete(e.pointerId);
      if (was) { const dx = e.clientX - was.cx, dy = e.clientY - was.cy, quick = Date.now() - was.t < 350;
        if (quick && Math.abs(dx) < 8 && Math.abs(dy) < 8) { if (Date.now() - last < 320) { if (VW.z > 1.05) { VW.z = 1; VW.x = 0; VW.y = 0; } else { const r = st.getBoundingClientRect(), cx = e.clientX - r.left - r.width / 2, cy = e.clientY - r.top - r.height / 2; VW.z = 2.5; VW.x = -cx * 1.5; VW.y = -cy * 1.5; } tf(); last = 0; } else last = Date.now(); }
        else if (VW.z <= 1.05 && quick && Math.abs(dx) > 70 && Math.abs(dy) < 60) { go(dx > 0 ? 1 : -1); } }
      if (P.size < 2 && p0 && p0.d) p0 = null; };
    st.addEventListener("pointerup", up); st.addEventListener("pointercancel", up);
    el.addEventListener("keydown", e => { if (/INPUT|TEXTAREA/.test(e.target.tagName)) return; if (e.key == "ArrowLeft") go(1); else if (e.key == "ArrowRight") go(-1); else if (e.key == "Escape") close238(); else if (e.key == "+" || e.key == "=") { VW.z = Math.min(12, VW.z * 1.3); tf(); } else if (e.key == "-") { VW.z = Math.max(.3, VW.z / 1.3); tf(); } });
    el.tabIndex = -1; setTimeout(() => el.focus(), 30);
  }

  /* ======================================================================
     الرفع: اختيار ← قص تلقائي ← مراجعة (رقم الصفحة + الطالب) ← حفظ
     ====================================================================== */
  function pick(cb) { const i = D.createElement("input"); i.type = "file"; i.multiple = true; i.accept = "image/*,.pdf,application/pdf"; i.onchange = () => { const L = [...(i.files || [])]; if (L.length) cb(L); }; i.click(); }
  W.up238 = (bk, pg) => pick(files => upOpen({ bk, files, start: pg }));
  let UP = null, BUSY = 0;
  const natCmp = (a, b) => a.name.localeCompare(b.name, "ar", { numeric: true });
  const numOf = n => { const m = String(EN(n)).replace(/\.[a-z0-9]+$/i, "").match(/(\d+)(?!.*\d)/); return m ? String(+m[1]) : ""; };
  async function upOpen(o) {
    if (BUSY) return T0("انتظر حتى ينتهي الرفع الحالي", "err");
    let files = [];
    for (const f of o.files) { if (/pdf/i.test(f.type) || /\.pdf$/i.test(f.name)) { try { T0("جارٍ قراءة ملف PDF…"); files.push(...await pdfPages(f)); } catch (e) { T0("تعذّرت قراءة ملف PDF", "err"); } } else if (/^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|bmp|gif|tiff?)$/i.test(f.name)) files.push(f); }
    if (!files.length) return;
    if (!o.one) files.sort(natCmp);
    const bk = o.bk, b = bk == "q" ? null : AR.books[bk];
    /* أرقام الصفحات المقترحة */
    let start = PG(o.start);
    if (!start) {
      if (bk == "q") { const B = AR.book && AR.books[AR.book]; const L = B ? pgList(B) : []; start = L.find(p => !page("q", p)) || (B ? B.p0 : ""); }
      else { const L = pgList(b); start = String((L.length ? PGN(L[L.length - 1]) : 0) + 1); }
    }
    UP = { bk, one: !!o.one, recrop: !!o.recrop, mode: bk == "q" && !o.one && files.every(f => numOf(f.name)) && files.length > 1 ? "seq" : "seq", start: start || "", items: files.map((f, i) => ({ f, i, pg: "", q: null, c: "", rot: 0, st: "wait", prev: "", rep: 0, nt: "" })) };
    if (bk != "q" && !o.one) { UP.items.forEach((it, i) => it.pg = String(PGN(start) + i)); }
    else numberAll();
    upDraw();
    for (const it of UP.items) { if (!UP) return; await prep(it); upRow(it); }
    upDraw();
  }
  function numberAll() {
    if (!UP) return;
    if (UP.mode == "name") UP.items.forEach(it => it.pg = PG(numOf(it.f.name)) || "");
    else { const s = PG(UP.start); if (UP.bk == "q") { const B = s ? bookOfPg(s) : null; let L = B ? pgList(B) : []; let k = L.indexOf(s); UP.items.forEach((it, i) => { it.pg = s ? (k >= 0 && L[k + i] ? L[k + i] : String(PGN(s) + i)) : ""; }); } else UP.items.forEach((it, i) => it.pg = s ? String(PGN(s) + i) : ""); }
  }
  async function prep(it) {
    try {
      it.bm = await decode(it.f); const det = UP && UP.recrop ? { q: [[0, 0], [1, 0], [1, 1], [0, 1]], c: "full" } : detect(it.bm);
      /* إذا لم تتضح حدود الورقة: لا قصّ إطلاقاً (الصورة كاملة) — لا نخاطر بقطع أي تفصيل */
      it.q = det.c == "low" ? [[0, 0], [1, 0], [1, 1], [0, 1]] : det.q; it.c = det.c; it.st = "ready"; await mkPrev(it);
    } catch (e) { it.st = "bad"; it.err = "تعذّرت قراءة الصورة"; }
  }
  async function mkPrev(it) { const c = await render238(it.bm, it.q, it.rot, 420); if (it.prev) URL.revokeObjectURL(it.prev); it.prev = URL.createObjectURL(await blobOf(c, "image/jpeg", .8)); }
  function issues(it) {
    const out = []; if (!UP) return out;
    if (!it.pg) out.push(["err", "اكتب رقم الصفحة"]);
    else {
      if (UP.items.some(x => x !== it && x.pg == it.pg && x.st != "skip")) out.push(["err", "رقم الصفحة مكرر في هذه الدفعة"]);
      if (UP.bk == "q") { if (!names().get(it.pg)) out.push(["warn", "لا يوجد اسم بهذه الصفحة في القيد العام"]); if (!bookOfPg(it.pg)) out.push(["warn", "الصفحة خارج تقسيم القيود"]); }
      if (page(UP.bk, it.pg) && !UP.recrop) out.push([it.rep ? "info" : "err", it.rep ? "ستُستبدل الصورة الحالية (تبقى النسخة القديمة محفوظة)" : "لهذه الصفحة صورة — أكّد الاستبدال واكتب ماذا زُوِّد"]);
    }
    if (it.c == "low") out.push(["warn", "حُفظت الصورة كاملة بلا قصّ (حدود الورقة غير واضحة) — يمكنك «تعديل القص» يدوياً"]);
    return out;
  }
  const upOk = () => UP && UP.items.filter(i => i.st != "skip").every(it => it.st == "ready" || it.st == "done") && UP.items.filter(i => i.st == "ready").every(it => !issues(it).some(x => x[0] == "err"));
  function upDraw() {
    let el = D.getElementById("ar238u");
    if (!UP) { if (el) el.remove(); return; }
    if (!el) { el = D.createElement("div"); el.id = "ar238u"; el.setAttribute("role", "dialog"); D.body.appendChild(el); }
    const b = UP.bk == "q" ? null : AR.books[UP.bk], n = UP.items.filter(i => i.st != "skip").length, done = UP.items.filter(i => i.st == "done").length;
    el.innerHTML = `<div class="ar-uh"><b>${UP.recrop ? "إعادة قص الصفحة" : UP.one ? "استبدال صورة الصفحة" : "رفع " + AD(n) + " صفحة"} — ${UP.bk == "q" ? "سجلات القيد العام" : E(bookPlain(b))}</b><span class="sp"></span><button class="btn ghost sm" onclick="AR238UX()" ${BUSY ? "disabled" : ""}>إغلاق</button></div>
      ${UP.one ? "" : `<div class="ar-uo"><label>رقم أول صفحة<input id="aru_s" inputmode="numeric" value="${AD(UP.start)}" onchange="AR238US(this.value)"></label>${UP.bk == "q" ? `<div class="seg"><button class="${UP.mode == "seq" ? "on" : ""}" onclick="AR238UM('seq')">متسلسلة حسب ترتيب الملفات</button><button class="${UP.mode == "name" ? "on" : ""}" onclick="AR238UM('name')">الرقم من اسم الملف</button></div>` : ""}</div>`}
      <p class="muted">القص تلقائي على حدود الورقة. اضغط «تعديل القص» لتحريك الزوايا إذا لزم. ${UP.bk == "q" ? "تحت كل صورة اسم الطالب صاحب الصفحة من القيد العام — تأكد منه قبل الحفظ." : ""}</p>
      <div class="ar-ul">${UP.items.map(it => `<div class="ar-ui" data-i="${it.i}">${upCard(it)}</div>`).join("")}</div>
      <div class="ar-uf"><span id="aru_pr">${BUSY ? "جارٍ الحفظ " + AD(done) + " من " + AD(n) + "…" : done && done == n ? "اكتمل الحفظ ✓" : ""}</span><span class="sp"></span><button class="btn" id="aru_go" onclick="AR238UGo()" ${upOk() && !BUSY && done < n ? "" : "disabled"}>${IC("ok")} حفظ في الأرشيف</button></div>`;
  }
  function upCard(it) {
    const I2 = issues(it);
    return `<div class="ar-up">${it.prev ? `<img src="${it.prev}" alt="">` : `<i>${it.st == "bad" ? "✕" : "…"}</i>`}${it.st == "done" ? `<em class="ok">✓</em>` : it.st == "up" ? `<em>⏳</em>` : ""}</div>
      <div class="ar-uc"><label>صفحة<input inputmode="numeric" value="${AD(it.pg)}" ${UP.one ? "readonly" : ""} onchange="AR238UP(${it.i},this.value)"></label>
      ${UP.bk == "q" && it.pg ? `<b class="ar-unm">${nmList(it.pg, 3) || ""}</b>` : ""}
      <span class="sub">${E(it.f.name)}</span>
      ${I2.map(([k, t]) => `<span class="${k == "err" ? "warn err" : k == "warn" ? "warn" : "sub"}">${t}</span>`).join("")}
      ${page(UP.bk, it.pg) && !UP.recrop ? `<label class="ar-chk"><input type="checkbox" ${it.rep ? "checked" : ""} onchange="AR238URep(${it.i},this.checked)"> استبدال الصورة الحالية</label>` : ""}
      ${(page(UP.bk, it.pg) || UP.one) ? `<input class="ar-unt" placeholder="ماذا زُوِّد / سبب الاستبدال (مثل: زُوِّد بوثيقة …)" value="${E(it.nt)}" oninput="AR238UNt(${it.i},this.value)">` : ""}
      ${it.err ? `<span class="warn err">${E(it.err)}</span>` : ""}
      <div class="tools">${it.st == "ready" || it.st == "bad" ? `<button class="btn ghost sm" onclick="AR238Crop(${it.i})" ${it.st == "bad" ? "disabled" : ""}>${IC("arcrop")} تعديل القص</button><button class="btn ghost sm" onclick="AR238URot(${it.i})">${IC("arrot")} تدوير</button>${UP.one ? "" : `<button class="btn ghost sm" onclick="AR238USkip(${it.i})">استبعاد</button>`}` : it.st == "skip" ? `<button class="btn ghost sm" onclick="AR238USkip(${it.i})">إرجاع</button>` : ""}</div></div>`;
  }
  function upRow(it) { const el = D.querySelector(`#ar238u .ar-ui[data-i="${it.i}"]`); if (el) { el.innerHTML = upCard(it); el.classList.toggle("skip", it.st == "skip"); } const g = D.getElementById("aru_go"); if (g) g.disabled = !(upOk() && !BUSY); }
  const IT = i => UP && UP.items.find(x => x.i == i);
  W.AR238UX = () => { if (BUSY) return; if (UP) UP.items.forEach(it => { if (it.prev) URL.revokeObjectURL(it.prev); try { it.bm && it.bm.close && it.bm.close(); } catch (e) { } }); UP = null; upDraw(); render(); };
  W.AR238US = v => { UP.start = PG(v); numberAll(); upDraw(); };
  W.AR238UM = m => { UP.mode = m; numberAll(); upDraw(); };
  W.AR238UP = (i, v) => { const it = IT(i); if (!it) return; it.pg = PG(v); it.rep = 0; UP.items.forEach(upRow); };
  W.AR238URep = (i, c) => { const it = IT(i); if (it) { it.rep = c ? 1 : 0; upRow(it); } };
  W.AR238UNt = (i, v) => { const it = IT(i); if (it) it.nt = v; };
  W.AR238USkip = i => { const it = IT(i); if (!it) return; it.st = it.st == "skip" ? (it.q ? "ready" : "bad") : "skip"; UP.items.forEach(upRow); };
  W.AR238URot = async i => { const it = IT(i); if (!it || !it.bm) return; it.rot = (it.rot + 1) % 4; await mkPrev(it); upRow(it); };
  W.AR238UGo = async () => {
    if (!UP || BUSY || !upOk()) return;
    const L = UP.items.filter(it => it.st == "ready");
    for (const it of L) if ((page(UP.bk, it.pg) && !UP.recrop) || UP.one) { if (page(UP.bk, it.pg) && !UP.recrop && !it.rep) return T0("أكّد استبدال الصفحة " + AD(it.pg), "err"); }
    BUSY = 1; upDraw();
    let fail = 0; const U = UP;
    const work = async it => {
      it.st = "up"; upRow(it);
      for (let t = 0; t < 4; t++) {
        try {
          const c = await render238(it.bm, it.q, it.rot), bl = await encodeArc(c), th = await encode(scaled(c, TH), .72, 1);
          const m = { tok: "", bk: U.bk, pg: it.pg, mime: bl.type, w: c.width, h: c.height, nt: (it.nt || "").trim() || (U.recrop ? "إعادة قص" : ""), rep: page(U.bk, it.pg) ? 1 : 0, cid: it.cid || (it.cid = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)) };
          const tb = new Uint8Array(await th.arrayBuffer()), ib = new Uint8Array(await bl.arrayBuffer());
          const r = await raw("/ar238u", tok => { m.tok = tok; const mj = new TextEncoder().encode(JSON.stringify(m)), o = new Uint8Array(8 + mj.length + tb.length + ib.length), dv = new DataView(o.buffer); dv.setUint32(0, mj.length); o.set(mj, 4); dv.setUint32(4 + mj.length, tb.length); o.set(tb, 8 + mj.length); o.set(ib, 8 + mj.length + tb.length); return o; }, 1);
          if (r && r.ok) {
            it.st = "done"; idbPut("img", "f:" + r.id, bl); idbPut("img", "t:" + r.id, th); memSet("t:" + r.id, URL.createObjectURL(th));
            AR.P.set(key(U.bk, it.pg), { bk: U.bk, pg: it.pg, v: r.id, rv: r.rv, at: Date.now(), w: c.width, h: c.height, sz: bl.size, nv: r.nv || 1, nt: m.nt });
            upRow(it); return;
          }
          if (r && r.err == "exists") { it.st = "ready"; it.err = "لهذه الصفحة صورة أُضيفت للتو من جهاز آخر — أكّد الاستبدال"; it.rep = 0; AR.P.set(key(U.bk, it.pg), Object.assign({ bk: U.bk, pg: it.pg, v: r.v, nv: 1 }, AR.P.get(key(U.bk, it.pg)) || {}, { v: r.v })); upRow(it); fail++; return; }
          if (r && /role|auth|data|nobook|big/.test(r.err)) { it.st = "ready"; it.err = r.err == "data" ? "رُفضت الصورة (صيغة غير مدعومة)" : r.err == "nobook" ? "السجل محذوف" : "لا تملك الصلاحية — سجّل الدخول بحساب مدير النظام"; upRow(it); fail++; return; }
          throw r;
        } catch (e) { if (t == 3) { it.st = "ready"; it.err = e && e.err == "net" ? "انقطع الاتصال — اضغط «حفظ» مرة أخرى" : "تعذّر الحفظ (" + (e && (e.msg || e.err) || "خطأ") + ")"; upRow(it); fail++; return; } await new Promise(r => setTimeout(r, 1500 * (t + 1))); }
      }
    };
    const Q = L.slice(); const n2 = Math.min(2, Q.length);
    await Promise.all(Array.from({ length: n2 }, async () => { while (Q.length) await work(Q.shift()); }));
    BUSY = 0; saveIdx(); patchQD(1);
    try { await load(1); } catch (e) { }
    if (!UP) return;
    upDraw(); render();
    if (!fail) { T0("حُفظت " + AD(L.length) + " صفحة في الأرشيف ✓"); if (UP.one) { const it = L[0]; setTimeout(() => { W.AR238UX(); if (D.getElementById("ar238v") && VW && VW.pg == it.pg) showPage(); }, 600); } }
    else T0("لم تُحفظ " + AD(fail) + " صفحة — راجعها ثم اضغط «حفظ» مرة أخرى", "err");
  };

  /* محرر القص: ٤ زوايا قابلة للسحب */
  W.AR238Crop = function (i) {
    const it = IT(i); if (!it || !it.bm) return;
    const el = D.createElement("div"); el.id = "ar238c";
    el.innerHTML = `<div class="ar-uh"><b>تعديل القص — اسحب الزوايا الأربع إلى أطراف الورقة</b><span class="sp"></span><button class="btn ghost sm" data-c="auto">تلقائي</button><button class="btn ghost sm" data-c="full">الصورة كاملة</button><button class="btn ghost sm" data-c="x">إلغاء</button><button class="btn sm" data-c="ok">${IC("ok")} اعتماد</button></div><div class="ar-cs"><canvas></canvas><svg></svg></div>`;
    D.body.appendChild(el);
    const cv = el.querySelector(".ar-cs>canvas"), sv = el.querySelector(".ar-cs>svg"), box = el.querySelector(".ar-cs");
    const [w0, h0] = dims(it.bm); let Q = it.q.map(p => p.slice()), W2 = 0, H2 = 0;
    const lay = () => { const r = box.getBoundingClientRect(), s = Math.min((r.width - 40) / w0, (r.height - 40) / h0); W2 = Math.round(w0 * s); H2 = Math.round(h0 * s); cv.width = W2; cv.height = H2; cv.style.width = W2 + "px"; cv.style.height = H2 + "px"; cv.getContext("2d").drawImage(it.bm, 0, 0, W2, H2); sv.setAttribute("width", W2); sv.setAttribute("height", H2); sv.style.width = W2 + "px"; sv.style.height = H2 + "px"; draw(); };
    const draw = () => { const P = Q.map(([x, y]) => [x * W2, y * H2]); sv.innerHTML = `<path d="M0 0H${W2}V${H2}H0Z M${P.map(p => p.join(" ")).join(" L")}Z" style="fill:rgba(0,0,0,.5);fill-rule:evenodd;stroke:none"/><polygon points="${P.map(p => p.join(",")).join(" ")}" style="fill:none;stroke:#2bd17e;stroke-width:2"/>${P.map((p, k) => `<circle data-k="${k}" cx="${p[0]}" cy="${p[1]}" r="16" fill="rgba(43,209,126,.35)" stroke="#fff" stroke-width="2"/>`).join("")}`; };
    let drag = -1;
    sv.addEventListener("pointerdown", e => { const r = sv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best = 1e9; Q.forEach(([qx, qy], k) => { const d = Math.hypot(qx * W2 - x, qy * H2 - y); if (d < best) { best = d; drag = k; } }); if (best > 60) drag = -1; else sv.setPointerCapture(e.pointerId); });
    sv.addEventListener("pointermove", e => { if (drag < 0) return; const r = sv.getBoundingClientRect(); Q[drag] = [Math.min(1, Math.max(0, (e.clientX - r.left) / W2)), Math.min(1, Math.max(0, (e.clientY - r.top) / H2))]; draw(); });
    sv.addEventListener("pointerup", () => drag = -1);
    el.addEventListener("click", async e => {
      const b = e.target.closest("[data-c]"); if (!b) return; const c = b.dataset.c;
      if (c == "x") el.remove();
      else if (c == "auto") { const d = detect(it.bm); Q = d.q; draw(); }
      else if (c == "full") { Q = [[0, 0], [1, 0], [1, 1], [0, 1]]; draw(); }
      else if (c == "ok") { it.q = Q; it.c = "ok"; it.err = ""; el.remove(); await mkPrev(it); upRow(it); }
    });
    addEventListener("resize", lay, { once: true });
    requestAnimationFrame(lay);
  };

  /* ======================================================================
     نقل صور القيد السابقة إلى البوابة (مرة واحدة، بالخلفية، مقصوصة تلقائياً)
     ====================================================================== */
  async function migStart() {
    if (!isOwn() || !gxOn() || !AR.ready || AR.mig || BUSY || !qBooks().length || LOADP) return;
    if (localStorage.getItem("ar238mig") == "done:" + GX.u) return;
    const L = QDa(); if (L.length < 1000) return;
    const T = [];
    for (const r of L) { const p = PG(r && r.pg); if (!p || page("q", p)) continue; const o = ORIG.has(r) ? ORIG.get(r) : r.im; if (o && !/^ar238:/.test(o)) T.push([r, p, o]); }
    if (!T.length) { localStorage.setItem("ar238mig", "done:" + GX.u); return; }
    AR.mig = { n: T.length, d: 0, f: 0 }; rerender();
    for (const [r, p, o] of T) {
      if (page("q", p)) { AR.mig.d++; continue; }
      try {
        const QI = W.QIMG || (typeof QIMG != "undefined" ? QIMG : {}); let src = QI[o];
        if (!src) { const qg = qImgGet; src = await Promise.race([qg(o), new Promise(r => setTimeout(() => r(null), 25000))]); }
        if (!src) throw 0;
        const bl = await (await fetch(src)).blob(), bm = await decode(bl), det = detect(bm);
        /* القص التلقائي فقط إذا كانت حدود الورقة واضحة؛ وإلا تُحفظ الصورة كما هي */
        const q = det.c == "ok" ? det.q : [[0, 0], [1, 0], [1, 1], [0, 1]];
        const c = await render238(bm, q, 0), ib = await encodeArc(c), th = await encode(scaled(c, TH), .72, 1);
        const m = { tok: "", bk: "q", pg: p, mime: ib.type, w: c.width, h: c.height, nt: "نُقلت من صورة القيد السابقة" + (det.c == "ok" ? "" : " — تحتاج مراجعة القص"), rep: 0, cid: "m" + (String(o).replace(/[^A-Za-z0-9]/g, "") + p.replace(/\D/g, "")).slice(-30) };
        const tb = new Uint8Array(await th.arrayBuffer()), u8 = new Uint8Array(await ib.arrayBuffer());
        const rr = await raw("/ar238u", tok => { m.tok = tok; const mj = new TextEncoder().encode(JSON.stringify(m)), out = new Uint8Array(8 + mj.length + tb.length + u8.length), dv = new DataView(out.buffer); dv.setUint32(0, mj.length); out.set(mj, 4); dv.setUint32(4 + mj.length, tb.length); out.set(tb, 8 + mj.length); out.set(u8, 8 + mj.length + tb.length); return out; }, 1);
        if (rr && (rr.ok || rr.err == "exists")) { AR.mig.d++; if (rr.ok) { idbPut("img", "t:" + rr.id, th); AR.P.set(key("q", p), { bk: "q", pg: p, v: rr.id, rv: rr.rv, at: Date.now(), w: c.width, h: c.height, sz: ib.size, nv: rr.nv || 1, nt: m.nt }); } }
        else AR.mig.f++;
        try { bm.close && bm.close(); } catch (e) { }
      } catch (e) { AR.mig.f++; }
      if ((AR.mig.d + AR.mig.f) % 5 == 0) rerender();
      await new Promise(r => setTimeout(r, 120));
    }
    const ok = !AR.mig.f; AR.mig = null; saveIdx(); patchQD(1); await load(1).catch(() => 0); rerender();
    if (ok) localStorage.setItem("ar238mig", "done:" + GX.u);
  }

  /* ======================================================================
     التسجيل في النظام: القسم، الأيقونة بالرئيسية (لمدير النظام فقط)، والأرشيف القديم بدون السجلات الوسطية
     ====================================================================== */
  on(() => { V.ar238 = V238; TITLE.ar238 = "بوابة الأرشفة الإلكترونية"; });
  on(() => { if (typeof HDESC != "undefined") { HDESC.ar238 = "صور صفحات القيد العام (١–٥٩) مربوطة بالطلاب، السجلات الوسطية، البورد الوزاري القديم"; HDESC.z = "بوردات الدرجات الوزارية للسادس (٢٠١٣‏-‏٢٠١٤ وما بعدها) وسجل الخريجين"; } });
  function reg() {
    if (typeof NAVI == "undefined" || typeof HUBS == "undefined") return;
    NAVI.ar238 = ["ar238", "بوابة الأرشفة الإلكترونية", "ar238", 1];
    if (!HUBS.some(h => h[0] == "gar")) {
      const i = HUBS.findIndex(h => h[0] == "gs");
      HUBS.splice(i >= 0 ? i + 1 : HUBS.length, 0, ["gar", "بوابة الأرشفة الإلكترونية", "ar238", "سجلات القيد العام، أرشيف السجلات الوسطية، البورد الوزاري القديم", ["ar238"]]);
    }
    TITLE.gar = "بوابة الأرشفة الإلكترونية"; V.gar = V238;
    on(() => { if (typeof NAVG0 != "undefined" && Array.isArray(NAVG0) && !NAVG0.some(g => g[1] && g[1].some && g[1].some(x => x && x[0] == "ar238"))) { const h = HUBS.find(x => x[0] == "gar"); const k = NAVG0.findIndex(g => g[0] == "بوابة الأرشفة الإلكترونية"); if (k < 0) NAVG0.splice(2, 0, ["بوابة الأرشفة الإلكترونية", [NAVI.ar238]]); } });
  }
  on(() => { if (typeof W.reorg215 == "function") { const _r = W.reorg215; W.reorg215 = function () { const x = _r.apply(this, arguments); on(reg); return x; }; } });
  [0, 450, 1600, 4200].forEach(t => setTimeout(() => { on(reg); }, t));
  on(() => { if (typeof view == "function") { const _v = view; view = function (k) { if (k == "gar") k = "ar238"; return _v.apply(this, [k, ...[].slice.call(arguments, 1)]); }; } });
  /* الأرشيف داخل النظام: السجلات الوسطية انتقلت إلى بوابة الأرشفة — البوردات وسجل الخريجين كما هي */
  on(() => {
    if (typeof V == "undefined" || typeof V.z != "function") return;
    const wrap = () => { const _z = V.z; if (_z.__v238) return; const f = function () { on(() => { if (typeof AS0 != "undefined" && AS0 == "rec") AS0 = "brd"; }); let h = _z.apply(this, arguments); if (typeof h == "string") { h = h.replace(/<button class="[^"]*" onclick="aTab\('rec'\)">[^<]*<\/button>/, `<button class="" onclick="view('ar238');AR238.tab='w';AR238.book=null">السجلات الوسطية ← بوابة الأرشفة</button>`).replace("السجلات الوسطية وبوردات الدرجات الوزارية", "بوردات الدرجات الوزارية وسجل الخريجين").replace(/فيه السجلات الوسطية \(٢٠١٤–٢٠٢٥\) ومجلد بوردات/, "فيه مجلد بوردات"); } return h; }; f.__v238 = 1; V.z = f; };
    wrap(); setTimeout(wrap, 1500); setTimeout(wrap, 5000);
  });
  /* تحميل الفهرس بالخلفية بعد دخول مدير النظام (حتى صور الطلاب في ملفاتهم تأتي من البوابة) */
  let BOOT = 0;
  setInterval(() => { if (BOOT || !isOwn() || !gxOn()) return; BOOT = 1; setTimeout(() => load(1), 3000); }, 2000);

  /* ---------------- التنسيق ---------------- */
  on(() => {
    if (D.getElementById("v238css")) return;
    const st = D.createElement("style"); st.id = "v238css";
    st.textContent = `
.ar-seg{flex-wrap:wrap;margin:0 0 12px}
.ar-books{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin:8px 0 16px}
.ar-b{display:flex;flex-direction:column;gap:4px;align-items:flex-start;text-align:start;padding:12px 14px;border:1px solid var(--line,#d9dee3);border-radius:12px;background:var(--card,#fff);cursor:pointer;font:inherit;color:inherit;min-width:0}
.ar-b:hover{border-color:var(--pri,#1f7a5a);box-shadow:0 2px 10px rgba(0,0,0,.06)}
.ar-b b{font-size:1.02rem}.ar-b span{font-size:.86rem;color:var(--muted,#667)}.ar-b em{font-style:normal;font-size:.82rem;color:var(--muted,#667)}
.ar-b.miss{border-style:dashed;opacity:.85}.ar-b.miss em{color:var(--pri,#1f7a5a)}
.ar-bar{display:block;width:100%;height:5px;border-radius:3px;background:var(--line,#e5e8ec);overflow:hidden}.ar-bar s{display:block;height:100%;background:var(--pri,#1f7a5a);text-decoration:none}
.ar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:10px 0 20px}
.ar-t{display:flex;flex-direction:column;gap:3px;padding:6px;border:1px solid var(--line,#d9dee3);border-radius:10px;background:var(--card,#fff);cursor:pointer;font:inherit;color:inherit;text-align:center;min-width:0}
.ar-t:hover{border-color:var(--pri,#1f7a5a)}
.ar-th{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:3/4;background:#f3f5f7;border-radius:6px;overflow:hidden}
.ar-th img{width:100%;height:100%;object-fit:contain;background:#fff}.ar-th img.err{opacity:.2}
.ar-th i{font-style:normal;color:var(--muted,#99a);opacity:.7}.ar-th i svg{width:28px;height:28px}
.ar-th em{position:absolute;top:4px;inset-inline-start:4px;font-style:normal;font-size:.72rem;background:var(--pri,#1f7a5a);color:#fff;border-radius:9px;padding:0 6px}
.ar-t b{font-size:.9rem}.ar-t span{font-size:.78rem;color:var(--muted,#556);line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.ar-t.miss{border-style:dashed;background:transparent}.ar-t.miss .ar-th{background:transparent}
.ar-t .warn,.ar-ui .warn,.ar-vp .warn,td.warn{color:#a8740f}.ar-ui .err{color:#b42318}
.ar-rt input{width:6.5em;text-align:center}
.ar-form .fgrid{margin-bottom:6px}
#ar238v{position:fixed;inset:0;z-index:9000;background:#111;color:#eee;display:grid;grid-template-rows:auto minmax(0,1fr);grid-template-columns:minmax(0,1fr);outline:none}
#ar238v.info{grid-template-columns:minmax(0,1fr) 340px}
.ar-vt{grid-column:1/-1;display:flex;align-items:center;gap:6px;padding:8px 10px;background:#1b1d20;flex-wrap:wrap}
.ar-vt .btn{color:#eee;border-color:#444;background:transparent}.ar-vt .btn:disabled{opacity:.35}.ar-vt .btn svg{width:18px;height:18px}
.ar-vtt{font-size:1rem}.ar-vts{color:#aaa;font-size:.85rem}.ar-vt .sp,.ar-uh .sp,.ar-uf .sp{flex:1}
.ar-vs{position:relative;overflow:hidden;touch-action:none;display:flex;align-items:center;justify-content:center;cursor:grab;min-height:0}
.ar-vi{max-width:100%;max-height:100%;object-fit:contain;transform-origin:center;user-select:none;-webkit-user-select:none;background:#fff;transition:filter .2s}
.ar-vi.blur{filter:blur(2px)}
.ar-vl{position:absolute;bottom:14px;inset-inline:0;margin:auto;width:max-content;max-width:92%;background:rgba(0,0,0,.7);padding:6px 12px;border-radius:8px;font-size:.88rem}
.ar-vp{display:none;overflow:auto;background:#fff;color:#1d2329;padding:12px 14px;border-inline-start:1px solid #333}
#ar238v.info .ar-vp{display:block}
.ar-vp h4{margin:12px 0 6px;font-size:.95rem}.ar-vp h4:first-child{margin-top:0}
.ar-nm{display:flex;flex-direction:column;gap:2px;padding:8px;border:1px solid #e3e7eb;border-radius:8px;margin-bottom:6px}.ar-nm span{font-size:.82rem;color:#5b6570}.ar-nm .btn{align-self:flex-start}
.ar-nt{display:flex;flex-direction:column;gap:4px;font-size:.84rem}.ar-nt textarea{width:100%;box-sizing:border-box}
.ar-va{display:flex;flex-direction:column;gap:6px;margin-top:12px}.ar-va .btn{justify-content:flex-start}
.ar-ver{display:grid;grid-template-columns:54px minmax(0,1fr);gap:8px;padding:6px;border:1px solid #e3e7eb;border-radius:8px;margin-bottom:6px;align-items:center}
.ar-ver.cur{border-color:#1f7a5a}.ar-ver img{width:54px;height:70px;object-fit:contain;background:#f3f5f7}.ar-ver div{display:flex;flex-direction:column;gap:2px;font-size:.82rem;min-width:0}.ar-ver .ar-vb{grid-column:1/-1;flex-direction:row;gap:6px}
@media (max-width:760px){#ar238v.info{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) minmax(0,45%)}#ar238v .ar-vp{border-inline-start:0;border-top:1px solid #333}.ar-vtt{font-size:.9rem;width:100%}}
#ar238u,#ar238c{position:fixed;inset:0;z-index:9100;background:var(--bg,#f5f7f8);display:grid;grid-template-rows:auto auto auto minmax(0,1fr) auto;grid-template-columns:minmax(0,1fr)}
#ar238c{z-index:9200;background:#15171a;color:#eee;grid-template-rows:auto minmax(0,1fr)}
.ar-uh{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--card,#fff);border-bottom:1px solid var(--line,#dde2e6);flex-wrap:wrap}
#ar238c .ar-uh{background:#1e2125;border-color:#333}#ar238c .ar-uh .btn.ghost{color:#eee;border-color:#555}
.ar-uo{display:flex;gap:10px;align-items:end;flex-wrap:wrap;padding:10px 12px}.ar-uo label{display:flex;flex-direction:column;font-size:.85rem;gap:3px}.ar-uo input{width:8em}
#ar238u>p{margin:0;padding:0 12px 8px}
.ar-ul{overflow:auto;padding:0 12px 12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;align-content:start}
.ar-ui{display:grid;grid-template-columns:110px minmax(0,1fr);gap:10px;padding:8px;border:1px solid var(--line,#dde2e6);border-radius:10px;background:var(--card,#fff)}
.ar-ui.skip{opacity:.45}
.ar-up{position:relative;display:flex;align-items:center;justify-content:center;background:#eef1f3;border-radius:6px;min-height:140px}
.ar-up img{max-width:100%;max-height:170px;object-fit:contain;background:#fff}.ar-up i{font-style:normal;color:#889}
.ar-up em{position:absolute;top:4px;inset-inline-start:4px;font-style:normal;background:#fff;border-radius:10px;padding:0 6px}.ar-up em.ok{background:#1f7a5a;color:#fff}
.ar-uc{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:.86rem}.ar-uc label{display:flex;gap:6px;align-items:center}.ar-uc label input{width:7em}
.ar-uc .sub{overflow-wrap:anywhere}.ar-unm{color:#1f7a5a}.ar-unt{width:100%;box-sizing:border-box}.ar-chk{font-weight:600}
.ar-uc .tools{margin:4px 0 0;gap:4px;flex-wrap:wrap}
.ar-uf{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--card,#fff);border-top:1px solid var(--line,#dde2e6)}
.ar-cs{position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;min-height:0}
.ar-cs canvas{display:block}.ar-cs>svg{position:absolute;touch-action:none;cursor:crosshair}
#ar238u svg.ic,#ar238c svg.ic,#ar238v svg.ic{width:18px;height:18px;flex:none}
#ar238c .ar-uh .btn{color:#eee;border-color:#555;background:transparent}#ar238c .ar-uh .btn[data-c=ok]{background:#1f7a5a;border-color:#1f7a5a;color:#fff}
.ar-nt textarea{min-height:0;height:62px;resize:vertical}
.ar-ui{grid-template-columns:140px minmax(0,1fr)}
@media (max-width:600px){.ar-ul{grid-template-columns:minmax(0,1fr)}.ar-grid{grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:7px}.ar-books{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}}
`;
    D.head.appendChild(st);
  });
  on(() => { if (typeof HCOL != "undefined") HCOL.gar = "#2f5d8a"; });
  W.AR238load = load;
  W.AR238t = { detect, render238, homog, PG, YRS };
})();
