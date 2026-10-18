#!/usr/bin/env python3
"""Apply the school portal's new profile forms to the school system's records.
usage: python3 apply_portal.py PORTAL_JSON DB_DIR OUT_DIR
  PORTAL_JSON  portal.json from the repo's `bridge` branch (encrypted box from the portal server)
  DB_DIR       the system database read with ArtifactData out_dir: priv/api.json, school/students.json,
               stuinfo/g4.json g5.json g6.json, staff/<id>.json (whole collection)
  OUT_DIR      where the documents to write and ack.json are saved
Prints one JSON line: {"writes":[{"collection","doc_id","file"}], "applied":n, "invalid":[...], "skipped":[...]} or NOTHING."""
import sys, os, json, hmac, hashlib, base64, gzip, re, glob, datetime

portal, dbdir, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
P = json.load(open(portal, encoding='utf-8'))
api = json.load(open(os.path.join(dbdir, 'priv', 'api.json'), encoding='utf-8'))
api = json.loads(api['json']) if 'json' in api else api
secret = api['secret'].encode()
K = lambda t: hmac.new(secret, ('sinai-bridge|' + t).encode(), hashlib.sha256).digest()
ke, km = K('enc'), K('mac')
box = P['box']
iv, ct, mac = (base64.b64decode(box[k]) for k in ('iv', 'ct', 'mac'))
if not hmac.compare_digest(hmac.new(km, iv + ct, hashlib.sha256).digest(), mac):
    sys.exit('ERROR: bad signature')
pt = bytearray(len(ct))
for n, i in enumerate(range(0, len(ct), 32)):
    ks = hmac.new(ke, iv + n.to_bytes(4, 'big'), hashlib.sha256).digest()
    for j in range(min(32, len(ct) - i)):
        pt[i + j] = ct[i + j] ^ ks[j]
data = json.loads(gzip.decompress(bytes(pt)).decode('utf-8'))
prof, photos = data.get('prof', []), data.get('ph', {})
if not prof:
    print('NOTHING'); sys.exit(0)

