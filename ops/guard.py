# حارس حد Cloudflare المجاني — يشتغل كل ساعة (guard.yml)
# يحسب استهلاك اليوم (قراءات D1 لكل الحساب + طلبات Workers) ويكتب مستوى التوفير:
# 0 عادي، 1 (>٥٥٪) المتجر يسحب كل ربع ساعة والنظام يخفف المهام، 2 (>٨٠٪) أخف أكثر.
import os,json,urllib.request,subprocess,datetime
T=subprocess.run(['python3','cf/tok.py'],input=os.environ['RAW_TOK'],capture_output=True,text=True).stdout.strip()
A=''.join(os.environ['RAW_ACC'].split()).strip('"')
os.environ['CLOUDFLARE_API_TOKEN']=T; os.environ['CLOUDFLARE_ACCOUNT_ID']=A
def gq(q):
  r=urllib.request.Request('https://api.cloudflare.com/client/v4/graphql',data=json.dumps({'query':q}).encode(),headers={'Authorization':'Bearer '+T,'Content-Type':'application/json'})
  return json.load(urllib.request.urlopen(r,timeout=60))['data']['viewer']['accounts'][0]
day=datetime.datetime.utcnow().strftime('%Y-%m-%d')
utc_h=datetime.datetime.utcnow().hour+datetime.datetime.utcnow().minute/60
d=gq('{viewer{accounts(filter:{accountTag:"%s"}){d1AnalyticsAdaptiveGroups(limit:20,filter:{date:"%s"}){sum{rowsRead rowsWritten} dimensions{databaseId}} workersInvocationsAdaptive(limit:20,filter:{date:"%s"}){sum{requests} dimensions{scriptName}}}}}'%(A,day,day))
rr=sum(x['sum']['rowsRead'] for x in d['d1AnalyticsAdaptiveGroups'])
rw=sum(x['sum']['rowsWritten'] for x in d['d1AnalyticsAdaptiveGroups'])
rq=sum(x['sum']['requests'] for x in d['workersInvocationsAdaptive'])
# نسبة اليوم الحالية، وتوقّع نهاية اليوم بنفس السرعة
frac=max(rr/5e6, rw/1e5, rq/1e5)
proj=frac*24/max(utc_h,1)
lvl=2 if (frac>0.8 or proj>1.6) else 1 if (frac>0.55 or proj>1.0) else 0
print(f'{day} {utc_h:.1f}h UTC  rowsRead={rr:,} ({rr/5e6:.0%})  rowsWritten={rw:,} ({rw/1e5:.0%})  requests={rq:,} ({rq/1e5:.0%})  projected={proj:.0%}  -> saver={lvl}')
for x in d['d1AnalyticsAdaptiveGroups']: print('  db',x['dimensions']['databaseId'][:8],x['sum'])
for x in d['workersInvocationsAdaptive']: print('  worker',x['dimensions']['scriptName'],x['sum'])
def ex(db,sql):
  r=subprocess.run(['npx','-y','wrangler@3','d1','execute',db,'--remote','--command',sql],capture_output=True,text=True,timeout=240)
  print(db, 'ok' if r.returncode==0 else 'FAIL '+(r.stdout+r.stderr)[-300:])
ex('hhshop',f"insert into settings(k,v) values('_saver','{lvl}') on conflict(k) do update set v=excluded.v")
ex('sinai',f"insert into kv(k,v) values('SAVER','{lvl}') on conflict(k) do update set v=excluded.v")
# حجم القواعد (حد ٥٠٠ م.ب لكل قاعدة بالخطة المجانية)
r=urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{A}/d1/database',headers={'Authorization':'Bearer '+T})
for x in json.load(urllib.request.urlopen(r))['result']:
  mb=(x.get('file_size') or 0)/1e6; warn=' ⚠️ قريبة من الحد' if mb>420 else ''
  print(f"  size {x['name']}: {mb:.0f} MB{warn}")
  if warn and x['name']=='hhshop': ex('hhshop',f"insert into log(at,msg) values({int(datetime.datetime.utcnow().timestamp()*1000)},'تنبيه: قاعدة بيانات المتجر {mb:.0f} م.ب من ٥٠٠')")
