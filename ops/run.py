"""عمليات صيانة البيانات على خادم Cloudflare (تشتغل داخل GitHub Actions فقط).
- dump: ينسخ بيانات النظام مشفّرة بمفتاح ops/me.pub (ما ينقرأ إلا بالمفتاح الخاص) ويرفعها لفرع ops-out.
- apply: ملفات ops/in/*.json مشفّرة بمفتاح الخادم العام؛ تنفتح هنا وتنرسل للخادم بخطوة put205 (مع نسخة احتياطية من القديم).
لا يطبع أي بيانات أو رموز سرية بالسجل."""
import re, json, os, sys, subprocess, base64, gzip, time, glob, urllib.request
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
    D['acc'] = q("select kind,key,name,created,updated,length(nid)>0 hn,nid,phone from acc")
    D['kv'] = q("select k,v from kv where k in ('REL','EXPUB','NIDFIX','snapat','priv','privx','DREV')")
    sn = q("select d from chunks where id='snap' order by i"); D['snap'] = ''.join(x['d'] for x in sn)
    D['notes'] = q("select seq,id,scope,target,frm,title,date,cat from notes order by seq desc limit 300")
    raw = gzip.compress(json.dumps(D, ensure_ascii=False).encode())
    pub = serialization.load_pem_public_key(open('ops/me.pub', 'rb').read())
    k = AESGCM.generate_key(256); iv = os.urandom(12)
    box = {'ek': base64.b64encode(pub.encrypt(k, oaep)).decode(), 'iv': base64.b64encode(iv).decode(), 'ct': base64.b64encode(AESGCM(k).encrypt(iv, raw, None)).decode()}
    os.makedirs(OUT, exist_ok=True); json.dump(box, open(os.path.join(OUT, 'dump.json'), 'w'))
    log['dump'] = {'docs': len(docs), 'prof': len(D['prof']), 'acc': len(D['acc']), 'bytes': len(raw)}

if REQ.get('photos'):
    """صور طلاب البوابة (مشفّرة بمفتاح ops/me.pub) لمطابقة EMIS — نفس ملف dump.json."""
    P = q("select key,photo,updated from prof where kind='s' and photo<>'' and photo<>'gas'")
    ph = {}
    for i in range(0, len(P), 6):
        part = {('ph_' + r['photo']): r['key'] for r in P[i:i+6]}
        inn = ','.join("'" + k.replace("'", "''") + "'" for k in part)
        for r in q(f"select id,i,d from chunks where id in ({inn}) order by id,i"): ph[part[r['id']]] = ph.get(part[r['id']], '') + r['d']
    raw = gzip.compress(json.dumps({'ph': ph, 'up': {r['key']: r['updated'] for r in P}}).encode())
    pub = serialization.load_pem_public_key(open('ops/me.pub', 'rb').read())
    k = AESGCM.generate_key(256); iv = os.urandom(12)
    box = {'ek': base64.b64encode(pub.encrypt(k, oaep)).decode(), 'iv': base64.b64encode(iv).decode(), 'ct': base64.b64encode(AESGCM(k).encrypt(iv, raw, None)).decode()}
    os.makedirs(OUT, exist_ok=True); json.dump(box, open(os.path.join(OUT, 'dump.json'), 'w'))
    log['photos'] = {'n': len(P), 'got': len(ph), 'bytes': len(raw)}

if REQ.get('profset'):
    """تعديل حقل بملف بوابة طالب/مدرس: [[kind,key,field,value],...]"""
    for kind, key, fld, val in REQ['profset']:
        esc = lambda v: str(v).replace("'", "''")
        q(f"update prof set json=json_set(case when json_valid(json) then json else '{{}}' end,'$.{esc(fld)}','{esc(val)}') where kind='{esc(kind)}' and key='{esc(key)}'")
        log.setdefault('profset', []).append(key + '.' + fld)

if REQ.get('imp207'):
    # v223: لازم بصمة الرمز (sha256 بالـhex) بـ imp207th — الرمز نفسه يبقى بالجلسة وما ينكتب هنا
    th = str(REQ.get('imp207th') or '')
    if not re.fullmatch(r'[0-9a-f]{64}', th): raise SystemExit('imp207 needs imp207th (sha256 hex of a secret token)')
    q("insert into kv(k,v) values('IMP207T','%s') on conflict(k) do update set v=excluded.v" % th)
    until = int((time.time() + 60 * float(REQ.get('imp207'))) * 1000)
    q("insert into kv(k,v) values('IMP207','%d') on conflict(k) do update set v=excluded.v" % until)
    log['imp207'] = until

