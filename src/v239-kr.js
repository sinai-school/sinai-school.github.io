/* ===== v239 (2026-11-18، طلب المستخدم: «اعتمد هذا القالب حصراً للكراس الإحصائي بدل القديم، واملأه
   بالمعلومات تلقائياً، وخلِّ التعديل عليه سهلاً وسلساً — القالب طبق الأصل») =====
   الكراس الإحصائي = «مجموعة الاستمارات الإحصائية للتعليم الثانوي للسنة الدراسية 2026-2027» (١٦ صفحة) بدل
   «السجل الإحصائي» القديم (V.i).
   - طبق الأصل: كل صفحة صورة القالب نفسه (tpl/kr/pNN.png، ٢٠٠ نقطة بالإنج) وفوقها خانات الكتابة بمكان كل
     مربع فارغ بالضبط (tpl/kr239.json: [x,y,w,h,المفتاح] بالنقطة، صفحة 842×595 بالعرض). المربعات انكشفت
     آلياً من القالب (كل مساحة بيضاء مغلقة وفارغة)، والمفاتيح (s.name, r.15.4s.m, f5.4s.sec.m …) مسمّاة يدوياً.
   - التعبئة التلقائية من النظام: الطلبة (STA — بدون المحاولات، مثل قوائم الشعب)، المواليد (INF.dob ثم s.by ثم
     أول ٤ أرقام البطاقة)، الشعب، الملاك (المستمر/المنسب/المجاز)، ومعلومات المدرسة والبناية والتجهيزات من
     السجل القديم. المجاميع معادلات (F) تُحسب من الخانات نفسها — أي تعديل يدوي يحدّث المجاميع فوراً.
   - التعديل: اضغط أي خانة واكتب (يُحفظ تلقائياً بـ forms/kr239)، خانات «✓» بضغطة، نص حر بأي مكان،
     «تلقائي» لخانة واحدة أو «إرجاع الكل» (مع نسخة لاسترجاع التعديلات).
   - الطباعة/PDF/صورة: كل صفحة تنرسم على canvas (القالب + القيم بنفس الخط والمقاس) + الختم والتوقيع
     باختيار المستخدم (stAsk120) عند «اسم وتوقيع مدير المدرسة». */
