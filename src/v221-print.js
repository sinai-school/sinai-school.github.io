/* v221 (2026-11-10، بلاغ مع صورة: «أسماء الملاك — داخل قوى العمل» بنافذة الطباعة — الصفحة الأولى فارغة،
   الجدول نازل لآخر الصفحة الثانية ومقطوع، وسطر «تم تصميمه…» مال النظام طالع فوك الجدول)
   السبب الجذري: الطباعة چانت من إطار مخفي (iframe بحجم ٠×٠). Edge/Chrome بالحاسبة يحسبون 100vh داخل
   هذا الإطار غلط (مو ارتفاع الورقة) فالصفحة تنزاح وتنكسر بين ورقتين، وأحياناً يطبعون الصفحة الرئيسية بدل
   الإطار (فيطلع سطر «تم تصميمه…» وغيره). وبتطبيق أندرويد window.print للصفحة الرئيسية بس، فالإطار ما ينطبع أبداً.
   الحل: لا إطار ولا vh. صور الصفحات تنحط بصندوق طباعة داخل الصفحة نفسها (#pr221) وكل شي ثاني يختفي وقت
   الطباعة، وكل صفحة بحجم الورقة بالمليمتر بالضبط (عمودي/بالعرض لكل صفحة لحالها بـ @page مسمّاة)،
   والصورة تتصغّر داخلها (contain) فما ينقطع شي ولا تطلع ورقة فارغة. نفس الشي للاستمارات (fxPrint). */
(function () {
  "use strict";
  const W = window, D0 = document;
  const ST_ID = "css221";
  const BOX = "pr221";

  function baseCss() {
    if (D0.getElementById(ST_ID)) return;
    const st = D0.createElement("style"); st.id = ST_ID;
    st.textContent = `
#${BOX}{display:none}
@media print{
  html.p221{margin:0!important;padding:0!important;background:#fff!important;height:auto!important;min-height:0!important;max-width:none!important;overflow:visible!important;zoom:1!important}
  html.p221>body{display:none!important}
  html.p221>#${BOX}{display:block!important;position:static!important;margin:0!important;padding:0!important;direction:ltr;background:#fff}
  html.p221 #${BOX} .pg221{position:relative;overflow:hidden;margin:0;padding:0;break-inside:avoid;page-break-inside:avoid;break-after:page;page-break-after:always;display:block;box-sizing:border-box}
  html.p221 #${BOX} .pg221:last-child{break-after:auto;page-break-after:auto}
  html.p221 #${BOX} .pg221 img{display:block;width:100%;height:100%;object-fit:contain;object-position:top center}
  html.p221 #${BOX} .dx221{break-after:page;page-break-after:always;break-inside:avoid;page-break-inside:avoid;overflow:hidden;direction:rtl}
  html.p221 #${BOX} .dx221:last-child{break-after:auto;page-break-after:auto}
  html.p221 #${BOX} .dxpg{box-shadow:none!important;margin:0!important}
}`;
    D0.head.appendChild(st);
  }

  let JOB = 0;
  function clean() {
    JOB = 0;
    D0.documentElement.classList.remove("p221");
    const b = D0.getElementById(BOX);
    if (b) { b.querySelectorAll("img").forEach(i => { const u = i.getAttribute("src") || ""; if (u.startsWith("blob:")) setTimeout(() => URL.revokeObjectURL(u), 5e3); }); b.remove(); }
    const s = D0.getElementById(ST_ID + "p"); if (s) s.remove();
  }

  /* يحط المحتوى ويطبع الصفحة نفسها. pages = [{html, w, h}] بالمليمتر (أو pt مع unit) */
  async function printHere(pages, name, extraCss) {
    baseCss(); clean(); const my = ++JOB;
    /* أحجام الصفحات المختلفة: @page مسمّاة لكل حجم (عمودي/بالعرض بنفس المستند) */
    const sizes = []; const key = p => p.w.toFixed(2) + "x" + p.h.toFixed(2) + (p.unit || "mm");
    pages.forEach(p => { if (!sizes.includes(key(p))) sizes.push(key(p)); });
    const css = sizes.map((k, i) => {
      const p = pages.find(q => key(q) == k), u = p.unit || "mm";
      /* ارتفاع الصندوق أقل بشعرة من الورقة حتى التقريب ما يطلع ورقة فارغة بعده */
      return `@page s221_${i}{size:${p.w.toFixed(2)}${u} ${p.h.toFixed(2)}${u};margin:0}
@media print{html.p221 #${BOX} .sz${i}{page:s221_${i};width:${p.w.toFixed(2)}${u};height:calc(${p.h.toFixed(2)}${u} - 0.8mm)}}`;
    }).join("\n");
    /* @page العام = حجم أول صفحة (للمتصفحات اللي ما تفهم الصفحات المسمّاة) */
    const p0 = pages[0], u0 = p0.unit || "mm";
    const st = D0.createElement("style"); st.id = ST_ID + "p";
    st.textContent = `@page{size:${p0.w.toFixed(2)}${u0} ${p0.h.toFixed(2)}${u0};margin:0}\n${css}\n${extraCss || ""}`;
    D0.head.appendChild(st);
    const box = D0.createElement("div"); box.id = BOX; box.setAttribute("aria-hidden", "true");
    box.innerHTML = pages.map(p => p.html.replace("%SZ%", "sz" + sizes.indexOf(key(p)))).join("");
    /* الصندوق ابن <html> مباشرة (برة body): body ينخفي كله وقت الطباعة — تنسيقات النظام على body
       (ارتفاع الشاشة، overflow…) چانت تخلي الطباعة فارغة */
    D0.documentElement.appendChild(box);
    await Promise.all([...box.querySelectorAll("img")].map(i => i.complete ? (i.decode ? i.decode().catch(() => 0) : 0) : new Promise(r => { i.onload = i.onerror = r; })));
    try { await D0.fonts.ready; } catch (e) { }
    if (my != JOB) return;
    const oldT = D0.title; try { D0.title = name || oldT; } catch (e) { }
    D0.documentElement.classList.add("p221");
    const fin = () => { if (my != JOB) return; W.removeEventListener("afterprint", fin); try { D0.title = oldT; } catch (e) { } clean(); };
    W.addEventListener("afterprint", fin);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    try { W.print(); } catch (e) { console.error(e); fin(); throw e; }
    /* print() بالحاسبة يوكف لحد ما تنسد النافذة؛ بالتطبيق/الآيفون يرجع فوراً — ننظف بعد ما تنتهي */
    const ua = navigator.userAgent || "";
    const async = /SinaiSchoolApp|Android|iPhone|iPad/.test(ua);
    setTimeout(fin, async ? 9e4 : 1500);
  }
  W.printHere221 = printHere;

  /* صفحات PDoc (صور) */
  if (typeof printPages == "function" && typeof pgURL == "function" && typeof pgMM == "function") {
    printPages = async function (D, name, blobF) {
      try {
        const pages = [];
        for (const p of D.pages) {
          const u = await pgURL(p), [w, h] = pgMM(D, p);
          pages.push({ w, h, html: `<div class="pg221 %SZ%"><img src="${u}" alt=""></div>` });
        }
        await printHere(pages, name);
      } catch (e) {
        console.error("v221", e);
        try { toast("تعذّرت الطباعة — جارٍ حفظ الملف PDF", "err"); saveFile(name + ".pdf", await blobF()); } catch (e2) { }
      }
    };
  }

  /* الاستمارات والسجلات (صفحات HTML بالقوالب) */
  if (typeof fxPrint == "function" && typeof PAPERZ != "undefined") {
    const _fx = fxPrint;
    fxPrint = async function (B, name, paper) {
      try {
        const z = PAPERZ[paper] || 1;
        const pages = B.pages.map(p => {
          const w = parseFloat(p.style.width) * z, h = parseFloat(p.style.height) * z;
          const c = p.cloneNode(true);
          c.querySelectorAll("[contenteditable]").forEach(e => e.removeAttribute("contenteditable"));
          c.style.zoom = z; c.style.margin = "0"; c.style.boxShadow = "none";
          return { w, h, unit: "pt", html: `<div class="dx221 %SZ%"><div class="dxw">${c.outerHTML}</div></div>` };
        });
        await printHere(pages, name, B.css || "");
      } catch (e) { console.error("v221 fx", e); return _fx.call(this, B, name, paper); }
    };
  }
})();

