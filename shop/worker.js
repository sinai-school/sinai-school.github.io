// متجر مجمع H&H — خادم Cloudflare (واجهة + مزامنة قناة تلگرام + صور دائمية + لوحة تحكم)
import APP from './app.html';
import ADMIN from './admin.html';
import HOST_PHP from './host/index.php';
import HOST_HT from './host/htaccess.txt';

const CH = 'husseinhandh';
const BACKFILL_DAYS = 120;

export const DEF = {
  name: 'مجمع H&H',
  tagline: 'إكسسوارات الهواتف والتقنية — أصلية وبضمان',
  wa1: '9647730001588', wa2: '9647732222773',
  tgUser: 'h_h_mobail', tgChannel: CH,
  ig: 'h.and.h_mobile', tt: 'hussein_handh', fb: 'HandHMobile', yt: 'husseinhandh',
  address: 'بغداد — شارع فلسطين، مجاور الكوخ، مكتب H&H',
  delivery: 'توصيل لكل العراق بـ ٥ آلاف دينار',
  notice: '',
  ticker: 'الحمد لله والشكر لله ربّ العالمين دائماً وأبداً',
  waGroup: 'https://chat.whatsapp.com/FvFJNN4B3DU3r8Zw96uhig',
  waChannel: 'https://whatsapp.com/channel/0029VbCZofYISTkPK9NW1729',
  hours: 'يومياً من ١٠ الصبح لحد ١٢ بالليل — الجمعة من ١ الظهر لحد ١٢ بالليل',
  sched: [[10, 24], [10, 24], [10, 24], [10, 24], [10, 24], [13, 24], [10, 24]],
  mapQ: 'H&H شارع فلسطين قرب الكوخ بغداد',
};

export const CATS = [
  ['شواحن', 'charger'], ['باوربانك', 'battery'], ['كيبلات', 'cable'], ['سماعات', 'buds'],
  ['سبيكرات', 'speaker'], ['ساعات ذكية', 'watch'], ['كفرات', 'case'], ['زجاج حماية', 'glass'],
  ['اكسسوارات سيارة', 'car'], ['ستاندات وتصوير', 'tripod'], ['عناية شخصية', 'care'],
  ['منزل وأدوات', 'home'], ['حقائب', 'bag'], ['أجهزة وإلكترونيات', 'chip'], ['منوعات', 'spark'],
];

// ---------- تصنيف الأقسام (دقيق): الاسم أولاً، وبعدين رأي الذكاء الاصطناعي، وبعدين الوصف ----------
const CRX = {
  car: /سيار[ةه]|للسيار|السياره|السائق|سائق|جداح[ةه]|كار ?بلي|carplay|اندرويد اوتو|أندرويد أوتو|داش ?كام|dash ?cam|جمبر|جامبر|منفاخ|معطرات|لوح[ةه] رقم/i,
  stand: /ستاند|حامل|هولدر|holder|ترا?يبود|tripod|عص[اى] سيلفي|سيلفي|gimbal|جمبل|مانع اهتزاز|مايك|مايكروفون|رنك ?لايت|ring ?light|fill ?light|انار[ةه] ?(تصوير|احترافي|ماكسيف)|إنار[ةه] ?(تصوير|احترافي|ماكسيف)|اناره ماكسيف|مسك[ةه]|متتبع للوجه/i,
  power: /باور ?بانك|باوربنك|power ?bank|شاحن طوار|طوارئ? ?\d|\d{4,6} ?mah|\d{1,2},?000 ?mah/i,
  glass: /زجاج|لزك[ةه]|لاصق[ةه] شاش|حماي[ةه] شاش|حماي[ةه] (ال)?كامير|screen ?protector|lens ?protector/i,
  case: /كفر|كڤر|جراب|غلاف|cover|\bcase\b|اكرلك|أكريلك|skinarma|كيس هاتف/i,
  watch: /سوار ذكي|باند رياضي|smart ?band|سير ساع|^ساع[ةه]|ساع[ةه] (ذكي[ةه]|سمارت|يد)|سمارت ?واتش|smart ?watch|\bwatch|سيور[ةه]?\s*(ساع|ابل)/i,
  speaker: /سبيكر|مكبر صوت|speaker|مسرح منزلي|السينما في المنزل|ساوند ?بار|soundbar/i,
  buds: /سماع[ةه]|ايربود|إيربود|airpods?|هيدفون|هدفون|headphone|earbuds|\bbuds/i,
  charger: /شاحن|charger|راس شحن|رأس شحن|\bgan\b/i,
  cable: /كيبل|كابل|وصل[ةه]|cable/i,
  tech: /قلم (اي|آي|ا)?باد|قلم ل?(لا|ال)?ايباد|pencil|كيبورد|keyboard|ماوس|mouse|مودم|راوتر|router|دنكل|dongle|فلاش ميموري|ميموري|هارد|درون|drone|كاميرا|camera|جهاز (أ|ا)لعاب|سبور[ةه]|ليزر|كاشف كاميرات|تابلت|tablet|\bpad ?\d|ايباد|آيباد|مبرد|cooler|ريموت|بطاريات/i,
  care: /مشط|حلاق[ةه]|شعر|مكوا[ةه]|سشوار|شسوار|كيمي|ترمر|بشر[ةه]|مكياج|عطر|ميزان|فرش[اه]?[ةه]? ?اسنان|تدليك|مساج|اضافر|أظافر|مكراض|الضغط|وبر|نظار[ةه]/i,
  bag: /حقيب[ةه]|شنط[ةه]|جنط[ةه]|\bbag\b|محفظ[ةه]|محافظ|مقلم[ةه]|باج/i,
  home: /منقي[ةه]|نافور|كرسي|مسند|لايت مكتبي|انذار|بلور|خلاط|مكنس[ةه]|مبخر[ةه]|مطبخ|مصباح|اضاء[ةه]|إضاء[ةه]|انار[ةه] مكتبي|إنار[ةه] مكتبي|مروح[ةه]|منظف|تنظيف|مرطب|ترمس|قلا[يي][ةه]|سيار كهرباء|قهو[ةه]|سلاش|ايس ?كريم|مك عازل|مفك|درنفيس|قانص[ةه]|حشرات|سرير|مقص|مطار[ةه]|كابس[ةه]|ليف[ةه]/i,
};
const CNAME = { car: 'اكسسوارات سيارة', stand: 'ستاندات وتصوير', power: 'باوربانك', glass: 'زجاج حماية', case: 'كفرات', watch: 'ساعات ذكية', speaker: 'سبيكرات', buds: 'سماعات', charger: 'شواحن', cable: 'كيبلات', tech: 'أجهزة وإلكترونيات', care: 'عناية شخصية', bag: 'حقائب', home: 'منزل وأدوات' };
const CORDER = ['glass', 'case', 'watch', 'speaker', 'buds', 'charger', 'cable', 'tech', 'care', 'bag', 'home'];
function catByText(t) {
  t = String(t || '');
  if (!t.trim()) return '';
  if (CRX.car.test(t)) return CNAME.car;
  if (/^\s*(كفر|كڤر|حافظ[ةه]|غلاف|جراب|كيس هاتف)/.test(t)) return CNAME.case;
  if (/مبخر|بخور/.test(t)) return CNAME.home;
  if (/اسنان|أسنان/.test(t)) return CNAME.care;
  if (/^\s*(حماي[ةه] (شاش|كامير)|زجاج)/.test(t)) return CNAME.glass;
  if (/سماع[ةه]|ايربود|إيربود|earbuds|airpods/i.test(t) && !/^\s*(ستاند|ترا?يبود)/.test(t)) return CNAME.buds;
  if (/فلاش ميموري|ميموري|مودم|كيبورد|keyboard|ماوس|دنكل|درون|قلم (اي|آي|ا)?باد/i.test(t)) return CNAME.tech;
  if (CRX.stand.test(t)) return CNAME.stand;
  if (CRX.power.test(t)) return CNAME.power;
  for (const k of CORDER) if (CRX[k].test(t)) return CNAME[k];
  return '';
}
// ---------- الأقسام الفرعية داخل كل قسم ----------
const SUBS = {
  'اكسسوارات سيارة': [['ستاندات السيارة', /ستاند|حامل|مسك[ةه]|هولدر/], ['مباخر ومعطرات', /مبخر|معطر|عطر|بخور/], ['جمبر ومنفاخ', /جمبر|جامبر|منفاخ|طوار/], ['كاربلي وكاميرات', /كار ?بلي|carplay|اندرويد اوتو|أندرويد أوتو|داش|كام/], ['شواحن ومنافذ السيارة', /شاحن|منفذ|منافذ|جداح|سيار كهرباء|تحويل|كيبل/], ['إنارة وديكور', /انار|إنار|اضاء|إضاء|ديكور|لوح|مرآ[ةه]|مراي[ةه]|جيب/]],
  'شواحن': [['شواحن لاسلكية وماكسيف', /لاسلكي|ماكسيف|magsafe|wireless/i], ['شاحن مع كيبل', /كيبل|\+/], ['رؤوس شحن', /./]],
  'باوربانك': [['باوربانك ماكسيف', /ماكسيف|magsafe/i], ['للراوتر والنانو', /راوتر|نانو|router/i], ['سعات كبيرة', /([2-9]\d|1\d\d),?\d{3} ?mah|[2-9]\d,?000|100,?000|80,?000|50,?000|30,?000|25,?000|27,?000/i], ['سعات عادية', /./]],
  'كيبلات': [['متعدد ومسلح', /4 في 1|٤ في ١|متعدد|مسلح/], ['شاشة و HDMI', /hd|شاش/i], ['تايب سي وايفون', /./]],
  'سماعات': [['أذن مفتوحة وكليب', /open ear|كليب|clip|مفتوح|خارجي/i], ['سماعات رأس', /راس|رأس|هيدفون|headphone|باند|خوذ/i], ['سلكية', /(^|[^ا])سلكي/], ['ايربودز ولاسلكية', /./]],
  'ستاندات وتصوير': [['مايكات', /مايك|mic/i], ['ترايبود وسيلفي', /ترا?يبود|سيلفي|مانع اهتزاز|متتبع|gimbal/i], ['إنارة تصوير', /انار|إنار|رنك|ring|لايت|light/i], ['ستاندات موبايل وآيباد', /./]],
  'عناية شخصية': [['حلاقة', /حلاق|كيمي|ترمر|تصفير|شعر الانف|شعر الأنف|موس/], ['تصفيف الشعر', /مشط|سشوار|شسوار|شعر|مجفف/], ['أسنان', /اسنان|أسنان/], ['أظافر وبشرة', /اضافر|أظافر|اظافر|بشر|مكراض|وجه/], ['تدليك وصحة', /تدليك|مساج|ضغط|نوم|ميزان/], ['نظارات وحماية العين', /نظار|عين/], ['عطور', /عطر|معطر/]],
  'منزل وأدوات': [['المطبخ', /بلور|خلاط|قهو|مطار|سلاش|ايس|قلا|ترمس|مك |مك$|كوب/], ['تنظيف', /مكنس|تنظيف|منظف|وبر|ليف|غسيل|منقي/], ['مراوح وإنارة', /مروح|انار|إنار|لايت|لامب|مصباح|اضاء|إضاء/], ['مباخر', /مبخر|بخور|معطر/], ['عدد وأدوات', /مفك|درنفيس|مقص|كابس|مضخ|قانص|براغي/], ['سفر وتخييم', /كرسي|سرير|سفر|نفخ|سفاري/], ['كهرباء ومنافذ', /سيار كهرباء|منافذ|نقاط كهرباء/]],
  'أجهزة وإلكترونيات': [['آيباد وأقلام', /قلم|ايباد|آيباد|تابلت|tablet|pad/i], ['كيبورد وماوس', /كيبورد|ماوس|keyboard|mouse/i], ['مبردات الهاتف', /مبرد|cooler/i], ['كاميرات وكواشف', /كامير|كاشف|انذار/], ['ألعاب', /العاب|ألعاب|لعب/], ['إنترنت وشاشات', /مودم|راوتر|دنكل|تلفزيون/], ['سبورات وليزر', /سبور|ليزر|مؤشر/]],
  'ساعات ذكية': [['سيور الساعات', /سير|سيور/], ['أساور ذكية', /سوار|باند/], ['ساعات ذكية', /./]],
  'كفرات': [['حلقات وملحقات', /حلق|مسك|اكسسوار/], ['آيباد', /ايباد|آيباد|تاب/], ['سامسونك', /سامسونك|سامسونج|samsung|galaxy/i], ['آيفون', /./]],
  'زجاج حماية': [['حماية كاميرا', /كامير/], ['حماية شاشة', /./]],
  'حقائب': [['محافظ', /محفظ|محافظ|باج/], ['حقائب ظهر', /ظهر/], ['حقائب جانبية', /جانبي/], ['حقائب يد', /./]],
};
export function smartSub(cat, text) {
  const l = SUBS[cat]; if (!l) return '';
  for (const [n, re] of l) if (re.test(String(text || ''))) return n;
  return 'أخرى';
}
export function smartCat(name, ai, desc) {
  const names = [name, ai && ai.title].filter(Boolean).join(' — ');
  const byName = catByText(names);
  if (byName) return byName;
  if (ai && ai.cat && Object.values(CNAME).includes(ai.cat)) return ai.cat;
  return catByText(String(desc || '').slice(0, 300)) || 'منوعات';
}

