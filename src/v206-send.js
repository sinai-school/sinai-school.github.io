/* ===== v206b — الإرسال: زر واحد = إرسال واحد، وحالة واضحة (جارٍ الإرسال… / ✓ أُرسل / ✗ ما أُرسل) ===== */
(function () {
  "use strict";
  const W = window, D = document;
  /* آخر زر انضغط (حتى نقفله وقت الإرسال) */
  let LB = null, LBT = 0;
  D.addEventListener("click", e => { const b = e.target.closest && e.target.closest("button,.btn"); if (b) { LB = b; LBT = Date.now(); } }, true);
  /* ورقة النتيجة: كبيرة وواضحة بأسفل الشاشة */
  function sheet(ok, msg) {
    let s = D.getElementById("snd206");
    if (!s) { s = D.createElement("div"); s.id = "snd206"; D.body.appendChild(s); }
    s.className = ok === 1 ? "ok" : ok === 0 ? "bad" : "wait";
    s.innerHTML = `<span class="i">${ok === 1 ? "✓" : ok === 0 ? "✗" : "⏳"}</span><span>${String(msg || "").replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]))}</span>`;
    s.style.display = "flex";
    clearTimeout(s.t); if (ok !== 2) s.t = setTimeout(() => { s.style.display = "none"; }, ok === 0 ? 7000 : 3500);
  }
  W.snd206 = sheet;
  /* نلتقط رسائل الإرسال حتى نعرف نجح لو لا */
  let CAP = null;
  if (typeof toast == "function") {
    const _t = toast;
    toast = function (m, k) { if (CAP) CAP.push([String(m || ""), k || ""]); return _t.apply(this, arguments); };
  }
  const BUSY = new Set;
  function guardSend(name, label) {
    const f = W[name]; if (typeof f != "function" || f.__s206) return;
    const g = async function () {
      const key = name + "|" + JSON.stringify([...arguments].map(String));
      if (BUSY.has(key)) { sheet(2, "الإرسال شغّال… انتظر لحظة، لا تضغط مرة أخرى"); return; }
      /* نفس التبليغ (نفس العنوان والنص) أُرسل قبل شوية؟ نسأل قبل ما يتكرر */
      const F = { apiNote: ["an_t", "an_b"], psNotify: ["pn_t", "pn_b"], xt206Note: ["x206tt", "x206tb"] }[name];
      let sig = "";
      if (F) {
        sig = name + "|" + F.map(id => ((D.getElementById(id) || {}).value || "").trim()).join("|") + "|" + (((D.getElementById("an_to") || D.getElementById("pn_to") || {}).value) || "");
        let H = {}; try { H = JSON.parse(localStorage.getItem("snd206h") || "{}"); } catch (e) { }
        const t = H[sig]; if (t && Date.now() - t < 6 * 3600e3 && !confirm("هذا التبليغ نفسه أُرسل سابقاً " + Math.max(1, Math.round((Date.now() - t) / 6e4)) + " دقيقة ✓\nهل تريد إرساله مرة أخرى؟")) { sheet(1, "التبليغ مُرسَل سابقاً — لم يُكرَّر"); return; }
      }
      BUSY.add(key);
      const btn = LB && Date.now() - LBT < 1500 ? LB : null, html = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.classList.add("snd206b"); btn.innerHTML = "⏳ جارٍ الإرسال…"; }
      sheet(2, "جارٍ الإرسال… لا تسكّر الصفحة");
      const cap = CAP = [];
      let err = 0;
      try { await f.apply(this, arguments); } catch (e) { err = 1; cap.push(["تعذّر الإرسال — حاول مجدداً", "err"]); }
      CAP = null; BUSY.delete(key);
      const last = cap[cap.length - 1] || ["", ""], bad = err || last[1] == "err", dup = /سبق|قبل|مكرر|dup/i.test(last[0]);
      const queued = /تُرسل تلقائياً|حُفظت|عودة الشبكة/.test(last[0]);
      if (sig && !bad && cap.length) { try { const H = JSON.parse(localStorage.getItem("snd206h") || "{}"); H[sig] = Date.now(); for (const k in H) if (Date.now() - H[k] > 864e5) delete H[k]; localStorage.setItem("snd206h", JSON.stringify(H)); } catch (e) { } }
      if (bad) sheet(0, last[0] || "لم يُرسل — حاول مجدداً");
      else if (!cap.length) { const s = D.getElementById("snd206"); if (s) s.style.display = "none"; }
      else sheet(1, dup ? "أُرسل هذا سابقاً — لم يُكرَّر ✓" : queued ? last[0] : (last[0] || label + " ✓"));
      if (btn && btn.isConnected) {
        if (bad) { btn.disabled = false; btn.innerHTML = html; btn.classList.remove("snd206b"); }
        else if (cap.length) {
          btn.innerHTML = queued ? "⏳ بالانتظار" : "✓ أُرسل"; btn.classList.add("snd206ok");
          setTimeout(() => { if (btn.isConnected) { btn.disabled = false; btn.innerHTML = html; btn.classList.remove("snd206b", "snd206ok"); } }, 2500);
        } else { btn.disabled = false; btn.innerHTML = html; btn.classList.remove("snd206b"); }
      }
    };
    g.__s206 = 1;
    W[name] = g;
  }
  const L = [["apiNote", "أُرسل التبليغ"], ["psNotify", "أُرسل التبليغ"], ["psReport", "أُرسل البلاغ"], ["v202GSend", "أُرسلت الدرجات"], ["v202Rep", "أُرسل البلاغ"], ["v202TRep", "أُرسل الرد"], ["v202Rel", "أُرسلت النتائج"], ["v204ExPub", "نُشر الجدول"], ["xt206Note", "أُرسل التبليغ"], ["xt206SaveS", "حُفظ ووصل"]];
  const arm = () => L.forEach(([n, l]) => { try { guardSend(n, l); } catch (e) { } });
  arm(); setTimeout(arm, 1500); setTimeout(arm, 6000);

  /* درجات المدرس: جنب كل طالب تبين الدرجة المرسلة، حتى تعرف شنو وصل وما تعيد */
  const mark = () => {
    try {
      if (typeof G202 == "undefined" || !G202 || !G202.rows) return;
      D.querySelectorAll('.g202 input[id^="gv_"]').forEach(inp => {
        const k = inp.id.slice(3), r = G202.rows.find(x => String(x.skey) == k && x.label == G202.lbl && x.subj == G202.sj);
        const td = inp.closest("tr") && inp.closest("tr").lastElementChild; if (!td) return;
        let m = td.querySelector(".snd206m");
        if (r && String(r.val) !== "") { if (!m) { m = D.createElement("small"); m.className = "snd206m"; td.appendChild(m); } m.textContent = "✓ مرسلة: " + (typeof toAr == "function" ? toAr(r.val) : r.val); }
        else if (m) m.remove();
      });
    } catch (e) { }
  };
  setInterval(mark, 1200);

  const st = D.createElement("style");
  st.textContent = `#snd206{position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:10001;max-width:520px;margin:auto;display:none;align-items:center;gap:10px;padding:14px 16px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 14px 40px rgba(0,0,0,.28);color:#fff}
#snd206.ok{background:#1f7a4d}#snd206.bad{background:#b3261e}#snd206.wait{background:#24423a}#snd206 .i{font-size:22px;line-height:1}
.snd206b{opacity:.85;pointer-events:none}.snd206ok{background:#1f7a4d!important;color:#fff!important;border-color:#1f7a4d!important;opacity:1}
.snd206m{display:block;color:#1f7a4d;font-size:12px;font-weight:700;margin-top:3px;white-space:nowrap}`;
  D.head.appendChild(st);
})();
