/* v226 (2026-11-11): أسماء الطلاب ما تطلع للي ما داخل.
   - الطالب: «اكتب رقم بطاقتك الموحدة» ← الخادم يرجع اسمه هو بس (a:"who") ← يكمل الدخول/التسجيل مثل قبل.
     اللي ما عنده رقم بطاقة بسجلات المدرسة (قليلين) يختار صفه وشعبته ويطلعله بس أسماء اللي مثله (a:"nonid").
   - نسخة البوابة: كل طلب a:"snap" ينرسل وياه cv:226 + هوية الداخل؛ الخادم يرجع الأسماء حسب منو يطلب
     (مو داخل: بدون أسماء | طالب: اسمه بس | مدرس: كل الأسماء + تفاصيله). لما تتغيّر الهوية (دخول/خروج) تنسحب نسخة جديدة.
   - إذا النسخة اللي عند الجهاز بيها أسماء (الخادم راجع للقديم بمفتاح الطوارئ) ترجع شاشة «اختر اسمك» القديمة وحدها. */
(function () {
  "use strict";
  const W = window, D = document, CV = 226, WK = "snap226w";
  if (typeof api != "function" || typeof pkScreen != "function") return;
  const lsr = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsw = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
  const staffMode = () => { try { return (typeof rlyOn == "function" && rlyOn()) || (typeof STF_MODE != "undefined" && STF_MODE) || (typeof GX != "undefined" && GX && GX.on) || /^#(staff|adm)\b/i.test(location.hash || ""); } catch (e) { return false; } };
  const cred = () => { try { if (typeof PS == "undefined" || !PS || PS.stage !== "in" || !PS.kind || !PS.key || !PS.phone) return null; const n = lsG(nid133K(PS.kind, PS.key)) || ""; return n ? { kind: PS.kind, key: PS.key, phone: PS.phone, nid: String(n) } : null; } catch (e) { return null; } };
  const idOf = c => c ? c.kind + ":" + c.key : "";
  const nNames = S => { let n = 0; try { (S.stu || []).forEach(L => (L || []).forEach(x => { if (x) n++; })); } catch (e) { } return n; };
  const unz = async z => { const u8 = Uint8Array.from(atob(z), c => c.charCodeAt(0)); return JSON.parse(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream("gzip"))).text()); };
  const zip = async j => { const u8 = new Uint8Array(await new Response(new Blob([JSON.stringify(j)]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer()); let s = ""; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); };
  const patch = (j, me) => { try { if (me && me.s && j.stu && j.stu[me.s[0]]) j.stu[me.s[0]][me.s[1]] = me.s[2]; if (me && me.t && j.tch && j.tch[me.t[0]]) Object.assign(j.tch[me.t[0]], me.t[1] || {}); } catch (e) { } return j; };

  /* (١) كل سحب لنسخة البوابة يمر من هنا */
  const _api = api;
  api = W.api = async function (body, url) {
    if (!body || body.a !== "snap" || staffMode()) return _api.apply(this, arguments);
    const c = cred(), b2 = Object.assign({}, body, { cv: CV, w: lsr(WK) || "" }, c || {});
    const r = await _api.call(this, b2, url);
    /* الهوية المحفوظة (WK) ما تتغيّر هنا — بس sync يغيّرها بعد ما يطبّق النسخة فعلاً */
    try { if (r && r.ok && r.v226 && r.z && r.me) r.z = await zip(patch(await unz(r.z), r.me)); } catch (e) { }
    return r;
  };

  /* (٢) الهوية تغيّرت (دخول/خروج/جهاز قديم بيه كل الأسماء) ← نسخة تناسبها */
  let busy = 0, last = 0, skipUntil = 0;
  const NODS = typeof DecompressionStream == "undefined" || typeof CompressionStream == "undefined";
  /* اسم صاحب الحساب ينحفظ بالجهاز — حتى لو نسخة البوابة اللي بالجهاز بدون أسماء (هاتف قديم/أول فتحة بعد التحديث) اسمه يبقى ظاهر */
  const NK = "pn226";
  const keepName = () => { try {
    if (typeof PS == "undefined" || !PS || PS.stage !== "in" || !PS.key) return;
    const id = PS.kind + ":" + PS.key, sv = lsG(NK);
    if (PS.name) { if (!sv || sv.id !== id || sv.n !== PS.name) lsw(NK, JSON.stringify({ id, n: PS.name })); }
    else if (sv && sv.id === id && sv.n) { PS.name = sv.n; if (PS.kind == "s" && SNAP && SNAP.sid) { const i = SNAP.sid.findIndex(L => (L || []).includes(PS.key)); if (i >= 0) { const j = SNAP.sid[i].indexOf(PS.key); if (SNAP.stu[i] && !SNAP.stu[i][j]) SNAP.stu[i][j] = sv.n; } } if (!typing() && typeof prender == "function") prender(); }
  } catch (e) { } };
  const blank = () => { try { if (!SNAP || !SNAP.stu) return; SNAP.stu = SNAP.stu.map(L => (L || []).map(() => "")); (SNAP.tch || []).forEach(t => { if (t) ["edu", "type", "appoint", "start"].forEach(f => { if (f in t) t[f] = ""; }); }); save(SNAP); } catch (e) { } };
  const save = j => { try { lsw(typeof SNAP72K == "string" ? SNAP72K : "snap71", JSON.stringify(j)); const el = D.getElementById("snap"); if (el) el.textContent = JSON.stringify(j).replace(/</g, "\\u003c"); } catch (e) { } };
  const typing = () => { const a = D.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)); };
  async function sync() {
    if (busy || staffMode() || typeof SNAP == "undefined" || !SNAP || Date.now() < skipUntil) return;
    const c = cred(), id = idOf(c), have = lsr(WK);
    if (have === id) return;
    /* خرج من حسابه: الأسماء تنشال من الجهاز فوراً (حتى بدون إنترنت) */
    if (!id && have != null && have !== "") { blank(); lsw(WK, ""); try { if (!typing() && typeof prender == "function") prender(); } catch (e) { } return; }
    if (Date.now() - last < 12000) return;
    busy = 1; last = Date.now();
    try {
      const r = await _api(Object.assign({ a: "snap", at: "", cv: CV, w: "\u0001" }, NODS ? { raw: 1 } : {}, c || {}));
      if (r && r.ok && r.v226 && (r.z || r.j)) {
        if (idOf(cred()) !== id) return;                 /* تغيّرت الهوية وقت الطلب */
        if ((r.w || "") !== id) { if (!id) lsw(WK, ""); return; }   /* الخادم ما قبل الدخول — نحاول بعدين */
        const j = patch(r.j || await unz(r.z), r.me); if (!j || !j.cells || !j.sn) return;
        j.at = r.at; SNAP = j; save(j); lsw(WK, id);
        try { if (!typing() && typeof prender == "function") prender(); } catch (e) { }
      } else if (r && r.ok && !r.v226) { skipUntil = Date.now() + 6e5; }   /* الخادم بالوضع القديم (ما تحدّث بعد/مفتاح الطوارئ): نرجع نسأل بعد ١٠ دقايق */
    } catch (e) { } finally { busy = 0; }
  }
  /* الهواتف القديمة ما چانت تسحب نسخة البوابة أبداً (ما تفك الضغط) — هسه تفحص كل ٥ دقايق بالنص العادي */
  async function oldPull() { if (!NODS || busy || staffMode() || typeof SNAP == "undefined" || !SNAP) return; const c = cred(), id = idOf(c); if (lsr(WK) !== id) return; try { const r = await _api(Object.assign({ a: "snap", at: SNAP.at || "", cv: CV, w: id, raw: 1 }, c || {})); if (r && r.ok && r.v226 && r.j && (r.w || "") === id && (!SNAP.at || r.at > SNAP.at)) { const j = patch(r.j, r.me); if (j && j.cells && j.sn) { j.at = r.at; SNAP = j; save(j); if (!typing() && typeof prender == "function") prender(); } } } catch (e) { } }
  setTimeout(() => { keepName(); sync(); }, 1500); setInterval(() => { if (!D.hidden) { keepName(); sync(); } }, 3000);
  if (NODS) setInterval(() => { if (!D.hidden) oldPull(); }, 3e5);
  D.addEventListener("visibilitychange", () => { if (!D.hidden) sync(); });

  /* (٣) شاشة الطالب: رقم البطاقة بدل قائمة الأسماء */
  const P = W.PK226 = { n: "", busy: 0, L: null, err: "", more: 0, g: null, s: null, sec: {}, sb: 0 };
  const arD = v => String(v || "").replace(/[٠-٩]/g, c => c.charCodeAt(0) - 1632).replace(/[۰-۹]/g, c => c.charCodeAt(0) - 1776).replace(/\D/g, "");
  const E = s => (typeof esc == "function" ? esc(s) : String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])));
  const A = n => (typeof toAr == "function" ? toAr(n) : n);
  const I = n => (typeof ic == "function" ? ic(n) : "");
  const rr = () => { try { prender(); } catch (e) { } };
  const say = e => { const c = e && (e.code || e.err); return c == "many" ? "محاولات كثيرة من هذا الجهاز. جرّب بعد ساعة، أو راجع الإدارة." : "تعذّر الاتصال بالمدرسة. تأكد من الإنترنت وحاول مجدداً."; };
  W.pk226Go = async function (ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    if (P.busy) return false;
    const el = D.getElementById("pk226n"), n = arD(el ? el.value : P.n); P.n = n; P.L = null; P.err = "";
    if (!/^(19|20)\d{10}$/.test(n)) { P.err = "رقم البطاقة الموحدة ١٢ رقم ويبدأ بسنة الميلاد (مثل ٢٠٠٩…). عدد الأرقام التي كتبتها: " + A(n.length); rr(); return false; }
    P.busy = 1; rr();
    try { const r = await _api({ a: "who", nid: n }); if (r && r.ok) { P.L = r.L || []; if (!P.L.length) P.more = 1; } else P.err = r && r.err == "neednid" ? "الرقم غير صحيح، تأكد منه." : say(r); }
    catch (e) { P.err = say(e); }
    P.busy = 0; rr(); return false;
  };
  W.pk226Pick = function (key, name, withNid) {
    const nid = withNid ? P.n : "";
    try { PS.tab = "f"; psOpen("s", String(key), String(name)); if (nid) PS.typedN = nid; } catch (e) { }
    P.n = ""; P.L = null; P.err = ""; P.more = 0; P.g = P.s = null; rr(); try { scrollTo(0, 0); } catch (e) { }
  };
  W.pk226Sec = async function (i) {
    P.s = i; if (i == null || P.sec[i]) return rr();
    P.sb = 1; rr();
    try { const r = await _api({ a: "nonid", i }); if (r && r.ok) P.sec[i] = r.L || []; else P.err = say(r); } catch (e) { P.err = say(e); }
    P.sb = 0; rr();
  };
  const _pk = pkScreen;
  pkScreen = W.pkScreen = function () {
    let old = false; try { old = ROLE != "s" || staffMode() || nNames(SNAP) > 3; } catch (e) { old = true; }
    if (old) return _pk.apply(this, arguments);
    let res = "";
    if (P.busy) res = `<p class="muted" style="margin:8px 0 0">جارٍ البحث…</p>`;
    else if (P.err) res = `<p class="err" role="alert" style="margin:8px 0 0;color:var(--bad,#b3261e);font-weight:600">${E(P.err)}</p>`;
    else if (P.L && P.L.length) res = `<p class="muted" style="margin:10px 0 6px">${P.L.length > 1 ? "اختر اسمك:" : "هل هذا اسمك؟ اضغط عليه للمتابعة:"}</p><div class="pk-list" style="display:grid">${P.L.map(x => `<button type="button" class="gsi" onclick="pk226Pick('${E(x.key)}','${E(String(x.n).replace(/['\\]/g, ""))}',1)"><b>${E(x.n)}</b><span>${E(x.sec || "")}</span></button>`).join("")}</div>`;
    else if (P.L) res = `<p role="alert" style="margin:8px 0 0;font-weight:600">لم نجد هذا الرقم في سجلات المدرسة. تأكد من الرقم واكتبه مجدداً — وإن كنت متأكداً منه فانظر الخيار أدناه.</p>`;
    let G = [], secs = [];
    try { G = pGrades(); if (P.g != null && G[P.g] != null) secs = pSecs(G[P.g]); } catch (e) { }
    const lst = P.s != null ? (P.sb ? `<p class="muted">جارٍ التحميل…</p>` : (P.sec[P.s] || []).length
      ? `<div class="pk-list" style="display:grid">${P.sec[P.s].map(x => `<button type="button" class="gsi" onclick="pk226Pick('${E(x.key)}','${E(String(x.n).replace(/['\\]/g, ""))}',0)"><b>${E(x.n)}</b><span>${A(x.j + 1)}</span></button>`).join("")}</div><p class="muted" style="margin:8px 0 0">إذا لم يكن اسمك في هذه القائمة فرقم بطاقتك مسجّل في المدرسة — اكتبه في الأعلى. وإن لم يظهر اسمك فراجع الإدارة لتصحيحه.</p>`
      : `<p class="muted" style="margin:8px 0 0">جميع طلاب هذه الشعبة أرقام بطاقاتهم مسجّلة — اكتب رقم بطاقتك في الأعلى. إن لم يظهر اسمك فراجع إدارة المدرسة لتصحيح الرقم.</p>`) : "";
    const more = `<details ${P.more ? "open" : ""} ontoggle="PK226.more=this.open?1:0" style="margin-top:14px;border-top:1px solid var(--line,#ddd);padding-top:10px"><summary style="cursor:pointer;font-weight:600">لم يظهر اسمي / ليست لدي بطاقة موحدة</summary>
      <p class="muted" style="margin:8px 0">اختر صفك وشعبتك:</p>
      <div class="pk-sel"><select aria-label="الصف" onchange="PK226.g=this.value===''?null:+this.value;PK226.s=null;prender()"><option value="">الصف…</option>${G.map((g0, i) => `<option value="${i}" ${P.g === i ? "selected" : ""}>الصف ${E(g0)}</option>`).join("")}</select>
      <select aria-label="الشعبة" ${P.g == null ? "disabled" : ""} onchange="pk226Sec(this.value===''?null:+this.value)"><option value="">الشعبة…</option>${secs.map(([n, i]) => `<option value="${i}" ${P.s === i ? "selected" : ""}>${E(String(n).split(" ").slice(1).join(" "))}</option>`).join("")}</select></div>${lst}</details>`;
    return `<div class="box pk120 pk226"><div class="pk-hd"><span class="pk-ic">${I("users")}</span><div><h2>اكتب رقم بطاقتك الموحدة</h2><p class="muted">ليظهر اسمك وتُكمل الدخول. الرقم مكوّن من ١٢ رقماً ومكتوب على بطاقتك الموحدة.</p></div></div>
      <form onsubmit="return pk226Go(event)" style="display:grid;gap:10px"><input id="pk226n" type="tel" inputmode="numeric" maxlength="12" autocomplete="off" dir="ltr" aria-label="رقم البطاقة الموحدة" placeholder="رقم البطاقة الموحدة — ١٢ رقم" value="${E(P.n)}" oninput="dg120(this,12);PK226.n=this.value" style="font-size:1.15em;text-align:center;letter-spacing:.06em">
      <button class="btn" type="submit" ${P.busy ? "disabled" : ""}>${I("search")} بحث عن اسمي</button></form>
      <div id="pk226r" aria-live="polite">${res}</div>${more}</div>`;
  };
})();
