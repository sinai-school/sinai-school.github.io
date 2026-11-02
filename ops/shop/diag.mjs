const T = process.env.CLOUDFLARE_API_TOKEN, A = process.env.CLOUDFLARE_ACCOUNT_ID;
const API = `https://api.cloudflare.com/client/v4/accounts/${A}/d1/database`;
const H = { Authorization: 'Bearer ' + T, 'Content-Type': 'application/json' };
const DB = ((await (await fetch(API + '?name=hhshop', { headers: H })).json()).result || []).find(d => d.name === 'hhshop').uuid;
const q = async (sql, params = []) => { const j = await (await fetch(`${API}/${DB}/query`, { method: 'POST', headers: H, body: JSON.stringify({ sql, params }) })).json(); if (!j.success) return [{ err: JSON.stringify(j.errors) }]; return j.result[0].results; };
for (const r of await q("select id,substr(ai,1,220) ai from products where post>30575 order by post")) console.log('AI', JSON.stringify(r));
for (const r of await q("select at,msg from log where msg like 'صورة%' order by at desc limit 10")) console.log('LOG', new Date(r.at).toISOString(), r.msg.slice(0, 220));
