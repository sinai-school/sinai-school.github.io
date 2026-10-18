#!/usr/bin/env python3
"""جسر البوابة — يشتغل على GitHub Actions كل ربع ساعة.
1) إذا نظام المدرسة أضاف معلومات لملفاتهم (ack.json)، يأكد لخادم البوابة حتى تصير «انضافت لملفه».
2) يسحب الاستمارات الجديدة من خادم البوابة مشفّرة بالرمز السري، ويحطها بفرع bridge (ما يكدر أحد يقراها غير نظام المدرسة).
usage: python3 tools/bridge.py BRIDGE_DIR"""
import sys, os, json, time, urllib.request
API = 'https://script.google.com/macros/s/AKfycbyAwbqwl0TD2A4aKl6eTy0SGicGFj23XW2xp82OXVyVgcN9cv1nZOegWU2oO4ybmrVLaw/exec'
B = sys.argv[1]
def post(body, tries=3):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(API, data=json.dumps(body).encode(), headers={'Content-Type': 'text/plain;charset=utf-8'})
            with urllib.request.urlopen(req, timeout=150) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:
            last = e; time.sleep(5 * (i + 1))
    raise SystemExit('ERROR: server unreachable: %s' % last)
log = []
ap = os.path.join(B, 'ack.json')
if os.path.exists(ap):
    a = json.load(open(ap))
    r = post({'a': 'exack', 'ls': a['ls'], 'sig': a['sig']})
    log.append('ack %s' % json.dumps({k: r.get(k) for k in ('ok', 'n', 'err', 'id')}))
    if r.get('ok') or r.get('err') == 'auth':
        os.remove(ap)
r = post({'a': 'export'})
if r.get('err') in ('action', 'nosecret'):
    print('portal server not ready yet:', r.get('err')); sys.exit(0)
if not r.get('ok'):
    raise SystemExit('ERROR: export %s' % r.get('err'))
pp = os.path.join(B, 'portal.json')
old = json.load(open(pp)) if os.path.exists(pp) else {}
if old.get('sig') != r['sig']:
    json.dump({'sig': r['sig'], 'n': r['n'], 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'box': r['box']}, open(pp, 'w'))
    log.append('portal n=%s' % r['n'])
print(' | '.join(log) or 'no change')