# ---------- the form fields (same rules the portal form uses) ----------
DEFS = json.loads(r'''{"s":[{"sec":"اسم الطالب الكامل","n":"اكتب كل اسم بخانته، بالحروف العربية فقط ومطابق للبطاقة الموحدة."},{"k":"n1","l":"اسم الطالب","t":"name","req":1},{"k":"n2","l":"اسم الأب","t":"name","req":1},{"k":"n3","l":"اسم الجد","t":"name","req":1},{"k":"n4","l":"اسم والد الجد","t":"name","req":1},{"k":"laqab","l":"اللقب (إن وجد)","t":"name","max":3},{"sec":"اسم الأم"},{"k":"m1","l":"اسم الأم","t":"name","req":1},{"k":"m2","l":"اسم والد الأم","t":"name","req":1},{"k":"m3","l":"اسم جد الأم","t":"name","req":1},{"sec":"المعلومات الشخصية"},{"k":"dob","l":"المواليد (يوم - شهر - سنة)","t":"date","req":1,"yr":[2001,2014],"w":1},{"k":"nid","l":"رقم البطاقة الموحدة (١٢ رقم)","t":"digits","len":12,"req":1},{"k":"gphone","l":"رقم هاتف ولي الأمر","t":"phone","req":1},{"k":"gr","l":"مشمول بمنحة الرعاية الاجتماعية","t":"sel","o":["نعم","لا"],"req":1},{"sec":"عنوان السكن"},{"k":"city","l":"المدينة","t":"text","req":1},{"k":"hay","l":"الحي","t":"text","req":1},{"k":"mahalla","l":"المحلة (رقم)","t":"digits","min":1,"max":4,"req":1},{"k":"zuqaq","l":"الزقاق (رقم)","t":"digits","min":1,"max":4,"req":1},{"k":"dar","l":"الدار","t":"house","req":1},{"k":"near","l":"أقرب نقطة دالة","t":"text","min":3,"req":1},{"sec":"التواصل"},{"k":"email","l":"البريد الإلكتروني (إن وجد)","t":"email","w":1}],"t":[{"sec":"الاسم","n":"اكتب كل اسم بخانته، بالحروف العربية فقط ومطابق للبطاقة الموحدة."},{"k":"n1","l":"الاسم","t":"name","req":1},{"k":"n2","l":"اسم الأب","t":"name","req":1},{"k":"n3","l":"اسم الجد","t":"name","req":1},{"k":"n4","l":"اسم والد الجد","t":"name","req":1},{"k":"laqab","l":"اللقب (إن وجد)","t":"name","max":3},{"k":"m1","l":"اسم الأم","t":"name","req":1},{"k":"m2","l":"اسم والد الأم","t":"name","req":1},{"k":"m3","l":"اسم جد الأم","t":"name","req":1},{"sec":"المعلومات الشخصية"},{"k":"gender","l":"الجنس","t":"sel","o":["ذكر","أنثى"],"req":1},{"k":"birth","l":"التولد (يوم - شهر - سنة)","t":"date","req":1,"yr":[1956,2006],"w":1},{"k":"birthPlace","l":"محل الولادة","t":"text","req":1},{"k":"blood","l":"فصيلة الدم","t":"sel","o":["A+","A-","B+","B-","AB+","AB-","O+","O-"],"req":1},{"k":"marital","l":"الحالة الاجتماعية","t":"sel","o":["أعزب","متزوج","مطلق","أرمل"],"req":1},{"k":"spouse","l":"اسم الزوج / الزوجة","t":"text","reqIf":"married"},{"k":"marriageDate","l":"تاريخ الزواج","t":"date","yr":[1965,2026],"reqIf":"married","w":1},{"k":"spouseBirth","l":"تولد الزوج / الزوجة","t":"date","yr":[1946,2010],"w":1},{"k":"spouseJob","l":"وظيفة الزوج / الزوجة","t":"text"},{"k":"spouseWork","l":"مكان عمل الزوج / الزوجة","t":"text"},{"k":"children","l":"عدد الأولاد","t":"num","min":0,"max":20,"req":1},{"sec":"المستمسكات"},{"k":"nid","l":"رقم البطاقة الموحدة (١٢ رقم)","t":"digits","len":12,"req":1},{"k":"nidDate","l":"تاريخ إصدار البطاقة الموحدة","t":"date","yr":[2010,2026],"req":1,"w":1},{"k":"resCard","l":"رقم بطاقة السكن","t":"digits","min":3,"max":15},{"k":"resOffice","l":"مكتب المعلومات","t":"text"},{"k":"passport","l":"رقم جواز السفر (إن وجد)","t":"alnum"},{"k":"card","l":"رقم حساب الماستر / كي كارد (إن وجد)","t":"digits","min":8,"max":20},{"sec":"الشهادة والاختصاص"},{"k":"edu","l":"التحصيل الدراسي / الشهادة","t":"sel","o":["دبلوم","بكالوريوس","دبلوم عالي","ماجستير","دكتوراه"],"req":1},{"k":"spec","l":"الاختصاص","t":"text","req":1},{"k":"specFull","l":"التخصص الدقيق","t":"text"},{"k":"college","l":"الكلية","t":"text","req":1},{"k":"dept","l":"القسم","t":"text","req":1},{"k":"univ","l":"الجامعة","t":"text","req":1},{"k":"gradYear","l":"سنة التخرج","t":"year","yr":[1965,2026],"req":1},{"k":"studyCountry","l":"بلد الدراسة","t":"text","req":1,"def":"العراق"},{"sec":"المعلومات الوظيفية"},{"k":"empNo","l":"الرقم الوظيفي","t":"digits","min":1,"max":12},{"k":"type","l":"دائمي / عقد","t":"sel","o":["دائمي","عقد"],"req":1},{"k":"grade","l":"الدرجة الوظيفية","t":"sel","o":["الأولى","الثانية","الثالثة","الرابعة","الخامسة","السادسة","السابعة","الثامنة","التاسعة","العاشرة"]},{"k":"appoint","l":"تاريخ أول تعيين","t":"date","yr":[1975,2026],"req":1,"w":1},{"k":"start","l":"تاريخ المباشرة في المدرسة","t":"date","yr":[1975,2026],"req":1,"w":1},{"k":"subjects","l":"المواد التي يدرسها","t":"text"},{"k":"prevSchool","l":"آخر مدرسة نُقل منها","t":"text"},{"k":"thanks","l":"كتب الشكر (العدد أو التفاصيل)","t":"text","w":1},{"k":"martyr","l":"من ذوي الشهداء","t":"sel","o":["نعم","لا"],"req":1},{"k":"polDism","l":"من المفصولين السياسيين","t":"sel","o":["نعم","لا"],"req":1},{"sec":"عنوان السكن"},{"k":"city","l":"المدينة","t":"text","req":1},{"k":"hay","l":"الحي","t":"text","req":1},{"k":"mahalla","l":"المحلة (رقم)","t":"digits","min":1,"max":4,"req":1},{"k":"zuqaq","l":"الزقاق (رقم)","t":"digits","min":1,"max":4,"req":1},{"k":"dar","l":"الدار","t":"house","req":1},{"k":"near","l":"أقرب نقطة دالة","t":"text","min":3,"req":1},{"sec":"التواصل"},{"k":"phone2","l":"رقم هاتف ثاني (إن وجد)","t":"phone"},{"k":"email","l":"البريد الإلكتروني (إن وجد)","t":"email","w":1}]}''')
AR = re.compile(r'^[ء-غف-ي ]+$')
def date_ok(v):
    m = re.fullmatch(r'(\d{4})-(\d{2})-(\d{2})', v)
    if not m: return None
    try: d = datetime.date(int(m[1]), int(m[2]), int(m[3]))
    except ValueError: return None
    return d