const KW = [
  ['باوربانك', /باور ?بانك|باوربنك|شاحن طوار|power ?bank|mah/i],
  ['اكسسوارات سيارة', /سيار[ةه]|للسيار|car /i],
  ['كفرات', /كفر|كڤر|اكرلك|أكريلك|جراب|حافظ[ةه]|cover|case/i],
  ['زجاج حماية', /زجاج|لزكة|لاصق[ةه] شاش|حماي[ةه] شاش|screen/i],
  ['ساعات ذكية', /ساع[ةه]|watch/i],
  ['سبيكرات', /سبيكر|مكبر صوت|speaker/i],
  ['سماعات', /سماع[ةه]|ايربود|إيربود|airpod|هيدفون|هدفون|headphone|buds/i],
  ['كيبلات', /كيبل|كابل|وصل[ةه]|cable/i],
  ['شواحن', /شاحن|راس شحن|charger|ماكسيف|magsafe/i],
  ['ستاندات وتصوير', /ترايبود|تراي?بود|ستاند|حامل|مايك|مايكروفون|رنك ?لايت|ring ?light|كاميرا|سلفي|gimbal|جمبل/i],
  ['عناية شخصية', /مشط|حلاق|شعر|مكوا[ةه]|سشوار|ترمر|بشر[ةه]|مكياج|عطر|ميزان|فرشا[ةه] اسنان|تدليك|مساج/i],
  ['حقائب', /حقيب[ةه]|شنط[ةه]|جنط[ةه]|bag/i],
  ['منزل وأدوات', /بلور|خلاط|مكنس[ةه]|مبخر[ةه]|مطبخ|مصباح|اضاء[ةه]|إضاء[ةه]|ليت|مروح[ةه]|منظف|مرطب|ترمس|قلا[ية]/i],
];

