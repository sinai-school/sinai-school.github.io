import fs from 'fs';
const D=JSON.parse(fs.readFileSync('dump.json'));const U='http://127.0.0.1:8787/';let ip=1;
const call=async b=>{const r=await fetch(U,{method:'POST',headers:{'content-type':'text/plain','x-ip':String(ip++%250+1)},body:JSON.stringify(b)});return r.json()};
const kv=Object.fromEntries(D.kv.map(r=>[r.k,r.v]));const P=JSON.parse(kv.priv||'{}'),NF=JSON.parse(kv.NIDFIX||'{}');
const prof=Object.fromEntries(D.prof.map(p=>[p.kind+':'+p.key,JSON.parse(p.json||'{}')]));
const out={};
for(const a of D.acc.filter(a=>!a.nid)){const pv=(P[a.kind]||{})[a.key]||{};
  const c=[NF[a.kind+':'+a.key],NF[a.key],(pv.pre||{}).nid,pv.nid2,pv.nid,(prof[a.kind+':'+a.key]||{}).nid].filter(Boolean).map(String);
  let st='nocandidate';
  for(const n of [...new Set(c)]){const r=await call({a:'login',kind:a.kind,key:a.key,phone:a.phone,nid:n}); if(r.ok){st='ok';break} st=r.err;}
  out[a.kind+':'+st]=(out[a.kind+':'+st]||0)+1;}
console.log(out, Object.keys(NF).slice(0,3), Object.keys((P.s||{})[Object.keys(P.s||{})[0]]||{}));
