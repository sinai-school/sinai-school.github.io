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
open(os.path.join(out, 'new.jks'), 'wb').write(base64.b64decode(k['jks']))
open(os.path.join(out, 'new.pass'), 'w').write(k['pass'])
print('new key:', 'created now' if made else 'loaded', '| alias', k.get('alias'), '| jks bytes', len(base64.b64decode(k['jks'])))
