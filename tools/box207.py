"""يجهّز صندوق مشفّر (ops/in/<name>.json) بملفات بيانات تنكتب على الخادم بخطوة put205.
الاستعمال: python3 tools/box207.py <name> <docs.json>   — docs.json = {"path": {...بيانات...}}
المفتاح العام للخادم من سطر pk: بفرع cf-status."""
import json, sys, os, base64, subprocess
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
name, src = sys.argv[1], sys.argv[2]
st = subprocess.run(['git', 'show', 'origin/cf-status:cf-status.txt'], capture_output=True, text=True).stdout
pk = json.loads([l for l in st.splitlines() if l.startswith('pk: ')][0][4:])['pub']
b = lambda s: int.from_bytes(base64.urlsafe_b64decode(s + '=' * (-len(s) % 4)), 'big')
pub = rsa.RSAPublicNumbers(b(pk['e']), b(pk['n'])).public_key()
docs = json.load(open(src))
m = {'step': 'put205', 'docs': {p: {'d': json.dumps(v, ensure_ascii=False)} for p, v in docs.items()}}
k = AESGCM.generate_key(256); iv = os.urandom(12)
box = {'ek': base64.b64encode(pub.encrypt(k, padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))).decode(),
       'iv': base64.b64encode(iv).decode(), 'ct': base64.b64encode(AESGCM(k).encrypt(iv, json.dumps(m, ensure_ascii=False).encode(), None)).decode()}
os.makedirs('ops/in', exist_ok=True); json.dump(box, open('ops/in/' + name + '.json', 'w')); print('ok', list(docs))
