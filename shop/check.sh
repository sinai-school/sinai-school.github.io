#!/bin/bash
sleep 60
echo "--- check"
D=https://hh-shop.7svyn82yzr.workers.dev
curl -s "$D/api/data" | python3 -c '
import sys,json;d=json.load(sys.stdin);p=d["p"]
print("products",len(p),"noimg",sum(1 for x in p if not x["img"]),"from",sum(1 for x in p if x.get("from")))
print("cheap",[ (x["name"],x["price"]) for x in p if x["price"]<3000][:10])
print("dji",[ (x["name"],x["price"]) for x in p if "dji" in x["name"].lower()])'
for u in / /p/tg28979 /contact /admin /robots.txt /sitemap.xml /hh7c1f0e5a9b2d4c3e8f6a1b0d9c2e7f4.txt; do
  curl -sS -o /dev/null -D /tmp/h -w "handhst$u -> %{http_code} %{time_total}s %{size_download}B " -m 30 -H 'accept-encoding: gzip' "https://handhst.com$u"; grep -i '^x-hh' /tmp/h | tr -d '\r'; echo
done
curl -s https://handhst.com/ | grep -o 'HHAPI=[^<]*' | head -1
curl -s https://handhst.com/p/tg28979 | grep -o '<title>[^<]*' | head -1
echo "http: $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' http://handhst.com/)"
for i in 1 2 3; do curl -s -o /dev/null -w "home %{time_total}s\n" https://handhst.com/; done
echo "img: $(curl -s -o /dev/null -w '%{http_code} %{time_total}s %{content_type}' $D/img/t30448)"
echo "--- new checks"
curl -s -o /dev/null -w "ev %{http_code}\n" -A "Mozilla/5.0 test" -X POST -d '{"e":"q","v":"checkrun1","q":"check","n":1}' $D/api/ev
echo "v: $(curl -s $D/api/v)"
echo "hostv: $(curl -s $D/host/v)"
curl -s -D - -o /dev/null https://handhst.com/ | grep -i 'etag\|x-hh' | tr -d '\r'
echo "logo: $(curl -s -o /tmp/lg -w '%{http_code} %{content_type} %{size_download}' $D/img/logo)"; python3 -c "
import struct;d=open('/tmp/lg','rb').read()
i=2
while i<len(d):
  if d[i]!=0xFF: break
  m=d[i+1];l=struct.unpack('>H',d[i+2:i+4])[0]
  if m in (0xC0,0xC2): print('logo size',struct.unpack('>HH',d[i+5:i+9])); break
  i+=2+l" 2>/dev/null
curl -s $D/ | grep -o '<title>[^<]*\|hhd' | head -3
curl -s "$D/sitemap.xml" | grep -o '<loc>' | wc -l
echo "--- live pages"
mkdir -p out/live
curl -s "$D/" -o out/live/home.html
curl -s "$D/admin" -o out/live/admin.html
P=$(python3 -c "import json,sys;d=json.load(open('out/live/d.json')) if False else None" 2>/dev/null; curl -s $D/api/data | python3 -c "import sys,json;d=json.load(sys.stdin);print(' '.join(p['id'] for p in d['p'][:3]))")
for id in $P; do curl -s "$D/p/$id" -o out/live/p_$id.html; done
for k in $(curl -s $D/api/data | python3 -c "import sys,json;d=json.load(sys.stdin);print(' '.join([p['img'] for p in d['p'][:14] if p['img']]+['logo']))"); do curl -s -o out/live/$k.jpg $D/img/$k; done
ls out/live | wc -l
