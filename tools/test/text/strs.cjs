// يستخرج كل نص عربي حقيقي (سلاسل نصية) من سكربتات الصفحة وملفات الخادم — بدون التعليقات
const acorn = require('/opt/npm-tools/node_modules/acorn'); const fs = require('fs');
let walk; try { walk = require('/opt/npm-tools/node_modules/acorn-walk'); } catch (e) { }
const files = process.argv.slice(2), OUT = [];
function grab(code, file) {
  let ast; try { ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true, allowHashBang: true }); } catch (e) { try { ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' }); } catch (e2) { console.error('PARSE', file, e2.message); return; } }
  const stack = [ast];
  while (stack.length) { const n = stack.pop(); if (!n || typeof n.type != 'string') continue;
    if (n.type === 'Literal' && typeof n.value === 'string') { if (/[؀-ۿ]/.test(n.value)) OUT.push([file, n.value]); }
    else if (n.type === 'TemplateElement') { const v = n.value.cooked || n.value.raw; if (/[؀-ۿ]/.test(v)) OUT.push([file, v]); }
    for (const k in n) { const v = n[k]; if (k === 'loc') continue; if (Array.isArray(v)) v.forEach(x => x && typeof x.type == 'string' && stack.push(x)); else if (v && typeof v.type == 'string') stack.push(v); }
  }
}
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  if (f.endsWith('.html')) { const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g; let m, i = 0; while ((m = re.exec(s))) { if (/application\/json|ld\+json/.test(m[1])) continue; i++; grab(m[2], f + '#' + i); }
    // نصوص HTML ثابتة خارج السكربتات
    const html = s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    html.replace(/>([^<]*[؀-ۿ][^<]*)</g, (m, t) => { OUT.push([f + '#html', t]); return m; });
  } else grab(s, f);
}
fs.writeFileSync('/tmp/strs.json', JSON.stringify(OUT));
console.log('strings', OUT.length);
