#!/usr/bin/env python3
"""مرحّل البوابة — يربط نظام المدرسة (داخل Claude، ما يكدر يتصل بالإنترنت) بخادم البوابة عن طريق GitHub.
usage: python3 relay.py DB_DIR BR_DIR OUT_DIR
  DB_DIR  قاعدة بيانات النظام المقروءة بـ ArtifactData out_dir:
          priv/api.json  priv/relay.json (إذا موجود)  priv/relayq.json (إذا موجود)  school/roles.json
          letters/ arch/ grades/ attendance/ staff/ mail/ qaid/ archpart/ mailimg/ qaidimg/ staffphoto/ (المجموعات كاملة)
          school/config.json school/timetable.json school/students.json priv/official.json stuinfo/g4.json g5.json g6.json
  BR_DIR  فرع bridge: يقرا relay/in-*.json (ردود الخادم) و relay/base.json (آخر نسخة متفق عليها، مشفّرة)
  OUT_DIR يكتب: الملفات اللي لازم تنكتب بالقاعدة، والصناديق الجديدة relay/out-*.json، و relay/base.json
يطبع سطر JSON واحد: {"writes":[{"op","collection","doc_id","file"}],"boxes":n,"done":[in files],"sum":{...}}
ما يطبع الرمز السري أبداً."""
import sys, os, json, hmac, hashlib, base64, gzip, glob, time, uuid, re
# ---- نفس دالة البصمة اللي يستعملها النظام (syH/canon) ----
import math
M32 = 0xffffffff
def imul(a, b):
    return ((a & M32) * (b & M32)) & M32
def syH(s):
    h1, h2 = 0xdeadbeef, 0x41c6ce57
    u = s.encode('utf-16-le')
    for i in range(0, len(u), 2):
        c = u[i] | (u[i+1] << 8)
        h1 = imul(h1 ^ c, 2654435761)
        h2 = imul(h2 ^ c, 1597334677)
    h1 = imul(h1 ^ (h1 >> 16), 2246822507) ^ imul(h2 ^ (h2 >> 13), 3266489909)
    h2 = imul(h2 ^ (h2 >> 16), 2246822507) ^ imul(h1 ^ (h1 >> 13), 3266489909)
    return '%08x%08x' % (h2 & M32, h1 & M32)
def jnum(v):
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, int): return str(v)
    if math.isnan(v) or math.isinf(v): return 'null'
    if v == int(v) and abs(v) < 1e21: return str(int(v))
    r = repr(v)
    if 'e' in r:
        m, e = r.split('e'); e = int(e)
        r = m + 'e' + ('+' if e > 0 else '-') + str(abs(e))
    return r
def jstr(s):
    return json.dumps(s, ensure_ascii=False)
def canon(v):
    if isinstance(v, list): return '[' + ','.join(canon(x) for x in v) + ']'
    if isinstance(v, dict):
        ks = sorted(v.keys(), key=lambda k: k.encode('utf-16-be'))
        return '{' + ','.join(jstr(k) + ':' + canon(v[k]) for k in ks) + '}'
    if v is None: return 'null'
    if isinstance(v, (bool, int, float)): return jnum(v)
    return jstr(v)
def syText(d):
    return canon({} if d is None else d)


DB, BR, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(os.path.join(OUT, 'relay'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'db'), exist_ok=True)

COLS = ["letters", "arch", "grades", "attendance", "staff", "mail", "qaid"]
BLOBS = ["archpart", "mailimg", "qaidimg", "staffphoto"]
DOCS = ["school/config", "school/timetable", "school/students", "priv/official", "stuinfo/g4", "stuinfo/g5", "stuinfo/g6"]
SY_RE = re.compile(r'^(school/(config|timetable|students)|priv/official|stuinfo/(g4|g5|g6)|(letters|arch|archpart|grades|attendance|staff|staffphoto|mail|mailimg|qaid|qaidimg)/[A-Za-z0-9_\-.~:@+]{1,200})$')
BOX_RAW = 1400000   # حجم أوامر الصندوق الواحد قبل الضغط
MAX_BOXES = 6