const AR = '٠١٢٣٤٥٦٧٨٩', FA = '۰۱۲۳۴۵۶۷۸۹';
export const digits = s => String(s || '').replace(/[٠-٩]/g, d => AR.indexOf(d)).replace(/[۰-۹]/g, d => FA.indexOf(d));
const SEP = /^[\s\-—–_ـ=•.*~]{4,}$/;
const NOISE = /^(عرض يوم|عرض اليوم|عروض اليوم|اللهم|بعد الصلا|التفاصيل اكثر|التفاصيل أكثر|\(\(|للحجز|للاستفسار|العنوان|رابط|توصيل)/;

export function parsePrice(txt) {
  const lines = digits(txt).split('\n');
  const K = '(?:الف|ألف|الاف|آلاف|ألاف|اﻻف)';
  const pick = l => {
    // رقم ملاصق لكلمة «ألف» أولاً، وما ناخذ رقم ملزوگ بحروف إنگليزية مثل mobile7
    let m = l.match(new RegExp('(?<![A-Za-z\\d.,])(\\d[\\d,.]*)\\s*' + K));
    let n;
    if (m) n = parseFloat(m[1].replace(/,/g, '')) * (parseFloat(m[1].replace(/,/g, '')) < 1000 ? 1000 : 1);
    else {
      m = l.match(/(?<![A-Za-z\d.,])(\d{1,3}(?:[,.]\d{3})+|\d{4,7})(?![A-Za-z\d])/);
      if (!m) { m = l.match(/(?<![A-Za-z\d.,])(\d{1,3})(?![A-Za-z\d.,])/); if (!m) return 0; n = +m[1] * 1000; }
      else n = parseFloat(m[1].replace(/[,.]/g, ''));
    }
    n = Math.round(n);
    return n >= 1000 && n < 5e7 ? n : 0;
  };
  for (const l of lines) if (/سعر/.test(l) && !/توصيل/.test(l)) { const p = pick(l.replace(/.*?سعر[ه]?/, '')); if (p) return p; }
  for (const l of lines) if (new RegExp(K + '|دينار').test(l) && !/توصيل|توفير/.test(l)) { const p = pick(l); if (p) return p; }
  return 0;
}

export function classify(name, txt) {
  for (const s of [name, txt]) for (const [c, re] of KW) if (re.test(s || '')) return c;
  return 'منوعات';
}

export function parseText(raw) {
  const txt = String(raw || '').replace(/\r/g, '');
  const price = parsePrice(txt);
  if (!price) return null;
  // منشورات مو منتجات: تشويق، أو عروض داخل المحل بس بسعر رمزي
  if (/ترقبوا/.test(txt) || (price <= 2000 && /داخل المحل/.test(txt))) return null;
  const all = txt.split('\n').map(s => s.replace(/\s+/g, ' ').trim());
  const block = [];
  for (const l of all) { if (SEP.test(l) || /^-{3,}|—{2,}/.test(l)) { if (block.length) break; else continue; } if (/السعر/.test(l)) break; block.push(l); }
  const body = block.filter(l => l && !NOISE.test(l));
  const isOffer = /عرض يوم|عرض اليوم|عروض/.test(txt);
  const clean = body.map(l => l.replace(/[🔥😳😍❤️✅👌🤩💥⭐️✨👈👇]+/gu, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  const parts = clean.map(l => l.replace(/\*+/g, '').trim()).filter(l => l && l !== '+' && !/^(للطاكين|دلع|هذا العرض|اقوى عرض|أقوى عرض|عرض |تشكيل|موديل روع|جماعة|الجمال|روعه|روعة|توفر|وصل|جديد|و|التفاصيل|تفاصيل|للحجز|العرض)/.test(l));
  const noun = l => KW.some(([, re]) => re.test(l)) || !!catByText(l) || /\b[A-Za-z]{3,}\b/.test(l);
  const BADL = /^(بعده|بعد |الاجهز|الأجهز|ال?اصلي|ال?أصلي|ال?غني[ةه]|اقوى|أقوى|اعلى|أعلى|هذا العرض|فدشي|خفيف|لاصحاب|مع ال?حافظ|حلو|منتج$|ال?كمي[ةه]|والكمي[ةه]|ارخص|أرخص|ال?فخام|ال?جمال|نعم|موديل|خليك|التفاصيل|تفاصيل|ب ?\d*\s*(الف|ألف)|بس |ضمن يوم|السعر|ترقبوا|متوفر|اصدار|إصدار|ميزات|مميزات|تطبيق خاص|مريح|وقت تشغيل|\d+ ?ساع)/;
  const score = (l, i) => (BADL.test(l) ? -10 : 0) + (noun(l) ? 4 : 0) + (catByText(l) ? 2 : 0) + (l.length >= 8 && l.length <= 70 ? 1 : -1) + (/^من /.test(l) ? -3 : 0) - i * 0.3;
  let ni = -1, bs = -1e9; parts.forEach((l, i) => { const v = score(l, i); if (v > bs) { bs = v; ni = i; } });
  if (bs < 0) ni = parts.findIndex(l => !BADL.test(l));
  let name = (ni >= 0 ? (ni + 1 < parts.length && /^من /.test(parts[ni + 1]) && parts[ni].length < 40 ? parts[ni] + ' ' + parts[ni + 1] : parts[ni]) : '') || clean.map(l => l.replace(/\*+/g, '')).find(l => l && !BADL.test(l)) || 'منتج';
  name = name.replace(/^(للطاكين|جماعة)[^ ]* ?(فقط)? ?/, '').replace(/\s*و?بضمان.*$/, '').replace(/\s*(فقط|روعه|روعة)\s*$/, '');
  name = name.replace(/فقط$/, '').trim().slice(0, 90);
  const until = /فقط يوم|ضمن يوم|لحين نفاد/.test(txt);
  const warranty = /ضمان\s*(سن[ةه]|عام)/.test(txt) ? 'سنة' : /فحص/.test(txt) ? 'فحص وتشغيل' : '';
  const desc = clean.join('\n').replace(/\n\+\n/g, '\n+ ');
  const from = digits(txt).split('\n').filter(l => /سعر/.test(l) && !/توصيل/.test(l) && parsePrice(l)).length > 1 ? 1 : 0;
  return { name, price, from, cat: classify(name, desc), desc, offer: isOffer ? 1 : 0, until: until ? 1 : 0, warranty, brand: brandOf(desc) };
}

const BRANDS = ['Anker', 'Baseus', 'Porodo', 'Green Lion', 'Green', 'XO', 'Joyroom', 'Ugreen', 'Hoco', 'Xiaomi', 'Samsung', 'Apple', 'Noxo', 'Master', 'Lenovo', 'Remax', 'Awei', 'Recci', 'Borofone', 'Powerology', 'Oraimo', 'Huawei', 'JBL', 'Soundcore', 'Haylou', 'QCY'];
function brandOf(s) { s = String(s || ''); for (const b of BRANDS) if (new RegExp('\\b' + b + '\\b', 'i').test(s)) return b === 'Noxo' ? 'NOXO' : b === 'Master' ? 'Master' : b; return ''; }

// ---------- تحليل صفحة القناة ----------
const unesc = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
export function parseChannel(html) {
  const out = [];
  const re = /<div class="tgme_widget_message ([^"]*)" data-post="[^/"]+\/(\d+)"/g;
  const hits = []; let m;
  while ((m = re.exec(html))) hits.push([m.index, +m[2], m[1]]);
  for (let i = 0; i < hits.length; i++) {
    const [pos, id, cls] = hits[i];
    const seg = html.slice(pos, i + 1 < hits.length ? hits[i + 1][0] : html.length);
    const dt = (seg.match(/datetime="([^"]+)"/) || [])[1] || '';
    let txt = '';
    const t = seg.match(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/);
    if (t) txt = unesc(t[1].replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '')).trim();
    if (/sticker/.test(cls) || /tgme_widget_message_sticker/.test(seg)) { out.push({ id, kind: 'sticker', dt }); continue; }
    const photos = [...seg.matchAll(/<a class="tgme_widget_message_photo_wrap[^"]*"[^>]*?style="[^"]*?background-image:url\('([^']+)'\)/g)].map(x => x[1]);
    const vids = [...seg.matchAll(/tgme_widget_message_video_thumb" style="background-image:url\('([^']+)'\)/g)].map(x => x[1]);
    const media = photos.map(u => ['photo', u]).concat(vids.map(u => ['video', u]));
    media.forEach(([k, u], j) => out.push({ id: id + j, kind: k, url: u, dt, txt: j === media.length - 1 && txt ? txt : null }));
    if (!media.length) out.push({ id, kind: txt ? 'text' : 'other', txt, dt });
  }
  return out;
}

// ---------- أدوات عامة ----------
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-max-age': '86400' };
const J = (o, st = 200, h = {}) => new Response(JSON.stringify(o), { status: st, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...CORS, ...h } });
const now = () => Date.now();
async function getSettings(env) {
  const r = await env.DB.prepare('select k,v from settings').all();
  const s = { ...DEF };
  for (const x of r.results || []) { try { s[x.k] = JSON.parse(x.v); } catch { s[x.k] = x.v; } }
  return s;
}
async function setSetting(env, k, v) { await env.DB.prepare('insert into settings(k,v) values(?,?) on conflict(k) do update set v=excluded.v').bind(k, JSON.stringify(v)).run(); }
async function log(env, msg) { try { await env.DB.prepare('insert into log(at,msg) values(?,?)').bind(now(), String(msg).slice(0, 500)).run(); await env.DB.prepare('delete from log where at < ?').bind(now() - 7 * 864e5).run(); } catch { } }

export function eff(p) {
  const a = JSON.parse(p.auto || '{}'), o = JSON.parse(p.ov || '{}'), ai = p.ai ? JSON.parse(p.ai) : null;
  const media = JSON.parse(p.media || '[]');
  const r = { ...a, ...o, id: p.id, post: p.post, src: p.src, dt: p.dt };
  if (ai && ai.title && !o.name && p.src === 'tg') r.name = ai.title;
  if (!o.cat) r.cat = smartCat(o.name || a.name, ai, a.desc);
  if (!o.sub) r.sub = smartSub(r.cat, [r.name, a.name, ai && ai.title].filter(Boolean).join(' '));
  r.ai = ai ? { specs: ai.specs || [], desc: ai.desc || '', uses: ai.uses || [] } : null;
  let imgs = o.imgs || media.filter(x => !x.v).map(x => x.k);
  // أول صورة بالألبوم غالباً بوستر «عرض يوم…» فنخلي صورة المنتج نفسه هي الغلاف
  if (!o.imgs && imgs.length >= 3) imgs = [...imgs.slice(1), imgs[0]];
  if (!imgs.length && !o.imgs) imgs = media.map(x => x.k);
  r.imgs = imgs;
  r.videos = media.filter(x => x.v).map(x => x.k);
  if (r.offer && p.dt && now() - Date.parse(p.dt) > 3 * 864e5 && !('offer' in o)) r.offer = 0;
  if (r.avail === undefined) r.avail = 1;
  return r;
}

// ---------- المزامنة ----------
async function fetchPage(before) {
  const u = `https://t.me/s/${CH}` + (before ? `?before=${before}` : '');
  const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36', 'accept-language': 'ar,en;q=0.8' } });
  if (!r.ok) throw new Error('tg ' + r.status);
  return r.text();
}

async function saveMsgs(env, msgs) {
  if (!msgs.length) return 0;
  const st = env.DB.prepare('insert into msgs(id,kind,url,txt,dt,at) values(?,?,?,?,?,?) on conflict(id) do update set url=coalesce(excluded.url,msgs.url), txt=coalesce(excluded.txt,msgs.txt), kind=excluded.kind');
  const b = msgs.map(x => st.bind(x.id, x.kind, x.url || null, x.txt || null, x.dt || null, now()));
  for (let i = 0; i < b.length; i += 50) await env.DB.batch(b.slice(i, i + 50));
  const q = env.DB.prepare('insert or ignore into imgq(k,url,at) values(?,?,?)');
  const qb = msgs.filter(x => x.kind === 'photo' || x.kind === 'video').map(x => q.bind((x.kind === 'video' ? 'v' : 't') + x.id, x.url, now()));
  for (let i = 0; i < qb.length; i += 50) await env.DB.batch(qb.slice(i, i + 50));
  return msgs.length;
}

export function normTokens(s) { return new Set(digits(s).toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 1 && !/^(مع|من|الى|على|او|و|فقط|عرض|يوم|هديه|جدا|روعه)$/.test(w))); }
export function sim(a, b) { const A = normTokens(a), B = normTokens(b); if (!A.size || !B.size) return 0; let n = 0; for (const w of A) if (B.has(w)) n++; return n / Math.min(A.size, B.size); }

export async function rebuild(env, lo, hi) {
  // يبني المنتجات من الرسائل: كل نص بيه سعر = منتج، وصوره = الوسائط اللي قبله لحد آخر فاصل
  const rows = (await env.DB.prepare('select id,kind,txt,dt from msgs where id between ? and ? order by id').bind(lo - 40, hi + 40).all()).results || [];
  const prods = (await env.DB.prepare('select id,src,post,auto,media from products where post between ? and ? or (src=\'sheet\' and post is null)').bind(lo - 40, hi + 40).all()).results || [];
  const byPost = new Map(prods.filter(p => p.post).map(p => [p.post, p]));
  const sheet = prods.filter(p => p.src === 'sheet');
  let pend = [], made = 0;
  const ops = [];
  const up = env.DB.prepare('insert into products(id,src,post,auto,media,dt,at) values(?,?,?,?,?,?,?) on conflict(id) do update set auto=excluded.auto, media=excluded.media, dt=excluded.dt');
  const link = env.DB.prepare('update products set post=?, media=?, dt=coalesce(dt,?) where id=?');
  let started = false;
  for (const r of rows) {
    if (!started) { if (r.kind === 'text' || r.kind === 'sticker' || r.kind === 'other' || r.txt) { started = true; pend = []; } continue; }
    const isMedia = r.kind === 'photo' || r.kind === 'video';
    if (isMedia) pend.push({ k: (r.kind === 'video' ? 'v' : 't') + r.id, v: r.kind === 'video' ? 1 : 0 });
    if (isMedia && !r.txt) continue;
    const p = r.txt ? parseText(r.txt) : null;
    if (p && pend.length) {
      const post = r.id;
      const media = JSON.stringify(pend.filter(x => !x.v).concat(pend.filter(x => x.v)));
      const ex = byPost.get(post);
      if (ex && ex.src !== 'tg') ops.push(link.bind(post, media, r.dt, ex.id));
      else {
        let best = null, bs = 0;
        if (!ex) for (const s of sheet) { if (s.post) continue; const a = JSON.parse(s.auto); if (Math.abs((a.price || 0) - p.price) > 1000) continue; const v = sim(a.name + ' ' + (a.desc || ''), p.desc); if (v > bs) { bs = v; best = s; } }
        if (best && bs >= 0.4) { best.post = post; ops.push(link.bind(post, media, r.dt, best.id)); }
        else { ops.push(up.bind('tg' + post, 'tg', post, JSON.stringify(p), media, r.dt, now())); if (!ex) made++; }
      }
    }
    pend = [];
  }
  for (let i = 0; i < ops.length; i += 50) await env.DB.batch(ops.slice(i, i + 50));
  return made;
}

async function fetchImg(env, k, url) {
  const id = k.slice(1);
  let r = url ? await fetch(url) : null;
  if (!r || !r.ok || !/image/.test(r.headers.get('content-type') || '')) {
    // رابط منتهي: نجيب رابط جديد من صفحة المنشور
    const pg = await fetch(`https://t.me/${CH}/${id}?embed=1&single=1`, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const h = pg.ok ? await pg.text() : '';
    const m = h.match(/(?:photo_wrap|video_thumb)[^>]*background-image:url\('([^']+)'\)/) || h.match(/background-image:url\('(https:\/\/cdn[^']+)'\)/);
    if (!m) return null;
    r = await fetch(m[1]);
    if (!r.ok) return null;
  }
  const ct = r.headers.get('content-type') || 'image/jpeg';
  const buf = await r.arrayBuffer();
  if (buf.byteLength < 500 || buf.byteLength > 1.9e6) return null;
  await env.DB.prepare('insert into imgs(k,ct,data,at) values(?,?,?,?) on conflict(k) do update set data=excluded.data, ct=excluded.ct').bind(k, ct, buf, now()).run();
  await env.DB.prepare('delete from imgq where k=?').bind(k).run();
  return { ct, buf };
}

async function drainImgs(env, n) {
  const q = (await env.DB.prepare('select k,url,tries from imgq where tries < 6 order by k desc limit ?').bind(n).all()).results || [];
  let ok = 0;
  for (const x of q) {
    try { if (await fetchImg(env, x.k, x.url)) ok++; else await env.DB.prepare('update imgq set tries=tries+1, url=null where k=?').bind(x.k).run(); }
    catch { await env.DB.prepare('update imgq set tries=tries+1 where k=?').bind(x.k).run(); }
  }
  return ok;
}

async function aiEnrich(env, n, only) {
  if (!env.AI) return 0;
  const rows = only ? ((await env.DB.prepare('select id,auto,ov from products where id=?').bind(only).all()).results || []) : ((await env.DB.prepare("select id,auto,ov from products where ai is null and json_extract(ov,'$.del') is null order by (json_extract(auto,'$.name')='منتج') desc, dt desc limit ?").bind(n).all()).results || []);
  let ok = 0;
  for (const p of rows) {
    const a = { ...JSON.parse(p.auto), ...JSON.parse(p.ov || '{}') };
    const prompt = `أنت خبير منتجات إكسسوارات هواتف وتقنية في متجر عراقي. هذا منشور منتج:\n"""${(a.name || '') + '\n' + (a.desc || '')}\n${(a.specs || '')}"""\nالماركة: ${a.brand || 'غير معروفة'} — القسم: ${a.cat}\nأعطني JSON فقط بهذا الشكل بدون أي كلام آخر:\n{"title":"اسم واضح ومرتب للمنتج بالعربي (حد أقصى 60 حرف)","cat":"قسم واحد بالضبط من هذه القائمة: ${Object.values(CNAME).join('، ')}، منوعات","desc":"وصف تسويقي صادق بجملتين بالعربي الفصيح البسيط","specs":[["اسم المواصفة","القيمة"]],"uses":["استخدام 1","استخدام 2","استخدام 3"]}\nالمواصفات من 4 إلى 7، عامة ومنطقية لهذا النوع من المنتجات، لا تخترع أرقاماً دقيقة غير مذكورة بالمنشور (استخدم "حسب الموديل" إذا غير متأكد).`;
    try {
      const res = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages: [{ role: 'user', content: prompt }], max_tokens: 700, temperature: 0.3 });
      const t = (res && (res.response || res.result?.response)) || '';
      const s = typeof t === 'string' ? t : JSON.stringify(t);
      const j = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
      if (!Array.isArray(j.specs)) throw 0;
      j.specs = j.specs.filter(x => Array.isArray(x) && x.length === 2).slice(0, 8).map(x => [String(x[0]).slice(0, 40), String(x[1]).slice(0, 80)]);
      j.title = String(j.title || '').slice(0, 70); j.desc = String(j.desc || '').slice(0, 400);
      j.cat = String(j.cat || '').trim(); if (!Object.values(CNAME).includes(j.cat) && j.cat !== 'منوعات') j.cat = 'منوعات';
      j.uses = (j.uses || []).slice(0, 4).map(x => String(x).slice(0, 60));
      await env.DB.prepare('update products set ai=? where id=?').bind(JSON.stringify(j), p.id).run(); ok++;
    } catch (e) {
      // حد الاستخدام اليومي: نوقف ونرجع نكمّل بعدين بدون ما نعلّم المنتج كخطأ
      if (/limit|quota|neuron|429|capacity|exceeded|rate/i.test(String(e && e.message || e))) break;
      await env.DB.prepare('update products set ai=? where id=?').bind('{"specs":[],"err":1}', p.id).run();
    }
  }
  return ok;
}

const PARSE_V = 5;
export async function migrate(env) {
  // يعيد قراءة أسعار وأوصاف منشورات القناة بالقواعد المحسّنة، ويدمج المكرر مع منتجات الجدول
  const tg = (await env.DB.prepare("select p.id,p.post,p.auto,p.media,m.txt from products p join msgs m on m.id=p.post where p.src='tg'").all()).results || [];
  const ops = [];
  for (const r of tg) { const a = parseText(r.txt); if (a) ops.push(env.DB.prepare('update products set auto=? where id=?').bind(JSON.stringify(a), r.id)); else ops.push(env.DB.prepare("update products set ov=json_set(coalesce(ov,'{}'),'$.dup',1) where id=?").bind(r.id)); }
  const sheet = ((await env.DB.prepare("select id,auto,media,ov from products where src='sheet'").all()).results || []).filter(x => JSON.parse(x.media || '[]').length === 0);
  const tgs = tg.map(r => ({ ...r, a: parseText(r.txt) || JSON.parse(r.auto) }));
  for (const sp of sheet) {
    const a = JSON.parse(sp.auto); let best = null, bs = 0;
    for (const t of tgs) { if (Math.abs((t.a.price || 0) - (a.price || 0)) > 1000) continue; const v = sim(a.name, t.a.name + ' ' + (t.a.desc || '')); if (v > bs) { bs = v; best = t; } }
    if (best && bs >= 0.3) {
      ops.push(env.DB.prepare('update products set media=?, post=? where id=?').bind(best.media, best.post, sp.id));
      ops.push(env.DB.prepare("update products set ov=json_set(coalesce(ov,'{}'),'$.dup',1) where id=?").bind(best.id));
    }
  }
  for (let i = 0; i < ops.length; i += 50) await env.DB.batch(ops.slice(i, i + 50));
  await setSetting(env, '_parsev', PARSE_V);
  await log(env, 'تحديث قراءة الأسعار والمواصفات: ' + tg.length + ' منتج');
}

// ---------- أرشفة سريعة بمحركات البحث (IndexNow: Bing وYandex وغيرهم) ----------
export const INDEXNOW_KEY = 'hh7c1f0e5a9b2d4c3e8f6a1b0d9c2e7f4';
async function indexNow(env, urls) {
  const s = await getSettings(env);
  const host = s.siteHost || 'handhst.com';
  if (!urls.length) return;
  try {
    await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(0, 1000).map(u => `https://${host}${u}`) }) });
  } catch { }
}

