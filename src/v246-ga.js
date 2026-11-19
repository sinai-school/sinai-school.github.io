/* v246 (2026-11-19، طلب المستخدم: «خلي عند ياسمين جاسب ملك يبين الخامس العلمي ب حتى تنزل درجاتهم الشهرية»):
   «تكليف بإدخال الدرجات» — مدرس يدخل درجات مادة بشعبة غير مسندة إليه بالجدول الأسبوعي، والجدول نفسه لا يتغيّر.
   يُحفظ بالخادم (kv GA244 عبر admin op:ga244) ويصل بوابة المدرس ضمن «المعلومات الخاصة» (ga). صندوق بتبويب «درجات المدرسين». */
(function () {
  "use strict";
  const W = window, D = document;
  const E = s => typeof esc == "function" ? esc(s) : String(s == null ? "" : s);
  const I = n => typeof ic == "function" ? ic(n) : "";
  const T0 = (m, k) => { try { toast(m, k); } catch (e) { } };
  let GA = null, busy = 0;
  const tName = k => { try { const f = (STF || []).find(x => x && x.id == k); return f ? f.name : k; } catch (e) { return k; } };
  const call = async b => { try { return await api(Object.assign({ a: "admin", secret: APIK.secret, op: "ga244" }, b), APIK.url); } catch (e) { return null; } };
  const load = async () => { if (busy) return; busy = 1; const r = await call({}); busy = 0; GA = r && r.ok ? (r.ga || []) : (GA || []); try { render(); } catch (e) { } };
  const save = async L => { const r = await call({ ga: L }); if (r && r.ok) { GA = r.ga || []; T0("حُفظ التكليف ✓ — يظهر في بوابة المدرس خلال ثوانٍ"); } else T0("تعذّر الحفظ", "err"); try { render(); } catch (e) { } };
  const subjects = () => { const S = new Set; try { (STF || []).forEach(f => { try { FSD.units(f).forEach(u => u.sj && S.add(u.sj)); } catch (e) { } }); } catch (e) { } return [...S].sort((a, b) => a.localeCompare(b, "ar")); };
  const teachers = () => { try { return (STF || []).filter(f => f && (f.status || "مستمر") == "مستمر" && !/خدم/.test((f.job || "") + (f.jtitle || ""))); } catch (e) { return []; } };
  W.ga246Add = () => {
    const v = id => (D.getElementById(id) || {}).value || "";
    const t = v("ga246t"), sj = v("ga246j"), sec = v("ga246s");
    if (!t || !sj || !sec) return T0("اختر المدرس والمادة والشعبة", "err");
    const L = (GA || []).filter(r => !(r[0] == t && r[1] == sj && r[2] == sec)).concat([[t, sj, sec]]); save(L);
  };
  W.ga246Del = i => { const r = (GA || [])[i]; if (!r) return; if (!confirm("حذف تكليف " + tName(r[0]) + " بدرجات " + r[1] + " — " + r[2] + "؟")) return; save((GA || []).filter((x, j) => j != i)); };
  function box() {
    if (GA === null) { setTimeout(load, 0); return `<div class="box"><h3>${I("pen")} تكليف مدرس بإدخال درجات شعبة</h3><p class="muted" style="margin:0">جارٍ التحميل…</p></div>`; }
    const SNx = typeof SN != "undefined" ? SN : [];
    const rows = GA.map((r, i) => `<tr><td class="l">${E(tName(r[0]))}</td><td>${E(r[1])}</td><td>${E(r[2])}</td><td><button class="btn ghost sm danger" onclick="ga246Del(${i})">حذف</button></td></tr>`).join("");
    return `<div class="box ga246"><h3>${I("pen")} تكليف مدرس بإدخال درجات شعبة</h3><p class="muted" style="margin:0 0 8px">للمدرس الذي يُدخل درجات مادة في شعبة غير مسندة إليه في الجدول الأسبوعي. تظهر الشعبة في «درجات طلابي» ببوابته، ولا يتغيّر الجدول.</p>
      ${rows ? `<div class="tw"><table><tr><th class="l">المدرس</th><th>المادة</th><th>الشعبة</th><th></th></tr>${rows}</table></div>` : `<p class="muted">لا يوجد تكليف.</p>`}
      <div class="fgrid"><label>المدرس<select id="ga246t"><option value="">— اختر —</option>${teachers().map(f => `<option value="${E(f.id)}">${E(f.name)}</option>`).join("")}</select></label>
      <label>المادة<select id="ga246j"><option value="">— اختر —</option>${subjects().map(s => `<option>${E(s)}</option>`).join("")}</select></label>
      <label>الشعبة<select id="ga246s"><option value="">— اختر —</option>${SNx.map(s => `<option>${E(s)}</option>`).join("")}</select></label></div>
      <div class="tools"><button class="btn" onclick="ga246Add()">${I("plus")} إضافة التكليف</button></div></div>`;
  }
  try {
    const _pb = ppBody;
    ppBody = function (D0) {
      let h = _pb.apply(this, arguments);
      try { if (typeof APIT != "undefined" && APIT == "tg" && D0 && D0.acc && typeof h == "string" && typeof OWN != "undefined" && OWN) h = box() + h; } catch (e) { }
      return h;
    };
  } catch (e) { console.warn("v246", e); }
})();
