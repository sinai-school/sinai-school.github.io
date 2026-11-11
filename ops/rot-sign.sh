#!/usr/bin/env bash
# يوقّع APK بتدوير المفتاح: التوقيع القديم (v1/v2) يبقى بالمفتاح القديم حتى الأجهزة الحالية وأندرويد ٨ وما دون تقبل التحديث،
# وتوقيع v3 بالمفتاح الجديد السري + «سلسلة إثبات» (lineage) موقّعة بالقديم — أندرويد ٩ وما فوق يقبله كتحديث عادي وبعدها ما يقبل إلا الجديد.
# الاستعمال: rot-sign.sh <مجلد المفتاح الجديد> <in.apk> <out.apk>
set -euo pipefail
K="$1"; IN="$2"; OUT="$3"
BT=$(ls -d "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)
OLD=android/sinai.keystore; OP=sinai-school; NP=$(cat "$K/new.pass")
if [ ! -f "$K/lineage" ]; then
  "$BT/apksigner" rotate --out "$K/lineage" --old-signer --ks "$OLD" --ks-key-alias sinai --ks-pass "pass:$OP" --key-pass "pass:$OP" \
    --new-signer --ks "$K/new.jks" --ks-key-alias sinai2 --ks-pass "pass:$NP" --key-pass "pass:$NP"
fi
"$BT/apksigner" sign --ks "$OLD" --ks-key-alias sinai --ks-pass "pass:$OP" --key-pass "pass:$OP" \
  --next-signer --ks "$K/new.jks" --ks-key-alias sinai2 --ks-pass "pass:$NP" --key-pass "pass:$NP" \
  --lineage "$K/lineage" --rotation-min-sdk-version 28 --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true \
  --min-sdk-version 21 --out "$OUT" "$IN"
"$BT/apksigner" verify --min-sdk-version 21 "$OUT"
