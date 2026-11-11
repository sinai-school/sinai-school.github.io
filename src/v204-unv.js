/* v204j: حسابات الطلاب اللي ما عندهم رقم بطاقة بسجلات المدرسة — «بانتظار تأكيد الإدارة».
   الطالب يسجّل ويكمّل معلوماته، بس درجاته ونتائجه وتبليغاته الخاصة ما توصله إلا بعد ما الإدارة تأكد رقم بطاقته. */
(function () {
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v204j", e); } };
  const has = n => { try { return (0, eval)("typeof " + n) != "undefined"; } catch (e) { return false; } };
  const A = v => (typeof toAr == "function" ? toAr(v) : String(v));
  const E = s => (typeof esc == "function" ? esc(s) : String(s == null ? "" : s));
  const st = D.createElement("style");
  st.textContent = `.unv204{border:1.5px solid #c9a227;background:linear-gradient(180deg,#fffaf0,#fff)}
.unv204 h3{margin:0 0 4px;display:flex;gap:8px;align-items:center}
.unv204 table td,.unv204 table th{vertical-align:middle}
.unv204 .nid{font:700 15px/1.4 ui-monospace,monospace;letter-spacing:.5px;direction:ltr;unicode-bidi:isolate}
.unv204 .acts{display:flex;gap:6px;flex-wrap:wrap}
.unvb204{display:flex;gap:10px;align-items:flex-start}`;
  D.head.appendChild(st);

  /* ---------- البوابة: الطالب يشوف إن حسابه بانتظار التأكيد ---------- */
  on(() => {
    if (!has("psView")) return;
    const _pv = psView;
    psView = function (...a) {
      let h = _pv.apply(this, a);
      try {
        if (!PS.b || !PS.b.unv || PS.stage != "in") return h;
        const b = `<div class="banner warn unvb204">${typeof ic == "function" ? ic("shield") : ""}<span><b>حسابك بانتظار تأكيد إدارة المدرسة.</b> ما عندنا رقم بطاقتك الموحدة بسجلات المدرسة، فلازم الإدارة تتأكد إن الحساب مالك. راجع الإدارة وويّاك البطاقة الموحدة. تكدر تكمّل معلوماتك وصورتك هسه، ودرجاتك وتبليغاتك الخاصة تطلعلك أول ما يتأكد حسابك.</span></div>`;
        const i = h.indexOf('<div class="box');
        h = i >= 0 ? h.slice(0, i) + b + h.slice(i) : b + h;
      } catch (e) { }
      return h;
    };
  });

  /* ---------- الإدارة: قائمة الحسابات اللي تحتاج تأكيد ---------- */
  const stu = key => { try { return (typeof STA == "function" ? STA() : (W.ST || [])).find(x => x.id == key) || null; } catch (e) { return null; } };
  W.unv204Ok = async (btn, key, nid) => {
    if (btn) btn.disabled = true;
    try {
      const r = await api({ a: "admin", op: "nidOk", secret: APIK.secret, kind: "s", key, nid }, APIK.url);
      if (r && r.ok) { toast("تأكّد الحساب ✓ — درجاته وتبليغاته توصله هسه"); await apiPull(); }
      else { toast(typeof errTxt == "function" ? errTxt(r) : "تعذّر التأكيد", "err"); if (btn) btn.disabled = false; }
    } catch (e) { toast("تعذّر الاتصال، حاول مرة ثانية", "err"); if (btn) btn.disabled = false; }
  };
  W.unv204Del = async (btn, key, name) => {
    if (!confirm("تحذف حساب «" + name + "» من البوابة؟ صورته ومعلوماته تنمسح، وصاحب الاسم الحقيقي يكدر يسجّل من جديد.")) return;
    if (btn) btn.disabled = true;
    try {
      const r = await api({ a: "admin", op: "setPhone", secret: APIK.secret, kind: "s", key, phone: "" }, APIK.url);
      if (r && r.ok) { toast("انحذف الحساب"); await apiPull(); } else { toast("تعذّر الحذف", "err"); if (btn) btn.disabled = false; }
    } catch (e) { toast("تعذّر الاتصال، حاول مرة ثانية", "err"); if (btn) btn.disabled = false; }
  };
  W.unv204Ph = async (key, name) => {
    try {
      toast("جارٍ تحميل الصورة…");
      const r = await api({ a: "admin", op: "photo", secret: APIK.secret, kind: "s", key }, APIK.url);
      if (!r || !r.photo) return toast("ما نزّل صورة بعد", "err");
      if (W.v204View) W.v204View([{ n: "صورة " + name + ".jpg", m: "image/jpeg", u: r.photo }], 0);
    } catch (e) { toast("تعذّر تحميل الصورة", "err"); }
  };
  const box = D0 => {
    const L = (D0 && D0.unv) || []; if (!L.length) return "";
    const acc = {}; (D0.acc || []).forEach(a => { if (a.kind == "s") acc[a.key] = a; });
    const prof = {}; (D0.prof || []).forEach(p => { if (p.kind == "s") prof[p.key] = p; });
    const rows = L.map(u => ({ u, s: stu(u.key), a: acc[u.key] || {}, p: prof[u.key] || {} }))
      .sort((x, y) => String((x.s || {}).s || "").localeCompare(String((y.s || {}).s || ""), "ar") || String((x.s || {}).n || x.a.name || "").localeCompare(String((y.s || {}).n || y.a.name || ""), "ar"));
    return `<div class="box unv204"><h3>${typeof ic == "function" ? ic("shield") : ""} حسابات طلاب تحتاج تأكيدك (${A(rows.length)})</h3>
<p class="muted" style="margin:0 0 8px">هذول الطلاب ما عندهم رقم بطاقة موحدة بسجلات المدرسة، فأي واحد يعرف الاسم يكدر يسجّل بداله. طابق رقم البطاقة ويا بطاقة الطالب نفسه، وبعدين اضغط «تأكيد». لحد ما تأكده، درجاته ونتائجه وتبليغاته الخاصة ما توصله.</p>
<div class="tw"><table><tr><th>ت</th><th>اسم الطالب</th><th>الشعبة</th><th>رقم البطاقة اللي كتبه</th><th>الهاتف</th><th>تاريخ التسجيل</th><th></th></tr>
${rows.map((r, i) => { const n = (r.s || {}).n || r.a.name || r.u.key, d = String(r.a.created || "").slice(0, 10); return `<tr><td>${A(i + 1)}</td><td><b>${E(n)}</b></td><td>${E((r.s || {}).s || "")}</td><td class="nid">${E(r.u.nid || "—")}</td><td class="nid">${E(r.a.phone || "")}</td><td>${E(d ? A(d.split("-").reverse().join("/")) : "")}</td><td><div class="acts">${r.p.photo ? `<button class="btn ghost sm" onclick="unv204Ph('${E(r.u.key)}','${E(n).replace(/'/g, "")}')">الصورة</button>` : ""}<button class="btn sm" ${r.u.nid ? "" : "disabled"} onclick="unv204Ok(this,'${E(r.u.key)}','${E(r.u.nid)}')">تأكيد</button><button class="btn danger sm" onclick="unv204Del(this,'${E(r.u.key)}','${E(n).replace(/'/g, "")}')">حذف الحساب</button></div></td></tr>`; }).join("")}
</table></div></div>`;
  };
  on(() => {
    if (!has("ppBody")) return;
    const _pb = ppBody;
    ppBody = function (D0, ...a) {
      const h = _pb.call(this, D0, ...a);
      try { return box(D0) + h; } catch (e) { return h; }
    };
  });
})();
