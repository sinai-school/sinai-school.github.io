/* ===== v215 (6 Nov 2026) — التحديث الكبير: ترتيب الأيقونات (الاستمارات بأيقونة وحدة، السجلات بأيقونة وحدة)، حذف التخصيص المتقدم والحسابات التجريبية،
   تبليغ الطالب بغيابه فوراً، حفظ الكتاب الصادر PDF داخل سجل الصادر، البحث بحسابات البوابة والصلاحيات، تنبيه النواقص بنص الشاشة،
   إرجاع استمارة الفحص الطبي للنموذج الأصلي، ومعالجة الحروف المقطوعة بالشاشات الصغيرة ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v215", e); } };
  const E = s => typeof esc == "function" ? esc(s) : String(s == null ? "" : s);
  const I = n => typeof ic == "function" ? ic(n) : "";
  const AD = x => String(x).replace(/[0-9]/g, k => "٠١٢٣٤٥٦٧٨٩"[k]);
  const T0 = (m, k) => on(() => toast(m, k));
  const isOwn = () => !!(W.GXOWN || (typeof TOWN != "undefined" && TOWN && typeof OWN != "undefined" && OWN));
  const gxOn = () => typeof GX != "undefined" && GX && GX.on && GX.tok;

  /* ---------- (٠) الحسابات التجريبية انحذفت: نمسح بقاياها من الجهاز ---------- */
  on(() => { ["tst205", "tst206bs", "tst206bt"].forEach(k => localStorage.removeItem(k)); });

  /* =====================================================================
     (١) ترتيب الأيقونات: كل قسم بمكانه، الاستمارات كلها بأيقونة وحدة والسجلات كلها بأيقونة وحدة
     ===================================================================== */
  const PLAN = [
    ["gs", "شؤون الطلبة", "users", "أسماء الطلبة، المحاولات، الانتساب، الغياب اليومي، القيد العام، الترحيل والخريجون", [["", ["p", "mh", "int70", "a", "q", "pm137", "gr137"]]]],
    ["ge", "الدرجات والنتائج", "chart", "إدخال الدرجات، النتائج والبطاقات، الأرشيف والبوردات", [["", ["g", "r", "z"]]]],
    ["gex", "الامتحانات", "doc", "جداول الامتحانات، خارطة جلوس الطلبة وأرقام القاعات", [["", ["ex", "seat207"]]]],
    ["gt", "الجداول", "cal", "الجدول الأسبوعي، الاحتياط، مراقبة الساحة، جدول المديرية", [["", ["t", "x", "yd", "o"]]]],
    ["gf", "المدرسون والملاك", "teacher", "المدرسون، الملاك، جرد الملاك، جرد القوى العاملة، الرواتب", [["", ["m", "f", "k", "fx:j_qw", "sal"]]]],
    ["gl", "الكتب والمراسلات", "mail", "الكتب الرسمية، نماذج الكتب، الصادر والوارد", [["", ["l", "lt", "y"]]]],
    ["gfm", "الاستمارات", "doc", "كل الاستمارات بمكان واحد: الطلاب، نسب النجاح، الامتحانات", [
      ["استمارات الطلاب", ["s6", "fx:f_reg", "fx:f_info", "fx:f_med", "fx:f_muh", "fx:f_books"]],
      ["نسب النجاح", ["fx:f_prf", "fx:f_pr12", "fx:f_prm"]],
      ["استمارات الامتحانات", ["fx:f_mrk", "fx:f_exa", "fx:f_exs"]]]],
    ["grc", "السجلات", "rec", "كل السجلات بمكان واحد: الطلبة والدرجات، الملاك، المدرسة", [
      ["سجلات الطلبة والدرجات", ["sw", "fx:r_grd", "fx:r_ctl"]],
      ["سجلات الملاك", ["i", "att207"]],
      ["سجلات المدرسة", ["fx:r_info", "fx:r_ord", "fx:r_hr"]]]],
    ["gy", "البوابة والإعدادات", "globe", "الشعب والمواد، البوابة وحساباتها، التطبيق، الصلاحيات، النسخ الاحتياطي", [["", ["c", "w", "pp", "app", "pr", "b"]]]]
  ];
  const DROP = new Set(["adv202", "tst206", "fx_r_att", "n"]);
  let SUBS = {};
  function reorg() {
    if (typeof HUBS == "undefined" || !Array.isArray(HUBS) || typeof NAVI == "undefined") return;
    const has = k => !!(NAVI[k] || (typeof V != "undefined" && V[k]));
    const fx = id => (typeof FXR != "undefined" && FXR[id] && typeof fxView == "function") ? fxView(id) : null;
    const key = k => k && k.startsWith("fx:") ? fx(k.slice(3)) : k;
    const used = new Set(DROP); SUBS = {};
    const out = PLAN.map(([id, n, icn, d, groups]) => {
      const G = groups.map(([t, L]) => [t, L.map(key).filter(k => k && has(k) && !used.has(k) && (used.add(k), 1))]).filter(g => g[1].length);
      SUBS[id] = G;
      return [id, n, icn, d, G.flatMap(g => g[1])];
    });
    /* أي قسم ثاني ما انذكر بالخطة يروح لمجموعته القديمة (ما يضيع) */
    HUBS.forEach(h => (h[4] || []).forEach(k => {
      if (used.has(k) || !has(k)) return; used.add(k);
      const fxk = /^fx_(f|r)_/.exec(k);
      const g = out.find(x => x[0] == (fxk ? (fxk[1] == "f" ? "gfm" : "grc") : h[0])) || out[out.length - 1];
      g[4].push(k); const S = SUBS[g[0]]; (S[S.length - 1] || (S[0] = ["", []]))[1].push(k);
    }));
    HUBS.splice(0, HUBS.length, ...out.filter(h => h[4].length));
    HUBS.forEach(h => {
      TITLE[h[0]] = h[1];
      V[h[0]] = () => {
        on(() => { CURX = null; });
        const card = k => { const x = NAVI[k]; if (!x) return ""; return `<button type="button" class="hubc" onclick="view('${k}')"><span class="hubi">${I(x[2])}</span><b>${E(x[1])}</b><span>${E((typeof HDESC != "undefined" && HDESC[k]) || "")}</span></button>`; };
        const G = SUBS[h[0]] || [["", h[4]]];
        return `<div class="hubhd"><span class="hubi">${I(h[2])}</span><div><h2>${h[1]}</h2><p class="muted">${h[3]}</p></div></div>`
          + G.map(([t, L]) => (t ? `<h3 class="hub215t">${E(t)} <small>${AD(L.length)}</small></h3>` : "") + `<div class="hubg">${L.map(card).join("")}</div>`).join("");
      };
    });
    on(() => { if (typeof NAVG0 != "undefined" && Array.isArray(NAVG0)) { const home = NAVG0[0]; NAVG0.splice(0, NAVG0.length, home, ...HUBS.map(h => [h[1], h[4].map(k => NAVI[k]).filter(Boolean)])); } });
    on(() => { if (typeof HDESC != "undefined") { HDESC.seat207 = "توزيع الطلبة على القاعات، خارطة كل قاعة وورقة رقم القاعة"; } });
    on(() => { delete V.adv202; delete NAVI.adv202; delete V.tst206; delete NAVI.tst206; });
  }
  W.reorg215 = reorg;
  on(() => { if (typeof W.hubOrder207 == "function") { const _h = W.hubOrder207; W.hubOrder207 = function () { const r = _h.apply(this, arguments); on(reorg); return r; }; } });
  const rr = () => on(() => { if (typeof cur != "undefined" && (cur == "home" || HUBS.some(h => h[0] == cur))) render(); });
  [0, 400, 1500, 4000].forEach(t => setTimeout(() => { on(reorg); rr(); }, t));
  /* القسم المحذوف إذا كان مفتوح → الرئيسية */
  on(() => { if (typeof view == "function") { const _v = view; view = function (k) { if (DROP.has(k) && k != "n") k = "home"; return _v.apply(this, [k, ...[].slice.call(arguments, 1)]); }; } });

  /* التخصيص المتقدم انحذف: أي كود/تنسيق إضافي كان مفعّل ينطفي (مدير النظام، مرة واحدة) */
  function custOff() {
    if (!isOwn() || typeof DB == "undefined" || !DB) return;
    if (localStorage.getItem("cust215") == "1") return;
    DB.doc("school/custom").get().then(s => {
      const c = s && s.exists ? s.data() : null;
      if (c && (c.on || c.js || c.css)) return DB.doc("school/custom").set({ css: "", js: "", on: 0, off215: new Date().toISOString() });
    }).then(() => { localStorage.setItem("cust215", "1"); }).catch(() => { });
  }

  /* =====================================================================
     (٢) الغياب: أول ما يتسجل غياب الطالب يوصله تبليغ بعدد غياباته، والبوابة تتحدث خلال ثواني
     ===================================================================== */
  const ABQ = {}; let ABT = 0;
  function absFlush() {
    ABT = 0;
    const days = Object.keys(ABQ); if (!days.length || !gxOn()) return;
    days.forEach(d => {
      const M = ABQ[d]; delete ABQ[d];
      let H = null; on(() => { H = holSet(); });
      const L = Object.keys(M).map(id => { let n = 0; on(() => { n = absN(id, H); }); return [id, n, M[id] == "غ" ? 1 : 0]; });
      if (!L.length) return;
      gxCall({ op: "absN215", d, L }).then(r => { if (r && r.ok && r.sent) T0("وصل تبليغ الغياب للطلاب (" + AD(r.sent) + ")"); }).catch(() => { ABQ[d] = Object.assign(M, ABQ[d] || {}); clearTimeout(ABT); ABT = setTimeout(absFlush, 30000); });
    });
    on(() => { if (W.pub205) W.pub205(); });
  }
  on(() => {
    if (typeof P == "undefined" || typeof P.att != "function") return;
    const _a = P.att;
    P.att = function (date, patch) {
      const r = _a.apply(this, arguments);
      on(() => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !patch) return;
        const today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
        if (date < new Date(Date.parse(today) - 14 * 864e5).toISOString().slice(0, 10)) return; /* تعديل غياب قديم: بدون تبليغ */
        const M = ABQ[date] = ABQ[date] || {};
        for (const id in patch) M[id] = patch[id];
        clearTimeout(ABT); ABT = setTimeout(absFlush, 2500);
      });
      return r;
    };
  });
  /* أي حفظ للغياب ينشر البوابة فوراً (عدد الغيابات يتحدث عند الطالب) */
  on(() => {
    if (typeof q != "function") return;
    const _q = q;
    q = function (path) { const p = _q.apply(this, arguments); on(() => { if (/^attendance\//.test(String(path || "")) && W.pub205) Promise.resolve(p).then(() => W.pub205(), () => { }); }); return p; };
  });

  /* =====================================================================
     (٣) الكتب الصادرة: نسخة PDF من الكتاب تنحفظ داخل سجل الصادر (تنفتح وتنطبع وتنرسل بأي وقت)
     ===================================================================== */
  let LASTPG = null;
  on(() => {
    if (typeof pdfJpegs != "function") return;
    const _p = pdfJpegs;
    pdfJpegs = function (L) { on(() => { LASTPG = { L: L, at: Date.now(), w: arguments[1], h: arguments[2] }; }); return _p.apply(this, arguments); };
  });
  const toImg = pg => new Promise(ok => {
    try {
      const u = URL.createObjectURL(new Blob([pg.jpg], { type: "image/jpeg" })), im = new Image();
      im.onload = () => { try { const k = Math.min(1, 1500 / im.width), c = D.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", .85)); } catch (e) { ok(null); } URL.revokeObjectURL(u); };
      im.onerror = () => { ok(null); URL.revokeObjectURL(u); }; im.src = u;
    } catch (e) { ok(null); }
  });
  async function keepPdf(L) {
    if (!LASTPG || Date.now() - LASTPG.at > 120000 || typeof ML == "undefined") return;
    const m = ML.find(x => x && x.k == "out" && ((L.id && x.lid == L.id) || (String(x.no) == String(L.no) && String(x.date || "").slice(0, 4) == String(L.date || "").slice(0, 4))));
    if (!m) return;
    const pages = LASTPG.L; LASTPG = null;
    const ids = [];
    for (const pg of pages) {
      const d = await toImg(pg); if (!d) continue;
      const id = uid() + uid(); MIMG[id] = d;
      if (typeof DB != "undefined" && DB) { const r = DB.doc("mailimg/" + id); try { await q(r.path, () => retry(() => r.set({ d }))); } catch (e) { continue; } }
      ids.push(id);
    }
    if (!ids.length) return;
    const old = m.pdf215 || [];
    m.imgs = [...ids, ...(m.imgs || []).filter(x => !old.includes(x))];
    m.pdf215 = ids; m.pdfAt215 = new Date().toISOString();
    mPut(m);
    old.forEach(im => on(() => { if (typeof DB != "undefined" && DB) q("mailimg/" + im, () => retry(() => DB.doc("mailimg/" + im).delete())); }));
    T0("حُفظت نسخة PDF من الكتاب بسجل الصادر ✓");
  }
  on(() => {
    if (typeof lAfter70 != "function") return;
    const _a = lAfter70;
    lAfter70 = async function (L) { const r = await _a.apply(this, arguments); try { await keepPdf(L); } catch (e) { console.warn(e); } return r; };
  });
  /* فتح نسخة PDF المحفوظة من سجل الصادر */
  W.mPdf215 = async mid => {
    const m = (typeof ML != "undefined" ? ML : []).find(x => x.id == mid); if (!m || !(m.pdf215 || []).length) return;
    T0("جارٍ تجهيز PDF…");
    const pages = [];
    for (const id of m.pdf215) {
      const d = await mImgGet(id); if (!d) continue;
      const im = new Image(); await new Promise(ok => { im.onload = im.onerror = ok; im.src = d; });
      const b = Uint8Array.from(atob(d.split(",")[1]), c => c.charCodeAt(0));
      pages.push({ jpg: b, w: im.naturalWidth, h: im.naturalHeight });
    }
    if (!pages.length) return T0("تعذّر فتح النسخة — تحتاج إلى إنترنت في المرة الأولى", "err");
    const blob = pdfJpegs(pages, 595.28, 841.89), nm = "كتاب صادر " + AD(m.no || "") + " — " + String(m.subj || "").slice(0, 40);
    try { await saveFile(nm + ".pdf", blob, { print: () => lPrintPdf70(blob, nm) }); } catch (e) { await saveFile(nm + ".pdf", blob); }
  };
  on(() => {
    if (typeof mDetail != "function") return;
    const _md = mDetail;
    mDetail = function () {
      let h = _md.apply(this, arguments);
      on(() => {
        const m = ML.find(x => x.id == MSEL); if (!m || !(m.pdf215 || []).length) return;
        const b = `<button class="btn sm" onclick="mPdf215('${m.id}')">${I("doc")} نسخة PDF المحفوظة</button>`;
        if (h.includes("فتح الكتاب وتعديله")) h = h.replace(/(<button class="btn sm" onclick="mOpen207\('[^']*'\)">)/, b + "$1");
        else h = h.replace(/(<div class="box"><h3>صور الكتاب)/, `<div class="box"><div class="tools">${b}</div></div>$1`);
      });
      return h;
    };
  });

  /* =====================================================================
     (٤) البحث بحسابات البوابة (الطلاب والمدرسين) وبحسابات الملاك والصلاحيات — للوصول السريع وتعديل معلومات الدخول
     ===================================================================== */
  const norm = s => String(s || "").replace(/[أإآا]/g, "ا").replace(/[ىي]/g, "ي").replace(/ة/g, "ه").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632).toLowerCase();
  const SRCH = {};
  /* البحث يفلتر صفوف كل الجداول بالقسم المفتوح — مربع البحث ينحط فوق القسم بدون ما يغيّر ترتيب المحتوى */
  W.srch215 = (inp, k) => {
    SRCH[k] = inp.value; const v = norm(inp.value).trim().split(/\s+/).filter(Boolean);
    const root = inp.closest("main,#view,.view,#app") || D.body;
    let n = 0;
    root.querySelectorAll("table tr").forEach(tr => { if (!tr.querySelector("td") || tr.closest(".srch215")) return; const ok = !v.length || v.every(w => norm(tr.textContent).includes(w)); tr.style.display = ok ? "" : "none"; if (ok) n++; });
    const c = inp.parentNode.querySelector(".srch215n"); if (c) c.textContent = v.length ? AD(n) + " نتيجة" : "";
  };
  const srchBox = (k, ph) => `<div class="srch215"><span>${I("search")}</span><input type="search" placeholder="${ph}" value="${E(SRCH[k] || "")}" oninput="srch215(this,'${k}')" autocomplete="off"><em class="srch215n"></em></div>`;
  function wrapSearch(name, k, ph, test) {
    on(() => {
      if (typeof V == "undefined" || typeof V[name] != "function") return;
      const _v = V[name];
      V[name] = function () {
        let h = _v.apply(this, arguments);
        on(() => {
          if (typeof h != "string" || (test && !test()) || !/<table/.test(h)) return;
          /* بعد العنوان مباشرة (أول </div> بعد class="vh") وإلا بالبداية */
          const a = h.indexOf('class="vh"'), b = a >= 0 ? h.indexOf("</div>", a) : -1;
          h = b >= 0 ? h.slice(0, b + 6) + srchBox(k, ph) + h.slice(b + 6) : srchBox(k, ph) + h;
          if (SRCH[k]) setTimeout(() => { const x = D.querySelector(".srch215 input"); if (x) W.srch215(x, k); }, 0);
        });
        return h;
      };
    });
  }
  wrapSearch("pp", "pp", "ابحث بالاسم أو رقم الهاتف أو البطاقة…", () => typeof APIT == "undefined" || APIT == "a" || APIT == "p");
  wrapSearch("pr", "pr", "ابحث باسم الموظف أو اسم المستخدم…");
  /* إخفاء خيار «الطالب/المدرس التجريبي» من قوائم الإرسال */
  on(() => {
    ["pp", "w"].forEach(nm => {
      if (typeof V == "undefined" || typeof V[nm] != "function") return;
      const _v = V[nm];
      V[nm] = function () { let h = _v.apply(this, arguments); if (typeof h == "string") h = h.replace(/<option[^>]*>[^<]*التجريبي[^<]*<\/option>/g, ""); return h; };
    });
  });

  /* =====================================================================
     (٥) البوابة: اللي ما مكمّل معلوماته تطلعله نافذة بنص الشاشة (كل دخول) — والصورة/المعلومات تنكمل بضغطة
     ===================================================================== */
  let MISS_SHOWN = "";
  function missModal() {
    if (typeof PS == "undefined" || !PS || PS.stage != "in" || !PS.b || (PS.tab == "f" && PS.edit)) return;
    let L = []; on(() => { L = typeof miss137 == "function" ? miss137() : []; });
    on(() => { if (!L.length && typeof need90 == "function") L = need90(PS.kind, PS.b.profile || {}, PS.b.photo) || []; });
    const k = (PS.kind || "") + ":" + (PS.key || "");
    if (!L.length || MISS_SHOWN == k || D.getElementById("miss215")) return;
    MISS_SHOWN = k;
    const w = D.createElement("div"); w.id = "miss215"; w.className = "miss215";
    w.innerHTML = `<div class="mb" role="dialog" aria-modal="true"><div class="mi">${I("alert")}</div><h3>معلوماتك غير مكتملة</h3><p>لتصلك الدرجات والتبليغات بدون مشاكل، أكمل هذه المعلومات:</p><ul>${L.slice(0, 8).map(x => `<li>${E(x)}</li>`).join("")}${L.length > 8 ? `<li>و${AD(L.length - 8)} غيرها</li>` : ""}</ul><div class="tools"><button class="btn" data-go>${I("edit")} أكمل معلوماتي الآن</button><button class="btn ghost" data-x>لاحقاً</button></div></div>`;
    w.querySelector("[data-go]").onclick = () => { w.remove(); on(() => { PS.tab = "f"; PS.edit = 1; prender(); scrollTo(0, 0); }); };
    w.querySelector("[data-x]").onclick = () => w.remove();
    D.body.appendChild(w);
  }
  on(() => {
    if (typeof prender != "function") return;
    const _p = prender;
    prender = function () { const r = _p.apply(this, arguments); setTimeout(() => on(missModal), 900); return r; };
  });

  /* =====================================================================
     (٦) استمارة الفحص الطبي: ترجع للنموذج الأصلي (التعديل اللي حذف جزء منها ينمسح، مع نسخة احتياطية «إرجاع تعديلاتي»)
     ===================================================================== */
  function medFix(tries) {
    if (!isOwn() || typeof fxDoc != "function" || typeof fxSave != "function") return;
    on(() => { if (typeof fxSub == "function") fxSub(); });
    if (typeof FXD == "undefined" || !Object.keys(FXD).length) { if ((tries || 0) < 20) setTimeout(() => medFix((tries || 0) + 1), 3000); return; }
    const Dm = fxDoc("f_med"); if (!Dm || Dm.r215) return;
    const n = Object.keys(Dm.ov || {}).length + Object.keys(Dm.stpos || {}).length + Object.keys(Dm.pe || {}).length;
    fxSave("f_med", n ? { bak213: { ov: Dm.ov || {}, stpos: Dm.stpos || {}, at: new Date().toISOString() }, ov: {}, stpos: {}, r215: 1 } : { r215: 1 });
    if (n) T0("أُعيدت استمارة الفحص الطبي إلى النموذج الأصلي ✓");
  }

  /* ---------- تشغيل بعد الدخول ---------- */
  let BOOT = 0;
  const boot = () => { if (BOOT || !isOwn()) return; BOOT = 1; setTimeout(() => { on(custOff); on(() => medFix(0)); }, 5000); };
  setInterval(() => on(boot), 3000);

  /* =====================================================================
     (٧) الوضوح بكل الشاشات: الحروف ما تنقطع، الأيقونات مرتبة، العناوين تنلف بدل ما تختفي
     ===================================================================== */
  const st = D.createElement("style"); st.id = "css215";
  st.textContent = `
.hub215t{margin:18px 2px 8px;font:700 15px/1.4 var(--f-display);color:#174a3d;display:flex;align-items:center;gap:8px}
.hub215t::before{content:"";width:5px;height:16px;border-radius:3px;background:var(--gold,#c9a24a)}
.hub215t small{font:600 11.5px/1 var(--f-body,inherit);color:var(--muted);background:#eef5f1;border-radius:99px;padding:3px 8px}
.hubg{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))!important;gap:10px!important}
.hubc{min-width:0!important}
.hubc b,.hubc span,.nv,.nv span,.mbar button,.mbar button span,.tools .btn,.btn,.chip,.vh h2,.hubhd h2,.lgp-c b,.ix span,.lnk span{overflow-wrap:break-word;word-break:normal;hyphens:none}
.tw th,.tw td{overflow-wrap:normal!important;word-break:keep-all}
.tw th{white-space:nowrap}
.tw table:not(.grid):not(.mt) th{background:#1f5c4b!important;color:#fff!important;font-weight:700!important}
table.mt th:not([style*="background"]){background:#1f5c4b!important;color:#fff!important}
.tw td{color:#16241f}
.tw .muted,.tw .sub{color:#5b6b65!important}
.hubc b{white-space:normal!important;text-overflow:clip!important;overflow:visible!important;line-height:1.4!important}
.hubc span:not(.hubi){display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.btn{white-space:normal!important;height:auto!important;min-height:36px;line-height:1.35}
.mbar button span{white-space:nowrap;font-size:11px!important;letter-spacing:-.1px}
input,select,textarea{max-width:100%;min-width:0}
.vh{flex-wrap:wrap;row-gap:4px}.vh h2{min-width:0}
.tools{flex-wrap:wrap}
@media (max-width:380px){.hubg{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.hubc{padding:12px 8px!important}.hubc b{font-size:13.5px!important}}
@media (max-width:640px){#sync>span{display:none!important}#sync{padding:6px!important;min-width:0}#ptitle{font-size:clamp(15px,4.6vw,19px)!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.25!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}#pdate{white-space:nowrap}}
.srch215{display:flex;align-items:center;gap:8px;margin:6px 0 10px;padding:4px 12px;border:1.5px solid var(--line,#dfe6e2);border-radius:14px;background:#fff;box-shadow:0 1px 6px rgba(23,74,61,.05)}
.srch215:focus-within{border-color:#1f6b58;box-shadow:0 0 0 3px rgba(31,107,88,.12)}
.srch215 span{display:grid;color:#1f6b58}.srch215 .ic{width:18px;height:18px}
.srch215 input{flex:1;border:0!important;outline:0;background:transparent!important;font-size:15px;padding:9px 0!important;box-shadow:none!important}
.srch215 em{font-style:normal;font-size:12px;color:var(--muted);white-space:nowrap}
.miss215{position:fixed;inset:0;z-index:99990;display:grid;place-items:center;padding:18px;background:rgba(10,30,24,.48);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);animation:m215 .18s ease}
.miss215 .mb{width:min(400px,100%);background:#fff;border-radius:22px;padding:20px 18px 16px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.25);max-height:86vh;overflow:auto}
.miss215 .mi{width:56px;height:56px;margin:0 auto 6px;border-radius:50%;display:grid;place-items:center;background:#fff4dd;color:#b7791f}.miss215 .mi .ic{width:30px;height:30px}
.miss215 h3{margin:4px 0 4px;font:700 19px/1.4 var(--f-display);color:#7a4b0c}
.miss215 p{margin:0 0 8px;color:#4a5a54;font-size:14px;line-height:1.7}
.miss215 ul{margin:0 0 12px;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.miss215 li{background:#fdf3e1;color:#7a4b0c;border-radius:99px;padding:5px 11px;font-size:13px;font-weight:600}
.miss215 .tools{justify-content:center}
@keyframes m215{from{opacity:0}to{opacity:1}}
`;
  (D.head || D.documentElement).appendChild(st);
})();
/* ===== v215: ملف الطالب — بطاقة كاملة بكل المعلومات + صورة صفحة القيد العام (للإدارة فقط، ما تبين للطالب بالبوابة) ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v215f", e); } };
  const E = s => typeof esc == "function" ? esc(s) : String(s == null ? "" : s);
  const AD = x => String(x == null ? "" : x).replace(/[0-9]/g, k => "٠١٢٣٤٥٦٧٨٩"[k]);
  const I = n => typeof ic == "function" ? ic(n) : "";
  const QW = {};
  function qRec(s) {
    if (typeof QD == "undefined" || !Array.isArray(QD)) return null;
    let r = null;
    on(() => { r = QD.find(x => x && x.sid == s.id) || QD.find(x => { try { const t = qStu(x); return t && t.id == s.id; } catch (e) { return false; } }) || null; });
    return r;
  }
  function card(s) {
    const i = (typeof INF != "undefined" && INF && INF[s.id]) || {};
    const r = qRec(s);
    const dob = i.dob ? (typeof dmy207 == "function" && /^\d{4}-\d{2}-\d{2}$/.test(i.dob) ? dmy207(+i.dob.slice(8), +i.dob.slice(5, 7), +i.dob.slice(0, 4)) : AD(i.dob)) : (s.by ? AD(s.by) : "");
    let st = ""; on(() => { st = nlSt(s); });
    const rows = [
      ["الاسم الرباعي", s.n], ["الصف والشعبة", s.s], ["حالة الطالب", st], ["اسم الأم", i.m || ""], ["المواليد", dob],
      ["رقم البطاقة الموحدة", AD(i.nid || s.nid || "")], ["هاتف ولي الأمر", AD(s.p || "")], ["العنوان", [i.ar, i.ad].filter(Boolean).join(" — ")],
      ["المدرسة السابقة", s.ps || ""], ["رقم الصفحة بالقيد العام", AD(s.pg || (r && r.pg) || "")], ["رقم القيد", AD((r && r.r) || "")], ["الملاحظات", s.nt || ""]
    ];
    let img = "";
    if (r && r.im) {
      const d = (typeof QIMG != "undefined" && QIMG[r.im]) || null;
      if (d) img = `<figure class="pf215i"><img src="${d}" alt="صفحة القيد العام" onclick="qZoom('${E(r.im)}')"><figcaption>صورة صفحة القيد العام — ${AD(r.pg || "")} <small>(للإدارة فقط — لا تظهر للطالب)</small></figcaption></figure>`;
      else if (!QW[r.im]) { QW[r.im] = 1; on(() => qImgGet(r.im).then(() => { if (typeof SPF != "undefined" && SPF == s.id) render(); })); img = `<p class="muted">جارٍ تحميل صورة صفحة القيد…</p>`; }
    }
    const empty = rows.filter(x => !String(x[1] || "").trim()).map(x => x[0]);
    return `<div class="box pf215"><h3>${I("idc")} البطاقة الكاملة للطالب</h3><dl class="kv pf215k">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${String(v || "").trim() ? E(v) : '<span class="muted">—</span>'}</dd>`).join("")}</dl>${empty.length ? `<p class="muted" style="margin:6px 0 0;font-size:12.5px">ناقص: ${empty.map(E).join("، ")}</p>` : ""}${img}</div>`;
  }
  on(() => {
    if (typeof pfBox != "function") return;
    const _p = pfBox;
    pfBox = function () {
      let h = _p.apply(this, arguments);
      on(() => {
        if (!h || typeof SPF == "undefined" || !SPF) return;
        const s = ST.find(x => x.id == SPF); if (!s) return;
        on(() => { if (typeof qSub == "function") qSub(); });
        const c = card(s);
        const k = h.indexOf('<div class="box"', 1);
        h = k > 0 ? h.slice(0, k) + c + h.slice(k) : h + c;
      });
      return h;
    };
  });
  const st = D.createElement("style");
  st.textContent = `.pf215k{display:grid;grid-template-columns:minmax(110px,38%) 1fr;gap:6px 12px;margin:0}.pf215k dt{color:var(--muted);font-size:13px}.pf215k dd{margin:0;font-weight:600;overflow-wrap:anywhere}
.pf215i{margin:12px 0 0;display:grid;gap:6px}.pf215i img{width:100%;max-height:420px;object-fit:contain;border:1px solid var(--line);border-radius:12px;background:#fafafa;cursor:zoom-in}.pf215i figcaption{font-size:12.5px;color:var(--muted)}`;
  (D.head || D.documentElement).appendChild(st);
})();
/* ===== v215b: «درجات المدرسين» — تفاصيل كل إرسال (اسم الطالب ودرجته) + تبليغات المدرسين للطلاب ومرفقاتها ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v215b", e); } };
  const E = s => typeof esc == "function" ? esc(s) : String(s == null ? "" : s);
  const AD = x => String(x == null ? "" : x).replace(/[0-9]/g, k => "٠١٢٣٤٥٦٧٨٩"[k]);
  const I = n => typeof ic == "function" ? ic(n) : "";
  const DET = {}, OPEN = {};
  const FD = v => { const t = Date.parse(v || ""); if (!t) return ""; const d = new Date(t); return typeof dmy207 == "function" ? dmy207(d.getDate(), d.getMonth() + 1, d.getFullYear()) : AD(d.toLocaleDateString()); };
  const sName = k => { let n = ""; on(() => { const s = (typeof ST != "undefined" ? ST : []).find(x => x.id == k); if (s) n = s.n + " — " + s.s; }); return n || k; };
  const tName = k => { let n = ""; on(() => { const f = (typeof STF != "undefined" ? STF : []).find(x => x.id == k); if (f) n = f.name; }); return n; };
  const kOf = r => [r.tkey, r.subj, r.label].join("|");
  const redraw = () => on(() => { const y = scrollY; render(); scrollTo(0, y); });
  W.tg215 = async i => {
    const D0 = (typeof APID != "undefined" && APID) || {}; const r = (D0.tgc || [])[i]; if (!r) return;
    const k = kOf(r); OPEN[k] = !OPEN[k];
    if (OPEN[k] && !DET[k] && r.tkey) {
      DET[k] = "…"; redraw();
      try { const x = await api({ a: "admin", secret: APIK.secret, op: "tgrDet", tkey: r.tkey, subj: r.subj, label: r.label }, APIK.url); DET[k] = x && x.ok ? x.rows : "err"; } catch (e) { DET[k] = "err"; }
    }
    redraw();
  };
  function grBox(D0) {
    const L = D0.tgc || [];
    if (!L.length) return "";
    return `<div class="box tg215"><h3>${I("pen")} تفاصيل الدرجات المرسلة للطلاب</h3><p class="muted" style="margin:0 0 8px">اضغط على أي إرسال لعرض أسماء الطلاب ودرجاتهم.</p>${L.map((r, i) => {
      const k = kOf(r), op = OPEN[k], d = DET[k];
      const body = !op ? "" : !r.tkey ? '<p class="muted">حدّث الصفحة لتُفتح التفاصيل.</p>' : d == "…" ? '<p class="muted">جارٍ التحميل…</p>' : d == "err" ? '<p class="muted">تعذّر التحميل — تأكد من الإنترنت</p>'
        : `<div class="tw"><table><tr><th>ت</th><th class="l">الطالب</th><th>الدرجة</th><th class="l">ملاحظة</th><th>التاريخ</th></tr>${(d || []).map((x, j) => `<tr><td>${AD(j + 1)}</td><td class="l">${E(sName(x.skey))}</td><td><b>${E(AD(x.val))}</b></td><td class="l">${E(x.note || "")}</td><td>${E(FD(x.date))}</td></tr>`).join("")}</table></div>`;
      return `<div class="tg215r"><button type="button" class="tg215h" onclick="tg215(${i})"><span><b>${E(r.tname || tName(r.tkey))}</b><small>${E(r.subj)} — ${E(r.label)}</small></span><span class="chip">${AD(r.n)} طالب</span><span class="chip">${E(FD(r.d))}</span><span class="tg215c">${op ? "▲" : "▼"}</span></button>${body}</div>`;
    }).join("")}</div>`;
  }
  function attHTML(files) {
    let F = []; try { F = typeof files == "string" ? JSON.parse(files || "[]") : (files || []); } catch (e) { F = []; }
    if (!F.length) return "";
    const base = () => { try { return String((APIK && APIK.url) || "https://sinai.7svyn82yzr.workers.dev").replace(/\/$/, ""); } catch (e) { return "https://sinai.7svyn82yzr.workers.dev"; } };
    return `<div class="tg215f">${F.map(f => { const u = f.id ? base() + "/f/" + f.id : (f.u || ""); const img = /^image\//.test(f.m || "") || /\.(jpe?g|png|webp|gif)$/i.test(f.n || ""); return img ? `<a href="${E(u)}" target="_blank" rel="noopener" class="tg215im"><img src="${E(u)}" alt="${E(f.n || "صورة")}" loading="lazy"></a>` : `<a class="btn ghost sm" href="${E(u)}" target="_blank" rel="noopener">${I("doc")} ${E(f.n || "ملف")}</a>`; }).join("")}</div>`;
  }
  function ntBox(D0) {
    const N = (D0.notes || []).filter(n => n.cat == "tch").slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!N.length) return `<div class="box"><h3>${I("mail")} تبليغات المدرسين للطلاب ومرفقاتها</h3><p class="muted" style="margin:0">ما أرسل أي مدرس تبليغ بعد.</p></div>`;
    const seen = D0.seen || {};
    const to = n => n.scope == "sec" ? "شعبة " + n.target : n.scope == "one" ? sName(String(n.target || "").replace(/^s:/, "")) : n.scope == "allS" ? "كل الطلاب" : n.scope == "all" ? "الكل" : (n.target || "");
    return `<div class="box"><h3>${I("mail")} تبليغات المدرسين للطلاب ومرفقاتها (${AD(N.length)})</h3>${N.slice(0, 150).map(n => `<div class="tg215n"><div class="tg215nh"><b>${E(n.title)}</b><span class="chip">${E(n.from || "")}</span></div><p class="sub" style="margin:2px 0">إلى: ${E(to(n))} — ${E(FD(n.date))} — شافه ${AD((seen[n.id] || []).length)}</p>${n.body ? `<p style="margin:4px 0;white-space:pre-line">${E(n.body)}</p>` : ""}${attHTML(n.files)}</div>`).join("")}</div>`;
  }
  on(() => {
    if (typeof ppBody != "function") return;
    const _pb = ppBody;
    ppBody = function (D0) {
      let h = _pb.apply(this, arguments);
      on(() => { if (typeof APIT != "undefined" && APIT == "tg" && D0 && D0.acc && typeof h == "string") h += grBox(D0) + ntBox(D0); });
      return h;
    };
  });
  const st = D.createElement("style");
  st.textContent = `.tg215r{border:1px solid var(--line);border-radius:14px;margin:0 0 8px;overflow:hidden;background:#fff}
.tg215h{all:unset;box-sizing:border-box;width:100%;display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;padding:10px 12px;cursor:pointer}
.tg215h>span:first-child{flex:1 1 180px;display:grid;gap:2px}.tg215h small{color:var(--muted);font-size:12.5px}.tg215c{color:var(--muted);font-size:12px}
.tg215r .tw{margin:0 10px 10px}
.tg215n{border-top:1px solid var(--line);padding:10px 0}.tg215n:first-of-type{border-top:0}.tg215nh{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.tg215f{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}.tg215im img{width:120px;height:120px;object-fit:cover;border-radius:12px;border:1px solid var(--line)}`;
  (D.head || D.documentElement).appendChild(st);
})();
