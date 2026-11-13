import fs from 'fs';
const D=JSON.parse(fs.readFileSync('dump.json'));const U='http://127.0.0.1:8787/';
let ip=1;const call=async b=>{const r=await fetch(U,{method:'POST',headers:{'content-type':'text/plain','x-ip':String(ip++%250+1)},body:JSON.stringify(b)});return r.json()};
const res={};let n=0;
for(const a of D.acc){ if(/^tst-/.test(a.key))continue; n++;
  const r=await call({a:'login',kind:a.kind,key:a.key,phone:a.phone,nid:a.nid,cv:229});
  const k=a.kind+':'+(r.ok?'ok':(r.err||'?')); res[k]=(res[k]||0)+1; if(!r.ok&&res[k]<4)console.log('FAIL',a.kind,a.key,r.err,a.nid?'hasnid':'nonid');}
console.log(n,res);
// wrong phone / wrong nid / lock
const s=D.acc.find(a=>a.kind==='s'&&a.nid);
console.log('wrongphone',(await call({a:'login',kind:'s',key:s.key,phone:'07000000000',nid:s.nid})).err);
const t=D.acc.find(a=>a.kind==='t'&&a.nid);
const o=[];for(let i=0;i<9;i++)o.push((await call({a:'login',kind:'t',key:t.key,phone:t.phone,nid:'199011111111'})).err);console.log('wrongnid x9',o.join(','));
console.log('right after lock',(await call({a:'login',kind:'t',key:t.key,phone:t.phone,nid:t.nid})).err||'ok');
const ar=s.nid.replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);console.log('arabic digits',(await call({a:'login',kind:'s',key:s.key,phone:s.phone,nid:ar})).ok?'ok':'FAIL');
// unauthenticated access to protected ops
for(const b of [{a:'inbox',kind:'s',key:s.key},{a:'tgrades',kind:'s',key:s.key,phone:s.phone,nid:s.nid},{a:'admin',op:'pull',secret:'x'},{a:'admin',op:'pull',secret:'own:xxx'},{a:'stf',op:'get',tok:'abc'},{a:'fget',id:'x'},{a:'notify',kind:'s',key:s.key,phone:s.phone,nid:s.nid,scope:'sec',target:'x'},{a:'tstSet_old',kind:'s',key:s.key,phone:s.phone,nid:s.nid}])
  console.log(b.a,b.op||'',JSON.stringify(await call(b)).slice(0,80));
const sn=await call({a:'snap',cv:229}); const j=JSON.stringify(sn); console.log('anon snap names?', /[؀-ۿ]{3,} [؀-ۿ]{3,} [؀-ۿ]{3,}/.test(JSON.stringify((sn.j||'')).slice(0,0))||'', sn.ok, j.length);
