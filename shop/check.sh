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
