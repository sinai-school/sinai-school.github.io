// متجر مجمع H&H — خادم Cloudflare (واجهة + مزامنة قناة تلگرام + صور دائمية + لوحة تحكم)
import APP from './app.html';
import ADMIN from './admin.html';

const CH = 'husseinhandh';
const BACKFILL_DAYS = 120;

export const DEF = {
  name: 'مجمع H&H',
  tagline: 'إكسسوارات الهواتف والتقنية — أصلية وبضمان',
  wa1: '9647730001588', wa2: '9647732222773',
  tgUser: 'h_h_mobail', tgChannel: CH,
  ig: 'h.and.h_mobile', tt: 'hussein_handh', fb: 'HandHMobile',
  address: 'بغداد — شارع فلسطين، مجاور الكوخ، مكتب H&H',
  delivery: 'توصيل لكل العراق بـ ٥ آلاف دينار',
  notice: '',
  waGroup: 'https://chat.whatsapp.com/FvFJNN4B3DU3r8Zw96uhig',
  waChannel: 'https://whatsapp.com/channel/0029VbCZofYISTkPK9NW1729',
  goat: 'hh-mobile',
};

export const CATS = [
  ['شواحن', 'charger'], ['باوربانك', 'battery'], ['كيبلات', 'cable'], ['سماعات', 'buds'],
  ['سبيكرات', 'speaker'], ['ساعات ذكية', 'watch'], ['كفرات', 'case'], ['زجاج حماية', 'glass'],
  ['اكسسوارات سيارة', 'car'], ['ستاندات وتصوير', 'tripod'], ['عناية شخصية', 'care'],
  ['منزل وأدوات', 'home'], ['حقائب', 'bag'], ['منوعات', 'spark'],
];

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
  const pick = l => {
    const m = l.match(/(\d[\d,.]*)\s*(الف|ألف|الاف|آلاف|ألاف|k)?/i);
    if (!m) return 0;
    let n = parseFloat(m[1].replace(/,/g, '').replace(/\.(?=\d{3}\b)/g, ''));
    if (m[2] || n < 1000) n = Math.round(n * 1000);
    return n >= 1000 && n < 5e7 ? n : 0;
  };
  for (const l of lines) if (/السعر|سعر|بسعر/.test(l) && !/توصيل/.test(l)) { const p = pick(l.replace(/.*?سعر/, '')); if (p) return p; }
  for (const l of lines) if (/(الف|ألف|الاف|آلاف|دينار)/.test(l) && !/توصيل|توفير/.test(l)) { const p = pick(l); if (p) return p; }
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
  const all = txt.split('\n').map(s => s.replace(/\s+/g, ' ').trim());
  const block = [];
  for (const l of all) { if (SEP.test(l) || /^-{3,}|—{2,}/.test(l)) { if (block.length) break; else continue; } if (/السعر/.test(l)) break; block.push(l); }
  const body = block.filter(l => l && !NOISE.test(l));
  const isOffer = /عرض يوم|عرض اليوم|عروض/.test(txt);
  const clean = body.map(l => l.replace(/[🔥😳😍❤️✅👌🤩💥⭐️✨👈👇]+/gu, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  const parts = clean.map(l => l.replace(/\*+/g, '').trim()).filter(l => l && l !== '+' && !/^(للطاكين|دلع|هذا العرض|اقوى عرض|أقوى عرض|عرض |تشكيل|موديل روع|جماعة|الجمال|روعه|روعة|توفر|وصل|جديد|و|التفاصيل|تفاصيل|للحجز|العرض)/.test(l));
  const noun = l => KW.some(([, re]) => re.test(l)) || /\b[A-Za-z]{3,}\b/.test(l);
  let ni = parts.findIndex(noun); if (ni > 0 && /^من /.test(parts[ni])) ni--;
  let name = (ni >= 0 ? (ni + 1 < parts.length && /^من /.test(parts[ni + 1]) && parts[ni].length < 40 ? parts[ni] + ' ' + parts[ni + 1] : parts[ni]) : parts[0]) || clean.map(l => l.replace(/\*+/g, '')).find(Boolean) || 'منتج';
  name = name.replace(/^(للطاكين|جماعة)[^ ]* ?(فقط)? ?/, '').replace(/\s*و?بضمان.*$/, '').replace(/\s*(فقط|روعه|روعة)\s*$/, '');
  name = name.replace(/فقط$/, '').trim().slice(0, 90);
  const until = /فقط يوم|ضمن يوم|لحين نفاد/.test(txt);
  const warranty = /ضمان\s*(سن[ةه]|عام)/.test(txt) ? 'سنة' : /فحص/.test(txt) ? 'فحص وتشغيل' : '';
  const desc = clean.join('\n');
  return { name, price, cat: classify(name, desc), desc, offer: isOffer ? 1 : 0, until: until ? 1 : 0, warranty, brand: brandOf(desc) };
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
const J = (o, st = 200, h = {}) => new Response(JSON.stringify(o), { status: st, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...h } });
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
  r.ai = ai ? { specs: ai.specs || [], desc: ai.desc || '', uses: ai.uses || [] } : null;
  let imgs = o.imgs || media.filter(x => !x.v).map(x => x.k);
  // أول صورة بالألبوم غالباً بوستر «عرض يوم…» فنخلي صورة المنتج نفسه هي الغلاف
  if (!o.imgs && imgs.length >= 3) imgs = [...imgs.slice(1), imgs[0]];
  if (!imgs.length && !o.imgs) imgs = media.map(x => x.k);
  r.imgs = imgs;
  r.videos = media.filter(x => x.v).map(x => x.k);
  if (r.offer && (r.until || p.src === 'tg') && p.dt && now() - Date.parse(p.dt) > 3 * 864e5 && !('offer' in o)) r.offer = 0;
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

async function aiEnrich(env, n) {
  if (!env.AI) return 0;
  const rows = (await env.DB.prepare("select id,auto,ov from products where ai is null and json_extract(ov,'$.del') is null order by dt desc limit ?").bind(n).all()).results || [];
  let ok = 0;
  for (const p of rows) {
    const a = { ...JSON.parse(p.auto), ...JSON.parse(p.ov || '{}') };
    const prompt = `أنت خبير منتجات إكسسوارات هواتف وتقنية في متجر عراقي. هذا منشور منتج:\n"""${(a.name || '') + '\n' + (a.desc || '')}\n${(a.specs || '')}"""\nالماركة: ${a.brand || 'غير معروفة'} — القسم: ${a.cat}\nأعطني JSON فقط بهذا الشكل بدون أي كلام آخر:\n{"title":"اسم واضح ومرتب للمنتج بالعربي (حد أقصى 60 حرف)","desc":"وصف تسويقي صادق بجملتين بالعربي الفصيح البسيط","specs":[["اسم المواصفة","القيمة"]],"uses":["استخدام 1","استخدام 2","استخدام 3"]}\nالمواصفات من 4 إلى 7، عامة ومنطقية لهذا النوع من المنتجات، لا تخترع أرقاماً دقيقة غير مذكورة بالمنشور (استخدم "حسب الموديل" إذا غير متأكد).`;
    try {
      const res = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages: [{ role: 'user', content: prompt }], max_tokens: 700, temperature: 0.3 });
      const t = (res && (res.response || res.result?.response)) || '';
      const s = typeof t === 'string' ? t : JSON.stringify(t);
      const j = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
      if (!Array.isArray(j.specs)) throw 0;
      j.specs = j.specs.filter(x => Array.isArray(x) && x.length === 2).slice(0, 8).map(x => [String(x[0]).slice(0, 40), String(x[1]).slice(0, 80)]);
      j.title = String(j.title || '').slice(0, 70); j.desc = String(j.desc || '').slice(0, 400);
      j.uses = (j.uses || []).slice(0, 4).map(x => String(x).slice(0, 60));
      await env.DB.prepare('update products set ai=? where id=?').bind(JSON.stringify(j), p.id).run(); ok++;
    } catch (e) { await env.DB.prepare('update products set ai=? where id=?').bind('{"specs":[],"err":1}', p.id).run(); }
  }
  return ok;
}

