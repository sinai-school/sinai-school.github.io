/* ===== v240 (2026-11-18، بلاغ المستخدم مع صورة «استمارة الفحص الطبي»: سنة التخرج طلعت «٢٠٢٦-٢٠٢٥») =====
   السبب: تصحيح التواريخ (dt207/fixDates207) يشتغل بـ MutationObserver بعد ٦٠ ملي ثانية، بس طباعة/PDF الاستمارات
   (fxDo ← fxBuild ← fxPrint/fxPdf) ترسم الصفحات فوراً قبل ما يوصلها التصحيح، فالقيمة المكتوبة يدوياً تنطبع كما هي.
   وأيضاً الكتابة داخل الخانة (characterData) ما چانت تتصحح على الشاشة بعد الخروج منها.
   الحل: كل نتيجة fxBuild تتصحح فوراً (قبل الرسم)، والخانة تتصحح أول ما يطلع منها المستخدم. البيانات المحفوظة ما تتغيّر. */
(function () {
  "use strict";
  const W = window, on = f => { try { return f(); } catch (e) { console.warn("v240", e); } };
  const fix = el => on(() => { if (el && typeof W.fixDates207 == "function") W.fixDates207(el); });
  function wrap() {
    if (typeof fxBuild != "function" || fxBuild._v240) return !!(typeof fxBuild == "function");
    const prev = fxBuild;
    fxBuild = async function () { const B = await prev.apply(this, arguments); on(() => { fix(B && B.out); (B && B.pages || []).forEach(fix); }); return B; };
    fxBuild._v240 = 1; return true;
  }
  /* v242: كل صفحة تنرسم صورة (الاستمارات، القوالب، خارطة الجلوس، الأوراق المصممة) تمر بـ dxRaster —
     التواريخ تتصحح بنفس اللحظة قبل الرسم، فما يعتمد أي مسار طباعة على الـ MutationObserver. */
  function wrapR() {
    if (typeof dxRaster != "function") return false; if (dxRaster._v242) return true;
    const prevR = dxRaster;
    dxRaster = function (pg) { fix(pg); return prevR.apply(this, arguments); };
    dxRaster._v242 = 1; return true;
  }
  if (!(wrap() & wrapR())) { let n = 0; const t = setInterval(() => { if ((wrap() & wrapR()) || ++n > 40) clearInterval(t); }, 250); }
  document.addEventListener("focusout", e => {
    const el = e.target && e.target.closest && e.target.closest('[contenteditable="true"]');
    if (el && !el.closest(".kf,.kat,input,textarea")) setTimeout(() => { if (!el.contains(document.activeElement)) fix(el); }, 0);
  });
})();
