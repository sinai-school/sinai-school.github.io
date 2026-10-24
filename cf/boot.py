"""يشغّل الخادم الجديد أول مرة وينقل البيانات من خادم Google (صندوق boot.json مشفّر بمفتاح الخادم)."""
import json, sys, time, urllib.request
URL = sys.argv[1]
def post(b, t=120):
    req = urllib.request.Request(URL, data=json.dumps(b).encode(), headers={'Content-Type': 'text/plain;charset=utf-8', 'User-Agent': 'sinai-boot'})
    with urllib.request.urlopen(req, timeout=t) as r: return json.loads(r.read().decode())
if len(sys.argv) > 2 and sys.argv[2] == 'imp':
    import glob
    for f in sorted(glob.glob('cf/box/*.json')):
        for t in range(3):
            try: r = post(dict(json.load(open(f)), a='migrate', step='imp'), 300); break
            except Exception as e: r = {'err': str(e)}; time.sleep(5)
        print('imp', f[-7:], json.dumps({k: v for k, v in r.items() if k != 'r'}, ensure_ascii=False)[:600])
    sys.exit(0)
box = json.load(open('cf/boot.json'))
print('boot', post(dict(box, a='boot')))
step, n = (sys.argv[2] if len(sys.argv) > 2 else 'core'), 0
while step and n < 80:
    n += 1
    try: r = post(dict(box, a='migrate', step=step), 300)
    except Exception as e: print('ERR', step, e); time.sleep(5); continue
    print(step, json.dumps({k: v for k, v in r.items() if k != 'r'}, ensure_ascii=False)[:400])
    if r.get('err'): print('detail', json.dumps(r.get('r'), ensure_ascii=False)[:300]); break
    step = r.get('next')
# فحص بعد النقل
r = post({'a': 'export'}); print('export', {k: r.get(k) for k in ('ok', 'n', 'err', 'msg')})
r = post({'a': 'stf', 'op': 'salt', 'u': 'test'}); print('stf-salt', 'ok' if r.get('salt') else r)
r = post({'a': 'snap'}); print('snap', {k: r.get(k) for k in ('ok', 'none', 'at', 'err')})
import time as _t; t0 = _t.time(); post({'a': 'status', 'kind': 's', 'key': 'x'}); print('speed-ms', int((_t.time() - t0) * 1000))
