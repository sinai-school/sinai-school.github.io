// يصنع نسخ مصغّرة خفيفة (webp) لكل صور المتجر حتى الكروت تفتح بسرعة حتى على نت ضعيف
// v210: الكتابة صارت عبر D1 HTTP API (استعلام عادي لكل صورة) بدل `wrangler d1 execute --file`
// لأن الاستيراد بالملف يقفل القاعدة («long-running import») ويوكف مزامنة التليجرام، وصار يفشل كل مرة.
import sharp from 'sharp';
const T = process.env.CLOUDFLARE_API_TOKEN, A = process.env.CLOUDFLARE_ACCOUNT_ID;
const API = `https://api.cloudflare.com/client/v4/accounts/${A}/d1/database`;
const H = { Authorization: 'Bearer ' + T, 'Content-Type': 'application/json' };
const dbs = (await (await fetch(API + '?name=hhshop', { headers: H })).json()).result || [];
const DB = (dbs.find(d => d.name === 'hhshop') || {}).uuid;
if (!DB) { console.log('no hhshop db'); process.exit(1); }
async function q(sql, params = []) {
  const r = await fetch(`${API}/${DB}/query`, { method: 'POST', headers: H, body: JSON.stringify({ sql, params }) });
  const j = await r.json();
  if (!j.success) throw new Error(JSON.stringify(j.errors || j).slice(0, 300));
  return j.result[0].results;
}
// حالة مزامنة التليجرام (للتقرير)
try {
  const s = await q("select k,v from settings where k in ('_lastSync','_saver','_backfill')");
  for (const x of s) console.log('setting', x.k, x.v, x.k === '_lastSync' ? new Date(+x.v).toISOString() : '');
  console.log('max msg', JSON.stringify(await q('select max(id) m,count(*) n from msgs')));
  console.log('products', JSON.stringify(await q('select count(*) n,max(post) mp from products')));
  console.log('imgq pending', JSON.stringify(await q("select count(*) n from imgq where k not in (select k from imgs)")));
  console.log('no-image products', JSON.stringify(await q("select count(*) n from products where (media is null or media='' or media='[]')")));
  for (const x of await q('select at,msg from log order by at desc limit 6')) console.log('log', new Date(x.at).toISOString(), x.msg.slice(0, 160));
} catch (e) { console.log('diag err', e.message); }

let saver = 0; try { saver = +JSON.parse((await q("select v from settings where k='_saver'"))[0].v) || 0; } catch { }
if (saver >= 2) { console.log('saver mode', saver, '— skip'); process.exit(0); }
const todo = (await q("select k from imgs where substr(k,-2) != '_s' and k != 'logo' and (k || '_s') not in (select k from imgs) order by at desc limit 40")).map(r => r.k);
console.log('todo', todo.length);
let n = 0, fail = 0;
for (const k of todo) {
  try {
    const r = await fetch('https://hh-shop.7svyn82yzr.workers.dev/img/' + k);
    if (!r.ok || !/image/.test(r.headers.get('content-type') || '')) { console.log('noimg', k, r.status); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    // حد D1: الاستعلام الواحد لازم أقل من ١٠٠ ك.ب (hex = ضعف الحجم) — نصغّر الجودة لحد ما تنطبق
    let out;
    for (const [px, ql] of [[440, 68], [440, 55], [400, 45], [360, 38], [320, 32]]) {
      out = await sharp(buf).rotate().resize(px, px, { fit: 'cover', position: 'attention' }).webp({ quality: ql }).toBuffer();
      if (out.length < 45000) break;
    }
    await q(`insert or replace into imgs(k,ct,data,at) values(?,'image/webp',X'${out.toString('hex')}',?)`, [k + '_s', Date.now()]);
    n++;
  } catch (e) { fail++; console.log('skip', k, e.message); if (fail >= 5 && !n) { console.log('stopping: writes failing'); process.exit(1); } }
}
console.log('thumbs made', n, 'failed', fail);