def jload(p, d=None):
    try:
        return json.load(open(p, encoding='utf-8'))
    except Exception:
        return d

api = jload(os.path.join(DB, 'priv', 'api.json'))
if not api:
    sys.exit('ERROR: no priv/api')
api = json.loads(api['json']) if 'json' in api else api
secret = str(api.get('secret') or '').encode()
if not secret:
    sys.exit('ERROR: no secret')
K = lambda t: hmac.new(secret, ('sinai-bridge|' + t).encode(), hashlib.sha256).digest()
KE, KM = K('enc'), K('mac')

def xor(iv, b):
    out = bytearray(len(b))
    for n, i in enumerate(range(0, len(b), 32)):
        ks = hmac.new(KE, iv + n.to_bytes(4, 'big'), hashlib.sha256).digest()
        for j in range(min(32, len(b) - i)):
            out[i + j] = b[i + j] ^ ks[j]
    return bytes(out)

def seal(obj):
    p = gzip.compress(json.dumps(obj, ensure_ascii=False, separators=(',', ':')).encode('utf-8'), 6)
    iv = uuid.uuid4().hex[:16].encode()
    ct = xor(iv, p)
    mac = hmac.new(KM, iv + ct, hashlib.sha256).digest()
    return {'iv': base64.b64encode(iv).decode(), 'ct': base64.b64encode(ct).decode(), 'mac': base64.b64encode(mac).decode()}

def unseal(box):
    iv, ct, mac = (base64.b64decode(box[k]) for k in ('iv', 'ct', 'mac'))
    if not hmac.compare_digest(hmac.new(KM, iv + ct, hashlib.sha256).digest(), mac):
        return None
    return json.loads(gzip.decompress(xor(iv, ct)).decode('utf-8'))

# ---------- حالة المرحّل (بالقاعدة priv/relay) ----------
st0 = jload(os.path.join(DB, 'priv', 'relay.json'), {}) or {}
try:
    S = json.loads(st0.get('s') or '{}')
except Exception:
    S = {}
S.setdefault('idx', {}); S.setdefault('ack', []); S.setdefault('rh', ''); S.setdefault('doneQ', [])
base = {}
bb = jload(os.path.join(BR, 'relay', 'base.json'))
if bb and bb.get('box'):
    try:
        base = unseal(bb['box']) or {}
    except Exception:
        base = {}

# ---------- النسخة المحلية (القاعدة الحالية) ----------
L = {}   # path -> (text, hash, obj)
def put_local(p, d):
    if d is None:
        L.pop(p, None); return
    t = syText(d); L[p] = (t, syH(t), d)
for c in COLS + BLOBS:
    for f in glob.glob(os.path.join(DB, c, '*.json')):
        p = c + '/' + os.path.basename(f)[:-5]
        if SY_RE.match(p):
            d = jload(f)
            if d is not None: put_local(p, d)
have = {c: os.path.isdir(os.path.join(DB, c)) for c in COLS + BLOBS}
for p in DOCS:
    f = os.path.join(DB, p + '.json')
    have[p] = os.path.exists(f)
    d = jload(f)
    if d is not None: put_local(p, d)
known = lambda p: have.get(p) if p in DOCS else have.get(p.split('/')[0], False)

writes, wn = [], [0]
def wdoc(p, d):
    col, _, did = p.rpartition('/')
    if d is None:
        writes.append({'op': 'delete', 'collection': col, 'doc_id': did}); return
    wn[0] += 1
    fp = os.path.join(OUT, 'db', '%03d.json' % wn[0])
    json.dump(d, open(fp, 'w', encoding='utf-8'), ensure_ascii=False)
    writes.append({'op': 'set', 'collection': col, 'doc_id': did, 'file': fp})