export async function sync(env, opt = {}) {
  let st = await getSettings(env);
  if (st._parsev !== PARSE_V) { await migrate(env); st = await getSettings(env); }
  let pages = 0, msgs = 0;
  const html = await fetchPage(0); pages++;
  const cur = parseChannel(html);
  msgs += await saveMsgs(env, cur);
  // تكملة الأرشيف القديم صفحة بكل دورة
  const bf = st._backfill;
  let old = [];
  if (bf !== 'done') {
    const before = bf || Math.min(...cur.map(x => x.id));
    const h2 = await fetchPage(before); pages++;
    old = parseChannel(h2);
    msgs += await saveMsgs(env, old);
    const minId = old.length ? Math.min(...old.map(x => x.id)) : 0;
    const oldest = old.find(x => x.dt);
    const tooOld = oldest && now() - Date.parse(oldest.dt) > BACKFILL_DAYS * 864e5;
    await setSetting(env, '_backfill', !minId || minId >= before || tooOld ? 'done' : minId);
  }
  let made = 0;
  for (const l of [cur, old]) if (l.length) { const ids = l.map(x => x.id); made += await rebuild(env, Math.min(...ids), Math.max(...ids)); }
  if (made) { const nw = ((await env.DB.prepare('select id from products order by at desc limit ?').bind(made).all()).results || []).map(x => '/p/' + x.id); await indexNow(env, ['/', ...nw]); }
  if (!st._indexed) { const all = ((await env.DB.prepare('select id from products').all()).results || []).map(x => '/p/' + x.id); await indexNow(env, ['/', '/c', ...all]); await setSetting(env, '_indexed', now()); }
  await syncLogo(env, html, st);
  const imgs = await drainImgs(env, opt.imgs || 16);
  const ai = await aiEnrich(env, opt.ai || 2);
  if (ai) await bump(env);
  await setSetting(env, '_lastSync', now());
  if (made) { await bump(env); await purgeHost(env); }
  if (!st._prunedD || st._prunedD !== bgDay()) await pruneStats(env);
  const res = { pages, msgs, made, imgs, ai };
  if (made || imgs || ai) await log(env, 'مزامنة: ' + JSON.stringify(res));
  return res;
}

