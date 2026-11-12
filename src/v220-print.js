/* v220 (2026-11-09، طلب المستخدم: «الخط صغير وتعبان» + الصفحة مقطوعة من اليسار بالمعاينة)
   1) جداول الطباعة (أسماء المدرسين، أسماء الملاك، الإحصائيات وكل قوائم mList/sheet137):
      الخط يكبر وحده لحد ما يملي الصفحة (grow) — إذا القائمة صفحة وحدة. الأطول تبقى مثل ما هي.
   2) المعاينة (pv91): الصفحة ما تنقطع من اليسار بعد التكبير (التمرير يوصل للحافتين)،
      والصفحة أعرض بالشاشة الكبيرة، وما يطلع شي من النظام (سطر «تم تصميمه…») فوك الصفحة. */
(function () {
  "use strict";
  const W = window;
  const GV = n => { try { return (0, eval)("typeof " + n + "!='undefined'?" + n + ":undefined"); } catch (e) { return undefined; } };
  const on = f => { try { f(); } catch (e) { console.warn("v220", e); } };

  /* --- 1) خط أكبر بالجداول --- */
  on(() => {
    if (typeof pSheet != "function") return;
    const _ps = pSheet;
    const big = m => m && typeof m == "object" && Array.isArray(m.rows) && !m.bs && !m.grow && !m.noBig && (m.hr || 0) <= 2;
    pSheet = async function (D, m) {
      if (big(m)) {
        const port = (m.orient || "landscape") == "portrait";
        /* كل الخانات بخط عريض (أوضح بالطباعة)، حشوة أقل حتى الخط ياخذ المكان بدل الفراغ */
        const rows = m.rows.map((r, i) => !Array.isArray(r) ? r : r.map(c => c == null ? c : typeof c == "object" ? (c.sep ? c : { ...c, b: 1 }) : { v: c, b: 1 }));
        /* v220f: سقف للخط (١٣٫٥ عمودي / ١٣ بالعرض) — القائمة القصيرة چانت تكبر لحد ٢٢ والأعمدة تلتف («مو لهالدرجة») */
        const fs0 = Math.max(m.fs || 9, port ? 11.5 : 11), cap = port ? 13.5 : 13;
        m = { ...m, rows, grow: Math.max(1, Math.min(2.2, cap / fs0)), fs: fs0, drh: 0, pad: Math.min(m.pad ?? 1, .55), __v220: port ? 11 : 10.5 };
        /* رأس الورقة (اسم المديرية) أعرض حتى «الرصافة الأولى» ما تنكسر لسطرين */
        try { const b = m.brand || (typeof stdBrand == "function" ? stdBrand(m) : null); if (b && !(b.w > .3)) m.brand = { ...b, w: port ? .33 : .3 }; } catch (e) { }
        /* عرض الأعمدة حسب أطول نص بكل عمود (عمود الاسم ما يبقى فراغ كبير وباقي الأعمدة مضغوطة) */
        try {
          const len = c => c == null ? 0 : String(typeof c == "object" ? (c.v ?? "") : c).split("\n").reduce((a, l) => Math.max(a, l.trim().length), 0);
          const simple = rows.every(r => Array.isArray(r) && r.length == rows[0].length && r.every(c => !(c && typeof c == "object" && ((c.cs || 1) > 1 || (c.rs || 1) > 1))));
          if (simple && rows[0].length > 1) {
            const hr = m.hr || 1, n = rows[0].length;
            const ww = Array.from({ length: n }, (_, j) => {
              let body = 0; for (let i = hr; i < rows.length; i++) body = Math.max(body, len(rows[i][j]));
              let head = 0; for (let i = 0; i < hr; i++) head = Math.max(head, ...String((rows[i][j] && rows[i][j].v) ?? rows[i][j] ?? "").split(/\s+/).map(w => w.length));
              return Math.max(2.2, Math.min(36, Math.max(body, head * 1.15))) + 2.2;
            });
            m.ww = ww;
          }
        } catch (e) { }
      }
      return _ps.call(this, D, m);
    };
    /* حد أدنى للخط: التصغير حتى تنحشر القائمة بصفحة وحدة ما ينزل تحت هذا الحجم — الزايد يكمل بصفحة ثانية */
    if (typeof pTable == "function") {
      const _pt = pTable;
      pTable = function (D, m, dry) {
        if (m && m.__v220 && (m.fs || 9) < m.__v220) m = { ...m, fs: m.__v220 };
        return _pt.call(this, D, m, dry);
      };
    }
  });

  /* --- 2) المعاينة --- */
  on(() => {
    const st = document.createElement("style");
    st.id = "css220";
    st.textContent = `
.pv91-pages{direction:ltr;justify-items:safe center;justify-content:safe center;overflow:auto}
.pv91-pages img{width:calc(min(100%,1150px) * var(--z,1))!important;max-width:none!important;flex:none}
body:has(.pv91){overflow:hidden}
body:has(.pv91) .credit,body:has(.pv91) .prfb{visibility:hidden}
.pv91{isolation:isolate}`;
    document.head.appendChild(st);
    /* التكبير يبقي نفس النقطة بالوسط بدل ما يقفز */
    document.addEventListener("click", e => {
      const b = e.target.closest && e.target.closest(".pv91 [data-a='z'],.pv91 [data-a='o']"); if (!b) return;
      const box = document.querySelector(".pv91-pages"); if (!box) return;
      const fx = (box.scrollLeft + box.clientWidth / 2) / Math.max(1, box.scrollWidth), fy = (box.scrollTop + box.clientHeight / 2) / Math.max(1, box.scrollHeight);
      requestAnimationFrame(() => { box.scrollLeft = fx * box.scrollWidth - box.clientWidth / 2; box.scrollTop = fy * box.scrollHeight - box.clientHeight / 2; });
    }, true);
  });
})();

