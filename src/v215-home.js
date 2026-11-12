/* ===== v215 (6 Nov 2026) — الواجهة الرئيسية الجديدة: شريط الحمد المتحرك، البسملة والآية، شعار الوزارة الجديد وشعار المدرسة بدقة عالية،
   نبذة المدرسة وأوقات الدوام والتأسيس والعنوان والمدرسة المزدوجة، تبويبات دخول ملوّنة — متوافقة مع كل الشاشات ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v215h", e); } };
  const AD = x => String(x).replace(/[0-9]/g, k => "٠١٢٣٤٥٦٧٨٩"[k]);
  const LOGO_M = "__LOGO_M__", LOGO_S = "__LOGO_S__";
  W.LOGO215 = { m: LOGO_M, s: LOGO_S };

  /* أوقات الدوام من الجدول المعتمد (إذا موجود بالجهاز) وإلا القيم الحالية */
  function hours() {
    const NM = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
    let T = null;
    on(() => { if (typeof TMS != "undefined" && Array.isArray(TMS) && TMS.length) T = TMS; });
    on(() => { if (!T && typeof SNAP != "undefined" && SNAP && Array.isArray(SNAP.times)) T = SNAP.times; });
    const def = [["8:00 ص", "12:30 م"], ["8:00 ص", "12:30 م"], ["8:00 ص", "12:30 م"], ["12:30 م", "4:30 م"], ["12:30 م", "4:30 م"]];
    const rows = NM.map((n, d) => {
      let a = def[d][0], b = def[d][1];
      on(() => { const L = (T && T[d] || []).filter(x => x && x[0] && x[1]); if (L.length) { a = L[0][0]; b = L[L.length - 1][1]; } });
      return [n, a, b];
    });
    /* دمج الأيام المتشابهة: الأحد – الثلاثاء … */
    const out = [];
    rows.forEach(r => { const l = out[out.length - 1]; if (l && l.a == r[1] && l.b == r[2]) l.to = r[0]; else out.push({ from: r[0], to: "", a: r[1], b: r[2] }); });
    return out.map(g => ({ days: g.to ? g.from + " – " + g.to : g.from, a: AD(g.a), b: AD(g.b), pm: /م/.test(g.a) }));
  }

  const CSS = `
:root{--h215g1:#0f4d3c;--h215g2:#1d6b55;--h215gold:#c9a24a;--h215gold2:#e8c877}
#hm215bar{position:fixed;top:0;left:0;right:0;z-index:2147483000;height:34px;overflow:hidden;background:linear-gradient(90deg,#0b3d30,#145a47 50%,#0b3d30);border-bottom:1.5px solid var(--h215gold);box-shadow:0 2px 10px rgba(8,40,32,.25);direction:ltr;contain:layout paint;pointer-events:none}
#hm215bar .t{display:flex;width:max-content;height:100%;align-items:center;animation:hm215m 120s linear infinite;will-change:transform}
#hm215bar .t span{direction:rtl;white-space:nowrap;padding:0 34px;font:700 15.5px/1 "Amiri","Noto Naskh Arabic","El Messiri",serif;color:var(--h215gold2);letter-spacing:.2px;text-shadow:0 1px 0 rgba(0,0,0,.25)}
#hm215bar .t span i{font-style:normal;color:#fff;opacity:.55;padding:0 0 0 34px}
@keyframes hm215m{from{transform:translateX(-50%)}to{transform:translateX(0)}}
@media (prefers-reduced-motion:reduce){#hm215bar .t{animation-duration:240s!important}}
body:not(.hm215on) #hm215bar{display:none}
.hm215on #login{padding-top:48px!important}
#login{align-content:start!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#login.picked{align-content:start!important}
#login .lg{width:min(560px,100%)!important}
#login .lg-logo{display:none!important}
.hm215h{width:100%;display:grid;gap:10px;justify-items:center}
.hm215lg{display:flex;align-items:center;justify-content:center;gap:clamp(14px,6vw,46px);width:100%}
.hm215lg figure{margin:0;display:grid;justify-items:center;gap:6px}
.hm215lg img{width:clamp(96px,28vw,150px);height:auto;aspect-ratio:1;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(15,60,48,.22));image-rendering:-webkit-optimize-contrast}
.hm215lg figcaption{font:600 11.5px/1.3 var(--f-body,inherit);color:#5b6f67}
.hm215q{width:100%;padding:12px 14px 10px;border-radius:18px;background:linear-gradient(180deg,#fffdf6,#fbf5e4);border:1px solid #ead9a6;box-shadow:0 1px 0 #fff inset,0 6px 18px rgba(150,120,40,.10);position:relative}
.hm215q .bs{display:block;font:700 clamp(19px,5vw,24px)/1.6 "Amiri","Noto Naskh Arabic",serif;color:#0f4d3c;margin-bottom:2px}
.hm215q .ay{display:block;font:400 clamp(20px,5.4vw,26px)/1.9 "Amiri","Noto Naskh Arabic",serif;color:#1b2a25;word-spacing:1px}
.hm215q .ay b{font-weight:400;color:var(--h215gold);font-family:"Amiri","Noto Naskh Arabic",serif}
.hm215q .src{display:block;font:600 12px/1.4 var(--f-body,inherit);color:#8a7440;margin-top:2px}
#login h1#lgt{font-size:clamp(25px,7vw,34px)!important;margin:2px 0 0!important;background:linear-gradient(180deg,#145a47,#0b3d30);-webkit-background-clip:text;background-clip:text;color:transparent!important;letter-spacing:.2px}
#login .lg-sub{margin-top:-4px!important}
/* تبويبات الدخول: ملوّنة وواضحة */
#login.picked .lg-pick{display:none!important}
#login:not(.picked) .lg-pick{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important;width:100%}
#login .lgp-c{border:0!important;color:#fff!important;padding:16px 6px 14px!important;border-radius:20px!important;position:relative;overflow:hidden;box-shadow:0 8px 20px -6px var(--sh),0 2px 0 rgba(255,255,255,.25) inset!important;transition:transform .14s ease,box-shadow .14s ease!important;-webkit-tap-highlight-color:transparent;min-width:0}
#login .lgp-c::after{content:"";position:absolute;inset:0;background:radial-gradient(120px 60px at 70% 0,rgba(255,255,255,.28),transparent 70%);pointer-events:none}
#login .lgp-c:nth-child(1){background:linear-gradient(160deg,#21a179,#0f6b51)!important;--sh:rgba(16,107,81,.55)}
#login .lgp-c:nth-child(2){background:linear-gradient(160deg,#2f7fd0,#174f94)!important;--sh:rgba(23,79,148,.55)}
#login .lgp-c:nth-child(3){background:linear-gradient(160deg,#e0a93a,#a8711a)!important;--sh:rgba(168,113,26,.55)}
#login .lgp-c:hover{transform:translateY(-2px)}#login .lgp-c:active{transform:scale(.97)}
#login .lgp-c .lgp-i{background:rgba(255,255,255,.18)!important;color:#fff!important;box-shadow:none!important;border:1px solid rgba(255,255,255,.35)!important}
#login .lgp-c b{color:#fff!important;font-size:clamp(14px,4vw,16.5px)!important;line-height:1.35!important;overflow-wrap:anywhere;white-space:normal}
#login .lgp-c>span:last-child{color:rgba(255,255,255,.88)!important;font-size:12px!important;white-space:normal}
#login .lg-tabs button[aria-selected="true"]{background:linear-gradient(160deg,#1d6b55,#0f4d3c)!important;color:#fff!important}
#login .lg-go{background:linear-gradient(160deg,#1f8a6a,#0f4d3c)!important;box-shadow:0 8px 18px -6px rgba(15,77,60,.6)!important;font-size:17px!important}
/* نبذة المدرسة */
.hm215i{width:100%;display:grid;gap:10px;text-align:right}
.hm215i .ab{padding:14px 15px;border-radius:18px;background:#fff;border:1px solid #e3e9e5;box-shadow:0 2px 12px rgba(23,74,61,.05)}
.hm215i h3{margin:0 0 6px;font:700 15.5px/1.4 var(--f-display);color:#0f4d3c;display:flex;align-items:center;gap:7px}
.hm215i h3::before{content:"";width:5px;height:17px;border-radius:3px;background:linear-gradient(180deg,var(--h215gold2),var(--h215gold))}
.hm215i p{margin:0;font-size:14px;line-height:1.85;color:#33433d}
.hm215g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.hm215g .c{padding:12px 13px;border-radius:16px;background:#fff;border:1px solid #e3e9e5;display:grid;gap:3px;min-width:0}
.hm215g .c small{font-size:11.5px;color:#6b7d76;font-weight:600}
.hm215g .c b{font-size:14.5px;color:#14231e;line-height:1.5;overflow-wrap:anywhere}
.hm215g .c.w{grid-column:1/-1}
.hm215t{display:grid;gap:6px;margin-top:4px}
.hm215t div{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 12px;border-radius:12px;background:#f3f8f5;font-size:14px}
.hm215t div b{color:#0f4d3c}.hm215t div span{direction:rtl;font-weight:700;color:#1b2a25;white-space:nowrap}
.hm215t div em{font-style:normal;font-size:11px;color:#8a7440;background:#fbf1d9;border-radius:99px;padding:2px 8px;margin-inline-start:6px}
.hm215t .fr{background:#fafafa;color:#7b8a84}
#login.picked .hm215i,#login.picked .hm215q{display:none}
#login.picked .hm215lg img{width:clamp(70px,20vw,96px)}
@media (min-width:900px){.hm215g{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:360px){#login .lg-pick{gap:7px!important}#login .lgp-c{padding:13px 3px 11px!important;border-radius:16px!important}.hm215g{grid-template-columns:1fr}}
`;

  function ensureCss() {
    if (D.getElementById("css215h")) return;
    const st = D.createElement("style"); st.id = "css215h"; st.textContent = CSS; (D.head || D.documentElement).appendChild(st);
    /* خط أميري للآية والبسملة — ينحفظ بالجهاز بعد أول مرة، وبدون إنترنت يستعمل النسخ */
    on(() => { if (!D.getElementById("amiri215")) { const l = D.createElement("link"); l.id = "amiri215"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap"; D.head.appendChild(l); } });
  }
  function ensureBar() {
    if (D.getElementById("hm215bar")) return;
    const txt = "الحمد لله والشكر لله ربِّ العالمين دائماً وأبداً";
    const one = `<span>${txt}<i>✦</i></span>`;
    const b = D.createElement("div"); b.id = "hm215bar"; b.setAttribute("aria-label", txt); b.setAttribute("role", "marquee");
    b.innerHTML = `<div class="t">${one.repeat(6)}${one.repeat(6)}</div>`;
    D.body.appendChild(b);
    /* v229b (طلب المستخدم: «الشريط سريع جداً ولا يُقرأ»): سرعة ثابتة هادئة ≈ ٢٢ بكسل/ثانية مهما كان عرض الشاشة */
    const sp = () => { try { const t = b.firstChild, w = t.scrollWidth / 2; if (w > 50) t.style.animationDuration = Math.round(w / 22) + "s"; } catch (e) { } };
    sp(); setTimeout(sp, 1500); if (D.fonts && D.fonts.ready) D.fonts.ready.then(sp);
  }
  function heroHTML() {
    return `<div class="hm215h">
  <div class="hm215lg">
    <figure><img src="${LOGO_S}" alt="شعار إعدادية سيناء للبنين" width="300" height="300" decoding="async" onerror="this.onerror=null;this.src='img/logo_s.png'"></figure>
    <figure><img src="${LOGO_M}" alt="شعار وزارة التربية العراقية" width="300" height="300" decoding="async" onerror="this.onerror=null;this.src='img/logo_m.png'"></figure>
  </div>
  <div class="hm215q" data-nodate>
    <span class="bs">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
    <span class="ay"><b>﴿</b>وَشَجَرَةً تَخْرُجُ مِنْ طُورِ سَيْنَاءَ تَنْبُتُ بِالدُّهْنِ وَصِبْغٍ لِلْآكِلِينَ<b>﴾</b></span>
    <span class="src">سورة المؤمنون — الآية ٢٠</span>
  </div>
</div>`;
  }
  function infoHTML() {
    const S = (typeof SCHOOL != "undefined" && SCHOOL) || {};
    const H = hours();
    const yr = AD(S.founded || "1968");
    const addr = [S.gov || "بغداد", S.qadha || "الرصافة", S.hay || "باب الشيخ"].filter(Boolean).join(" — ") + (S.near ? "، " + S.near : "");
    return `<div class="hm215i">
  <div class="ab"><h3>نبذة عن المدرسة</h3><p>إعدادية سيناء للبنين (ثانوية سيناء للبنين سابقاً) مدرسة حكومية تابعة إلى ${S.dir || "المديرية العامة لتربية بغداد الرصافة الأولى"}، تأسست عام ${yr}، وتضم الصفوف الرابع والخامس والسادس الإعدادي بفرعيها العلمي والأدبي، وتسعى إلى تقديم تعليم رصين وبيئة تربوية منضبطة تُعِدّ طلبتها للدراسة الجامعية وخدمة المجتمع.</p></div>
  <div class="ab"><h3>أوقات الدوام</h3><div class="hm215t">${H.map(h => `<div><b>${h.days}</b><span>${h.a} – ${h.b}${h.pm ? "<em>مسائي</em>" : "<em>صباحي</em>"}</span></div>`).join("")}<div class="fr"><b style="color:#7b8a84">الجمعة – السبت</b><span style="color:#7b8a84">عطلة</span></div></div></div>
  <div class="hm215g">
    <div class="c"><small>تاريخ التأسيس</small><b>${yr}</b></div>
    <div class="c"><small>المدرسة المزدوجة معها</small><b>متوسطة التفاؤل للبنين</b></div>
    <div class="c w"><small>العنوان</small><b>${addr}</b></div>
    <div class="c w"><small>الجهة التابعة لها</small><b>${S.dir || "المديرية العامة لتربية بغداد الرصافة الأولى"}</b></div>
  </div>
</div>`;
  }
  function mount() {
    const L = D.getElementById("login"); if (!L) return;
    const lg = L.querySelector(".lg"); if (!lg) return;
    ensureCss(); ensureBar();
    if (!lg.querySelector(".hm215h")) { const h = D.createElement("div"); h.innerHTML = heroHTML(); const t = lg.querySelector("#lgt") || lg.firstChild; lg.insertBefore(h.firstElementChild, t); }
    let inf = lg.querySelector(".hm215i");
    const anchor = D.getElementById("lgx120") || D.getElementById("lgpick");
    if (!inf && anchor) { const h = D.createElement("div"); h.innerHTML = infoHTML(); inf = h.firstElementChild; anchor.after(inf); }
    vis();
  }
  /* الشريط يبين بس بالواجهة الرئيسية (شاشة الدخول) */
  function vis() {
    const L = D.getElementById("login");
    const shown = !!(L && !L.hidden && L.getClientRects().length && getComputedStyle(L).display != "none" && getComputedStyle(L).visibility != "hidden");
    D.body.classList.toggle("hm215on", shown);
  }
  W.hm215 = mount;
  on(() => { if (typeof mountShell == "function") { const _m = mountShell; mountShell = function () { const r = _m.apply(this, arguments); on(mount); return r; }; } });
  on(() => { if (typeof lgCards120 == "function") { const _c = lgCards120; lgCards120 = function () { const r = _c.apply(this, arguments); on(mount); return r; }; } });
  const go = () => { on(mount); setInterval(() => on(vis), 700); };
  if (D.readyState == "loading") D.addEventListener("DOMContentLoaded", go); else go();
})();