# v226: مفاتيح البوابة — {"flag226":{"SNAPLOCK":"1"}} أو {"flag226":{"SNAP226OFF":"1"}} (بس هذين المفتاحين، القيمة 0 أو 1)
if REQ.get('flag226'):
    for k, v in (REQ.get('flag226') or {}).items():
        if k in ('SNAPLOCK', 'SNAP226OFF') and str(v) in ('0', '1'):
            q("insert into kv(k,v) values('%s','%s') on conflict(k) do update set v=excluded.v" % (k, str(v)))
            log.setdefault('flag226', {})[k] = str(v)
# v226: فحص حي للخادم — النسخة العامة بدون أسماء للصفحة الجديدة (بدون ما يطبع أي اسم)
if REQ.get('chk226'):
    import urllib.request as _u, gzip as _gz, base64 as _b
    def _api(b):
        r = _u.Request('https://sinai.7svyn82yzr.workers.dev/', data=json.dumps(b).encode(), headers={'Content-Type': 'text/plain', 'User-Agent': 'sinai-ops'})
        return json.loads(_u.urlopen(r, timeout=40).read())
    def _cnt(r):
        j = r.get('j') or json.loads(_gz.decompress(_b.b64decode(r['z'])))
        return {'names': sum(1 for L in j.get('stu', []) for n in L if n), 'slots': sum(len(L) for L in j.get('stu', [])), 'tchpriv': sum(1 for t in j.get('tch', []) for f in ('edu', 'type', 'appoint', 'start') if t and t.get(f)), 'tch': len(j.get('tch', []))}
    try:
        o = _api({'a': 'snap'}); n = _api({'a': 'snap', 'cv': 226}); rw = _api({'a': 'snap', 'cv': 226, 'raw': 1})
        log['chk226'] = {'old_client': _cnt(o), 'new_client': dict(_cnt(n), v226=n.get('v226'), w=n.get('w')), 'raw': _cnt(rw),
                         'who_bad': _api({'a': 'who', 'nid': '199900000000'}), 'who_short': _api({'a': 'who', 'nid': '12'}),
                         'nonid': [len((_api({'a': 'nonid', 'i': i}).get('L') or [])) for i in range(len((json.loads(_gz.decompress(_b.b64decode(n['z'])))).get('sn', [])))]}
    except Exception as e:
        log['chk226'] = 'ERR ' + repr(e)[:300]
# حجم القاعدة الأساسية حسب نوع الملف
if REQ.get('dbsz'):
    try:
        log['dbsz_chunks'] = q("select case when instr(id,'/')>0 then substr(id,1,instr(id,'/')) else substr(id,1,6) end g, count(*) n, sum(length(d)) b from chunks group by g order by b desc limit 30")
        log['dbsz_docs'] = q("select case when instr(p,'/')>0 then substr(p,1,instr(p,'/')) else p end g, count(*) n from docs group by g order by n desc limit 30")
        for t in ('log', 'seen', 'notes', 'pushq', 'psub', 'fails', 'tgr', 'reports', 'bk', 'acc', 'prof'):
            try: log['n_' + t] = q('select count(*) n from ' + t)
            except Exception as e: log['n_' + t] = 'x'
    except Exception as e:
        log['dbsz'] = 'ERR ' + repr(e)[:300]
if REQ.get('sizes'):
    log['main_big_left'] = q("select count(distinct id) n, sum(length(d)) b from chunks where id like 'd_archpart/%' or id like 'd_qaidimg/%' or id like 'd_mailimg/%' or id like 'd_staffphoto/%'")
    log['arch_n'] = q("select count(*) n from docs where p like 'arch/%' and h<>'DEL'")
    log['main_all'] = q("select count(*) n, sum(length(d)) b from chunks")

if REQ.get('mailchk'):
    have = {r['p'][8:]: r for r in q("select p,h,at from docs where p like 'mailimg/%'")}
    ms = [m['p'] for m in q("select p from docs where t='docs' and h<>'DEL' and p like 'mail/%'")]
    bad = []
    for i in range(0, len(ms), 12):
        inn = ','.join("'d_" + p.replace("'", "''") + "'" for p in ms[i:i+12])
        txt = {}
        for r in q(f"select id,i,d from chunks where id in ({inn}) order by id,i"): txt[r['id']] = txt.get(r['id'], '') + r['d']
        for k, v in txt.items():
            try: m = json.loads(v)
            except Exception: continue
            for im in (m.get('imgs') or []):
                h = have.get(im)
                if not h or h['h'] == 'DEL': bad.append({'mail': k[7:], 'k': m.get('k'), 'no': m.get('no'), 'date': m.get('date'), 'img': im, 'st': 'none' if not h else 'DEL', 'pdf': im in (m.get('pdf215') or [])})
    log['mailchk'] = {'mails': len(ms), 'imgs_known': len(have), 'missing': bad[:80], 'n_missing': len(bad)}

