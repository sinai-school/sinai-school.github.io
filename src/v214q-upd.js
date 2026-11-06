/* ===== v214q (6 Nov 2026) — التحديث الفوري: النظام والبوابة والتطبيق يتحدثون وحدهم خلال ثواني بدون ما تطلع وترجع =====
   قبل: فحص التحديث (chk86) چان يشتغل بس بالنسخة المحفوظة (OFFLINE_COPY)، فالموقع والتطبيق ما يتحدثون إلا بعد فتحتين،
   وGitHub Pages يخلي index.html القديم بذاكرته لحد ١٠ دقايق فالفحص القديم يعلّم النسخة «مجرّبة» ويوكف.
   هسه: كل ٢٠ ثانية (وأول ما ترجع للصفحة) نفحص version.json، ننزّل الصفحة الجديدة (?t= حتى ما تجي القديمة)،
   نحطها بذاكرة sw، ونعيد التحميل أول ما تكون مو دتكتب (المكان يرجع وحده من sessionStorage). بالتطبيق: SinaiApp.siteUpdate. */
(function () {
  "use strict";
  const W = window, D = document;
  if (!/^https?:/.test(location.protocol)) return;
  const CUR = W.APP_VER || "";
  if (!CUR) return;
  const same = (a, b) => !!a && !!b && (a == b || a.indexOf(b + "-") == 0 || b.indexOf(a + "-") == 0);
  const app = () => { try { return !!(W.SinaiApp && W.SinaiApp.isApp && W.SinaiApp.isApp()); } catch (e) { return false; } };
  let busy = 0, ready = "", asked = "", lastAct = Date.now(), waitT = 0;
  ["pointerdown", "keydown", "input", "wheel", "touchstart"].forEach(t => D.addEventListener(t, () => { lastAct = Date.now(); }, { passive: true, capture: true }));

  const typing = () => {
    const a = D.activeElement;
    if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) {
      if (a.isContentEditable || a.tagName == "SELECT" || String(a.value || "").length) return true;
    }
    return false;
  };
  const busyUI = () => {
    if (typing()) return true;
    try { if (W.__holdRL && W.__holdRL()) return true; } catch (e) { }
    if (D.querySelector("#lb206, .av207, #snd206, .prfb")) return true;          /* عارض صور / إرسال */
    if (D.querySelector('input[type=file]:focus')) return true;
    return false;
  };
  const reloadNow = () => {
    if (W.__rl214) return; W.__rl214 = 1;
    try { if (typeof toast == "function") toast("تحديث جديد — جارٍ التطبيق…"); } catch (e) { }
    setTimeout(() => location.reload(), 350);
  };
  const tryReload = () => {
    clearTimeout(waitT);
    if (!ready) return;
    /* إذا الصفحة مخفية نعيد التحميل فوراً (المستخدم ما يشوف)، وإذا ظاهرة ننتظر ٤ ثواني بدون لمس وبدون كتابة */
    if (D.hidden || (!busyUI() && Date.now() - lastAct > 4000)) return reloadNow();
    waitT = setTimeout(tryReload, 2000);
  };

  async function chk(nat) {
    if (busy || W.__rl214 || navigator.onLine === false) return;
    busy = 1;
    try {
      const r = await fetch("version.json?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      if (!j || !j.v || same(j.v, CUR)) return;
      if (app()) {
        /* التطبيق الجديد: هو ينزّل الصفحة ويخزنها داخله، وبعدين ينادي __siteReady */
        try { if (W.SinaiApp.siteUpdate) { if (asked != j.v) { asked = j.v; W.SinaiApp.siteUpdate(); } return; } } catch (e) { }
        /* التطبيق القديم: الصفحة الجديدة تنحفظ داخله لما يرجع للواجهة وينادي __chkUpd — بس وقتها نعيد التحميل */
        if (!nat) return;
        let k = ""; try { k = sessionStorage.getItem("rl214") || ""; } catch (e) { }
        const [kv, kt] = k.split("|");
        if (kv == j.v && Date.now() - (+kt || 0) < 5000) return;
        try { sessionStorage.setItem("rl214", j.v + "|" + Date.now()); } catch (e) { }
        ready = j.v; tryReload(); return;
      }
      const pr = await fetch("index.html?t=" + Date.now(), { cache: "no-store" });
      if (!pr.ok) return;
      const t = await pr.text(), m = t.match(/window\.APP_VER="([^"]*)"/), nv = m ? m[1] : "";
      if (t.length < 2e5 || !nv || same(nv, CUR) || t.indexOf("</html>") < 0) return;   /* بعدها القديمة بالـCDN — نرجع نفحص بعد شوية */
      try {
        if (W.caches) {
          const c = await caches.open("sinai-app-v8");
          await c.put("index.html", new Response(t, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
          await c.put("./", new Response(t, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
          await c.put("__ver", new Response(nv));
        }
      } catch (e) { }
      try { const g = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (g) g.update(); } catch (e) { }
      ready = nv; tryReload();
    } catch (e) {
    } finally { busy = 0; }
  }
  /* التطبيق القديم (onResume) والـsw (upd204) ينادون هذا */
  W.__chkUpd = () => { if (ready) tryReload(); else chk(1); };
  W.__siteReady = v => { if (v && !same(v, CUR)) { ready = v; tryReload(); } };

  setTimeout(chk, 3000);
  setInterval(() => { if (!D.hidden) chk(); }, 20000);
  D.addEventListener("visibilitychange", () => { if (!D.hidden) { if (ready) tryReload(); else chk(); } else if (ready) reloadNow(); });
  W.addEventListener("online", chk);
  W.addEventListener("focus", () => { if (!ready) chk(); });
})();