/* v220b (2026-11-09، بلاغ: «المدرس فتح التطبيق هيج يصير عنده» — شاشة الدخول طالعة برة الشاشة ومقطوعة من اليسار)
   السبب: الهاتف مكبّر خط النظام (إعدادات الهاتف) فالنص يكبر، و#login شبكة عمودها بحجم المحتوى (auto)
   فصارت أعرض من الشاشة (٤٦٢ بدل ٣٦٠). الحل: كل الأعمدة minmax(0,1fr) وكل شي داخلها ما يتجاوز العرض. */
(function () {
  try {
    const st = document.createElement("style");
    st.id = "css220b";
    st.textContent = `
html,body{max-width:100%;overflow-x:hidden}
#login{grid-template-columns:minmax(0,1fr)!important}
#login>.lg,.lg{width:100%!important;max-width:560px!important;min-width:0!important;grid-template-columns:minmax(0,1fr)!important;box-sizing:border-box}
.lg>*{max-width:100%!important;min-width:0!important;box-sizing:border-box}
#login *,.lg *{min-width:0}
.hm215t>div{display:flex!important;flex-wrap:wrap!important;gap:4px 8px;justify-content:space-between;align-items:center}
.hm215t>div>*{min-width:0;flex:0 1 auto}
.hm215t>div>span{display:inline-flex;flex-wrap:wrap;gap:4px;align-items:center}
.hm215t em{white-space:nowrap}
#login :is(p,h1,h2,h3,span,b,em,a,div,li){overflow-wrap:break-word}
.lg h1,.lg h2,.lg p,.lg .lg-sub,.lg #lgt,.lg b,.lg span{overflow-wrap:break-word;white-space:normal}
.lgpick{grid-template-columns:repeat(3,minmax(0,1fr))!important;width:100%!important}
.lgp-c{min-width:0!important}
.lgp-c b,.lgp-c>span:last-child{overflow-wrap:anywhere;hyphens:none}
img,svg,video,canvas{max-width:100%}
.lg img{height:auto}
main,#app,.page,.box,.vh{min-width:0;max-width:100%}`;
    document.head.appendChild(st);
  } catch (e) { console.warn("v220b", e); }
})();