export async function sync(env, opt = {}) {
  const st = await getSettings(env);
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
  const imgs = await drainImgs(env, opt.imgs || 16);
  const ai = await aiEnrich(env, opt.ai || 2);
  await setSetting(env, '_lastSync', now());
  const res = { pages, msgs, made, imgs, ai };
  if (made || imgs || ai) await log(env, 'مزامنة: ' + JSON.stringify(res));
  return res;
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

function pub(p) { return { id: p.id, name: p.name, brand: p.brand || '', cat: p.cat, price: p.price || 0, old: p.old || 0, avail: p.avail ? 1 : 0, offer: p.offer ? 1 : 0, warranty: p.warranty || '', img: p.imgs[0] || '', n: p.imgs.length, feats: p.feats || '', dt: p.dt || '', pin: p.pin ? 1 : 0 }; }

async function allProducts(env, admin) {
  const rows = (await env.DB.prepare('select * from products').all()).results || [];
  const have = new Set(((await env.DB.prepare('select k from imgs').all()).results || []).map(x => x.k));
  let list = rows.map(eff).filter(p => admin || (!p.del && !p.hidden));
  for (const p of list) { p.ready = p.imgs.filter(k => have.has(k)).length; }
  if (!admin) list = list.filter(p => p.price > 0 && (p.imgs.length || p.src === 'sheet'));
  list.sort((a, b) => (b.pin || 0) - (a.pin || 0) || String(b.dt || '').localeCompare(String(a.dt || '')));
  return list;
}

async function publicData(env) {
  const s = await getSettings(env);
  const list = await allProducts(env, false);
  const cats = (s.cats || CATS.map(c => ({ n: c[0], i: c[1] })));
  const pubSet = {}; for (const k in s) if (!k.startsWith('_') && k !== 'pw' && k !== 'salt') pubSet[k] = s[k];
  return { s: pubSet, cats, p: list.map(pub), t: now() };
}

// ---------- صفحات ----------
function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
async function page(env, url, prod) {
  const origin = ORIGIN || url.origin;
  let title = 'مجمع H&H — إكسسوارات الهواتف والتقنية في بغداد', desc = 'كل منتجات مجمع H&H بالأسعار والمواصفات والضمان: شواحن، سماعات، باوربانك، كفرات، ساعات ذكية وأكثر. توصيل لكل العراق.', img = origin + '/icon.png';
  let ld = '';
  if (prod) {
    title = prod.name + ' — مجمع H&H';
    desc = `${prod.name} بسعر ${(prod.price || 0).toLocaleString('en')} دينار. ${String(prod.desc || '').replace(/\s+/g, ' ').slice(0, 140)}`;
    if (prod.imgs[0]) img = origin + '/img/' + prod.imgs[0];
    ld = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: prod.name, image: prod.imgs.map(k => origin + '/img/' + k), description: prod.desc || prod.name, brand: prod.brand || 'H&H', offers: { '@type': 'Offer', priceCurrency: 'IQD', price: prod.price, availability: prod.avail ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: origin + '/p/' + prod.id } }).replace(/</g, '\\u003c')}</script>`;
  }
  const head = `<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${esc(img)}"><meta property="og:type" content="${prod ? 'product' : 'website'}"><meta property="og:url" content="${esc(url.href)}"><link rel="canonical" href="${esc(origin + url.pathname)}"><meta name="twitter:card" content="summary_large_image">${ld}`;
  return new Response(APP.replace('<!--HEAD-->', () => head), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' } });
}

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#161A20"/><rect x="40" y="40" width="432" height="432" rx="84" fill="none" stroke="#C9A57C" stroke-opacity=".35" stroke-width="4"/><text x="256" y="318" font-family="Georgia,serif" font-size="190" fill="#D9B98F" text-anchor="middle" font-weight="700">H&amp;H</text></svg>`;

