/* ---------- v204 (1) جدول توزيع الحصص (جدول المديرية) طبق القالب بدون تداخل ----------
   - كل صف بارتفاع ثابت ومجموع صفوف كل صفحة = ارتفاع جدول القالب نفسه، فالجدول ما يطلع برّه الإطار
   - المدرس بأكثر من مادة: صفوفه مقروءة (ما تنضغط لحد ما الكتابة تتداخل) ومجموعته ما تنقسم بين صفحتين
   - إذا الأسماء أكثر من صفحات القالب: تنضاف صفحة بنفس تصميم القالب (العنوان، الخلاصة، التوقيع) */
(function () {
  if (typeof FXR == "undefined" || !FXR.o_dir) return;
  const R0 = FXR.o_dir, f0 = R0.fill;
  const isMain = t => /الصفوف والشعب/.test(DXF.text(t.rows[0]));
  const rowH = tr => parseFloat(tr.dataset.h || tr.style.height) || 0;
  R0.fill = function (host, o) {
    const T0 = DXF.tables(host).filter(isMain);
    /* ارتفاع جسم كل جدول بالقالب (بالنقاط) ومتوسط ارتفاع الصف */
    const cap = T0.map(t => { const L = [...t.rows].slice(2).map(rowH).filter(Boolean); return { H: L.reduce((a, b) => a + b, 0) || 41 * (t.rows.length - 2), avg: L.length ? L.reduce((a, b) => a + b, 0) / L.length : 41 }; });
    const r = f0.apply(this, arguments);
    try { relayout(host, cap); } catch (e) { console.warn("v204 dir", e); }
    return r;
  };
  function relayout(host, cap) {
    const main = DXF.tables(host).filter(isMain); if (!main.length) return;
    const G0 = DXF.grid(main[0]), top0 = G0[0] || [];
    const hdr = (G0[1] || []).filter((td, c) => top0[c] && /الصفوف والشعب/.test(DXF.text(top0[c]))).map(td => DXF.text(td));
    const nSec = hdr.length, secCol = hdr.map(h => SN.findIndex(n => fxSecKey(n) == fxSecKey(h)));
    const nc = 3 + nSec + 2 + 5;
    let proto = null;
    main.forEach(t => [...t.rows].slice(2).forEach(tr => { if (!proto && tr.cells.length == nc && ![...tr.cells].some(td => td.colSpan > 1 || td.rowSpan > 1)) proto = tr; }));
    if (!proto) return;
    proto = proto.cloneNode(true);
    [...proto.cells].forEach(td => DXF.put(td, ""));
    /* الجدول الرئيسي: المدرسون اللي عندهم دروس بالجدول الأسبوعي فقط + منسق EMIS + المرشد التربوي.
       الباقون (الموظفون، الخدمة، المنسبون، المجازون…) كلٌّ بمكانه بالقالب (جرد الملاك، المنسبين، الإجازات، الإداريين) */
    const away = f => /مجاز|منسب|منقول|متقاعد|مستقيل|متوفى/.test(f.status || "");
    const subjOf = f => { const ti = FSD.tIdx(f); return ti < 0 ? [] : [...new Set(U.filter(u => u.t == ti).map(u => u.sj))].sort((a, b) => DIRORD.indexOf(a) - DIRORD.indexOf(b)); };
    const isPeople = f => !away(f) && (subjOf(f).length > 0 || /EMIS|مرشد/i.test((f.job || "") + " " + (f.jtitle || "")));
    /* الترتيب: المدير ← المعاونون ← المرشد التربوي ← (موظف EMIS) ← المدرسون حسب اختصاص المادة اللي يدرّسونها */
    const jb = f => (f.job || "") + " " + (f.jtitle || "");
    const rank = f => FSD.isPrin(f) ? 0 : (FSD.isAsst(f) || /معاون/.test(jb(f))) ? 1 : /مرشد/.test(jb(f)) ? 2 : (/EMIS/i.test(jb(f)) && !subjOf(f).length) ? 3 : 4;
    const sjRank = f => { const J = subjOf(f); const i = J.length ? DIRORD.indexOf(J[0]) : 99; return i < 0 ? 98 : i; };
    const L0 = FSD.staff().filter(isPeople);
    const L = L0.map((f, i) => [f, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || (rank(a[0]) == 4 ? sjRank(a[0]) - sjRank(b[0]) : 0) || a[1] - b[1]).map(x => x[0]), R = [];
    L.forEach((f, k) => {
      const J = subjOf(f);
      if (!J.length) { R.push({ f, k, sj: null, n: 1, i: 0 }); return; }
      J.forEach((sj, i) => R.push({ f, k, sj, n: J.length, i }));
    });
    /* معلومات الإداريين: المدير والمعاونون والكاتب */
    try {
      const adm = [FSD.prin(), ...FSD.staff().filter(f => !away(f) && f !== FSD.prin() && (FSD.isAsst(f) || /كاتب/.test((f.job || "") + " " + (f.jtitle || ""))))].filter(Boolean);
      DXF.tables(host).filter(t => /^معلومات الا?إ?داريين/.test(DXF.text(t.rows[0]).replace(/\s+/g, " "))).forEach(t => {
        const C = fxCols(t, 1), key = re => C.m[Object.keys(C.m).find(x => re.test(x))];
        const n0 = t.rows.length - 2;
        DXF.rows(t, 2, adm, (c, f, k) => { const g = DXF.grid(t)[c[0].parentElement.rowIndex]; DXF.put(g[C.m["ت"]], k + 1); DXF.put(g[key(/الاس/)], FSD.n3(f.name)); DXF.put(g[key(/العنوان/)], f.job || ""); }, { min: Math.max(adm.length, n0) });
      });
    } catch (e) { console.warn("v204 adm", e); }
    /* جرد الملاك: الموجودون بالمدرسة فقط (المنسبون بصندوق المنسبين، والمجازون بصندوق الإجازات — مثل القالب) */
    try {
      const J0 = FSD.staff().filter(f => !away(f));
      const d2 = v => FSD.dmy(v).replace(/^(\d+)\/(\d+)\/(\d+)$/, (m, d, mo, y) => String(d).padStart(2, "0") + "/" + String(mo).padStart(2, "0") + "/" + y);
      let off = 0;
      DXF.tables(host).filter(t => /^جرد الملاك/.test(DXF.text(t.rows[0]))).forEach(t => {
        const per = t.rows.length - 2, part = J0.slice(off, off + per);
        const C = fxCols(t, 1), col = re => C.m[Object.keys(C.m).find(x => re.test(x))];
        DXF.rows(t, 2, part, (c, f, k) => {
          const g = DXF.grid(t)[c[0].parentElement.rowIndex];
          const put = (re, v) => { const ci = col(re); if (ci != null && g[ci]) DXF.put(g[ci], v); };
          put(/^ت$/, off + k + 1); put(/الاس/, FSD.n4(f.name)); put(/التحصيل/, FSD.edu(f)); put(/التولد/, FSD.yr(f.birth)); put(/الاختصاص/, f.spec || ""); put(/دائمي|عقد/, /عقد/.test(f.type || "") ? "عقد" : "دائمي"); put(/اول تعيين/, d2(f.appoint)); put(/المباشرة/, d2(f.start));
        }, { min: per });
        off += per;
      });
    } catch (e) { console.warn("v204 jard", e); }
    /* الإجازات: كل صفحة تكمل من اللي قبلها (ما يتكرر نفس الاسم بكل صفحة) */
    try {
      const lv = FSD.staff().concat((typeof STF != "undefined" ? STF : []).filter(f => f && !FSD.staff().includes(f))).filter(f => f && /مجاز/.test(f.status || ""));
      const seenL = new Set, nmK = f => String(f.name || '').replace(/[أإآ]/g, 'ا').replace(/\s+/g, ' ').trim().split(' ').slice(0, 3).join(' ');
      const LV = lv.slice().sort((a, b) => ((b.lvOrder || b.lvFrom || b.lvType) ? 1 : 0) - ((a.lvOrder || a.lvFrom || a.lvType) ? 1 : 0)).filter(f => { const k = nmK(f); if (seenL.has(f.id) || seenL.has(k)) return false; seenL.add(f.id); seenL.add(k); return true; });
      let lo = 0;
      DXF.tables(host).filter(t => /^الا?إ?جازات/.test(DXF.text(t.rows[0]))).forEach(t => {
        const per = t.rows.length - 2, part = LV.slice(lo, lo + per);
        const C = fxCols(t, 1), col = re => C.m[Object.keys(C.m).find(x => re.test(x))];
        DXF.rows(t, 2, part, (c, f, k) => { const g = DXF.grid(t)[c[0].parentElement.rowIndex]; const put = (re, v) => { const ci = col(re); if (ci != null && g[ci]) DXF.put(g[ci], v); }; put(/^ت$/, lo + k + 1); put(/الاس/, FSD.n3(f.name)); put(/نوع/, f.lvType || f.lvDur || ""); put(/الامر|الأمر/, f.lvOrder || ""); put(/المدة/, f.lvDur || ""); put(/ابتداء/, FSD.dmy(f.lvFrom)); }, { min: per });
        lo += per;
      });
    } catch (e) { console.warn("v204 lv", e); }
    /* ملاك المدرسة + عدد المدرسين: من بيانات النظام (نفس الأرقام بكل صفحة) */
    try {
      const pres = FSD.staff().filter(f => !away(f) && !FSD.isSrv(f));
      const fem = f => /أنثى|انثى/.test(f.gender || "");
      const isP = f => FSD.isPrin(f), isA = f => !isP(f) && (FSD.isAsst(f) || /معاون/.test(jb(f)));
      const cnt = (L, g) => L.filter(f => g == "m" ? !fem(f) : g == "f" ? fem(f) : true);
      const lvAll = (typeof STF != "undefined" ? STF : []).filter(f => f && /مجاز/.test(f.status || ""));
      const lvT = (f, re) => re.test((f.lvType || "") + " " + (f.lvDur || "") + " " + (f.status || ""));
      const OUT = [["امومة|أمومة", /امومة|أمومة/], ["ولادة", /ولادة/], ["دراسية", /دراس/], ["اعتيادية", /اعتياد/], ["مرضية", /مرض/]];
      const outOf = (g, lab) => { const L = cnt(lvAll, g); if (/اخرى|أخرى/.test(lab)) return L.filter(f => !OUT.some(([, re]) => lvT(f, re))).length; const o = OUT.find(([k]) => new RegExp(k).test(lab)); return o ? L.filter(f => lvT(f, o[1])).length : null; };
      const tchCell = g => { const L = cnt(pres, g).filter(f => !isP(f) && !isA(f)), m = L.filter(f => /مرشد/.test(jb(f))).length, n = L.length - m; return m ? (n ? A0(n) + "+مرشد" : "مرشد") : (n || ""); };
      const A0 = v => v;
      DXF.tables(host).filter(t => /^ملاك المدرسة/.test(DXF.text(t.rows[0]))).forEach(t => {
        const G = DXF.grid(t), hr = G.findIndex(r => r && r.some(td => td && /الوظيفة/.test(DXF.text(td))));
        if (hr < 0) return;
        const labs = G[hr].map(td => td ? DXF.text(td).replace(/[\s\u200b]+/g, " ").trim() : "");
        const iW = labs.findIndex(l => /الوظيفة/.test(l)), iM = labs.findIndex(l => /مدرس/.test(l)); const kind = labs.map((l, c) => /المجموع/.test(l) ? (Math.abs(c - iM) == 1 ? "sumIn" : "sumOut") : l);
        for (let r = hr + 1; r < G.length; r++) {
          const row = G[r]; if (!row) continue;
          const lab = DXF.text(row[iW] || row[0]).replace(/[\s\u200b]+/g, " ").trim();
          const g = /ذكور/.test(lab) ? "m" : /اناث|إناث/.test(lab) ? "f" : /المجموع/.test(lab) ? "a" : null; if (!g) continue;
          const done = new Set;
          kind.forEach((k, c) => {
            const td = row[c]; if (!td || done.has(td) || c == iW) return; done.add(td);
            if (/مدير/.test(k)) DXF.put(td, cnt(pres, g).filter(isP).length || "");
            else if (/معاون/.test(k)) DXF.put(td, cnt(pres, g).filter(isA).length || "");
            else if (/مدرس/.test(k)) DXF.put(td, tchCell(g));
            else if (k == "sumIn") DXF.put(td, cnt(pres, g).length || "");
            else if (k == "sumOut") DXF.put(td, cnt(lvAll, g).length || "");
            else { const v = outOf(g, k); if (v != null) DXF.put(td, v || ""); }
          });
        }
      });
      /* عدد المدرسين بجدول أعداد الطلاب */
      DXF.tables(host).filter(t => /^اعداد الطلاب/.test(DXF.text(t.rows[0]))).forEach(t => {
        const G = DXF.grid(t);
        G.forEach(row => (row || []).forEach((td, c) => { if (td && /^المدرسين$/.test(DXF.text(td).replace(/[\s\u200b]+/g, ''))) { let nx = null; for (let i = c - 1; i >= 0; i--) if (row[i] && row[i] !== td) { nx = row[i]; break; } if (nx && !/[ء-ي]/.test(DXF.text(nx))) DXF.put(nx, pres.length); } }));
      });
    } catch (e) { console.warn("v204 malak", e); }
    const S = {};
    U.forEach(u => { const f = FSD.staffOfT(u.t); if (!f || !isPeople(f)) return; const x = S[u.sj] = S[u.sj] || { h: 0, t: new Set, x: new Set }; x.h += u.h * u.secs.length; if (FSD.isPrin(f)) x.x.add("مدير"); else if (FSD.isAsst(f)) x.x.add("معاون"); else x.t.add(f.id); });
    const SUM = DIRORD.filter(sj => S[sj]).concat(Object.keys(S).filter(sj => !DIRORD.includes(sj))).map(sj => [DIRLAB[sj] || FSD.sjName(sj), S[sj].h, S[sj].t.size + (S[sj].x.size ? " + " + [...S[sj].x].join(" + ") : "")]);
    const mkRow = r => {
      const tr = proto.cloneNode(true), c = [...tr.cells], f = r.f;
      if (r.i == 0) { DXF.put(c[0], r.k + 1); DXF.put(c[1], FSD.n4(f.name)); }
      DXF.put(c[2], r.sj || (/مرشد/.test(f.job || "") ? "مرشد تربوي" : /EMIS/i.test(f.job || "") && !/منسق|معاون/.test(f.job || "") ? "EMIS" : f.spec || ""));
      if (r.sj) {
        let tot = 0;
        for (let j = 0; j < nSec; j++) { const sec = secCol[j]; if (sec < 0) continue; const h = U.filter(u => FSD.staffOfT(u.t) === f && u.sj == r.sj && u.secs.includes(sec)).reduce((a, u) => a + u.h, 0); if (h) { DXF.put(c[3 + j], h); tot += h; } }
        DXF.put(c[3 + nSec], tot || "");
      } else {
        const jb = (f.job || "") + " " + (f.jtitle || "");
        const txt = /EMIS/i.test(jb) && /منسق|معاون/.test(jb) ? "منسق نظام إدارة المعلومات التربوية EMIS ومعاون" : /مرشد/.test(jb) ? "المرشد التربوي" : "";
        if (!txt && /EMIS/i.test(jb)) DXF.put(c[4 + nSec], "EMIS");
        if (txt) { c[3].colSpan = nSec; DXF.put(c[3], txt, { al: "center" }); for (let j = 1; j < nSec; j++) c[3 + j].remove(); }
      }
      return tr;
    };
    /* المجموعات (كل مدرس = مجموعة ما تنقسم) */
    const grps = []; R.forEach(x => { const g = grps[grps.length - 1]; if (g && g[0].f === x.f) g.push(x); else grps.push([x]); });
    const tb = t => t.tBodies[0] || t;
    /* صفحة إضافية بنفس تصميم آخر صفحة بالقالب */
    const addPage = () => {
      const t = main[main.length - 1], body = t.parentElement;
      const kids = [...body.children], i = kids.indexOf(t);
      const set = kids.slice(Math.max(0, i - 3), i + 2), after = kids[i + 1] || t;
      let ref = after;
      const cl = set.map(n => n.cloneNode(true));
      cl.forEach(n => { ref.after(n); ref = n; });
      const nt = cl.find(n => n.matches && n.matches("table"));
      [...nt.rows].slice(2).forEach(tr => tr.remove());
      main.push(nt); cap.push(cap[cap.length - 1]);
    };
    main.forEach(t => [...t.rows].slice(2).forEach(tr => tr.remove()));
    /* التوزيع على الصفحات حسب الارتفاع */
    let ti = 0, used = 0; const pages = main.map(() => []);
    const gH = (g, a) => g.length == 1 ? a : g.length * Math.max(a * 0.62, 23);
    for (const g of grps) {
      for (; ;) {
        const a = cap[ti].avg, h = gH(g, a);
        if (used + h <= cap[ti].H + 0.5 || !pages[ti].length) { pages[ti].push(g); used += h; break; }
        ti++; used = 0;
        if (ti >= main.length) { addPage(); pages.push([]); }
      }
    }
    pages.forEach((P, pi) => {
      const t = main[pi], a = cap[pi].avg, H = cap[pi].H;
      let rows = [], sum = 0;
      P.forEach(g => {
        const rs = g.map(mkRow), h = g.length == 1 ? a : gH(g, a) / g.length;
        if (g.length > 1) {
          [0, 1, 4 + nSec].forEach(ci => { const td = rs[0].cells[ci]; if (td) td.rowSpan = g.length; });
          rs.slice(1).forEach(tr => [4 + nSec, 1, 0].forEach(ci => { const td = tr.cells[ci]; if (td) td.remove(); }));
          /* خط المادة والأرقام يناسب ارتفاع الصف حتى ما يتداخل */
          const fs = Math.min(12, h * 0.55);
          rs.forEach((tr, ri) => [...tr.cells].forEach((td, ci) => { if (ri == 0 && (ci == 0 || ci == 1)) return; if (ci >= tr.cells.length - 5) return; td.querySelectorAll("span").forEach(s => { const f = parseFloat(s.style.fontSize) || 0; if (!f || f > fs) s.style.fontSize = fs.toFixed(1) + "pt"; }); }));
        }
        rs.forEach(tr => { rows.push([tr, h]); sum += h; });
      });
      /* المكان الباقي: صفوف فارغة مثل القالب، والباقي يتوزع */
      while (H - sum >= a - 0.5) { const tr = proto.cloneNode(true); rows.push([tr, a]); sum += a; }
      const k = sum > 0 ? Math.max(1, H / sum) : 1;
      rows.forEach(([tr, h]) => { const hh = (h * k).toFixed(1); tr.dataset.h = hh; tr.style.height = hh + "pt"; tb(t).appendChild(tr); });
    });
    /* الخلاصة بآخر خمس خلايا من أول صف */
    let k = 0;
    main.forEach(t => [...t.rows].slice(2).forEach(tr => { const c = [...tr.cells], cs = c.slice(c.length - 5), x = SUM[k]; if (x) { DXF.put(cs[0], x[0], { b: 1 }); DXF.put(cs[1], x[1]); DXF.put(cs[2], x[2]); k++; } }));
  }
})();

/* ---------- v204 (2) الصناديق والجداول الجانبية بأي قالب: إذا المحتوى أطول من إطاره بالقالب يصغر الخط داخله بس، فما يتداخل مع الصندوق اللي جوّاه ---------- */
(function () {
  if (typeof dxLayout != "function") return;
  function fitBoxes(root) {
    root.querySelectorAll(".dxpg .da").forEach(a => {
      if (!a.querySelector("table")) return;
      const inner = a.firstElementChild; if (!inner) return;
      const box = a.getBoundingClientRect().height; if (!box) return;
      if (inner.scrollHeight <= box + 2) return;
      /* أول شي: الصفوف الفارغة بآخر الجدول (الزايدة عن إطار القالب) تنشال */
      for (const t of [...inner.querySelectorAll("table")].reverse()) {
        while (inner.scrollHeight > box + 2 && t.rows.length > 3) {
          const tr = t.rows[t.rows.length - 1];
          if (tr.textContent.replace(/[\s\u200b]/g, "") || [...tr.cells].some(td => td.rowSpan > 1)) break;
          tr.remove();
        }
      }
      if (inner.scrollHeight <= box + 2) { a.dataset.fit = "1"; return; }
      const els = [...inner.querySelectorAll("span,.p,td")].filter(e => e.childNodes.length);
      const F = els.map(e => [e, parseFloat(getComputedStyle(e).fontSize), e.style.fontSize, getComputedStyle(e).lineHeight]);
      const TR = [...inner.querySelectorAll("tr")].map(tr => [tr, tr.style.height, parseFloat(tr.dataset.h || tr.style.height) || 0]);
      let ok = false;
      for (let k = 0.95; k >= 0.7; k -= 0.05) {
        F.forEach(([e, f, , lh]) => { e.style.fontSize = (f * k) + "px"; if (/px$/.test(lh)) e.style.lineHeight = (parseFloat(lh) * k) + "px"; });
        TR.forEach(([tr, , h]) => { if (h) tr.style.height = (h * k) + "pt"; });
        if (inner.scrollHeight <= box + 2) { ok = true; break; }
      }
      a.dataset.fit = ok ? "1" : "0";
    });
  }
  /* الجداول الطافية بنفس الصفحة ما تتداخل: إذا تداخلت يصغر الجدول (من جهة الالتصاق) لحد ما ينفصل */
  function unOverlap(root) {
    root.querySelectorAll(".dxpg").forEach(pg => {
      for (let pass = 0; pass < 4; pass++) {
        const B = [...pg.querySelectorAll(".da")].map(a => a.querySelector("table")).filter(Boolean).filter((t, i, L) => !L.some((u, j) => j != i && u.contains(t)));
        let ch = 0;
        for (let i = 0; i < B.length; i++) for (let j = 0; j < B.length; j++) {
          if (i == j) continue;
          const a = B[i].getBoundingClientRect(), b = B[j].getBoundingClientRect();
          const dx = Math.min(a.right, b.right) - Math.max(a.left, b.left), dy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (dx <= 1 || dy <= 1) continue;
          let t, k;
          if (dx < dy) { /* تداخل بالعرض: يصغر الجدول اللي على اليمين (يبقى ملتصق بيمين صندوقه) */ t = a.left > b.left ? B[i] : B[j]; const r = t.getBoundingClientRect(), o = t === B[i] ? b : a; k = (r.right - o.right - 4) / r.width; }
          else { /* تداخل بالطول: يصغر الجدول اللي فوك */ t = a.top < b.top ? B[i] : B[j]; const r = t.getBoundingClientRect(), o = t === B[i] ? b : a; k = (o.top - r.top - 4) / r.height; }
          if (!(k > 0.5 && k < 1)) continue;
          const z = (parseFloat(t.style.zoom) || 1) * k; t.style.zoom = z.toFixed(3); ch = 1;
        }
        if (!ch) break;
      }
    });
  }
  /* جداول الصفحات الجانبية: كل خانات البيانات بنفس الخط (حجم عناوين الجدول) وبالوسط — بدون أرقام صغيرة أو مزاحة */
  const INFO = /^(معلومات|اعداد الطلاب|ملاك المدرسة|المنسبين|الا?إ?جازات|الفائضون|جرد الملاك)/;
  function normInfo(root) {
    root.querySelectorAll(".dxpg .da table").forEach(t => {
      if (t.parentElement.closest("table")) return;
      const ttl = (t.rows[0] && t.rows[0].textContent || "").replace(/[\s​]+/g, " ").trim();
      if (!INFO.test(ttl)) return;
      const big = /^جرد الملاك/.test(ttl);
      /* حجم الخط المرجعي: عناوين الأعمدة (الصف الثاني) */
      const hs = [...(t.rows[1] ? t.rows[1].querySelectorAll("span") : [])].map(x => parseFloat(getComputedStyle(x).fontSize)).filter(Boolean).sort((a, b) => a - b);
      if (!hs.length) return;
      const ref = hs[Math.floor(hs.length / 2)] * (big ? 0.78 : 0.95);
      for (let r = 1; r < t.rows.length; r++) [...t.rows[r].cells].forEach(td => {
        const tx = td.textContent.replace(/[\s​]+/g, "");
        if (!tx || td.querySelector("table")) return;
        td.querySelectorAll("span").forEach(x => { if (!x.closest(".da") || x.closest(".da") === t.closest(".da")) x.style.fontSize = ref + "px"; });
        td.querySelectorAll(".p").forEach(p => { p.style.textAlign = "center"; p.style.lineHeight = "1.15"; });
        td.style.verticalAlign = "middle"; td.style.textAlign = "center"; td.style.fontSize = ref + "px"; td.style.lineHeight = "1.15";
        /* الكلمة ما تنقص: إذا الخانة ضيقة يصغر خطها هي بس */
        const fitW = () => { const a = [td, ...td.querySelectorAll("span,.p")]; return a.some(e => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0); };
        for (let k = 0.93; k >= 0.6 && fitW(); k -= 0.07) { const f = ref * k; td.style.fontSize = f + "px"; td.querySelectorAll("span").forEach(x => x.style.fontSize = f + "px"); }
      });
    });
  }
  /* عناوين الشعب بجدول المديرية: كلها بنفس حجم الخط (ما يصغر بعضها على بعض الأجهزة) */
  function secHeads(root) {
    root.querySelectorAll(".dxpg table").forEach(t => {
      if (!t.rows[0] || !/الصفوف والشعب/.test(t.rows[0].textContent)) return;
      const r = t.rows[1]; if (!r) return;
      const cs = [...r.cells].filter(td => /^(الرابع|الخامس|السادس)/.test(td.textContent.replace(/[\s​]+/g, " ").trim()));
      if (cs.length < 2) return;
      const sz = cs.map(td => { const s = td.querySelector("span"); return s ? parseFloat(getComputedStyle(s).fontSize) : 0; }).filter(Boolean);
      if (!sz.length) return;
      const f = Math.max(...sz);
      cs.forEach(td => td.querySelectorAll("span,.p").forEach(s => { s.style.fontSize = f + "px"; }));
    });
  }
  const _dl = dxLayout;
  dxLayout = function (host, opt) { const r = _dl.apply(this, arguments); try { secHeads(host); normInfo(host); fitBoxes(host); unOverlap(host); } catch (e) { console.warn("v204 fit", e); } return r; };
  window.v204Fit = fitBoxes;
})();