/* v220c (2026-11-09، بلاغ: «طلاب ومدرسين يسجلون بمعلومات صحيحة ويطلعلهم غلط» + «محاولات كثيرة غلط»)
   السبب: بعد ما الخادم يقبل الرقمين، الجهاز چان يعيد الفحص بنفسه ويقارن برقم واحد قديم من سجلات المدرسة
   (nid133Truth) — فإذا الإدارة صححت رقم البطاقة (NIDFIX) أو بالسجل رقم قديم، صاحب الرقم الصحيح ينرفض
   ويتحسب محاولة غلط لحد ما ينقفل ربع ساعة. هسه الخادم وحده يقرر (يقبل أي رقم معروف للشخص)،
   والعداد القديم ينمسح. نفس الشي بالتحديث: ما ينقفل حساب مفتوح بسبب هذا الفحص. */
(function () {
  try {
    if (typeof nid133Truth == "function") nid133Truth = function () { return ""; };
    if (typeof nid133Many == "function") nid133Many = function (k, key) { try { const f = JSON.parse(localStorage.getItem("nidf220_" + k + "_" + key) || "null"); return !!(f && f.n >= 8 && Date.now() - f.t < 9e5); } catch (e) { return false; } };
    if (typeof nid133Fail == "function") nid133Fail = function (k, key) { try { const K = "nidf220_" + k + "_" + key; let f = JSON.parse(localStorage.getItem(K) || "null"); if (!f || Date.now() - f.t >= 9e5) f = { n: 0, t: Date.now() }; f.n++; localStorage.setItem(K, JSON.stringify(f)); } catch (e) { } };
    /* العدادات القديمة (اللي انحسبت غلط) تنمسح مرة وحدة */
    try { if (!localStorage.getItem("nidf220_clean")) { Object.keys(localStorage).filter(k => /^nidf_/.test(k)).forEach(k => localStorage.removeItem(k)); localStorage.setItem("nidf220_clean", "1"); } } catch (e) { }
    if (typeof ERRS == "object" && ERRS) {
      ERRS.wrongnid = "رقم البطاقة الموحدة لا يطابق المسجّل في المدرسة لهذا الاسم. تأكد من اختيار اسمك الصحيح ومن أن الرقم مكوّن من ١٢ رقماً من البطاقة نفسها، وإن كنت متأكداً فراجع إدارة المدرسة لتصحيحه.";
      ERRS.locked = ERRS.manynid = "محاولات خاطئة كثيرة على هذا الاسم. انتظر ربع ساعة، أو راجع إدارة المدرسة لفتحه فوراً.";
    }
  } catch (e) { console.warn("v220c", e); }
  /* البوابة بخط الهاتف الكبير: الخانات والصناديق ما تطلع برة الشاشة */
  try {
    const st = document.createElement("style"); st.id = "css220c";
    st.textContent = `
input,select,textarea{min-width:0;max-width:100%;box-sizing:border-box}
.lockf{min-width:0;max-width:100%}
.lockf input{min-width:0!important;width:100%;flex:1 1 160px!important}
#pmain,#pmain *{min-width:0}
#pmain{max-width:100%;overflow-x:hidden}
#pmain p,#pmain h2,#pmain h3,#pmain label,#pmain b,#pmain span{overflow-wrap:break-word}`;
    document.head.appendChild(st);
  } catch (e) { }
})();

/* v220d (2026-11-09، بلاغ: نافذة الطباعة تقطع ورقة «أسماء الملاك» من اليمين واليسار)
   السبب: صورة الصفحة چانت بحجم ثابت بالمليمتر (٢٩٧ × ٢١٠)، فإذا الطابعة/المتصفح خلّى الورقة عمودية
   أو حط حواشي، الصورة تطلع أكبر من الورقة وتنقطع. هسه الصورة تتصغّر وتتوسّط داخل الورقة مهما كان
   اتجاهها أو حواشيها — ما ينقطع شي أبداً. */
