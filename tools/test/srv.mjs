// خادم محلي: cf/worker.js فوق node:sqlite (بديل D1)
import { DatabaseSync } from 'node:sqlite';
import http from 'node:http';
import { pathToFileURL } from 'node:url';
const [,, dbPath, workerPath, port] = process.argv;
const mk = p => { const db = new DatabaseSync(p);
  class St { constructor(q){this.q=q;this.a=[]} bind(...a){const s=new St(this.q);s.a=a.map(v=>v===undefined?null:(typeof v==='boolean'?+v:v));return s}
    _s(){return db.prepare(this.q)} async all(){return {results:this._s().all(...this.a)}} async first(){return this._s().get(...this.a)??null}
    async run(){const r=this._s().run(...this.a);return {meta:{changes:r.changes,last_row_id:Number(r.lastInsertRowid)}}} }
  return { prepare:q=>new St(q), batch: async L=>{db.exec('BEGIN');try{const o=[];for(const s of L)o.push(await s.run());db.exec('COMMIT');return o}catch(e){db.exec('ROLLBACK');throw e}}, exec: async q=>db.exec(q) } };
const env = { DB: mk(dbPath), FDB: mk(dbPath.replace(/\.db$/,'_f.db')) };
const W = (await import(pathToFileURL(workerPath).href + '?' + Date.now())).default;
http.createServer(async (rq, rs) => { const ch=[]; for await (const c of rq) ch.push(c); const body=Buffer.concat(ch);
  const req = new Request('https://sinai.7svyn82yzr.workers.dev' + rq.url, { method: rq.method, headers: { ...rq.headers, 'cf-connecting-ip': '10.0.0.' + (rq.headers['x-ip']||'1') }, body: /GET|HEAD/.test(rq.method) ? undefined : body });
  try { const r = await W.fetch(req, env, { waitUntil(){} }); rs.writeHead(r.status, Object.fromEntries(r.headers)); rs.end(Buffer.from(await r.arrayBuffer())); }
  catch (e) { console.error('ERR', rq.url, e.stack); rs.writeHead(500); rs.end(String(e)); } }).listen(+port, () => console.log('up', port));
