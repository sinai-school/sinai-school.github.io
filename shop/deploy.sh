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
echo "--- admin password"
if [ -f pwreset.pub ]; then
  python3 - > /tmp/pwset.sql <<'P'
import secrets,hashlib,json,subprocess,base64
A='ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
pw='HH-'+''.join(secrets.choice(A) for _ in range(4))+'-'+''.join(secrets.choice('23456789') for _ in range(4))
salt=secrets.token_hex(16)
h=salt+pw
for _ in range(2000): h=hashlib.sha256((h+salt).encode()).hexdigest()
enc=subprocess.run(['openssl','pkeyutl','-encrypt','-pubin','-inkey','pwreset.pub','-pkeyopt','rsa_padding_mode:oaep','-pkeyopt','rsa_oaep_md:sha256'],input=pw.encode(),capture_output=True).stdout
open('/tmp/pwenc.txt','w').write(base64.b64encode(enc).decode())
print("insert into settings(k,v) values('salt','%s'),('pw','%s') on conflict(k) do update set v=excluded.v; delete from settings where k='_fails';"%(json.dumps(salt),json.dumps(h)))
P
  $W d1 execute hhshop --remote --file /tmp/pwset.sql -y >/dev/null 2>&1 && echo "PWENC:$(cat /tmp/pwenc.txt)"
  rm -f /tmp/pwset.sql /tmp/pwenc.txt
fi
echo "--- map link"
if [ -f maplink.txt ]; then
  F=$(curl -sL -o /tmp/map.html -m 25 -w '%{url_effective}' -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' "$(cat maplink.txt)")
  echo "map final: ${F:0:240}"
  LL=$(F="$F" python3 -c '
import os,re,urllib.parse
f=urllib.parse.unquote(urllib.parse.unquote(os.environ["F"]))
h=open("/tmp/map.html",errors="ignore").read()
m=re.search(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)",f) or re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)",f) or re.search(r"[?&](?:q|ll|query)=(-?\d+\.\d+),(-?\d+\.\d+)",f) or re.search(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)",h) or re.search(r"center=(-?\d+\.\d+)%2C(-?\d+\.\d+)",h) or re.search(r"APP_INITIALIZATION_STATE=\[\[\[[\d.]+,(-?[\d.]+),(-?[\d.]+)\]",h)
if m:
  a,b=float(m.group(1)),float(m.group(2))
  if 38<a<49: a,b=b,a
  if 29<a<38 and 38<b<49: print(a,b)')
  Q=$(F="$F" python3 -c 'import os,urllib.parse;print(urllib.parse.parse_qs(urllib.parse.urlparse(os.environ["F"]).query).get("q",[""])[0].replace("\"",""))')
  echo "map q: $Q"
  [ -n "$Q" ] && $W d1 execute hhshop --remote --command "insert into settings(k,v) values('mapQ','\"$Q\"'),('mapUrl','\"$(cat maplink.txt)\"') on conflict(k) do update set v=excluded.v" -y >/dev/null 2>&1 && echo "mapQ saved"
  if [ -z "$LL" ]; then
    FT=$(echo "$F" | grep -o 'ftid=0x[0-9a-f]*:0x[0-9a-f]*' | cut -d: -f2)
    if [ -n "$FT" ]; then CID=$(python3 -c "print(int('$FT',16))"); echo "cid: $CID"
      for U in "https://maps.google.com/?cid=$CID" "https://www.google.com/maps?cid=$CID&hl=ar" "https://maps.google.com/maps?cid=$CID&output=embed"; do
        F2=$(curl -sL -o /tmp/m2.html -m 25 -w '%{url_effective}' -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' "$U")
        LL=$(F2="$F2" python3 -c '
import os,re,urllib.parse
f=urllib.parse.unquote(os.environ["F2"]);h=open("/tmp/m2.html",errors="ignore").read()
pats=[r"!3d(3\d\.\d{4,})!4d(4\d\.\d{4,})",r"@(3\d\.\d{4,}),(4\d\.\d{4,})",r"\[null,null,(3\d\.\d{4,}),(4\d\.\d{4,})\]",r"ll=(3\d\.\d{4,}),(4\d\.\d{4,})",r"center=(3\d\.\d{4,})(?:%2C|,)(4\d\.\d{4,})",r"\[(3\d\.\d{4,}),(4\d\.\d{4,})\]"]
for t in (f,h):
  for pt in pats:
    m=re.search(pt,t)
    if m: print(m.group(1),m.group(2)); raise SystemExit')
        echo "try $U -> ${LL:-none}"
        [ -n "$LL" ] && break
      done
    fi
  fi
  echo "map coords: $LL"
  if [ -n "$LL" ]; then
    LA=${LL% *}; LO=${LL#* }; MU=$(cat maplink.txt)
    $W d1 execute hhshop --remote --command "insert into settings(k,v) values('mapLat','\"$LA\"'),('mapLng','\"$LO\"'),('mapUrl','\"$MU\"') on conflict(k) do update set v=excluded.v; update settings set v=cast(v as integer)+1 where k='_ver'" -y >/dev/null 2>&1 && echo "map saved"
    curl -s -o /dev/null https://handhst.com/__hh/purge
  fi
fi
echo "--- dump"
$W d1 execute hhshop --remote --json --command "select p.id, p.src, p.auto, p.ov, p.ai, m.txt from products p left join msgs m on m.id=p.post" 2>/dev/null > ../out/prods.json; python3 -c "import json;print('dump',len(json.load(open('../out/prods.json'))[0]['results']))"
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
