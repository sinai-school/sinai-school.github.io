/* ===== v206 (29 Oct 2026) — حسابات تجريبية كاملة، إجبار تفعيل الإشعارات، الجدول الأسبوعي، التنقل والرجوع، الوضوح، القيد العام، جدول المديرية ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v206", e); } };
  const LG = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
  const LS = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const T = (m, k) => { try { (typeof toast == "function" ? toast : console.log)(m, k); } catch (e) { } };
  const E = s => typeof esc == "function" ? esc(s) : String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const A = v => typeof toAr == "function" ? toAr(v) : v;
  const I = n => typeof ic == "function" ? ic(n) : "";
  const isStaff = () => !!(typeof GX != "undefined" && GX.on);
  const own = () => isStaff() && !!W.GXOWN;
  const portalOn = () => { const p = D.getElementById("portal"); return !!(p && !p.hidden); };
  const hasPS = () => typeof PS != "undefined" && PS;

  /* =====================================================================
     (١) الحسابات التجريبية: دخول مباشر (بدون «اختر اسمك»)، صف وفرع قابل للتغيير، مدرس يعرض جدول أي مدرس
     ===================================================================== */
  const TST = W.TST205 || { s: { key: "tst-s", n: "طالب تجريبي", phone: "07000000001", nid: "200900000001" }, t: { key: "tst-t", n: "مدرس تجريبي", phone: "07000000002", nid: "199000000002" } };
  const BR = ["الرابع العلمي", "الرابع الأدبي", "الخامس العلمي", "الخامس الأدبي", "السادس العلمي", "السادس الأدبي"];
  const credOf = k => ({ kind: k, key: TST[k].key, phone: TST[k].phone, nid: TST[k].nid });
  const snapSN = () => (typeof SNAP != "undefined" && SNAP && SNAP.sn) || [];
  function localBundle(k) {
    const sec = snapSN()[0] || "الرابع العلمي أ";
    return k == "s"
      ? { ok: 1, phone: TST.s.phone, private: { n: TST.s.n, s: sec, secs: [sec, "شعبة تجريبية"], st: "جديد", test: 1, pre: { nid: TST.s.nid }, days: [], g: [], res: "" }, profile: {}, status: "ok", photo: "", notes: [], at: new Date().toISOString(), off206: 1 }
      : { ok: 1, phone: TST.t.phone, private: { n: TST.t.n, job: "مدرس", test: 1, secs: ["شعبة تجريبية"], studs: [TST.s.key], studs2: [[TST.s.key, TST.s.n, "شعبة تجريبية"]], pre: { nid: TST.t.nid } }, profile: {}, status: "ok", photo: "", notes: [], at: new Date().toISOString(), off206: 1 };
  }
  function tstFill(k) {
    const x = TST[k];
    try { if (typeof nid133K == "function" && typeof lsS == "function") lsS(nid133K(k, x.key), x.nid); } catch (e) { }
    PS.kind = k; PS.key = x.key; PS.name = x.n; PS.phone = x.phone; PS.err = ""; PS.edit = 0;
    if (!PS.tab || PS.tab == "pick") PS.tab = "f";
    const c = LG("tst206b" + k);
    const b = (PS.b && PS.b.private && PS.b.phone == x.phone) ? PS.b : (c && c.private ? c : null);
    if (b) { PS.b = b; PS.stage = "in"; } else { PS.b = null; PS.stage = "chk"; }
    PS.off = 0;
    LS("tst205", k);
  }
  let TSTB = 0;
  async function tstRefresh(k, quiet) {
    if (TSTB) return; TSTB = 1;
    try {
      const r = await api(Object.assign({ a: "login" }, credOf(k)));
      if (r && r.ok) { LS("tst206b" + k, r); if (hasPS() && PS.key == TST[k].key) { PS.b = r; PS.stage = "in"; try { psKeep(); } catch (e) { } } }
      else if (!quiet) T("تعذّر تحديث الحساب التجريبي من الخادم — معروض آخر نسخة", "err");
    } catch (e) { if (!quiet) T("ما أكو اتصال — الحساب التجريبي معروض بدون إنترنت", "err"); }
    finally { TSTB = 0; }
    if (hasPS() && PS.key == TST[k].key && !PS.b) { PS.b = localBundle(k); PS.stage = "in"; }
    if (hasPS() && PS.key == TST[k].key && portalOn()) { const y = W.scrollY; prender(); W.scrollTo(0, y); }
  }
  function tstOpen(k, show) {
    if (!TST[k] || !hasPS()) return;
    ROLE = k; try { sess(k); } catch (e) { }
    tstFill(k);
    if (show || !portalOn()) showPortal(); else prender();
    tstRefresh(k, 1);
  }
  W.tst205 = (k) => tstOpen(k, 0);
  W.tst206 = tstOpen;
  if (typeof lgSubmit == "function") {
    const _lg = lgSubmit;
    lgSubmit = function (e) {
      try {
        const r = typeof LGR != "undefined" ? LGR : "", u = ((D.getElementById("lgu") || {}).value || "").trim().toLowerCase(), p = ((D.getElementById("lgp") || {}).value || "").trim();
        if ((r == "s" || r == "t") && u == "test" && p == "1234") { if (e && e.preventDefault) e.preventDefault(); tstOpen(r, 1); return false; }
      } catch (x) { console.warn(x); }
      return _lg.apply(this, arguments);
    };
  }
  /* أي رسم للبوابة والحساب التجريبي محفوظ: يفتح مباشرة بدون شاشة «اختر اسمك» */
  if (typeof prender == "function") {
    const _pr = prender;
    prender = function () {
      try {
        const k = LG("tst205");
        if (k && TST[k] && hasPS() && !PS.key && typeof ROLE != "undefined" && ROLE == k) { tstFill(k); setTimeout(() => tstRefresh(k, 1), 50); }
      } catch (e) { }
      return _pr.apply(this, arguments);
    };
  }
  on(() => { const k = LG("tst205"); if (k && TST[k] && hasPS() && !PS.key && typeof ROLE != "undefined" && ROLE == k && portalOn()) tstOpen(k, 0); });
  /* رابط مباشر من الإدارة: ?tst=s أو ?tst=t */
  on(() => { const m = /[?&]tst=([st])\b/.exec(location.search); if (m && typeof SNAP != "undefined" && SNAP) { setTimeout(() => tstOpen(m[1], 1), 30); try { history.replaceState(history.state, "", location.pathname + location.hash); } catch (e) { } } });
  /* الخروج من الحساب التجريبي */
  W.tst206Out = () => { LS("tst205", null); try { psOut(1); } catch (e) { } if (hasPS()) { PS.key = null; PS.b = null; } try { logout(); } catch (e) { prender(); } };
  /* تغيير صف وشعبة الطالب التجريبي / جدول المدرس اللي يعرضه المدرس التجريبي */
  W.tst206Set = async (o) => {
    const k = PS.kind; if (!TST[k]) return;
    T("جارٍ التغيير…");
    try {
      const r = await api(Object.assign({ a: "tstSet" }, credOf(k), o));
      if (!r || !r.ok) return T(r && r.err == "sec" ? "الشعبة غير موجودة بالجدول المنشور" : "تعذّر التغيير — حاول مرة ثانية", "err");
      if (k == "s" && PS.b && PS.b.private) { PS.b.private.s = o.sec; PS.b.private.secs = [o.sec, "شعبة تجريبية"]; }
      if (k == "t" && PS.b && PS.b.private) PS.b.private.as = o.as || "";
      prender(); await tstRefresh(k, 0);
      T(k == "s" ? "صار الطالب التجريبي بـ «" + o.sec + "» ✓" : (o.as ? "المدرس التجريبي يعرض جدول المدرس المختار ✓" : "رجع جدول المدرس التجريبي فارغ"));
    } catch (e) { T("ما أكو اتصال", "err"); }
  };
  W.tst206Br = br => { const s = snapSN().find(n => n.startsWith(br + " ")); if (s) W.tst206Set({ sec: s }); };
  function tstBanner() {
    const pv = (PS.b && PS.b.private) || {};
    let ctl = "";
    if (PS.kind == "s") {
      const cur = String(pv.s || ""), br = BR.find(b => cur.startsWith(b + " ")) || "";
      ctl = `<div class="t206row"><span class="t206l">الصف والفرع:</span><div class="t206chips">${BR.filter(b => snapSN().some(n => n.startsWith(b + " "))).map(b => `<button type="button" class="${b == br ? "on" : ""}" onclick="tst206Br('${b}')">${E(b)}</button>`).join("")}</div></div>`
        + `<div class="t206row"><span class="t206l">الشعبة:</span><select onchange="tst206Set({sec:this.value})">${snapSN().filter(n => !br || n.startsWith(br + " ")).map(n => `<option ${n == cur ? "selected" : ""}>${E(n)}</option>`).join("")}</select></div>`
        + (pv.demo ? `<p class="t206n">الدرجات تجريبية تلقائية — تتغير من «الحسابات التجريبية» بالنظام.</p>` : "");
    } else {
      const L = (typeof SNAP != "undefined" && SNAP && SNAP.tch) || [];
      ctl = `<div class="t206row"><span class="t206l">اعرض جدول المدرس:</span><select onchange="tst206Set({as:this.value})"><option value="">— بدون —</option>${L.filter(x => x && x.k).map(x => `<option value="${E(x.k)}" ${x.k == pv.as ? "selected" : ""}>${E(x.n)}${x.spec ? " — " + E(x.spec) : ""}</option>`).join("")}</select></div><p class="t206n">إرسال التبليغات والدرجات من المدرس التجريبي يوصل للطالب التجريبي فقط.</p>`;
    }
    return `<div class="t206b"><div class="t206h"><span>${I("alert")} <b>حساب تجريبي</b> <small>ما ينحسب بالإحصاءات ولا الأعداد ولا الشعب</small></span><button class="btn ghost sm" onclick="tst206Out()">خروج</button></div>${ctl}</div>`;
  }
  if (typeof psView == "function") {
    const _pv = psView;
    psView = function () {
      const tst = hasPS() && /^tst-/.test(PS.key || "") && PS.b;
      if (!tst) return _pv.apply(this, arguments);
      let h;
      const pv = (PS.b && PS.b.private) || {}, k0 = PS.key;
      /* المدرس التجريبي: يعرض جدول المدرس المختار */
      if (PS.kind == "t" && pv.as && PS.tab == "t") { PS.key = pv.as; try { h = _pv.apply(this, arguments); } finally { PS.key = k0; } }
      else h = _pv.apply(this, arguments);
      try {
        h = h.replace(/<div class="banner" style="border-color:#b8860b;background:#fff8e6">[\s\S]*?prender\(\)">خروج<\/button><\/div>/, "");
        h = tstBanner() + h;
      } catch (e) { }
      return h;
    };
  }

  /* =====================================================================
     (٢) الإشعارات: نافذة «لازم تفعّل الإشعارات» لكل طالب ومدرس لحد ما يفعّلها
     ===================================================================== */
  const isApp = () => /SinaiSchoolApp/.test(navigator.userAgent);
  const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform == "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = () => !!(W.matchMedia && W.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  function nState() {
    if (isApp()) return "app";
    if (!("Notification" in W) || !("serviceWorker" in navigator) || !("PushManager" in W)) return isIOS() && !standalone() ? "ios" : "na";
    return Notification.permission; /* granted | denied | default */
  }
  let NM = 0;
  function nModal() {
    if (NM || D.getElementById("nm206") || isStaff() || !portalOn() || !hasPS() || !PS.b || PS.stage != "in" || PS.edit) return;
    if (D.querySelector(".zoom,.prfb")) return;
    const st = nState(); if (st == "granted" || st == "app" || st == "na") return;
    try { if (sessionStorage.getItem("nm206")) return; } catch (e) { }
    NM = 1;
    const body = st == "ios"
      ? `<p>بالآيفون الإشعارات تشتغل بس من أيقونة البوابة على الشاشة الرئيسية:</p><ol><li>افتح الرابط بـ <b>Safari</b>.</li><li>اضغط زر <b>المشاركة</b> ⬆️ ثم <b>«إضافة إلى الشاشة الرئيسية»</b>.</li><li>افتح البوابة من الأيقونة الجديدة واضغط «تفعيل».</li></ol>`
      : st == "denied"
        ? `<p>الإشعارات مقفولة بالمتصفح. افتحها هيج:</p><ol><li>اضغط على 🔒 جنب الرابط (أو إعدادات المتصفح).</li><li>اختار <b>الأذونات ← الإشعارات ← سماح</b>.</li><li>ارجع للبوابة وحدّث الصفحة.</li></ol>`
        : `<p>حتى توصلك <b>التبليغات والدرجات وتحديثات الجدول</b> فوراً وبصوت حتى لو البوابة مسدودة، لازم تفعّل الإشعارات.</p>`;
    const m = D.createElement("div"); m.id = "nm206"; m.className = "nm206";
    m.innerHTML = `<div class="nm206c" role="dialog" aria-modal="true"><div class="nm206i">🔔</div><h3>لازم تفعّل الإشعارات</h3>${body}<div class="nm206b">${st == "default" ? `<button class="btn" id="nm206y">تفعيل الإشعارات الآن</button>` : ""}<button class="btn ghost" id="nm206n">لاحقاً</button></div></div>`;
    D.body.appendChild(m);
    const close = () => { m.remove(); NM = 0; try { sessionStorage.setItem("nm206", "1"); } catch (e) { } };
    m.querySelector("#nm206n").onclick = close;
    const y = m.querySelector("#nm206y");
    if (y) y.onclick = async () => {
      y.disabled = true; y.textContent = "لحظة…";
      let ok = 0; try { ok = typeof W.sub205 == "function" ? await W.sub205(1) : (await Notification.requestPermission()) == "granted"; } catch (e) { }
      close();
      T(ok ? "تفعّلت الإشعارات ✓" : (Notification.permission == "denied" ? "انرفض الإذن — فعّله من إعدادات المتصفح" : "ما تفعّلت — حاول مرة ثانية"), ok ? "" : "err");
      if (ok) { const b = D.getElementById("pb205"); if (b) b.remove(); }
    };
  }
  setInterval(() => on(nModal), 2500);

  /* =====================================================================
     (٣) الجدول الأسبوعي: تنقل سهل بين الأيام (سحب + أزرار بسطر واحد)، والجدول الكبير بالإدارة
     ===================================================================== */
  /* البوابة: تغيير اليوم ما يرجّع الصفحة للأعلى */
  if (typeof prender == "function") {
    const _pr2 = prender;
    prender = function () {
      const a = D.activeElement, keep = W.KEEP206 || (a && a.closest && a.closest(".daytabs"));
      const y = W.scrollY; W.KEEP206 = 0;
      const r = _pr2.apply(this, arguments);
      if (keep) W.scrollTo(0, y);
      return r;
    };
  }
  let TX = null;
  D.addEventListener("touchstart", e => { if (!portalOn() || e.touches.length != 1) return; const t = e.touches[0]; TX = { x: t.clientX, y: t.clientY, tg: e.target }; }, { passive: true });
  D.addEventListener("touchend", e => {
    if (!TX || !portalOn()) return; const t = e.changedTouches[0], dx = t.clientX - TX.x, dy = t.clientY - TX.y, tg = TX.tg; TX = null;
    if (Math.abs(dx) < 70 || Math.abs(dy) > 45) return;
    if (tg.closest && tg.closest("input,textarea,select,.tw,.wk,table,.t206chips,.daytabs")) return;
    const bar = D.querySelector("#portal .daytabs"); if (!bar) return;
    const B = [...bar.querySelectorAll("button")], i = B.findIndex(b => b.classList.contains("on") || b.getAttribute("aria-selected") == "true");
    const j = i + (dx > 0 ? 1 : -1); if (i < 0 || j < 0 || j >= B.length) return;
    W.KEEP206 = 1; B[j].click();
  }, { passive: true });
  /* الإدارة: أزرار الأيام فوق الجدول الأسبوعي للانتقال المباشر لأي يوم بالموبايل */
  function dayJump() {
    D.querySelectorAll("#main table.grid").forEach(t => {
      let w = t.parentElement; while (w && w.id != "main" && !(w.scrollWidth > w.clientWidth + 4 && /(auto|scroll)/.test(getComputedStyle(w).overflowX))) w = w.parentElement;
      if (!w || w.id == "main") { const ex = t.parentElement && t.parentElement.previousElementSibling; if (ex && ex.classList && ex.classList.contains("dj206")) ex.remove(); return; }
      if (w.previousElementSibling && w.previousElementSibling.classList.contains("dj206")) return;
      const H = [...(t.rows[0] ? t.rows[0].cells : [])].slice(1).filter(c => (c.textContent || "").trim());
      if (H.length < 2) return;
      const bar = D.createElement("div"); bar.className = "dj206";
      H.forEach((c, i) => { const b = D.createElement("button"); b.type = "button"; b.textContent = c.textContent.trim(); b.onclick = () => { bar.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); const first = t.rows[0].cells[0].getBoundingClientRect().width; const wr = w.getBoundingClientRect(), cr = c.getBoundingClientRect(); w.scrollBy({ left: (cr.right - (wr.right - first)), behavior: "smooth" }); }; bar.appendChild(b); });
      w.parentNode.insertBefore(bar, w);
    });
  }
  W.dj206 = dayJump;
  let DJN = 1; new MutationObserver(() => { DJN = 1; }).observe(D.documentElement, { childList: true, subtree: true });
  setInterval(() => { if (DJN && !D.hidden) { DJN = 0; on(dayJump); } }, 400);

  /* =====================================================================
     (٤) التنقل: زر الرجوع بالموبايل والمتصفح يرجع داخل النظام (مو يطلع منه)، ويرجع لنفس مكان الصفحة
     ===================================================================== */
  const SCR = {};
  if (typeof view == "function") {
    const _vw = view;
    view = function (v2) {
      try { if (typeof cur != "undefined" && cur) SCR[cur] = W.scrollY; } catch (e) { }
      const back = typeof NOPUSH != "undefined" && NOPUSH;
      const r = _vw.apply(this, arguments);
      if (back && SCR[v2]) { const y = SCR[v2]; requestAnimationFrame(() => setTimeout(() => W.scrollTo(0, y), 0)); }
      trap();
      return r;
    };
  }
  const canBack = () => {
    if (D.getElementById("lb206") || D.getElementById("nm206")) return true;
    if (portalOn()) return typeof PVH != "undefined" && PVH.length > 0;
    const app = D.getElementById("app"); if (!app || app.hidden) return false;
    if (typeof NAVH != "undefined" && NAVH.length) return true;
    try { if (typeof cur != "undefined" && cur && cur != "h") return true; } catch (e) { }
    return false;
  };
  let TRAP = 0;
  function trap() { if (TRAP || !canBack()) return; try { history.pushState({ s206: 1 }, ""); TRAP = 1; } catch (e) { } }
  W.addEventListener("popstate", () => {
    TRAP = 0;
    const lb = D.getElementById("lb206"); if (lb) { lb.remove(); trap(); return; }
    const nm = D.getElementById("nm206"); if (nm) { nm.remove(); NM = 0; trap(); return; }
    if (!canBack()) return;
    try {
      const app = D.getElementById("app");
      if (!portalOn() && app && !app.hidden && !(typeof NAVH != "undefined" && NAVH.length) && cur != "h") { view("h"); }
      else if (typeof goBack == "function") goBack();
    } catch (e) { }
    setTimeout(trap, 50);
  });
  setInterval(trap, 1500);

  /* =====================================================================
     (٥) الوضوح: صور ومرفقات بدقة عالية، وفتح الصور داخل النظام بسرعة (تكبير بالأصابع)
     ===================================================================== */
  on(() => {
    const CP = HTMLCanvasElement.prototype, _du = CP.toDataURL, _tb = CP.toBlob;
    const qq = (t, q) => (/jpe?g|webp/.test(String(t || "")) && typeof q == "number" && q >= .45 && q < .95) ? Math.min(.96, q + .1) : q;
    CP.toDataURL = function (t, q) { return _du.call(this, t, qq(t, q)); };
    CP.toBlob = function (cb, t, q) { return _tb.call(this, cb, t, qq(t, q)); };
    const X = CanvasRenderingContext2D.prototype, _di = X.drawImage;
    X.drawImage = function () { try { if (this.imageSmoothingQuality != "high") { this.imageSmoothingEnabled = true; this.imageSmoothingQuality = "high"; } } catch (e) { } return _di.apply(this, arguments); };
  });
  if (typeof shrink == "function") {
    const _sh = shrink;
    shrink = function (file, maxDim, maxLen) { const big = maxDim >= 1000; return _sh.call(this, file, big ? Math.max(maxDim, 2600) : maxDim, big ? Math.min(Math.round(maxLen * 2.4), 9e5) : maxLen); };
  }
  if (typeof shrinkSrc == "function") { const _ss = shrinkSrc; shrinkSrc = function (src, M, maxLen) { return _ss.call(this, src, Math.round(M * 1.5), Math.round(maxLen * 2)); }; }
  /* المرفقات: الصورة تبقى بدقتها الأصلية (تصغير بس إذا أكبر من ٣٢٠٠ بكسل) */
  if (typeof pf70Read == "function") {
    pf70Read = async function (inp) {
      const adm = !!(inp && inp.id == "an_f"), MX = adm ? 10 : 1e4, SZ = 25 * 1024 * 1024;
      const F = Array.from((inp && inp.files) || []).slice(0, MX), out = [];
      for (const f of F) {
        let u = await new Promise(ok => { const r = new FileReader; r.onload = () => ok(r.result); r.onerror = () => ok(null); r.readAsDataURL(f); });
        if (!u) { T("تعذّرت قراءة الملف «" + (f.name || "") + "»", "err"); continue; }
        let m = f.type || "application/octet-stream", n = f.name || "ملف";
        if (/^image\/(jpe?g|png|webp|heic|heif)/i.test(m)) {
          const im = await new Promise(ok => { const i = new Image; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = u; });
          const M = 3200;
          if (im && (im.width > M || im.height > M || f.size > 7e6 || /heic|heif/i.test(m))) {
            const sc = Math.min(1, M / Math.max(im.width, im.height)), c = D.createElement("canvas");
            c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
            const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
            u = c.toDataURL("image/jpeg", .92); m = "image/jpeg"; n = n.replace(/\.\w+$/, "") + ".jpg";
          }
        }
        const d = u.slice(u.indexOf(",") + 1);
        if (d.length * .75 > SZ) { T("الملف «" + n + "» أكبر من ٢٥ ميغا — ما ينرسل", "err"); continue; }
        out.push({ n, m, d });
      }
      return out;
    };
  }
  /* عارض الصور: يفتح فوراً داخل النظام، تكبير بالأصابع أو بالضغط مرتين، والإغلاق بزر الرجوع */
  const imgUrl = a => { const h = a.getAttribute("href") || "", t = (a.textContent || "").trim(); return (/\.(jpe?g|png|webp|gif|bmp)(\?|$)/i.test(h) || /\.(jpe?g|png|webp|gif|bmp|heic)$/i.test(t)) ? h : ""; };
  function lightbox(src, name) {
    const o = D.createElement("div"); o.id = "lb206";
    o.innerHTML = `<div class="lb206t"><span>${E(name || "")}</span><span><a class="btn sm" href="${E(src)}" target="_blank" rel="noopener" download>تنزيل</a> <button class="btn ghost sm" id="lb206x">إغلاق ✕</button></span></div><div class="lb206s"><img alt="" src="${E(src)}"></div>`;
    D.body.appendChild(o); trap();
    const img = o.querySelector("img"), sc = o.querySelector(".lb206s");
    let z = 1; img.ondblclick = () => { z = z > 1 ? 1 : 2.5; img.style.width = (z * 100) + "%"; img.style.maxWidth = z > 1 ? "none" : "100%"; img.style.maxHeight = z > 1 ? "none" : "100%"; };
    o.querySelector("#lb206x").onclick = () => { o.remove(); };
    sc.onclick = e => { if (e.target === sc) o.remove(); };
  }
  W.lb206 = lightbox;
  D.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (a && (a.closest("#portal") || a.closest("#main")) && !a.hasAttribute("download")) { const u = imgUrl(a); if (u) { e.preventDefault(); lightbox(u, (a.textContent || "").trim()); return; } }
    const im = e.target.closest && e.target.closest(".note1 img, .pf70 img, .fls img, .rp img, .rt img");
    if (im && im.src && !im.closest("a")) { e.preventDefault(); lightbox(im.currentSrc || im.src, im.alt || ""); }
  }, true);

  /* =====================================================================
     (٦) جدول المديرية: خانة «الشعب» و«التلاميذ» جنب عدد المدرسين = نفس المجموع (بدون الشعبة التجريبية)
     ===================================================================== */
  if (typeof FXR != "undefined" && FXR.o_dir && typeof DXF != "undefined") {
    const R0 = FXR.o_dir, _fill = R0.fill;
    R0.fill = function (host) {
      const r = _fill.apply(this, arguments);
      on(() => {
        DXF.tables(host).filter(t => /^اعداد الطلاب/.test(DXF.text(t.rows[0]).trim())).forEach(t => {
          const G = DXF.grid(t), cl = s => DXF.text(s || "").replace(/[\s​]+/g, "");
          const hr = G.findIndex(row => row && row.some(td => td && cl(td) == "المجموع")); if (hr < 0) return;
          const iS = G[hr].findIndex(td => td && cl(td) == "المجموع");
          G.forEach((row, ri) => {
            if (!row || ri <= hr) return;
            const lab = row.findIndex((td, c) => td && c < iS && /^(الشعب|التلاميذ|الطلاب)$/.test(cl(td)));
            if (lab < 1) return;
            const v = row[iS] ? DXF.text(row[iS]).trim() : ""; if (!v || /[ء-ي]/.test(v)) return;
            let nx = null; for (let i = lab - 1; i >= 0; i--) if (row[i] && row[i] !== row[lab]) { nx = row[i]; break; }
            if (nx && nx !== row[iS]) DXF.put(nx, v);
          });
        });
      });
      return r;
    };
  }

  /* =====================================================================
     (٧) القيد العام: اختيار الاسم الصحيح (الصف / القيد / البوابة)، وكشف رقم الصفحة المربوط بطالب ثاني
     ===================================================================== */
  const NZ = s => String(s || "").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim().replace(/(^|\s)(عبد|ابو)\s+/g, "$1$2");
  const tok = s => NZ(s).split(" ").filter(Boolean);
  const pgK = v => String(v == null ? "" : v).replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/\D/g, "");
  /* نفس الشخص؟ الاسم الأول والأب لازم يتطابقون */
  const lev = (a, b) => { let p = [...Array(b.length + 1).keys()]; for (let i = 1; i <= a.length; i++) { const c = [i]; for (let j = 1; j <= b.length; j++) c.push(Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] != b[j - 1]))); p = c; } return p[b.length]; };
  /* نفس الشخص؟ الاسم الأول واسم الأب متطابقين أو فرق حرف واحد بكل واحد (حسن/حسين، طاهر/ظاهر) */
  const samePerson = (a, b) => { const x = tok(a), y = tok(b); if (x.length < 2 || y.length < 2) return false; const d0 = lev(x[0], y[0]), d1 = lev(x[1], y[1]); return d0 <= 1 && d1 <= 1 && d0 + d1 <= 2 && (x.length < 3 || y.length < 3 || lev(x[2], y[2]) <= 2); };
  function cands(s) {
    if (typeof QD == "undefined" || !QD.length) return [];
    const t = tok(s.n); if (t.length < 3) return [];
    const k3 = t.slice(0, 3).join(" ");
    return QD.filter(r => pgK(r.pg) != pgK(s.pg) && (NZ(r.n) + " ").startsWith(k3 + " ")).slice(0, 4);
  }
  const QX = () => (typeof W.q205 == "function" && W.q205()) || null;
  const qi = i => { const Q = QX(); return Q && Q.rev[i]; };
  const qDone = (i, m) => { const Q = QX(); if (Q) Q.rev.splice(i, 1); T(m); render(); };
  W.q206Sys = async i => {   /* اسم القيد هو الصحيح → يتصحح اسم الطالب بالنظام */
    const it = qi(i); if (!it || (typeof guard == "function" && guard())) return;
    if (!confirm("تصحيح اسم الطالب بالنظام إلى:\n«" + it.r.n + "»؟")) return;
    const s = ST.find(x => x.id == it.s.id); if (!s) return; s.n = it.r.n; P.st(); qDone(i, "تصحّح اسم الطالب بالنظام ✓");
  };
  W.q206Por = async i => {   /* اسم البوابة (حسب البطاقة) هو الصحيح → يتصحح بالنظام وبالقيد */
    const it = qi(i); if (!it || !it.pn || (typeof guard == "function" && guard())) return;
    if (!confirm("اعتماد اسم البطاقة الموحدة:\n«" + it.pn + "»\nبالنظام وبالقيد العام؟")) return;
    const s = ST.find(x => x.id == it.s.id); if (s) { s.n = it.pn; P.st(); }
    const old = it.r.n; it.r.n = it.pn; qSaveChunk(it.r.c);
    try { const ref = DB.doc("school/qfix205"); const d = await ref.get(); const L = d.exists ? (d.data() || {}).list || [] : []; L.push({ i: it.r.i, pg: it.r.pg, old, nw: it.pn, sid: it.s.id, at: new Date().toISOString(), why: "البطاقة" }); await ref.set({ list: L.slice(-2000) }); } catch (e) { }
    qDone(i, "اعتُمد اسم البطاقة بالنظام وبالقيد ✓");
  };
  W.q206Link = (i, pg) => {   /* ربط الطالب بصفحة القيد الصحيحة */
    const it = qi(i); if (!it || (typeof guard == "function" && guard())) return;
    if (!confirm("ربط «" + it.s.n + "» بصفحة القيد " + pg + "؟")) return;
    const s = ST.find(x => x.id == it.s.id); if (!s) return; s.pg = pg; P.st(); qDone(i, "انربط الطالب بصفحة القيد الصحيحة ✓");
  };
  if (typeof V != "undefined" && typeof V.q == "function") {
    const _vq = V.q;
    V.q = function () {
      let h = _vq.apply(this, arguments);
      try {
        const Q = QX(); if (!Q || (typeof QSEL != "undefined" && (QSEL || QIMP))) return h;
        const a = h.indexOf('<details class="box"'), b = a >= 0 ? h.indexOf("</details>", a) : -1;
        if (a < 0 || b < 0 || h.slice(a, b).indexOf("مطابقة أسماء الطلاب") < 0) return h;
        const diff = [], near = [];
        Q.rev.forEach((it, i) => (samePerson(it.s.n, it.r.n) || (it.pn && samePerson(it.pn, it.r.n)) ? near : diff).push([it, i]));
        const card = ([it, i], kind) => {
          const c = kind == "d" ? cands(it.s) : [];
          return `<div class="q206c"><div class="q206h"><span>صفحة القيد <b>${A(it.r.pg)}</b>${it.r.y ? " · سنة " + A(E(it.r.y)) : ""}</span><span class="muted">${E(it.s.s || "")}</span></div>
<dl><dt>اسم الصف (النظام)</dt><dd><b>${E(it.s.n)}</b></dd><dt>اسم القيد</dt><dd>${E(it.r.n)}</dd><dt>البوابة (حسب البطاقة)</dt><dd>${E(it.pn || "—")}</dd></dl>
${kind == "d" ? `<p class="q206w">⚠️ الاسمين لطالبين مختلفين — رقم صفحة القيد المسجّل للطالب بالنظام غالباً غلط، فما ينغيّر أي اسم.</p>${c.length ? `<div class="q206a"><span class="muted">صفحات قيد بنفس اسم الطالب:</span>${c.map(r => `<button class="btn sm" onclick="q206Link(${i},'${E(String(r.pg))}')">ربط بصفحة ${A(r.pg)}${r.y ? " (" + A(E(r.y)) + ")" : ""}</button>`).join("")}</div>` : `<p class="muted" style="margin:4px 0">ما لكيت صفحة ثانية بنفس الاسم — راجع رقم الصفحة بملف الطالب.</p>`}<div class="q206a"><button class="btn ghost sm" onclick="qSkip205(${i})">اتركه</button></div>`
              : `<div class="q206a"><button class="btn sm" onclick="qFix205(${i})">اسم الصف صحيح ← يتصحح القيد</button><button class="btn sm" onclick="q206Sys(${i})">اسم القيد صحيح ← يتصحح النظام</button>${it.pn ? `<button class="btn sm" onclick="q206Por(${i})">اسم البطاقة صحيح ← يتصحح الاثنين</button>` : ""}<button class="btn ghost sm" onclick="qSkip205(${i})">اتركه</button></div>`}</div>`;
        };
        const box = `<details class="box q206" ${Q.rev.length ? "open" : ""}><summary><b>مطابقة أسماء الطلاب مع القيد العام</b><span class="q206s">تصحّح تلقائياً: ${A(Q.done || 0)} · فرق همزة أو مسافة فقط: ${A(Q.fmt || 0)} · تحتاج اختيارك: ${A(near.length)} · صفحة قيد لطالب ثاني: ${A(diff.length)}</span></summary>
${Q.rev.length ? `<p class="muted" style="margin:6px 0">لكل طالب اختار الاسم الصحيح، وينصحح وحده بالمكان الثاني. «البوابة» هو الاسم اللي كتبه الطالب حسب بطاقته الموحدة.</p>${near.slice(0, 150).map(x => card(x, "n")).join("")}${diff.length ? `<h3 style="margin:14px 0 6px">صفحة القيد مربوطة بطالب ثاني (${A(diff.length)})</h3>` + diff.slice(0, 150).map(x => card(x, "d")).join("") : ""}` : '<p class="muted" style="margin:6px 0">كل الأسماء مطابقة ✓</p>'}</details>`;
        h = h.slice(0, a) + box + h.slice(b + 10);
      } catch (x) { console.warn(x); }
      return h;
    };
  }

  /* =====================================================================
     (٨) الإدارة: أيقونة وحدة «الحسابات التجريبية» (الطالب والمدرس) — درجات، غيابات، نتيجة، تبليغات، صف وشعبة
     ===================================================================== */
  const XT = { d: null, busy: 0, err: "" };
  const gx = o => api(Object.assign({ a: "admin", secret: "own:" + GX.tok }, o), GX.url);
  async function xtLoad() {
    if (!own()) { XT.err = "هذه الصفحة لمدير النظام فقط (سجّل دخول بحساب مدير النظام)."; return; }
    XT.busy = 1; XT.err = "";
    try { const r = await gx({ op: "tstGet" }); if (r && r.ok) XT.d = r; else XT.err = "تعذّر التحميل من الخادم (" + E((r && r.err) || "") + ")"; } catch (e) { XT.err = "ما أكو اتصال بالخادم"; }
    XT.busy = 0; if (typeof cur != "undefined" && cur == "tst206") render();
  }
  const COLS = ["معدل النصف الأول", "نصف السنة", "معدل النصف الثاني", "السعي السنوي", "الامتحان النهائي", "الدرجة النهائية"];
  const secList = () => (typeof SN != "undefined" && SN.length ? SN : snapSN()).filter(Boolean);
  function xtView() {
    if (!XT.d && !XT.busy && !XT.err) setTimeout(xtLoad, 10);
    const head = `<div class="vh"><h2>${I("user")} الحسابات التجريبية</h2></div><p class="muted">طالب تجريبي ومدرس تجريبي يشوفون النظام مثل الحقيقيين بالضبط — جرّب عليهم الدرجات والتبليغات والجدول والامتحانات وشوف النتيجة بالبوابة. <b>ما ينحسبون</b> بالإحصاءات ولا الأعداد ولا قوائم الشعب.</p>
<div class="tools"><a class="btn" href="./?tst=s" target="_blank" rel="noopener">${I("users")} افتح البوابة كطالب تجريبي</a><a class="btn" href="./?tst=t" target="_blank" rel="noopener">${I("user")} افتح البوابة كمدرس تجريبي</a></div>
<p class="muted" style="margin:4px 0">الدخول اليدوي: من البوابة اختار «الطلاب» أو «المدرسون» واكتب <b>test</b> وكلمة المرور <b>1234</b>.</p>`;
    if (XT.err) return head + `<div class="box"><p class="muted">${E(XT.err)}</p><button class="btn ghost" onclick="xt206Reload()">إعادة المحاولة</button></div>`;
    if (!XT.d) return head + `<div class="box"><p class="muted">جارٍ التحميل…</p></div>`;
    const ps = XT.d.ps || {}, pt = XT.d.pt || {}, g = ps.g || [];
    const secOpts = secList().map(n => `<option ${n == ps.s ? "selected" : ""}>${E(n)}</option>`).join("");
    const rows = g.map((r, i) => `<tr><td class="l"><input class="x206n" value="${E(r[0])}"></td>${[1, 2, 3, 4, 5, 6].map(c => `<td><input class="x206v" inputmode="decimal" maxlength="6" value="${E(r[c] || "")}"></td>`).join("")}<td><button class="btn ghost sm" onclick="this.closest('tr').remove()">✕</button></td></tr>`).join("");
    const tch = (typeof SNAP != "undefined" && SNAP && SNAP.tch) || [];
    return head + `<div class="two">
<div class="box"><h3>${I("users")} الطالب التجريبي</h3>
<label>الصف والشعبة<select id="x206sec">${secOpts}</select></label>
<p class="muted" style="margin:6px 0">يشوف جدول هذي الشعبة، وتبليغاتها، وجداول امتحانات صفها.</p>
<h4 style="margin:12px 0 6px">الدرجات ${ps.demo ? '<span class="muted" style="font-weight:400">(تجريبية تلقائية حسب مواد الشعبة)</span>' : ""}</h4>
<div class="tw"><table class="x206g"><tr><th class="l">المادة</th>${COLS.map(c => `<th>${c}</th>`).join("")}<th></th></tr>${rows}</table></div>
<div class="tools"><button class="btn ghost sm" onclick="xt206Row()">+ مادة</button><button class="btn ghost sm" onclick="xt206Auto()">درجات تلقائية</button></div>
<label>أيام الغياب (تاريخ بكل سطر مثل ٢٠٢٦-١٠-١٢)<textarea id="x206days" rows="3">${E((ps.days || []).join("\n"))}</textarea></label>
<label>النتيجة<input id="x206res" value="${E(ps.res || "")}" placeholder="ناجح / مكمل / راسب…"></label>
<div class="tools"><button class="btn" onclick="xt206SaveS()">${I("check")} حفظ وإرسال للطالب التجريبي</button></div></div>
<div class="box"><h3>${I("user")} المدرس التجريبي</h3>
<label>يعرض جدول المدرس<select id="x206as"><option value="">— بدون —</option>${tch.filter(x => x && x.k).map(x => `<option value="${E(x.k)}" ${x.k == pt.as ? "selected" : ""}>${E(x.n)}${x.spec ? " — " + E(x.spec) : ""}</option>`).join("")}</select></label>
<p class="muted" style="margin:6px 0">طلاب المدرس التجريبي = الطالب التجريبي فقط، فالدرجات والتبليغات اللي يرسلها ما توصل لأي طالب حقيقي.</p>
<div class="tools"><button class="btn" onclick="xt206SaveT()">${I("check")} حفظ</button></div>
<h3 style="margin-top:18px">${I("bell")} تبليغ تجريبي</h3>
<label>إلى<select id="x206to"><option value="both">الطالب والمدرس التجريبيين</option><option value="s">الطالب التجريبي</option><option value="t">المدرس التجريبي</option></select></label>
<label>العنوان<input id="x206tt" value="تبليغ تجريبي"></label>
<label>النص<textarea id="x206tb" rows="3">هذا تبليغ تجريبي من إدارة المدرسة.</textarea></label>
<div class="tools"><button class="btn" onclick="xt206Note()">${I("upload")} إرسال</button></div>
<p class="muted" style="margin:6px 0">ممكن ترسل أيضاً من «حسابات وتبليغات البوابة» ← «إرسال إلى» ← «للتجربة» (مع مرفقات).</p>
<div class="tools" style="margin-top:14px"><button class="btn ghost sm" onclick="xt206Reset()">إرجاع كل شي للوضع التلقائي</button></div></div></div>`;
  }
  W.xt206Reload = () => { XT.d = null; XT.err = ""; render(); };
  W.xt206Row = () => { const t = D.querySelector(".x206g"); if (!t) return; const tr = t.insertRow(-1); tr.innerHTML = `<td class="l"><input class="x206n" placeholder="المادة"></td>${"<td><input class=\"x206v\" inputmode=\"decimal\" maxlength=\"6\"></td>".repeat(6)}<td><button class="btn ghost sm" onclick="this.closest('tr').remove()">✕</button></td>`; };
  const busy = async (fn, ok) => { try { const r = await fn(); if (r && r.ok) { if (r.ps) XT.d = Object.assign(XT.d || {}, r); T(ok); render(); } else T("تعذّر الحفظ (" + ((r && r.err) || "") + ")", "err"); } catch (e) { T("ما أكو اتصال", "err"); } };
  W.xt206SaveS = () => {
    const g = [...D.querySelectorAll(".x206g tr")].slice(1).map(tr => { const n = (tr.querySelector(".x206n") || {}).value || ""; return [n.trim(), ...[...tr.querySelectorAll(".x206v")].map(i => String(i.value || "").trim().replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)))]; }).filter(r => r[0]);
    const days = String((D.getElementById("x206days") || {}).value || "").replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).split(/[\s,،]+/).map(s => s.trim()).filter(s => /^\d{4}-\d{1,2}-\d{1,2}$/.test(s)).map(s => s.split("-").map((v, i) => i ? v.padStart(2, "0") : v).join("-"));
    busy(() => gx({ op: "tstSet", s: { sec: (D.getElementById("x206sec") || {}).value, g, days, res: (D.getElementById("x206res") || {}).value || "" } }), "انحفظ ووصل للطالب التجريبي ✓");
  };
  W.xt206Auto = () => busy(() => gx({ op: "tstSet", s: { sec: (D.getElementById("x206sec") || {}).value, g: [] } }), "رجعت الدرجات التلقائية ✓");
  W.xt206SaveT = () => busy(() => gx({ op: "tstSet", t: { as: (D.getElementById("x206as") || {}).value || "" } }), "انحفظ ✓");
  W.xt206Reset = () => { if (confirm("إرجاع الحسابات التجريبية للوضع التلقائي؟")) busy(() => gx({ op: "tstSet", reset: 1 }), "رجع الوضع التلقائي ✓"); };
  W.xt206Note = async () => {
    const to = (D.getElementById("x206to") || {}).value || "both", title = (D.getElementById("x206tt") || {}).value || "تبليغ تجريبي", body = (D.getElementById("x206tb") || {}).value || "";
    const L = to == "both" ? ["s:tst-s", "t:tst-t"] : [to == "s" ? "s:tst-s" : "t:tst-t"];
    let ok = 0; for (const tg of L) { try { const r = await gx({ op: "note", scope: "one", target: tg, title, body: body + "\n\n(" + new Date().toLocaleTimeString("ar-IQ") + ")", cat: "adm" }); if (r && r.ok) ok++; } catch (e) { } }
    T(ok == L.length ? "انرسل التبليغ التجريبي ✓ — افتح البوابة التجريبية وشوفه" : "تعذّر الإرسال", ok ? "" : "err");
  };
  on(() => {
    if (typeof V == "undefined" || typeof HUBS == "undefined") return;
    V.tst206 = xtView;
    if (typeof TITLE != "undefined") TITLE.tst206 = "الحسابات التجريبية";
    if (typeof NAVI != "undefined") NAVI.tst206 = ["tst206", "الحسابات التجريبية", "user", 1];
    if (typeof HDESC != "undefined") HDESC.tst206 = "طالب ومدرس تجريبي لتجربة كل شي";
    if (!HUBS.some(h => h[0] == "tst206")) HUBS.push(["tst206", "الحسابات التجريبية", "user", "الطالب التجريبي والمدرس التجريبي — جرّب الدرجات والتبليغات والجدول", ["tst206"]]);
  });

  /* =====================================================================
     (٩) السرعة والتنسيق بالموبايل والكمبيوتر
     ===================================================================== */
  on(() => { try { const u = (typeof SNAP != "undefined" && SNAP && SNAP.pc && SNAP.pc.api) || ""; if (u) { const l = D.createElement("link"); l.rel = "preconnect"; l.href = new URL(u).origin; l.crossOrigin = ""; D.head.appendChild(l); } } catch (e) { } });
  const st = D.createElement("style");
  st.textContent = `
.t206b{border:1px solid #b8860b;background:#fff8e6;border-radius:16px;padding:10px 12px;margin:0 0 12px;color:#3b2f0a}
.t206h{display:flex;align-items:center;justify-content:space-between;gap:8px}.t206h small{display:block;font-size:12px;color:#7a5b00;font-weight:400}.t206h svg{vertical-align:-3px;width:18px;height:18px}
.t206chips{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;flex:1 1 100%;padding-bottom:2px}.t206chips::-webkit-scrollbar{display:none}.t206chips button{flex:0 0 auto}
.t206row{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px}.t206l{font-weight:700;font-size:13px}
.t206chips{display:flex;flex-wrap:wrap;gap:6px}.t206chips button{border:1px solid #d6b45a;background:#fff;border-radius:999px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer}
.t206chips button.on{background:#1f5f4a;color:#fff;border-color:#1f5f4a}.t206b select{max-width:100%;min-width:0;flex:1 1 180px;padding:6px;border-radius:10px;border:1px solid #d6b45a;font:inherit}
.t206n{margin:6px 0 0;font-size:12.5px;color:#7a5b00}
.nm206{position:fixed;inset:0;z-index:9999;background:rgba(8,30,24,.55);display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(2px)}
.nm206c{background:var(--surface,#fff);color:inherit;border-radius:18px;max-width:420px;width:100%;padding:22px 20px;box-shadow:0 24px 60px rgba(0,0,0,.3);text-align:start;max-height:90vh;overflow:auto}
.nm206c h3{margin:6px 0 8px;font-size:20px}.nm206c ol{padding-inline-start:20px;margin:6px 0}.nm206i{font-size:38px;text-align:center}.nm206b{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.nm206b .btn{flex:1 1 140px;justify-content:center}
#portal .daytabs:has(>button[onclick*="PV.d="]){display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:6px!important;overflow:visible!important;flex-wrap:nowrap!important}
#portal .daytabs:has(>button[onclick*="PV.d="]) button{min-width:0!important;width:auto!important;padding:9px 2px!important;font-size:14px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;grid-column:auto!important}
@media(max-width:360px){#portal .daytabs:has(>button[onclick*="PV.d="]) button{font-size:12px!important}}
.dj206{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:none;position:sticky;top:0;z-index:3;background:var(--bg,transparent)}.dj206::-webkit-scrollbar{display:none}
.dj206 button{flex:0 0 auto;border:1px solid var(--line,#ddd);background:var(--surface,#fff);border-radius:999px;padding:7px 14px;font:inherit;font-size:14px;cursor:pointer}.dj206 button.on{background:var(--brand,#1f5f4a);color:#fff;border-color:transparent}
@media(min-width:1000px){.dj206{display:none}}
#main table.grid tr>:first-child{position:sticky;inset-inline-start:0;z-index:2;background:var(--surface,#fff);color:var(--ink,#16302a)!important;opacity:1!important;font-weight:700}
#main table.grid tr:first-child>:first-child{z-index:3}
#lb206{position:fixed;inset:0;z-index:10000;background:#0b0f0e;display:flex;flex-direction:column}
.lb206t{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;color:#fff;font-size:14px}.lb206t>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.lb206s{flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;touch-action:pinch-zoom pan-x pan-y}
.lb206s img{max-width:100%;max-height:100%;object-fit:contain;image-rendering:auto}
.q206 summary{cursor:pointer;display:flex;flex-direction:column;gap:4px}.q206s{font-size:13px;color:var(--muted,#667);font-weight:400}
.q206c{border:1px solid var(--line,#e3e3e3);border-radius:14px;padding:10px 12px;margin:8px 0;background:var(--surface,#fff)}
.q206h{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;font-size:13px;margin-bottom:6px}
.q206c dl{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;margin:0}.q206c dt{color:var(--muted,#667);font-size:13px}.q206c dd{margin:0;overflow-wrap:anywhere}
.q206a{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center}.q206w{margin:8px 0 0;color:#9a3412;font-size:13px}
.x206g{width:max-content;min-width:100%}.x206g td{min-width:58px}.x206g tr:first-child th{background:var(--brand,#1f5f4a);color:#fff;opacity:1}#x206days{min-height:72px!important;height:auto}
.x206g input{width:100%;min-width:52px;padding:6px;border:1px solid var(--line,#ddd);border-radius:8px;font:inherit;text-align:center}.x206g input.x206n{min-width:110px;text-align:start}
#tst206 textarea,#x206days{width:100%}
@media(max-width:700px){
 #portal .note1 p,#portal .rt,#portal .rp,#main .note1 p{overflow-wrap:anywhere}
 #main .box,#portal .box{min-width:0;max-width:100%}
 #main .tw,#portal .tw{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
 #main .tools,#portal .tools{flex-wrap:wrap}
 #main summary{white-space:normal}
 #main input,#main select,#main textarea,#portal input,#portal select,#portal textarea{max-width:100%;font-size:16px}
 #main img,#portal .note1 img{max-width:100%;height:auto}
 .two{grid-template-columns:minmax(0,1fr)!important}
}`;
  D.head.appendChild(st);
})();