// ---------- مساعدات النسخة والكاش ----------
export const bgDay = (t = now()) => new Date(t + 3 * 3600e3).toISOString().slice(0, 10);
export const slug = s => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 70);
let MEMO = null;
async function getVer(env) { const r = await env.DB.prepare("select v from settings where k='_ver'").first(); return r ? String(r.v) : '0'; }
async function bump(env) { await env.DB.prepare("insert into settings(k,v) values('_ver','1') on conflict(k) do update set v=cast(v as integer)+1").run(); MEMO = null; }
async function purgeHost(env, path) {
  try {
    const r = await env.DB.prepare("select v from settings where k='siteHost'").first();
    const host = r ? JSON.parse(r.v) : 'handhst.com';
    await fetch(`https://${host}/__hh/purge` + (path ? '?p=' + encodeURIComponent(path) : ''), { headers: { 'user-agent': 'hh-worker' }, signal: AbortSignal.timeout(9000) });
  } catch { }
}
async function syncLogo(env, html, st) {
  // أعلى دقة متوفرة لصورة القناة: صفحة القناة الرئيسية تعطي الصورة الكبيرة، وصفحة المعاينة صورة أصغر
  if (st._logo2At && now() - st._logo2At < 864e5) return;
  try {
    const cands = [];
    try {
      const r0 = await fetch(`https://t.me/${CH}`, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' } });
      const h0 = r0.ok ? await r0.text() : '';
      for (const re of [/<img class="tgme_page_photo_image" src="([^"]+)"/, /<meta property="og:image" content="([^"]+)"/]) { const m = h0.match(re); if (m) cands.push(m[1]); }
    } catch { }
    for (const re of [/tgme_page_photo_image[^>]*>\s*<img src="([^"]+)"/, /<meta property="og:image" content="([^"]+)"/]) { const m = html.match(re); if (m) cands.push(m[1]); }
    let best = null;
    for (const u of cands) {
      try {
        const r = await fetch(unesc(u));
        if (!r.ok || !/image/.test(r.headers.get('content-type') || '')) continue;
        const buf = await r.arrayBuffer();
        if (buf.byteLength < 300 || buf.byteLength > 1.9e6) continue;
        if (!best || buf.byteLength > best.buf.byteLength) best = { buf, ct: r.headers.get('content-type') };
      } catch { }
    }
    if (!best) return;
    await env.DB.prepare('insert into imgs(k,ct,data,at) values(?,?,?,?) on conflict(k) do update set data=excluded.data, ct=excluded.ct, at=excluded.at').bind('logo', best.ct, best.buf, now()).run();
    await setSetting(env, '_logoAt', now()); await setSetting(env, '_logo2At', now());
    await bump(env);
  } catch { }
}

// ---------- الإحصائيات (بدون كوكيز، بدون أي خدمة خارجية) ----------
const CHN = ['yt', 'vyt', 'waze', 'wa1', 'wa2', 'tg', 'ig', 'fb', 'tt', 'tgc', 'wac', 'wag', 'map', 'dir', 'call', 'share', 'vtg', 'vig', 'vtt', 'vfb'];
const normQ = s => digits(s).toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ًٌٍَُِّْـ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
function srcOf(r) {
  r = String(r || '').toLowerCase();
  if (!r) return 'direct';
  for (const [k, re] of [['google', /google\./], ['bing', /bing\.|msn\./], ['instagram', /instagram|ig\.me/], ['facebook', /facebook|fb\.|m\.me|messenger/], ['tiktok', /tiktok/], ['telegram', /t\.me|telegram/], ['whatsapp', /whatsapp|wa\.me/], ['youtube', /youtube|youtu\.be/], ['self', /handhst|hh-shop/]]) if (re.test(r)) return k;
  return 'other';
}
async function track(req, env) {
  const ua = req.headers.get('user-agent') || '';
  if (!ua || /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|curl|python|headless|lighthouse|wget|go-http/i.test(ua)) return;
  let b; try { b = JSON.parse(await req.text()); } catch { return; }
  const v = String(b.v || '').replace(/[^\w-]/g, '').slice(0, 40); if (v.length < 6) return;
  const d = bgDay(), ops = [];
  const inc = (k, n = 1) => ops.push(env.DB.prepare('insert into st_day(d,k,n) values(?,?,?) on conflict(d,k) do update set n=n+excluded.n').bind(d, k, n));
  const pid = String(b.p || '').replace(/[^\w]/g, '').slice(0, 24);
  const prod = col => ops.push(env.DB.prepare(`insert into st_prod(d,p,${col}) values(?,?,1) on conflict(d,p) do update set ${col}=${col}+1`).bind(d, pid));
  const c = CHN.includes(b.c) ? b.c : '';
  if (b.e === 'pv') {
    inc('pv');
    const r = await env.DB.prepare('insert or ignore into st_vis(d,v) values(?,?)').bind(d, v).run();
    if (r.meta && r.meta.changes) { inc('uv'); inc('src:' + srcOf(b.r)); inc('dev:' + (b.m ? 'm' : 'd')); if (b.nw) inc('new'); }
  } else if (b.e === 'v' && pid) prod('v');
  else if (b.e === 'o' && pid) { prod('o'); inc('o'); if (c) inc('o:' + c); }
  else if (b.e === 'q') { const q = normQ(b.q); if (q.length >= 2) ops.push(env.DB.prepare('insert into st_q(d,q,n,z) values(?,?,1,?) on conflict(d,q) do update set n=n+1, z=excluded.z').bind(d, q, b.n ? 0 : 1)); }
  else if (b.e === 's' && c) inc('s:' + c);
  if (ops.length) await env.DB.batch(ops);
}
async function pruneStats(env) {
  try {
    await env.DB.batch([
      env.DB.prepare('delete from st_vis where d < ?').bind(bgDay(now() - 40 * 864e5)),
      env.DB.prepare('delete from st_q where d < ?').bind(bgDay(now() - 120 * 864e5)),
      env.DB.prepare('delete from st_prod where d < ?').bind(bgDay(now() - 400 * 864e5)),
    ]);
    await setSetting(env, '_prunedD', bgDay());
  } catch { }
}
async function topIds(env, days = 14) {
  try {
    const r = await env.DB.prepare('select p, sum(o)*6+sum(v) s from st_prod where d>=? group by p having s>=3 order by s desc limit 40').bind(bgDay(now() - days * 864e5)).all();
    return (r.results || []).map(x => x.p);
  } catch { return []; }
}
async function statsFor(env, days) {
  const since = bgDay(now() - (days - 1) * 864e5);
  const q = (sql, ...a) => env.DB.prepare(sql).bind(...a).all().then(r => r.results || []).catch(() => []);
  const [day, prod, srch] = await Promise.all([
    q('select d,k,n from st_day where d>=? order by d', since),
    q('select p, sum(v) v, sum(o) o from st_prod where d>=? group by p order by o desc, v desc limit 300', since),
    q('select q, sum(n) n, max(z) z from st_q where d>=? group by q order by n desc limit 40', since),
  ]);
  return { since, days, today: bgDay(), day, prod, srch };
}

// ---------- الإدارة ----------
async function sha(s) { const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join(''); }
async function pwHash(pw, salt) { let h = salt + pw; for (let i = 0; i < 2000; i++) h = await sha(h + salt); return h; }
async function authed(req, env) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/, '');
  if (!t) return false;
  const r = await env.DB.prepare('select exp from sess where tok=?').bind(t).first();
  return r && r.exp > now();
}