(function () {
  "use strict";
  const W = window, D0 = document, ID = "kr239", AY = 2026, VER = "239a";
  const on = (f, d) => { try { return f(); } catch (e) { console.warn("v239", e); return d; } };
  const AD = x => String(x == null ? "" : x).replace(/[0-9]/g, k => "٠١٢٣٤٥٦٧٨٩"[k]);
  const LD = x => String(x == null ? "" : x).replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));
  const E = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const I = n => on(() => ic(n), "");
  const T0 = (m, k) => on(() => toast(m, k));
  const FF = 'Arial,"Noto Sans Arabic","Noto Naskh Arabic",Tahoma,sans-serif';
  const PN = ["الغلاف", "المقدمة", "التعليمات (١)", "التعليمات (٢)", "الخلاصة التدقيقية", "استمارة ١", "استمارة ٢", "استمارة ٣", "تابع استمارة ٣", "استمارة ٥", "ملحق استمارة ٦", "استمارة ٧", "استمارة ٨", "استمارة ٩", "استمارة ١٠", "استمارة ١١"];
  const NM = "الكراس الإحصائي ٢٠٢٦‏-‏٢٠٢٧";

  /* ---------------- القالب ---------------- */
  let MAP = null, MAPP = null;
  const imgU = p => "tpl/kr/p" + String(p + 1).padStart(2, "0") + ".png?v=" + VER;
  function load() {
    if (MAP) return Promise.resolve(MAP);
    return MAPP = MAPP || (async () => {
      let t = null;
      for (const u of ["tpl/kr239.json?v=" + VER, "tpl/kr239.json", "https://sinai-school.github.io/tpl/kr239.json?v=" + VER]) {
        try { const r = await fetch(u, { cache: "no-cache" }); if (r.ok) { const j = await r.json(); if (j && j.P && j.P.length == 16) { t = j; break; } } } catch (e) { }
      }
      if (!t) { try { const c = await caches.open("sinai-dx"), m = await c.match("/__kr239"); if (m) t = await m.json(); } catch (e) { } }
      if (!t) throw new Error("kr-map");
      try { const c = await caches.open("sinai-dx"); await c.put("/__kr239", new Response(JSON.stringify(t), { headers: { "Content-Type": "application/json" } })); } catch (e) { }
      /* الصور تنحفظ بالجهاز للفتح بدون إنترنت */
      on(() => { if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ t: "keep204", u: t.P.map((_, i) => new URL(imgU(i), location.href).href) }); });
      MAP = t; return t;
    })().catch(e => { MAPP = null; throw e; });
  }
  const IMC = {};
  function imgOf(p) {
    return IMC[p] = IMC[p] || new Promise((ok, no) => { const im = new Image(); im.decoding = "async"; im.onload = () => ok(im); im.onerror = () => { delete IMC[p]; no(new Error("img")); }; im.src = imgU(p); });
  }

  /* ---------------- البيانات المحفوظة ---------------- */
  const doc = () => on(() => fxDoc(ID), {}) || {};
  let OV = null, ADD = null, SVT = 0;
  function st() { if (!OV) { const d = doc(); OV = { ...(d.ov || {}) }; ADD = (d.add || []).map(x => ({ ...x })); } }
  function save(now) {
    clearTimeout(SVT);
    const go = () => on(() => fxSave(ID, { ov: { ...OV }, add: ADD.map(x => ({ ...x })) }));
    if (now) go(); else SVT = setTimeout(go, 500);
  }

  /* ---------------- الحساب من النظام ---------------- */
  const nrm = s => String(s || "").replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[گک]/g, "ك").replace(/ـ/g, "").replace(/\s+/g, " ").trim();
  const GK = s => { const g = nrm(on(() => grp(s), "") || s || ""); const n = /الرابع/.test(g) ? 4 : /الخامس/.test(g) ? 5 : /السادس/.test(g) ? 6 : 0; const b = /العلمي/.test(g) ? "s" : /الادبي/.test(g) ? "l" : /الاسلامي/.test(g) ? "i" : /الفن/.test(g) ? "f" : ""; return n && b ? n + b : ""; };
  const G12 = ["4s", "4l", "4i", "4f", "5s", "5l", "5i", "5f", "6s", "6l", "6i", "6f"];
  const byr = s => {
    const I0 = (typeof INF != "undefined" && INF && INF[s.id]) || {};
    for (const v of [I0.dob, s.by, (I0.x || {}).dob]) { const m = LD(v || "").match(/(19|20)\d\d/); if (m) return +m[0]; }
    const n = LD(I0.nid || "").replace(/\D/g, ""); if (n.length == 12 && /^(19|20)/.test(n)) return +n.slice(0, 4);
    return null;
  };
  const sx = f => on(() => genK(f), "") == "f" ? "f" : "m";
  const stat = f => String(f.status || "مستمر");
  const isTS = f => /مدير|معاون|مدرس|مرشد|معلم/.test(f.job || "");
  const qual = f => {
    const e = on(() => eduK(f.edu), "") || "";
    if (e == "بكالوريوس") return /تربي|ابن رشد|ابن الرشد|ابن الهيثم|اين الهيثم|المعلمين/.test(nrm(f.college)) ? "bt" : "bg";
    return { "دبلوم عالي": "hd", "ماجستير": "ms", "دكتوراه": "phd" }[e] || "oth";
  };
  const SPR = [["psy", /نفس|علوم تربويه|فلسف/], ["isl", /اسلام|شريعه|قران|فقه/], ["ar", /عرب/], ["en", /انكليز|انجليز|انكلز/], ["ku", /كرد/], ["tk", /تركمان/], ["sy", /سريان/], ["ma", /رياضيات/], ["ph", /فيزيا/], ["ch", /كيميا/], ["pe", /رياضه|بدنيه|بدني/], ["bi", /احياء|حياه|علوم/], ["so", /اجتماع/], ["hi", /تاريخ/], ["ge", /جغراف/], ["home", /منزلي/], ["ec", /اقتصاد/], ["ad", /اداره/], ["art", /فنيه|فنون|رسم/], ["fam", /اسري/], ["cs", /حاسوب|حاسبات|كمبيوتر|برمجه/]];
  const spec = f => { const s = nrm(f.spec) || nrm(f.specFull); if (!s) return "oth"; for (const [k, r] of SPR) if (r.test(s)) return k; return "oth"; };
  const admK2 = f => { const t = nrm([f.jtitle, f.job, f.titleOv].join(" ")); return /محاسب/.test(t) ? "acc" : /كاتب/.test(t) ? "clk" : /مختبر/.test(t) ? "lab" : /مكتب/.test(t) ? "lib" : /حارس/.test(t) ? "grd" : /سائق/.test(t) ? "drv" : /فلاح|زراع|بستان/.test(t) ? "frm" : /خدم|منظف/.test(t) ? "srv" : "adm"; };
  const role = f => { const j = nrm(f.job); return /^مدير$/.test(j) ? "dir" : /معاون/.test(j) ? "asst" : /مرشد/.test(j) ? "gd" : "tch"; };
  const svcYr = f => on(() => { const s = svcOf(f.appoint || f.start); return s && !s.future ? s.y : null; }, null);
  const ageYr = f => on(() => ageOf(f), null);
  const marK2 = f => { const m = nrm(f.marital); return /متزوج/.test(m) ? "mar" : /ارمل/.test(m) ? "wid" : /مطلق/.test(m) ? "div" : /اعزب|عزباء/.test(m) ? "sin" : ""; };
  const lvK = f => { const t = nrm([f.lvType, f.lvDur, f.notes].join(" ")); return /طويل|[٤٥45]\s*سن/.test(LD(t)) ? "lng" : /امومه|وضع/.test(t) ? "mat" : /دراسي/.test(t) ? "std" : /مصاحب/.test(t) ? "acc" : /بدون راتب/.test(t) ? "nop" : /مرض/.test(t) ? "sik" : /بعث|زمال/.test(t) ? "bth" : "lng"; };

  function compute() {
    const B = {}, F = {}, N = { noAge: 0, lo: [], hi: [], noSvc: 0, noAgeS: 0 };
    const set = (k, v) => { B[k] = v; }, inc = (k, n) => { B[k] = (+B[k] || 0) + (n || 1); };
    const sum = (k, deps) => { F[k] = deps; };
    const sch = (typeof SCHOOL != "undefined" && SCHOOL) || {};
    const ov1 = (k, d) => { const v = on(() => stOv("f1", k)); return v != null && v !== "" ? v : d; };
    /* ---- معلومات المدرسة ---- */
    const name = ov1("اسم المدرسة", sch.name || "إعدادية سيناء للبنين"), stt = ov1("الرقم الإحصائي", sch.stat || "");
    Object.assign(B, {
      "s.name": name, "s.name2": name, "s.stat": AD(stt), "s.stat2": AD(stt), "s.gov": ov1("المحافظة", sch.gov || "بغداد"),
      "s.gdir": "بغداد الرصافة الأولى", "s.qadha": ov1("القضاء", sch.qadha || ""), "s.nahiya": ov1("الناحية", sch.hay || ""),
      "s.hay": ov1("الحي", sch.hay || ""), "s.mahalla": AD(ov1("المحلة", sch.mahalla || "")), "s.zuqaq": AD(ov1("الزقاق", sch.zuqaq || "")),
      "s.bld": AD(ov1("رقم المبنى", sch.bld || "")), "s.founded": AD(ov1("سنة التأسيس", sch.founded || "")), "s.phone": AD(ov1("رقم الهاتف", sch.phone || "")),
      "s.email": ov1("البريد الإلكتروني", "")
    });
    ["x:own.gov", "x:sex.m", "x:new.n", "x:cls.prep", "x:cls.p.sci", "x:cls.p.lit", "x:env.urb", "x:sh.am", "x:ind.org", "x:dbl.oth", "x:lng.ar", "x:lng.ku"].forEach(k => set(k, "✓"));
    /* ---- الطلبة ---- */
    const L = on(() => STA(), []) || [];
    const has = {}; L.forEach(s => { const g = GK(s.s); if (g) has[g] = 1; });
    const EX = G12.filter(g => has[g]);
    const RNG = { 4: [15, 19], 5: [16, 20], 6: [17, 21] };
    /* استمارة ٢: المستجدون بالرابع (١٥…١٩ فأكثر) */
    ["4s", "4l", "4i", "4f"].filter(g => has[g]).forEach(g => { for (let a = 15; a <= 19; a++) set(`n.${a}.${g}.m`, 0); });
    /* تابع ٣: المسجلون حسب العمر */
    EX.forEach(g => { const [lo, hi] = RNG[g[0]]; for (let a = lo; a <= hi; a++) set(`r.${a}.${g}.m`, 0); });
    for (const s of L) {
      const g = GK(s.s); if (!g) continue;
      const y = byr(s); if (y == null) { N.noAge++; continue; }
      const a0 = AY - y, [lo, hi] = RNG[g[0]];
      const a = Math.max(lo, Math.min(hi, a0));
      if (a0 < lo) N.lo.push(s.n); else if (a0 > hi && g[0] != "6") N.hi.push(s.n);
      inc(`r.${a}.${g}.m`);
      if (g[0] == "4" && !/راسب|مفصول|محاول/.test(String(s.ss || ""))) inc(`n.${Math.max(15, Math.min(19, a0))}.${g}.m`);
    }
    /* المعادلات: استمارة ٢ */
    const G4 = ["4s", "4l", "4i", "4f"], S3 = ["m", "f", "t"];
    for (let a = 12; a <= 19; a++) {
      [...G4, "mid"].forEach(g => sum(`n.${a}.${g}.t`, [`n.${a}.${g}.m`, `n.${a}.${g}.f`]));
      ["m", "f"].forEach(s => sum(`n.${a}.T.${s}`, G4.map(g => `n.${a}.${g}.${s}`)));
      sum(`n.${a}.T.t`, [`n.${a}.T.m`, `n.${a}.T.f`]);
    }
    [...G4, "T", "mid"].forEach(g => S3.forEach(s => { const A = []; for (let a = 12; a <= 19; a++) A.push(`n.${a}.${g}.${s}`); sum(`n.T.${g}.${s}`, A); }));
    /* تابع ٣ */
    const C9 = [...G12.flatMap(g => [`${g}.m`, `${g}.f`]), "P.m", "P.f", "P.t", "G.m", "G.f", "G.t"];
    for (let a = 12; a <= 21; a++) {
      ["m", "f"].forEach(s => { sum(`r.${a}.P.${s}`, G12.map(g => `r.${a}.${g}.${s}`)); sum(`r.${a}.G.${s}`, [`r.${a}.P.${s}`]); });
      sum(`r.${a}.P.t`, [`r.${a}.P.m`, `r.${a}.P.f`]); sum(`r.${a}.G.t`, [`r.${a}.G.m`, `r.${a}.G.f`]);
    }
    C9.forEach(c => { const A = []; for (let a = 12; a <= 21; a++) A.push(`r.${a}.${c}`); sum(`r.T.${c}`, A); });
    /* استمارة ٥ */
    const SN0 = on(() => SN, []) || [];
    EX.forEach(g => { set(`f5.${g}.sec.m`, SN0.filter(n => GK(n) == g).length); set(`f5.${g}.lv.m`, 0); });
    const R5 = ["1m", "2m", "3m", "Sm", ...G12, "Sp", "T"];
    R5.forEach(r => {
      sum(`f5.${r}.sec.t`, ["m", "f", "x"].map(s => `f5.${r}.sec.${s}`));
      ["lv", "ps"].forEach(c => sum(`f5.${r}.${c}.t`, [`f5.${r}.${c}.m`, `f5.${r}.${c}.f`]));
      ["m", "f"].forEach(s => sum(`f5.${r}.ft.${s}`, ["fx", "fa", "fo"].map(c => `f5.${r}.${c}.${s}`)));
      sum(`f5.${r}.ft.t`, [`f5.${r}.ft.m`, `f5.${r}.ft.f`]);
    });
    ["sec.m", "sec.f", "sec.x", "lv.m", "lv.f", "ps.m", "ps.f", "fx.m", "fx.f", "fa.m", "fa.f", "fo.m", "fo.f"].forEach(c => {
      sum(`f5.Sm.${c}`, ["1m", "2m", "3m"].map(r => `f5.${r}.${c}`)); sum(`f5.Sp.${c}`, G12.map(r => `f5.${r}.${c}`)); sum(`f5.T.${c}`, [`f5.Sm.${c}`, `f5.Sp.${c}`]);
    });
    /* استمارة ٧: غير العراقيين (لا يوجد بسجلات المدرسة) */
    EX.forEach(g => set(`ni.m.${g}`, 0));
    const C7 = ["1m", "2m", "3m", "Sm", ...G12, "Sp", "T"];
    C7.forEach(c => sum(`ni.t.${c}`, [`ni.m.${c}`, `ni.f.${c}`]));
    ["m", "f"].forEach(s => { sum(`ni.${s}.Sm`, ["1m", "2m", "3m"].map(c => `ni.${s}.${c}`)); sum(`ni.${s}.Sp`, G12.map(c => `ni.${s}.${c}`)); sum(`ni.${s}.T`, [`ni.${s}.Sm`, `ni.${s}.Sp`]); });
    ["x:gd.y", "x:cs.y", "x:net.n", "x:fl.n", "x:ku.y", "x:tk.n", "x:sy.n"].forEach(k => set(k, "✓"));
    /* ---- الملاك ---- */
    const SF = on(() => sortStf(), []) || [];
    const TS = SF.filter(f => stat(f) == "مستمر" && isTS(f)), AS = SF.filter(f => stat(f) == "مستمر" && !isTS(f));
    const z3 = (pre, rows) => rows.forEach(r => { set(`${pre}.${r}.m`, 0); set(`${pre}.${r}.f`, 0); });
    const rowsT = (pre, rows) => { rows.forEach(r => sum(`${pre}.${r}.t`, [`${pre}.${r}.m`, `${pre}.${r}.f`])); S3.forEach(s => sum(`${pre}.T.${s}`, rows.map(r => `${pre}.${r}.${s}`))); };
    const JT = ["dir", "asst", "tch", "gd"]; z3("jt", JT); TS.forEach(f => inc(`jt.${role(f)}.${sx(f)}`)); rowsT("jt", JT);
    const JA = ["adm", "acc", "clk", "lab", "lib", "srv", "grd", "drv", "frm"]; z3("ja", JA); AS.forEach(f => inc(`ja.${admK2(f)}.${sx(f)}`)); rowsT("ja", JA);
    const NT = ["iq", "ar", "fr"]; z3("nat", NT); TS.forEach(f => inc(`nat.iq.${sx(f)}`)); rowsT("nat", NT);
    const WS = ["in", "bth", "std", "acc", "nop", "sik", "mat", "sec", "lng"]; z3("ws", WS); delete B["ws.mat.m"];
    TS.forEach(f => inc(`ws.in.${sx(f)}`));
    SF.filter(f => isTS(f) && /منسب|مجاز/.test(stat(f))).forEach(f => { const k = /منسب/.test(stat(f)) ? "sec" : lvK(f); inc(`ws.${k}.${k == "mat" ? "f" : sx(f)}`); });
    rowsT("ws", WS); F["ws.mat.t"] = ["ws.mat.f"];
    const SP = ["isl", "ar", "en", "ku", "ma", "ph", "ch", "bi", "so", "hi", "ge", "ad", "ec", "art", "pe", "psy", "fam", "home", "cs", "tk", "sy", "oth"], Q = ["bt", "bg", "hd", "ms", "phd", "oth"];
    TS.forEach(f => inc(`ed.${qual(f)}.${sx(f)}.${spec(f)}`));
    Q.forEach(q => ["m", "f"].forEach(s => sum(`ed.${q}.${s}.T`, SP.map(c => `ed.${q}.${s}.${c}`))));
    [...SP, "T"].forEach(c => { ["m", "f"].forEach(s => sum(`ed.T.${s}.${c}`, Q.map(q => `ed.${q}.${s}.${c}`))); sum(`ed.T.t.${c}`, [`ed.T.m.${c}`, `ed.T.f.${c}`]); });
    const SV = ["a", "b", "c", "d"]; z3("sv", SV);
    TS.forEach(f => { const y = svcYr(f); if (y == null) { N.noSvc++; return; } inc(`sv.${y <= 5 ? "a" : y <= 10 ? "b" : y <= 15 ? "c" : "d"}.${sx(f)}`); }); rowsT("sv", SV);
    const AG = ["a", "b", "c", "d", "e"]; z3("ag", AG);
    TS.forEach(f => { const a = ageYr(f); if (a == null) { N.noAgeS++; return; } inc(`ag.${a < 30 ? "a" : a < 40 ? "b" : a < 50 ? "c" : a < 60 ? "d" : "e"}.${sx(f)}`); }); rowsT("ag", AG);
    sum("tr.t", ["tr.m", "tr.f"]);
    const MS = ["sin", "mar", "wid", "div"]; ["m", "f"].forEach(s => MS.forEach(c => set(`ms.${s}.${c}`, 0)));
    TS.forEach(f => { const m = marK2(f); if (m) inc(`ms.${sx(f)}.${m}`); });
    ["m", "f", "t"].forEach(s => sum(`ms.${s}.T`, MS.map(c => `ms.${s}.${c}`))); [...MS, "T"].forEach(c => sum(`ms.t.${c}`, [`ms.m.${c}`, `ms.f.${c}`]));
    set("st.prep.m", 0); set("st.prep.f", 0); TS.forEach(f => inc(`st.prep.${sx(f)}`)); rowsT("st", ["mid", "prep"]);
    /* ---- الخلاصة التدقيقية ---- */
    const lnk = (k, src) => sum(k, [src]);
    S3.forEach(s => {
      lnk(`sum.new.p.${s}`, `n.T.T.${s}`); lnk(`sum.new.m.${s}`, `n.T.mid.${s}`);
      lnk(`sum.reg.p.${s}`, `r.T.P.${s}`);
      lnk(`sum.leave.p.${s}`, `f5.Sp.lv.${s}`); lnk(`sum.leave.m.${s}`, `f5.Sm.lv.${s}`);
      lnk(`sum.nonir.p.${s}`, `ni.${s}.Sp`); lnk(`sum.nonir.m.${s}`, `ni.${s}.Sm`);
      lnk(`sum.staff.p.${s}`, `jt.T.${s}`); lnk(`sum.adm.p.${s}`, `ja.T.${s}`);
      lnk(`sum.fail.p.${s}`, `f5.Sp.ft.${s}`); lnk(`sum.fail.m.${s}`, `f5.Sm.ft.${s}`);
      lnk(`sum.pass.p.${s}`, `f5.Sp.ps.${s}`); lnk(`sum.pass.m.${s}`, `f5.Sm.ps.${s}`);
    });
    ["m", "f", "x", "t"].forEach(s => { lnk(`sum.sec.p.${s}`, `f5.Sp.sec.${s}`); lnk(`sum.sec.m.${s}`, `f5.Sm.sec.${s}`); });
    /* ---- البناية (استمارة ٨) والتجهيزات والمكتبة والمختبرات — من السجل القديم ---- */
    Object.assign(B, { "b.year": "١٩٦٨", "b.plot": "٩٥", "b.dist": "٩٥", "b.rc": 18, "b.ro": 8 });
    sum("b.rt", ["b.rc", "b.ro"]);
    ["x:bt.sch", "x:exp.n", "x:fl.2", "x:need.n", "x:cap.18", "x:mat.brick", "x:wc.y", "x:wc.bad", "x:wat.y", "x:wat.mun", "x:sew.y", "x:sew.net", "x:fen.y", "x:fen.bld", "x:fs.good",
      "x:yard.y", "x:yt.foot", "x:yt.bask", "x:gar.y", "x:hall.n", "x:occ.2", "x:own.gov2", "x:cond.ok"].forEach(k => set(k, "✓"));
    Object.assign(B, { "eq.d2.ok": 363, "eq.d2.bad": 10, "eq.d1.ok": 50, "eq.bd.ok": 20, "eq.pc.ok": 20, "eq.pr.ok": 1, "eq.pr.bad": 1 });
    ["x:lib.y", "x:lr.tch", "x:lt.room"].forEach(k => set(k, "✓"));
    Object.assign(B, { "lib.books": 1042, "lib.mags": 55 }); sum("lib.T", ["lib.books", "lib.mags"]);
    set("x:lab.y", "✓");
    ["ph", "ch", "bi"].forEach(l => ["x:lb." + l, `x:lb.${l}.ind.y`, `x:lb.${l}.ok.n`].forEach(k => set(k, "✓")));
    ["lg", "cs"].forEach(l => ["x:lb." + l, `x:lb.${l}.ind.y`, `x:lb.${l}.ok.y`].forEach(k => set(k, "✓")));
    for (const k in B) if (typeof B[k] == "number") B[k] = String(B[k]);
    return { B, F, N };
  }

  /* ---------------- القيم الفعلية (تعديل يدوي ← معادلة ← تلقائي) ---------------- */
  let C = null;
  const num = v => { const s = LD(v).replace(/[^\d.\-]/g, ""); return s === "" || s == "-" ? null : +s; };
  function val(k, seen) {
    if (OV && Object.prototype.hasOwnProperty.call(OV, k)) return OV[k];
    const f = C.F[k];
    if (f) {
      seen = seen || {}; if (seen[k]) return ""; seen[k] = 1;
      let any = 0, t = 0;
      for (const d of f) { const n = num(val(d, seen)); if (n != null) { any = 1; t += n; } }
      delete seen[k];
      return any ? String(Math.round(t * 100) / 100) : "";
    }
    return C.B[k] == null ? "" : C.B[k];
  }
  const isTick = k => k.startsWith("x:");
  const NUMK = /^(n|r|f5|jt|ja|nat|ws|ed|sv|ag|tr|ms|st|ni|sum|eq|lib)\.|^b\.(year|plot|dist|r[cot]|extra|[ne]\d)$|^s\.(stat2?|phone|bld|mahalla|zuqaq|founded|[ne]\d)$/;
  const shown = (k, v) => { if (isTick(k)) return v ? "✓" : ""; if (k == "s.email") return v; return AD(v); };

  /* مقاس الخط: نفس الحساب للشاشة والطباعة */
  const MC = D0.createElement("canvas").getContext("2d");
  function fitFs(w, h, t) {
    if (!t) return 10;
    let fs = Math.min(h * (/^[\d٠-٩.,\s\/\-]+$/.test(t) ? .72 : .66), 12);
    MC.font = `700 ${fs}px ${FF}`;
    const mw = MC.measureText(t).width, room = Math.max(4, w - 3);
    if (mw > room) fs = Math.max(4.5, fs * room / mw);
    return Math.round(fs * 10) / 10;
  }

  /* ---------------- العرض ---------------- */
  let Z = +(on(() => localStorage.getItem("kr239z")) || (innerWidth < 600 ? 2 : 1)) || 1, ADDM = 0, FOC = null, KRD = null, KRH = 0, KRSIG = "";
  const tickSvg = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.4 5.5 4.3 7.6 8 2.8" fill="none" stroke="#000" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function fieldHTML(f, p) {
    const [x, y, w, h, k] = f, v = shown(k, val(k)), ov = OV && Object.prototype.hasOwnProperty.call(OV, k);
    const base = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    if (isTick(k)) return `<div class="kf kx${ov ? " ov" : ""}" data-k="${E(k)}" role="checkbox" aria-checked="${v ? "true" : "false"}" tabindex="0" style="${base}">${v ? tickSvg : ""}</div>`;
    return `<div class="kf${ov ? " ov" : ""}${k == "s.email" ? " ltr" : ""}" data-k="${E(k)}" contenteditable="true" spellcheck="false" inputmode="${NUMK.test(k) ? "decimal" : "text"}" style="${base};font-size:${fitFs(w, h, v)}px">${E(v)}</div>`;
  }
  function addHTML(a) {
    return `<div class="kad" data-a="${E(a.id)}" style="left:${a.x}px;top:${a.y}px;font-size:${a.fs || 10}px"><span class="kat" contenteditable="true" spellcheck="false">${E(a.t || "")}</span><button type="button" class="kmv" title="سحب" aria-label="سحب">⠿</button><button type="button" class="kdel" title="حذف" aria-label="حذف النص">×</button></div>`;
  }
  function pageHTML(i) {
    const P = MAP.P[i];
    return `<div class="krw" id="krp${i}" data-p="${i}"><div class="krp" data-p="${i}"><img class="krbg" src="${imgU(i)}" alt="${E(PN[i])}" draggable="false" loading="${i < 2 ? "eager" : "lazy"}">${P.f.map(f => fieldHTML(f, i)).join("")}${ADD.filter(a => a.p == i).map(addHTML).join("")}</div><div class="krn">${AD(i + 1)} / ${AD(16)} — ${E(PN[i])}</div></div>`;
  }
  function layout() {
    const v = D0.getElementById("krv"); if (!v) return;
    const avail = Math.max(280, v.clientWidth - 2), base = Math.min(1.5, avail / 842), z = base * Z;
    v.querySelectorAll(".krw").forEach(w => { w.style.width = 842 * z + "px"; const p = w.querySelector(".krp"); p.style.transform = `scale(${z})`; w.style.height = 595 * z + 26 + "px"; });
    v.dataset.z = z; KRH = v.scrollHeight;
  }
  function refreshVals(except) {
    const v = D0.getElementById("krv"); if (!v || !MAP) return;
    v.querySelectorAll(".kf").forEach(el => {
      if (el === except) return;
      const k = el.dataset.k, s = shown(k, val(k)), ov = Object.prototype.hasOwnProperty.call(OV, k);
      el.classList.toggle("ov", ov);
      if (isTick(k)) { const want = s ? "1" : ""; if ((el.dataset.on || "") != want) { el.dataset.on = want; el.innerHTML = s ? tickSvg : ""; el.setAttribute("aria-checked", s ? "true" : "false"); } return; }
      if (el.textContent != s) el.textContent = s;
      const w = parseFloat(el.style.width), h = parseFloat(el.style.height); el.style.fontSize = fitFs(w, h, s) + "px";
    });
  }
  function notesHTML() {
    const N = C.N, L = [];
    if (N.noAge) L.push(`${AD(N.noAge)} طالب بلا تاريخ ولادة في النظام — لم يُحسبوا في جداول الأعمار.`);
    if (N.lo.length) L.push(`${AD(N.lo.length)} طالب عمره أقل من أول عمر في القالب لصفه — حُسب في أول عمر (١٥ للرابع، ١٦ للخامس، ١٧ للسادس).`);
    if (N.hi.length) L.push(`${AD(N.hi.length)} طالب عمره أكبر من آخر عمر في القالب لصفه — حُسب في آخر عمر.`);
    if (N.noSvc) L.push(`${AD(N.noSvc)} من الهيئة التدريسية بلا تاريخ تعيين — لم يُحسبوا في جدول سنوات الخدمة.`);
    if (N.noAgeS) L.push(`${AD(N.noAgeS)} من الهيئة التدريسية بلا تاريخ ولادة — لم يُحسبوا في جدول العمر.`);
    return L.length ? `<details class="box kr-n"><summary>${I("alert")} ملاحظات التعبئة التلقائية (${AD(L.length)})</summary><ul>${L.map(x => `<li>${x}</li>`).join("")}</ul></details>` : "";
  }

  const view = () => {
    on(() => { CURX = null; });
    if (typeof OWN != "undefined" && !OWN) return on(() => emptyState("هذا القسم خاص بمدير النظام", ""), "");
    on(() => fxSub());
    st();
    setTimeout(show, 0);
    const d = doc();
    return `<div class="vh"><h2>${E(NM)}</h2><span class="sub">مجموعة الاستمارات الإحصائية للتعليم الثانوي — طبق الأصل، تُملأ تلقائياً من النظام</span></div>
  <div class="tools kr-t">
    <button type="button" class="btn" onclick="kr239Do('print')">${I("print")} طباعة</button>
    <button type="button" class="btn ghost" onclick="kr239Do('pdf')">${I("download")} PDF / مشاركة</button>
    <button type="button" class="btn ghost" onclick="kr239Do('img')">${I("doc")} حفظ صورة</button>
    <button type="button" class="btn ghost ${ADDM ? "on" : ""}" onclick="kr239Add()" aria-pressed="${ADDM ? "true" : "false"}">${I("edit")} ${ADDM ? "اضغط على مكان النص في الصفحة…" : "إضافة نص حر"}</button>
    <span class="kr-zm" role="group" aria-label="حجم العرض"><button type="button" class="btn ghost sm" onclick="kr239Z(-1)" aria-label="تصغير">−</button><b>${AD(Math.round(Z * 100))}٪</b><button type="button" class="btn ghost sm" onclick="kr239Z(1)" aria-label="تكبير">+</button></span>
    ${Object.keys(OV).length || ADD.length ? `<button type="button" class="btn ghost sm" onclick="ask(this,kr239Reset)">${I("undo")} إرجاع الكل للتعبئة التلقائية</button>` : ""}
    ${d.bak && !Object.keys(OV).length && !ADD.length ? `<button type="button" class="btn ghost sm" onclick="kr239Bak()">${I("undo")} استرجاع تعديلاتي</button>` : ""}
  </div>
  <div class="kr-nav" style="overflow-x:auto" role="navigation" aria-label="صفحات الكراس">${PN.map((n, i) => `<button type="button" onclick="kr239Go(${i})">${AD(i + 1)}<small>${E(n)}</small></button>`).join("")}</div>
  <p class="muted kr-h">اضغط على أي خانة واكتب مباشرة — يُحفظ تلقائياً، والمجاميع تُحسب وحدها. خانات (✓) تتبدل بضغطة. الخانة المعدّلة يدوياً تظهر مظللة على الشاشة فقط.</p>
  <div id="krnotes"></div>
  <div id="krv" class="krv" style="overflow-x:auto;min-height:${KRH || 0}px">${KRD ? "" : '<div class="empty"><b>جارٍ تجهيز الكراس…</b>القالب طبق الأصل مع بيانات النظام</div>'}</div>
  <div id="krbar" class="kr-bar" hidden><span id="krbk"></span><button type="button" class="btn ghost sm" data-a="auto">${I("undo")} تلقائي</button><button type="button" class="btn ghost sm" data-a="clr">مسح الخانة</button></div>`;
  };

  async function show() {
    const v = D0.getElementById("krv"); if (!v) return;
    try {
      await load();
      try { if (typeof infLoad == "function") await infLoad(); } catch (e) { }
      if (!D0.getElementById("krv")) return;
      C = compute();
    } catch (e) {
      console.error(e);
      v.innerHTML = `<div class="banner err">${I("alert")} تعذّر تحميل قالب الكراس. تأكد من الإنترنت ثم <button class="btn ghost sm" onclick="render()">أعد المحاولة</button></div>`; return;
    }
    const nt = D0.getElementById("krnotes"); if (nt) nt.innerHTML = notesHTML();
    const sig = JSON.stringify(ADD.map(a => a.id + a.p));
    if (KRD && KRSIG == sig) { v.innerHTML = ""; v.appendChild(KRD); refreshVals(); }
    else { v.innerHTML = '<div class="krpages"></div>'; KRD = v.firstChild; KRSIG = sig; KRD.innerHTML = MAP.P.map((_, i) => pageHTML(i)).join(""); }
    layout(); bind(v);
    try { if (D0.fonts && D0.fonts.ready) { await D0.fonts.ready; refreshVals(); } } catch (e) { }
  }

  /* ---------------- التعديل ---------------- */
  function commit(el) {
    const k = el.dataset.k; if (!k) return;
    const t = el.textContent.replace(/\s+/g, " ").trim();
    const auto = (() => { const o = OV; OV = { ...OV }; delete OV[k]; const a = shown(k, val(k)); OV = o; return a; })();
    const nv = k == "s.email" ? t : LD(t), na = k == "s.email" ? auto : LD(auto);
    if (nv == na) { if (Object.prototype.hasOwnProperty.call(OV, k)) { delete OV[k]; save(); } }
    else if (OV[k] !== nv) { OV[k] = nv; save(); }
    refreshVals();
  }
  function bind(v) {
    if (v._kb) return; v._kb = 1;
    v.addEventListener("focusin", e => {
      const el = e.target.closest(".kf,.kat"); if (!el) return;
      on(() => { HOLD = 1; });
      if (el.classList.contains("kf")) { FOC = el; bar(el); }
    });
    v.addEventListener("focusout", e => {
      const el = e.target.closest(".kf,.kat"); if (!el) return;
      if (el.classList.contains("kf") && !isTick(el.dataset.k)) commit(el);
      if (el.classList.contains("kat")) addCommit(el);
      setTimeout(() => { if (!v.contains(D0.activeElement) && !(D0.activeElement && D0.activeElement.closest && D0.activeElement.closest("#krbar"))) { on(() => { HOLD = 0; }); bar(null); } }, 150);
    });
    v.addEventListener("input", e => {
      const el = e.target.closest(".kf"); if (!el) return;
      const k = el.dataset.k, t = el.textContent.trim();
      const w = parseFloat(el.style.width), h = parseFloat(el.style.height); el.style.fontSize = fitFs(w, h, t) + "px";
      /* المجاميع تتحدث وقت الكتابة */
      const o = OV; OV = { ...OV, [k]: k == "s.email" ? t : LD(t) }; refreshVals(el); OV = o;
    });
    v.addEventListener("keydown", e => {
      const el = e.target.closest(".kf"); if (!el) return;
      if (e.key == "Enter" || e.key == "Tab") {
        e.preventDefault();
        const L = [...v.querySelectorAll(".kf:not(.kx)")], i = L.indexOf(el), n = L[i + (e.shiftKey ? -1 : 1)];
        el.blur(); if (n) { n.focus(); selAll(n); }
      } else if (e.key == "Escape") { const k = el.dataset.k; el.textContent = shown(k, val(k)); el.blur(); }
    });
    v.addEventListener("paste", e => {
      const el = e.target.closest(".kf,.kat"); if (!el) return;
      e.preventDefault(); const t = (e.clipboardData || W.clipboardData).getData("text").replace(/\s+/g, " ").trim();
      D0.execCommand("insertText", false, t);
    });
    v.addEventListener("click", e => {
      const x = e.target.closest(".kx");
      if (x) { const k = x.dataset.k, cur = !!val(k), want = !cur; const auto = !!C.B[k]; if (want == auto) delete OV[k]; else OV[k] = want ? "✓" : ""; save(); refreshVals(); FOC = x; bar(x); return; }
      const del = e.target.closest(".kdel");
      if (del) { const a = del.closest(".kad"), id = a.dataset.a; ADD = ADD.filter(q => q.id != id); a.remove(); save(); return; }
      if (ADDM) {
        const pg = e.target.closest(".krp"); if (!pg || e.target.closest(".kad")) return;
        const r = pg.getBoundingClientRect(), z = r.width / 842;
        const a = { id: "a" + Date.now().toString(36), p: +pg.dataset.p, x: Math.round((e.clientX - r.left) / z), y: Math.round((e.clientY - r.top) / z - 6), t: "", fs: 10 };
        ADD.push(a); ADDM = 0; on(() => { const b = D0.querySelector(".kr-t .on"); if (b) { b.classList.remove("on"); b.innerHTML = I("edit") + " إضافة نص حر"; } });
        pg.insertAdjacentHTML("beforeend", addHTML(a));
        const sp = pg.querySelector(`.kad[data-a="${a.id}"] .kat`); sp.focus();
      }
    });
    v.addEventListener("keydown", e => { if (e.key == " " && e.target.closest(".kx")) { e.preventDefault(); e.target.click(); } });
    /* سحب النص الحر */
    v.addEventListener("pointerdown", e => {
      const h = e.target.closest(".kmv"); if (!h) return;
      e.preventDefault(); const a = h.closest(".kad"), pg = a.closest(".krp"), z = pg.getBoundingClientRect().width / 842;
      const sx0 = e.clientX, sy0 = e.clientY, ox = parseFloat(a.style.left), oy = parseFloat(a.style.top);
      h.setPointerCapture(e.pointerId);
      h.onpointermove = ev => { a.style.left = Math.max(0, Math.min(830, ox + (ev.clientX - sx0) / z)) + "px"; a.style.top = Math.max(0, Math.min(585, oy + (ev.clientY - sy0) / z)) + "px"; };
      h.onpointerup = () => { h.onpointermove = h.onpointerup = null; const q = ADD.find(x => x.id == a.dataset.a); if (q) { q.x = Math.round(parseFloat(a.style.left)); q.y = Math.round(parseFloat(a.style.top)); save(); } };
    });
    const b = D0.getElementById("krbar");
    if (b) b.addEventListener("pointerdown", e => e.preventDefault());
    if (b) b.addEventListener("click", e => {
      const a = e.target.closest("[data-a]"); if (!a || !FOC) return; const k = FOC.dataset.k;
      if (a.dataset.a == "auto") { delete OV[k]; }
      else { OV[k] = ""; }
      save(); refreshVals(); if (!isTick(k)) FOC.textContent = shown(k, val(k)); bar(FOC);
    });
  }
  function selAll(el) { on(() => { const r = D0.createRange(); r.selectNodeContents(el); const s = W.getSelection(); s.removeAllRanges(); s.addRange(r); }); }
  function addCommit(el) {
    const a = el.closest(".kad"), q = ADD.find(x => x.id == a.dataset.a); if (!q) return;
    const t = el.textContent.replace(/[ \t]+/g, " ").trim();
    if (!t) { ADD = ADD.filter(x => x !== q); a.remove(); save(); return; }
    if (q.t !== t) { q.t = t; save(); }
  }
  function bar(el) {
    const b = D0.getElementById("krbar"); if (!b) return;
    if (!el) { b.hidden = true; return; }
    const k = el.dataset.k, ov = Object.prototype.hasOwnProperty.call(OV, k);
    b.querySelector("#krbk").textContent = ov ? "خانة معدّلة يدوياً" : "تعبئة تلقائية";
    b.querySelector('[data-a="auto"]').disabled = !ov;
    b.hidden = false;
  }

  /* ---------------- الرسم للطباعة/PDF/الصورة ---------------- */
  async function drawPage(i, stamps) {
    const im = await imgOf(i), S = im.naturalWidth / 842;
    const cv = D0.createElement("canvas"); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
    const x = cv.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(im, 0, 0);
    x.fillStyle = "#000"; x.strokeStyle = "#000"; x.textBaseline = "middle";
    for (const [fx, fy, fw, fh, k] of MAP.P[i].f) {
      const s = shown(k, val(k)); if (!s) continue;
      if (isTick(k)) {
        const u = Math.min(fw, fh), ox = fx + (fw - u) / 2, oy = fy + (fh - u) / 2;
        x.lineWidth = Math.max(1.1, u * .135) * S; x.lineCap = "round"; x.lineJoin = "round";
        x.beginPath(); x.moveTo((ox + u * .24) * S, (oy + u * .55) * S); x.lineTo((ox + u * .43) * S, (oy + u * .76) * S); x.lineTo((ox + u * .8) * S, (oy + u * .28) * S); x.stroke();
        continue;
      }
      const fs = fitFs(fw, fh, s);
      x.font = `700 ${fs * S}px ${FF}`; x.direction = k == "s.email" ? "ltr" : "rtl"; x.textAlign = "center";
      x.fillText(s, (fx + fw / 2) * S, (fy + fh / 2 + fs * .04) * S);
    }
    for (const a of ADD.filter(q => q.p == i && q.t)) {
      const fs = a.fs || 10; x.font = `700 ${fs * S}px ${FF}`; x.direction = "rtl"; x.textAlign = "left"; x.textBaseline = "top";
      String(a.t).split("\n").forEach((ln, j) => x.fillText(AD(ln), (a.x + 2) * S, (a.y + 2 + j * fs * 1.25) * S));
      x.textBaseline = "middle";
    }
    const sg = MAP.P[i].sg;
    if (sg && stamps && stamps.length) {
      /* الختم يسار «اسم وتوقيع مدير المدرسة» (لا يغطي النص)، وختم الاسم تحتها والتوقيع فوقه */
      const mm = 72 / 25.4, Wd = { sch: 24, nm: 38, sg: 28 };
      for (const k of ["sch", "nm", "sg"].filter(q => stamps.includes(q))) {
        const im2 = await new Promise(ok => { const q = new Image(); q.onload = () => ok(q); q.onerror = () => ok(null); q.src = STI[k].u; }); if (!im2) continue;
        let w = Wd[k] * mm, h = w * im2.naturalHeight / im2.naturalWidth;
        if (h > 70) { w *= 70 / h; h = 70; }
        let cx = sg[0], cy = sg[1] + 36;
        if (k == "sg") { cx += 6; cy = sg[1] + 30; }
        if (k == "sch") { cx = sg[0] - 92; cy = sg[1] + 10; }
        cy = Math.min(cy, 592 - h / 2);
        x.save(); x.translate(cx * S, cy * S); if (k == "sch") { x.rotate(-12 * Math.PI / 180); x.globalAlpha = .9; }
        x.drawImage(im2, -w / 2 * S, -h / 2 * S, w * S, h * S); x.restore();
      }
    }
    return cv;
  }
  const toJpg = cv => new Promise((ok, no) => cv.toBlob(b => b ? ok(b) : no(new Error("blob")), "image/jpeg", .9));
  let BUSY = 0;
  async function pickPages(what) {
    return new Promise(ok => {
      D0.querySelectorAll(".zoom.kr239p").forEach(x => x.remove());
      const w = D0.createElement("div"); w.className = "zoom inst kr239p";
      const cur = curPage();
      w.innerHTML = `<div class="box" role="dialog" aria-modal="true" aria-label="الصفحات" onclick="event.stopPropagation()"><h3>${I("doc")} ${what} — الصفحات</h3>
      <div class="kr-pk"><label><input type="radio" name="krpk" value="all" checked> الكراس كاملاً (${AD(16)} صفحة)</label><label><input type="radio" name="krpk" value="cur"> الصفحة الظاهرة الآن (${AD(cur + 1)} — ${E(PN[cur])})</label><label><input type="radio" name="krpk" value="sel"> صفحات محددة: <input type="text" inputmode="numeric" placeholder="مثلاً ٥-٩ ، ١٢" style="width:150px"></label></div>
      <div class="tools"><button type="button" class="btn" data-go>${what}</button><button type="button" class="btn ghost" data-x>إلغاء</button></div></div>`;
      const done = r => { w.remove(); ok(r); };
      w.onclick = () => done(null); w.querySelector("[data-x]").onclick = () => done(null);
      w.querySelector("[data-go]").onclick = () => {
        const m = w.querySelector("input[name=krpk]:checked").value;
        if (m == "all") return done([...Array(16).keys()]);
        if (m == "cur") return done([cur]);
        const t = LD(w.querySelector("input[type=text]").value), S = new Set();
        t.split(/[،,\s]+/).forEach(p => { const r = p.match(/^(\d+)\s*[-–]\s*(\d+)$/); if (r) { for (let a = +r[1]; a <= +r[2]; a++) S.add(a - 1); } else if (/^\d+$/.test(p)) S.add(+p - 1); });
        const L = [...S].filter(n => n >= 0 && n < 16).sort((a, b) => a - b);
        if (!L.length) { T0("اكتب أرقام الصفحات (١ إلى ١٦)", "err"); return; }
        done(L);
      };
      D0.body.appendChild(w);
    });
  }
  function curPage() {
    const L = [...D0.querySelectorAll("#krv .krw")]; let best = 0, bd = 1e9;
    L.forEach((w, i) => { const r = w.getBoundingClientRect(), d = Math.abs(r.top + r.height / 3 - innerHeight / 3); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  W.kr239Do = async what => {
    if (BUSY || !MAP || !C) return;
    const lbl = { print: "طباعة", pdf: "تنزيل PDF", img: "حفظ صورة" }[what];
    const pages = await pickPages(lbl); if (!pages) return;
    const go = async () => {
      BUSY = 1; T0("جارٍ تجهيز الصفحات…");
      try {
        const sts = ["sch", "nm", "sg"].filter(k => typeof STP != "undefined" && typeof STI != "undefined" && STP[k] && STI[k]);
        const out = [];
        for (const i of pages) { const cv = await drawPage(i, sts); out.push({ i, cv }); }
        const nm = NM.replace(/[‏]/g, "");
        if (what == "print") {
          const L = []; for (const o of out) { const b = await toJpg(o.cv); L.push({ w: 297, h: 210, html: `<div class="pg221 %SZ%"><img src="${URL.createObjectURL(b)}" alt=""></div>` }); }
          if (typeof W.printHere221 == "function") await W.printHere221(L, nm); else T0("الطباعة غير متاحة هنا — استخدم PDF", "err");
        } else if (what == "pdf") {
          const L = []; for (const o of out) { const b = await toJpg(o.cv); L.push({ jpg: new Uint8Array(await b.arrayBuffer()), w: o.cv.width, h: o.cv.height }); }
          const blob = pdfJpegs(L, 842, 595);
          await saveFile(nm + (pages.length < 16 ? " — صفحات " + pages.map(p => p + 1).join("،") : "") + ".pdf", blob);
        } else {
          for (const o of out) { const b = await new Promise(ok => o.cv.toBlob(ok, "image/png")); await saveFile(nm + " — صفحة " + (o.i + 1) + " " + PN[o.i] + ".png", b); }
        }
      } catch (e) { console.error(e); T0("تعذّر التجهيز، حاول مرة أخرى", "err"); }
      BUSY = 0;
    };
    if (typeof stAsk120 == "function") stAsk120(go, lbl); else go();
  };
  W.kr239Add = () => { ADDM = ADDM ? 0 : 1; const b = D0.querySelector(".kr-t button[aria-pressed]"); if (b) { b.classList.toggle("on", !!ADDM); b.setAttribute("aria-pressed", ADDM ? "true" : "false"); b.innerHTML = I("edit") + (ADDM ? " اضغط على مكان النص في الصفحة…" : " إضافة نص حر"); } if (ADDM) T0("اضغط على المكان الذي تريد الكتابة فيه داخل الصفحة"); };
  W.kr239Z = d => { const L = [1, 1.25, 1.5, 2, 2.5, 3]; let i = L.indexOf(Z); if (i < 0) i = 0; i = Math.max(0, Math.min(L.length - 1, i + d)); Z = L[i]; on(() => localStorage.setItem("kr239z", String(Z))); const b = D0.querySelector(".kr-zm b"); if (b) b.textContent = AD(Math.round(Z * 100)) + "٪"; const cp = curPage(); layout(); W.kr239Go(cp, 1); };
  W.kr239Go = (i, inst) => { const w = D0.getElementById("krp" + i); if (w) w.scrollIntoView({ behavior: inst ? "auto" : "smooth", block: "start" }); };
  W.kr239Reset = () => { const d = doc(); on(() => fxSave(ID, { ov: {}, add: [], bak: { ov: { ...OV }, add: ADD, at: new Date().toISOString() } })); OV = {}; ADD = []; void d; KRD = null; render(); T0("رجع الكراس للتعبئة التلقائية — يمكنك استرجاع تعديلاتك"); };
  W.kr239Bak = () => { const d = doc(); if (!d.bak) return; OV = { ...(d.bak.ov || {}) }; ADD = (d.bak.add || []).map(x => ({ ...x })); on(() => fxSave(ID, { ov: { ...OV }, add: ADD, bak: null })); KRD = null; render(); T0("رجعت تعديلاتك"); };
  W.kr239State = () => ({ C, OV, ADD, val: k => val(k) });

  /* ---------------- التسجيل بدل السجل القديم ---------------- */
  function reg() {
    if (typeof V == "undefined") return;
    V.i = view;
    on(() => { if (typeof NAVI != "undefined") { const o = NAVI.i || ["i", "", "chart", 1]; o[1] = "الكراس الإحصائي"; NAVI.i = o; } });
    on(() => { if (typeof TITLE != "undefined") TITLE.i = "الكراس الإحصائي"; });
    on(() => { if (typeof HDESC != "undefined") HDESC.i = "مجموعة الاستمارات الإحصائية للتعليم الثانوي ٢٠٢٦‏-‏٢٠٢٧ — طبق الأصل وتُملأ تلقائياً"; });
  }
  reg();
  [300, 1500, 4000].forEach(t => setTimeout(() => { reg(); on(() => { if (typeof cur != "undefined" && cur == "i" && !D0.getElementById("krv")) render(); }); }, t));
  W.addEventListener("resize", () => { clearTimeout(W._kr239r); W._kr239r = setTimeout(layout, 120); });
  /* إذا تغيّرت بيانات النظام (طلاب/ملاك) وصفحة الكراس مفتوحة بدون كتابة: نعيد الحساب */
  let RT = 0;
  W.addEventListener("focus", () => { if (D0.getElementById("krv") && C && !(D0.activeElement && D0.activeElement.closest && D0.activeElement.closest("#krv"))) { clearTimeout(RT); RT = setTimeout(() => { on(() => { C = compute(); refreshVals(); }); }, 300); } });

  const css = D0.createElement("style"); css.id = "css239";
  css.textContent = `
.krv{overflow-x:auto;overflow-y:visible;padding:2px 0 70px;-webkit-overflow-scrolling:touch}
.krw{position:relative;margin:0 auto 14px;direction:ltr}
.krp{position:absolute;left:0;top:0;width:842px;height:595px;transform-origin:0 0;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.18),0 6px 18px rgba(15,74,60,.08);border-radius:2px;overflow:hidden;user-select:none;-webkit-user-select:none}
.krbg{position:absolute;left:0;top:0;width:842px;height:595px;pointer-events:none;image-rendering:auto}
.krn{position:absolute;left:0;right:0;bottom:0;text-align:center;font-size:12px;color:var(--muted,#667);direction:rtl}
.kf{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center;font-family:${FF};font-weight:700;color:#000;line-height:1;white-space:nowrap;overflow:hidden;direction:rtl;cursor:text;outline:none;border-radius:1px;user-select:text;-webkit-user-select:text;caret-color:#0f4a3c;box-sizing:border-box;padding:0 1px}
.kf.ltr{direction:ltr}
.kf:hover{background:rgba(31,107,88,.08)}
.kf:focus{background:rgba(31,107,88,.13);box-shadow:inset 0 0 0 1.2px #1f6b58}
.kf.ov{background:rgba(255,214,0,.22)}
.kf.ov:focus{background:rgba(255,214,0,.3)}
.kx{cursor:pointer}
.kx svg{width:84%;height:84%;max-width:15px;max-height:15px}
.kad{position:absolute;display:flex;align-items:flex-start;gap:1px;font-family:${FF};font-weight:700;color:#000;direction:rtl;z-index:2}
.kat{display:inline-block;min-width:24px;min-height:1.2em;padding:1px 2px;outline:1px dashed rgba(31,107,88,.55);white-space:pre-wrap;user-select:text;-webkit-user-select:text;line-height:1.25}
.kad .kmv,.kad .kdel{opacity:0;border:0;background:#1f6b58;color:#fff;font-size:9px;line-height:1;width:13px;height:13px;border-radius:3px;padding:0;cursor:pointer;touch-action:none}
.kad .kdel{background:#b42318}
.kad:hover .kmv,.kad:hover .kdel,.kad:focus-within .kmv,.kad:focus-within .kdel{opacity:1}
.kr-nav{display:flex;gap:6px;overflow-x:auto;padding:4px 2px 8px;scrollbar-width:thin}
.kr-nav button{flex:0 0 auto;display:grid;justify-items:center;gap:1px;border:1px solid var(--line,#dde);background:var(--surface,#fff);border-radius:10px;padding:5px 9px;font:inherit;font-weight:700;cursor:pointer;color:inherit}
.kr-nav button small{font-weight:500;font-size:11px;color:var(--muted,#667);white-space:nowrap}
.kr-nav button:hover{border-color:#1f6b58}
.kr-zm{display:inline-flex;align-items:center;gap:4px}
.kr-zm b{min-width:46px;text-align:center}
.kr-h{margin:2px 0 8px}
.kr-n ul{margin:6px 0 0;padding-inline-start:20px}
.kr-bar{position:fixed;bottom:max(12px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:8px;background:var(--surface,#fff);border:1px solid var(--line,#dde);border-radius:14px;padding:6px 10px;box-shadow:0 6px 24px rgba(0,0,0,.16)}
.kr-bar[hidden]{display:none}
@media (max-width:900px){.kr-bar{bottom:calc(78px + env(safe-area-inset-bottom));z-index:120}}
.kr-bar #krbk{font-size:12px;color:var(--muted,#667)}
.kr-bar *{white-space:nowrap}
.kr-pk{display:grid;gap:10px;margin:8px 0 12px}
.kr-pk label{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
`;
  (D0.head || D0.documentElement).appendChild(css);
})();
