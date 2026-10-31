"""v207g: نسخة مشفّرة من الأرشيف (معلومات الملفات + الصور) حتى تنقرأ البوردات وصور القيود.
مشفّرة بمفتاح ops/x207.pub (ما تنقرأ إلا بالمفتاح الخاص)، وتنرفع كـ artifact مؤقت (يوم واحد). ما يطبع أي بيانات."""
import json, os, sys, subprocess, base64, gzip, time
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
OUT = sys.argv[1]; REQ = json.load(open('ops/x207.json'))
def q(sql):
    for t in range(3):
        r = subprocess.run(['npx', '-y', 'wrangler@3', 'd1', 'execute', 'sinai', '--remote', '--json', '--command', sql], cwd='cf', capture_output=True, text=True)
        if not r.returncode: return json.loads(r.stdout)[0]['results']
        time.sleep(5)
    print('sql-fail', sql[:60]); return []
pub = serialization.load_pem_public_key(open('ops/x207.pub', 'rb').read())
oaep = padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
os.makedirs(OUT, exist_ok=True)
def save(name, obj):
    raw = gzip.compress(json.dumps(obj, ensure_ascii=False).encode())
    k = AESGCM.generate_key(256); iv = os.urandom(12)
    json.dump({'ek': base64.b64encode(pub.encrypt(k, oaep)).decode(), 'iv': base64.b64encode(iv).decode(), 'ct': base64.b64encode(AESGCM(k).encrypt(iv, raw, None)).decode()}, open(os.path.join(OUT, name), 'w'))
    return len(raw)
ACC = os.environ.get('CLOUDFLARE_ACCOUNT_ID', ''); TOK = os.environ.get('CLOUDFLARE_API_TOKEN', '')
DBID = [l.split('"')[1] for l in open('cf/wrangler.toml') if l.startswith('database_id')][0]
import urllib.request, concurrent.futures
def hq(sql, params):
    body = json.dumps({'sql': sql, 'params': params}).encode()
    for t in range(5):
        try:
            rq = urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{ACC}/d1/database/{DBID}/query', data=body, headers={'Authorization': 'Bearer ' + TOK, 'Content-Type': 'application/json'})
            with urllib.request.urlopen(rq, timeout=120) as r: j = json.loads(r.read().decode())
            if j.get('success'): return j['result'][0]['results']
        except Exception as e: err = str(e)[:100]
        time.sleep(2 + 3 * t)
    print('hq-fail'); return None
FAIL = []
def one(p):
    r = hq('select i,d from chunks where id=? order by i', ['d_' + p])
    if r is None: FAIL.append(p); return p, None
    return p, ''.join(x['d'] for x in r)
def docs(paths):
    out = {}
    with concurrent.futures.ThreadPoolExecutor(6) as ex:
        for p, d in ex.map(one, paths):
            if d: out[p] = d
    return out
meta = [m['p'] for m in q("select p from docs where p like 'arch/%' and h<>'DEL'")]
M = docs(meta)
log = {'id': REQ.get('id'), 'arch': len(M), 'meta_bytes': save('meta.json', M)}
if REQ.get('qaid'):
    qp = [m['p'] for m in q("select p from docs where (p like 'qaid/%' or p like 'school/q%') and h<>'DEL'")]
    log['qaid'] = len(qp); log['qaid_bytes'] = save('qaid.json', docs(qp))
want = REQ.get('parts')  # قائمة معرّفات الملفات، أو "all"
if want:
    P = [m['p'] for m in q("select p from docs where p like 'archpart/%' and h<>'DEL'")]
    if want != 'all': P = [p for p in P if p.split('/')[1].rsplit('_', 1)[0] in set(want)]
    if REQ.get('skip'): P = [p for p in P if p.split('/')[1].rsplit('_', 1)[0] not in set(REQ['skip'])]
    P.sort(); n = 0; buf = {}; sz = 0
    for i in range(0, len(P), 40):
        buf.update(docs(P[i:i + 40])); sz = sum(len(v) for v in buf.values())
        if sz > 22e6: save('parts%03d.json' % n, buf); n += 1; buf = {}
    if buf: save('parts%03d.json' % n, buf); n += 1
    log['parts'] = len(P); log['files'] = n; log['fail'] = len(FAIL)
json.dump(log, open(os.path.join(OUT, 'log.json'), 'w')); print(json.dumps(log))