let ORIGIN = '';
export default {
  async scheduled(ev, env, ctx) { ctx.waitUntil(sync(env).catch(e => log(env, 'خطأ مزامنة: ' + e.message))); },
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname;
    const xh = req.headers.get('x-hh-host');
    ORIGIN = xh && /^[a-z0-9.-]+$/i.test(xh) ? 'https://' + xh : '';
    try {
      if (p === '/api/data') {
        const cache = caches.default, key = new Request(url.origin + '/api/data?v=' + Math.floor(now() / 60000));
        let r = await cache.match(key);
        if (!r) { r = J(await publicData(env), 200, { 'cache-control': 'public, max-age=60' }); ctx.waitUntil(cache.put(key, r.clone())); }
        return r;
      }
      if (p.startsWith('/api/p/')) {
        const row = await env.DB.prepare('select * from products where id=?').bind(decodeURIComponent(p.slice(7))).first();
        if (!row) return J({ err: 'missing' }, 404);
        const e = eff(row); if (e.del) return J({ err: 'missing' }, 404);
        return J(e, 200, { 'cache-control': 'public, max-age=60' });
      }
      if (p.startsWith('/img/')) {
        const k = p.slice(5).replace(/\W/g, '');
        const cache = caches.default, key = new Request(url.origin + '/img/' + k);
        let r = await cache.match(key); if (r) return r;
        let row = await env.DB.prepare('select ct,data from imgs where k=?').bind(k).first();
        let data, ct;
        if (row) { data = row.data; ct = row.ct; }
        else if (/^[tv]\d+$/.test(k)) { const q = await env.DB.prepare('select url from imgq where k=?').bind(k).first(); const f = await fetchImg(env, k, q && q.url); if (f) { data = f.buf; ct = f.ct; } }
        if (!data) return new Response(ICON, { status: 404, headers: { 'content-type': 'image/svg+xml', 'cache-control': 'no-store' } });
        r = new Response(data instanceof ArrayBuffer ? data : new Uint8Array(data), { headers: { 'content-type': ct, 'cache-control': 'public, max-age=31536000, immutable' } });
        ctx.waitUntil(cache.put(key, r.clone()));
        return r;
      }
      if (p === '/icon.svg' || p === '/icon.png' || p === '/favicon.ico') return new Response(ICON, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' } });
      if (p === '/manifest.webmanifest') return J({ name: 'مجمع H&H', short_name: 'H&H', start_url: '/', display: 'standalone', background_color: '#13161B', theme_color: '#13161B', dir: 'rtl', lang: 'ar', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] }, 200, { 'cache-control': 'public, max-age=86400' });
      if (p === '/robots.txt') return new Response(`User-agent: *\nDisallow: /admin\nSitemap: ${ORIGIN || url.origin}/sitemap.xml\n`);
      if (p === '/sitemap.xml') { const l = await allProducts(env, false); return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${ORIGIN || url.origin}/</loc></url>${l.map(x => `<url><loc>${ORIGIN || url.origin}/p/${x.id}</loc></url>`).join('')}</urlset>`, { headers: { 'content-type': 'application/xml' } }); }
      if (p === '/admin' || p === '/admin/') return new Response(ADMIN, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });

      if (p.startsWith('/api/admin/')) {
        const op = p.slice(11);
        if (req.method !== 'POST') return J({ err: 'method' }, 405);
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
          await env.DB.prepare('insert into sess(tok,exp) values(?,?)').bind(tok, now() + 30 * 864e5).run();
          await env.DB.prepare('delete from sess where exp < ?').bind(now()).run();
          return J({ ok: 1, tok });
        }
        if (!(await authed(req, env))) return J({ err: 'auth' }, 401);
        if (op === 'state') {
          const s = await getSettings(env);
          const list = await allProducts(env, true);
          const q = await env.DB.prepare('select count(*) n from imgq where tries < 6').first();
          const lg = (await env.DB.prepare('select at,msg from log order by at desc limit 15').all()).results;
          delete s.pw; delete s.salt; delete s._fails;
          return J({ s, cats: s.cats || CATS.map(c => ({ n: c[0], i: c[1] })), p: list, queue: q.n, log: lg, ai: !!env.AI });
        }
        if (op === 'save') {
          const b = await req.json();
          const row = b.id ? await env.DB.prepare('select ov from products where id=?').bind(b.id).first() : null;
          const id = b.id || ('m' + now().toString(36));
          const ov = { ...(row ? JSON.parse(row.ov || '{}') : {}), ...b.ov };
          for (const k in ov) if (ov[k] === null) delete ov[k];
          if (row) await env.DB.prepare('update products set ov=? where id=?').bind(JSON.stringify(ov), id).run();
          else await env.DB.prepare('insert into products(id,src,auto,ov,media,dt,at) values(?,?,?,?,?,?,?)').bind(id, 'admin', '{}', JSON.stringify(ov), '[]', new Date().toISOString(), now()).run();
          return J({ ok: 1, id });
        }
        if (op === 'upload') {
          const ct = req.headers.get('content-type') || 'image/jpeg';
          const buf = await req.arrayBuffer();
          if (buf.byteLength > 1.9e6) return J({ err: 'big' }, 413);
          const k = 'u' + now().toString(36) + Math.random().toString(36).slice(2, 6);
          await env.DB.prepare('insert into imgs(k,ct,data,at) values(?,?,?,?)').bind(k, ct, buf, now()).run();
          return J({ ok: 1, k });
        }
        if (op === 'settings') {
          const b = await req.json();
          for (const k in b) if (!k.startsWith('_') && k !== 'pw' && k !== 'salt') await setSetting(env, k, b[k]);
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
        if (op === 'sync') { const r = await sync(env, { imgs: 20, ai: 2 }); return J({ ok: 1, ...r }); }
        if (op === 'ai') {
          const { id } = await req.json();
          await env.DB.prepare('update products set ai=null where id=?').bind(id).run();
          if (env.AI) { const row = await env.DB.prepare('select id from products where id=?').bind(id).first(); if (row) { await env.DB.prepare("update products set dt=dt where id=?").bind(id).run(); } }
          return J({ ok: 1 });
        }
        if (op === 'logout') { await env.DB.prepare('delete from sess where tok=?').bind((req.headers.get('authorization') || '').slice(7)).run(); return J({ ok: 1 }); }
        return J({ err: 'op' }, 404);
      }

      if (p.startsWith('/p/')) {
        const row = await env.DB.prepare('select * from products where id=?').bind(decodeURIComponent(p.slice(3))).first();
        const e = row ? eff(row) : null;
        return page(env, url, e && !e.del ? e : null);
      }
      return page(env, url, null);
    } catch (e) {
      return J({ err: 'server', m: String(e && e.message || e) }, 500);
    }
  },
};