def merge3(b, l, s):
    """دمج تعديل الموظف وتعديل النظام على نفس الملف: كل حقل ياخذ الطرف اللي تغيّر"""
    if not (isinstance(b, dict) and isinstance(l, dict) and isinstance(s, dict)):
        return None
    out = {}
    for k in set(b) | set(l) | set(s):
        bv, lv, sv = b.get(k, None), l.get(k, None), s.get(k, None)
        if canon(lv) == canon(bv): v = sv
        elif canon(sv) == canon(bv): v = lv
        else:
            m = merge3(bv, lv, sv) if isinstance(lv, dict) and isinstance(sv, dict) and isinstance(bv, dict) else None
            v = m if m is not None else sv
        if v is not None or k in s or k in l: out[k] = v
    return {k: v for k, v in out.items() if not (v is None and k not in s and k not in l)}

# ---------- ١) ردود الخادم السابقة ----------
done_in, results, pull, sumy = [], {}, None, {'applied': 0, 'merged': 0, 'pushed': 0, 'errors': []}
ins = sorted(glob.glob(os.path.join(BR, 'relay', 'in-*.json')), key=os.path.getmtime)
for f in ins:
    r = jload(f) or {}
    done_in.append(os.path.basename(f))
    if not r.get('box'):
        sumy['errors'].append(str(r.get('err') or 'no reply')[:120]); continue
    m = unseal(r['box'])
    if not m:
        sumy['errors'].append('bad reply signature'); continue
    for x in m.get('res', []):
        op, qid, rr = x.get('op'), x.get('qid'), x.get('r') or {}
        if qid:
            results[qid] = rr
            if qid not in S['doneQ']: S['doneQ'].append(qid)
        if op == 'pull' and rr.get('ok'):
            pull = rr
        if op == 'osync':
            if not rr.get('ok'):
                sumy['errors'].append('osync ' + str(rr.get('err')) + ' ' + str(rr.get('msg') or '')[:80]); continue
            S['idx'] = rr.get('idx') or {}
            S['rh'] = rr.get('rh') or ''
            for p, t in (rr.get('data') or {}).items():
                if not SY_RE.match(p) or not known(p): continue
                if t is None:
                    if p in L:
                        wdoc(p, None); L.pop(p, None); sumy['applied'] += 1
                    S['ack'].append({'p': p, 'h': 'DEL'}); base.pop(p, None)
                    continue
                try:
                    d = json.loads(t)
                except Exception:
                    continue
                h = syH(syText(d))
                cur = L.get(p)
                if cur and cur[1] != h and p in base and cur[1] != syH(base[p]):
                    # الطرفين تغيّروا: دمج حقل بحقل
                    mg = merge3(json.loads(base[p]), cur[2], d)
                    if mg is not None:
                        d = mg; h = syH(syText(d)); sumy['merged'] += 1
                if not cur or cur[1] != h:
                    wdoc(p, d); sumy['applied'] += 1
                put_local(p, d)
                st_ = syText(json.loads(t))
                S['ack'].append({'p': p, 'h': syH(st_)})
                base[p] = st_
S['doneQ'] = S['doneQ'][-400:]

# ---------- ٢) الأوامر الجديدة ----------
I = S['idx']
push, want, dels, acks = [], [], [], list(S['ack'])
S['ack'] = []
for p in sorted(set(L) | set(I)):
    if not SY_RE.match(p) or not known(p): continue
    Lx, Sx = L.get(p), I.get(p)
    Lh = Lx[1] if Lx else None
    if not Sx:
        if Lx: push.append({'p': p, 'd': Lx[0], 'h': Lh, 'oh': ''})
        continue
    h, oh = str(Sx[1]), str(Sx[2])
    sDel = h == 'DEL'
    if Lh is None:
        if sDel:
            if oh != 'DEL': acks.append({'p': p, 'h': 'DEL'})
            continue
        if oh == h:
            push.append({'p': p, 'del': 1}); continue
        want.append(p); continue
    if not sDel and Lh == h:
        if oh != h: acks.append({'p': p, 'h': h})
        base[p] = Lx[0]
        continue
    locCh, srvCh = Lh != oh, h != oh
    if not srvCh:
        push.append({'p': p, 'd': Lx[0], 'h': Lh, 'oh': h}); continue
    if not locCh:
        (dels if sDel else want).append(p); continue
    # الطرفين تغيّروا: نسحب نسخة الخادم وندمجها بالرد الجاي (والمحلي يبقى لحد الدمج)
    (dels if sDel else want).append(p)
