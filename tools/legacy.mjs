// v211 — يبني legacy.html: نفس index.html بس السكربتات متحوّلة لصيغة تشتغل على الهواتف والمتصفحات القديمة
// (أندرويد/هواوي بمتصفح قديم، آيفون iOS 12–13). index.html يحوّل لها وحده إذا المتصفح ما يفهم الصيغة الحديثة.
// يشتغل داخل GitHub Actions (workflow legacy.yml): npm i esbuild && node tools/legacy.mjs
import fs from 'node:fs';
import { transformSync } from 'esbuild';

const src = fs.readFileSync('index.html', 'utf8');
const POLY = `<script>(function(){var A=Array.prototype;
if(!A.flat)A.flat=function(d){d=d===undefined?1:+d;var o=[];(function f(a,k){for(var i=0;i<a.length;i++){var v=a[i];if(Array.isArray(v)&&k>0)f(v,k-1);else if(i in a)o.push(v)}})(this,d);return o};
if(!A.flatMap)A.flatMap=function(fn,t){return A.map.call(this,fn,t).flat(1)};
if(!Object.fromEntries)Object.fromEntries=function(it){var o={};Array.from(it).forEach(function(p){o[p[0]]=p[1]});return o};
if(!String.prototype.replaceAll)String.prototype.replaceAll=function(a,b){return typeof a=="string"?this.split(a).join(b):this.replace(a,b)};
if(!Promise.allSettled)Promise.allSettled=function(ps){return Promise.all(Array.from(ps).map(function(p){return Promise.resolve(p).then(function(v){return{status:"fulfilled",value:v}},function(e){return{status:"rejected",reason:e}})}))};
if(typeof globalThis=="undefined")window.globalThis=window;
window.__LEGACY=1})()</script>`;

let n = 0, bad = 0;
let out = src.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g, (m, attrs = '', code) => {
  if (/\bsrc=/.test(attrs) || /type=["']?(application\/(ld\+)?json|text\/template)/i.test(attrs) || !code.trim()) return m;
  if (/id=["']?boot211/.test(attrs)) return '';           // حارس التحويل ما يلزم بالنسخة القديمة
  try {
    const r = transformSync(code, { loader: 'js', target: ['chrome58', 'safari11'], charset: 'utf8', legalComments: 'none', supported: { 'regexp-lookbehind-assertions': false } });
    n++;
    return '<script' + attrs + '>' + r.code.replace(/<\/script/gi, '<\\/script') + '</script>';
  } catch (e) {
    bad++; console.error('script failed:', (attrs || '').slice(0, 40), String(e.message).slice(0, 300));
    return m;
  }
});
out = out.replace(/<head>/i, '<head>' + POLY);
fs.writeFileSync('legacy.html', out);
console.log('legacy.html', out.length, 'scripts', n, 'failed', bad);
if (bad) process.exit(1);
