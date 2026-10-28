#!/bin/bash
# probe: collects info into out/
mkdir -p out/tg
L=out/probe.txt
API=https://api.cloudflare.com/client/v4
AH="Authorization: Bearer $CLOUDFLARE_API_TOKEN"
echo "verify: $(curl -s -H "$AH" $API/user/tokens/verify | head -c 300)" >> $L
echo "zones: $(curl -s -H "$AH" "$API/zones?per_page=50" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d.get("success"),d.get("errors"),[(z["name"],z["status"],z["id"],z.get("name_servers")) for z in d.get("result") or []])')" >> $L
echo "ai: $(curl -s -H "$AH" "$API/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/models/search?per_page=1" | head -c 300)" >> $L
echo "r2: $(curl -s -H "$AH" "$API/accounts/$CLOUDFLARE_ACCOUNT_ID/r2/buckets" | head -c 300)" >> $L
echo "kv: $(curl -s -H "$AH" "$API/accounts/$CLOUDFLARE_ACCOUNT_ID/storage/kv/namespaces" | head -c 300)" >> $L
echo "workers: $(curl -s -H "$AH" "$API/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts" | python3 -c 'import sys,json;d=json.load(sys.stdin);print([s["id"] for s in d.get("result") or []])')" >> $L
echo "registrar: $(curl -s -H "$AH" "$API/accounts/$CLOUDFLARE_ACCOUNT_ID/registrar/domains" | head -c 600)" >> $L
echo "--- dig" >> $L
dig +short NS handhst.com >> $L 2>&1; dig +short A handhst.com >> $L 2>&1
curl -sL -m 20 http://handhst.com/ -o out/handhst.html; echo "--- whois" >> $L
(whois handhst.com 2>&1 || true) | grep -iE 'registrar:|creation|expir|name server|status|No match' | head -20 >> $L
echo "--- http" >> $L
curl -sI -m 15 http://handhst.com | head -5 >> $L 2>&1
curl -s -m 30 https://h-and-h-mobile.netlify.app/ -o out/netlify.html
curl -sL -m 30 "https://docs.google.com/spreadsheets/d/1pSzsdhdUhSc_3hMHwF7OCsfUrvpO2xvU/gviz/tq?tqx=out:csv&headers=1" -o out/sheet.csv
ls -la out >> $L
U="https://t.me/s/husseinhandh"; i=0
while [ $i -lt 80 ]; do
  curl -s -m 30 -A "Mozilla/5.0" "$U" -o out/tg/p$i.html
  B=$(python3 -c 'import re,sys;s=open(sys.argv[1]).read();m=re.findall(r"data-post=\\?\"husseinhandh/(\d+)",s);print(min(map(int,m)) if m else "")' out/tg/p$i.html)
  echo "page $i before=$B size=$(wc -c < out/tg/p$i.html)" >> $L
  [ -z "$B" ] && break
  U="https://t.me/s/husseinhandh?before=$B"; i=$((i+1))
done