for p in dels:
    if p in L:
        wdoc(p, None); L.pop(p, None); sumy['applied'] += 1
    acks.append({'p': p, 'h': 'DEL'}); base.pop(p, None)

rl = []
rd = jload(os.path.join(DB, 'school', 'roles.json'))
if rd:
    try:
        rl = (json.loads(rd['json']) if 'json' in rd else rd).get('list') or []
    except Exception:
        rl = []
rh = syH(canon(rl))

q = jload(os.path.join(DB, 'priv', 'relayq.json'), {}) or {}
qops = [o for o in (q.get('ops') or []) if isinstance(o, dict) and o.get('qid') and o.get('qid') not in S['doneQ'] and o.get('op') in ('push', 'note', 'delNote', 'setPhone', 'profStatus', 'report')]

boxes, cur, size = [], [], 0
def close():
    global cur, size
    if cur:
        boxes.append(cur); cur = []; size = 0
first = {'op': 'osync', 'ack': acks}
if rd and rh != S.get('rh'):
    first['roles'] = rl; first['rh'] = rh
cur.append(first); size = len(json.dumps(acks)) + (len(json.dumps(rl, ensure_ascii=False)) if 'roles' in first else 0)
for o in qops:
    cur.append(o); size += len(json.dumps(o, ensure_ascii=False))
pb = []
for x in push:
    n = len(x.get('d') or '') + 200
    if pb and size + n > BOX_RAW:
        cur.append({'op': 'osync', 'push': pb}); pb = []; close()
        if len(boxes) >= MAX_BOXES: break
    pb.append(x); size += n
if pb and len(boxes) < MAX_BOXES:
    cur.append({'op': 'osync', 'push': pb})
    sumy['pushed'] = sum(1 for b in boxes for o in b if o.get('push') for _ in o['push']) + len(pb)
else:
    sumy['pushed'] = sum(1 for b in boxes for o in b if o.get('push') for _ in o['push'])
if len(boxes) < MAX_BOXES:
    cur.append({'op': 'osync', 'want': want[:120]})
    cur.append({'op': 'pull'})
close()
bn = 0
for ops in boxes:
    bid = time.strftime('%Y%m%d%H%M%S') + '-' + uuid.uuid4().hex[:6]
    json.dump({'id': bid, 'box': seal({'v': 1, 'id': bid, 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'ops': ops})}, open(os.path.join(OUT, 'relay', 'out-%s.json' % bid), 'w'))
    bn += 1
json.dump({'box': seal(base)}, open(os.path.join(OUT, 'relay', 'base.json'), 'w'))

# ---------- ٣) حالة المرحّل + نتائج أوامر الصفحة + آخر سحب ----------
S['at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
info = {'at': S['at'], 'ok': 0 if sumy['errors'] else 1, 'applied': sumy['applied'], 'merged': sumy['merged'], 'pushed': sumy['pushed'], 'want': len(want), 'err': '; '.join(sumy['errors'])[:300], 'srv': len(I)}
wdoc('priv/relay', {'s': json.dumps(S, ensure_ascii=False), 'info': info})
if results:
    old = jload(os.path.join(DB, 'priv', 'relayr.json'), {}) or {}
    try:
        R = json.loads(old.get('json') or '{}')
    except Exception:
        R = {}
    R.update(results)
    R = dict(list(R.items())[-200:])
    wdoc('priv/relayr', {'json': json.dumps(R, ensure_ascii=False), 'at': S['at']})
if pull:
    wdoc('priv/portalpull', {'json': json.dumps(pull, ensure_ascii=False), 'at': S['at']})
print(json.dumps({'writes': writes, 'boxes': bn, 'done': done_in, 'sum': info}, ensure_ascii=False))
