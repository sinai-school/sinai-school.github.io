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
def docs(paths):
    out = {}
    for i in range(0, len(paths), 3):
        inn = ','.join("'d_" + p.replace("'", "''") + "'" for p in paths[i:i + 3])
        for r in q(f"select id,i,d from chunks where id in ({inn}) order by id,i"):
            out[r['id'][2:]] = out.get(r['id'][2:], '') + r['d']
    return out
meta = [m['p'] for m in q("select p from docs where p like 'arch/%' and h<>'DEL'")]
M = docs(meta)
log = {'id': REQ.get('id'), 'arch': len(M), 'meta_bytes': save('meta.json', M)}
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
    log['parts'] = len(P); log['files'] = n
json.dump(log, open(os.path.join(OUT, 'log.json'), 'w')); print(json.dumps(log))
