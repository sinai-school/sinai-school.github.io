import os,json,urllib.request,subprocess
T=subprocess.run(['python3','cf/tok.py'],input=os.environ['RAW_TOK'],capture_output=True,text=True).stdout.strip()
A=''.join(os.environ['RAW_ACC'].split()).strip('"')
def gq(q):
  r=urllib.request.Request('https://api.cloudflare.com/client/v4/graphql',data=json.dumps({'query':q}).encode(),headers={'Authorization':'Bearer '+T,'Content-Type':'application/json'})
  return json.load(urllib.request.urlopen(r))
def get(p):
  r=urllib.request.Request('https://api.cloudflare.com/client/v4/accounts/'+A+p,headers={'Authorization':'Bearer '+T})
  return json.load(urllib.request.urlopen(r))
dbs={x['uuid']:x['name'] for x in get('/d1/database')['result']}
print('DBS',dbs)
d=gq('{viewer{accounts(filter:{accountTag:"%s"}){d1AnalyticsAdaptiveGroups(limit:200,filter:{date_geq:"2026-10-27"},orderBy:[date_ASC]){sum{readQueries writeQueries rowsRead rowsWritten} dimensions{date databaseId}}}}}'%A)
try:
  for r in d['data']['viewer']['accounts'][0]['d1AnalyticsAdaptiveGroups']: print('D1',r['dimensions']['date'],dbs.get(r['dimensions']['databaseId']),r['sum'])
except Exception: print(json.dumps(d)[:1500])
d=gq('{viewer{accounts(filter:{accountTag:"%s"}){workersInvocationsAdaptive(limit:200,filter:{date_geq:"2026-10-30"},orderBy:[date_ASC]){sum{requests errors} dimensions{date scriptName}}}}}'%A)
try:
  for r in d['data']['viewer']['accounts'][0]['workersInvocationsAdaptive']: print('W',r['dimensions']['date'],r['dimensions']['scriptName'],r['sum'])
except Exception: print(json.dumps(d)[:1500])
# top queries by rows read (d1 query insights)
for uid,name in dbs.items():
  d=gq('{viewer{accounts(filter:{accountTag:"%s"}){d1QueriesAdaptiveGroups(limit:15,filter:{date_geq:"2026-11-01",databaseId:"%s"},orderBy:[sum_rowsRead_DESC]){sum{rowsRead rowsReturned} count dimensions{query}}}}}'%(A,uid))
  try:
    for r in d['data']['viewer']['accounts'][0]['d1QueriesAdaptiveGroups']: print('Q',name,r['sum']['rowsRead'],r['count'],r['dimensions']['query'][:220].replace('\n',' '))
  except Exception: print(name,json.dumps(d)[:800])
