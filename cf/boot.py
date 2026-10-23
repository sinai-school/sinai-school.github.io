"""يشغّل الخادم الجديد أول مرة وينقل البيانات من خادم Google (صندوق boot.json مشفّر بمفتاح الخادم)."""
import json, sys, time, urllib.request
URL = sys.argv[1]
def post(b, t=120):
    req = urllib.request.Request(URL, data=json.dumps(b).encode(), headers={'Content-Type': 'text/plain;charset=utf-8', 'User-Agent': 'sinai-boot'})
    with urllib.request.urlopen(req, timeout=t) as r: return json.loads(r.read().decode())
box = json.load(open('cf/boot.json'))
print('boot', post(dict(box, a='boot')))
step, n = 'core', 0
while step and n < 80:
    n += 1
    try: r = post(dict(box, a='migrate', step=step), 300)
    except Exception as e: print('ERR', step, e); time.sleep(5); continue
    print(step, json.dumps({k: v for k, v in r.items() if k != 'r'}, ensure_ascii=False)[:400])
    if r.get('err'): print('detail', json.dumps(r.get('r'), ensure_ascii=False)[:300]); break
    step = r.get('next')
