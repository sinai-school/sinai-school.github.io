// فحص سريع لقاعدة المتجر (يشتغل من shop-diag.yml)
const T = process.env.CLOUDFLARE_API_TOKEN, A = process.env.CLOUDFLARE_ACCOUNT_ID;
const API = `https://api.cloudflare.com/client/v4/accounts/${A}/d1/database`;
const H = { Authorization: 'Bearer ' + T, 'Content-Type': 'application/json' };
const DB = ((await (await fetch(API + '?name=hhshop', { headers: H })).json()).result || []).find(d => d.name === 'hhshop').uuid;
const q = async (sql, params = []) => { const j = await (await fetch(`${API}/${DB}/query`, { method: 'POST', headers: H, body: JSON.stringify({ sql, params }) })).json(); if (!j.success) return [{ err: JSON.stringify(j.errors) }]; return j.result[0].results; };
for (const r of await q("select id,kind,dt,substr(replace(coalesce(txt,''),char(10),' '),1,140) t from msgs where id between 30570 and 30583 order by id")) console.log('MSG', JSON.stringify(r));
for (const r of await q("select id,post,src,substr(auto,1,200) auto,ov,media,dt from products where post>30540 order by post")) console.log('PROD', JSON.stringify(r).slice(0, 400));
for (const r of await q("select at,msg from log order by at desc limit 6")) console.log('LOG', new Date(r.at).toISOString(), r.msg.slice(0, 200));
for (const r of await q("select id,substr(ai,1,300) ai from products where post>30540 order by post")) console.log('AI', JSON.stringify(r));
const h = await (await fetch('https://t.me/s/husseinhandh?before=30584', { headers: { 'user-agent': 'Mozilla/5.0 Chrome/124' } })).text();
console.log('TG ids', [...h.matchAll(/data-post="husseinhandh\/(\d+)"/g)].map(m => m[1]).join(','));
