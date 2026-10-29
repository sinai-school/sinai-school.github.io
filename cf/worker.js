/* خادم بوابة إعدادية سيناء للبنين على Cloudflare (D1)
 * نفس أوامر خادم Google Apps Script بالضبط، حتى التطبيق والنظام يشتغلون عليه بدون أي تغيير.
 * البيانات بقاعدة D1، والملفات الكبيرة مقسّمة قطع بجدول chunks. */
const J = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' };
const out = o => new Response(JSON.stringify(o), { headers: J });
const enc = new TextEncoder(), dec = new TextDecoder();
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID().replace(/-/g, '');
const CH = 400000;
let DB, ENV, ORIGIN, MEMO;

/* ---------- قاعدة البيانات ---------- */
const all = (q, ...a) => DB.prepare(q).bind(...a).all().then(r => r.results || []);
const one = (q, ...a) => DB.prepare(q).bind(...a).first();
const run = (q, ...a) => DB.prepare(q).bind(...a).run();
async function kvGet(k) { const r = await one('select v from kv where k=?', k); return r ? r.v : null; }
async function kvJ(k, d) { const v = await kvGet(k); if (v == null) return d; try { return JSON.parse(v); } catch (e) { return d; } }
const kvPut = (k, v) => run('insert into kv(k,v) values(?,?) on conflict(k) do update set v=excluded.v', k, typeof v === 'string' ? v : JSON.stringify(v));
/* نص كبير مقسّم قطع */
async function blobPut(id, s) {
  s = String(s); const st = [DB.prepare('delete from chunks where id=?').bind(id)];
  for (let i = 0, n = 0; i < s.length || n === 0; i += CH, n++) st.push(DB.prepare('insert into chunks(id,i,d) values(?,?,?)').bind(id, n, s.slice(i, i + CH)));
  for (let i = 0; i < st.length; i += 40) await DB.batch(st.slice(i, i + 40));
}
async function blobGet(id) { const r = await all('select d from chunks where id=? order by i', id); return r.length ? r.map(x => x.d).join('') : null; }
const blobDel = id => run('delete from chunks where id=?', id);

/* ---------- أدوات ---------- */
const ar2en = x => String(x || '').replace(/[٠-٩]/g, c => c.charCodeAt(0) - 1632);
function phone_(x) { let d = ar2en(x).replace(/\D/g, '').slice(-10); return d.length === 10 && d[0] === '7' ? '0' + d : ''; }
function nid_(x) { const d = ar2en(x).replace(/\D/g, ''); return /^(19|20)\d{10}$/.test(d) ? d : ''; }
const cid_ = b => String(b.cid || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 24);
/* المرفقات المرفوعة لهذا الخادم: نضيف رابطها المباشر حتى تنفتح وتنعرض (صور/ملفات) */
const fu_ = L => (L || []).map(f => f && !f.u && /^cf[A-Za-z0-9_-]+$/.test(String(f.id || '')) && ORIGIN ? Object.assign({}, f, { u: ORIGIN + '/f/' + f.id }) : f);
const fl_ = s => { try { return s ? JSON.parse(String(s)) : []; } catch (e) { return []; } };
const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); };
const unb64 = s => { const t = atob(String(s || '')); const a = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) a[i] = t.charCodeAt(i); return a; };
const cat = (...a) => { const n = a.reduce((s, x) => s + x.length, 0), o = new Uint8Array(n); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
async function hmac(key, msg) { const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return new Uint8Array(await crypto.subtle.sign('HMAC', k, msg)); }
async function md5_(s) { const d = new Uint8Array(await crypto.subtle.digest('MD5', enc.encode(String(s)))); return [...d].map(b => b.toString(16).padStart(2, '0')).join(''); }
async function gz(u8) { return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()); }
async function gunz(u8) { return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()); }

