/* ===== v242 (2026-11-19، طلب المستخدم: «ليش البوابة والتبليغات والتحديثات تتأخر») =====
   البوابة كانت تسأل الخادم كل ٢٠ ثانية ثابتة. هسه: الشاشة مفتوحة والمستخدم يستعملها (آخر ٣ دقائق) ← كل ٧ ثواني؛
   رجوع الإنترنت ← فوراً. مخفية ← ولا طلب (مثل قبل). الحساب: طلب خفيف (~١ ك.ب)، وحد Workers المجاني بعيد (الاستهلاك ~٥٪). */
(function () {
  "use strict";
  const W = window, D = document;
  let act = Date.now(), last = 0;
  ["pointerdown", "keydown", "touchstart", "wheel", "scroll"].forEach(e => D.addEventListener(e, () => { act = Date.now(); }, { capture: true, passive: true }));
  function wrap() {
    if (typeof W.v202Inbox != "function") return false; if (W.v202Inbox._v242) return true;
    const prev = W.v202Inbox;
    W.v202Inbox = function () { last = Date.now(); return prev.apply(this, arguments); };
    W.v202Inbox._v242 = 1; return true;
  }
  const inPortal = () => { try { return typeof PS != "undefined" && PS && PS.b && PS.key && PS.stage == "in"; } catch (e) { return false; } };
  setInterval(() => {
    try {
      if (!wrap() || D.hidden || navigator.onLine === false || !inPortal()) return;
      if (Date.now() - act < 18e4 && Date.now() - last >= 7000) W.v202Inbox();
    } catch (e) { }
  }, 2500);
  W.addEventListener("online", () => { try { if (wrap() && inPortal()) setTimeout(() => W.v202Inbox(1), 800); } catch (e) { } });
  W.addEventListener("focus", () => { try { if (wrap() && inPortal() && Date.now() - last > 3000) W.v202Inbox(1); } catch (e) { } });
})();
