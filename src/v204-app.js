/* ===== v204 (29 Oct 2026) — سرعة الفتح والتحديث، منو شاف التبليغ بالأسماء، التبليغات تطلع أول ما يدخل،
   البحث يفتح ملف الطالب مباشرة، الدرجات اليومية والشهرية، جداول الامتحانات للطلاب (نشر + تحديث تلقائي)،
   الملفات والصور تنفتح بدون إنترنت، مطابقة EMIS ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const E = s => (typeof esc == "function" ? esc(s) : String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));
  const A = v => (typeof toAr == "function" ? toAr(v) : String(v));
  const I = n => (typeof ic == "function" ? ic(n) : "");
  const T0 = (m, k) => { try { toast(m, k); } catch (e) { } };
  const FD = d => { try { return d ? fmtD(String(d).slice(0, 10)) : ""; } catch (e) { return String(d || "").slice(0, 10); } };
  const LG = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
  const LS = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const on = fn => { try { return fn(); } catch (e) { console.warn("v204", e); } };
  const busy = () => { const a = D.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && (a.value || a.tagName == "SELECT")); };
  const has = n => { try { return (0, eval)("typeof " + n) != "undefined"; } catch (e) { return false; } };
  const modal = (inner, cls) => { D.querySelectorAll(".zoom.z204").forEach(x => x.remove()); const z = D.createElement("div"); z.className = "zoom inst z204"; z.onclick = () => z.remove(); z.innerHTML = `<div class="box m204 ${cls || ""}" onclick="event.stopPropagation()">${inner}</div>`; D.body.appendChild(z); return z; };
  const today = () => { const d = new Date(Date.now() + 3 * 3600e3); return d.toISOString().slice(0, 10); };

  const st = D.createElement("style");
  st.textContent = `
.zoom .box.m204{max-width:620px;width:calc(100vw - 28px);max-height:88vh;overflow:auto;border-radius:20px}
.m204 h3{display:flex;align-items:center;gap:8px}
.sn204{cursor:pointer}.sn204 .lk{display:inline-block;margin-top:2px;font-size:12px;font-weight:700;color:var(--accent,#1e5a46);text-decoration:underline}
.who204{display:grid;gap:10px}.who204 h4{margin:4px 0;display:flex;gap:6px;align-items:center}
.who204 ol{margin:0;padding:0;list-style:none;columns:2 200px;column-gap:16px;line-height:1.9}
.who204 li{break-inside:avoid}.who204 li small{color:var(--muted,#6b6b6b)}
.pop204 .nt{border:1px solid var(--line,#e3e0d6);border-radius:16px;padding:12px 14px;margin:10px 0;background:var(--surface,#fff)}
.pop204 .nt b{font-size:16px}.pop204 .nt p{white-space:pre-wrap;line-height:1.75;margin:6px 0 0}
.pop204 .hd{display:flex;align-items:center;gap:10px}.pop204 .hd .bell{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent,#1e5a46) 14%,transparent);color:var(--accent,#1e5a46)}
.pop204 .fl{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.pop204 .fl img{max-width:100%;max-height:260px;border-radius:12px;display:block}
.ex204 table{width:100%}.ex204 td,.ex204 th{text-align:center}.ex204 tr.nx td{background:color-mix(in srgb,var(--accent,#1e5a46) 14%,transparent);font-weight:700}
.ex204 tr.past td{opacity:.55}.ex204 .cd{display:inline-flex;gap:6px;align-items:center;padding:6px 12px;border-radius:999px;background:color-mix(in srgb,var(--accent,#1e5a46) 12%,transparent);font-weight:700}
.exp204{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
.gr204 table{width:100%;font-size:14px}.gr204 td,.gr204 th{text-align:center;white-space:nowrap}.gr204 td.l{text-align:right}
html{-webkit-tap-highlight-color:transparent}button,a,.btn,.gsi,select,label,[onclick]{touch-action:manipulation}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
.em204 .chip{font-size:13px}.em204 ol{margin:0;padding:0;list-style:none;line-height:1.9;columns:2 240px}
`;
  D.head.appendChild(st);

  /* ================= (١) السرعة والتحديث ================= */
  /* النسخة الجديدة توصل بالخلفية (من sw.js) وتتطبق وحدها بدون انتظار */
  on(() => {
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.addEventListener("message", e => { const d = e.data || {}; if (d.t == "upd204") { try { localStorage.removeItem("rl86v"); } catch (x) { } try { W.__chkUpd && W.__chkUpd(); } catch (x) { } } });
  });
  setTimeout(() => { try { W.__chkUpd && W.__chkUpd(); } catch (e) { } }, 1500);
  D.addEventListener("visibilitychange", () => { if (!D.hidden) { try { navigator.serviceWorker && navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage({ t: "fresh204" }); } catch (e) { } } });
  /* الشعارات صارت ملفات (أخف وأسرع): ملفات Word تنتظرها لحظة حتى تنحط بيها */
  on(() => { if (has("buildLetterDocx")) { const _b = buildLetterDocx; buildLetterDocx = async function (...a) { try { await W.IMG201_READY; } catch (e) { } return _b.apply(this, a); }; } });

  /* الملفات المرفقة: تنحفظ بالجهاز أول ما توصل، فتنفتح فوراً حتى بدون إنترنت */
  const keepFiles = urls => { try { const u = [...new Set(urls.filter(Boolean))]; if (u.length && navigator.serviceWorker && navigator.serviceWorker.controller && navigator.onLine !== false) navigator.serviceWorker.controller.postMessage({ t: "keep204", u }); } catch (e) { } };
  W.v204Keep = keepFiles;
  const FC = "sinai-ext";
  on(() => {
    if (typeof W.v202Get != "function") return;
    const _g = W.v202Get;
    W.v202Get = async function (rid, id) {
      const key = "https://sinai.cache/fget/" + encodeURIComponent(String(rid || "") + "_" + id);
      try {
        const c = await caches.open(FC), m = await c.match(key);
        if (m) { const bl = await m.blob(), n = decodeURIComponent(m.headers.get("x-name") || "ملف"); if (typeof saveFile == "function") return saveFile(n, bl); return W.open(URL.createObjectURL(bl), "_blank"); }
      } catch (e) { }
      /* أول مرة: نجيبه ونحفظه */
      try {
        const cr = W.v204Cred ? W.v204Cred() : null;
        if (cr && typeof api71 == "function") {
          const r = await api71(Object.assign({ a: "fget", rid, id }, cr), 9e4);
          if (r && r.ok) {
            const bin = atob(r.d), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
            const bl = new Blob([u8], { type: r.m || "application/octet-stream" });
            try { const c = await caches.open(FC); await c.put(key, new Response(bl, { headers: { "Content-Type": r.m || "application/octet-stream", "x-name": encodeURIComponent(r.n || "ملف") } })); } catch (e) { }
            if (typeof saveFile == "function") return saveFile(r.n || "ملف", bl);
            return W.open(URL.createObjectURL(bl), "_blank");
          }
        }
      } catch (e) { }
      return _g.apply(this, arguments);
    };
  });
  W.v204Cred = () => { try { const n = (typeof nid133K == "function" && typeof lsG == "function") ? (lsG(nid133K(PS.kind, PS.key)) || "") : ""; return { kind: PS.kind, key: PS.key, phone: PS.phone, nid: n }; } catch (e) { return null; } };

  /* ================= (٢) البحث: الضغط على اسم الطالب يفتح ملفه مباشرة ================= */
  on(() => {
    if (!has("gsStu") || !has("pfOpen")) return;
    gsStu = function (id) {
      const s = ST.find(x => x.id == id); if (!s) return;
      try { gsClose(); } catch (e) { }
      view("p"); PT = s.x == "out" ? "t" : s.x == "abs" ? "f" : "a"; FS = s.x ? "" : s.s; FQ = s.n; render();
      setTimeout(() => { try { pfOpen(id); } catch (e) { } setTimeout(() => { const b = D.getElementById("pfbox"); if (b) { const y = b.getBoundingClientRect().top + scrollY - 90; scrollTo({ top: Math.max(0, y), behavior: "smooth" }); } }, 120); }, 20);
    };
  });

  /* ================= (٣) منو شاف التبليغ — بالأسماء (الإدارة) ================= */
  const kn = (k, key) => { try { return (typeof kname == "function" ? kname(k, key) : "") || ""; } catch (e) { return ""; } };
  const staffNow = () => { try { return (typeof sortStf == "function" ? sortStf() : STF).filter(f => { const s = typeof stOf == "function" ? stOf(f) : (f.status || "مستمر"); return s == "مستمر"; }); } catch (e) { return []; } };
  function audience(n) {
    let S = []; try { S = STA(); } catch (e) { }
    const sc = n.scope, t = String(n.target || "");
    const stu = sc == "sec" ? S.filter(x => x.s == t) : sc == "allS" || sc == "all" ? S : sc == "one" && /^s:/.test(t) ? S.filter(x => x.id == t.slice(2)) : sc == "exg" ? S.filter(x => t.split("|").some(g => x.s == g || String(x.s).startsWith(g + " "))) : sc == "exs" ? S.filter(x => t.split("|").includes(x.id)) : [];
    const tch = sc == "allT" || sc == "all" ? staffNow() : sc == "one" && /^t:/.test(t) ? staffNow().filter(f => f.id == t.slice(2)) : [];
    return { stu, tch };
  }
  W.v204Seen = function (id) {
    const D0 = (has("APID") && APID) || {}, n = (D0.notes || []).find(x => String(x.id) == String(id)); if (!n) return;
    const seen = new Set(((D0.seen || {})[String(id)] || []).map(String)), reg = new Set((D0.acc || []).map(a => a.kind + ":" + a.key));
    const { stu, tch } = audience(n);
    const sS = [], sN = [], sU = [], tS = [], tN = [], tU = [];
    stu.forEach(x => { const k = "s:" + x.id; (seen.has(k) ? sS : reg.has(k) ? sN : sU).push(x); });
    tch.forEach(f => { const k = "t:" + f.id; (seen.has(k) ? tS : reg.has(k) ? tN : tU).push(f); });
    /* اللي شافوه وما ضمن القائمة (مثلاً انتقلوا) */
    const extra = [...seen].filter(k => !stu.some(x => "s:" + x.id == k) && !tch.some(f => "t:" + f.id == k)).map(k => ({ k, n: kn(k.slice(0, 1), k.slice(2)) || k }));
    const grp = L => { const by = {}; L.forEach(x => (by[x.s] = by[x.s] || []).push(x)); const SO = has("SN") ? SN : []; return Object.keys(by).sort((a, b) => SO.indexOf(a) - SO.indexOf(b)).map(s => `<div><small class="sub">${E(s)} (${A(by[s].length)})</small><ol>${by[s].map(x => `<li>${E(x.n)}</li>`).join("")}</ol></div>`).join(""); };
    const tl = L => `<ol>${L.map(f => `<li>${E(f.name)} <small>${E(f.job || "")}</small></li>`).join("")}</ol>`;
    const sec = (ttl, cls, nS, nT, body) => (nS + nT) ? `<details ${cls == "good" ? "open" : ""}><summary><h4 style="display:inline-flex"><span class="chip ${cls}">${A(nS + nT)}</span> ${ttl}</h4></summary>${body}</details>` : "";
    const tot = sS.length + tS.length + extra.length;
    modal(`<h3>${I("eye")} منو شاف التبليغ</h3><p style="margin:0 0 6px"><b>${E(n.title || "")}</b><br><span class="sub">${E(FD(n.date))}</span></p>
    <div class="who204">
    ${sec("شافوه", "good", sS.length + extra.length, tS.length, (sS.length ? grp(sS) : "") + (tS.length ? `<div><small class="sub">المدرسون والموظفون</small>${tl(tS)}</div>` : "") + (extra.length ? `<ol>${extra.map(x => `<li>${E(x.n)}</li>`).join("")}</ol>` : ""))}
    ${sec("مسجلون بالبوابة وما شافوه بعد", "bad", sN.length, tN.length, (sN.length ? grp(sN) : "") + (tN.length ? `<div><small class="sub">المدرسون والموظفون</small>${tl(tN)}</div>` : ""))}
    ${sec("غير مسجلين بالبوابة (ما يوصلهم)", "", sU.length, tU.length, (sU.length ? grp(sU) : "") + (tU.length ? `<div><small class="sub">المدرسون والموظفون</small>${tl(tU)}</div>` : ""))}
    ${!tot && !sN.length && !tN.length && !sU.length && !tU.length ? '<p class="muted">ما شافه أحد بعد.</p>' : ""}
    </div><div class="tools"><button class="btn ghost" onclick="this.closest('.zoom').remove()">إغلاق</button></div>`);
  };
  on(() => {
    if (!has("ppBody")) return;
    const _pb = ppBody;
    ppBody = function (D0, C2) {
      let h = _pb.apply(this, arguments);
      try {
        if (typeof APIT == "undefined" || APIT != "n" || !D0 || !D0.seen) return h;
        h = h.replace(/<tr><td class="l">[\s\S]*?<\/tr>/g, row => {
          const m = row.match(/delNote',id:'([^']+)'/); if (!m) return row;
          return row.replace(/<td title="([^"]*)"><b>([^<]*)<\/b>/, (x, tip, nn) => `<td title="${tip}" class="sn204" onclick="v204Seen('${E(m[1])}')"><b>${nn}</b><span class="lk">منو شافه؟</span>`);
        });
      } catch (e) { console.warn(e); }
      return h;
    };
  });

  /* ================= (٤) المدرس: منو شاف تبليغه من طلابه، ومنو بعده ================= */
  on(() => {
    if (!has("sent90HTML")) return;
    sent90HTML = function () {
      const L = (PS && PS.b && PS.b.sent) || null;
      if (L == null) return "";
      const S2 = ((PS.b.private || {}).studs2 || []), nm = {}; S2.forEach(x => { nm[String(x[0])] = x[1]; });
      const row = n => {
        const who = new Set((n.who || []).map(String));
        const to = n.scope == "one" ? (nm[String(n.target).replace(/^s:/, "")] || "طالب") : n.target;
        const aud = n.scope == "one" ? S2.filter(x => "s:" + x[0] == n.target || x[0] == String(n.target).replace(/^s:/, "")) : S2.filter(x => x[2] == n.target);
        const seen = aud.filter(x => who.has(String(x[0]))), not = aud.filter(x => !who.has(String(x[0])));
        const tot = aud.length || n.tot || 0, pc = tot ? Math.round(seen.length * 100 / tot) : 0;
        return `<div class="note1 st90"><div class="vh"><b>${E(n.title || "")}</b><span class="chip ${seen.length ? "good" : ""}">${I("eye")} شافه ${A(seen.length || n.n || 0)}${tot ? " من " + A(tot) : ""}</span></div>
        <div class="st90b"><i style="width:${Math.min(100, pc)}%"></i></div>
        <span class="sub">إلى: ${E(to)}${n.nf ? " — " + A(n.nf) + " مرفق" : ""}${n.date ? " — " + FD(n.date) : ""}</span>
        ${seen.length ? `<details><summary class="sub">${I("ok")} شافوه (${A(seen.length)})</summary><p class="sub" style="margin:4px 0 0">${seen.map(x => E(x[1])).join("، ")}</p></details>` : ""}
        ${not.length ? `<details><summary class="sub">ما شافوه بعد (${A(not.length)})</summary><p class="sub" style="margin:4px 0 0">${not.map(x => E(x[1])).join("، ")}</p></details>` : ""}</div>`;
      };
      return `<div class="box"><h3>${I("eye")} تبليغاتي المرسلة — منو شافها <span class="chip">${A(L.length)}</span></h3>${L.length ? L.map(row).join("") : '<p class="muted" style="margin:0">ما أرسلت تبليغات بعد.</p>'}</div>`;
    };
  });

  /* ================= (٥) التبليغات تطلع بوجه الطالب والمدرس أول ما يدخل ================= */
  const rdK = () => "rd204_" + PS.kind + "_" + PS.key;
  let POP = 0;
  function unread() {
    if (typeof PS == "undefined" || !PS.b || PS.stage != "in" || !PS.key) return [];
    const rd = new Set((LG(rdK()) || []).map(String)), done = new Set(((typeof lsG == "function" ? lsG("seen70_" + PS.kind + "_" + PS.key) : null) || []).map(String));
    /* أول مرة على هذا الجهاز: التبليغات الأقدم من أسبوعين تنحسب مقروءة حتى ما تطلع كومة */
    if (!LG(rdK() + "_i")) { const old = Date.now() - 14 * 864e5; LS(rdK(), (PS.b.notes || []).filter(n => Date.parse(n.date || 0) < old).map(n => String(n.id))); LS(rdK() + "_i", 1); }
    return (PS.b.notes || []).filter(n => n && n.id && !rd.has(String(n.id)) && !done.has(String(n.id)));
  }
  const fileHTML = f => {
    const u = f.u || "";
    if (u && /^image\//.test(f.m || "")) return `<a href="${E(u)}" target="_blank" rel="noopener"><img src="${E(u)}" alt="${E(f.n || "")}" loading="lazy"></a>`;
    return u ? `<a class="btn ghost sm" href="${E(u)}" target="_blank" rel="noopener">${I("doc")} ${E(f.n || "ملف")}</a>` : `<span class="chip">${I("doc")} ${E(f.n || "ملف")}</span>`;
  };
  W.v204PopShow = function (force) {
    if (POP && !force) return;
    let L = unread(); if (!L.length) return;
    if (D.querySelector(".zoom") && !force) return;
    L = L.slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).slice(0, 12);
    POP = 1;
    keepFiles(L.flatMap(n => (n.files || []).map(f => f.u)));
    const z = modal(`<div class="pop204"><div class="hd"><span class="bell">${I("mail")}</span><div><h3 style="margin:0">عندك ${A(L.length)} ${L.length == 1 ? "تبليغ جديد" : L.length <= 10 ? "تبليغات جديدة" : "تبليغاً جديداً"}</h3><span class="sub">اقرأها ثم اضغط «تم الاطلاع»</span></div></div>
      ${L.map(n => `<div class="nt"><b>${E(n.title || "تبليغ")}</b><div class="sub">${E(n.from || "")}${n.date ? " — " + E(FD(n.date)) : ""}</div><p>${E(n.body || "")}</p>${(n.files || []).length ? `<div class="fl">${n.files.map(fileHTML).join("")}</div>` : ""}</div>`).join("")}
      <div class="tools" style="position:sticky;bottom:-16px;background:var(--surface,#fff);padding:10px 0"><button class="btn" id="pop204ok">${I("ok")} تم الاطلاع</button><button class="btn ghost" id="pop204go">فتح كل التبليغات</button></div></div>`);
    z.onclick = null;
    const done = go => {
      const rd = new Set((LG(rdK()) || []).map(String)); L.forEach(n => rd.add(String(n.id))); LS(rdK(), [...rd].slice(-500));
      try { if (typeof seen70 == "function") seen70(); } catch (e) { }
      z.remove(); POP = 0;
      if (go) { try { PS.tab = "n"; prender(); scrollTo(0, 0); } catch (e) { } }
    };
    D.getElementById("pop204ok").onclick = () => done(0);
    D.getElementById("pop204go").onclick = () => done(1);
  };
  /* يفحص بعد الدخول وكل ما توصل تبليغات جديدة */
  setInterval(() => { try { if (!D.hidden && typeof PS != "undefined" && PS.stage == "in" && !busy()) W.v204PopShow(); } catch (e) { } }, 1500);
  /* لما المستخدم يفتح تبويب التبليغات بنفسه: كلها تنحسب مقروءة */
  setInterval(() => { try { if (typeof PS != "undefined" && PS.b && PS.tab == "n" && PS.stage == "in" && !POP) { const rd = new Set((LG(rdK()) || []).map(String)); let ch = 0; (PS.b.notes || []).forEach(n => { if (!rd.has(String(n.id))) { rd.add(String(n.id)); ch = 1; } }); if (ch) LS(rdK(), [...rd].slice(-500)); keepFiles((PS.b.notes || []).slice(0, 30).flatMap(n => (n.files || []).map(f => f.u))); } } catch (e) { } }, 3000);

  /* ================= (٦) جداول الامتحانات للطلاب والمدرسين ================= */
  on(() => {
    if (typeof PTABS == "undefined") return;
    if (!PTABS.s.some(x => x[0] == "x")) PTABS.s.splice(Math.min(2, PTABS.s.length), 0, ["x", "الامتحانات", "cal"]);
    if (!PTABS.t.some(x => x[0] == "x")) PTABS.t.splice(Math.min(3, PTABS.t.length), 0, ["x", "الامتحانات", "cal"]);
  });
  const wd = d => { try { return typeof wdOf == "function" ? wdOf(d) : ""; } catch (e) { return ""; } };
  function exTab() {
    const L = (PS.b && PS.b.ex) || [];
    if (!L.length) return `<div class="box"><h3>${I("cal")} جداول الامتحانات</h3><p class="muted" style="margin:0">ما انتشر أي جدول امتحانات بعد. أول ما تنشره الإدارة يطلع هنا ويوصلك تبليغ.</p></div>`;
    const t0 = today();
    return L.map(t => {
      const stu = PS.kind == "s", G = t.g || [];
      const rows = (t.rows || []).filter(r => r.d || r.c.some(Boolean));
      const nx = rows.find(r => r.d >= t0 && (r.c || []).some(c => c && c != "بلا امتحان"));
      let cd = "";
      if (nx) { const n = Math.round((Date.parse(nx.d + "T00:00:00") - Date.parse(t0 + "T00:00:00")) / 864e5); cd = `<span class="cd">${I("clock") || I("cal")} ${n == 0 ? "امتحانك اليوم" : n == 1 ? "امتحانك باچر" : "باقي " + A(n) + (n <= 10 ? " أيام" : " يوماً") + " على الامتحان الجاي"}</span>`; }
      const mine = t.mine && t.mine.length ? `<p style="margin:6px 0"><b>موادك بالدور الثاني:</b> ${t.mine.map(x => `<span class="chip bad">${E(x)}</span>`).join(" ")}</p>` : "";
      return `<div class="box ex204"><div class="exp204"><h3 style="margin:0">${I("cal")} ${E(A(t.t))}</h3>${cd}</div>${mine}
      <div class="tw"><table><tr><th>اليوم</th><th>التاريخ</th>${stu ? "<th>المادة</th>" : G.map(g => `<th>${E(g)}</th>`).join("")}</tr>
      ${rows.map(r => { const past = r.d && r.d < t0, cls = r === nx ? "nx" : past ? "past" : ""; return `<tr class="${cls}"><td><b>${E(wd(r.d))}</b></td><td>${r.d ? E(FD(r.d)) : ""}</td>${(r.c || []).map(c => `<td>${c && c != "بلا امتحان" ? E(c) : '<span class="muted">—</span>'}</td>`).join("")}</tr>`; }).join("")}</table></div>
      ${t.notes ? `<details style="margin-top:8px"><summary><b>التعليمات الامتحانية</b></summary><ol style="margin:6px 0 0;line-height:1.9">${String(t.notes).split("\n").map(s => s.trim()).filter(Boolean).map(s => `<li>${E(s.replace(/^\d+\s*[-–.]\s*/, ""))}</li>`).join("")}</ol></details>` : ""}
      <p class="sub" style="margin:6px 0 0">آخر تحديث: ${E(FD(t.at))}${!stu && t.n2 ? " — دور ثاني لـ " + A(t.n2) + " طالب" : ""}</p></div>`;
    }).join("");
  }
  on(() => {
    if (!has("psView")) return;
    const _pv = psView;
    psView = function (...a) {
      let h = _pv.apply(this, a);
      try {
        if (!PS.b || PS.tab != "x") return h;
        const x = exTab();
        const i = h.lastIndexOf('<div class="tools" style="justify-content:center">');
        h = i >= 0 ? h.slice(0, i) + x + h.slice(i) : h + x;
      } catch (e) { console.warn(e); }
      return h;
    };
  });
  /* لما يتحدث الجدول المنشور: يتحدث عند الطالب وحده + تنبيه */
  on(() => {
    if (typeof W.v202Inbox != "function") return;
    let lastH = null;
    setInterval(() => { try { if (typeof PS == "undefined" || !PS.b) return; const h = PS.b.exh || ""; if (lastH == null) { lastH = h; return; } if (h != lastH) { lastH = h; if (PS.tab == "x" && !busy()) prender(); } } catch (e) { } }, 2000);
  });
  /* inbox بالبوابة يجيب ex و exh — نحفظهم بـ PS.b */
  on(() => {
    if (typeof api71 != "function") return;
    const _a = api71;
    api71 = async function (b, ms) {
      const r = await _a.apply(this, arguments);
      try { if (r && r.ok && b && (b.a == "inbox" || b.a == "login" || b.a == "reg") && typeof PS != "undefined" && PS.b && "ex" in r) { const ch = PS.b.exh != r.exh; PS.b.ex = r.ex; PS.b.exh = r.exh; if (r.sent && JSON.stringify(r.sent) != JSON.stringify(PS.b.sent || null)) { PS.b.sent = r.sent; if (PS.tab == "w" && !busy()) try { prender(); } catch (e) { } } if (ch) { try { psKeep(); } catch (e) { } if (ch && PS.tab == "x" && !busy()) try { prender(); } catch (e) { } } } } catch (e) { }
      return r;
    };
  });

  /* --- الإدارة: نشر جدول الامتحانات للطلاب، وأي تعديل بعده يوصل وحده --- */
  let EXP = null, EXPB = 0;
  const own = () => !!(W.GXOWN || (has("TOWN") && TOWN));
  const admApi = async o => { try { if (typeof own200Key == "function") own200Key(); } catch (e) { } if (!has("APIK") || !APIK || !APIK.url) throw new Error("noapi"); return api(Object.assign({ a: "admin", secret: APIK.secret }, o), APIK.url); };
  async function exLoad() { if (EXPB) return; EXPB = 1; try { const r = await admApi({ op: "exGet" }); if (r && r.ok) { EXP = r.pub || {}; if (has("cur") && cur == "ex") render(); exAuto(); } } catch (e) { } EXPB = 0; }
  function exData(k) {
    const E0 = exGet(k), T = (EXT.find(x => x[0] == k) || [])[1] || "جدول الامتحانات";
    const o = { t: T + " للعام الدراسي " + String(YR || "").replace(/[‎‏]/g, ""), g: E0.g, rows: E0.rows, notes: E0.notes };
    if (k == "f2") {
      const f2 = {};
      try { STA().filter(s => !/^السادس/.test(s.s)).forEach(s => { const a = stuF(s); if (a && a.k == "c") f2[s.id] = (a.F || []).map(sj => typeof fullN == "function" ? fullN(sj) : sj); }); } catch (e) { }
      o.f2 = f2;
    }
    return o;
  }
  async function exPush(k, quiet) {
    try {
      const r = await admApi({ op: "exPub", k, data: exData(k) });
      if (r && r.ok) { EXP = EXP || {}; EXP[k] = Object.assign({}, EXP[k] || {}, { at: r.at || new Date().toISOString(), h: r.h || (EXP[k] || {}).h }); if (!quiet) T0("انتشر الجدول للطلاب ✓ — أي تعديل بعد هذا يوصلهم وحده"); if (has("cur") && cur == "ex") render(); return 1; }
      if (!quiet) T0("تعذّر النشر — " + (typeof errTxt == "function" ? errTxt(r) : ""), "err");
    } catch (e) { if (!quiet) T0("تعذّر النشر — تأكد من الإنترنت (ينعاد وحده)", "err"); const Q = LG("ex204q") || []; if (!Q.includes(k)) Q.push(k); LS("ex204q", Q); }
    return 0;
  }
  let EXT0 = {};
  const exAutoOne = k => { clearTimeout(EXT0[k]); EXT0[k] = setTimeout(() => { if (EXP && EXP[k]) exPush(k, 1); }, 1500); };
  function exAuto() { if (!EXP) return; Object.keys(EXP).forEach(k => exAutoOne(k)); }
  setInterval(() => { const Q = LG("ex204q") || []; if (!Q.length || navigator.onLine === false || !own()) return; LS("ex204q", null); Q.forEach(k => exPush(k, 1)); }, 3e4);
  W.v204ExPub = async k => { k = k || EXK; try { exSave(1); } catch (e) { } const d = exData(k); if (!d.rows.length) return T0("الجدول فارغ — أضف الأيام والمواد أولاً", "err"); if (k == "f2" && !Object.keys(d.f2 || {}).length) return T0("ما اكو طلاب دور ثاني بالنتائج بعد — أكمل درجات آخر السنة أولاً", "err"); if (!confirm("نشر «" + d.t + "» للطلاب" + (k == "f2" ? " (" + Object.keys(d.f2).length + " طالب دور ثاني)" : "") + "؟\nبعد النشر أي تعديل يوصلهم تلقائياً.")) return; await exPush(k); };
  W.v204ExOff = async k => { k = k || EXK; if (!confirm("إيقاف ظهور هذا الجدول عند الطلاب؟")) return; try { const r = await admApi({ op: "exPub", k, data: null }); if (r && r.ok) { delete EXP[k]; T0("توقف ظهور الجدول عند الطلاب"); render(); } } catch (e) { T0("تعذّر — تأكد من الإنترنت", "err"); } };
  on(() => {
    if (!has("V") || typeof V.ex != "function") return;
    const _ve = V.ex;
    V.ex = function (...a) {
      let h = _ve.apply(this, a);
      try {
        if (!own()) return h;
        if (EXP == null) setTimeout(exLoad, 0);
        const p = EXP && EXP[EXK];
        const box = `<div class="banner ${p ? "ok" : ""}" style="margin:8px 0">${I("upload")} <span>${EXP == null ? "جارٍ فحص حالة النشر…" : p ? `<b>منشور للطلاب</b> — آخر تحديث ${E(FD(p.at))}. أي تعديل وحفظ هنا يوصلهم تلقائياً.` : "هذا الجدول <b>ما منشور</b> للطلاب بعد. بعد ما تكمله اضغط «نشر للطلاب»."}${EXK == "f1" || EXK == "f2" ? " (السادس وزاري — ما يطلعله)" : ""}${EXK == "f2" ? " يوصل بس للطلاب المكملين حسب النتائج، وكل طالب يشوف مواده." : ""}</span> ${p ? `<button class="btn sm" onclick="v204ExPub()">${I("rld")} تحديث النشر هسه</button><button class="btn ghost sm" onclick="v204ExOff()">إيقاف</button>` : `<button class="btn sm" onclick="v204ExPub()">${I("upload")} نشر للطلاب</button>`}</div>`;
        const i = h.indexOf('<div class="box">');
        h = i >= 0 ? h.slice(0, i) + box + h.slice(i) : box + h;
      } catch (e) { console.warn(e); }
      return h;
    };
    ["exSave", "exAdd", "exDel", "exClear"].forEach(fn => { if (!has(fn)) return; const _f = (0, eval)(fn); const nf = function (...a) { const r = _f.apply(this, a); try { exAutoOne(EXK); } catch (e) { } return r; }; W.__v204f = nf; try { (0, eval)(fn + "=window.__v204f"); } catch (e) { } delete W.__v204f; });
  });

  /* ================= (٧) المدرس: الدرجات اليومية (بالتاريخ) والشهرية + سجل كامل ================= */
  on(() => {
    if (!has("psView")) return;
    const _pv = psView;
    psView = function (...a) {
      let h = _pv.apply(this, a);
      try {
        if (!PS.b || PS.kind != "t" || PS.tab != "d" || !W.G202) return h;
        const G = W.G202, lbl = String(G.lbl || ""), isDay = /^(يومي|امتحان يومي)/.test(lbl);
        /* خيار «درجة يومية بتاريخ» */
        const dsel = (lbl.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || today();
        h = h.replace(/(<select onchange="G202\.lbl=this\.value;prender\(\)">)/, `$1<option ${/^يومي — /.test(lbl) ? "selected" : ""} value="يومي — ${dsel}">درجة يومية — ${E(FD(dsel))}</option>`);
        if (isDay) h = h.replace(/(<label class="wide">نوع الدرجة[\s\S]*?<\/label>)/, `$1<label>تاريخ الدرجة اليومية<input type="date" value="${dsel}" onchange="G202.lbl='يومي — '+this.value;prender()"></label>`);
        /* السجل: كل الدرجات المرسلة لهذي الشعبة والمادة */
        const pv = PS.b.private || {}, L = (pv.studs2 || []).filter(x => x[2] == G.sec), R = (G.rows || []).filter(r => r.subj == G.sj);
        const labs = [...new Set(R.map(r => r.label))].sort((a, b) => { const da = (a.match(/\d{4}-\d{2}-\d{2}/) || [""])[0], db = (b.match(/\d{4}-\d{2}-\d{2}/) || [""])[0]; return (da ? 1 : 0) - (db ? 1 : 0) || da.localeCompare(db) || a.localeCompare(b, "ar"); });
        if (L.length && labs.length) {
          const v = (sk, l) => { const r = R.find(x => x.skey == sk && x.label == l); return r ? r.val : ""; };
          const short = l => l.replace(/^يومي — (\d{4}-\d{2}-\d{2})$/, (m, d) => "يومي " + FD(d)).replace(/ — الفصل الأول/, " ف١").replace(/ — الفصل الثاني/, " ف٢");
          const tbl = `<div class="box gr204"><h3>${I("sheet") || I("pen")} سجل درجات ${E(G.sec)} — ${E(G.sj)}</h3><p class="muted" style="margin:0 0 6px">كل الدرجات اللي أرسلتها (اليومية والشهرية والفصلية) بجدول واحد.</p><div class="tw"><table><tr><th>ت</th><th class="l">اسم الطالب</th>${labs.map(l => `<th>${E(short(l))}</th>`).join("")}</tr>${L.map((x, i) => `<tr><td>${A(i + 1)}</td><td class="l">${E(x[1])}</td>${labs.map(l => { const z = v(x[0], l); return `<td class="${z !== "" && +z < 50 && !/^يومي/.test(l) ? "red" : ""}">${z === "" ? "" : E(A(z))}</td>`; }).join("")}</tr>`).join("")}</table></div></div>`;
          const i = h.indexOf('<div class="box"><h3>' + I("print") + " طباعة طلابي");
          h = i >= 0 ? h.slice(0, i) + tbl + h.slice(i) : h;
        }
      } catch (e) { console.warn(e); }
      return h;
    };
  });

  /* ================= (٨) EMIS: كل طلاب النظام بالضبط + مطابقة مع ملف EMIS ================= */
  const nk = s => (typeof nrm == "function" ? nrm(s) : String(s || "")).replace(/[ةه]\b/g, "ه").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/عبد\s+/g, "عبد").replace(/\s+/g, " ").trim();
  let EMC = null;
  W.v204EmisAll = async function () {
    try { if (typeof infLoad == "function") await infLoad(); } catch (e) { }
    return emisFile(STA(), "بيانات الطلاب - EMIS (كل طلاب النظام)");
  };
  W.v204EmisCmp = async function (inp) {
    const f = inp && inp.files && inp.files[0]; if (!f) return;
    try {
      T0("جارٍ قراءة ملف EMIS…");
      const buf = await f.arrayBuffer();
      let rows = [];
      if (/\.csv$/i.test(f.name)) rows = new TextDecoder().decode(buf).split(/\r?\n/).map(l => l.split(/[,;\t]/));
      else rows = await xlsx120(buf);
      /* نلكه عمود الاسم (أو أعمدة الاسم المقسّم) والصف والشعبة */
      const hi = rows.findIndex(r => (r || []).some(c => /اسم/.test(String(c || ""))));
      const H = (rows[hi] || []).map(c => String(c || "").trim());
      const col = re => H.findIndex(h => re.test(h));
      const cFull = col(/الاسم الرباعي|الاسم الكامل|اسم الطالب$/), cN = [col(/^اسم الطالب|^الاسم$|الاسم الاول|الأول/), col(/الأب|الاب/), col(/الجد$|اسم الجد/), col(/والد الجد|جد الأب|اب الجد/)];
      const cG = col(/الصف|المرحلة/), cS = col(/الشعبة/);
      const E2 = [];
      for (let i = hi + 1; i < rows.length; i++) {
        const r = rows[i] || [];
        let n = cFull >= 0 ? String(r[cFull] || "") : cN.filter(c => c >= 0).map(c => String(r[c] || "").trim()).filter(Boolean).join(" ");
        n = n.replace(/\s+/g, " ").trim(); if (!n || !/[ء-ي]/.test(n)) continue;
        E2.push({ n, g: cG >= 0 ? String(r[cG] || "").trim() : "", s: cS >= 0 ? String(r[cS] || "").trim() : "" });
      }
      if (!E2.length) return T0("ما لكيت أسماء بالملف — تأكد إنه ملف طلاب EMIS", "err");
      const S = STA(), ks = s => nk(s.n).split(" ").slice(0, 4).join(" "), ke = e => nk(e.n).split(" ").slice(0, 4).join(" ");
      const mE = new Map; E2.forEach(e => { const k = ke(e); (mE.get(k) || mE.set(k, []).get(k)).push(e); });
      const mS = new Map; S.forEach(s => { const k = ks(s); (mS.get(k) || mS.set(k, []).get(k)).push(s); });
      const add = S.filter(s => !mE.has(ks(s))), del = E2.filter(e => !mS.has(ke(e)));
      const secMis = [];
      S.forEach(s => { const e = (mE.get(ks(s)) || [])[0]; if (!e || !e.s) return; const sl = String(s.s).split(" ").pop(); if (nk(e.s).replace(/[^ء-ي]/g, "") && nk(e.s).replace(/[^ء-ي]/g, "") != nk(sl).replace(/[^ء-ي]/g, "")) secMis.push([s, e]); });
      EMC = { at: new Date().toISOString(), file: f.name, nE: E2.length, nS: S.length, add, del, secMis };
      render(); T0("انتهت المطابقة");
    } catch (e) { console.error(e); T0("تعذّرت قراءة الملف — نزّله من EMIS بصيغة Excel وجرّب مرة ثانية", "err"); }
  };
  /* ملف EMIS (نفس ترتيب حقول الاستمارة) لقائمة طلاب معيّنة */
  async function emisFile(L, name) {
    try { if (typeof infLoad == "function") await infLoad(); } catch (e) { }
    const rows = [EMISH.map(v => ({ v, h: 1 }))]; let k = 0;
    L.forEach(s => { const x = (INF[s.id] || {}).x; const sp = x ? [x.n1, x.n2, x.n3, x.n4] : splitName101(s.n).slice(0, 4); const [y, m, d] = String(x && x.dob || "").split("-"); const [gr, ...sc] = String(s.s || "").split(" ");
      rows.push([String(++k), { v: sp[0] || "", l: 1, b: 1 }, sp[1] || "", sp[2] || "", sp[3] || "", x && x.laqab || "", x && x.m1 || "", x && x.m2 || "", x && x.m3 || "", "ذكر", d ? String(+d) : "", m ? String(+m) : "", y || "", x && x.nid || "", gr || "", sc.join(" "), x && x.gphone || s.p || "", x && x.gr || "", x && x.city || "", x && x.hay || "", x && x.mahalla || "", x && x.zuqaq || "", x && x.dar || "", x && x.near || "", x && x.email || "", x ? "مكتمل" : "لم يكمل بعد"]); });
    if (!k) return T0("ما اكو طلاب", "err");
    return exportSheets("xlsx", name, [{ title: name + " — إعدادية سيناء للبنين", sheet: "EMIS", orient: "landscape", fs: 9, hr: 1, rows, xw: [5, 14, 14, 14, 14, 12, 14, 14, 14, 7, 6, 6, 7, 16, 10, 10, 15, 10, 12, 14, 8, 8, 8, 22, 24, 12] }]);
  }
  W.v204EmisAddFile = function () {
    if (!EMC || !EMC.add.length) return T0("ما اكو أسماء ناقصة بـ EMIS ✓");
    const keep = new Set(EMC.add.map(s => s.id));
    return emisFile(STA().filter(s => keep.has(s.id)), "طلاب ناقصون بـ EMIS");
  };
  W.v204EmisCmpPrint = function () {
    if (!EMC) return;
    const sh = [];
    if (EMC.add.length) sh.push(sheet137("طلاب موجودون بالنظام وناقصون بـ EMIS (تنضاف)", ["ت", "اسم الطالب", "الصف والشعبة"], EMC.add.map((s, i) => [A(i + 1), { v: s.n, l: 1 }, s.s]), [0.8, 6, 3], [6, 50, 26]));
    if (EMC.del.length) sh.push(sheet137("أسماء موجودة بـ EMIS ومو موجودة بالنظام (تنشال من EMIS)", ["ت", "الاسم", "الصف", "الشعبة"], EMC.del.map((e, i) => [A(i + 1), { v: e.n, l: 1 }, e.g, e.s]), [0.8, 6, 2, 1.5], [6, 50, 16, 12]));
    if (EMC.secMis.length) sh.push(sheet137("الشعبة مختلفة بين النظام و EMIS (تتصحح بـ EMIS حسب النظام)", ["ت", "اسم الطالب", "بالنظام", "بـ EMIS"], EMC.secMis.map(([s, e], i) => [A(i + 1), { v: s.n, l: 1 }, s.s, (e.g + " " + e.s).trim()]), [0.8, 6, 3, 3], [6, 46, 22, 22]));
    if (!sh.length) return T0("EMIS مطابق للنظام 100% ✓");
    return exportSheets("pdf", "مطابقة EMIS مع النظام", sh);
  };
  on(() => {
    if (!has("emisBox")) return;
    const _eb = emisBox;
    emisBox = function () {
      let h = _eb.apply(this, arguments);
      try {
        const S = STA();
        const res = EMC ? `<div class="em204" style="margin-top:8px">${!EMC.add.length && !EMC.del.length && !EMC.secMis.length ? `<div class="banner ok">${I("ok")} <span>EMIS مطابق للنظام 100% — ${A(EMC.nS)} طالب.</span></div>` : `<div class="banner warn">${I("alert")} <span>نتيجة المطابقة مع «${E(EMC.file)}»: بالنظام ${A(EMC.nS)} طالب، وبـ EMIS ${A(EMC.nE)}.</span></div>
          <p style="margin:6px 0"><span class="chip bad">ناقصون بـ EMIS: ${A(EMC.add.length)}</span> <span class="chip bad">زايدون بـ EMIS: ${A(EMC.del.length)}</span> <span class="chip">شعبة مختلفة: ${A(EMC.secMis.length)}</span></p>
          ${EMC.add.length ? `<details open><summary><b>ناقصون بـ EMIS (لازم ينضافون)</b></summary><ol>${EMC.add.map(s => `<li>${E(s.n)} <small class="sub">${E(s.s)}</small></li>`).join("")}</ol></details>` : ""}
          ${EMC.del.length ? `<details><summary><b>موجودون بـ EMIS ومو بالنظام (ينشالون من EMIS)</b></summary><ol>${EMC.del.map(e => `<li>${E(e.n)} <small class="sub">${E((e.g + " " + e.s).trim())}</small></li>`).join("")}</ol></details>` : ""}
          ${EMC.secMis.length ? `<details><summary><b>الشعبة مختلفة</b></summary><ol>${EMC.secMis.map(([s, e]) => `<li>${E(s.n)} <small class="sub">النظام: ${E(s.s)} — EMIS: ${E((e.g + " " + e.s).trim())}</small></li>`).join("")}</ol></details>` : ""}
          <div class="tools">${EMC.add.length ? `<button class="btn sm" onclick="v204EmisAddFile()">${I("download")} ملف الناقصين جاهز للرفع على EMIS</button>` : ""}<button class="btn ghost sm" onclick="v204EmisCmpPrint()">${I("print")} طباعة تقرير المطابقة</button></div>`}</div>` : "";
        const extra = `<div class="tools" style="margin-top:6px"><button class="btn sm" onclick="v204EmisAll()">${I("download")} كل طلاب النظام (${A(S.length)}) — مطابق للنظام بالضبط</button>
        <label class="btn ghost sm" style="cursor:pointer">${I("upload")} مطابقة مع ملف EMIS<input type="file" accept=".xlsx,.xls,.csv" hidden onchange="v204EmisCmp(this)"></label></div>
        <p class="sub" style="margin:4px 0 0">نزّل قائمة الطلاب من موقع EMIS وارفعها هنا: يطلعلك منو ناقص بـ EMIS ومنو زايد ومنو شعبته مختلفة — والمرجع دائماً قوائم النظام (بدون أي إضافة أو تغيير عليها).</p>${res}`;
        const i = h.lastIndexOf("</div>");
        h = i > 0 ? h.slice(0, i) + extra + h.slice(i) : h + extra;
      } catch (e) { console.warn(e); }
      return h;
    };
  });
})();