/* ---------- الإعدادات ---------- */
async function secret_() { if (MEMO.sec === undefined) MEMO.sec = await kvGet('SECRET'); return MEMO.sec; }
let G_PRIV = null, E202 = 0;
async function private_() {
  if (MEMO.priv) return MEMO.priv;
  const pv = (await kvGet('PRIVV')) || '0';
  if (G_PRIV && G_PRIV.v === pv) return MEMO.priv = G_PRIV.P;
  const P0 = await private0_(); G_PRIV = { v: pv, P: P0 }; return P0;
}
async function private0_() {
  const P = await kvJ('priv', null) || { s: {}, t: {} }, X = await kvJ('privx', {});
  for (const k of ['s', 't']) { P[k] = P[k] || {}; for (const id in (X[k] || {})) if (!P[k][id]) P[k][id] = X[k][id]; }
  return MEMO.priv = P;
}
const privBump_ = () => kvPut('PRIVV', uid().slice(0, 10)).then(() => { G_PRIV = null; MEMO.priv = null; });
async function gas_(body) {
  const u = await kvGet('GAS'); if (!u) return null;
  try { const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' }); return JSON.parse(await r.text()); } catch (e) { return null; }
}

/* ---------- الحسابات والملفات الشخصية ---------- */
const accGet_ = (kind, key) => one('select * from acc where kind=? and key=?', String(kind), String(key));
/* v204i: حساب انحذف (أو انسجل عليه غير صاحبه): صورته ومعلوماته ورقم بطاقته القديمة تنمسح حتى ما تطلع لصاحب الحساب الحقيقي */
async function wipeProf_(kind, key) {
  const q = await one('select json,photo from prof where kind=? and key=?', kind, key); if (!q) return;
  if (q.photo && q.photo !== 'gas') await blobDel('ph_' + q.photo);
  /* رقم البطاقة اللي كتبه المسجّل القديم ما ينحسب «الصحيح» — المعتمد بس من سجلات المدرسة أو تصحيح الإدارة (NIDFIX) */
  await run("update prof set json='{}',photo='',status='',updated=? where kind=? and key=?", now(), kind, key);
}
async function profGet_(kind, key) { return one('select json,photo,status,updated,name from prof where kind=? and key=?', kind, key); }
async function profPut_(p) {
  await run('insert into prof(kind,key,name,json,photo,updated,status) values(?,?,?,?,?,?,?) on conflict(kind,key) do update set name=excluded.name,json=excluded.json,photo=excluded.photo,updated=excluded.updated,status=excluded.status',
    p.kind, p.key, p.name || '', p.json || '{}', p.photo || '', p.updated || now(), p.status || '');
}
async function tooMany_(kind, key) { const r = await one('select n,exp from fails where k=?', 'f_' + kind + '_' + key); return r && r.exp > Date.now() && r.n >= 6; }
async function fail_(k, ttl) { const r = await one('select n,exp from fails where k=?', k); const n = r && r.exp > Date.now() ? r.n + 1 : 1; await run('insert into fails(k,n,exp) values(?,?,?) on conflict(k) do update set n=excluded.n,exp=excluded.exp', k, n, Date.now() + ttl * 1000); return n; }
async function nidOf_(kind, key, a) {
  const fx = (await kvJ('NIDFIX', {}))[kind + ':' + key]; if (nid_(fx)) return nid_(fx);
  const pv = ((await private_())[kind] || {})[key] || {};
  const s = nid_(pv.pre && pv.pre.nid) || nid_(pv.nid2); if (s) return s;
  if (a && a.nid) return a.nid;
  const pr = await profGet_(kind, key);
  if (pr) { try { const n = nid_(JSON.parse(pr.json || '{}').nid); if (n) return n; } catch (e) {} }
  return '';
}
async function auth_(b) {
  const kind = String(b.kind), key = String(b.key), a = await accGet_(kind, key);
  if (!a) return { err: 'notreg' };
  if (await tooMany_(kind, key)) return { err: 'locked' };
  if (a.phone !== phone_(b.phone)) { await fail_('f_' + kind + '_' + key, 900); return { err: 'wrong' }; }
  /* حساب منقول من خادم Google وما عنده رقم بطاقة مثبّت هنا: خادم Google يتحقق منه أول مرة */
  if (!a.nid && !((await private_())[kind] || {})[key] && await kvGet('GAS')) {
    const r = await gas_({ a: 'login', kind, key, phone: b.phone, nid: b.nid, pid: 'none' });
    if (r && /^(wrong|wrongnid|locked|neednid)$/.test(r.err || '')) { if (r.err !== 'neednid') await fail_('f_' + kind + '_' + key, 900); return { err: r.err }; }
    if (r && r.ok) {
      if (r.private && Object.keys(r.private).length) { const X = await kvJ('privx', {}); (X[kind] = X[kind] || {})[key] = r.private; await kvPut('privx', X); await privBump_(); }
      const g0 = nid_(b.nid); if (g0) { await accNid_(kind, key, g0); a.nid = g0; }
    }
  }
  const g = nid_(b.nid); if (!g) return { err: 'neednid' };
  const t = await nidOf_(kind, key, a);
  if (t && g !== t) { await fail_('f_' + kind + '_' + key, 900); return { err: 'wrongnid' }; }
  return { a, kind, key, bind: a.nid !== (t || g) ? (t || g) : '' };
}
const accNid_ = (kind, key, nid) => run('update acc set nid=?,updated=? where kind=? and key=?', nid, now(), kind, key);
/* إذا الإدارة بعد ما رفعت بيانات هذا الشخص للخادم الجديد: نجيبها مرة وحدة من خادم Google */
async function privHeal_(x, b) {
  const P = await private_();
  if ((P[x.kind] || {})[x.key]) return;
  const r = await gas_({ a: 'login', kind: x.kind, key: x.key, phone: b.phone, nid: b.nid, pid: 'none' });
  if (r && r.ok && r.private && Object.keys(r.private).length) {
    const X = await kvJ('privx', {}); (X[x.kind] = X[x.kind] || {})[x.key] = r.private; await kvPut('privx', X); await privBump_();
    (P[x.kind] = P[x.kind] || {})[x.key] = r.private;
  }
}

/* ---------- الصور والمرفقات ---------- */
async function photo_(id) { if (!id) return ''; return (await blobGet('ph_' + id)) || ''; }
async function storeFile_(name, mime, d) {
  const id = 'cf' + uid().slice(0, 22), raw = Math.floor(String(d).length * 3 / 4);
  await blobPut('f_' + id, d);
  await run('insert into files(id,n,m,s,at) values(?,?,?,?,?)', id, name, mime, raw, now());
  return { n: name, m: mime, id, s: raw, u: ORIGIN + '/f/' + id };
}
async function files_(arr, R) {
  for (const x of (arr || [])) {
    try {
      const d = String(x.d || ''); if (!d || d.length > 11500000) continue;
      R.out.push(await storeFile_(String(x.n || 'ملف').replace(/[\/\\]/g, '-').slice(0, 120), String(x.m || 'application/octet-stream'), d)); R.n++;
    } catch (e) { R.err.push(String(x && x.n || '') + ': ' + String(e).slice(0, 120)); }
  }
}
async function upList_(L, R) {
  for (const x of (L || []).slice(0, 300)) {
    const id = String(x && x.id || '').replace(/[^A-Za-z0-9_-]/g, '');
    const ok = id && await one('select id from ups where id=? and exp>?', id, Date.now());
    if (!ok) { R.err.push(String(x && x.n || '') + ': upload'); continue; }
    R.out.push({ n: String(x.n || 'ملف').slice(0, 120), m: String(x.m || '').slice(0, 100), id, s: +x.s || 0, u: ORIGIN + '/f/' + id }); R.n++;
  }
}
async function allFiles_(b) { const R = { out: [], n: 0, err: [] }; await files_(b.files, R); await upList_(b.fl, R); return R; }
/* رفع ملف مرفق: ينحفظ بالدرايف مثل قبل (عن طريق خادم Google)، وإذا ما رد ينحفظ هنا */
async function upOne_(b) {
  const d = String(b.d || ''); if (!d) return { err: 'file' };
  if (d.length > 36000000) return { err: 'big' };
  const name = String(b.n || 'ملف').replace(/[\/\\]/g, '-').slice(0, 120), mime = String(b.m || 'application/octet-stream').slice(0, 100);
  const f = await storeFile_(name, mime, d);
  await run('insert or replace into ups(id,exp) values(?,?)', f.id, Date.now() + 6 * 3600e3);
  return { ok: 1, f };
}

/* ---------- التبليغات ---------- */
async function notesAll_() {
  if (MEMO.notes) return MEMO.notes;
  const R = await all('select * from notes order by seq');
  return MEMO.notes = R.map(n => ({ id: String(n.id), scope: n.scope, target: n.target, from: n.frm, title: n.title, body: n.body, date: n.date, cat: n.cat || 'adm', files: fu_(fl_(n.files)) }));
}
async function notesFor_(kind, key, secs, pub) {
  const o = [];
  for (const n of await notesAll_()) {
    const t = n.target, sc = n.scope;
    const ok = sc === 'all' || (sc === 'allS' && kind === 's') || (sc === 'allT' && kind === 't') || (sc === 'sec' && kind === 's' && secs.includes(t)) || (!pub && sc === 'one' && t === kind + ':' + key)
      || (sc === 'exg' && kind === 's' && String(t || '').split('|').some(g => g && secs.some(x => x === g || String(x).startsWith(g + ' ')))) || (!pub && sc === 'exs' && kind === 's' && String(t || '').split('|').includes(key));
    if (ok) o.push({ id: n.id, from: n.from, title: n.title, body: n.body, date: n.date, cat: n.cat, files: n.files || [] });
  }
  const sn = new Set, r = [];
  for (const n of o.reverse()) { const k = [n.from, n.title, n.body, (n.files || []).length].join('|'); if (sn.has(k)) continue; sn.add(k); r.push(n); }
  return r.slice(0, 150);
}
const noteAdd_ = o => run('insert into notes(id,scope,target,frm,title,body,date,cat,files) values(?,?,?,?,?,?,?,?,?)', o.id, o.scope, o.target, o.from, o.title, o.body, o.date, o.cat, o.files);
const noteHas_ = async id => !!id && !!(await one('select id from notes where id=?', id));
async function sentFor_(name) {
  name = String(name || '').replace(/\s+/g, ' ').trim(); if (!name) return [];
  const P = await private_(), M = {};
  for (const r of await all("select id,key from seen where kind='s'")) (M[r.id] = M[r.id] || []).push(r.key);
  const cnt = {}; for (const k in (P.s || {})) { const v = P.s[k] || {}; for (const s of (v.secs || (v.s ? [v.s] : []))) cnt[s] = (cnt[s] || 0) + 1; }
  const o = [];
  for (const n of await notesAll_()) {
    if (String(n.from || '').replace(/\s+/g, ' ').trim() !== name || n.cat !== 'tch') continue;
    const who = M[n.id] || [];
    o.push({ id: n.id, title: n.title, date: n.date, scope: n.scope, target: n.target, nf: (n.files || []).length, n: who.length, tot: n.scope === 'one' ? 1 : (cnt[n.target] || 0), who: who.slice(0, 200) });
  }
  return o.reverse().slice(0, 40);
}
/* v204j: طالب ما عنده رقم بطاقة بسجلات المدرسة — حسابه «بانتظار تأكيد الإدارة»: يسجّل ويكمّل معلوماته،
   بس درجاته ونتائجه وتبليغاته الخاصة ما توصله لحد ما الإدارة تأكد رقم بطاقته (NIDFIX) */
const schoolNid_ = (F, P, kind, key) => { const fx = nid_(F[kind + ':' + key]); if (fx) return fx; const pv = (P[kind] || {})[key] || {}; return nid_(pv.pre && pv.pre.nid) || nid_(pv.nid2) || ''; };
async function unv_(kind, key) { if (kind !== 's') return false; return !schoolNid_(await kvJ('NIDFIX', {}), await private_(), kind, key); }
async function gate_(o, x) {
  if (!(await unv_(x.kind, x.key))) return o;
  const pv = o.private || {};
  o.unv = 1; o.private = { n: pv.n, s: pv.s, secs: pv.secs };
  o.notes = await notesFor_(x.kind, x.key, pv.secs || (pv.s ? [pv.s] : []), 1);
  o.tg = []; if (Array.isArray(o.ex)) o.ex = o.ex.filter(t => !t.mine);
  return o;
}
async function bundle_(x, b) {
  const P = await private_(), pv = (P[x.kind] || {})[x.key] || {}, pr = await profGet_(x.kind, x.key);
  const secs = pv.secs || (pv.s ? [pv.s] : []), pid = pr ? pr.photo : '', same = !!(pid && b && b.pid && String(b.pid) === pid);
  const o = { ok: 1, phone: x.a.phone, private: pv, profile: pr ? JSON.parse(pr.json || '{}') : {}, status: pr ? pr.status : '', photo: same ? '' : (pr ? await photo_(pid) : ''), pid, notes: await notesFor_(x.kind, x.key, secs), at: now() };
  if (same) o.ph1 = 1;
  if (x.kind === 't') { try { o.sent = await sentFor_(x.a.name || pv.n || ''); } catch (e) { o.sent = []; } }
  try { await extra202_(o, x); } catch (e) { }
  try { await extra204_(o, x); } catch (e) { }
  return gate_(o, x);
}
async function fget_(b) {
  if (b.rid) { const x0 = await auth_(b); if (x0.err) return x0; const r = await one('select * from reports where id=?', String(b.rid)); if (!r || !((r.kind === x0.kind && r.key === x0.key) || r.tgt === 't:' + x0.key)) return { err: 'nofile' }; const f = fl_(r.files).find(z => String(z.id) === String(b.id)); if (!f) return { err: 'nofile' }; const d = await blobGet('f_' + f.id); return d ? { ok: 1, n: f.n, m: f.m, d } : { err: 'nofile' }; }
  const x = await auth_(b); if (x.err) return x;
  const P = await private_(), pv = (P[x.kind] || {})[x.key] || {}, secs = pv.secs || (pv.s ? [pv.s] : []), id = String(b.id || '');
  let f = null; for (const n of await notesFor_(x.kind, x.key, secs, await unv_(x.kind, x.key))) for (const z of (n.files || [])) if (String(z.id) === id) f = z;
  if (!f) return { err: 'nofile' };
  const d = await blobGet('f_' + id); if (d) return { ok: 1, n: f.n, m: f.m, d };
  try { const r = await fetch('https://drive.google.com/uc?export=download&id=' + encodeURIComponent(id)); if (r.ok) return { ok: 1, n: f.n, m: f.m || r.headers.get('content-type'), d: b64(new Uint8Array(await r.arrayBuffer())) }; } catch (e) {}
  return { err: 'nofile' };
}


/* ---------- v202: بلاغات للإدارة أو لمدرس معيّن، رد سريع، درجات المدرسين، اعتماد النتائج، تصحيح الهاتف والبطاقة ---------- */
async function ens202_() {
  if (E202) return; E202 = 1;
  if ((await kvGet('E202')) === '3') return;
  for (const q of ['alter table reports add column tgt text', 'alter table reports add column files text', 'alter table reports add column reply text', 'alter table reports add column rdate text', 'alter table reports add column cid text',
    'create table if not exists tgr(id text primary key, tkey text, tname text, subj text, label text, skey text, val text, note text, date text)',
    'create index if not exists tgr_s on tgr(skey)', 'create index if not exists tgr_t on tgr(tkey)']) { try { await run(q); } catch (e) { } }
  await kvPut('E202', '3');
}
async function noteDup_(scope, target, title, body) {
  const t = new Date(Date.now() - 30 * 60e3).toISOString();
  return !!(await one('select id from notes where scope=? and target=? and title=? and body=? and date>? limit 1', String(scope), String(target || ''), String(title || '').slice(0, 120), String(body || ''), t));
}
async function report202_(y, b) {
  const ci = cid_(b); if (ci && await one('select id from reports where cid=?', ci)) return { ok: 1, dup: 1 };
  const text = String(b.text || '').trim().slice(0, 4000); if (text.length < 2) return { err: 'text' };
  let tgt = String(b.to || 'adm');
  if (tgt !== 'adm') {
    const k = tgt.replace(/^t:/, ''), P = await private_(), t = (P.t || {})[k];
    if (!t || (y.kind === 's' && !(t.studs || []).includes(y.key))) return { err: 'to' };
    tgt = 't:' + k;
  }
  const since = new Date(Date.now() - 10 * 60e3).toISOString();
  if (await one('select id from reports where kind=? and key=? and text=? and date>? limit 1', y.kind, y.key, text, since)) return { ok: 1, dup: 1 };
  const F = await allFiles_(b);
  await run('insert into reports(id,kind,key,name,text,date,status,tgt,files,cid) values(?,?,?,?,?,?,?,?,?,?)', uid().slice(0, 10), y.kind, y.key, y.a.name, text, now(), 'new', tgt, F.out.length ? JSON.stringify(F.out) : '', ci || null);
  return { ok: 1, nf: F.n, ferr: F.err };
}
/* الرد على البلاغ بخطوة وحدة: يوصل للطالب كتبليغ + يبين تحت بلاغه + يتعلّم «تم» */
async function repReply202_(b, y) {
  const r = await one('select * from reports where id=?', String(b.id || '')); if (!r) return { err: 'nofile' };
  if (y && r.tgt !== 't:' + y.key) return { err: 'role' };
  const body = String(b.body || '').trim().slice(0, 8000); if (!body) return { err: 'text' };
  const from = y ? (y.a.name || 'المدرس') : String(b.from || 'إدارة المدرسة');
  const ci = cid_(b) || uid().slice(0, 10);
  if (!(await noteHas_(ci))) {
    const F = await allFiles_(b);
    await noteAdd_({ id: ci, scope: 'one', target: r.kind + ':' + r.key, from, title: String(b.title || 'رد على بلاغك').slice(0, 120), body, date: now(), cat: y ? 'tch' : 'adm', files: F.out.length ? JSON.stringify(F.out) : '' });
  }
  await run('update reports set reply=?,rdate=?,status=? where id=?', body, now(), b.keep ? r.status : 'done', r.id);
  return { ok: 1 };
}
async function tgrade202_(b, y) {
  if (y.kind !== 't') return { err: 'role' };
  const P = await private_(), me = (P.t || {})[y.key] || {}, studs = new Set(me.studs || []);
  const label = String(b.label || '').trim().slice(0, 60), subj = String(b.subj || '').trim().slice(0, 60);
  if (!label) return { err: 'text' };
  const st = [], t = now();
  for (const r of (b.rows || []).slice(0, 600)) {
    const sk = String(r[0] || ''), v = String(r[1] == null ? '' : r[1]).trim().slice(0, 20), nt = String(r[2] || '').slice(0, 200);
    if (!studs.has(sk)) continue;
    const id = [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(y.key + '|' + label + '|' + subj + '|' + sk)))].slice(0, 12).map(x => x.toString(16).padStart(2, '0')).join('');
    if (v === '' && !nt) st.push(DB.prepare('delete from tgr where id=?').bind(id));
    else st.push(DB.prepare('insert into tgr(id,tkey,tname,subj,label,skey,val,note,date) values(?,?,?,?,?,?,?,?,?) on conflict(id) do update set val=excluded.val,note=excluded.note,date=excluded.date,tname=excluded.tname').bind(id, y.key, y.a.name || me.n || '', subj, label, sk, v, nt, t));
  }
  for (let i = 0; i < st.length; i += 80) await DB.batch(st.slice(i, i + 80));
  return { ok: 1, n: st.length };
}
async function extra202_(o, x) {
  const R = x.kind === 's'
    ? await all("select id,text,date,status,tgt,files,reply,rdate from reports where kind=? and key=? order by date desc limit 60", x.kind, x.key)
    : await all("select id,kind,key,name,text,date,status,tgt,files,reply,rdate from reports where (kind=? and key=?) or tgt=? order by date desc limit 150", x.kind, x.key, 't:' + x.key);
  const mine = R.filter(r => !r.kind || (r.kind === x.kind && r.key === x.key)).map(r => ({ id: r.id, text: r.text, date: r.date, status: r.status, to: r.tgt || 'adm', files: fu_(fl_(r.files)), reply: r.reply || '', rdate: r.rdate || '' }));
  o.myreps = mine;
  if (x.kind === 't') o.reps = R.filter(r => r.tgt === 't:' + x.key).map(r => ({ id: r.id, kind: r.kind, key: r.key, name: r.name, text: r.text, date: r.date, status: r.status, files: fl_(r.files), reply: r.reply || '', rdate: r.rdate || '' }));
  if (x.kind === 's') {
    o.tg = await all('select tname,subj,label,val,note,date from tgr where skey=? order by date desc limit 300', x.key);
    const rel = (await kvJ('REL', { c: [] })).c || [], pv = o.private;
    if (pv && Array.isArray(pv.g)) { o.private = { ...pv, g: pv.g.map(r => r.map((v, i) => i === 0 || rel.includes(i) ? v : '')), rel }; }
  }
}
async function editAcc202_(b) {
  const kind = String(b.kind), key = String(b.key), a0 = await accGet_(kind, key);
  if (!a0) return { err: 'notreg' };
  let ph = a0.phone; if (b.phone != null && String(b.phone).trim() !== '') { ph = phone_(b.phone); if (!ph) return { err: 'phone' }; }
  let nd = a0.nid || '';
  if (b.nid != null && String(b.nid).trim() !== '') {
    nd = nid_(b.nid); if (!nd) return { err: 'nid' };
    const F = await kvJ('NIDFIX', {}); F[kind + ':' + key] = nd; await kvPut('NIDFIX', F);
    const p = await one('select json from prof where kind=? and key=?', kind, key);
    if (p) { try { const o = JSON.parse(p.json || '{}'); o.nid = nd; await run('update prof set json=? where kind=? and key=?', JSON.stringify(o), kind, key); } catch (e) { } }
  }
  await run('update acc set phone=?,nid=?,updated=? where kind=? and key=?', ph, nd, now(), kind, key);
  await run('delete from fails where k=?', 'f_' + kind + '_' + key);
  return { ok: 1, phone: ph, nid: nd };
}

