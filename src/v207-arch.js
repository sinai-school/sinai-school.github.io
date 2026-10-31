/* ===== v207e — الأرشيف والبوردات: عارض كامل (تكبير/تصغير/سحب/تنقل بين الصفحات)، فتح سريع جداً (تحميل متوازي + حفظ بالجهاز + تجهيز اللي بعده)، واختيار العام الدراسي ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v207a", e); } };
  const E = s => typeof esc == "function" ? esc(s) : String(s == null ? "" : s);
  const A = v => typeof toAr == "function" ? toAr(v) : String(v);
  const I = n => typeof ic == "function" ? ic(n) : "";
  const T = (m, k) => { try { toast(m, k); } catch (e) { } };
  const IDB = () => W.IDB207;

  /* ---------- تحميل الملف: كل القطع بنفس الوقت + نسخة بالجهاز (المرة الثانية فورية) ---------- */
  const MEM = new Map(), PEND = new Map();
  /* v207g: النسخة تعتمد على الملف نفسه (مو على وقت تعديل المعلومات) حتى نقل الملف أو تغيير عنوانه ما يمسح النسخة المحفوظة بالجهاز */
  const ver = a => a.id + ":" + (a.size || 0) + ":" + (a.parts || 1);
  const okC = (c, a) => c && c.d && (c.k == ver(a) || String(c.k || "").split(":").pop() == String(a.parts || 1));
  async function blob207(a) {
    if (a._b) return a._b;
    const k = ver(a);
    if (MEM.has(k)) return MEM.get(k);
    if (PEND.has(k)) return PEND.get(k);
    const p = (async () => {
      try { const c = IDB() && await IDB().get("ab_" + a.id); if (okC(c, a)) { MEM.set(k, c.d); return c.d; } } catch (e) { }
      if (navigator.onLine === false) throw "offline";
      const n = a.parts || 1, out = new Array(n); let i = 0;
      const worker = async () => { while (i < n) { const j = i++; let t = 0; for (; ;) { try { const d = await DB.doc("archpart/" + a.id + "_" + j).get(); if (!d.exists) throw "missing"; out[j] = (d.data() || {}).d || ""; break; } catch (e) { if (++t > 3) throw e; await new Promise(r => setTimeout(r, 600 * t)); } } } };
      await Promise.all(Array.from({ length: Math.min(8, n) }, worker));
      const s = out.join("");
      MEM.set(k, s); if (MEM.size > 12) MEM.delete(MEM.keys().next().value);
      try { if (IDB()) IDB().put("ab_" + a.id, { k, d: s, at: Date.now() }); } catch (e) { }
      return s;
    })();
    PEND.set(k, p);
    try { return await p; } finally { PEND.delete(k); }
  }
  W.blob207 = blob207;
  /* محفوظ بالجهاز؟ (بدون تحميل) */
  W.has207 = async a => { if (MEM.has(ver(a))) return true; try { return okC(IDB() && await IDB().get("ab_" + a.id), a); } catch (e) { return false; } };
  /* رابط داخلي للصورة (Blob) — أسرع بكثير من data: ويتفك بالخلفية */
  const URLS = new Map(), DEC = new Map();
  async function url207(a) {
    if (URLS.has(a.id)) return URLS.get(a.id);
    let b;
    if (isImg(a)) { const d = await blob207(a), bin = atob(d), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); b = new Blob([u], { type: a.type }); }
    else b = await pdfImg207(a);
    const u = URL.createObjectURL(b); URLS.set(a.id, u);
    if (URLS.size > 30) { const [k0, u0] = URLS.entries().next().value; URLS.delete(k0); DEC.delete(k0); try { URL.revokeObjectURL(u0); } catch (e) { } }
    return u;
  }
  /* نجهّز الصورة مفكوكة بالذاكرة حتى تطلع بلحظة */
  function decode207(a) {
    if (DEC.has(a.id)) return DEC.get(a.id);
    const p = url207(a).then(u => new Promise((ok, no) => { const im = new Image; im.decoding = "async"; im.onload = () => (im.decode ? im.decode().catch(() => { }) : Promise.resolve()).then(() => ok(im)); im.onerror = no; im.src = u; }));
    DEC.set(a.id, p); p.catch(() => DEC.delete(a.id)); return p;
  }
  W.url207 = url207;
  /* PDF: نرسم صفحاته داخل النظام (pdf.js) كصورة وحدة، وننحفظ بالجهاز */
  let PJ = null;
  const pdfjs = () => PJ || (PJ = new Promise((ok, no) => { if (W.pdfjsLib) return ok(W.pdfjsLib); const s = D.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"; s.onload = () => { try { W.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; } catch (e) { } ok(W.pdfjsLib); }; s.onerror = e => { PJ = null; no(e); }; D.head.appendChild(s); }));
  async function pdfImg207(a) {
    try { const c = IDB() && await IDB().get("pr_" + a.id); if (c && c.k == ver(a) && c.b) return c.b; } catch (e) { }
    const d = await blob207(a), lib = await pdfjs(), bin = atob(d), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const doc = await lib.getDocument({ data: u }).promise, n = Math.min(doc.numPages, 12), pages = [];
    for (let i = 1; i <= n; i++) { const pg = await doc.getPage(i), v0 = pg.getViewport({ scale: 1 }), sc = Math.min(2.2, 1700 / v0.width), v = pg.getViewport({ scale: sc }); const c = D.createElement("canvas"); c.width = v.width; c.height = v.height; await pg.render({ canvasContext: c.getContext("2d"), viewport: v }).promise; pages.push(c); }
    const W2 = Math.max(...pages.map(c => c.width)), gap = 16, H = pages.reduce((s, c) => s + c.height, 0) + gap * (pages.length - 1);
    const out = D.createElement("canvas"); out.width = W2; out.height = Math.min(H, 30000); const g = out.getContext("2d"); g.fillStyle = "#555"; g.fillRect(0, 0, out.width, out.height);
    let y = 0; pages.forEach(c => { g.drawImage(c, (W2 - c.width) / 2, y); y += c.height + gap; });
    const b = await new Promise(ok => out.toBlob(ok, "image/jpeg", .9));
    try { if (IDB()) IDB().put("pr_" + a.id, { k: ver(a), b, at: Date.now() }); } catch (e) { }
    return b;
  }
  on(() => { if (typeof aBlob == "function") aBlob = blob207; });

  /* ---------- العارض ---------- */
  const st = D.createElement("style");
  st.textContent = `.av207{position:fixed;inset:0;z-index:2147483001;background:#16191b;display:flex;flex-direction:column;touch-action:none;color:#fff}
.av207 .bar{display:flex;align-items:center;gap:6px;padding:8px 10px;padding-top:calc(8px + env(safe-area-inset-top,0px));background:#14493f;flex-wrap:wrap}
.av207 .bar b{flex:1;min-width:0;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (max-width:700px){.av207 .bar b{flex-basis:100%;order:-1;white-space:normal;line-height:1.4}}
.av207 .bar .btn{background:rgba(255,255,255,.14);color:#fff;border-color:rgba(255,255,255,.35);touch-action:manipulation}
.av207 .stage{flex:1;position:relative;overflow:hidden;cursor:grab}
.av207 .stage.drag{cursor:grabbing}
.av207 img{position:absolute;left:0;top:0;transform-origin:0 0;max-width:none;user-select:none;-webkit-user-drag:none;will-change:transform;background:#fff}
.av207 .nav{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:64px;border-radius:12px;border:0;background:rgba(0,0,0,.45);color:#fff;font-size:28px;cursor:pointer;z-index:2}
.av207 .nav.p{right:8px}.av207 .nav.n{left:8px}.av207 .nav[disabled]{opacity:.25}
.av207 .msg{position:absolute;inset:0;display:grid;place-items:center;font-size:15px;opacity:.85}
.av207 .foot{display:flex;gap:6px;padding:6px 10px calc(8px + env(safe-area-inset-bottom,0px));background:#101314;overflow-x:auto}
.av207 .foot button{flex:none;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;border-radius:8px;padding:5px 9px;font:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap}
.av207 .foot button.on{background:#c9a24a;color:#000;border-color:#c9a24a}
.yr207{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.yr207 button{border:1px solid var(--line);background:var(--surface,#fff);border-radius:999px;padding:6px 12px;font:inherit;font-size:13.5px;cursor:pointer;color:inherit}
.yr207 button.on{background:var(--accent,#1e5a46);color:#fff;border-color:var(--accent,#1e5a46)}
.yr207 button small{opacity:.75;margin-inline-start:4px}`;
  D.head.appendChild(st);

  const isImg = a => /^image\//.test(a.type || "");
  const listFor = a => {
    const L = (typeof ARC != "undefined" ? ARC : []).filter(x => x.src == "db" && x.sec == a.sec && (x.yr || "") == (a.yr || "") && (!AB || a.sec != "brd" || brOf(x) == AB) && (isImg(x) || /pdf/.test(x.type || "")));
    return L.sort((x, y) => String(x.cls || "").localeCompare(String(y.cls || ""), "ar") || String(x.title || "").localeCompare(String(y.title || ""), "ar", { numeric: true }));
  };
  let V7 = null;
  async function show(i) {
    const S = V7; if (!S) return;
    S.i = i = Math.max(0, Math.min(S.L.length - 1, i));
    const a = S.L[i], w = S.w;
    w.querySelector(".bar b").textContent = (a.title || a.name || "") + "  (" + A(i + 1) + " / " + A(S.L.length) + ")";
    w.querySelector(".nav.p").disabled = i == 0; w.querySelector(".nav.n").disabled = i == S.L.length - 1;
    w.querySelectorAll(".foot button").forEach((b, j) => { b.classList.toggle("on", j == i); if (j == i) b.scrollIntoView({ inline: "center", block: "nearest" }); });
    const img = S.img, msg = w.querySelector(".msg");
    msg.style.display = "none";
    let im;
    const slow = setTimeout(() => { if (V7 && V7.i == i) { msg.textContent = isImg(a) ? "جارٍ الفتح…" : "جارٍ تجهيز ملف PDF…"; msg.style.display = ""; img.style.visibility = "hidden"; } }, 120);
    try { im = await decode207(a); } catch (e) {
      clearTimeout(slow); if (!V7 || V7.i != i) return;
      img.style.visibility = "hidden"; msg.style.display = "";
      msg.innerHTML = navigator.onLine === false ? "هذا الملف بعده ما محفوظ بالجهاز — يتحفظ وحده أول ما يرجع الإنترنت" : `تعذّر الفتح — <button class="btn sm" id="rt207">إعادة المحاولة</button>`;
      const rb = w.querySelector("#rt207"); if (rb) rb.onclick = () => show(i);
      return;
    }
    clearTimeout(slow);
    if (!V7 || V7.i != i) return;
    if (img.src != im.src) img.src = im.src;
    const done = () => { if (!V7 || V7.i != i) return; msg.style.display = "none"; img.style.visibility = ""; fit(); };
    if (img.complete && img.naturalWidth) done(); else img.onload = done;
    /* تجهيز اللي بعده واللي قبله بالخلفية حتى ينفتحن فوراً */
    [i + 1, i - 1, i + 2, i + 3].forEach(j => { const b = S.L[j]; if (b) decode207(b).catch(() => { }); });
  }
  async function openPdf(a) {
    try { const b = await blob207(a); const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const url = URL.createObjectURL(new Blob([u], { type: "application/pdf" })); W.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 6e5); } catch (e) { T("تعذّر فتح الملف", "err"); }
  }
  /* التكبير والسحب */
  const apply = () => { const S = V7; if (S) S.img.style.transform = `translate(${S.x}px,${S.y}px) scale(${S.z})`; };
  function fit() {
    const S = V7; if (!S) return; const st = S.st.getBoundingClientRect(), im = S.img;
    const z = Math.min(st.width / im.naturalWidth, st.height / im.naturalHeight) || 1;
    S.z0 = S.z = z; S.x = (st.width - im.naturalWidth * z) / 2; S.y = Math.max(0, (st.height - im.naturalHeight * z) / 2); apply();
  }
  function fitW() { const S = V7; if (!S) return; const st = S.st.getBoundingClientRect(); S.z = st.width / S.img.naturalWidth; S.x = 0; S.y = 0; apply(); }
  function zoomAt(k, cx, cy) {
    const S = V7; if (!S) return; const r = S.st.getBoundingClientRect();
    cx = cx == null ? r.width / 2 : cx - r.left; cy = cy == null ? r.height / 2 : cy - r.top;
    const nz = Math.max(S.z0 * 0.5, Math.min(S.z0 * 12, S.z * k)); const f = nz / S.z;
    S.x = cx - (cx - S.x) * f; S.y = cy - (cy - S.y) * f; S.z = nz; apply();
  }
  function open(id) {
    const a = (typeof ARC != "undefined" ? ARC : []).find(x => x.id == id); if (!a) return;
    if (!isImg(a) && !/pdf/.test(a.type || "")) { if (typeof aGet == "function") aGet(id); return; }
    D.querySelectorAll(".av207").forEach(x => x.remove());
    const L = listFor(a), i = Math.max(0, L.findIndex(x => x.id == a.id));
    const w = D.createElement("div"); w.className = "av207"; w.setAttribute("role", "dialog");
    w.innerHTML = `<div class="bar"><button class="btn sm" data-a="x">${I("back")} إغلاق</button><b></b><button class="btn sm" data-a="o" title="تصغير">－</button><button class="btn sm" data-a="f" title="الصفحة كاملة">ملء</button><button class="btn sm" data-a="w" title="عرض الشاشة">↔</button><button class="btn sm" data-a="z" title="تكبير">＋</button><button class="btn sm" data-a="p">${I("print")} طباعة</button><button class="btn sm" data-a="d">${I("inst")} تنزيل</button></div>
<div class="stage"><img alt=""><div class="msg">جارٍ الفتح…</div><button class="nav p" title="السابقة">→</button><button class="nav n" title="التالية">←</button></div>
<div class="foot">${L.map((x, j) => `<button data-j="${j}">${E((x.title || x.name || "").replace(/^السادس\s+\S+\s+20\d\d-20\d\d\s+—\s+/, ""))}</button>`).join("")}</div>`;
    D.body.appendChild(w);
    const S = V7 = { w, L, i, st: w.querySelector(".stage"), img: w.querySelector("img"), x: 0, y: 0, z: 1, z0: 1 };
    try { D.documentElement.style.overflow = "hidden"; } catch (e) { }
    const close = () => { V7 = null; w.remove(); D.documentElement.style.overflow = ""; D.removeEventListener("keydown", key); };
    const key = e => { if (e.key == "Escape") close(); else if (e.key == "ArrowLeft") show(S.i + 1); else if (e.key == "ArrowRight") show(S.i - 1); else if (e.key == "+" || e.key == "=") zoomAt(1.25); else if (e.key == "-") zoomAt(0.8); };
    D.addEventListener("keydown", key);
    w.querySelector('[data-a="x"]').onclick = close;
    w.querySelector('[data-a="z"]').onclick = () => zoomAt(1.3);
    w.querySelector('[data-a="o"]').onclick = () => zoomAt(1 / 1.3);
    w.querySelector('[data-a="f"]').onclick = fit;
    w.querySelector('[data-a="w"]').onclick = fitW;
    w.querySelector('[data-a="p"]').onclick = () => { const a2 = S.L[S.i]; if (a2) W.ap207(a2.id); };
    w.querySelector('[data-a="d"]').onclick = () => { const a2 = S.L[S.i]; if (a2 && typeof aGet == "function") aGet(a2.id); };
    w.querySelector(".nav.p").onclick = () => show(S.i - 1);
    w.querySelector(".nav.n").onclick = () => show(S.i + 1);
    w.querySelectorAll(".foot button").forEach(b => b.onclick = () => show(+b.dataset.j));
    /* الماوس: عجلة = تكبير، سحب = تحريك، ضغطتين = تكبير/رجوع */
    const stg = S.st;
    stg.addEventListener("wheel", e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
    stg.addEventListener("dblclick", e => { if (S.z > S.z0 * 1.4) fit(); else zoomAt(2.5, e.clientX, e.clientY); });
    /* اللمس والسحب: إصبع = تحريك (أو سحب سريع لليمين/اليسار = الصفحة الثانية لما الصورة مو مكبّرة)، إصبعين = تكبير */
    const P = new Map(); let start = null, pinch = null, lastTap = 0;
    stg.addEventListener("pointerdown", e => {
      if (e.target.closest("button")) return;
      stg.setPointerCapture(e.pointerId); P.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (P.size == 1) { start = { x: e.clientX, y: e.clientY, ox: S.x, oy: S.y, t: Date.now() }; stg.classList.add("drag"); const now = Date.now(); if (e.pointerType == "touch" && now - lastTap < 300) { if (S.z > S.z0 * 1.4) fit(); else zoomAt(2.5, e.clientX, e.clientY); } lastTap = now; }
      if (P.size == 2) { const [p1, p2] = [...P.values()]; pinch = { d: Math.hypot(p1.x - p2.x, p1.y - p2.y), z: S.z, cx: (p1.x + p2.x) / 2, cy: (p1.y + p2.y) / 2, ox: S.x, oy: S.y }; start = null; }
    });
    stg.addEventListener("pointermove", e => {
      if (!P.has(e.pointerId)) return; P.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && P.size >= 2) {
        const [p1, p2] = [...P.values()]; const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const r = stg.getBoundingClientRect(); const nz = Math.max(S.z0 * 0.5, Math.min(S.z0 * 12, pinch.z * d / pinch.d)); const f = nz / pinch.z;
        const cx = pinch.cx - r.left, cy = pinch.cy - r.top, mx = (p1.x + p2.x) / 2 - r.left, my = (p1.y + p2.y) / 2 - r.top;
        S.z = nz; S.x = mx - (cx - pinch.ox) * f; S.y = my - (cy - pinch.oy) * f; apply();
      } else if (start) { S.x = start.ox + (e.clientX - start.x); S.y = start.oy + (e.clientY - start.y); apply(); }
    });
    const up = e => {
      if (!P.has(e.pointerId)) return; P.delete(e.pointerId); stg.classList.remove("drag");
      if (start && P.size == 0) {
        const dx = e.clientX - start.x, dy = e.clientY - start.y, dt = Date.now() - start.t;
        if (S.z <= S.z0 * 1.05 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 600) { show(S.i + (dx < 0 ? 1 : -1)); }
      }
      if (P.size < 2) pinch = null; if (P.size == 0) start = null;
    };
    stg.addEventListener("pointerup", up); stg.addEventListener("pointercancel", up);
    W.addEventListener("resize", () => { if (V7 === S) fit(); });
    show(i);
  }
  W.av207 = open;
  on(() => { if (typeof aView == "function") aView = open; });

  /* ---------- الأرشيف: قائمة مرتبة — العام الدراسي ثم الفرع، ولكل بورد: فتح / طباعة / تنزيل ---------- */
  const BR = [["", "كل الفروع"], ["العلمي", "العلمي"], ["الأدبي", "الأدبي"], ["التطبيقي", "التطبيقي"], ["الإحيائي", "الإحيائي"]];
  const brOf = a => { const c = String(a.cls || "") + " " + String(a.title || ""); return /تطبيقي/.test(c) ? "التطبيقي" : /احيائي|إحيائي/.test(c) ? "الإحيائي" : /ادبي|أدبي/.test(c) ? "الأدبي" : /علمي/.test(c) ? "العلمي" : ""; };
  let AB = "";
  W.ab207 = v => { AB = v; try { render(); } catch (e) { } };
  W.ay207 = y => { try { AY = y; } catch (e) { } try { render(); } catch (e) { } };
  const short = a => String(a.title || a.name || "").replace(/^السادس\s+\S+\s+20\d\d-20\d\d\s+—\s+/, "").replace(/^الادبي|^الأدبي|^العلمي/, m => m);
  W.ap207 = async id => {
    const a = (typeof ARC != "undefined" ? ARC : []).find(x => x.id == id); if (!a) return;
    T("جارٍ تجهيز الطباعة…");
    try {
      let src;
      if (isImg(a)) src = "data:" + a.type + ";base64," + await blob207(a);
      else { const b = await pdfImg207(a); src = await new Promise(ok => { const r = new FileReader; r.onload = () => ok(r.result); r.readAsDataURL(b); }); }
      const im = await new Promise((ok, no) => { const i = new Image; i.onload = () => ok(i); i.onerror = no; i.src = src; });
      const land = im.naturalWidth > im.naturalHeight;
      const body = `<div style="text-align:center"><img src="${src}" style="max-width:100%;max-height:${land ? 185 : 272}mm;width:auto;height:auto"></div>`;
      if (typeof exportAs == "function") exportAs("html", a.title || "بورد", body, land ? "landscape" : "portrait");
    } catch (e) { T("تعذّرت الطباعة — تأكد من الإنترنت", "err"); }
  };
  function list207() {
    const all = (typeof ARC != "undefined" ? ARC : []).filter(a => a.sec == AS0);
    const yrs = [...new Set(all.map(a => a.yr || "بدون عام"))].sort().reverse();
    let y = (typeof AY != "undefined" && AY) || "";
    if (!y || !yrs.includes(y)) { y = yrs[0] || ""; try { AY = y; } catch (e) { } }
    const inY = all.filter(a => (a.yr || "بدون عام") == y);
    const brs = BR.filter(([k]) => !k || inY.some(a => brOf(a) == k));
    if (AB && !brs.some(([k]) => k == AB)) AB = "";
    const L = inY.filter(a => !AB || brOf(a) == AB);
    const G = {}; L.forEach(a => { const k = brOf(a) || "أخرى"; (G[k] = G[k] || []).push(a); });
    const ord = ["العلمي", "الأدبي", "التطبيقي", "الإحيائي", "أخرى"];
    const row = a => `<div class="arw207"><span class="t">${E(short(a))}</span><span class="b"><button class="btn sm" onclick="av207('${a.id}')">${I("eye") || ""}فتح</button><button class="btn ghost sm" onclick="ap207('${a.id}')">${I("print")} طباعة</button><button class="btn ghost sm" onclick="aGet('${a.id}')">${I("inst")} تنزيل</button><button class="btn ghost sm" title="التفاصيل" onclick="ASEL='${a.id}';HOLD=1;render()">⋯</button></span></div>`;
    return `<div class="sel207"><p class="sub" style="margin:0 0 4px">العام الدراسي</p><div class="yr207">${yrs.map(v => `<button class="${v == y ? "on" : ""}" onclick="ay207('${E(v)}')">${A(E(v))}</button>`).join("")}</div>
${brs.length > 2 ? `<p class="sub" style="margin:6px 0 4px">الفرع</p><div class="yr207">${brs.map(([k, t]) => `<button class="${AB == k ? "on" : ""}" onclick="ab207('${k}')">${t}</button>`).join("")}</div>` : ""}</div>
${ord.filter(k => G[k]).map(k => `<div class="box"><h3>${AS0 == "brd" ? "السادس " : ""}${k} — ${A(y)} <span class="sub">(${A(G[k].length)})</span></h3>${G[k].sort((p, q) => short(p).localeCompare(short(q), "ar", { numeric: true })).map(row).join("")}</div>`).join("") || (typeof emptyState == "function" ? emptyState("ما بيه ملفات", "") : "")}`;
  }
  on(() => {
    if (typeof aResHTML != "function") return;
    const _ar = aResHTML;
    aResHTML = function () {
      try { if (!(typeof AQ != "undefined" && String(AQ).trim())) return list207(); } catch (e) { console.warn(e); }
      return _ar.apply(this, arguments);
    };
  });
  on(() => {
    if (typeof V == "undefined" || typeof V.z != "function") return;
    const _vz = V.z;
    V.z = function () {
      let h = _vz.apply(this, arguments);
      try {
        if (typeof ASEL != "undefined" && ASEL) return h;
        /* شيل اللي يشتت: صندوق «فتح أرشيف الملفات» القديم، شرح الفهرس، وقائمة الأعوام المنسدلة (صارت أزرار) */
        h = h.replace(/<div class="box hl"><h3>[\s\S]*?أرشيف ملفات إعدادية سيناء[\s\S]*?<\/div><\/div>\s*<p class="sect">[^<]*<\/p>/, "");
        h = h.replace(/<p class="muted" style="margin:-4px 0 10px">[\s\S]*?<\/p>/, "");
        h = h.replace(/<select onchange="AY=this\.value[\s\S]*?<\/select>/, "");
      } catch (e) { }
      return h;
    };
  });
  /* البورد المضاف بالعام الحالي (قبل ما ينمتحن) عامه الصحيح هو اللي قبله */
  on(() => {
    let done = 0;
    setInterval(() => {
      try {
        if (done || !W.GXOWN || typeof ARC == "undefined" || typeof AREADY == "undefined" || !AREADY || typeof curYr != "function") return;
        done = 1; const cy = curYr(), y0 = +cy.slice(0, 4), prev = (y0 - 1) + "-" + y0;
        ARC.filter(a => a.sec == "brd" && a.yr && a.yr >= cy).forEach(a => { a.yr = prev; if (typeof aPut == "function") aPut(a); });
      } catch (e) { }
    }, 3000);
  });
  st.textContent += `.arw207{display:flex;align-items:center;gap:8px;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)}
.arw207:last-child{border-bottom:0}.arw207 .t{font-weight:700;font-size:15px}.arw207 .b{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.sel207{position:sticky;top:0;z-index:3;background:var(--bg,#f5f6f4);padding:6px 0 8px}`;

  /* ---------- البحث باسم الطالب داخل البوردات: يطلع اسمه ورقمه الامتحاني ودرجاته (من البوردات المقروءة) ---------- */
  let BX = null, BXS = 0;
  function bxSub() {
    if (BXS || typeof DB == "undefined" || !DB) return; BXS = 1;
    try { DB.collection("brdx").onSnapshot(qs => { BX = qs.docs.map(d => ({ id: d.id, ...(d.data() || {}) })); try { const e = D.getElementById("ares"); if (e && typeof aResHTML == "function") e.innerHTML = aResHTML(); } catch (x) { } }); } catch (e) { }
  }
  const NZ = t => String(t || "").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/\s+/g, " ").trim().replace(/(^|\s)(عبد|ابو)\s+/g, "$1$2");
  function bxFind(q) {
    if (!BX) return [];
    const T = NZ(q).split(" ").filter(Boolean); if (!T.length) return [];
    const num = T.length == 1 && /^\d{4,}$/.test(T[0].replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)));
    const out = [];
    BX.forEach(b => (b.rows || []).forEach(r => {
      const n = NZ(r[2]).split(" ");
      const ok = num ? String(r[1]).endsWith(T[0].replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c))) : T.every((t, i) => n[i] && (n[i] == t || (i == T.length - 1 && n[i].startsWith(t))));
      if (ok) out.push({ b, r });
    }));
    return out.sort((x, y) => String(y.b.yr).localeCompare(String(x.b.yr)));
  }
  W.bxFind207 = bxFind;
  const bxCard = ({ b, r }) => {
    const g = r[3] || [], pass = /ناجح/.test(r[4]);
    return `<div class="bx207"><div class="h"><b>${E(r[2])}</b><span class="chip ${pass ? "good" : "bad"}">${E(r[4] || "")}</span></div>
<div class="m">الرقم الامتحاني: <b dir="ltr">${A(r[1])}</b> · السادس ${E(b.br)} · ${E(b.round)} · ${A(E(b.yr))}</div>
<div class="g">${(b.cols || []).map((c, i) => { const v = g[i] == null ? "" : String(g[i]); const low = /^\d+$/.test(v) && +v < 50 || /صفر|^م$|ست/.test(v); return `<div><span>${E(c)}</span><b style="${low ? "color:#b00020" : ""}">${E(A(v))}</b></div>`; }).join("")}<div class="s"><span>المجموع</span><b>${A(r[5] || 0)}</b></div><div class="s"><span>المعدل</span><b>${A(r[6] || 0)}</b></div></div></div>`;
  };
  on(() => {
    if (typeof aResHTML != "function") return;
    const _ar = aResHTML;
    aResHTML = function () {
      let h = _ar.apply(this, arguments);
      try {
        bxSub();
        const q = typeof AQ != "undefined" ? String(AQ).trim() : "";
        if (q && typeof AS0 != "undefined" && AS0 == "brd") {
          const R = (W.bxFind207 || bxFind)(q);
          const box = `<div class="box hl"><h3>${I("search")} نتيجة البحث بالبوردات (${A(R.length)})</h3>${R.length ? R.slice(0, 30).map(bxCard).join("") : `<p class="muted" style="margin:0">ما لكيت هذا الاسم بالبوردات المقروءة لحد هسه${BX ? " (" + A(BX.length) + " بورد مقروء)" : ""}.</p>`}</div>`;
          h = box + h.replace(/<div class="box empty">[\s\S]*?<\/div>/, "");
        }
      } catch (e) { console.warn(e); }
      return h;
    };
  });
  st.textContent += `.bx207{border:1px solid var(--line);border-radius:12px;padding:10px;margin:8px 0;background:var(--surface,#fff)}
.bx207 .h{display:flex;justify-content:space-between;align-items:center;gap:8px}.bx207 .h b{font-size:16px}.bx207 .m{font-size:13.5px;margin:4px 0 6px;color:var(--muted,#555)}
.bx207 .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}.bx207 .g>div{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line);border-radius:8px;padding:6px 10px;font-size:14px}.bx207 .g b{font-size:16px}.bx207 .g .s{background:var(--sunk,#f2f4f1)}`;

  /* aOpenBtn: الـPDF بالأرشيف يفتح بالعارض هم */
  on(() => {
    if (typeof aOpenBtn != "function") return;
    const _o = aOpenBtn;
    aOpenBtn = function (a, p) {
      let h = _o.apply(this, arguments);
      try { if (a && a.src == "db" && /pdf/.test(a.type || "") && h.indexOf("av207") < 0) h = `<button class="btn ghost sm" onclick="av207('${a.id}')">فتح</button> ` + h; } catch (e) { }
      return h;
    };
  });
})();
