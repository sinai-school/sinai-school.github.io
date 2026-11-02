import os,json,urllib.request,subprocess
T=subprocess.run(['python3','cf/tok.py'],input=os.environ['RAW_TOK'],capture_output=True,text=True).stdout.strip()
A=''.join(os.environ['RAW_ACC'].split()).strip('"')
os.environ['CLOUDFLARE_API_TOKEN']=T; os.environ['CLOUDFLARE_ACCOUNT_ID']=A
def gq(q):
  r=urllib.request.Request('https://api.cloudflare.com/client/v4/graphql',data=json.dumps({'query':q}).encode(),headers={'Authorization':'Bearer '+T,'Content-Type':'application/json'})
  return json.load(urllib.request.urlopen(r))
d=gq('{viewer{accounts(filter:{accountTag:"%s"}){d1AnalyticsAdaptiveGroups(limit:50,filter:{date_geq:"2026-11-02"}){sum{readQueries rowsRead rowsWritten} dimensions{date databaseId datetimeHour}}}}}'%A)
print(json.dumps(d)[:3000])
def sh(c): print('$',c); print(subprocess.run(c,shell=True,capture_output=True,text=True,timeout=300).stdout[-3000:])
sh("npx -y wrangler@3 d1 execute hhshop --remote --json --command \"select at,msg from log order by at desc limit 12\"")
sh("npx -y wrangler@3 d1 execute hhshop --remote --json --command \"select k,substr(v,1,80) v from settings where k like '\\_%' escape '\\'\"")
sh("npx -y wrangler@3 d1 execute hhshop --remote --json --command \"select max(id) mx, count(*) n from msgs\"")
sh("curl -s -o /dev/null -w 'tg %{http_code}\\n' -A 'Mozilla/5.0' https://t.me/s/husseinhandh")
sh("curl -s -A 'Mozilla/5.0' https://t.me/s/husseinhandh | grep -o 'data-post=\"husseinhandh/[0-9]*' | tail -3")