/* ---------- v204: جداول الامتحانات المنشورة للطلاب (تتحدّث وحدها مع كل تعديل بعد النشر) ---------- */
const exHash_ = o => syH_(canon_(o || null));
async function exPub204_(b) {
  const k = String(b.k || '').replace(/[^\w]/g, '').slice(0, 20); if (!k) return { err: 'k' };
  const P = await kvJ('EXPUB', {}), old = P[k] || null;
  if (b.data == null) { delete P[k]; await kvPut('EXPUB', P); return { ok: 1, off: 1 }; }
  const d = b.data || {};
  const t = { k, t: String(d.t || '').slice(0, 200), g: (d.g || []).map(String).slice(0, 20), rows: (d.rows || []).slice(0, 60).map(r => ({ d: String(r.d || '').slice(0, 10), c: (r.c || []).map(x => String(x || '').slice(0, 80)) })), notes: String(d.notes || '').slice(0, 4000), f2: d.f2 && typeof d.f2 === 'object' ? d.f2 : null };
  const h = exHash_([t.t, t.g, t.rows, t.notes, t.f2]);
  if (old && old.h === h) return { ok: 1, same: 1, at: old.at };
  t.h = h; t.at = now(); P[k] = t; await kvPut('EXPUB', P);
  /* تبليغ للطلاب المعنيين (أول نشر، وبعدها كل تحديث — مرة كل ٣٠ دقيقة بالأكثر) */
  const last = old && old.nt ? Date.parse(old.nt) : 0;
  if (!old || Date.now() - last > 30 * 60e3) {
    t.nt = now(); P[k] = t; await kvPut('EXPUB', P);
    const title = (old ? 'تحدّث ' : 'انتشر ') + (t.t || 'جدول الامتحانات');
    const body = (old ? 'صار تعديل على ' : '') + (t.t || 'جدول الامتحانات') + ' — افتح تبويب «الامتحانات» حتى تشوف الجدول.';
    const sc = t.f2 ? 'exs' : 'exg', tg = t.f2 ? Object.keys(t.f2).join('|') : t.g.join('|');
    if (tg) await noteAdd_({ id: 'ex' + uid().slice(0, 10), scope: sc, target: tg, from: 'إدارة المدرسة', title: title.slice(0, 120), body, date: now(), cat: 'adm', files: '' });
  }
  return { ok: 1, at: t.at, h };
}
async function extra204_(o, x) {
  const P = await kvJ('EXPUB', {}), L = [];
  for (const k in P) {
    const t = P[k]; if (!t) continue;
    if (x.kind === 's') {
      const pv = o.private || {}, sec = String(pv.s || (pv.secs || [])[0] || ''), g = sec.split(' ').slice(0, -1).join(' ') || sec;
      const gi = t.g.indexOf(g);
      if (t.f2) { if (!t.f2[x.key]) continue; }
      if (gi < 0) continue;
      L.push({ k, t: t.t, at: t.at, g: [g], rows: t.rows.map(r => ({ d: r.d, c: [r.c[gi] || ''] })), notes: t.notes, mine: t.f2 ? t.f2[x.key] : null });
    } else L.push({ k, t: t.t, at: t.at, g: t.g, rows: t.rows, notes: t.notes, n2: t.f2 ? Object.keys(t.f2).length : 0 });
  }
  o.ex = L; o.exh = exHash_(L.map(t => [t.k, t.at]));
  if (x.kind === 't' && !o.sent) { try { const pv = ((await private_()).t || {})[x.key] || {}; o.sent = await sentFor_(x.a.name || pv.n || ''); } catch (e) { } }
}

/* ---------- الأوامر ---------- */
async function handle(b) {
  const a = String(b.a || '');
  await ens202_();
  if (a === 'status') return { ok: 1, reg: !!(await accGet_(b.kind, b.key)) };
  if (a === 'login') {
    const x = await auth_(b); if (x.err) return x;
    if (x.bind) await accNid_(x.kind, x.key, x.bind);
    return bundle_(x, b);
  }
  if (a === 'stf') return stf_(b);
  if (a === 'export') return export_();
  if (a === 'fget') return fget_(b);
  if (a === 'snap') return snapGet_(b);
  if (a === 'up') { const y = await auth_(b); if (y.err) return y; return upOne_(b); }
  if (a === 'relay') return relay_(b);
  if (a === 'exack') return exack_(b);
  if (a === 'admin') {
    if (String(b.secret || '').startsWith('own:')) {
      const ac = await stfAcc_(String(b.secret).slice(4));
      if (!ac || !ac.own || ac.ro) return { err: 'auth' };
      if (b.op === 'init') return { err: 'op' };
      b.secret = await secret_();
    }
    return admin_(b);
  }
  if (a === 'boot') return boot_(b);
  if (a === 'migrate') return migrate_(b);
  if (a === 'reg') {
    const kind = String(b.kind), key = String(b.key), ph = phone_(b.phone);
    if (!ph) return { err: 'phone' };
    if (await accGet_(kind, key)) return { err: 'taken' };
    const gn = nid_(b.nid); if (!gn) return { err: 'neednid' };
    if (await tooMany_(kind, key)) return { err: 'locked' };
    const tn = await nidOf_(kind, key, null);
    if (tn && tn !== gn) { await fail_('f_' + kind + '_' + key, 900); return { err: 'wrongnid' }; }
    const t = now(), acc = { kind, key, name: String(b.name || ''), phone: ph, created: t, updated: t, nid: gn };
    await wipeProf_(kind, key);
    await run('insert into acc(kind,key,name,phone,created,updated,nid) values(?,?,?,?,?,?,?)', kind, key, acc.name, ph, t, t, gn);
    return bundle_({ a: acc, kind, key }, b);
  }
  if (['save', 'photo', 'report', 'notify', 'seen', 'inbox', 'repReply', 'tgrade', 'tgrades'].includes(a)) {
    const y = await auth_(b); if (y.err) return y;
    if (y.bind) await accNid_(y.kind, y.key, y.bind);
    if (a === 'save') {
      const p = await one('select * from prof where kind=? and key=?', y.kind, y.key) || { kind: y.kind, key: y.key, name: y.a.name };
      const cur = p.json ? JSON.parse(p.json) : {};
      for (const k of Object.keys(b.info || {})) cur[k] = String(b.info[k] || '').slice(0, 300);
      p.json = JSON.stringify(cur); p.updated = now(); p.status = 'new'; await profPut_(p); let ap = null; try { ap = await applyOne_(y.kind, y.key); } catch (e) { ap = { err: String(e).slice(0, 120) }; } return { ok: 1, ap };
    }
    if (a === 'photo') {
      const m = String(b.data || '').match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
      if (!m || m[3].length > 400000) return { err: 'photo' };
      const q = await one('select * from prof where kind=? and key=?', y.kind, y.key) || { kind: y.kind, key: y.key, name: y.a.name, json: '{}' };
      if (q.photo) await blobDel('ph_' + q.photo);
      q.photo = 'p' + uid().slice(0, 20); q.updated = now(); q.status = 'new';
      await blobPut('ph_' + q.photo, String(b.data)); await profPut_(q);
      try { await applyOne_(y.kind, y.key); } catch (e) { }
      return { ok: 1, pid: q.photo };
    }
    if (a === 'report') return report202_(y, b);
    if (a === 'notify') {
      if (y.kind !== 't') return { err: 'role' };
      const P = await private_(), me = (P.t || {})[y.key] || {}, secs = me.secs || [], studs = me.studs || [];
      const sc = String(b.scope), tg = String(b.target);
      if (sc === 'sec' && !secs.includes(tg)) return { err: 'scope' };
      if (sc === 'one' && !studs.includes(tg.replace(/^s:/, ''))) return { err: 'scope' };
      if (sc !== 'sec' && sc !== 'one') return { err: 'scope' };
      const ci = cid_(b); if (await noteHas_(ci)) return { ok: 1, dup: 1, nf: -1 };
      if (await noteDup_(sc, tg, b.title, b.body)) return { ok: 1, dup: 1, nf: -1 };
      const F = await allFiles_(b);
      await noteAdd_({ id: ci || uid().slice(0, 8), scope: sc, target: tg, from: y.a.name, title: String(b.title || '').slice(0, 120), body: String(b.body || '').slice(0, 8000), date: now(), cat: 'tch', files: F.out.length ? JSON.stringify(F.out) : '' });
      return { ok: 1, nf: F.n, ferr: F.err };
    }
    if (a === 'inbox') { const P = await private_(), pv = (P[y.kind] || {})[y.key] || {}, secs = pv.secs || (pv.s ? [pv.s] : []); const o = { ok: 1, notes: await notesFor_(y.kind, y.key, secs), at: now() }; await extra202_(o, y); try { await extra204_(o, y); } catch (e) { } return gate_(o, y); }
    if (a === 'repReply') return repReply202_(b, y);
    if (a === 'tgrade') return tgrade202_(b, y);
    if (a === 'tgrades') { if (y.kind !== 't') return { err: 'role' }; return { ok: 1, rows: await all('select subj,label,skey,val,note,date from tgr where tkey=? order by date desc limit 3000', y.key) }; }
    if (a === 'seen') {
      const st = []; for (const id of (b.ids || []).slice(0, 200)) st.push(DB.prepare('insert or ignore into seen(id,kind,key,at) values(?,?,?,?)').bind(String(id), y.kind, y.key, now()));
      let n = 0; if (st.length) { const r = await DB.batch(st); n = r.reduce((s, x) => s + (x.meta && x.meta.changes || 0), 0); }
      return { ok: 1, n };
    }
  }
  return { err: 'action' };
}

