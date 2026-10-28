#!/bin/bash
# نشر متجر H&H على Cloudflare
cd shop
W="npx -y wrangler@3"
API=https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID
AH="Authorization: Bearer $CLOUDFLARE_API_TOKEN"
SUB=$(curl -s -H "$AH" $API/workers/subdomain | python3 -c 'import sys,json;print((json.load(sys.stdin).get("result") or {}).get("subdomain") or "")')
echo "subdomain=$SUB"
$W d1 create hhshop 2>&1 | tail -2
DBID=$($W d1 list --json 2>/dev/null | python3 -c 'import sys,json;print([d["uuid"] for d in json.load(sys.stdin) if d["name"]=="hhshop"][0])')
echo "db=$DBID"
mk(){ printf 'name = "hh-shop"\nmain = "worker.js"\ncompatibility_date = "2024-09-23"\nworkers_dev = true\nrules = [{ type = "Text", globs = ["**/*.html"], fallthrough = true }]\n[[d1_databases]]\nbinding = "DB"\ndatabase_name = "hhshop"\ndatabase_id = "%s"\n[triggers]\ncrons = ["*/3 * * * *"]\n%s' "$DBID" "$1" > wrangler.toml; }
$W d1 execute hhshop --remote --file schema.sql -y 2>&1 | tail -3
if [ ! -f ../out/seeded ]; then
  N=$($W d1 execute hhshop --remote --json --command "select count(*) n from products" 2>/dev/null | python3 -c 'import sys,json;print(json.load(sys.stdin)[0]["results"][0]["n"])')
  echo "products before seed: $N"
  if [ "$N" = "0" ]; then
    $W d1 execute hhshop --remote --file seed.sql -y 2>&1 | tail -2
    $W d1 execute hhshop --remote --file msgs.sql -y 2>&1 | tail -2
  fi
fi
B=$($W d1 execute hhshop --remote --json --command "select count(*) n from settings where k='_built'" 2>/dev/null | python3 -c 'import sys,json;print(json.load(sys.stdin)[0]["results"][0]["n"])')
echo "built=$B"
if [ "$B" = "0" ]; then $W d1 execute hhshop --remote --file build.sql -y 2>&1 | tail -2; $W d1 execute hhshop --remote --command "insert or ignore into settings(k,v) values('_built','1')" -y >/dev/null 2>&1; fi
mk $'[ai]\nbinding = "AI"\n'
if ! $W deploy 2>&1 | tee dep.log | tail -8; then :; fi
if ! grep -q "Current Version ID" dep.log; then
  echo "== AI binding failed, deploying without AI"; cat dep.log | grep -i error | head -5
  mk ""; $W deploy 2>&1 | tail -8
fi
grep -q "AI" wrangler.toml && echo "AI=on" || echo "AI=off"
URL=https://hh-shop.$SUB.workers.dev
echo "url=$URL"
sleep 6
echo "home: $(curl -s -o /dev/null -w '%{http_code}' $URL/)"
echo "data: $(curl -s $URL/api/data | head -c 300)"
$W d1 execute hhshop --remote --json --command "select (select count(*) from products) p,(select count(*) from msgs) m,(select count(*) from imgs) i,(select count(*) from imgq) q,(select count(*) from products where ai is not null and ai not like '%err%') ai" 2>/dev/null | python3 -c 'import sys,json;print("db",json.load(sys.stdin)[0]["results"])'
$W d1 execute hhshop --remote --json --command "select at,msg from log order by at desc limit 8" 2>/dev/null | python3 -c 'import sys,json;print("log",json.load(sys.stdin)[0]["results"])'
