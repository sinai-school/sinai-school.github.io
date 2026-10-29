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
mk(){ printf 'name = "hh-shop"\nmain = "worker.js"\ncompatibility_date = "2024-09-23"\nworkers_dev = true\nrules = [{ type = "Text", globs = ["**/*.html", "**/*.php", "**/*.txt"], fallthrough = true }]\n[[d1_databases]]\nbinding = "DB"\ndatabase_name = "hhshop"\ndatabase_id = "%s"\n[triggers]\ncrons = ["*/3 * * * *"]\n%s' "$DBID" "$1" > wrangler.toml; }
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
echo "--- host upload"
$W d1 execute hhshop --remote --command "create table if not exists vault (k text primary key, v text)" -y >/dev/null 2>&1
KEY=$($W d1 execute hhshop --remote --json --command "select v from vault where k='cp'" 2>/dev/null | python3 -c 'import sys,json
try:
  r=json.load(sys.stdin)[0]["results"];print(r[0]["v"] if r else "")
except Exception: print("")')
for H in handhst.com:2083 142.132.255.23:2083; do echo "reach $H: $(curl -sk -o /dev/null -m 15 -w '%{http_code}' https://$H/)"; done
if [ -z "$KEY" ]; then
  openssl genrsa -out /tmp/k.pem 2048 2>/dev/null
  $W d1 execute hhshop --remote --command "insert or replace into vault(k,v) values('cp','$(base64 -w0 /tmp/k.pem)')" -y >/dev/null 2>&1
  echo "PUBKEY:$(openssl rsa -in /tmp/k.pem -pubout 2>/dev/null | base64 -w0)"
elif [ -f box.b64 ]; then
  echo "$KEY" | base64 -d > /tmp/k.pem
  CP=$(base64 -d box.b64 | openssl pkeyutl -decrypt -inkey /tmp/k.pem -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 2>/dev/null)
  rm -f /tmp/k.pem
  [ -n "$CP" ] && echo "box: ok" || echo "box: decrypt failed"
  U=${CP%%:*}; PW=${CP#*:}; OKU=0
  for H in handhst.com:2083 142.132.255.23:2083; do
    rm -f /tmp/cj
    L=$(curl -sk -m 40 -c /tmp/cj -b /tmp/cj "https://$H/login/?login_only=1" --data-urlencode "user=$U" --data-urlencode "pass=$PW")
    TOKP=$(echo "$L" | python3 -c 'import sys,json
try: j=json.load(sys.stdin);print(j.get("security_token","") if j.get("status")==1 else "")
except Exception: print("")')
    echo "login $H: $( [ -n "$TOKP" ] && echo ok || echo "$L" | python3 -c 'import sys,json
try: j=json.load(sys.stdin);print("fail",j.get("message") or j.get("status"))
except Exception: print("fail not-json")')"
    [ -z "$TOKP" ] && continue
    R=$(curl -sk -m 40 -b /tmp/cj "https://$H$TOKP/execute/Fileman/get_file_content?dir=%2Fhome%2Fhandhstc%2Fpublic_html&file=.htaccess")
    echo "$R" | python3 -c '
import sys,json,re
try: j=json.load(sys.stdin)
except Exception: print("get htaccess not json"); sys.exit()
old=(j.get("data") or {}).get("content") or ""
print("get htaccess status",j.get("status"),len(old))
new=open("host/htaccess.txt").read()
if "# HH-BEGIN" in old: out=re.sub(r"# HH-BEGIN.*?# HH-END\n?",lambda m:new,old,flags=re.S)
else:
  keep="".join(re.findall(r"# php -- BEGIN cPanel-generated handler.*?# php -- END cPanel-generated handler[^\n]*\n?",old,flags=re.S))
  out=new+("\n"+keep if keep else "")
open("/tmp/ht.new","w").write(out)
print("htaccess keeps cpanel handler:", "cPanel-generated" in out)'
    [ -f /tmp/ht.new ] || continue
    for F in index.php .htaccess; do
      SRC=host/index.php; [ "$F" = ".htaccess" ] && SRC=/tmp/ht.new
      curl -sk -m 60 -b /tmp/cj "https://$H$TOKP/execute/Fileman/save_file_content" --data-urlencode "dir=/home/handhstc/public_html" --data-urlencode "file=$F" --data-urlencode "content@$SRC" | python3 -c 'import sys,json
try: j=json.load(sys.stdin);print("save",sys.argv[1],"status",j.get("status"),j.get("errors") or "")
except Exception: print("save",sys.argv[1],"not json")' "$F" | tee -a /tmp/saves
    done
    curl -sk -m 20 -b /tmp/cj "https://$H$TOKP/logout/" -o /dev/null
    grep -q "status 1" /tmp/saves && OKU=1
    break
  done
  rm -f /tmp/cj
  PW=""
  [ "$OKU" = 1 ] && $W d1 execute hhshop --remote --command "delete from vault where k='cp'" -y >/dev/null 2>&1 && echo "uploaded; key deleted"
  CP=""
  sleep 3
  curl -s -D - -o /dev/null https://handhst.com/ | grep -i 'etag\|x-hh' | tr -d '\r'
  curl -s -D - -o /dev/null https://handhst.com/ | grep -i 'etag\|x-hh' | tr -d '\r'
  for i in 1 2 3; do curl -s -o /dev/null -w "home %{time_total}s\n" https://handhst.com/; done
fi
echo "--- handhst.com check"
for u in / /p/s001 /c/%D8%B3%D9%85%D8%A7%D8%B9%D8%A7%D8%AA /contact /admin /robots.txt /sitemap.xml; do
  curl -sS -o /tmp/b -D /tmp/h -w "$u -> %{http_code} %{time_total}s %{size_download}B\n" -m 30 -H 'accept-encoding: gzip' "https://handhst.com$u" 2>&1; grep -i '^x-hh\|^content-type\|^content-encoding' /tmp/h | tr -d '\r' | tr '\n' ' '; echo
done
curl -s https://handhst.com/ | grep -o 'HHAPI=[^<]*\|canonical" href="[^"]*' | head -3
curl -s https://handhst.com/p/s001 | grep -o '<title>[^<]*' | head -1
echo "http->https: $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' http://handhst.com/)"
echo "www: $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' https://www.handhst.com/x)"
for i in 1 2 3; do curl -s -o /dev/null -w "repeat home %{time_total}s\n" https://handhst.com/; done
curl -s -o /dev/null -w "worker data %{time_total}s\n" https://hh-shop.7svyn82yzr.workers.dev/api/data
curl -s -o /dev/null -w "options %{http_code}\n" -X OPTIONS -H 'origin: https://handhst.com' -H 'access-control-request-headers: authorization' https://hh-shop.7svyn82yzr.workers.dev/api/admin/state
curl -s https://handhst.com/.hhcache/ -o /dev/null -w "cache dir %{http_code}\n"
