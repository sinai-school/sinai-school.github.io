#!/usr/bin/env bash
# اختبار ترقية حقيقي على محاكي: النسخة الحالية ← النسخة المدوّرة ← (محاولة نسخة «مزيّفة» بالمفتاح القديم) ← نسخة مدوّرة أحدث
API="$1"; D=/tmp/rot; R="$D/res-$API.txt"; P=iq.sinai.school
ins() { adb install -r "$1" 2>&1 | tr '\n' ' ' | cut -c1-200; }
ver() { adb shell dumpsys package $P | grep -m1 versionCode | sed 's/ *minSdk.*//' | tr -d ' \r'; }
{
  echo "api=$API"
  adb uninstall $P >/dev/null 2>&1 || true
  echo "1 install CURRENT release: $(ins $D/cur.apk) | $(ver)"
  echo "2 update to ROTATED (new secret key): $(ins $D/r1.apk) | $(ver)"
  echo "3 update with OLD-KEY-ONLY apk (what a forger could make): $(ins $D/att.apk) | $(ver)"
  echo "4 update to newer ROTATED: $(ins $D/r3.apk) | $(ver)"
  adb shell monkey -p $P -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 12
  echo "5 app running after updates: pid=$(adb shell pidof $P | tr -d '\r')"
  echo "6 fresh install of ROTATED on clean device: $(adb uninstall $P >/dev/null 2>&1; ins $D/r3.apk) | $(ver)"
} > "$R" 2>&1
cat "$R"