function pub(p) { return { id: p.id, from: p.from ? 1 : 0, name: p.name, brand: p.brand || '', cat: p.cat, price: p.price || 0, old: p.old || 0, avail: p.avail ? 1 : 0, offer: p.offer ? 1 : 0, warranty: p.warranty || '', img: p.imgs[0] || '', n: p.imgs.length, feats: p.feats || '', dt: p.dt || '', back: p.back || '', sub: p.sub || '', oat: p.offerAt || '', pin: p.pin ? 1 : 0 }; }

async function allProducts(env, admin) {
  const rows = (await env.DB.prepare('select * from products').all()).results || [];
  let list = rows.map(eff).filter(p => !p.purge && (admin || (!p.del && !p.hidden && !p.dup)));
  if (admin) { const have = new Set(((await env.DB.prepare('select k from imgs').all()).results || []).map(x => x.k)); for (const p of list) p.ready = p.imgs.filter(k => have.has(k)).length; }
  if (!admin) list = list.filter(p => p.price > 0 && p.imgs.length && p.name && p.name !== 'منتج');
  list.sort((a, b) => (b.pin || 0) - (a.pin || 0) || String(b.dt || '').localeCompare(String(a.dt || '')));
  return list;
}

function catsOf(s, list) {
  const base = (s.cats || CATS.map(c => ({ n: c[0], i: c[1] }))).map(c => ({ ...c }));
  const icon = Object.fromEntries(CATS);
  for (const c of base) if (!c.i || c.i === 'spark') c.i = icon[c.n] || 'spark';
  const have = new Set(base.map(c => c.n));
  for (const p of list) if (p.cat && !have.has(p.cat)) { have.add(p.cat); const m = base.findIndex(c => c.n === 'منوعات'); const c = { n: p.cat, i: icon[p.cat] || 'spark' }; if (m >= 0) base.splice(m, 0, c); else base.push(c); }
  return base;
}
function pubSettings(s) {
  const o = {}; for (const k in s) if (!k.startsWith('_') && k !== 'pw' && k !== 'salt' && k !== 'gsv' && k !== 'goat') o[k] = s[k];
  o.logo = s.logoU || (s._logoAt ? 'logo' : '');
  return o;
}
async function publicData(env) {
  const ver = await getVer(env), b = Math.floor(now() / 600000);
  if (MEMO && MEMO.ver === ver && MEMO.b === b) return MEMO.d;
  const s = await getSettings(env);
  const list = await allProducts(env, false);
  const ids = new Set(list.map(p => p.id));
  const top = (await topIds(env)).filter(id => ids.has(id)).slice(0, 12);
  const cats = catsOf(s, list);
  const d = { s: pubSettings(s), cats, p: list.map(pub), top, t: now(), ver };
  MEMO = { ver, b, d };
  return d;
}