if REQ.get('misschk'):
    def getd(p):
        t = ''.join(r['d'] for r in q("select d from chunks where id='d_" + p + "' order by i"))
        return json.loads(t) if t else {}
    L = getd('school/students').get('list') or []
    I = {}
    for g in ('g4', 'g5', 'g6'):
        try: I.update(json.loads(getd('stuinfo/' + g).get('json') or '{}'))
        except Exception: pass
    out = []; cur = 0
    for x in L:
        if x.get('ss') == 'مفصول' or x.get('x') == 'out': continue
        cur += 1
        i = I.get(x.get('id')) or {}; X = i.get('x') or {}
        nid = str(X.get('nid') or i.get('nid') or ''); mom = (' '.join(v for v in [X.get('m1'), X.get('m2'), X.get('m3')] if v) if X.get('m1') else i.get('m')) or ''
        dob = str(X.get('dob') or i.get('dob') or ''); ad = bool(X.get('mahalla') or X.get('zuqaq') or X.get('dar') or str(i.get('ad') or '').strip())
        ph = str(x.get('p') or X.get('gphone') or '')
        m = []
        if not re.match(r'^20\d{10}$', nid): m.append('البطاقة')
        if len(mom.split()) < 2: m.append('اسم الأم')
        if not re.search(r'(19|20)\d\d', dob): m.append('التولد')
        if not ad: m.append('العنوان')
        if not re.match(r'^07\d{9}$', ph): m.append('الهاتف')
        if not x.get('pg'): m.append('القيد')
        if m: out.append([x.get('n'), x.get('s'), x.get('pg') or '', '، '.join(m)])
    log['misschk'] = {'cur': len(L), 'current': cur, 'n': len(out), 'rows': out}

if REQ.get('qinfo'):
    NS = set(str(x) for x in REQ['qinfo'])
    def getd2(p):
        t = ''.join(r['d'] for r in q("select d from chunks where id='d_" + p + "' order by i"))
        return json.loads(t) if t else {}
    mask = lambda v: re.sub(r'\d{10,}', '#', json.dumps(v, ensure_ascii=False))
    qs = [m['p'] for m in q("select p from docs where p like 'qaid/%' and h<>'DEL'")]
    hits = []; sample = None
    for p in qs:
        d = getd2(p); L = d.get('list') or []
        if sample is None and L: sample = {'p': p, 'keys': sorted(set(k for x in L[:20] for k in x)), 'top': [k for k in d if k != 'list']}
        for x in L:
            vals = set(str(v) for v in x.values() if isinstance(v, (str, int)))
            if vals & NS: hits.append(p + ' ' + mask(x)[:400])
    st = [mask(x)[:300] for x in (getd2('school/students').get('list') or []) if str(x.get('pg')) in NS]
    log['qinfo'] = {'qdocs': len(qs), 'sample': sample, 'hits': hits, 'st': st}