def check(kind, o):
    E, today = [], datetime.date.today()
    married = o.get('marital') == 'متزوج'
    for f in DEFS['s' if kind == 's' else 't']:
        k = f.get('k')
        if not k: continue
        v = str(o.get(k) if o.get(k) is not None else '').strip()
        req = f.get('req') or (f.get('reqIf') == 'married' and married)
        lab = re.sub(r' \(.*\)$', '', f['l'])
        if not v:
            if req: E.append(lab + ' ناقص')
            continue
        t = f['t']
        if t == 'name' and not AR.match(v): E.append(lab + ': بيه حروف غير عربية')
        elif t == 'digits' and (not v.isdigit() or (f.get('len') and len(v) != f['len'])): E.append(lab + ': رقم غير صحيح')
        elif t == 'phone' and not re.fullmatch(r'07\d{9}', v): E.append(lab + ': رقم هاتف غير صحيح')
        elif t == 'date':
            d = date_ok(v)
            if not d or d > today: E.append(lab + ': تاريخ غير صحيح')
        elif t == 'sel' and f.get('o') and v not in f['o']: E.append(lab + ': اختيار غير صحيح')
        elif t == 'email' and not re.fullmatch(r'[^\s@]+@[^\s@]+\.[A-Za-z]{2,}', v): E.append(lab + ': بريد غير صحيح')
    by = str(o.get('dob') or o.get('birth') or '')[:4]
    nid = str(o.get('nid') or '')
    if re.fullmatch(r'\d{12}', nid) and re.fullmatch(r'\d{4}', by) and nid[:4] != by:
        E.append('رقم البطاقة الموحدة ما يطابق سنة المواليد')
    return E

def digits(s):
    return re.sub('[٠-٩]', lambda m: str(ord(m[0]) - 1632), re.sub('[۰-۹]', lambda m: str(ord(m[0]) - 1776), str(s or '')))
def phN(x):
    d = re.sub(r'\D', '', digits(x)); t = d[-10:]
    return t if len(t) == 10 and t[0] == '7' else ''
J = lambda *a: ' '.join('' if x is None else str(x) for x in a)   # like JS [a,b].join(" ")

# ---------- current records ----------
def load(p):
    return json.load(open(p, encoding='utf-8'))
stu_doc = load(os.path.join(dbdir, 'school', 'students.json'))
ST = stu_doc['list']
INF, INFG = {}, {}
for g in ('g4', 'g5', 'g6'):
    p = os.path.join(dbdir, 'stuinfo', g + '.json')
    o = json.loads(load(p).get('json') or '{}') if os.path.exists(p) else {}
    INF[g] = o
    for i in o: INFG[i] = g
STF = {}
for p in glob.glob(os.path.join(dbdir, 'staff', '*.json')):
    d = load(p); STF[os.path.splitext(os.path.basename(p))[0]] = d
def gkey(s):
    g = str(s.get('s') or '').split(' ')[0]
    return 'g4' if g == 'الرابع' else 'g5' if g == 'الخامس' else 'g6'

