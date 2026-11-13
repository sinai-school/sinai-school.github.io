/* v224 (2026-11-11، بلاغ: «الطالب من يريد ينزل التطبيق ما ينزل — يطلعله تثبيت ويختفي»، هاتف هواوي)
   القديم چان يعتمد على ضغطة مبرمجة (a.click) وبعض المتصفحات (هواوي، والمتصفحات الداخلية مال تيليجرام/فيسبوك/تيك توك)
   تمنعها بصمت، والنافذة تنسد بأي لمسة برّاها. هسه: زر تنزيل حقيقي كبير بالنافذة + رابط احتياطي من GitHub +
   تنبيه واضح إذا الصفحة مفتوحة داخل تطبيق ثاني + خطوات هواوي (الوضع النقي) + النافذة ما تنسد إلا بزر «تم». */
(function () {
  "use strict";
  const W = window, D = document;
  if (typeof W.inst120 != "function" && typeof inst120 != "function") return;
  const _inst = inst120;
  const APK = (typeof APK120 == "string" && APK120) || "https://sinai.7svyn82yzr.workers.dev/sinai-school.apk";
  const ALT = "https://github.com/sinai-school/sinai-school.github.io/releases/latest/download/sinai-school.apk";
  const SITE = "https://sinai-school.github.io/";
  const ua = navigator.userAgent || "";
  /* متصفح داخلي (ما ينزّل ملفات): تيليجرام، فيسبوك/ماسنجر، إنستگرام، تيك توك، سناب، لاين، ويتشات */
  const inApp = /FBAN|FBAV|FB_IAB|Instagram|musical_ly|TikTok|BytedanceWebview|Snapchat|Line\/|MicroMessenger|Telegram/i.test(ua) || (typeof W.TelegramWebviewProxy != "undefined");
  const st = L => `<ol class="ist120">${L.map(x => `<li>${x}</li>`).join("")}</ol>`;
  W.inst224Copy = async () => { let ok = false; try { await navigator.clipboard.writeText(SITE); ok = true; } catch (e) { try { const t = D.createElement("textarea"); t.value = SITE; D.body.appendChild(t); t.select(); ok = D.execCommand("copy"); t.remove(); } catch (e2) { } } if (typeof toast == "function") toast(ok ? "انسخ الرابط ✓ — افتحه بمتصفح الهاتف" : SITE); };
  inst120 = W.inst120 = function (k) {
    if (k != "and" && k != "hw") return _inst.apply(this, arguments);
    if (typeof IS_APK != "undefined" && IS_APK) return toast("أنت تستخدم التطبيق حالياً ✓");
    const hw = k == "hw";
    const warn = inApp ? `<div style="background:#fff4d6;border:1px solid #e0b84a;border-radius:10px;padding:10px 12px;margin:0 0 10px;line-height:1.8"><b>أنت تفتح الرابط من داخل تطبيق آخر (تيليجرام/فيسبوك/تيك توك…)</b> وهذا لا ينزّل الملفات. افتح الرابط في متصفح الهاتف (Chrome أو متصفح هواوي) ثم اضغط «تثبيت».<div style="margin-top:8px"><button type="button" class="btn ghost sm" onclick="inst224Copy()">نسخ رابط المدرسة</button></div></div>` : "";
    const body = warn +
      `<a class="btn" style="display:flex;justify-content:center;font-size:1.05em;padding:14px;text-decoration:none;margin:0 0 6px" href="${APK}" download="sinai-school.apk" rel="noopener">⬇ تنزيل ملف التطبيق</a>` +
      `<p class="muted" style="margin:0 0 4px;text-align:center">إذا لم يبدأ التنزيل: <a href="${ALT}" rel="noopener" download="sinai-school.apk">رابط ثاني للتنزيل</a></p>` +
      st(["اضغط «تنزيل ملف التطبيق» وانتظر اكتماله (٢ ميغابايت).",
        "افتح الملف من الإشعارات أو من «التنزيلات» / «الملفات».",
        hw ? "إذا طلب الهاتف: الإعدادات ← الأمان ← اسمح بتثبيت التطبيقات من مصادر خارجية للمتصفح أو «الملفات»." : "إذا طلب الهاتف: اسمح للمتصفح بتثبيت التطبيقات غير المعروفة.",
        "اضغط «تثبيت» ثم «فتح».",
        hw ? "<b>إذا ظهرت نافذة التثبيت ثم اختفت:</b> الإعدادات ← النظام والتحديثات ← «الوضع النقي» (Pure Mode) ← عطّله، أو من AppGallery ← حسابي ← الإعدادات ← عطّل «فحص التطبيقات الخارجية»، ثم افتح الملف مرة أخرى."
          : "<b>إذا ظهرت نافذة التثبيت ثم اختفت:</b> افتح متجر Play ← صورتك ← Play للحماية ← الإعدادات ← وافق على التثبيت، أو اضغط «تفاصيل أكثر ← التثبيت على أي حال».",
        "إذا كانت لديك نسخة قديمة من التطبيق ولم يُقبل التثبيت: احذفها أولاً ثم ثبّت الجديدة (معلوماتك محفوظة لدى المدرسة).",
        "التطبيق يتحدّث تلقائياً ويعمل حتى بدون إنترنت — لا حاجة إلى تنزيله مرة أخرى."]);
    instModal120(hw ? "تثبيت التطبيق على هواوي" : "تثبيت التطبيق على أندرويد", body);
    /* النافذة ما تنسد بلمسة برّاها (چانت تختفي قبل ما يقرا) — بس بزر «تم» */
    const w = [...D.querySelectorAll(".zoom.inst")].pop(); if (w) { w.onclick = null; const bx = w.querySelector(".box"); if (bx) { bx.style.maxHeight = "88vh"; bx.style.overflowY = "auto"; } }
  };
})();