/* ---------- أوامر الإدارة (بالرمز السري) ---------- */
async function admin_(b) {
  const sec = await secret_();
  if (b.op === 'init') { if (sec && sec !== b.secret) return { err: 'claimed' }; if (!sec) { await kvPut('SECRET', String(b.secret)); MEMO.sec = String(b.secret); } return { ok: 1, sheet: '' }; }
  if (!sec || b.secret !== sec) return { err: 'auth' };
  if (b.op === 'push') { await kvPut('priv', b.data || {}); await kvPut('privx', {}); await privBump_(); return { ok: 1 }; }
  if (b.op === 'pull') {
    const seen = {}; for (const r of await all('select id,kind,key from seen')) (seen[r.id] = seen[r.id] || []).push(r.kind + ':' + r.key);
    return { ok: 1, sheet: '',
      acc: (await all('select * from acc')).map(r => ({ kind: r.kind, key: r.key, name: r.name, phone: r.phone, created: r.created, updated: r.updated })),
      prof: (await all('select kind,key,name,json,photo,updated,status from prof')).map(r => ({ kind: r.kind, key: r.key, name: r.name, json: r.json, photo: r.photo ? 1 : 0, updated: r.updated, status: r.status })),
      notes: (await notesAll_()).map(n => ({ id: n.id, scope: n.scope, target: n.target, from: n.from, title: n.title, body: n.body, date: n.date, cat: n.cat, files: n.files })),
      seen, reports: (await all('select id,kind,key,name,text,date,status,tgt,files,reply,rdate from reports order by date')).map(r => ({ ...r, files: fl_(r.files) })),
      unv: await (async () => { const F = await kvJ('NIDFIX', {}), P = await private_(); return (await all("select key,nid from acc where kind='s'")).filter(r => !schoolNid_(F, P, 's', r.key)).map(r => ({ key: r.key, nid: r.nid || '' })); })(),
      nids: Object.fromEntries((await all("select kind,key,nid from acc where nid<>''")).map(r => [r.kind + ':' + r.key, r.nid])),
      rel: await kvJ('REL', { c: [] }), tgc: (await all('select label,subj,tname,count(*) n,max(date) d from tgr group by tkey,label,subj order by d desc limit 300')) };
  }
  if (b.op === 'photo') { const q = await profGet_(String(b.kind), String(b.key)); return { ok: 1, photo: q ? await photo_(q.photo) : '' }; }
  if (b.op === 'setPhone') {
    const kind = String(b.kind), key = String(b.key), ph = phone_(b.phone);
    if (!b.phone) { await run('delete from acc where kind=? and key=?', kind, key); await wipeProf_(kind, key); return { ok: 1 }; }
    if (!ph) return { err: 'phone' };
    const ex = await accGet_(kind, key), t = now();
    if (ex) await run("update acc set phone=?,nid='',updated=? where kind=? and key=?", ph, t, kind, key);
    else await run("insert into acc(kind,key,name,phone,created,updated,nid) values(?,?,?,?,?,?,'')", kind, key, String(b.name || ''), ph, t, t);
    await run('delete from fails where k=?', 'f_' + kind + '_' + key); return { ok: 1 };
  }
  if (b.op === 'nidOk') {
    const kind = String(b.kind || 's'), key = String(b.key), a0 = await accGet_(kind, key); if (!a0) return { err: 'notreg' };
    const nd = nid_(b.nid || a0.nid); if (!nd) return { err: 'nid' };
    const F = await kvJ('NIDFIX', {}); F[kind + ':' + key] = nd; await kvPut('NIDFIX', F);
    if (nd !== a0.nid) await run('update acc set nid=?,updated=? where kind=? and key=?', nd, now(), kind, key);
    return { ok: 1, nid: nd };
  }
  if (b.op === 'wipeProf') { await wipeProf_(String(b.kind), String(b.key)); return { ok: 1 }; }
  if (b.op === 'profStatus') { await run('update prof set status=? where kind=? and key=?', String(b.status), String(b.kind), String(b.key)); return { ok: 1 }; }
  if (b.op === 'note') {
    const ci = cid_(b); if (await noteHas_(ci)) return { ok: 1, dup: 1, nf: -1 };
    if (await noteDup_(String(b.scope), String(b.target || ''), b.title, b.body)) return { ok: 1, dup: 1, nf: -1 };
    const F = await allFiles_(b);
    await noteAdd_({ id: ci || uid().slice(0, 8), scope: String(b.scope), target: String(b.target || ''), from: String(b.from || 'إدارة المدرسة'), title: String(b.title || ''), body: String(b.body || ''), date: now(), cat: String(b.cat || 'adm'), files: F.out.length ? JSON.stringify(F.out) : '' });
    return { ok: 1, nf: F.n, ferr: F.err };
  }
  if (b.op === 'delNote') { await run('delete from notes where id=?', String(b.id)); return { ok: 1 }; }
  if (b.op === 'osync') return osync_(b);
  if (b.op === 'snapPut') return snapPut_(b);
  if (b.op === 'bkput') return bkput_(b);
  if (b.op === 'bklist') return { ok: 1, list: await bklist_() };
  if (b.op === 'bkget') return bkget_(b);
  if (b.op === 'applyAll') return applyAll_();
  if (b.op === 'editAcc') return editAcc202_(b);
  if (b.op === 'repReply') return repReply202_(b, null);
  if (b.op === 'up') return upOne_(b);
  if (b.op === 'rel') { const c = (b.c || []).map(Number).filter(n => n >= 1 && n <= 6); await kvPut('REL', { c, at: now() }); return { ok: 1, c }; }
  if (b.op === 'report') { await run('update reports set status=? where id=?', String(b.status || 'done'), String(b.id)); return { ok: 1 }; }
  if (b.op === 'exPub') return exPub204_(b);
  if (b.op === 'exGet') return { ok: 1, pub: await kvJ('EXPUB', {}) };
  return { err: 'op' };
}

/* ---------- نسخة البوابة (الأسماء والشعب والجدول) ---------- */
async function snapPut_(b) {
  const at = String(b.at || ''), z = String(b.z || '');
  if (!at || !z || z.length > 4000000) return { err: 'bad' };
  await blobPut('snap', JSON.stringify({ at, z })); await kvPut('snapat', at); return { ok: 1, at };
}
async function snapGet_(b) {
  const at = await kvGet('snapat'); if (!at) return { ok: 1, none: 1 };
  if (b.at && String(b.at) >= at) return { ok: 1, same: 1, at };
  const o = JSON.parse(await blobGet('snap') || '{}'); return { ok: 1, at: o.at, z: o.z };
}

/* ---------- النسخ الاحتياطية ---------- */
async function bkput_(b) {
  const id = String(b.id || '').replace(/[^\w-]/g, ''), i = +b.i || 0, n = +b.n || 1;
  const name = String(b.name || ('نسخة-سيناء-' + id + '.json')).replace(/[\/\\]/g, '-').slice(0, 120);
  if (!id) return { err: 'id' };
  const save = async (data) => {
    const fid = 'bk' + uid().slice(0, 20);
    if (b.keep) for (const o of await all('select id from bk where name=?', name)) { await blobDel('bk_' + o.id); await run('delete from bk where id=?', o.id); }
    await blobPut('bk_' + fid, data); await run('insert into bk(id,name,at,size) values(?,?,?,?)', fid, name, now(), data.length);
    const old = await all('select id from bk order by at desc limit -1 offset 30');
    for (const o of old) { await blobDel('bk_' + o.id); await run('delete from bk where id=?', o.id); }
    return { ok: 1, done: 1, url: await bkUrl_(fid), name, folder: '' };
  };
  if (n === 1 && b.keep) return save(String(b.data || ''));
  await blobPut('bkp_' + id + '_' + i, String(b.data || ''));
  if (i < n - 1) return { ok: 1 };
  const parts = [];
  for (let k = 0; k < n; k++) { const s = await blobGet('bkp_' + id + '_' + k); if (s == null) return { err: 'part', i: k }; parts.push(s); }
  for (let k = 0; k < n; k++) await blobDel('bkp_' + id + '_' + k);
  return save(parts.join(''));
}
async function bkUrl_(id) { const k = await exK_('mac'); return ORIGIN + '/bk/' + id + '?k=' + encodeURIComponent((await hm_(k, 'bk|' + id)).slice(0, 22)); }
async function bklist_() { const L = await all('select * from bk order by at desc'); const o = []; for (const x of L) o.push({ id: x.id, name: x.name, at: x.at, size: x.size, url: await bkUrl_(x.id) }); return o; }
async function bkget_(b) {
  const s = await blobGet('bk_' + String(b.id)); if (s == null) return { err: 'auth' };
  const C = 3000000, i = +b.i || 0; return { ok: 1, n: Math.ceil(s.length / C) || 1, data: s.slice(i * C, (i + 1) * C) };
}

