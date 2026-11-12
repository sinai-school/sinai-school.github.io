/* v229 (2026-11-12، طلب المستخدم: «تنسيق أرقام ولغة عربية احترافية»):
   الأرقام في واجهة الإدارة وشاشة الدخول تُعرض بالأرقام العربية (٠–٩) مع الفاصلة العشرية «٫» وعلامة النسبة «٪».
   العرض فقط — البيانات لا تتغيّر. يُستثنى: الروابط والبريد، خانات الكتابة، العناصر dir="ltr" (أسماء المستخدمين والرموز)،
   قوالب الاستمارات الرسمية (.dxp)، وأي عنصر عليه data-noar. الكلمة الملتصقة بحروف لاتينية (A4، EMIS2) تبقى كما هي. */
(function () {
  try {
    const AR = "٠١٢٣٤٥٦٧٨٩";
    const SKIP = /^(INPUT|TEXTAREA|SELECT|OPTION|SCRIPT|STYLE|CODE|PRE|KBD|SAMP|svg|SVG|CANVAS)$/;
    const URLISH = /(https?:\/\/|www\.|@|\.(com|org|net|iq|io|me|dev|html|json|apk|pdf|xlsx|png|jpg)\b|t\.me|wa\.me)/i;
    const word = w => {
      if (URLISH.test(w) || /[A-Za-z][0-9]|[0-9][A-Za-z]/.test(w)) return w;
      let x = w.replace(/[0-9]/g, d => AR[d]);
      if ((x.match(/\./g) || []).length === 1) x = x.replace(/([٠-٩])\.([٠-٩])/, "$1٫$2");
      return x.replace(/([٠-٩])%/g, "$1٪").replace(/%([٠-٩])/g, "٪$1");
    };
    const fixText = t => /[0-9]/.test(t) ? t.replace(/\S+/g, w => /[0-9]/.test(w) ? word(w) : w) : t;
    const bad = el => {
      for (let p = el; p && p.nodeType === 1; p = p.parentElement) {
        if (p.id === "portal" || p.id === "pr221") return true;
        if (SKIP.test(p.tagName) || p.isContentEditable || p.dir === "ltr" || (p.dataset && p.dataset.noar != null)) return true;
        if (p.tagName === "A" && /^(https?:|mailto:|tel:)/i.test(p.getAttribute("href") || "")) return true;
        if (p.classList && (p.classList.contains("dxp") || p.classList.contains("dxpage"))) return true;
        if (p === document.body) return false;
      }
      return false;
    };
    const fixNode = n => { const v = fixText(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; };
    const walk = root => {
      if (!root) return;
      if (root.nodeType === 3) { if (/[0-9]/.test(root.nodeValue) && root.parentElement && !bad(root.parentElement)) fixNode(root); return; }
      if (root.nodeType !== 1 || !root.isConnected || bad(root)) return;
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      const L = []; let n;
      while ((n = tw.nextNode())) if (/[0-9]/.test(n.nodeValue)) L.push(n);
      for (const x of L) { if (x.parentElement && !bad(x.parentElement)) fixNode(x); }
    };
    let Q = [], raf = 0;
    const flush = () => { raf = 0; const q = Q; Q = [];
      const P = document.getElementById("portal"); if (P && !P.hidden) return; /* البوابة يتولاها v220e */
      if (q.length > 400) { walk(document.body); return; }
      for (const n of q) { try { walk(n); } catch (e) { } } };
    const start = () => {
      new MutationObserver(M => {
        for (const m of M) { if (m.type === "characterData") Q.push(m.target); else for (const a of m.addedNodes) Q.push(a); }
        if (Q.length && !raf) raf = requestAnimationFrame(flush);
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
      Q.push(document.body); raf = requestAnimationFrame(flush);
    };
    if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
    window.num229 = fixText;
  } catch (e) { console.warn("v229", e); }
})();
