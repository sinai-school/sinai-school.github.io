import json,os,sys,subprocess,base64,re
sys.argv=['x','/tmp/o']
T=subprocess.run(['python3','cf/tok.py'],input=os.environ['RAW_TOK'],capture_output=True,text=True).stdout.strip()
A=''.join(os.environ['RAW_ACC'].split()).strip('"')
os.environ['CLOUDFLARE_API_TOKEN']=T; os.environ['CLOUDFLARE_ACCOUNT_ID']=A
src=open('ops/x207.py').read(); src=src[:src.index("meta = [m['p']")]
src=src.replace("REQ = json.load(open('ops/x207.json'))","REQ={}").replace("pub = serialization.load_pem_public_key(open('ops/x207.pub', 'rb').read())","pub=None")
exec(src)
meta=[m['p'] for m in q("select p from docs where p like 'arch/%' and h<>'DEL'")]
M=docs(meta); print('meta',len(meta),'loaded',len(M))
k0=next(iter(M)); print('SAMPLE',k0,M[k0][:400])
bad=[]; tot=0
def chk(a):
  n=a.get('parts') or 1; out=[]
  for j in range(n):
    p='archpart/%s_%d'%(a['id'],j); _,d=one(p)
    if d is None: return 'missing part %d/%d'%(j,n)
    try:
      j0=json.loads(d); d=j0.get('d','') if isinstance(j0,dict) else ''
      if isinstance(j0,dict) and isinstance(j0.get('json'),str): d=json.loads(j0['json']).get('d','')
    except Exception: return 'bad json part %d'%j
    if not d: return 'empty part %d/%d'%(j,n)
    out.append(d)
  s=''.join(out)
  try: b=base64.b64decode(s,validate=True)
  except Exception as e: return 'bad base64 len %d (%s)'%(len(s),str(e)[:40])
  if a.get('size') and abs(len(b)-a['size'])>8: return 'size %d != %d'%(len(b),a['size'])
  if (a.get('type') or '').startswith('image/') and not (b[:3]==b'\xff\xd8\xff' or b[:4]==b'\x89PNG' or b[:4]==b'RIFF'): return 'not image header %r'%b[:6]
  return ''
import concurrent.futures
items=[]
for p,v in M.items():
  try:
    a=json.loads(v)
    if isinstance(a,dict) and 'json' in a and isinstance(a['json'],str): a=json.loads(a['json'])
    if isinstance(a,dict) and 'd' in a and isinstance(a['d'],dict): a=a['d']
  except Exception: continue
  a.setdefault('id', p.split('/',1)[1])
  if a.get('src','db')!='db': continue
  items.append(a)
tgt=[a for a in items if '2015' in str(a.get('yr','')) or '2015' in str(a.get('title',''))]
print('srcs',{str(a.get('src')) for a in items} if items else None)
print('items',len(items),'2015-2016',len(tgt))
with concurrent.futures.ThreadPoolExecutor(6) as ex:
  for a,r in zip(items,ex.map(chk,items)):
    if r: bad.append((a.get('yr'),a.get('title'),a.get('id'),a.get('parts'),r))
print('BAD',len(bad))
for b in bad[:80]: print('BAD',b)
