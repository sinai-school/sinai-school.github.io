/* ===== v214q (6 Nov 2026) — صورة صفحة القيد: عارض بتكبير حقيقي (أصابع/ضغطتين/عجلة/أزرار) + «استبدال الصورة» من داخل العارض ===== */
(function () {
  "use strict";
  const W = window, D = document;
  const on = fn => { try { return fn(); } catch (e) { console.warn("v214q", e); } };

  const st = D.createElement("style");
  st.textContent = `#lb206.qz214{position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:#111416;touch-action:none;user-select:none;-webkit-user-select:none}
#lb206.qz214 .qzb{display:flex;align-items:center;gap:6px;padding:8px 10px;color:#fff;flex-wrap:wrap;padding-top:max(8px,env(safe-area-inset-top))}
#lb206.qz214 .qzb b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}
#lb206.qz214 .qzb button,#lb206.qz214 .qzb label{background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:9px;padding:6px 11px;font:inherit;font-size:14px;cursor:pointer;touch-action:manipulation;white-space:nowrap}
#lb206.qz214 .qzb .rep{background:#c9a24a;color:#000;border-color:#c9a24a}
#lb206.qz214 .qzs{flex:1;position:relative;overflow:hidden;touch-action:none}
#lb206.qz214 .qzs img{position:absolute;left:0;top:0;transform-origin:0 0;max-width:none;max-height:none;background:#fff;will-change:transform;-webkit-user-drag:none}
#lb206.qz214 .qzh{position:absolute;bottom:max(10px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);background:rgba(0,0,0,.55);color:#fff;font-size:12.5px;padding:5px 12px;border-radius:999px;pointer-events:none;white-space:nowrap}
#lb206.qz214 .qzm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px}`;
  D.head.appendChild(st);

  function viewer(src, title, rowId) {
    on(() => { const o = D.getElementById("lb206"); if (o) o.remove(); });
    const w = D.createElement("div"); w.id = "lb206"; w.className = "qz214";
    w.innerHTML = `<div class="qzb"><b></b>
<button type="button" data-z="out" aria-label="تصغير">−</button><button type="button" data-z="in" aria-label="تكبير">+</button><button type="button" data-z="fit">ملء الشاشة</button>
${rowId ? `<label class="rep">استبدال الصورة<input type="file" accept="image/*" hidden></label>` : ""}
<button type="button" data-z="x">إغلاق ✕</button></div>
<div class="qzs"><img alt=""><div class="qzm">جارٍ الفتح…</div><div class="qzh">كبّر بإصبعين أو اضغط مرتين</div></div>`;
    w.querySelector(".qzb b").textContent = title || "صفحة القيد";
    D.body.appendChild(w);
    on(() => { history.pushState({ s206: 1 }, ""); });
    const stg = w.querySelector(".qzs"), img = stg.querySelector("img"), msg = stg.querySelector(".qzm"), hint = stg.querySelector(".qzh");
    const S = { z: 1, z0: 1, x: 0, y: 0 };
    const apply = () => { img.style.transform = `translate(${S.x}px,${S.y}px) scale(${S.z})`; };
    const clamp = () => {
      const r = stg.getBoundingClientRect(), iw = img.naturalWidth * S.z, ih = img.naturalHeight * S.z;
      S.x = iw <= r.width ? (r.width - iw) / 2 : Math.min(0, Math.max(r.width - iw, S.x));
      S.y = ih <= r.height ? (r.height - ih) / 2 : Math.min(0, Math.max(r.height - ih, S.y));
    };
    const fit = () => { const r = stg.getBoundingClientRect(); if (!img.naturalWidth) return; S.z0 = S.z = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight); clamp(); apply(); };
    const zoomAt = (f, cx, cy) => {
      const r = stg.getBoundingClientRect(); const nz = Math.max(S.z0 * 0.8, Math.min(S.z0 * 14, S.z * f)); const k = nz / S.z;
      const px = cx - r.left, py = cy - r.top; S.x = px - (px - S.x) * k; S.y = py - (py - S.y) * k; S.z = nz; clamp(); apply();
      hint.style.display = "none";
    };
    const close = () => { if (!w.isConnected) return; on(() => history.back()); setTimeout(() => { if (w.isConnected) w.remove(); }, 400); };
    img.onload = () => { msg.style.display = "none"; fit(); };
    img.onerror = () => { msg.textContent = "تعذّر فتح الصورة"; };
    if (src) img.src = src; else msg.textContent = "ماكو صورة";
    W.addEventListener("resize", () => { if (w.isConnected) fit(); });

    w.querySelector(".qzb").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const r = stg.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (b.dataset.z == "in") zoomAt(1.5, cx, cy); else if (b.dataset.z == "out") zoomAt(1 / 1.5, cx, cy); else if (b.dataset.z == "fit") fit(); else if (b.dataset.z == "x") close();
    });
    stg.addEventListener("wheel", e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });

    /* أصابع: سحب بإصبع، تكبير بإصبعين، ضغطتين = تكبير/رجوع */
    const P = new Map(); let pinch = null, drag = null, lastTap = 0;
    stg.addEventListener("pointerdown", e => {
      stg.setPointerCapture && on(() => stg.setPointerCapture(e.pointerId));
      P.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (P.size == 2) { const [a, b] = [...P.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: S.z, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, x: S.x, y: S.y }; drag = null; }
      else if (P.size == 1) {
        drag = { x: e.clientX, y: e.clientY, ox: S.x, oy: S.y };
        const t = Date.now(); if (t - lastTap < 300) { if (S.z > S.z0 * 1.2) fit(); else zoomAt(2.6, e.clientX, e.clientY); lastTap = 0; drag = null; } else lastTap = t;
      }
    });
    stg.addEventListener("pointermove", e => {
      if (!P.has(e.pointerId)) return; P.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && P.size >= 2) {
        const [a, b] = [...P.values()], d = Math.hypot(a.x - b.x, a.y - b.y) || 1, r = stg.getBoundingClientRect();
        const nz = Math.max(S.z0 * 0.8, Math.min(S.z0 * 14, pinch.z * d / pinch.d)), k = nz / pinch.z;
        const cx = pinch.mx - r.left, cy = pinch.my - r.top, mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
        S.z = nz; S.x = mx - (cx - pinch.x) * k; S.y = my - (cy - pinch.y) * k; clamp(); apply(); hint.style.display = "none";
      } else if (drag) { S.x = drag.ox + e.clientX - drag.x; S.y = drag.oy + e.clientY - drag.y; clamp(); apply(); }
    });
    const up = e => { P.delete(e.pointerId); if (P.size < 2) pinch = null; if (P.size == 1) { const [a] = [...P.values()]; drag = { x: a.x, y: a.y, ox: S.x, oy: S.y }; } if (!P.size) drag = null; };
    stg.addEventListener("pointerup", up); stg.addEventListener("pointercancel", up);

    /* استبدال الصورة من داخل العارض */
    const inp = w.querySelector(".rep input");
    if (inp) inp.onchange = async () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      msg.style.display = ""; msg.textContent = "جارٍ حفظ الصورة الجديدة…";
      try {
        if (typeof qPhoto != "function") throw 0;
        await qPhoto(rowId, f);
        const r = (typeof QD != "undefined" ? QD : []).find(x => x.i == rowId);
        const d = r && r.im && typeof QIMG != "undefined" ? QIMG[r.im] : null;
        if (d) { img.src = d; } else msg.textContent = "حُفظت ✓";
      } catch (e) { msg.textContent = "تعذّر حفظ الصورة"; }
      inp.value = "";
    };
    return w;
  }

  /* qZoom: كل صور القيد (المرفوعة يدوياً أو من الأرشيف) تنفتح بالعارض الجديد */
  const hook = () => {
    if (typeof qZoom != "function" || qZoom.v214q) return;
    const z = async function (id) {
      const rowId = (typeof QSEL != "undefined" && QSEL) || ((typeof QD != "undefined" ? QD : []).find(x => x.im == id) || {}).i || "";
      const r = (typeof QD != "undefined" ? QD : []).find(x => x.i == rowId);
      const title = r ? "صفحة القيد " + (r.pg || "") + (r.n ? " — " + r.n : "") : "صفحة القيد";
      let src = typeof QIMG != "undefined" ? QIMG[id] : null;
      const w = viewer(src, title, rowId);
      if (!src && typeof qImgGet == "function") { on(async () => { src = await qImgGet(id); const im = w.querySelector("img"); if (src) im.src = src; else w.querySelector(".qzm").textContent = "تعذّر فتح الصورة"; }); }
    };
    z.v214q = 1;
    qZoom = z; W.qZoom = z;
  };
  /* v207g يغلّف qZoom بعد التحميل، فنركّب بعده */
  hook(); setTimeout(hook, 0); setTimeout(hook, 1500); setTimeout(hook, 5000);
  W.qz214 = viewer;
})();