/* ---------- حسابات الموظفين + مزامنة بيانات النظام ---------- */
const DOC_RE = /^(school\/(config|timetable|students|custom)|priv\/official|stuinfo\/(g4|g5|g6)|(letters|arch|archpart|grades|attendance|staff|staffphoto|mail|mailimg|qaid|qaidimg)\/[A-Za-z0-9_\-.~:@+]{1,200})$/;
const BLOB_RE = /^(archpart|mailimg|qaidimg|staffphoto)\//;
/* حساب المالك على رابط المدرسة: نفس الملفات + الأختام والتوقيع */
/* مدير النظام: كل ملفات النظام بدون استثناء (عدا الملفات الداخلية للخادم) */
const OWN_RE = /^(?!_)[A-Za-z0-9_\-]{1,40}\/[A-Za-z0-9_\-.~:@+]{1,200}$/;
const reOf = a => a && a.own ? OWN_RE : DOC_RE;
async function drev_() { await run("insert into kv(k,v) values('DREV','1') on conflict(k) do update set v=cast(v as integer)+1"); return +(await kvGet('DREV')); }
const dmeta_ = p => one('select p,rev,at,by,h,oh,n from docs where p=?', p);
async function dget_(e) { if (!e || !e.n || e.h === 'DEL') return ''; return (await blobGet('d_' + e.p)) || ''; }
async function dput_(p, d, h, by, oh, rev) {
  const e = await dmeta_(p);
  rev = rev || await drev_();
  const hh = d == null ? 'DEL' : String(h || ''), o2 = oh == null ? (e ? e.oh : '') : String(oh);
  if (d == null) await blobDel('d_' + p); else await blobPut('d_' + p, d);
  await run('insert into docs(p,rev,at,by,h,oh,n,t) values(?,?,?,?,?,?,?,?) on conflict(p) do update set rev=excluded.rev,at=excluded.at,by=excluded.by,h=excluded.h,oh=excluded.oh,n=excluded.n',
    p, rev, Date.now(), by, hh, o2, d == null ? 0 : 1, BLOB_RE.test(p) ? 'blobs' : 'docs');
  if (p === '__roles') MEMO.roles = null;
  return { p, rev, h: hh, oh: o2 };
}
const doh_ = (p, h) => run('update docs set oh=? where p=?', h, p);
async function droles_() {
  if (MEMO.roles) return MEMO.roles;
  const e = await dmeta_('__roles'); let L = [];
  try { L = JSON.parse((await dget_(e)) || '{"list":[]}').list || []; } catch (x) { L = []; }
  return MEMO.roles = L;
}
const spub_ = a => ({ id: a.id, u: a.u, name: a.name, sid: a.sid || '', secs: a.secs || [], ro: a.ro ? 1 : 0, own: a.own ? 1 : 0 });
async function sfake_(u) { const d = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode('sinai-fs|' + u + '|' + ((await secret_()) || 'x')))); return b64(d.slice(0, 16)); }
async function stfAcc_(tok) {
  const tr = tok ? await one('select v,exp from toks where k=?', String(tok)) : null;
  if (!tr || tr.exp < Date.now()) return null;
  const tv = JSON.parse(tr.v);
  for (const x of await droles_()) if (x.id === tv.id && x.on !== 0 && x.h === tv.h) return x;
  return null;
}
/* حسابات الموظفين تنحفظ بملف school/roles (يشوفه ويعدّله المالك فقط) ونسخة منه __roles للدخول */
async function rolesDoc_() {
  const e = await dmeta_('school/roles'); if (e && e.h !== 'DEL') return;
  const L = await droles_(); const t = canon_({ json: JSON.stringify({ list: L }) });
  await dput_('school/roles', t, syH_(t), 'o', syH_(t));
}
async function rolesFromDoc_(d) {
  let L = null; try { L = JSON.parse(JSON.parse(d).json).list; } catch (x) { L = null; }
  if (!Array.isArray(L)) return 0;
  if (!L.some(x => x && x.own && x.on !== 0)) return -1; // ما نسمح المالك يقفل على نفسه
  await dput_('__roles', JSON.stringify({ list: L }), '', 'o', ''); MEMO.roles = null; return 1;
}
async function stf_(b) {
  const op = String(b.op || '');
  if (op === 'salt') {
    const u = String(b.u || '').trim().toLowerCase(); let a0 = null;
    for (const x of await droles_()) if (x.u === u && x.on !== 0) a0 = x;
    return { ok: 1, salt: a0 ? a0.salt : await sfake_(u) };
  }
  if (op === 'login') {
    const u = String(b.u || '').trim().toLowerCase(), fk = 'sf_' + u, f = await one('select n,exp from fails where k=?', fk);
    if (f && f.exp > Date.now() && f.n >= 8) return { err: 'many' };
    let a1 = null; for (const x of await droles_()) if (x.u === u && x.on !== 0) a1 = x;
    if (!a1 || !b.h || String(b.h) !== String(a1.h)) { await fail_(fk, 900); return { err: 'bad' }; }
    await run('delete from fails where k=?', fk);
    const tok = uid() + uid();
    await run('insert into toks(k,v,exp) values(?,?,?)', tok, JSON.stringify({ id: a1.id, h: a1.h }), Date.now() + 6 * 3600e3);
    return { ok: 1, tok, acc: spub_(a1) };
  }
  const tr = b.tok ? await one('select v,exp from toks where k=?', String(b.tok)) : null;
  if (!tr || tr.exp < Date.now()) return { err: 'auth' };
  const tv = JSON.parse(tr.v); let a = null;
  for (const x of await droles_()) if (x.id === tv.id) a = x;
  if (!a || a.on === 0 || a.h !== tv.h) { await run('delete from toks where k=?', String(b.tok)); return { err: 'auth' }; }
  if (tr.exp - Date.now() < 5 * 3600e3) await run('update toks set exp=? where k=?', Date.now() + 6 * 3600e3, String(b.tok));
  const rv = +(await kvGet('DREV')) || 0;
  if (op === 'get') {
    if (a.own) await rolesDoc_();
    const since = +b.since || 0;
    if (since >= rv) return { ok: 1, rev: rv, docs: [], acc: spub_(a) };
    const o = [];
    const RE = reOf(a);
    /* كل البيانات بطلب واحد لقاعدة البيانات بدل طلب لكل ملف */
    const C = {};
    for (const r of await all("select c.id,c.d from chunks c join docs d on c.id='d_'||d.p where d.rev>? and d.t='docs' and d.h<>'DEL' and substr(d.p,1,1)<>'_' order by c.id,c.i", since)) C[r.id] = (C[r.id] || '') + r.d;
    for (const e of await all("select p,rev,h,n,t from docs where rev>? and substr(p,1,1)<>'_'", since)) {
      if (!RE.test(e.p)) continue;
      const del = e.h === 'DEL' ? 1 : 0, lazy = e.t === 'blobs' ? 1 : 0;
      o.push({ p: e.p, rev: e.rev, del, lazy, d: del || lazy ? '' : (C['d_' + e.p] || '') });
    }
    return { ok: 1, rev: rv, docs: o, acc: spub_(a) };
  }
  if (op === 'rev') return { ok: 1, rev: rv };
  if (op === 'snap') { if (!a.own) return { err: 'role' }; return snapPut_(b); }
  if (op === 'one') {
    if (!reOf(a).test(String(b.p || ''))) return { err: 'path' };
    const e = await dmeta_(String(b.p || ''));
    if (!e || e.h === 'DEL') return { ok: 1, rev: e ? e.rev : 0, del: 1 };
    return { ok: 1, rev: e.rev, d: await dget_(e) };
  }
  if (op === 'put') {
    if (a.ro) return { err: 'ro' };
    const p = String(b.p || ''); if (!reOf(a).test(p)) return { err: 'path' };
    if (b.del) { const e = await dmeta_(p); if (e && e.h !== 'DEL') return { ok: 1, rev: (await dput_(p, null, '', 's:' + a.u, null)).rev }; return { ok: 1, rev: e ? e.rev : rv }; }
    const d = String(b.d || '');
    try { if (typeof JSON.parse(d) !== 'object') return { err: 'data' }; } catch (x) { return { err: 'data' }; }
    if (d.length > 4e6) return { err: 'big' };
    if (p === 'school/roles') { const k = await rolesFromDoc_(d); if (k < 1) return { err: 'data' }; }
    if (p === 'school/custom' && !a.own) return { err: 'role' };
    const rr = await dput_(p, d, String(b.h || ''), 's:' + a.u, null);
    if (/^(school\/students|stuinfo\/|staff\/)/.test(p)) MEMO.applyDirty = 1;
    return { ok: 1, rev: rr.rev };
  }
  return { err: 'op' };
}
async function osync_(b) {
  if (b.roles) await dput_('__roles', JSON.stringify({ list: b.roles }), String(b.rh || ''), 'o', '');
  for (const x of (b.ack || [])) { const e = await dmeta_(String(x.p)); if (e && e.h === String(x.h) && e.oh !== e.h) await doh_(e.p, e.h); }
  for (const x of (b.push || [])) {
    const p = String(x.p || ''); if (!OWN_RE.test(p)) continue;
    const e = await dmeta_(p);
    if (x.del) { if (e && e.h !== 'DEL') await dput_(p, null, '', 'o', 'DEL'); else if (e && e.oh !== 'DEL') await doh_(p, 'DEL'); continue; }
    if (e && e.h === String(x.h)) { if (e.oh !== e.h) await doh_(p, e.h); continue; }
    if (x.oh != null && e && e.h !== 'DEL' && e.h !== String(x.oh)) continue;
    await dput_(p, String(x.d), String(x.h), 'o', String(x.h));
  }
  const want = new Set((b.want || []).map(String)), idx = {}, data = {};
  for (const e of await all("select p,rev,at,by,h,oh,n from docs where substr(p,1,1)<>'_'")) {
    idx[e.p] = [e.rev, e.h, e.oh, e.by, e.at];
    if (want.has(e.p)) data[e.p] = e.h === 'DEL' ? null : await dget_(e);
  }
  const r = await dmeta_('__roles');
  return { ok: 1, rev: +(await kvGet('DREV')) || 0, idx, data, rh: r ? r.h : '' };
}