(function () {
  try {
    if (typeof printPages != "function" || typeof pgURL != "function" || typeof pgMM != "function") return;
    printPages = async function (D, name, blobF) {
      const imgs = []; for (const p of D.pages) imgs.push([await pgURL(p), ...pgMM(D, p)]);
      const w0 = imgs[0][1], h0 = imgs[0][2];
      const f = document.createElement("iframe");
      f.setAttribute("aria-hidden", "true");
      f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0";
      f.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(name)}</title><style>
@page{size:${w0.toFixed(1)}mm ${h0.toFixed(1)}mm;margin:0}
html,body{margin:0;padding:0;background:#fff}
.pg{width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid}
.pg:last-child{page-break-after:auto;break-after:auto}
.pg img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}
@media screen{.pg{width:${w0.toFixed(1)}mm;height:${h0.toFixed(1)}mm}}
</style></head><body>${imgs.map(([u]) => `<div class="pg"><img src="${u}"></div>`).join("")}</body></html>`;
      const done = () => { setTimeout(() => { f.remove(); imgs.forEach(([u]) => { if (String(u).startsWith("blob:")) URL.revokeObjectURL(u); }); }, 2e3); };
      f.onload = async () => {
        try {
          const d = f.contentDocument;
          await Promise.all([...d.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
          f.contentWindow.addEventListener("afterprint", done);
          f.contentWindow.focus(); f.contentWindow.print(); setTimeout(done, 12e4);
        } catch (e) { console.error(e); done(); blobF().then(b => saveFile(name + ".pdf", b)); }
      };
      document.body.appendChild(f);
      if (typeof prFallback == "function") prFallback(name, blobF);
    };
  } catch (e) { console.warn("v220d", e); }
})();

/* v220e (2026-11-09، فحص شامل): نص التبليغات والبلاغات بالبوابة چان يطلع بأرقام إنكليزية، والسنة
   «2026 - 2027» تنقلب بالسطر العربي وتصير «2027 - 2026». هسه أي رقم بالبوابة ينعرض بالأرقام العربية
   (والسنة تنقرى صح)، عدا الروابط والإيميلات وخانات الكتابة. البيانات نفسها ما تتغيّر — بس العرض. */
(function () {
  try {
    const AR = "٠١٢٣٤٥٦٧٨٩";
    const SKIP = /^(A|INPUT|TEXTAREA|SELECT|OPTION|SCRIPT|STYLE|CODE|PRE|svg|SVG)$/;
    const URLISH = /(https?:\/\/|www\.|@|\.(com|org|net|iq|io|me|dev)\b|t\.me|wa\.me)/i;
    const fixText = t => {
      if (!/[0-9]/.test(t)) return t;
      /* كل كلمة لحالها: الكلمة اللي بيها رابط/إيميل أو حروف إنكليزية ملتصقة تبقى مثل ما هي */
      return t.replace(/\S+/g, w => (URLISH.test(w) || /[A-Za-z][0-9]|[0-9][A-Za-z]/.test(w)) ? w : w.replace(/[0-9]/g, d => AR[d]));
    };
    const walk = root => {
      if (!root) return;
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: n => {
          for (let p = n.parentElement; p && p !== root.parentElement; p = p.parentElement) {
            if (SKIP.test(p.tagName) || p.isContentEditable || (p.dataset && p.dataset.noar != null)) return NodeFilter.FILTER_REJECT;
          }
          return /[0-9]/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      });
      const L = []; while (tw.nextNode()) L.push(tw.currentNode);
      L.forEach(n => { const v = fixText(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; });
    };
    let q = 0;
    const run = () => { q = 0; try {
      const P = document.getElementById("portal");
      if (P && !P.hidden) { walk(P); [...document.body.children].forEach(el => { if (el !== P && !/^(app|login)$/.test(el.id) && !/^(SCRIPT|STYLE)$/.test(el.tagName)) walk(el); }); }
      document.querySelectorAll(".note1,.rt,.rp").forEach(walk);
    } catch (e) { } };
    const sched = () => { if (!q) q = requestAnimationFrame(run); };
    const start = () => {
      const P = document.getElementById("portal");
      new MutationObserver(sched).observe(document.body, { childList: true, subtree: true, characterData: true });
      sched();
    };
    if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  } catch (e) { console.warn("v220e", e); }
})();
