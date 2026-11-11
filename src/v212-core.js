/* v212 (2026-11-05): ثبات أكثر بدون إنترنت
   (١) قوالب الاستمارات والسجلات (tpl/…) تنحفظ بالجهاز بالخلفية أول ما يدخل الموظف وأكو إنترنت،
       حتى تنفتح وتنطبع بدون إنترنت حتى لو ما انفتحت قبل. وإذا القالب ما ينجاب، يستعمل آخر نسخة محفوظة.
   (٢) عنوان خادم المدرسة الاحتياطي: إذا الإعدادات ما بيها عنوان الخادم، البوابة تبقى شغالة. */
(function () {
  var W = window;
  var API0 = "https://sinai.7svyn82yzr.workers.dev";
  try { if (typeof PC0 != "undefined" && PC0 && !PC0.api) PC0.api = API0; } catch (e) { }
  function fixPC() { try { if (typeof PC != "undefined" && PC && !PC.api) PC.api = API0; } catch (e) { } }
  fixPC(); setInterval(fixPC, 3000);

  var TPL = ["f_books", "f_exa", "f_exs", "f_info", "f_med", "f_mrk", "f_muh", "f_pr12", "f_prf", "f_prm", "f_reg", "j_malak", "j_qw", "n_dir", "o_dir", "r_att", "r_ctl", "r_eval", "r_grd", "r_hr", "r_info", "r_ord"];
  /* الحفظ القديم للقوالب ما چان يشتغل (مفتاح «dxt:» مرفوض بذاكرة المتصفح) — هسه المفتاح رابط عادي */
  var DXC = "sinai-dx", dxKey = function (id, v) { return location.origin + "/__dxt/" + id + "?v=" + encodeURIComponent(v); };
  function dxOld(id) {
    return caches.open(DXC).then(function (c) {
      return c.keys().then(function (ks) {
        var k = ks.filter(function (r) { return String(r.url).indexOf("/__dxt/" + id + "?") >= 0; }).pop();
        return k ? c.match(k).then(function (m) { return m ? m.text() : ""; }) : "";
      });
    }).catch(function () { return ""; });
  }
  if (typeof dxGet == "function" && typeof DX != "undefined") {
    dxGet = function (id) {
      if (DX.mem[id]) return Promise.resolve(DX.mem[id]);
      if (DX.pend[id]) return DX.pend[id];
      var ver = W.DXVER || "1", key = dxKey(id, ver + "-" + (W.APP_VER || ""));
      DX.pend[id] = (async function () {
        try { var c = await caches.open(DXC), m = await c.match(key); if (m) { var t0 = await m.text(); if (t0) return (DX.mem[id] = t0); } } catch (e) { }
        var t = "", err = null;
        var U = ["tpl/" + id + ".html?v=" + ver, "./tpl/" + id + ".html", "https://sinai-school.github.io/tpl/" + id + ".html?v=" + ver];
        if (navigator.onLine !== false) for (var i = 0; i < U.length; i++) {
          try { var r = await fetch(U[i], { cache: "no-cache" }); if (r.ok) { t = await r.text(); if (/class="dxs"/.test(t)) break; t = ""; } } catch (e) { err = e; }
        }
        if (!t) { /* بدون إنترنت: ذاكرة الصفحة نفسها (sw) ثم أي نسخة سابقة محفوظة */
          for (var j = 0; j < U.length && !t; j++) { try { var mm = await caches.match(U[j], { ignoreSearch: true }); if (mm) { var tt = await mm.text(); if (/class="dxs"/.test(tt)) t = tt; } } catch (e) { } }
          if (!t) t = await dxOld(id);
        }
        if (!t) throw err || new Error("tpl");
        try { var c2 = await caches.open(DXC); await c2.put(key, new Response(t, { headers: { "Content-Type": "text/html; charset=utf-8" } })); } catch (e) { }
        return (DX.mem[id] = t);
      })().finally(function () { delete DX.pend[id]; });
      return DX.pend[id];
    };
  }
  var PRE = 0;
  function preload() {
    if (PRE || typeof dxGet != "function") return;
    if (navigator.onLine === false) return;
    if (!(typeof GX != "undefined" && GX && GX.on)) return;
    PRE = 1;
    var i = 0;
    (function nx() {
      if (i >= TPL.length) return;
      if (navigator.onLine === false) { PRE = 0; return; }
      var id = TPL[i++];
      Promise.resolve().then(function () { return dxGet(id); }).catch(function () { }).then(function () { setTimeout(nx, 400); });
    })();
  }
  var go = function () { setTimeout(function () { (W.requestIdleCallback || setTimeout)(preload); }, 4000); };
  if (document.readyState == "complete") go(); else addEventListener("load", go);
  addEventListener("online", function () { PRE = 0; setTimeout(preload, 5000); });
  setInterval(preload, 60000);
})();

