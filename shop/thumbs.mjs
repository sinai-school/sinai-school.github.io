// يصنع نسخ مصغّرة خفيفة (webp) لكل صور المتجر حتى الكروت تفتح بسرعة حتى على نت ضعيف
import { execSync } from 'child_process';
import fs from 'fs';
import sharp from 'sharp';
const W = 'npx -y wrangler@3';
const q = sql => JSON.parse(execSync(`${W} d1 execute hhshop --remote --json --command "${sql}"`, { maxBuffer: 1 << 26 }).toString())[0].results;
const todo = q("select k from imgs where substr(k,-2) != '_s' and k != 'logo' and (k || '_s') not in (select k from imgs) order by at desc limit 160").map(r => r.k);
console.log('todo', todo.length);
let sql = '', n = 0, part = 0;
const flush = () => { if (!sql) return; fs.writeFileSync('/tmp/th.sql', sql); execSync(`${W} d1 execute hhshop --remote --file /tmp/th.sql -y`, { stdio: 'ignore' }); console.log('wrote part', ++part); sql = ''; };
for (const k of todo) {
  try {
    const r = await fetch('https://hh-shop.7svyn82yzr.workers.dev/img/' + k);
    if (!r.ok || !/image/.test(r.headers.get('content-type') || '')) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    const out = await sharp(buf).rotate().resize(440, 440, { fit: 'cover', position: 'attention' }).webp({ quality: 68 }).toBuffer();
    sql += `insert or replace into imgs(k,ct,data,at) values('${k}_s','image/webp',X'${out.toString('hex')}',${Date.now()});\n`;
    n++;
    if (sql.length > 1.5e6) flush();
  } catch (e) { console.log('skip', k, e.message); }
}
flush();
console.log('thumbs made', n);
