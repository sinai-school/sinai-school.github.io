/* v245 (2026-11-19، طلب المستخدم واعتماده): «تقسيم الملاك» بصفحة «الإحصائيات، داخل وخارج قوى العمل» وبطباعتها.
   المدرسون = داخل قوة العمل ويدرّسون بالجدول الأسبوعي (المدير والمعاونون اللي يدرّسون ينحسبون هنا وبالإدارة)؛
   الإدارة = المدير والمعاونون وإيهاب والمرشد التربوي (داخل قوة العمل)؛ الإداريون = الباقي غير الخدمة؛ الخدمة؛
   المجموع داخل قوة العمل بدون تكرار؛ خارج قوة العمل = المنسبون والمجازون (ومنهم المرشد المجاز). كله من البيانات — يتحدّث وحده. */
(function () {
  const W = window;
  const A = n => (typeof toAr == "function" ? toAr(n) : String(n));
  const E = s => (typeof esc == "function" ? esc(s) : String(s == null ? "" : s));
  const jb = f => (f.job || "") + " " + (f.jtitle || "") + " " + (f.titleOv || "");
  const n2 = f => String(f.name || "").trim().split(/\s+/).slice(0, 3).join(" ").replace(/^عبد /, "عبد ");
  function brk() {
    const S = sortStf(), st = f => stOf(f), inn = S.filter(f => st(f) == "مستمر");
    const teach = f => { try { return FSD.units(f).length > 0; } catch (e) { return false; } };
    const prin = f => { try { return FSD.isPrin(f); } catch (e) { return /^مدير$/.test((f.job || "").trim()); } };
    const asst = f => { try { return FSD.isAsst(f) || /معاون/.test(jb(f)); } catch (e) { return /معاون/.test(jb(f)); } };
    const coun = f => /مرشد/.test(jb(f));
    const srv = f => { try { return FSD.isSrv(f); } catch (e) { return /خدم/.test(jb(f)); } };
    const ihab = f => /^(إيهاب|ايهاب) محمد مهدي/.test(String(f.name || "").trim());
    const T = inn.filter(f => teach(f) && !coun(f) && !srv(f));
    const ADM = inn.filter(f => prin(f) || asst(f) || ihab(f) || coun(f));
    const SRV = inn.filter(f => srv(f) && !T.includes(f) && !ADM.includes(f));
    const AD2 = inn.filter(f => !T.includes(f) && !ADM.includes(f) && !SRV.includes(f));
    const OUT = S.filter(f => st(f) != "مستمر");
    const MS = OUT.filter(f => st(f) == "منسب"), LV = OUT.filter(f => st(f) == "مجاز"), OT = OUT.filter(f => !MS.includes(f) && !LV.includes(f));
    const COUN = S.filter(coun);
    const g = L => ({ m: L.filter(f => genK(f) == "m").length, f: L.filter(f => genK(f) == "f").length });
    const ed = L => { const o = {}; L.forEach(f => { const k = eduK(f.edu); o[k] = (o[k] || 0) + 1; }); return o; };
    return { T, ADM, AD2, SRV, inn, OUT, MS, LV, OT, COUN, all: S, g, ed };
  }
  W.stfBrk245 = brk;
  const edTxt = o => { const K = ["دكتوراه", "ماجستير", "دبلوم عالي", "بكالوريوس", "دبلوم", "إعدادية", "متوسطة", "ابتدائية"]; const ks = Object.keys(o).sort((a, b) => (K.indexOf(a) < 0 ? 99 : K.indexOf(a)) - (K.indexOf(b) < 0 ? 99 : K.indexOf(b))); return ks.map(k => k + " " + A(o[k])).join("، "); };
  const nm = L => L.map(f => n2(f) + (f.job && !/^مدرس$/.test(f.job.trim()) ? " (" + f.job.trim() + ")" : "")).join("، ");
  function rows() {
    const B = brk(), gT = B.g(B.T), eT = B.ed(B.T), eTx = Object.assign({ "دكتوراه": 0, "ماجستير": 0, "بكالوريوس": 0 }, eT);
    const both = B.T.filter(f => B.ADM.includes(f));
    const cIn = B.COUN.filter(f => stOf(f) == "مستمر"), cOut = B.COUN.filter(f => stOf(f) != "مستمر");
    const lvT = f => [f.lvType || "إجازة", f.lvDur || ""].join(" ").trim();
    return [
      ["المدرسون (يدرّسون بالجدول، داخل قوة العمل)", B.T.length, "ذكور " + A(gT.m) + "، إناث " + A(gT.f) + " — " + edTxt(eTx)],
      ["الإدارة", B.ADM.length, nm(B.ADM)],
      ["المرشدون التربويون", B.COUN.length, (cIn.length ? A(cIn.length) + " داخل قوة العمل (ضمن الإدارة)" : "") + (cIn.length && cOut.length ? "، " : "") + (cOut.length ? A(cOut.length) + " خارج قوة العمل: " + cOut.map(f => n2(f) + " — " + (stOf(f) == "مجاز" ? lvT(f) : stOf(f))).join("، ") : "")],
      ["الإداريون", B.AD2.length, B.AD2.map(f => n2(f) + " (" + (f.edu || "—") + ")").join("، ")],
      ["موظفو الخدمة", B.SRV.length, B.SRV.map(f => n2(f) + " (" + (f.edu || "—") + ")").join("، ")],
      ["مجموع داخل قوة العمل", B.inn.length, both.length ? "منهم " + A(both.length) + " يُحسبون مع المدرسين والإدارة معاً (مرة واحدة في المجموع): " + both.map(n2).join("، ") : "", 1],
      ["المنسبون", B.MS.length, ""],
      ...(B.LV.length ? [["المجازون", B.LV.length, B.LV.map(f => n2(f) + " — " + (/مرشد/.test(jb(f)) ? "المرشد التربوي، " : "") + lvT(f)).join("، ")]] : []),
      ...(B.OT.length ? [["آخرون خارج قوة العمل", B.OT.length, B.OT.map(f => n2(f) + " — " + stOf(f)).join("، ")]] : []),
      ["مجموع خارج قوة العمل", B.OUT.length, "", 1],
      ["المجموع الكلي", B.all.length, "", 1]
    ];
  }
  W.stfRows245 = rows;
  function box() {
    let R; try { R = rows(); } catch (e) { console.error(e); return ""; }
    return `<div class="box stf245"><h3>تقسيم الملاك</h3><div class="tw"><table><tr><th class="l">الفئة</th><th>العدد</th><th class="l">التفاصيل</th></tr>${R.map(r => `<tr${r[3] ? ' class="tot245"' : ""}><td class="l">${r[3] ? "<b>" + E(r[0]) + "</b>" : E(r[0])}</td><td><b>${A(r[1])}</b></td><td class="l">${E(r[2])}</td></tr>`).join("")}</table></div></div>`;
  }
  function sheet() {
    const R = rows();
    return { title: "تقسيم الملاك التدريسي والإداري", sheet: "تقسيم الملاك", orient: "portrait", fs: 11, hr: 1,
      rows: [[{ v: "الفئة", h: 1 }, { v: "العدد", h: 1 }, { v: "التفاصيل", h: 1 }], ...R.map(r => [{ v: r[0], l: 1, b: r[3] ? 1 : 0 }, { v: A(r[1]), b: r[3] ? 1 : 0 }, { v: r[2], l: 1 }])], ww: [5, 1.4, 9] };
  }
  /* النسخة المعدّلة المحفوظة لهذه الصفحة (قبل v245) ما بيها الورقة الجديدة — تنضاف أولها وقت الطباعة */
  W.pedFix245 = (name, L) => { if (!/^الملاك التدريسي والإداري/.test(name || "") || !Array.isArray(L)) return L; if (L.some(x => x && x.title == "تقسيم الملاك التدريسي والإداري")) return L; try { return [sheet()].concat(L); } catch (e) { return L; } };
  try { const st = document.createElement("style"); st.textContent = ".stf245 .tw{overflow-x:visible!important}.stf245 table{table-layout:fixed!important;width:100%!important;min-width:0!important}.stf245 th:nth-child(1){width:30%}.stf245 th:nth-child(2){width:13%}.stf245 td,.stf245 th{white-space:normal!important;overflow-wrap:break-word;word-break:normal}.stf245 td.l{text-align:right!important}.stf245 tr.tot245 td{background:rgba(31,94,74,.07)}"; document.head.appendChild(st); } catch (e) { }
  const _Vf = V.f;
  V.f = function () {
    const h = _Vf.apply(this, arguments);
    if (typeof OWN != "undefined" && !OWN) return h;
    try { if (typeof CURX != "undefined" && CURX && CURX.sheets && !CURX.s245) { const sh = CURX.sheets; CURX.sheets = () => { const L = sh(); try { L.unshift(sheet()); } catch (e) { console.error(e); } return L; }; CURX.s245 = 1; } } catch (e) { console.error(e); }
    const i = h.indexOf('<div class="two">'); const b = box();
    return i >= 0 ? h.slice(0, i) + b + h.slice(i) : h + b;
  };
})();