TMAP = ["gender","birth","birthPlace","blood","marital","spouse","marriageDate","spouseBirth","spouseJob","spouseWork","children","nid","nidDate","resCard","resOffice","passport","card","edu","spec","specFull","college","dept","univ","gradYear","studyCountry","empNo","type","grade","appoint","start","subjects","prevSchool","thanks","martyr","polDism","email"]
changed_g, changed_st, staff_w, photo_w = set(), False, {}, {}
acks, invalid, skipped = [], [], []
for p in prof:
    try: o = json.loads(p.get('json') or '{}')
    except Exception: skipped.append([p['kind'], p['key'], 'json']); continue
    if o.get('v3') != '1': invalid.append([p['kind'], p['key'], p.get('name', ''), ['الاستمارة القديمة']]); continue
    E = check(p['kind'], o)
    if E: invalid.append([p['kind'], p['key'], p.get('name', ''), E]); continue
    key = p['key']
    if p['kind'] == 's':
        s = next((x for x in ST if x.get('id') == key), None)
        if not s: skipped.append(['s', key, 'not in list']); continue
        g = INFG.get(key) or gkey(s); INFG[key] = g
        i = INF[g].setdefault(key, {})
        i['m'] = J(o.get('m1'), o.get('m2'), o.get('m3')); i['dob'] = o.get('dob'); i['nid'] = o.get('nid')
        i['ar'] = ' — '.join(x for x in [o.get('city'), o.get('hay'), o.get('near')] if x)
        i['ad'] = ' / '.join(['محلة ' + str(o.get('mahalla')), 'زقاق ' + str(o.get('zuqaq')), 'دار ' + str(o.get('dar'))])
        i['gr'] = o.get('gr')
        i['x'] = {k: o.get(k) for k in ['n1','n2','n3','n4']}
        i['x'].update({'laqab': o.get('laqab') or '', 'm1': o.get('m1'), 'm2': o.get('m2'), 'm3': o.get('m3'), 'dob': o.get('dob'), 'nid': o.get('nid'), 'gphone': o.get('gphone'), 'gr': o.get('gr'), 'city': o.get('city'), 'hay': o.get('hay'), 'mahalla': o.get('mahalla'), 'zuqaq': o.get('zuqaq'), 'dar': o.get('dar'), 'near': o.get('near'), 'email': o.get('email') or '', 'at': o.get('at') or ''})
        changed_g.add(g)
        gp = phN(o.get('gphone'))
        if gp and s.get('p') != '0' + gp: s['p'] = '0' + gp; changed_st = True
    else:
        if p.get('ph') and key not in photos: skipped.append(['t', key, 'photo next time']); continue
        nm = ' '.join(x for x in [o.get('n1'), o.get('n2'), o.get('n3'), o.get('n4')] if x)
        f = STF.get(key)
        if f is None:
            ords = [int(x.get('ord')) for x in STF.values() if str(x.get('ord') or '').lstrip('-').isdigit()]
            f = {'id': key, 'name': nm, 'job': 'مدرس', 'status': 'مستمر', 'ord': str(max([0] + ords) + 1)}
        nf = dict(f); nf['id'] = key
        if not nf.get('name'): nf['name'] = nm
        nf['fname'] = nm + (' ' + o['laqab'] if o.get('laqab') else '')
        nf['mother'] = J(o.get('m1'), o.get('m2'), o.get('m3'))
        for k in TMAP:
            if o.get(k): nf[k] = o[k]
        nf['address'] = ' / '.join(x for x in [o.get('city'), o.get('hay'), 'محلة ' + str(o.get('mahalla')), 'زقاق ' + str(o.get('zuqaq')), 'دار ' + str(o.get('dar')), o.get('near')] if x)
        ph = []
        for x in re.split(r'[\s,،/]+', str(nf.get('phone') or '')):
            q = phN(x)
            if q and '0' + q not in ph: ph.append('0' + q)
        q = phN(o.get('phone2'))
        if q and '0' + q not in ph: ph.append('0' + q)
        if ph: nf['phone'] = ' ، '.join(ph)
        STF[key] = nf; staff_w[key] = nf
        if key in photos: photo_w[key] = {'d': photos[key]}
    acks.append([p['kind'], key, p['h'], 'ok'])

writes = []
def w(col, doc, obj):
    fp = os.path.join(out, col.replace('/', '_') + '__' + doc + '.json')
    json.dump(obj, open(fp, 'w', encoding='utf-8'), ensure_ascii=False)
    writes.append({'collection': col, 'doc_id': doc, 'file': fp})
for g in sorted(changed_g):
    w('stuinfo', g, {'json': json.dumps(INF[g], ensure_ascii=False, separators=(',', ':'))})
if changed_st:
    w('school', 'students', dict(stu_doc, list=ST))
for k, v in staff_w.items(): w('staff', k, v)
for k, v in photo_w.items(): w('staffphoto', k, v)
if acks:
    ls = json.dumps({'id': hashlib.md5(json.dumps(acks).encode()).hexdigest()[:12], 'list': acks}, separators=(',', ':'))
    sig = base64.b64encode(hmac.new(km, ls.encode(), hashlib.sha256).digest()).decode()
    json.dump({'ls': ls, 'sig': sig}, open(os.path.join(out, 'ack.json'), 'w'))
print(json.dumps({'writes': writes, 'applied': len(acks), 'invalid': [[a, b, c] for a, b, c, _ in invalid], 'skipped': skipped, 'ack': os.path.join(out, 'ack.json') if acks else ''}, ensure_ascii=False))
