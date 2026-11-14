// يحسب نواقص حسابات البوابة بنفس فحص الخادم (FDEFS + fcheck_ من cf/worker.js) — الإدخال/الإخراج JSON
import fs from 'node:fs';
const src = fs.readFileSync('cf/worker.js', 'utf8');
const grab = re => { const m = src.match(re); if (!m) throw new Error('missing ' + re); return m[0]; };
const code = [grab(/const FDEFS = .*;\n/), grab(/const ARN = .*;\n/), grab(/function dOk_\(v\) \{.*\}\n/), grab(/function fcheck_\(kind, o\) \{[\s\S]*?\n\}\n/)].join('');
const fcheck_ = new Function(code + '; return fcheck_;')();
const I = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), out = [];
for (const a of I.acc) {
  const p = I.prof[a.kind + '|' + a.key], M = [];
  if (!p) M.push('لم تُملأ استمارة المعلومات بعد');
  else {
    let o = {}; try { o = JSON.parse(p.json || '{}'); } catch (e) { }
    if (o.v3 == '1') { if (a.kind === 't' && !o.phone) o.phone = a.phone || ''; fcheck_(a.kind, o).forEach(e => M.push(e)); }
    else M.push(Object.keys(o).length ? 'يجب إكمال الاستمارة الجديدة' : 'لم تُملأ استمارة المعلومات بعد');
  }
  if (!p || !p.ph) M.push('الصورة الشخصية');
  if (M.length) out.push({ kind: a.kind, key: a.key, M: [...new Set(M)] });
}
fs.writeFileSync(process.argv[3], JSON.stringify(out));
