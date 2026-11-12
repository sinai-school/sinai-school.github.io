"""مفتاح توقيع الأندرويد الجديد (السري) — محفوظ بقاعدة Cloudflare (kv ANDKS2)، مو بالمستودع.
يجيبه إذا موجود، وإلا يولّده مرة وحدة ويحفظه. يكتب new.jks و new.pass بالمجلد المطلوب (ما يطبع أي سر)."""
import sys, os, json, base64, secrets, subprocess
out = sys.argv[1]
def q(sql):
    r = subprocess.run(['npx', '-y', 'wrangler@3', 'd1', 'execute', 'sinai', '--remote', '--json', '--command', sql], cwd='cf', capture_output=True, text=True)
    if r.returncode: raise SystemExit('d1 failed: ' + r.stderr[-200:].replace('\n', ' '))
    return json.loads(r.stdout)[0]['results']
def get():
    r = q("select v from kv where k='ANDKS2'")
    return json.loads(r[0]['v']) if r else None
k = get(); made = False
if not k:
    pw = secrets.token_urlsafe(24); tmp = os.path.join(out, 'gen.jks')
    subprocess.run(['keytool', '-genkeypair', '-keystore', tmp, '-storetype', 'JKS', '-alias', 'sinai2', '-keyalg', 'RSA', '-keysize', '4096', '-validity', '20000',
                    '-storepass', pw, '-keypass', pw, '-dname', 'CN=Sinai Preparatory School for Boys, O=Sinai School, C=IQ'], check=True, capture_output=True)
    v = json.dumps({'jks': base64.b64encode(open(tmp, 'rb').read()).decode(), 'pass': pw, 'alias': 'sinai2'})
    os.remove(tmp)
    q("insert into kv(k,v) values('ANDKS2','%s') on conflict(k) do nothing" % v.replace("'", "''"))
    k = get(); made = True
    if not k: raise SystemExit('could not store key')
# نسخة ثانية من المفتاح بقاعدة ثانية (sinai_files2) — إذا ضاع المفتاح، الأجهزة اللي تحدثت ما تقبل أي تحديث بعد
def q2(sql):
    r = subprocess.run(['npx', '-y', 'wrangler@3', 'd1', 'execute', 'sinai_files2', '--remote', '--json', '--command', sql], cwd='cf', capture_output=True, text=True)
    return json.loads(r.stdout)[0]['results'] if r.returncode == 0 else None
bk = 'none'
try:
    r2 = q2("select d from chunks where id='andks2' and i=0")
    if r2 is None: bk = 'unreachable'
    elif r2 and json.loads(r2[0]['d']).get('jks') == k['jks']: bk = 'ok'
    elif r2: bk = 'DIFFERENT'
    else:
        q2("insert into chunks(id,i,d) values('andks2',0,'%s')" % json.dumps(k).replace("'", "''")); r3 = q2("select d from chunks where id='andks2' and i=0")
        bk = 'saved' if r3 and json.loads(r3[0]['d']).get('jks') == k['jks'] else 'failed'
except Exception as e: bk = 'err'
print('backup copy:', bk)
open(os.path.join(out, 'new.jks'), 'wb').write(base64.b64decode(k['jks']))
open(os.path.join(out, 'new.pass'), 'w').write(k['pass'])
print('new key:', 'created now' if made else 'loaded', '| alias', k.get('alias'), '| jks bytes', len(base64.b64decode(k['jks'])))