// ---------- صفحات ----------
function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
const js = o => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '');
export const prodPath = p => '/p/' + p.id + (slug(p.name) ? '/' + slug(p.name) : '');
async function page(env, url, O, prod) {
  const origin = O || url.origin;
  const D = await publicData(env), st = D.s;
  const path = decodeURIComponent(url.pathname);
  const fmt = n => (+n || 0).toLocaleString('en');
  let title = 'مجمع H&H | اكسسوارات موبايل في بغداد — شواحن، سماعات، باوربانك، كفرات', desc = 'مجمع H&H في بغداد شارع فلسطين: اكسسوارات الهواتف والتقنية الأصلية بالأسعار والمواصفات والضمان — شواحن، سماعات، باوربانك، كفرات، ساعات ذكية وعروض يومية. توصيل لكل العراق.';
  let img = st.logo ? origin + '/img/' + st.logo : origin + '/icon.png', canon = origin + '/', ld = [], ns = '';
  const crumbs = [['الرئيسية', origin + '/']];
  if (prod) {
    title = `${prod.name} بسعر ${fmt(prod.price)} دينار — مجمع H&H`;
    desc = `${prod.name} بسعر ${fmt(prod.price)} دينار${prod.warranty === 'سنة' ? '، ضمان سنة' : ''}. ${String(prod.desc || (prod.ai && prod.ai.desc) || '').replace(/\s+/g, ' ').slice(0, 120)} توصيل لكل العراق.`;
    if (prod.imgs[0]) img = origin + '/img/' + prod.imgs[0];
    canon = origin + encodeURI(prodPath(prod));
    crumbs.push([prod.cat, origin + '/c/' + encodeURIComponent(prod.cat)], [prod.name, canon]);
    const specs = (prod.specs && prod.specs.length ? prod.specs : (prod.ai && prod.ai.specs) || []);
    ld.push({ '@context': 'https://schema.org', '@type': 'Product', name: prod.name, sku: prod.id, image: prod.imgs.slice(0, 6).map(k => origin + '/img/' + k), description: prod.desc || (prod.ai && prod.ai.desc) || prod.name, brand: { '@type': 'Brand', name: prod.brand || 'H&H' }, category: prod.cat, additionalProperty: specs.slice(0, 8).map(x => ({ '@type': 'PropertyValue', name: x[0], value: x[1] })), offers: { '@type': 'Offer', priceCurrency: 'IQD', price: prod.price, itemCondition: 'https://schema.org/NewCondition', availability: prod.avail ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: canon, seller: { '@type': 'Organization', name: 'مجمع H&H' } } });
    ns = `<h1>${esc(prod.name)}</h1><p>${fmt(prod.price)} دينار</p><p>${esc(prod.desc || '')}</p>${prod.imgs.slice(0, 3).map(k => `<img src="${origin}/img/${k}" alt="${esc(prod.name)}">`).join('')}`;
  } else if (path.startsWith('/c/') && path.length > 3) {
    const c = path.slice(3), n = c === 'new' ? 'وصل حديثاً' : c === 'offers' ? 'العروض' : c === 'top' ? 'الأكثر طلباً' : c;
    const l = c === 'new' ? D.p : c === 'offers' ? D.p.filter(p => p.offer) : c === 'top' ? D.top.map(id => D.p.find(p => p.id === id)).filter(Boolean) : D.p.filter(p => p.cat === c);
    title = `${n} — أسعار ${n} في بغداد | مجمع H&H`; desc = `تسوق ${n} من مجمع H&H في بغداد: ${l.length} منتج بأسعار واضحة ومواصفات وضمان. ${l.slice(0, 4).map(p => p.name).join('، ')}. توصيل لكل العراق.`.slice(0, 300);
    canon = origin + '/c/' + encodeURIComponent(c); crumbs.push([n, canon]);
    ns = `<h1>${esc(n)}</h1><ul>${l.slice(0, 60).map(x => `<li><a href="${esc(encodeURI(prodPath(x)))}">${esc(x.name)}</a> — ${fmt(x.price)} دينار</li>`).join('')}</ul>`;
  } else if (path === '/contact') {
    title = 'تواصل ويانا وموقعنا على الخريطة — مجمع H&H بغداد'; desc = `${st.address}. ${st.hours || ''}. راسلنا على واتساب أو تليجرام أو انستغرام.`; canon = origin + '/contact'; crumbs.push(['تواصل', canon]);
  } else if (path === '/c' || path === '/c/') {
    title = 'كل الأقسام — مجمع H&H'; canon = origin + '/c'; crumbs.push(['الأقسام', canon]);
  } else {
    ns = `<h1>مجمع H&H — اكسسوارات الهواتف في بغداد</h1><ul>${D.p.slice(0, 30).map(x => `<li><a href="${esc(encodeURI(prodPath(x)))}">${esc(x.name)}</a> — ${fmt(x.price)} دينار</li>`).join('')}</ul>`;
  }
  const geo = st.mapLat && st.mapLng ? { geo: { '@type': 'GeoCoordinates', latitude: +st.mapLat, longitude: +st.mapLng } } : {};
  ld.push({ '@context': 'https://schema.org', '@type': 'ElectronicsStore', '@id': origin + '/#store', name: 'مجمع H&H', alternateName: 'H&H Mobile', url: origin + '/', logo: img, image: img, telephone: '+' + (st.wa1 || DEF.wa1), priceRange: 'IQD', currenciesAccepted: 'IQD', address: { '@type': 'PostalAddress', streetAddress: 'شارع فلسطين، مجاور الكوخ', addressLocality: 'بغداد', addressCountry: 'IQ' }, ...geo, openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '10:00', closes: '23:59' }, { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '13:00', closes: '23:59' }], sameAs: [`https://t.me/${st.tgChannel || CH}`, `https://www.instagram.com/${st.ig || DEF.ig}`, `https://www.tiktok.com/@${st.tt || DEF.tt}`, `https://www.facebook.com/${st.fb || DEF.fb}`, `https://www.youtube.com/@${st.yt || DEF.yt}`] });
  if (crumbs.length > 1) ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: c[1] })) });
  if (!prod && path === '/') ld.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'مجمع H&H', url: origin + '/', inLanguage: 'ar', potentialAction: { '@type': 'SearchAction', target: origin + '/?q={q}', 'query-input': 'required name=q' } });
  const s0 = await getSettings(env);
  const api = O ? url.origin : '';
  const head = `<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(canon)}"><meta property="og:site_name" content="مجمع H&amp;H"><meta property="og:locale" content="ar_IQ"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${esc(img)}"><meta property="og:type" content="${prod ? 'product' : 'website'}"><meta property="og:url" content="${esc(canon)}"><meta name="twitter:card" content="summary_large_image">`
    + (s0.gsv ? `<meta name="google-site-verification" content="${esc(s0.gsv)}">` : '') + (s0.bsv ? `<meta name="msvalidate.01" content="${esc(s0.bsv)}">` : '')
    + (api ? `<link rel="preconnect" href="${api}"><script>window.HHAPI=${js(api)}</script>` : '')
    + (prod && prod.imgs[0] ? `<link rel="preload" as="image" href="${api}/img/${prod.imgs[0]}" fetchpriority="high">` : '')
    + ld.map(x => `<script type="application/ld+json">${js(x)}</script>`).join('')
    + `<script id="hhd" type="application/json">${js(D)}</script>` + (prod ? `<script id="hhp" type="application/json">${js(prod)}</script>` : '');
  const html = APP.replace('<!--HEAD-->', () => head).replace('<main id="view" class="wrap" tabindex="-1"></main>', () => `<main id="view" class="wrap" tabindex="-1"><noscript>${ns}</noscript></main>`);
  return new Response(html, { status: prod === undefined || prod ? 200 : 404, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=30', 'x-hh-ver': D.ver } });
}

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF7A45"/><stop offset="1" stop-color="#FF4D6D"/></linearGradient></defs><rect width="512" height="512" rx="120" fill="#141B33"/><text x="256" y="318" font-family="Arial,sans-serif" font-size="176" fill="url(#g)" text-anchor="middle" font-weight="800">H&amp;H</text></svg>`;
let HOSTV = '';
// يخلي الموقع يفتح فوراً حتى على نت ضعيف: الصفحة من الذاكرة وتتحدث بالخلفية، والصور تنحفظ بالجهاز
const SW = `const V='hh-p2',IMG='hh-i2';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==V&&k!==IMG)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;let u;try{u=new URL(r.url)}catch(x){return}
 if(u.pathname.startsWith('/img/')&&u.pathname!=='/img/logo'){e.respondWith(img(r));return}
 if(u.origin!==location.origin||u.pathname.startsWith('/admin')||u.pathname.startsWith('/api/')||u.pathname.startsWith('/__hh'))return;
 if(r.mode==='navigate')e.respondWith(page(r,e));});
async function img(r){const c=await caches.open(IMG);const m=await c.match(r.url);if(m)return m;try{const res=await fetch(r.url,{mode:'cors',credentials:'omit'});if(res.ok&&/max-age=31536000/.test(res.headers.get('cache-control')||'')){c.put(r.url,res.clone());trim(c)}return res}catch(x){return fetch(r)}}
async function page(r,e){const c=await caches.open(V);const key=new URL(r.url).pathname;const m=await c.match(key);
 const net=fetch(r).then(res=>{if(res.ok&&res.type==='basic')c.put(key,res.clone());return res});
 if(m){e.waitUntil(net.catch(()=>{}));return m}
 try{return await net}catch(x){return (await c.match('/'))||new Response('<meta charset=utf-8><meta name=viewport content="width=device-width"><body style="font-family:sans-serif;text-align:center;padding-top:30vh">ما كو إنترنت حالياً — حاول بعد شوي</body>',{headers:{'content-type':'text/html; charset=utf-8'}})}}
let n=0;async function trim(c){if(++n%25)return;const ks=await c.keys();for(let i=0;i<ks.length-500;i++)await c.delete(ks[i])}
`;

async function aiOne(env, id) { await env.DB.prepare('update products set ai=null where id=?').bind(id).run(); return aiEnrichIds(env, [id]); }
async function aiEnrichIds(env, ids) {
  const rows = (await env.DB.prepare(`select id from products where id in (${ids.map(() => '?').join(',')})`).bind(...ids).all()).results || [];
  if (!rows.length || !env.AI) return 0;
  let n = 0; for (const r of rows) n += await aiEnrich(env, 1, r.id); return n;
}

async function admin(req, env, op, O) {
  if (op === 'login') {
    const ip = req.headers.get('x-hh-ip') || req.headers.get('cf-connecting-ip') || '';
    const s = await getSettings(env);
    const fails = (s._fails || {})[ip] || [];
    const recent = fails.filter(t => now() - t < 15 * 60000);
    if (recent.length >= 8) return J({ err: 'wait' }, 429);
    const { pw } = await req.json();
    if (!s.salt || !s.pw || await pwHash(String(pw || ''), s.salt) !== s.pw) {
      await setSetting(env, '_fails', { ...(s._fails || {}), [ip]: [...recent, now()] });
      return J({ err: 'bad' }, 401);
    }
    const tok = crypto.randomUUID() + crypto.randomUUID();
    await env.DB.prepare('insert into sess(tok,exp) values(?,?)').bind(tok, now() + 60 * 864e5).run();
    await env.DB.prepare('delete from sess where exp < ?').bind(now()).run();
    return J({ ok: 1, tok });
  }
  if (!(await authed(req, env))) return J({ err: 'auth' }, 401);
  const changed = async (path) => { await bump(env); await purgeHost(env, path); };
  if (op === 'state') {
    const s = await getSettings(env);
    const list = await allProducts(env, true);
    const q = await env.DB.prepare('select count(*) n from imgq where tries < 6').first();
    const lg = (await env.DB.prepare('select at,msg from log order by at desc limit 15').all()).results;
    const st = {}; for (const r of ((await env.DB.prepare('select p, sum(v) v, sum(o) o from st_prod where d>=? group by p').bind(bgDay(now() - 29 * 864e5)).all().catch(() => ({}))).results || [])) st[r.p] = [r.v, r.o];
    const ps = pubSettings(s); for (const k of ['gsv', 'bsv']) ps[k] = s[k] || '';
    ps._lastSync = s._lastSync;
    return J({ s: ps, cats: catsOf(s, list), p: list, st, queue: q.n, log: lg, ai: !!env.AI, today: bgDay() });
  }
  if (op === 'save') {
    const b = await req.json();
    const row = b.id ? await env.DB.prepare('select * from products where id=?').bind(b.id).first() : null;
    const id = b.id || ('m' + now().toString(36));
    const old = row ? JSON.parse(row.ov || '{}') : {};
    const ov = { ...old, ...b.ov };
    if (row && b.ov && b.ov.avail === 1 && !eff(row).avail) ov.back = new Date().toISOString();
    if (b.ov && b.ov.offer === 1 && !(row && eff(row).offer)) ov.offerAt = new Date().toISOString();
    for (const k in ov) if (ov[k] === null) delete ov[k];
    if (row) await env.DB.prepare('update products set ov=? where id=?').bind(JSON.stringify(ov), id).run();
    else await env.DB.prepare('insert into products(id,src,auto,ov,media,dt,at) values(?,?,?,?,?,?,?)').bind(id, 'admin', '{}', JSON.stringify(ov), '[]', new Date().toISOString(), now()).run();
    if (Array.isArray(old.imgs) && Array.isArray(ov.imgs)) await dropOrphans(env, old.imgs.filter(k => !ov.imgs.includes(k)));
    await changed('/p/' + id);
    return J({ ok: 1, id });
  }
  if (op === 'bulk') {
    const { ids, ov } = await req.json();
    const rows = (await env.DB.prepare(`select * from products where id in (${ids.map(() => '?').join(',')})`).bind(...ids).all()).results || [];
    const ops = rows.map(r => { const o = { ...JSON.parse(r.ov || '{}'), ...ov }; if (ov.avail === 1 && !eff(r).avail) o.back = new Date().toISOString(); if (ov.offer === 1 && !eff(r).offer) o.offerAt = new Date().toISOString(); for (const k in o) if (o[k] === null) delete o[k]; return env.DB.prepare('update products set ov=? where id=?').bind(JSON.stringify(o), r.id); });
    for (let i = 0; i < ops.length; i += 50) await env.DB.batch(ops.slice(i, i + 50));
    await changed();
    return J({ ok: 1, n: rows.length });
  }
  if (op === 'purge') {
    const { ids } = await req.json();
    for (const id of ids) {
      const r = await env.DB.prepare('select src,ov,media from products where id=?').bind(id).first(); if (!r) continue;
      const o = JSON.parse(r.ov || '{}');
      if (r.src === 'admin') { await env.DB.prepare('delete from products where id=?').bind(id).run(); await dropOrphans(env, o.imgs || []); }
      else { await env.DB.prepare('update products set ov=? where id=?').bind(JSON.stringify({ ...o, del: 1, purge: 1 }), id).run(); }
    }
    await changed();
    return J({ ok: 1 });
  }
  if (op === 'reset') {
    const { id } = await req.json();
    const r = await env.DB.prepare('select ov from products where id=?').bind(id).first();
    if (r) { const o = JSON.parse(r.ov || '{}'); await env.DB.prepare('update products set ov=? where id=?').bind(JSON.stringify(o.del ? { del: 1 } : {}), id).run(); await dropOrphans(env, o.imgs || []); }
    await changed('/p/' + id);
    return J({ ok: 1 });
  }
  if (op === 'stats') { const { days } = await req.json(); return J(await statsFor(env, Math.min(400, Math.max(1, +days || 7)))); }
  if (op === 'upload') {
    const ct = req.headers.get('content-type') || 'image/jpeg';
    if (!/^image\//.test(ct)) return J({ err: 'type' }, 400);
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 1.9e6) return J({ err: 'big' }, 413);
    const k = 'u' + now().toString(36) + Math.random().toString(36).slice(2, 6);
    await env.DB.prepare('insert into imgs(k,ct,data,at) values(?,?,?,?)').bind(k, ct, buf, now()).run();
    return J({ ok: 1, k });
  }
  if (op === 'settings') {
    const b = await req.json();
    const s0 = await getSettings(env);
    for (const k in b) if (!k.startsWith('_') && k !== 'pw' && k !== 'salt') await setSetting(env, k, b[k]);
    if ('logoU' in b && s0.logoU && s0.logoU !== b.logoU) await dropOrphans(env, [s0.logoU]);
    await changed();
    return J({ ok: 1 });
  }
  if (op === 'password') {
    const { pw } = await req.json();
    if (String(pw || '').length < 8) return J({ err: 'short' }, 400);
    const salt = crypto.randomUUID();
    await setSetting(env, 'salt', salt); await setSetting(env, 'pw', await pwHash(pw, salt));
    await env.DB.prepare('delete from sess').run();
    return J({ ok: 1 });
  }
  if (op === 'sync') { const r = await sync(env, { imgs: 20, ai: 2 }); await changed(); return J({ ok: 1, ...r }); }
  if (op === 'ai') { const { id } = await req.json(); const n = await aiOne(env, id); await changed('/p/' + id); return J({ ok: 1, n }); }
  if (op === 'logout') { await env.DB.prepare('delete from sess where tok=?').bind((req.headers.get('authorization') || '').slice(7)).run(); return J({ ok: 1 }); }
  return J({ err: 'op' }, 404);
}
// يمسح الصور المرفوعة من اللوحة إذا ما بقى منتج يستعملها
async function dropOrphans(env, keys) {
  for (const k of keys) {
    if (!/^u[a-z0-9]+$/.test(k)) continue;
    const used = await env.DB.prepare("select count(*) n from products where ov like ?").bind('%"' + k + '"%').first();
    const lg = await env.DB.prepare("select count(*) n from settings where k='logoU' and v=?").bind(JSON.stringify(k)).first();
    if (!used.n && !lg.n) await env.DB.prepare('delete from imgs where k=?').bind(k).run();
  }
}

export default {
  async scheduled(ev, env, ctx) { ctx.waitUntil(sync(env).catch(e => log(env, 'خطأ مزامنة: ' + e.message))); },
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname;
    const xh = req.headers.get('x-hh-host');
    const O = xh && /^[a-z0-9.-]+$/i.test(xh) ? 'https://' + xh : '';
    try {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
      if (p === '/api/ev') { if (req.method === 'POST') await track(req, env).catch(() => { }); return new Response(null, { status: 204, headers: CORS }); }
      if (p === '/api/v') return J({ v: await getVer(env) }, 200, { 'cache-control': 'no-store' });
      if (p === '/api/data') {
        const D = await publicData(env);
        return J(D, 200, { 'cache-control': 'public, max-age=30' });
      }
      if (p.startsWith('/api/p/')) {
        const row = await env.DB.prepare('select * from products where id=?').bind(decodeURIComponent(p.slice(7)).split('/')[0]).first();
        if (!row) return J({ err: 'missing' }, 404);
        const e = eff(row); if (e.del || e.purge || e.hidden) return J({ err: 'missing' }, 404);
        return J(e, 200, { 'cache-control': 'public, max-age=30' });
      }
      if (p.startsWith('/img/')) {
        const k = p.slice(5).replace(/\W/g, '');
        // ?w=s = نسخة مصغّرة خفيفة (webp) للكروت — أسرع بكثير على النت الضعيف
        const small = url.searchParams.get('w') === 's' && k !== 'logo';
        const cache = caches.default;
        if (small) {
          const sk = new Request(url.origin + '/img3/' + k + '_s');
          let r = await cache.match(sk); if (r) return r;
          const t = await env.DB.prepare('select ct,data from imgs where k=?').bind(k + '_s').first();
          if (t) { r = new Response(t.data instanceof ArrayBuffer ? t.data : new Uint8Array(t.data), { headers: { 'content-type': t.ct, 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': '*', 'timing-allow-origin': '*' } }); ctx.waitUntil(cache.put(sk, r.clone())); return r; }
        }
        const key = new Request(url.origin + '/img3/' + k + (k === 'logo' ? '?' + Math.floor(now() / 864e5) : ''));
        const soft = r0 => { if (!small) return r0; const h = new Headers(r0.headers); h.set('cache-control', 'public, max-age=600'); return new Response(r0.body, { status: r0.status, headers: h }); };
        let r = await cache.match(key); if (r) return soft(r);
        let row = await env.DB.prepare('select ct,data from imgs where k=?').bind(k).first();
        let data, ct;
        if (row) { data = row.data; ct = row.ct; }
        else if (/^[tv]\d+$/.test(k)) { const q = await env.DB.prepare('select url from imgq where k=?').bind(k).first(); const f = await fetchImg(env, k, q && q.url); if (f) { data = f.buf; ct = f.ct; } }
        if (!data) return new Response(ICON, { status: 404, headers: { 'content-type': 'image/svg+xml', 'cache-control': 'no-store', 'access-control-allow-origin': '*' } });
        r = new Response(data instanceof ArrayBuffer ? data : new Uint8Array(data), { headers: { 'content-type': ct, 'cache-control': k === 'logo' ? 'public, max-age=86400' : 'public, max-age=31536000, immutable', 'access-control-allow-origin': '*', 'timing-allow-origin': '*' } });
        ctx.waitUntil(cache.put(key, r.clone()));
        return soft(r);
      }
      if (p.startsWith('/__hh/')) return new Response(null, { status: 204 });
      if (p === '/host/v' || p === '/host/index.php' || p === '/host/htaccess') {
        if (!HOSTV) HOSTV = (await sha(HOST_PHP + '\n' + HOST_HT)).slice(0, 16);
        return new Response(p === '/host/v' ? HOSTV : p === '/host/htaccess' ? HOST_HT : HOST_PHP, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-hh-hostv': HOSTV } });
      }
      if (p === '/sw.js') return new Response(SW, { headers: { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-cache' } });
      if (p === '/admin.webmanifest') return J({ name: 'لوحة تحكم H&H', short_name: 'لوحة H&H', start_url: '/admin', scope: '/admin', display: 'standalone', background_color: '#141B33', theme_color: '#141B33', dir: 'rtl', lang: 'ar', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }, { src: '/icon.png', sizes: '320x320', type: 'image/jpeg' }] }, 200, { 'cache-control': 'public, max-age=86400' });
      // ملف توثيق Google Search Console
      if (p === '/google8b588e8ae88d89ff.html') return new Response('google-site-verification: ' + p.slice(1), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
      if (p === '/' + INDEXNOW_KEY + '.txt') return new Response(INDEXNOW_KEY, { headers: { 'content-type': 'text/plain' } });
      if (p === '/icon.svg' || p === '/favicon.ico') return new Response(ICON, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' } });
      if (p === '/icon.png') { const s = await getSettings(env); const k = s.logoU || (s._logoAt ? 'logo' : ''); if (k) return Response.redirect(url.origin + '/img/' + k, 302); return new Response(ICON, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' } }); }
      if (p === '/manifest.webmanifest') { const s = await getSettings(env); const lk = s.logoU || (s._logoAt ? 'logo' : ''); return J({ name: 'مجمع H&H', short_name: 'H&H', start_url: '/', display: 'standalone', background_color: '#141B33', theme_color: '#141B33', dir: 'rtl', lang: 'ar', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }].concat(lk ? [{ src: (O ? url.origin : '') + '/img/' + lk, sizes: '512x512', type: 'image/jpeg' }] : []) }, 200, { 'cache-control': 'public, max-age=86400' }); }
      if (p === '/robots.txt') return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${O || url.origin}/sitemap.xml\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
      if (p === '/sitemap.xml') {
        const D = await publicData(env), base = O || url.origin;
        const u = (loc, lm, imgs = [], pr = '0.7') => `<url><loc>${esc(loc)}</loc>${lm ? `<lastmod>${lm.slice(0, 10)}</lastmod>` : ''}<priority>${pr}</priority>${imgs.map(k => `<image:image><image:loc>${esc(base + '/img/' + k)}</image:loc></image:image>`).join('')}</url>`;
        const cats = [...new Set(D.p.map(x => x.cat))];
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${u(base + '/', D.p[0] && D.p[0].dt, [], '1.0')}${u(base + '/c', '', [], '0.8')}${u(base + '/c/offers', '', [], '0.8')}${u(base + '/contact', '', [], '0.6')}${cats.map(c => u(base + '/c/' + encodeURIComponent(c), '', [], '0.8')).join('')}${D.p.map(x => u(base + encodeURI(prodPath(x)), x.dt, x.img ? [x.img] : [])).join('')}</urlset>`;
        return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=600' } });
      }
      if (p === '/admin' || p === '/admin/') return new Response(O ? ADMIN.replace('</head>', () => `<script>window.HHAPI=${js(url.origin)}</script></head>`) : ADMIN, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
      if (p.startsWith('/api/admin/')) {
        if (req.method !== 'POST') return J({ err: 'method' }, 405);
        return await admin(req, env, p.slice(11), O);
      }
      if (p.startsWith('/p/')) {
        const id = decodeURIComponent(p.slice(3)).split('/')[0];
        const row = await env.DB.prepare('select * from products where id=?').bind(id).first();
        const e = row ? eff(row) : null;
        return page(env, url, O, e && !e.del && !e.purge && !e.hidden ? e : null);
      }
      // أي رابط غير معروف = 404 حقيقي (مهم لـ Google)
      const known = p === '/' || p === '/c' || p === '/c/' || p.startsWith('/c/') || p === '/contact' || p === '/index.php';
      return page(env, url, O, known ? undefined : null);
    } catch (e) {
      return J({ err: 'server', m: String(e && e.message || e) }, 500);
    }
  },
};