/* v221b (2026-11-10، صورة ثانية): الأسماء المضافة يدوياً بنافذة «تعديل قبل الطباعة» (هنادي، لمى، مصطفى…)
   تطلع بنص العمود مو بمحاذاة باقي الأسماء — السطر الجديد چان نص فارغ بدون تنسيق العمود.
   هسه كل خانة تاخذ محاذاة/عرض عمودها من باقي السطور، فالسطر المضاف يطلع مثل غيره تماماً. */
(function () {
  "use strict";
  if (typeof pSheet != "function") return;
  const _ps = pSheet;
  pSheet = async function (D, m) {
    try {
      if (m && Array.isArray(m.rows) && m.rows.length > 2) {
        const hr = m.hr || 1, rows = m.rows;
        const n = Math.max(...rows.map(r => Array.isArray(r) ? r.length : 0));
        const same = rows.every((r, i) => i < hr || !Array.isArray(r) || r.length == n);
        if (same) {
          const L = Array.from({ length: n }, (_, j) => {
            let a = 0, t = 0;
            for (let i = hr; i < rows.length; i++) { const c = rows[i][j]; if (c && typeof c == "object" && !c.sep) { t++; if (c.l) a++; } }
            return t > 0 && a * 2 > t;
          });
          if (L.some(Boolean)) m = { ...m, rows: rows.map((r, i) => i < hr || !Array.isArray(r) ? r : r.map((c, j) => !L[j] || c == null ? c : typeof c == "object" ? (c.sep || c.cs > 1 ? c : { ...c, l: 1 }) : { v: c, l: 1 })) };
        }
      }
    } catch (e) { console.warn("v221b", e); }
    return _ps.call(this, D, m);
  };
})();