def patch221(m):
    """v221g: تعديل حقول معيّنة بملفات موجودة (stuinfo + صور القيد) — يقرا النسخة الحالية ويرسلها put205 بـ h0 حتى ما يكتب فوق تعديل أحدث"""
    def cur(p):
        e = q("select h from docs where p='" + p.replace("'", "''") + "'")
        t = ''.join(r['d'] for r in q("select d from chunks where id='d_" + p.replace("'", "''") + "' order by i"))
        return (json.loads(t) if t else None), (e[0]['h'] if e else None)
    out = {}; L = (cur('school/students')[0] or {}).get('list') or []
    byname = lambda nm: [x for x in L if x.get('n', '').startswith(nm)]
    G = {}
    for nm, ch in (m.get('info') or {}).items():
        hit = byname(nm)
        if len(hit) != 1: log.setdefault('patch_skip', []).append(nm + ':' + str(len(hit))); continue
        sid = hit[0]['id']
        for g in ('g4', 'g5', 'g6'):
            if g not in G: d, h = cur('stuinfo/' + g); G[g] = [d or {}, h, json.loads((d or {}).get('json') or '{}'), 0]
            if sid in G[g][2] or g == {'الرابع': 'g4', 'الخامس': 'g5', 'السادس': 'g6'}.get(hit[0].get('s', '').split(' ')[0]):
                i = G[g][2].setdefault(sid, {})
                for k, v in ch.items():
                    if k == 'x':
                        if 'x' in i: i['x'].update(v)
                    else: i[k] = v
                G[g][3] = 1; log.setdefault('patch_ok', []).append(nm); break
    # infoid: نفس info بس بمعرّف الطالب (أدق من بداية الاسم)
    byid = {x['id']: x for x in L}
    for sid, ch in (m.get('infoid') or {}).items():
        st_ = byid.get(sid)
        if not st_: log.setdefault('patch_skip', []).append('id:' + sid); continue
        for g in ('g4', 'g5', 'g6'):
            if g not in G: d, h = cur('stuinfo/' + g); G[g] = [d or {}, h, json.loads((d or {}).get('json') or '{}'), 0]
            if sid in G[g][2] or g == {'الرابع': 'g4', 'الخامس': 'g5', 'السادس': 'g6'}.get(st_.get('s', '').split(' ')[0]):
                i = G[g][2].setdefault(sid, {})
                for k, v in ch.items():
                    if k == 'x':
                        if 'x' in i: i['x'].update(v)
                    else: i[k] = v
                G[g][3] = 1; log.setdefault('patch_ok', []).append(sid); break
    for g, (d, h, J, ch) in G.items():
        if ch: d = dict(d); d['json'] = json.dumps(J, ensure_ascii=False); out['stuinfo/' + g] = {'d': json.dumps(d, ensure_ascii=False), 'h0': h}
    if m.get('names'):
        d, h = cur('school/students'); nn = 0
        for x in (d or {}).get('list') or []:
            if x.get('id') in m['names']: x['n'] = m['names'][x['id']]; nn += 1
        if nn: out['school/students'] = {'d': json.dumps(d, ensure_ascii=False), 'h0': h}; log['patch_names'] = nn
    if m.get('imgs'):
        QC = {}
        for p in [r['p'] for r in q("select p from docs where p like 'qaid/%' and h<>'DEL'")]:
            d, h = cur(p); QC[p] = [d or {}, h, 0]
        for pg, durl in m['imgs'].items():
            iid = 'q221' + base64.b32encode(os.urandom(8)).decode().lower().rstrip('=')[:12]
            n = 0
            for p, v in QC.items():
                for x in (v[0].get('list') or []):
                    if str(x.get('pg')) == str(pg): x['im'] = iid; v[2] = 1; n += 1
            if n: out['qaidimg/' + iid] = {'d': json.dumps({'d': durl, 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())})}; log.setdefault('patch_img', []).append(str(pg) + ':' + str(n))
            else: log.setdefault('patch_img_skip', []).append(str(pg))
        for p, (d, h, ch) in QC.items():
            if ch: out[p] = {'d': json.dumps(d, ensure_ascii=False), 'h0': h}
    return {'step': 'put205', 'docs': out} if out else None


def restore205(m):
    """يرجّع آخر نسخة احتياطية (_bk205/<p>/<ts>) لملفات معيّنة إذا انحفظت بعد since — لإلغاء كتابة غلط."""
    out = {}
    for p in m.get('paths') or []:
        bk = q("select p from docs where p like '_bk205/" + p.replace("'", "''") + "/%' and h<>'DEL'")
        ts = sorted([(int(r['p'].rsplit('/', 1)[1]), r['p']) for r in bk if r['p'].rsplit('/', 1)[1].isdigit()])
        ts = [t for t in ts if t[0] >= int(m.get('since', 0))]
        if not ts: log.setdefault('restore_skip', []).append(p); continue
        src = ts[-1][1]
        t = ''.join(r['d'] for r in q("select d from chunks where id='d_" + src.replace("'", "''") + "' order by i"))
        e = q("select h from docs where p='" + p.replace("'", "''") + "'")
        if t: out[p] = {'d': t, 'h0': e[0]['h'] if e else None}; log.setdefault('restore', []).append(src)
    return {'step': 'put205', 'docs': out} if out else None


files = [] if REQ.get('noapply') else sorted(glob.glob('ops/in/*.json'))
if REQ.get('only'): files = [f for f in files if os.path.basename(f) in REQ['only']]
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
        if m.get('step') == 'restore205':
            m = restore205(m)
            if not m: res.append({'f': os.path.basename(f), 'r': {'err': 'restore-empty'}}); continue
        if m.get('step') == 'patch221':
            m = patch221(m)
            if not m: res.append({'f': os.path.basename(f), 'r': {'err': 'patch-empty'}}); continue
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