/* v212 (٣): السجلات الكبيرة (مثل سجل الأوامر المدرسية ٤٠ صفحة) كانت تعلّك الجهاز ~٢٠ ثانية كل مرة تنفتح
   (ترتيب الصفحات وتصغير الخط خانة خانة). هسه: أول مرة تنرتب عادي، والنتيجة تنحفظ بالجهاز — المرات الجاية تنفتح فوراً.
   المفتاح = محتوى الاستمارة نفسه بعد تعبئة البيانات + الخط + نسخة النظام، فأي تغيير بالبيانات أو القالب يرتبها من جديد. */
(function () {
  var W = window;
  if (typeof dxFit != "function" || typeof dxLayout != "function") return;
  var MEM = new Map(), MAXM = 12, SLOW = 1200;
  function h32(s) { var h = 0x811c9dc5, h2 = 5381; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); h ^= c; h = Math.imul(h, 16777619); h2 = (Math.imul(h2, 33) + c) | 0; } return (h >>> 0).toString(36) + (h2 >>> 0).toString(36) + s.length.toString(36); }
  function fontsOk() { try { return document.fonts && document.fonts.check('12px "Noto Naskh Arabic"') ? 1 : 0; } catch (e) { return 0; } }
  /* IndexedDB صغير للنتائج المحفوظة */
  var dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (ok) {
      try { var r = indexedDB.open("sinai212", 1); r.onupgradeneeded = function () { try { r.result.createObjectStore("lc"); } catch (e) { } }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { ok(null); }; } catch (e) { ok(null); }
    });
    return dbp;
  }
  function idbGet(k) { return db().then(function (d) { if (!d) return null; return new Promise(function (ok) { try { var q = d.transaction("lc").objectStore("lc").get(k); q.onsuccess = function () { ok(q.result || null); }; q.onerror = function () { ok(null); }; } catch (e) { ok(null); } }); }); }
  function idbPut(k, v) { return db().then(function (d) { if (!d) return; try { var tx = d.transaction("lc", "readwrite"), st = tx.objectStore("lc"); st.put(v, k); var cr = st.openCursor(), n = 0, L = []; cr.onsuccess = function () { var c = cr.result; if (!c) { L.sort(function (a, b) { return b[1] - a[1]; }); L.slice(16).forEach(function (x) { try { st.delete(x[0]); } catch (e) { } }); return; } L.push([c.key, (c.value && c.value.t) || 0]); c.continue(); }; } catch (e) { } }); }
  var PRE = {}; /* مفتاح → نتيجة محمّلة مسبقاً من IndexedDB */
  function keyOf(root) { return "L" + h32(root.innerHTML) + "|" + (W.devicePixelRatio || 1) + "|" + fontsOk() + "|" + (W.APP_VER || ""); }
  var _fit = dxFit, _lay = dxLayout;
  dxFit = function (root) {
    var k = null;
    try { if (root && root.querySelector && root.querySelector("section.dxs")) k = keyOf(root); } catch (e) { k = null; }
    if (k) {
      var hit = MEM.get(k) || PRE[k];
      if (hit) { root.__lc212 = hit; return; }
      root.__lk212 = k; root.__lt212 = performance.now();
    }
    return _fit.apply(this, arguments);
  };
  dxLayout = function (host, opt) {
    var noOpt = !opt || !Object.keys(opt).length;
    if (host && host.__lc212 && noOpt) {
      try {
        var t = document.createElement("template"); t.innerHTML = host.__lc212.h;
        var out = t.content.firstElementChild;
        if (out && out.classList.contains("dxpages")) {
          host.querySelectorAll(":scope > section.dxs, :scope > .dxsrc > section.dxs").forEach(function (s) { s.remove(); });
          host.appendChild(out);
          return [].slice.call(out.querySelectorAll(".dxpg"));
        }
      } catch (e) { }
    }
    var r = _lay.apply(this, arguments);
    try {
      if (host && host.__lk212 && noOpt) {
        var took = performance.now() - (host.__lt212 || performance.now());
        var o = host.querySelector(".dxpages");
        if (o && took > SLOW) {
          var v = { h: o.outerHTML, t: Date.now() };
          if (v.h.length < 12e6) {
            MEM.set(host.__lk212, v); if (MEM.size > MAXM) MEM.delete(MEM.keys().next().value);
            idbPut(host.__lk212, v);
          }
        }
      }
    } catch (e) { }
    return r;
  };
  /* قبل ما يبني الاستمارة: نجيب النتيجة المحفوظة من IndexedDB (async) حتى dxFit يلگاها */
  if (typeof fxBuild1 == "function") {
    var _b = fxBuild1;
    var LOADED = 0;
    fxBuild1 = async function () {
      try {
        var d = LOADED ? null : await db(); LOADED = 1;
        if (d) {
          var keys = await new Promise(function (ok) { try { var q = d.transaction("lc").objectStore("lc").getAllKeys(); q.onsuccess = function () { ok(q.result || []); }; q.onerror = function () { ok([]); }; } catch (e) { ok([]); } });
          for (var i = 0; i < keys.length; i++) if (!PRE[keys[i]] && !MEM.has(keys[i])) { var v = await idbGet(keys[i]); if (v && v.h) PRE[keys[i]] = v; }
        }
      } catch (e) { }
      return _b.apply(this, arguments);
    };
  }
})();
