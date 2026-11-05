/* v211 — كتاب «طلب إجازة اعتيادية»: الحصص تنحسب من الجدول الأسبوعي حسب أيام الإجازة نفسها
   (تاريخ «ابتداءً من … ولغاية …» بالكتاب، وإلا تاريخ الكتاب)، وتتحدّث وحدها كلما تغيّر التاريخ أو المدة أو المدرس.
   قبل: الحصص تنكتب مرة وحدة لحظة اختيار المدرس حسب تاريخ ذاك اليوم — إذا تغيّر التاريخ بعدين أو كان الاختيار يوم جمعة/سبت
   تبقى الحصص غلط أو فارغة. وإذا المدرس عنده أكثر من مادة بنفس الحصة تنكتب مادة وحدة بس. */
(function () {
  if (typeof letterHTML != "function") return;
  const DN = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const dg = s => String(s || "").replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[۰-۹]/g, c => "۰۱۲۳۴۵۶۷۸۹".indexOf(c));
  const plain = s => dg(String(s || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/[‎‏؜]/g, "")).replace(/\s+/g, " ");
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const parseD = (txt, re) => {
    const m = txt.match(re); if (!m) return null;
    let a = +m[1], b = +m[2], y = +m[3];
    if (m[1].length == 4) { y = +m[1]; b = +m[2]; a = +m[3]; }        // سنة/شهر/يوم
    if (b < 1 || b > 12 || a < 1 || a > 31 || y < 2000) return null;
    const d = new Date(y, b - 1, a, 12); return isNaN(d) ? null : d;
  };
  const DT = "(\\d{1,4})\\s*[\\/\\-.]\\s*(\\d{1,2})\\s*[\\/\\-.]\\s*(\\d{1,4})";
  function teacherIdx(name) {
    if (!Array.isArray(T) || !name) return -1;
    let i = T.indexOf(name); if (i >= 0) return i;
    const c = T.map((n, k) => [n, k]).filter(([n]) => { try { return sameName(n, name); } catch (e) { return false; } });
    if (c.length == 1) return c[0][1];
    if (c.length > 1) { c.sort((a, b) => b[0].length - a[0].length); return c[0][1]; }
    return -1;
  }
  function cellsFor(ti, d) {
    const out = [];
    for (let p = 0; p < 7; p++) {
      const by = new Map();
      for (let s = 0; s < NS; s++) {
        const row = g[s] && g[s][d]; const u = row ? row[p] : -1;
        if (u != null && u >= 0 && U[u] && U[u].t == ti) { const k = U[u].sj; if (!by.has(k)) by.set(k, []); by.get(k).push(SN[s]); }
      }
      out.push([...by].map(([sj, ss]) => sj + " / " + ss.join(" + ")).join(" — "));
    }
    return out;
  }
  function leaveDays(L) {
    const body = plain(L.body);
    let a = parseD(body, new RegExp("ابتداء[ًا]?\\s*من\\s*\\(?\\s*" + DT));
    let b = parseD(body, new RegExp("(?:لغاية|ولغاية)\\s*\\(?\\s*" + DT));
    const nm = body.match(/لمدة\s*\(?\s*(\d+)/); const n = nm ? Math.min(30, Math.max(1, +nm[1])) : 1;
    if (!a) a = L.date ? new Date(L.date + "T12:00") : null;
    if (!a || isNaN(a)) return [];
    const days = []; const d = new Date(a);
    for (let k = 0; k < 60 && days.length < 10; k++) {
      if (b && d > b) break;
      if (d.getDay() < 5) days.push(new Date(d));
      if (!b && days.length >= n) break;
      d.setDate(d.getDate() + 1);
    }
    return days;
  }
  window.lv211 = function (L) {
    if (!L || typeof TPL == "undefined") return L;
    const tp = TPL.find(x => x.k == LTPLK); if (!tp || !tp.leave) return L;
    if (!/المادة والشعبة/.test(L.tbl || "") || !/إجازة/.test(plain(L.body))) return L;
    const tid = L._tid || (LDRAFT && LDRAFT._tid); if (!tid) return L;
    const f = (typeof STF != "undefined" ? STF : []).find(x => x.id == tid); if (!f) return L;
    if (!g || !g.length || !U || !U.length) return L;
    const ti = teacherIdx(f.name);
    const days = leaveDays(L);
    const key = tid + "|" + days.map(iso).join(",") + "|" + ti + "|" + (typeof TT != "undefined" && TT && (TT.rv || TT.sig) || "") + "|" + U.length;
    if (L._lv211 == key) return L;
    const r = tRows(L.tbl || ""); if (!r.length) return L;
    const head = r[0];
    const oldAs = r.filter(x => /المدرس المكلف/.test(x[0] || ""));
    const rows = [head];
    days.forEach((d, k) => {
      const cells = ti >= 0 ? cellsFor(ti, d.getDay()) : ["", "", "", "", "", "", ""];
      const lab = days.length > 1 ? "المادة والشعبة (" + DN[d.getDay()] + " " + toAr(d.getDate()) + "/" + toAr(d.getMonth() + 1) + ")" : "المادة والشعبة";
      rows.push([lab, ...cells.slice(0, head.length - 1)]);
      const as = oldAs[k] ? oldAs[k].slice(1) : [];
      rows.push(["المدرس المكلف", ...Array.from({ length: head.length - 1 }, (_, i) => as[i] || "")]);
    });
    if (!days.length) return L;
    const tbl = rows.map(x => x.join("|")).join("\n");
    L.tbl = tbl; L._lv211 = key;
    if (LDRAFT && LDRAFT._tid == tid) { LDRAFT.tbl = tbl; LDRAFT._lv211 = key; }
    return L;
  };
  // اختيار المدرس: نحسب فوراً
  if (typeof tplLeave == "function") {
    const _tl = tplLeave;
    tplLeave = function (L, tn) {
      const o = _tl.apply(this, arguments);
      try {
        const f = (typeof STF != "undefined" ? STF : []).find(x => x.name == tn) || (STF || []).find(x => { try { return sameName(x.name, tn); } catch (e) { return false; } });
        if (f) o._tid = f.id;
        delete o._lv211; return window.lv211(o) || o;
      } catch (e) { return o; }
    };
  }
  // كل رسم للكتاب: إذا تغيّر التاريخ/المدة/المدرس تنعاد الحصص
  const _lh = letterHTML;
  letterHTML = function (L) { try { if (L) window.lv211(L); } catch (e) { console.error(e); } return _lh.apply(this, arguments); };
})();
