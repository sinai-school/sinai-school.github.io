"""عمليات صيانة البيانات على خادم Cloudflare (تشتغل داخل GitHub Actions فقط).
- dump: ينسخ بيانات النظام مشفّرة بمفتاح ops/me.pub (ما ينقرأ إلا بالمفتاح الخاص) ويرفعها لفرع ops-out.
- apply: ملفات ops/in/*.json مشفّرة بمفتاح الخادم العام؛ تنفتح هنا وتنرسل للخادم بخطوة put205 (مع نسخة احتياطية من القديم).
لا يطبع أي بيانات أو رموز سرية بالسجل."""
import json, os, sys, subprocess, base64, gzip, time, glob, urllib.request
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

URL = sys.argv[1]; OUT = sys.argv[2]
REQ = json.load(open('ops/req.json'))
def q(sql):
    r = subprocess.run(['npx', '-y', 'wrangler@3', 'd1', 'execute', 'sinai', '--remote', '--json', '--command', sql], cwd='cf', capture_output=True, text=True)
    if r.returncode: print('sql-fail', sql[:60], r.stderr[-300:].replace('\n', ' ')); return []
    return json.loads(r.stdout)[0]['results']
def b64u(s): s += '=' * (-len(s) % 4); return base64.urlsafe_b64decode(s)
def int_(s): return int.from_bytes(b64u(s), 'big')
oaep = padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
log = {'id': REQ.get('id'), 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}

if REQ.get('dump'):
    D = {}
    meta = q("select p,rev,at,by,h from docs where t='docs' and h<>'DEL' and substr(p,1,1)<>'_'")
    D['meta'] = meta
    docs = {}
    ps = [m['p'] for m in meta]
    for i in range(0, len(ps), 12):
        part = ps[i:i+12]
        inn = ','.join("'d_" + p.replace("'", "''") + "'" for p in part)
        for r in q(f"select id,i,d from chunks where id in ({inn}) order by id,i"):
            docs[r['id'][2:]] = docs.get(r['id'][2:], '') + r['d']
    D['docs'] = docs
    D['prof'] = q("select kind,key,name,json,updated,status,length(photo)>0 ph from prof")
    D['acc'] = q("select kind,key,name,created,updated,length(nid)>0 hn from acc")
    D['kv'] = q("select k,v from kv where k in ('REL','EXPUB','NIDFIX','snapat','priv','privx','DREV')")
    sn = q("select d from chunks where id='snap' order by i"); D['snap'] = ''.join(x['d'] for x in sn)
    D['notes'] = q("select seq,id,scope,target,frm,title,date,cat from notes order by seq desc limit 300")
    raw = gzip.compress(json.dumps(D, ensure_ascii=False).encode())
    pub = serialization.load_pem_public_key(open('ops/me.pub', 'rb').read())
    k = AESGCM.generate_key(256); iv = os.urandom(12)
    box = {'ek': base64.b64encode(pub.encrypt(k, oaep)).decode(), 'iv': base64.b64encode(iv).decode(), 'ct': base64.b64encode(AESGCM(k).encrypt(iv, raw, None)).decode()}
    os.makedirs(OUT, exist_ok=True); json.dump(box, open(os.path.join(OUT, 'dump.json'), 'w'))
    log['dump'] = {'docs': len(docs), 'prof': len(D['prof']), 'acc': len(D['acc']), 'bytes': len(raw)}

if REQ.get('imp207'):
    until = int((time.time() + 60 * float(REQ.get('imp207'))) * 1000)
    q("insert into kv(k,v) values('IMP207','%d') on conflict(k) do update set v=excluded.v" % until)
    log['imp207'] = until

if REQ.get('sizes'):
    log['main_big_left'] = q("select count(distinct id) n, sum(length(d)) b from chunks where id like 'd_archpart/%' or id like 'd_qaidimg/%' or id like 'd_mailimg/%' or id like 'd_staffphoto/%'")
    log['arch_n'] = q("select count(*) n from docs where p like 'arch/%' and h<>'DEL'")
    log['main_all'] = q("select count(*) n, sum(length(d)) b from chunks")

files = sorted(glob.glob('ops/in/*.json'))
if files:
    kv = {r['k']: r['v'] for r in q("select k,v from kv where k in ('PK','SECRET')")}
    pk = json.loads(kv['PK']); sec = kv['SECRET']; j = pk['prv']
    prv = rsa.RSAPrivateNumbers(int_(j['p']), int_(j['q']), int_(j['d']), int_(j['dp']), int_(j['dq']), int_(j['qi']), rsa.RSAPublicNumbers(int_(j['e']), int_(j['n']))).private_key()
    pubS = prv.public_key()
    res = []
    for f in files:
        bx = json.load(open(f))
        k = prv.decrypt(base64.b64decode(bx['ek']), oaep)
        m = json.loads(AESGCM(k).decrypt(base64.b64decode(bx['iv']), base64.b64decode(bx['ct']), None))
        m['secret'] = sec; m['until'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + 3600))
        k2 = AESGCM.generate_key(256); iv2 = os.urandom(12)
        body = {'a': 'migrate', 'step': m.get('step', 'put205'), 'ek': base64.b64encode(pubS.encrypt(k2, oaep)).decode(), 'iv': base64.b64encode(iv2).decode(), 'ct': base64.b64encode(AESGCM(k2).encrypt(iv2, json.dumps(m).encode(), None)).decode()}
        r = None
        for t in range(3):
            try:
                req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers={'Content-Type': 'text/plain;charset=utf-8', 'User-Agent': 'sinai-ops'})
                with urllib.request.urlopen(req, timeout=300) as rr: r = json.loads(rr.read().decode()); break
            except Exception as e: r = {'err': str(e)[:200]}; time.sleep(5)
        res.append({'f': os.path.basename(f), 'r': {k_: v for k_, v in (r or {}).items() if k_ in ('ok', 'err', 'log', 'step', 'msg')}})
    log['apply'] = res
os.makedirs(OUT, exist_ok=True); json.dump(log, open(os.path.join(OUT, 'log.json'), 'w'), ensure_ascii=False)
print(json.dumps(log, ensure_ascii=False)[:3000])