/* ---------- التشفير (نفس صيغة خادم Google بالضبط) ---------- */
async function exK_(t) { const s = await secret_(); if (!s) return null; return hmac(enc.encode(s), enc.encode('sinai-bridge|' + t)); }
async function hm_(k, s) { return b64(await hmac(k, enc.encode(String(s)))); }
const be32 = n => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
async function xor_(iv, data, ke) {
  const o = new Uint8Array(data.length), key = await crypto.subtle.importKey('raw', ke, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const jobs = [];
  for (let i = 0, n = 0; i < data.length; i += 32, n++) jobs.push([i, crypto.subtle.sign('HMAC', key, cat(iv, be32(n)))]);
  for (const [i, p] of jobs) { const ks = new Uint8Array(await p); for (let j = 0; j < 32 && i + j < data.length; j++) o[i + j] = data[i + j] ^ ks[j]; }
  return o;
}
async function exSeal_(obj) {
  const ke = await exK_('enc'), km = await exK_('mac');
  const p = await gz(enc.encode(JSON.stringify(obj))), iv = enc.encode(uid()).slice(0, 16);
  const ct = await xor_(iv, p, ke), mac = await hmac(km, cat(iv, ct));
  return { iv: b64(iv), ct: b64(ct), mac: b64(mac) };
}
async function exOpen_(box) {
  const ke = await exK_('enc'), km = await exK_('mac'); if (!ke || !box) return null;
  const iv = unb64(box.iv), ct = unb64(box.ct);
  if (b64(await hmac(km, cat(iv, ct))) !== String(box.mac || '')) return null;
  return JSON.parse(dec.decode(await gunz(await xor_(iv, ct, ke))));
}
async function relay_(b) {
  const sec = await secret_(); if (!sec) return { err: 'nosecret' };
  let m = null; try { m = await exOpen_(b.box); } catch (e) { return { err: 'box', msg: String(e) }; }
  if (!m || !m.id) return { err: 'auth' };
  if (Math.abs(Date.now() - Date.parse(m.at || 0)) > 2 * 864e5) return { err: 'old' };
  const seen = await kvJ('RELAY_IDS', []);
  if (seen.includes(String(m.id))) return { ok: 1, dup: 1 };
  const res = [];
  for (const o of (m.ops || [])) {
    try { const q = Object.assign({}, o, { secret: sec }); res.push({ op: String(o.op || ''), qid: String(o.qid || ''), r: q.op === 'osync' ? await osync_(q) : await admin_(q) }); }
    catch (e) { res.push({ op: String(o.op || ''), qid: String(o.qid || ''), r: { err: 'server', msg: String(e) } }); }
  }
  seen.push(String(m.id)); await kvPut('RELAY_IDS', seen.slice(-200));
  return { ok: 1, id: m.id, box: await exSeal_({ v: 1, id: m.id, at: now(), res }) };
}
async function export_() {
  const km = await exK_('mac'); if (!km) return { err: 'nosecret' };
  const R = await all("select kind,key,name,json,photo from prof where status='new'"), prof = [], ph = {}; let budget = 1200000;
  for (const r of R) {
    const json = String(r.json || '{}'), pid = String(r.photo || '');
    if (r.kind === 't' && pid) { const d = await photo_(pid); if (d) { if (d.length > budget) continue; budget -= d.length; ph[r.key] = d; } }
    prof.push({ kind: r.kind, key: r.key, name: String(r.name || ''), json, h: await md5_(json), ph: pid ? 1 : 0 });
  }
  const sig = await hm_(km, JSON.stringify(prof.map(p => [p.kind, p.key, p.h, ph[p.key] ? 1 : 0])));
  return { ok: 1, n: prof.length, sig, box: await exSeal_({ v: 1, at: now(), prof, ph }) };
}
async function exack_(b) {
  const km = await exK_('mac'), ls = String(b.ls || ''); if (!km) return { err: 'nosecret' };
  if (!ls || await hm_(km, ls) !== String(b.sig || '')) return { err: 'auth' };
  const L = JSON.parse(ls); let n = 0;
  for (const x of (L.list || [])) {
    const r = await one('select json,status from prof where kind=? and key=?', String(x[0]), String(x[1]));
    if (r && r.status === 'new' && await md5_(String(r.json || '{}')) === String(x[2])) { await run('update prof set status=? where kind=? and key=?', String(x[3] || 'ok'), String(x[0]), String(x[1])); n++; }
  }
  return { ok: 1, n, id: L.id || '' };
}

/* ---------- التشغيل الأول: الرمز السري يوصل مشفّر بمفتاح الخادم، وبعدها تنتقل البيانات من خادم Google ---------- */
async function pk_() {
  let k = await kvJ('PK', null);
  if (!k) {
    const kp = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
    k = { pub: await crypto.subtle.exportKey('jwk', kp.publicKey), prv: await crypto.subtle.exportKey('jwk', kp.privateKey) };
    if (!(await kvGet('PK'))) await kvPut('PK', k); else k = await kvJ('PK', null);
  }
  return k;
}
async function bootOpen_(b) {
  const k = await pk_(), prv = await crypto.subtle.importKey('jwk', k.prv, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
  const raw = new Uint8Array(await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, prv, unb64(b.ek)));
  const ak = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
  const m = JSON.parse(dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(b.iv) }, ak, unb64(b.ct))));
  if (!m.secret || !(Date.parse(m.until) > Date.now())) return null;
  const sec = await secret_(); if (sec && sec !== m.secret) return null;
  return m;
}
async function boot_(b) {
  const m = await bootOpen_(b); if (!m) return { err: 'auth' };
  if (!(await secret_())) { await kvPut('SECRET', m.secret); MEMO.sec = m.secret; }
  if (m.gas) await kvPut('GAS', m.gas);
  if (m.roles) { const e = await dmeta_('__roles'); if (!e) await dput_('__roles', JSON.stringify({ list: m.roles }), String(m.rh || ''), 'o', '', 1); }
  return { ok: 1 };
}
async function migrate_(b) {
  const m = await bootOpen_(b); if (!m) return { err: 'auth' };
  const S = m.secret, step = String(b.step || 'core'), log = {};
  if (step === 'core') {
    const r = await gas_({ a: 'admin', op: 'pull', secret: S }); if (!r || !r.ok) return { err: 'gas', r };
    const st = [], iso = v => v ? new Date(v).toISOString() : '';
    for (const x of r.acc || []) st.push(DB.prepare('insert into acc(kind,key,name,phone,created,updated,nid) values(?,?,?,?,?,?,?) on conflict(kind,key) do update set name=excluded.name,phone=excluded.phone,updated=excluded.updated where excluded.updated>=acc.updated').bind(String(x.kind), String(x.key), String(x.name || ''), phone_(x.phone), iso(x.created), iso(x.updated), ''));
    for (const x of r.prof || []) st.push(DB.prepare("insert into prof(kind,key,name,json,photo,updated,status) values(?,?,?,?,?,?,?) on conflict(kind,key) do update set name=excluded.name,json=excluded.json,status=excluded.status,updated=excluded.updated where excluded.updated>=prof.updated").bind(String(x.kind), String(x.key), String(x.name || ''), String(x.json || '{}'), x.photo ? 'gas' : '', iso(x.updated), String(x.status || '')));
    for (const x of r.notes || []) st.push(DB.prepare('insert or ignore into notes(id,scope,target,frm,title,body,date,cat,files) values(?,?,?,?,?,?,?,?,?)').bind(String(x.id), String(x.scope), String(x.target), String(x.from || ''), String(x.title || ''), String(x.body || ''), iso(x.date), String(x.cat || 'adm'), (x.files || []).length ? JSON.stringify(x.files) : ''));
    for (const x of r.reports || []) st.push(DB.prepare('insert into reports(id,kind,key,name,text,date,status) values(?,?,?,?,?,?,?) on conflict(id) do update set status=excluded.status').bind(String(x.id), String(x.kind), String(x.key), String(x.name || ''), String(x.text || ''), iso(x.date), String(x.status || '')));
    for (const id in (r.seen || {})) for (const w of r.seen[id]) { const i = w.indexOf(':'); st.push(DB.prepare('insert or ignore into seen(id,kind,key,at) values(?,?,?,?)').bind(String(id), w.slice(0, i), w.slice(i + 1), now())); }
    for (let i = 0; i < st.length; i += 80) await DB.batch(st.slice(i, i + 80));
    log.acc = (r.acc || []).length; log.prof = (r.prof || []).length; log.notes = (r.notes || []).length; log.reports = (r.reports || []).length;
    const sn = await gas_({ a: 'snap' }); if (sn && sn.ok && sn.z && !(await kvGet('snapat'))) { await snapPut_({ at: sn.at, z: sn.z }); log.snap = sn.at; }
    return { ok: 1, step, log, next: 'photos' };
  }
  if (step === 'photos') {
    const L = await all("select kind,key from prof where photo='gas' limit 12");
    for (const x of L) {
      const r = await gas_({ a: 'admin', op: 'photo', secret: S, kind: x.kind, key: x.key });
      const d = r && r.ok ? String(r.photo || '') : '';
      if (d) { const pid = 'p' + uid().slice(0, 20); await blobPut('ph_' + pid, d); await run('update prof set photo=? where kind=? and key=?', pid, x.kind, x.key); }
      else await run("update prof set photo='' where kind=? and key=?", x.kind, x.key);
    }
    const left = (await one("select count(*) c from prof where photo='gas'")).c;
    return { ok: 1, step, done: L.length, left, next: left ? 'photos' : 'docs' };
  }
  if (step === 'docs') {
    const r = await gas_({ a: 'admin', op: 'osync', secret: S, want: [] }); if (!r || !r.ok) return { err: 'gas' };
    const have = {}; for (const e of await all('select p,h from docs')) have[e.p] = e.h;
    const need = Object.keys(r.idx || {}).filter(p => have[p] !== r.idx[p][1]);
    const want = need.slice(0, +b.n || 25);
    if (want.length) {
      const q = await gas_({ a: 'admin', op: 'osync', secret: S, want }); if (!q || !q.ok) return { err: 'gas2' };
      for (const p of want) { const e = r.idx[p], d = q.data[p]; await dput_(p, d == null ? null : String(d), e[1] === 'DEL' ? '' : e[1], e[3] || 'o', e[2], e[0]); await run('update docs set at=? where p=?', +e[4] || Date.now(), p); }
    }
    const cur = +(await kvGet('DREV')) || 0; if ((+r.rev || 0) > cur) await kvPut('DREV', String(r.rev));
    return { ok: 1, step, done: want.length, left: need.length - want.length, rev: r.rev, next: need.length - want.length > 0 ? 'docs' : '' };
  }
  if (step === 'cmp') {
    /* مقارنة نسخة Claude بنسخة الخادم (أرقام تعريف وأسماء حقول فقط، بدون بيانات) */
    const R = {};
    const unj = v => { if (v && typeof v.json === 'string') { try { return JSON.parse(v.json); } catch (x) {} } return v; };
    const asMap = v => { v = unj(v); if (v && Array.isArray(v.list)) { const o = {}; for (const x of v.list) if (x && x.id) o[x.id] = x; return o; } return v && typeof v === 'object' ? v : {}; };
    for (const p in (m.docs || {})) {
      if (!(m.only || []).includes(p)) continue;
      const e = await dmeta_(p); let sv = {}; try { sv = JSON.parse(await dget_(e)); } catch (x) {}
      let cv = {}; try { cv = JSON.parse(m.docs[p]); } catch (x) {}
      const A = asMap(cv), B = asMap(sv), oc = [], os = [], ch = {};
      for (const k in A) if (!(k in B)) oc.push(k);
      for (const k in B) if (!(k in A)) os.push(k);
      for (const k in A) if (k in B && canon_(A[k]) !== canon_(B[k])) { const a = A[k] || {}, b = B[k] || {}; const f = typeof a === 'object' ? [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(x => canon_(a[x]) !== canon_(b[x])) : ['v']; ch[k] = f; }
      R[p] = { claude: Object.keys(A).length, server: Object.keys(B).length, onlyClaude: oc, onlyServer: os, changed: ch, at: e && e.at, by: e && e.by };
    }
    return { ok: 1, step, R, next: '' };
  }
  if (step === 'imp') {
    /* نقل نظام Claude كامل: ملف ناقص ينضاف، ملف ما تغيّر على الخادم من آخر مزامنة يتحدّث، وملف عدّله موظف على الخادم يبقى مثل ما هو */
    const L = { add: 0, upd: 0, same: 0, kept: [] };
    for (const p in (m.docs || {})) {
      if (!OWN_RE.test(p) || p === 'school/roles') continue;
      let o; try { o = JSON.parse(m.docs[p]); } catch (x) { continue; }
      const t = canon_(o), h = syH_(t), e = await dmeta_(p);
      if (e && e.h === h) { if (e.oh !== h) await doh_(p, h); L.same++; continue; }
      if (e && e.h !== 'DEL' && e.oh && e.h !== e.oh) { L.kept.push(p); continue; }
      await dput_(p, t, h, 'o', h); e ? L.upd++ : L.add++;
    }
    return { ok: 1, step, log: L, next: '' };
  }
  if (step === 'imp2') {
    /* تعديلات صارت داخل Claude بعد النقل: تنضاف أو تحدّث بس الملفات اللي ما انلمست على الخادم من آخر نقل (والقديم ينحفظ نسخة) */
    const L = { add: 0, upd: 0, same: 0, kept: [] };
    for (const p in (m.docs || {})) {
      if (!OWN_RE.test(p) || p === 'school/roles') continue;
      let o; try { o = JSON.parse(m.docs[p]); } catch (x) { continue; }
      const t = canon_(o), h = syH_(t), e = await dmeta_(p);
      if (e && e.h === h) { L.same++; continue; }
      if (!e) { await dput_(p, t, h, 'o', h); L.add++; continue; }
      if (e.h !== 'DEL' && e.by === 'o' && e.oh && e.h === e.oh) {
        const old = await dget_(e); await dput_('_imp202/' + p, old, e.h, 'imp', e.h);
        await dput_(p, t, h, 'o', h); L.upd++; continue;
      }
      L.kept.push(p + ' (' + (e.by || '') + ')');
    }
    return { ok: 1, step, log: L, next: '' };
  }
  if (step === 'roles') {
    if (m.roles) await dput_('__roles', JSON.stringify({ list: m.roles }), String(m.rh || ''), 'o', '');
    for (const p in (m.docs || {})) if (OWN_RE.test(p)) { const e = await dmeta_(p); if (!e || e.h !== m.docs[p].h) await dput_(p, m.docs[p].d, m.docs[p].h, 'o', m.docs[p].h); }
    return { ok: 1, step, roles: (m.roles || []).length, docs: Object.keys(m.docs || {}).length, next: '' };
  }
  return { err: 'step' };
}


/* ---------- استمارات البوابة توصل لملفات النظام فوراً (بدل Claude والجسر) ---------- */
function canon_(v) { if (Array.isArray(v)) return '[' + v.map(canon_).join(',') + ']'; if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon_(v[k])).join(',') + '}'; return JSON.stringify(v === undefined ? null : v); }
function syH_(s) { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0'); }
const FDEFS = {"s":[{"sec":"اسم الطالب الكامل","n":"اكتب كل اسم بخانته، بالحروف العربية فقط ومطابق للبطاقة الموحدة."},{"k":"n1","l":"اسم الطالب","t":"name","req":1},{"k":"n2","l":"اسم الأب","t":"name","req":1},{"k":"n3","l":"اسم الجد","t":"name","req":1},{"k":"n4","l":"اسم والد الجد","t":"name","req":1},{"k":"laqab","l":"اللقب (إن وجد)","t":"name","max":3},{"sec":"اسم الأم"},{"k":"m1","l":"اسم الأم","t":"name","req":1},{"k":"m2","l":"اسم والد الأم","t":"name","req":1},{"k":"m3","l":"اسم جد الأم","t":"name","req":1},{"sec":"المعلومات الشخصية"},{"k":"dob","l":"المواليد (يوم - شهر - سنة)","t":"date","req":1,"yr":[2001,2014],"w":1},{"k":"nid","l":"رقم البطاقة الموحدة (١٢ رقم)","t":"digits","len":12,"req":1},{"k":"gphone","l":"رقم هاتف ولي الأمر","t":"phone","req":1},{"k":"gr","l":"مشمول بمنحة الرعاية الاجتماعية","t":"sel","o":["نعم","لا"],"req":1},{"sec":"عنوان السكن"},{"k":"city","l":"المدينة","t":"text","req":1},{"k":"hay","l":"الحي","t":"text","req":1},{"k":"mahalla","l":"المحلة (رقم)","t":"digits","min":1,"max":4,"req":1},{"k":"zuqaq","l":"الزقاق (رقم)","t":"digits","min":1,"max":4,"req":1},{"k":"dar","l":"الدار","t":"house","req":1},{"k":"near","l":"أقرب نقطة دالة","t":"text","min":3,"req":1},{"sec":"التواصل"},{"k":"email","l":"البريد الإلكتروني (إن وجد)","t":"email","w":1}],"t":[{"sec":"الاسم","n":"اكتب كل اسم بخانته، بالحروف العربية فقط ومطابق للبطاقة الموحدة."},{"k":"n1","l":"الاسم","t":"name","req":1},{"k":"n2","l":"اسم الأب","t":"name","req":1},{"k":"n3","l":"اسم الجد","t":"name","req":1},{"k":"n4","l":"اسم والد الجد","t":"name","req":1},{"k":"laqab","l":"اللقب (إن وجد)","t":"name","max":3},{"k":"m1","l":"اسم الأم","t":"name","req":1},{"k":"m2","l":"اسم والد الأم","t":"name","req":1},{"k":"m3","l":"اسم جد الأم","t":"name","req":1},{"sec":"المعلومات الشخصية"},{"k":"gender","l":"الجنس","t":"sel","o":["ذكر","أنثى"],"req":1},{"k":"birth","l":"التولد (يوم - شهر - سنة)","t":"date","req":1,"yr":[1956,2006],"w":1},{"k":"birthPlace","l":"محل الولادة","t":"text","req":1},{"k":"blood","l":"فصيلة الدم","t":"sel","o":["A+","A-","B+","B-","AB+","AB-","O+","O-"],"req":1},{"k":"marital","l":"الحالة الاجتماعية","t":"sel","o":["أعزب","متزوج","مطلق","أرمل"],"req":1},{"k":"spouse","l":"اسم الزوج / الزوجة","t":"text","reqIf":"married"},{"k":"marriageDate","l":"تاريخ الزواج","t":"date","yr":[1965,2026],"reqIf":"married","w":1},{"k":"spouseBirth","l":"تولد الزوج / الزوجة","t":"date","yr":[1946,2010],"w":1},{"k":"spouseJob","l":"وظيفة الزوج / الزوجة","t":"text"},{"k":"spouseWork","l":"مكان عمل الزوج / الزوجة","t":"text"},{"k":"children","l":"عدد الأولاد","t":"num","min":0,"max":20,"req":1},{"sec":"المستمسكات"},{"k":"nid","l":"رقم البطاقة الموحدة (١٢ رقم)","t":"digits","len":12,"req":1},{"k":"nidDate","l":"تاريخ إصدار البطاقة الموحدة","t":"date","yr":[2010,2026],"req":1,"w":1},{"k":"resCard","l":"رقم بطاقة السكن","t":"digits","min":3,"max":15},{"k":"resOffice","l":"مكتب المعلومات","t":"text"},{"k":"passport","l":"رقم جواز السفر (إن وجد)","t":"alnum"},{"k":"card","l":"رقم حساب الماستر / كي كارد (إن وجد)","t":"digits","min":8,"max":20},{"sec":"الشهادة والاختصاص"},{"k":"edu","l":"التحصيل الدراسي / الشهادة","t":"sel","o":["دبلوم","بكالوريوس","دبلوم عالي","ماجستير","دكتوراه"],"req":1},{"k":"spec","l":"الاختصاص","t":"text","req":1},{"k":"specFull","l":"التخصص الدقيق","t":"text"},{"k":"college","l":"الكلية","t":"text","req":1},{"k":"dept","l":"القسم","t":"text","req":1},{"k":"univ","l":"الجامعة","t":"text","req":1},{"k":"gradYear","l":"سنة التخرج","t":"year","yr":[1965,2026],"req":1},{"k":"studyCountry","l":"بلد الدراسة","t":"text","req":1,"def":"العراق"},{"sec":"المعلومات الوظيفية"},{"k":"empNo","l":"الرقم الوظيفي","t":"digits","min":1,"max":12},{"k":"type","l":"دائمي / عقد","t":"sel","o":["دائمي","عقد"],"req":1},{"k":"grade","l":"الدرجة الوظيفية","t":"sel","o":["الأولى","الثانية","الثالثة","الرابعة","الخامسة","السادسة","السابعة","الثامنة","التاسعة","العاشرة"]},{"k":"appoint","l":"تاريخ أول تعيين","t":"date","yr":[1975,2026],"req":1,"w":1},{"k":"start","l":"تاريخ المباشرة في المدرسة","t":"date","yr":[1975,2026],"req":1,"w":1},{"k":"subjects","l":"المواد التي يدرسها","t":"text"},{"k":"prevSchool","l":"آخر مدرسة نُقل منها","t":"text"},{"k":"thanks","l":"كتب الشكر (العدد أو التفاصيل)","t":"text","w":1},{"k":"martyr","l":"من ذوي الشهداء","t":"sel","o":["نعم","لا"],"req":1},{"k":"polDism","l":"من المفصولين السياسيين","t":"sel","o":["نعم","لا"],"req":1},{"sec":"عنوان السكن"},{"k":"city","l":"المدينة","t":"text","req":1},{"k":"hay","l":"الحي","t":"text","req":1},{"k":"mahalla","l":"المحلة (رقم)","t":"digits","min":1,"max":4,"req":1},{"k":"zuqaq","l":"الزقاق (رقم)","t":"digits","min":1,"max":4,"req":1},{"k":"dar","l":"الدار","t":"house","req":1},{"k":"near","l":"أقرب نقطة دالة","t":"text","min":3,"req":1},{"sec":"التواصل"},{"k":"phone2","l":"رقم هاتف ثاني (إن وجد)","t":"phone"},{"k":"email","l":"البريد الإلكتروني (إن وجد)","t":"email","w":1}]};
const ARN = /^[ء-غف-ي ]+$/;
function dOk_(v) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); if (!m) return null; const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null; return d; }
function fcheck_(kind, o) {
  const E = [], today = new Date(Date.now() + 3 * 3600e3), married = o.marital === 'متزوج';
  for (const f of FDEFS[kind === 's' ? 's' : 't']) {
    const k = f.k; if (!k) continue;
    const v = String(o[k] == null ? '' : o[k]).trim();
    const req = f.req || (f.reqIf === 'married' && married), lab = f.l.replace(/ \(.*\)$/, '');
    if (!v) { if (req) E.push(lab + ' ناقص'); continue; }
    const t = f.t;
    if (t === 'name' && !ARN.test(v)) E.push(lab + ': بيه حروف غير عربية');
    else if (t === 'digits' && (!/^\d+$/.test(v) || (f.len && v.length !== f.len))) E.push(lab + ': رقم غير صحيح');
    else if (t === 'phone' && !/^07\d{9}$/.test(v)) E.push(lab + ': رقم هاتف غير صحيح');
    else if (t === 'date') { const d = dOk_(v); if (!d || d > today) E.push(lab + ': تاريخ غير صحيح'); }
    else if (t === 'sel' && f.o && !f.o.includes(v)) E.push(lab + ': اختيار غير صحيح');
    else if (t === 'email' && !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v)) E.push(lab + ': بريد غير صحيح');
  }
  const by = String(o.dob || o.birth || '').slice(0, 4), nid = String(o.nid || '');
  if (/^\d{12}$/.test(nid) && /^\d{4}$/.test(by) && nid.slice(0, 4) !== by) E.push('رقم البطاقة الموحدة ما يطابق سنة المواليد');
  return E;
}
const dig_ = x => String(x || '').replace(/[٠-٩]/g, c => c.charCodeAt(0) - 1632).replace(/[۰-۹]/g, c => c.charCodeAt(0) - 1776);
const phN_ = x => { const t = dig_(x).replace(/\D/g, '').slice(-10); return t.length === 10 && t[0] === '7' ? t : ''; };
const jn_ = (...a) => a.map(x => x == null ? '' : String(x)).join(' ');
const TMAP_ = ["gender","birth","birthPlace","blood","marital","spouse","marriageDate","spouseBirth","spouseJob","spouseWork","children","nid","nidDate","resCard","resOffice","passport","card","edu","spec","specFull","college","dept","univ","gradYear","studyCountry","empNo","type","grade","appoint","start","subjects","prevSchool","thanks","martyr","polDism","email"];
async function docJ_(p) { const e = await dmeta_(p); if (!e || e.h === 'DEL') return null; try { return JSON.parse(await dget_(e)); } catch (x) { return null; } }
async function docW_(p, obj, by) { const t = canon_(obj); const e = await dmeta_(p); const h = syH_(t); if (e && e.h === h) return 0; await dput_(p, t, h, by || 'portal', null); return 1; }
async function applyOne_(kind, key) { return applyAll_(); }
async function applyAll_() {
  /* قفل حتى ما تتداخل كتابتين على نفس الملف */
  const t0 = Date.now();
  await run("insert or ignore into kv(k,v) values('APLOCK','0')");
  const lk = await run("update kv set v=? where k='APLOCK' and cast(v as integer) < ?", String(t0 + 60000), t0);
  if (!(lk.meta && lk.meta.changes)) return { ok: 1, busy: 1 };
  try {
    const R = await all("select kind,key,name,json,photo from prof where status='new' order by updated desc limit 300");
    if (!R.length) return { ok: 1, applied: 0 };
    const stuDoc = await docJ_('school/students'); const ST = stuDoc && Array.isArray(stuDoc.list) ? stuDoc.list : null;
    const INF = {}, INFG = {}, chG = new Set(); let chST = false;
    for (const g of ['g4', 'g5', 'g6']) { const d = await docJ_('stuinfo/' + g); let o = {}; try { o = d && d.json ? JSON.parse(d.json) : {}; } catch (x) { o = {}; } INF[g] = o; for (const i in o) INFG[i] = g; }
    const gk = s => { const g = String(s.s || '').split(' ')[0]; return g === 'الرابع' ? 'g4' : g === 'الخامس' ? 'g5' : 'g6'; };
    let applied = 0; const invalid = [];
    for (const p of R) {
      let o; try { o = JSON.parse(p.json || '{}'); } catch (x) { continue; }
      if (o.v3 !== '1') { invalid.push([p.kind, p.key]); continue; }
      const E = fcheck_(p.kind, o); if (E.length) { invalid.push([p.kind, p.key]); continue; }
      const key = p.key;
      if (p.kind === 's') {
        if (!ST) continue;
        const s = ST.find(x => x.id === key); if (!s) continue;
        const g = INFG[key] || gk(s); INFG[key] = g;
        const i = INF[g][key] = INF[g][key] || {};
        i.m = jn_(o.m1, o.m2, o.m3); i.dob = o.dob; i.nid = o.nid;
        i.ar = [o.city, o.hay, o.near].filter(Boolean).join(' — ');
        i.ad = ['محلة ' + String(o.mahalla ?? ''), 'زقاق ' + String(o.zuqaq ?? ''), 'دار ' + String(o.dar ?? '')].join(' / ');
        i.gr = o.gr;
        i.x = { n1: o.n1, n2: o.n2, n3: o.n3, n4: o.n4, laqab: o.laqab || '', m1: o.m1, m2: o.m2, m3: o.m3, dob: o.dob, nid: o.nid, gphone: o.gphone, gr: o.gr, city: o.city, hay: o.hay, mahalla: o.mahalla, zuqaq: o.zuqaq, dar: o.dar, near: o.near, email: o.email || '', at: o.at || '' };
        chG.add(g);
        const gp = phN_(o.gphone); if (gp && s.p !== '0' + gp) { s.p = '0' + gp; chST = true; }
      } else {
        const nm = [o.n1, o.n2, o.n3, o.n4].filter(Boolean).join(' ');
        let f = await docJ_('staff/' + key);
        if (!f) {
          let mx = 0; for (const r of await all("select c.d from chunks c join docs d on c.id='d_'||d.p where d.p like 'staff/%' and d.h<>'DEL' and c.i=0")) { const m = /"ord":"?(-?\d+)/.exec(r.d); if (m) mx = Math.max(mx, +m[1]); }
          f = { id: key, name: nm, job: 'مدرس', status: 'مستمر', ord: String(mx + 1) };
        }
        const nf = Object.assign({}, f, { id: key });
        if (!nf.name) nf.name = nm;
        nf.fname = nm + (o.laqab ? ' ' + o.laqab : '');
        nf.mother = jn_(o.m1, o.m2, o.m3);
        for (const k of TMAP_) if (o[k]) nf[k] = o[k];
        nf.address = [o.city, o.hay, 'محلة ' + String(o.mahalla ?? ''), 'زقاق ' + String(o.zuqaq ?? ''), 'دار ' + String(o.dar ?? ''), o.near].filter(Boolean).join(' / ');
        const ph = [];
        for (const x of String(nf.phone || '').split(/[\s,،/]+/)) { const q = phN_(x); if (q && !ph.includes('0' + q)) ph.push('0' + q); }
        const q2 = phN_(o.phone2); if (q2 && !ph.includes('0' + q2)) ph.push('0' + q2);
        if (ph.length) nf.phone = ph.join(' ، ');
        await docW_('staff/' + key, nf);
        if (p.photo) { const d = await photo_(p.photo); if (d) await docW_('staffphoto/' + key, { d }); }
      }
      await run("update prof set status='ok' where kind=? and key=? and status='new'", p.kind, key);
      applied++;
    }
    for (const g of chG) await docW_('stuinfo/' + g, { json: JSON.stringify(INF[g]) });
    if (chST) await docW_('school/students', Object.assign({}, stuDoc, { list: ST }));
    return { ok: 1, applied, invalid: invalid.length };
  } finally { await run("update kv set v='0' where k='APLOCK'"); }
}

/* ---------- الدخول ---------- */
export default {
  async scheduled(ev, env, ctx) { DB = env.DB; ENV = env; MEMO = {}; ORIGIN = ''; try { await applyAll_(); } catch (e) { } },
  async fetch(req, env) {
    DB = env.DB; ENV = env; MEMO = {}; const u = new URL(req.url); ORIGIN = u.origin;
    if (req.method === 'OPTIONS') return new Response(null, { headers: J });
    try {
      if (req.method === 'GET') {
        if (u.pathname === '/pk') return out({ ok: 1, pub: (await pk_()).pub });
        let m = u.pathname.match(/^\/f\/([A-Za-z0-9_-]+)$/);
        if (m) { const f = await one('select * from files where id=?', m[1]), d = f && await blobGet('f_' + m[1]); if (!d) return new Response('not found', { status: 404 }); return new Response(unb64(d), { headers: { 'Content-Type': f.m || 'application/octet-stream', 'Content-Disposition': 'inline; filename*=UTF-8\'\'' + encodeURIComponent(f.n), 'Cache-Control': 'public, max-age=31536000, immutable', 'Access-Control-Allow-Origin': '*' } }); }
        m = u.pathname.match(/^\/bk\/([A-Za-z0-9_-]+)$/);
        if (m) { const k = await exK_('mac'); if (!k || u.searchParams.get('k') !== (await hm_(k, 'bk|' + m[1])).slice(0, 22)) return new Response('no', { status: 403 }); const s = await blobGet('bk_' + m[1]); const f = await one('select name from bk where id=?', m[1]); return new Response(s || '', { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': 'attachment; filename*=UTF-8\'\'' + encodeURIComponent(f ? f.name : 'backup.json') } }); }
        return out({ ok: 1, service: 'sinai-portal', host: 'cloudflare', v: 5, nid: 1, bk: 1, stf: 1, fast: 1, bridge: 1, files: 1, seen: 1, relay: 1, v6: 1, fget: 1, snap: 1, v7: 1, sent: 1, v8: 1, up: 1, v202: 1, v204: 1, ready: (await secret_()) ? 1 : 0 });
      }
      let b; try { b = JSON.parse(await req.text() || '{}'); } catch (x) { return out({ err: 'action' }); }
      return out(await handle(b));
    } catch (err) { return out({ err: 'server', msg: String(err && err.stack || err).slice(0, 400) }); }
  }
};
