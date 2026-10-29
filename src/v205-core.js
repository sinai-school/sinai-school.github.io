/* ===== v205 (29 Oct 2026) — نشر فوري، إشعارات حقيقية، حسابات تجريبية، النواقص، ملف الطالب، جدول المديرية ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v205", e); } };
  const LG = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
  const LS = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const T = (m, k) => { try { (typeof toast == "function" ? toast : console.log)(m, k); } catch (e) { } };
  const isStaff = () => !!(typeof GX != "undefined" && GX.on);
  const gxApi = (o) => api(o, GX.url);

  /* ---------- (١) أي حفظ بالنظام (الجدول، الصفوف، الطلاب، الملاك…) ينشر البوابة خلال ثانيتين ---------- */
  let PUBT = 0;
  async function pub205() {
    if (!isStaff() || typeof buildSnap != "function") return;
    if (W.GXOWN || (typeof TOWN != "undefined" && TOWN)) { if (typeof gxSnapPush == "function") return gxSnapPush(1); return; }
    /* موظف بصلاحية الجدول: الخادم يقبل نسخته بس إذا كاملة */
    try {
      if (typeof READY != "undefined" && (!READY.tt || !READY.st)) return;
      const s = buildSnap(); if (!s || !s.cells) return; delete s.at;
      const at = new Date().toISOString(); s.at = at;
      const gz = new Uint8Array(await new Response(new Blob([JSON.stringify(s)]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
      let b = ""; for (let i = 0; i < gz.length; i += 32768) b += String.fromCharCode.apply(null, gz.subarray(i, i + 32768));
      await gxApi({ a: "stf", op: "snap", tok: GX.tok, at, z: btoa(b) });
    } catch (e) { }
  }
  W.pub205 = () => { clearTimeout(PUBT); PUBT = setTimeout(pub205, 1500); };
  /* مدير النظام: أول ما يفتح النظام تنتشر نسخة كاملة وحديثة للبوابة (حتى لو ما تغيّر شي بجهازه) */
  let FP = 0;
  const firstPub = () => { if (FP) return; if (isStaff() && W.GXOWN && typeof READY != "undefined" && READY.stf && READY.tt && READY.st && typeof gxSnapPush == "function") { FP = 1; gxSnapPush(1); } };
  let fpN = 0; const fpT = setInterval(() => { firstPub(); if (FP || ++fpN > 60) clearInterval(fpT); }, 5000);
  if (typeof q == "function") {
    const _q = q;
    q = function (path, fn) {
      const p = _q.apply(this, arguments);
      if (/^(tt|cfg|st|stf|staff\/|school\/)/.test(String(path || ""))) Promise.resolve(p).then(() => W.pub205(), () => { });
      return p;
    };
  }

  /* ---------- (٢) البوابة: الجدول والأسماء الجديدة تتطبق فوراً بدون إعادة تحميل ولا تحديث التطبيق ---------- */
  let SNB = 0;
  async function snap205(sa) {
    if (SNB || isStaff() || typeof SNAP == "undefined" || !SNAP || typeof apiURL != "function" || !apiURL()) return;
    if (sa && SNAP.at && sa <= SNAP.at) return;
    SNB = 1;
    try {
      const r = await api({ a: "snap", at: SNAP.at || "" });
      if (!r || !r.ok || !r.z || !r.at || (SNAP.at && r.at <= SNAP.at)) return;
      const u8 = Uint8Array.from(atob(r.z), c => c.charCodeAt(0));
      const j = JSON.parse(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream("gzip"))).text());
      if (!j || !j.cells || !j.sn) return;
      j.at = r.at;
      try { localStorage.setItem("snap71", JSON.stringify(j)); } catch (e) { }
      try { const el = D.getElementById("snap"); if (el) el.textContent = JSON.stringify(j).replace(/</g, "\\u003c"); } catch (e) { }
      if (j.pc && SNAP.pc && !j.pc.api) j.pc.api = SNAP.pc.api;
      SNAP = j;
      const a = D.activeElement, typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.value;
      if (!typing && typeof prender == "function" && !D.getElementById("portal").hidden) { const y = W.scrollY; prender(); W.scrollTo(0, y); }
      T("تحدّث الجدول والمعلومات ✓");
    } catch (e) { } finally { SNB = 0; }
  }
  W.snap205 = snap205;
  /* فحص عند الفتح وكل ما يرجع للتطبيق (والتبليغات تفحص كل ٢٠ ثانية وتجيب وقت آخر نشر) */
  setTimeout(() => snap205(), 2500);
  D.addEventListener("visibilitychange", () => { if (!D.hidden) setTimeout(() => snap205(), 600); });
  W.addEventListener("online", () => setTimeout(() => snap205(), 800));

  /* ---------- (٣) النواقص: المدرس اللي ملّى معلوماته ما يطلعله «رقم الهاتف» أو «كتب الشكر» ناقص ---------- */
  const fill205 = (kind, o, phone) => {
    if (!o || typeof o != "object") return o;
    const x = { ...o };
    if (kind == "t") {
      if (!String(x.phone || "").trim()) { const p = String(phone || "").replace(/[^\d]/g, ""); if (/^07\d{9}$/.test(p)) x.phone = p; }
      if (x.thanks == null || String(x.thanks).trim() === "") x.thanks = "0";
    }
    return x;
  };
  W.fill205 = fill205;
  on(() => {
    if (typeof v130Check == "function") {
      const _c = v130Check;
      v130Check = function (kind, o) {
        const x = fill205(kind, o, o && o.phone);
        let E = _c.call(this, kind, x);
        /* رقم الهاتف موجود بالحساب نفسه — ما نطلبه مرة ثانية */
        if (kind == "t" && !String((o || {}).phone || "").trim()) E = E.filter(e => !/^رقم الهاتف ناقص$/.test(e));
        return E;
      };
    }
    if (typeof miss137 == "function") {
      const _m = miss137;
      miss137 = function () {
        const b = typeof PS != "undefined" && PS.b; if (!b) return _m.apply(this, arguments);
        const p0 = b.profile, ph0 = b.photo;
        try {
          if (p0 && PS.kind == "t") b.profile = fill205("t", p0, PS.phone);
          if (!b.photo && (b.pid || b.ph1)) b.photo = "1";
          return _m.apply(this, arguments);
        } finally { b.profile = p0; b.photo = ph0; }
      };
    }
    if (typeof myMiss90 == "function") {
      const _m = myMiss90;
      myMiss90 = function () {
        const b = typeof PS != "undefined" && PS.b; if (!b || !b.profile || PS.kind != "t") return _m.apply(this, arguments);
        const p0 = b.profile; try { b.profile = fill205("t", p0, PS.phone); return _m.apply(this, arguments); } finally { b.profile = p0; }
      };
    }
    if (typeof need90 == "function") { const _n = need90; need90 = function (kind, o, photo) { return _n.call(this, kind, fill205(kind, o, o && o.phone), photo).filter(e => !(kind == "t" && /^رقم الهاتف$/.test(e) && !(o || {}).phone)); }; }
    if (typeof miss90 == "function") { const _n = miss90; miss90 = function (kind, prof, photo) { let o = prof; try { o = typeof prof == "string" ? JSON.parse(prof || "{}") : prof; } catch (e) { } return _n.call(this, kind, o && Object.keys(o).length ? fill205(kind, o, o.phone) : prof, photo); }; }
    /* الحفظ: المدرس القديم ينحفظله رقم حسابه وعدد كتب الشكر (٠) تلقائياً */
    if (typeof pfNorm == "function") { const _p = pfNorm; pfNorm = function (o) { const r = _p.apply(this, arguments); return typeof PS != "undefined" && PS.kind == "t" ? fill205("t", r, PS.phone) : r; }; }
    /* كل خانة اسم واحد: ما يصير «محمد ماجد» بخانة الاسم و«ماجد ريحان» بخانة الأب (تكرار) */
    if (typeof pfCheck == "function") {
      const _pc = pfCheck;
      pfCheck = function (o) {
        const E = _pc.apply(this, arguments);
        try {
          for (const G of [["n1", "n2", "n3", "n4"], ["m1", "m2", "m3"]]) for (let i = 1; i < G.length; i++) {
            const a = String(o[G[i - 1]] || "").trim().split(/\s+/), b = String(o[G[i]] || "").trim().split(/\s+/);
            if (!E[G[i]] && a.length > 1 && b.length > 1 && a[a.length - 1] == b[0]) E[G[i]] = "كل خانة بيها اسم واحد — «" + b[0] + "» مكتوب بالخانة اللي قبلها";
          }
        } catch (e) { }
        return E;
      };
    }
  });
  /* الاسم من خانات البوابة: يشيل التكرار بين الخانات (محمد ماجد + ماجد ريحان = محمد ماجد ريحان) */
  const nmJoin = L => { const out = []; L.filter(Boolean).forEach(f => { const w = String(f).trim().split(/\s+/); if (out.length && w.length > 1 && out[out.length - 1] == w[0]) w.shift(); out.push(...w); }); return out.join(" "); };
  W.nmJoin205 = nmJoin;

  /* ---------- (٤) حسابات تجريبية: طالب ومدرس (اسم المستخدم test وكلمة المرور 1234) ---------- */
  const TST = { s: { key: "tst-s", n: "طالب تجريبي", phone: "07000000001", nid: "200900000001" }, t: { key: "tst-t", n: "مدرس تجريبي", phone: "07000000002", nid: "199000000002" } };
  W.TST205 = TST;
  async function tstOpen(kind) {
    const x = TST[kind];
    try { if (typeof nid133K == "function" && typeof lsS == "function") lsS(nid133K(kind, x.key), x.nid); } catch (e) { }
    PS.kind = kind; PS.key = x.key; PS.name = x.n; PS.tab = "f"; PS.phone = x.phone; PS.err = ""; PS.stage = "chk";
    try {
      const r = await api({ a: "login", kind, key: x.key, phone: x.phone, nid: x.nid });
      if (r && r.ok) { PS.b = r; PS.stage = "in"; PS.off = 0; try { psKeep(); } catch (e) { } LS("tst205", kind); }
      else { PS.stage = "login"; PS.err = "تعذّر فتح الحساب التجريبي"; }
    } catch (e) { PS.stage = "login"; PS.err = "تعذّر الاتصال — حاول مرة ثانية"; }
    prender();
  }
  W.tst205 = tstOpen;
  if (typeof lgSubmit == "function") {
    const _lg = lgSubmit;
    lgSubmit = function (e) {
      try {
        const r = typeof LGR != "undefined" ? LGR : "", u = (D.getElementById("lgu") || {}).value || "", p = (D.getElementById("lgp") || {}).value || "";
        if ((r == "s" || r == "t") && u.trim().toLowerCase() == "test" && p.trim() == "1234" && typeof SNAP != "undefined" && SNAP) {
          if (e) e.preventDefault();
          ROLE = r; try { sess(r); } catch (x) { } showPortal(); tstOpen(r); return false;
        }
      } catch (x) { console.warn(x); }
      return _lg.apply(this, arguments);
    };
  }
  /* بعد إعادة الفتح: الحساب التجريبي يرجع وحده */
  setTimeout(() => on(() => {
    const k = LG("tst205"); if (!k || !TST[k] || typeof PS == "undefined" || PS.key) return;
    if (typeof ROLE != "undefined" && ROLE == k && !D.getElementById("portal").hidden) tstOpen(k);
  }), 1500);
  /* شريط يوضح إنه حساب تجريبي + الخروج منه */
  if (typeof psView == "function") {
    const _pv = psView;
    psView = function () {
      let h = _pv.apply(this, arguments);
      try { if (PS && /^tst-/.test(PS.key || "")) h = `<div class="banner" style="border-color:#b8860b;background:#fff8e6">${typeof ic == "function" ? ic("alert") : ""} <span><b>حساب تجريبي</b> — للتجربة فقط، ما يأثر على الطلاب والمدرسين. التبليغات اللي ترسلها الإدارة «للكل» أو لـ«الحساب التجريبي» توصل هنا.</span> <button class="btn ghost sm" onclick="localStorage.removeItem('tst205');psOut();PS.key=null;prender()">خروج</button></div>` + h; } catch (e) { }
      return h;
    };
  }
  /* الإدارة: «إرسال إلى» فيها الحسابين التجريبيين */
  const addTstOpts = () => on(() => {
    const s = D.getElementById("an_to"); if (!s || s.querySelector('option[value="one|s:tst-s"]')) return;
    const g = D.createElement("optgroup"); g.label = "للتجربة";
    g.innerHTML = '<option value="one|s:tst-s">الطالب التجريبي فقط</option><option value="one|t:tst-t">المدرس التجريبي فقط</option>';
    s.appendChild(g);
  });
  new MutationObserver(() => addTstOpts()).observe(D.documentElement, { childList: true, subtree: true });

  /* ---------- (٥) إشعارات حقيقية: توصل للموبايل بصوت حتى لو التطبيق مسدود ---------- */
  const PUSHK = "push205";
  const ub = s => { const p = "=".repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(b, c => c.charCodeAt(0)); };
  const canPush = () => "serviceWorker" in navigator && "PushManager" in W && "Notification" in W && !/SinaiSchoolApp/.test(navigator.userAgent);
  async function vkey(url) { const r = await api({ a: "vapid" }, url); if (!r || !r.k) throw 0; return r.k; }
  async function ctx205(url, body) {
    try { const c = await caches.open("sinai-push"); await c.put("ctx", new Response(JSON.stringify({ url, body }), { headers: { "Content-Type": "application/json" } })); } catch (e) { }
  }
  async function sub205(ask) {
    if (!canPush()) return 0;
    try {
      if (Notification.permission == "denied") return 0;
      if (Notification.permission != "granted") { if (!ask) return 0; const p = await Notification.requestPermission(); if (p != "granted") return 0; }
      const reg = await navigator.serviceWorker.ready;
      let who = null, url = "", body = null;
      if (isStaff()) { if (!W.GXOWN) return 0; who = "o"; url = GX.url; }
      else if (typeof PS != "undefined" && PS.b && PS.key && PS.phone) {
        who = PS.kind + ":" + PS.key; url = apiURL();
        body = typeof W.cred205 == "function" ? W.cred205() : { kind: PS.kind, key: PS.key, phone: PS.phone, nid: (typeof nid133K == "function" ? lsG(nid133K(PS.kind, PS.key)) : "") || "" };
      } else return 0;
      const k = await vkey(url);
      let s = await reg.pushManager.getSubscription();
      if (s && LG(PUSHK + "k") && LG(PUSHK + "k") != k) { try { await s.unsubscribe(); } catch (e) { } s = null; }
      if (!s) s = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: ub(k) });
      LS(PUSHK + "k", k);
      const sj = JSON.stringify(s), sig = who + "|" + s.endpoint;
      if (LG(PUSHK) != sig) {
        const r = who == "o" ? await api({ a: "admin", op: "psub", secret: "own:" + GX.tok, key: GX.u || "own", sub: sj }, url) : await api(Object.assign({ a: "psub", sub: sj }, body), url);
        if (r && r.ok) LS(PUSHK, sig);
      }
      if (body) ctx205(url, Object.assign({ a: "inbox" }, body));
      return 1;
    } catch (e) { console.warn("push205", e); return 0; }
  }
  W.sub205 = sub205;
  /* تطبيق الأندرويد/هواوي: الفحص بالخلفية كل ربع ساعة حتى لو التطبيق مسدود، والإشعار يطلع بصوت */
  let APPK = "";
  function app205() {
    try {
      const A = W.SinaiApp; if (!A || typeof A.setPoll != "function" || isStaff()) return;
      if (typeof PS == "undefined" || !PS.b || !PS.key || !PS.phone || PS.stage != "in") return;
      const nid = (typeof nid133K == "function" && typeof lsG == "function" ? lsG(nid133K(PS.kind, PS.key)) : "") || "";
      const body = JSON.stringify({ a: "inbox", kind: PS.kind, key: PS.key, phone: PS.phone, nid }), url = apiURL();
      if (!url || APPK == url + body) return;
      APPK = url + body;
      if (!LG("app205n")) { try { A.enableNotify(); } catch (e) { } LS("app205n", 1); }
      A.setPoll(url, body);
      try { A.knownIds((PS.b.notes || []).map(n => n.id).join(",")); } catch (e) { }
    } catch (e) { }
  }
  setInterval(app205, 1e4); setTimeout(app205, 3000);
  /* الخروج من الحساب: الإشعارات تتوقف على هذا الجهاز */
  if (typeof psOut == "function") {
    const _po = psOut;
    psOut = function () {
      try { if (W.SinaiApp && W.SinaiApp.stopPoll) W.SinaiApp.stopPoll(); } catch (e) { } APPK = "";
      try { LS(PUSHK, null); if ("serviceWorker" in navigator) navigator.serviceWorker.ready.then(r => r.pushManager.getSubscription()).then(s => s && s.unsubscribe()).catch(() => { }); caches.open("sinai-push").then(c => c.delete("ctx")).catch(() => { }); } catch (e) { }
      return _po.apply(this, arguments);
    };
  }
  /* زر «تفعيل الإشعارات» لمن ما فعّلها بعد (المتصفح يحتاج ضغطة من المستخدم) */
  function pushBan() {
    if (!canPush() || Notification.permission != "default") return "";
    return `<div class="banner" id="pb205" style="border-color:var(--brand,#1f5f4a)">${typeof ic == "function" ? ic("bell") : "🔔"} <span><b>فعّل الإشعارات</b> حتى توصلك التبليغات والجدول الجديد بصوت حتى لو التطبيق مسدود.</span> <button class="btn sm" onclick="sub205(1).then(ok=>{const b=document.getElementById('pb205');if(b)b.remove();toast(ok?'تفعّلت الإشعارات ✓':'ما تفعّلت — فعّلها من إعدادات المتصفح',ok?'':'err')})">تفعيل</button></div>`;
  }
  if (typeof psView == "function") {
    const _pv = psView;
    psView = function () { let h = _pv.apply(this, arguments); try { if (PS && PS.b && PS.stage == "in" && !PS.edit) h = pushBan() + h; } catch (e) { } return h; };
  }
  /* لما يكون مسموح: يشترك وحده (بدون أي ضغطة) */
  setInterval(() => { if (!D.hidden) sub205(0); }, 6e4);
  setTimeout(() => sub205(0), 5000);
  /* الإدارة (مدير النظام): زر بالأعلى مرة وحدة */
  setTimeout(() => on(() => {
    if (!isStaff() || !W.GXOWN || !canPush() || Notification.permission != "default" || LG("pb205o")) return;
    const b = D.createElement("div"); b.className = "banner"; b.style.cssText = "position:fixed;bottom:76px;left:12px;right:12px;z-index:60;max-width:560px;margin:auto";
    b.innerHTML = `🔔 <span>فعّل الإشعارات حتى توصلك <b>البلاغات</b> الجديدة من الطلاب والمدرسين فوراً.</span> <button class="btn sm">تفعيل</button> <button class="btn ghost sm">لاحقاً</button>`;
    const [y, n] = b.querySelectorAll("button");
    y.onclick = () => { b.remove(); sub205(1).then(ok => T(ok ? "تفعّلت الإشعارات ✓" : "ما تفعّلت", ok ? "" : "err")); };
    n.onclick = () => { b.remove(); LS("pb205o", 1); };
    D.body.appendChild(b);
  }), 12000);

  /* ---------- (٦) ملف الطالب: المعلومات اللي ملاها الطالب بالبوابة والتطبيق (مع صورته) ---------- */
  const PH205 = {};
  async function ph205(key) {
    if (PH205[key] !== undefined || !isStaff() || !W.GXOWN) return;
    PH205[key] = "";
    try { const r = await gxApi({ a: "admin", op: "photo", secret: "own:" + GX.tok, kind: "s", key }); PH205[key] = r && r.photo || ""; } catch (e) { }
    if (PH205[key] && typeof SPF != "undefined" && SPF == key && typeof render == "function") render();
  }
  if (typeof pfBox == "function") {
    const _pf = pfBox;
    pfBox = function () {
      let h = _pf.apply(this, arguments);
      try {
        if (typeof SPF == "undefined" || !SPF || SPFE) return h;
        const i = (typeof INF != "undefined" && INF && INF[SPF]) || {}, x = i.x;
        const e = s => typeof esc == "function" ? esc(s) : String(s);
        const A = v => typeof toAr == "function" ? toAr(v) : v;
        let body;
        if (x && typeof x == "object") {
          const dmy = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ""); return m ? A(+m[3] + "/" + +m[2] + "/" + m[1]) : A(v || ""); };
          const R = [["الاسم (كما كتبه الطالب)", nmJoin([x.n1, x.n2, x.n3, x.n4]) + (x.laqab ? " " + x.laqab : "")], ["اسم الأم الثلاثي", nmJoin([x.m1, x.m2, x.m3])], ["المواليد", dmy(x.dob)], ["رقم البطاقة الموحدة", A(x.nid || "")], ["هاتف ولي الأمر", A(x.gphone || "")], ["الرعاية الاجتماعية", x.gr || ""], ["السكن", [x.city, x.hay].filter(Boolean).join(" — ")], ["محلة / زقاق / دار", A([x.mahalla, x.zuqaq, x.dar].map(v => v || "—").join(" / "))], ["أقرب نقطة دالة", x.near || ""], ["البريد الإلكتروني", x.email || ""], ["آخر تحديث", x.at ? dmy(String(x.at).slice(0, 10)) : ""]].filter(r => r[1]);
          if (!(SPF in PH205)) ph205(SPF);
          const ph = PH205[SPF] ? `<img src="${PH205[SPF]}" alt="صورة الطالب" style="width:96px;height:120px;object-fit:cover;border-radius:10px;border:1px solid var(--line,#ddd);float:left;margin:0 0 8px 12px">` : "";
          body = ph + `<dl class="pf3kv">${R.map(([k, v]) => `<dt>${e(k)}</dt><dd>${e(v)}</dd>`).join("")}</dl><div style="clear:both"></div>`;
        } else body = `<p class="muted" style="margin:4px 0">الطالب بعد ما ملّى معلوماته بالبوابة، أو معلوماته بانتظار المراجعة.</p>`;
        h += `<div class="box" id="pfp205"><h3>${typeof ic == "function" ? ic("user") : ""} معلومات الطالب من البوابة والتطبيق</h3>${body}</div>`;
      } catch (e) { console.warn(e); }
      return h;
    };
  }

  /* ---------- (٧) جدول المديرية (عرض النظام): الملاحظة الطويلة (EMIS، المرشد…) تبين كاملة من بدايتها ---------- */
  if (typeof mOff == "function") {
    const _mo = mOff;
    mOff = function () {
      const m = _mo.apply(this, arguments);
      try { const n = typeof NS != "undefined" ? NS : 0; m.rows.forEach((r, i) => { if (i < 2 || !Array.isArray(r)) return; r.forEach(c => { if (c && typeof c == "object" && n && +c.cs == n) { c.l = 1; c.nowrap205 = 1; } }); }); } catch (e) { }
      return m;
    };
  }
  /* ---------- (٨) القيد العام: أسماء الطلاب المصححة بالصفوف تنصحح وحدها بالقيد (حسب رقم الصفحة) ----------
     - اسم الصف أطول (مكمّل) أو فرق إملائي بسيط → يتصحح تلقائياً (والاسم القديم ينحفظ حتى يرجع إذا احتجت)
     - فرق الهمزة والتاء المربوطة والمسافة (عبدالله / عبد الله) → نفس الاسم، ما يتغير
     - اسم القيد أطول، أو البوابة تأيد اسم القيد، أو اسمين مختلفين تماماً → «تحتاج مراجعة» بصفحة القيد العام */
  const NZ = s => String(s || "").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim().replace(/(^|\s)(عبد|ابو)\s+/g, "$1$2");
  const lev = (a, b) => { let p = [...Array(b.length + 1).keys()]; for (let i = 1; i <= a.length; i++) { const c = [i]; for (let j = 1; j <= b.length; j++) c.push(Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] != b[j - 1]))); p = c; } return p[b.length]; };
  const pgK = v => String(v == null ? "" : v).replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/\D/g, "");
  function qCmp(sn, qn, pn) {
    const a = NZ(sn), b = NZ(qn), p = pn ? NZ(pn) : "";
    if (String(sn).trim() == String(qn).trim()) return "same";
    if (a.replace(/ /g, "") == b.replace(/ /g, "")) return "fmt";
    if (b && a.startsWith(b + " ")) return "fix";            /* اسم الصف مكمّل */
    if (a && b.startsWith(a + " ") || a && b.startsWith(a)) return "rev";  /* القيد أطول: ممكن الاسم مقطوع بالصف */
    const ta = a.split(" "), tb = b.split(" ");
    if (ta.length == tb.length && ta[0] == tb[0] && lev(a, b) <= 3) return p && p == b && p != a ? "rev" : "fix";
    return "rev";
  }
  let QF = null;
  function qScan() {
    const out = { fix: [], rev: [], fmt: 0 };
    if (typeof QD == "undefined" || typeof ST == "undefined") return out;
    const byPg = {}; QD.forEach(r => { const k = pgK(r.pg); if (k) (byPg[k] = byPg[k] || []).push(r); });
    (ST || []).forEach(s => {
      const k = pgK(s.pg); if (!k || !byPg[k]) return;
      const L = byPg[k]; if (L.length != 1) return;
      const r = L[0], x = (typeof INF != "undefined" && INF && INF[s.id] && INF[s.id].x) || null;
      const pn = x ? nmJoin([x.n1, x.n2, x.n3, x.n4]) : "";
      const c = qCmp(s.n, r.n, pn);
      if (c == "fmt") out.fmt++;
      else if (c == "fix") out.fix.push({ s, r, pn });
      else if (c == "rev") out.rev.push({ s, r, pn });
    });
    return out;
  }
  async function qFixLog(add) {
    try {
      const ref = DB.doc("school/qfix205"); let L = [];
      try { const d = await ref.get(); L = d.exists ? (d.data() || {}).list || [] : []; } catch (e) { }
      L = L.concat(add).slice(-2000); await ref.set({ list: L });
    } catch (e) { }
  }
  async function qApply(items, why) {
    if (!items.length) return 0;
    const touched = new Set, log = [];
    items.forEach(({ s, r }) => { if (r.n == s.n) return; log.push({ i: r.i, pg: r.pg, old: r.n, nw: s.n, sid: s.id, at: new Date().toISOString(), why }); r.n = s.n; touched.add(r.c); });
    if (!touched.size) return 0;
    for (const c of touched) qSaveChunk(c);
    await qFixLog(log);
    return log.length;
  }
  W.qFix205 = async (i) => { const it = QF && QF.rev[i]; if (!it) return; await qApply([it], "يدوي"); QF.rev.splice(i, 1); T("تصحح الاسم بالقيد العام ✓"); render(); };
  W.qSkip205 = (i) => { const it = QF && QF.rev[i]; if (!it) return; const k = "qsk205"; const L = LG(k) || []; L.push(pgK(it.r.pg) + "|" + it.r.n); LS(k, L.slice(-500)); QF.rev.splice(i, 1); render(); };
  async function qAuto() {
    if (!isStaff() || !W.GXOWN || typeof qSub != "function" || typeof READY == "undefined" || !READY.st) return;
    qSub(); if (!QREADY || !QD.length) return;
    try { if (typeof infLoad == "function" && !INF) await infLoad(); } catch (e) { }
    const R = qScan(), skip = new Set(LG("qsk205") || []);
    R.rev = R.rev.filter(it => !skip.has(pgK(it.r.pg) + "|" + it.r.n));
    const n = await qApply(R.fix, "تلقائي");
    QF = { ...R, done: n, at: Date.now() };
    if (n) T("تصحّح " + (typeof toAr == "function" ? toAr(n) : n) + " اسم بالقيد العام حسب أسماء الصفوف ✓");
  }
  W.q205 = () => QF;
  setTimeout(() => qAuto(), 15000); setInterval(() => { if (!D.hidden) qAuto(); }, 10 * 6e4);
  if (typeof V != "undefined" && typeof V.q == "function") {
    const _vq = V.q;
    V.q = function () {
      let h = _vq.apply(this, arguments);
      try {
        if (typeof QSEL != "undefined" && (QSEL || QIMP) || !QF) { if (!QF) setTimeout(qAuto, 300); return h; }
        const A = v => typeof toAr == "function" ? toAr(v) : v, e = s => typeof esc == "function" ? esc(s) : s;
        const rows = QF.rev.slice(0, 200).map((it, i) => `<tr><td>${A(it.r.pg)}</td><td class="l">${e(it.s.s)}</td><td class="l"><b>${e(it.s.n)}</b></td><td class="l">${e(it.r.n)}</td><td class="l">${e(it.pn || "—")}</td><td style="white-space:nowrap"><button class="btn sm" onclick="qFix205(${i})">اعتماد اسم الصف</button> <button class="btn ghost sm" onclick="qSkip205(${i})">اتركه</button></td></tr>`).join("");
        const box = `<details class="box" ${QF.rev.length ? "open" : ""}><summary style="cursor:pointer"><b>مطابقة أسماء الطلاب مع القيد العام</b> — تصحّح تلقائياً: ${A(QF.done || 0)} · فرق همزة أو مسافة فقط (نفس الاسم): ${A(QF.fmt)} · تحتاج مراجعتك: ${A(QF.rev.length)}</summary>${QF.rev.length ? `<p class="muted" style="margin:6px 0">المقارنة حسب رقم صفحة القيد. «اسم الصف» هو المعتمد بالنظام، و«البوابة» هو اللي كتبه الطالب حسب بطاقته.</p><div class="tw"><table><tr><th>الصفحة</th><th class="l">الشعبة</th><th class="l">اسم الصف</th><th class="l">اسم القيد</th><th class="l">البوابة</th><th></th></tr>${rows}</table></div>` : '<p class="muted" style="margin:6px 0">كل الأسماء مطابقة ✓</p>'}</details>`;
        const k = h.indexOf("</div>"); h = k >= 0 ? h.slice(0, k + 6) + box + h.slice(k + 6) : box + h;
      } catch (x) { console.warn(x); }
      return h;
    };
  }

  /* ---------- (٩) ترتيب النظام: أقسام أقل وأوضح (الجرد داخل «المدرسون والملاك»، الكتب بعد الجداول مباشرة) ---------- */
  on(() => {
    if (typeof HUBS == "undefined" || !Array.isArray(HUBS)) return;
    const H = id => HUBS.find(h => h[0] == id);
    const gj = H("gj"), gf = H("gf");
    if (gj && gf) {
      gj[4].forEach(k => { if (!gf[4].includes(k)) gf[4].push(k); });
      gf[1] = "المدرسون والملاك والجرد"; gf[3] = "المدرسون، الملاك التدريسي والإداري، جرد الملاك، جرد القوى العاملة، السجل الإحصائي، الرواتب";
      HUBS.splice(HUBS.indexOf(gj), 1);
      if (typeof TITLE != "undefined") TITLE.gf = gf[1];
    }
    const ord = ["gs", "ge", "gt", "gl", "gf", "grc", "gfm", "gy"];
    HUBS.sort((a, b) => (ord.indexOf(a[0]) + 1 || 99) - (ord.indexOf(b[0]) + 1 || 99));
    if (typeof V != "undefined" && V.gj && gf) V.gj = () => V.gf();
  });

  const st = D.createElement("style");
  st.textContent = `.two>.box,.box>.vlist{align-content:start}@media(min-width:900px){.hubg.hubm{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.hubg.hubm>.hubc{width:auto!important;max-width:none!important;margin:0!important}}#pfp205 .pf3kv{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;margin:0}#pfp205 dt{color:var(--muted,#667);font-weight:600}#pfp205 dd{margin:0}`;
  D.head.appendChild(st);
})();
