#!/usr/bin/env python3
"""Build the portal app (index.html) from the published school-system page.
usage: python3 tools/build.py SOURCE.html [OUT_DIR]
Prints CHANGED or SAME (compares the embedded timetable snapshot + app code)."""
import sys, re, json, hashlib, os
src = open(sys.argv[1], encoding='utf-8').read()
out = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m = re.search(r'<script type="application/json" id="snap">(.*?)</script>', src, re.S)
if not m or not re.search(r'<script id="appjs">', src): sys.exit('ERROR: not the school system page')
snap = json.loads(m.group(1).replace('<\\/', '</'))
if not snap or not snap.get('cells'): sys.exit('ERROR: no published timetable in the page')
SKEL = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#faf9f5;color:#141413}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
if not src.lstrip().lower().startswith('<!doctype'):
    src = SKEL + src.strip() + '\n</body></html>'
ver = '%s-%s' % (snap.get('ver', ''), snap.get('at', ''))
head = ('<script>window.OFFLINE_COPY=1;document.documentElement.classList.add("offline")</script>\n'
  '<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#0c362f"><link rel="apple-touch-icon" href="icon-512.png"><link rel="icon" href="icon-192.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="إعدادية سيناء للبنين"><meta name="application-name" content="إعدادية سيناء للبنين">'
  '<script>window.APP_VER=' + json.dumps(ver) + ";if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('sw.js').then(function(r){r.update()}).catch(function(){})});navigator.serviceWorker&&navigator.serviceWorker.addEventListener('controllerchange',function(){if(!window.__rl){window.__rl=1;location.reload()}});</script>\n")
SEO = ('<meta name="google-site-verification" content="h_644To8ATCnToP7enUdCGD_zSp2p4-oXK58LGM7bBE" /><meta name="description" content="إعدادية سيناء للبنين — بغداد، الرصافة الأولى. التطبيق والنظام الرسمي للمدرسة: جدول الدروس، بوابة المدرسين والطلاب، التبليغات. تطبيق إعدادية سيناء للبنين للأندرويد والهواوي والآيفون.">'
  '<meta name="keywords" content="إعدادية سيناء للبنين, اعدادية سيناء للبنين, اعدادية سيناء, ثانوية سيناء, تطبيق اعدادية سيناء, نظام اعدادية سيناء, جدول اعدادية سيناء, الرصافة الأولى, بغداد">'
  '<link rel="canonical" href="https://sinai-school.github.io/"><meta name="robots" content="index,follow">'
  '<meta property="og:type" content="website"><meta property="og:site_name" content="إعدادية سيناء للبنين"><meta property="og:title" content="إعدادية سيناء للبنين — التطبيق والنظام الرسمي"><meta property="og:description" content="جدول الدروس وبوابة المدرسين والطلاب لإعدادية سيناء للبنين — بغداد، الرصافة الأولى."><meta property="og:url" content="https://sinai-school.github.io/"><meta property="og:image" content="https://sinai-school.github.io/icon-512.png"><meta property="og:locale" content="ar_IQ">'
  '<script type="application/ld+json">' + json.dumps({"@context":"https://schema.org","@graph":[{"@type":"HighSchool","name":"إعدادية سيناء للبنين","alternateName":["اعدادية سيناء للبنين","ثانوية سيناء سابقاً","Sinai Preparatory School for Boys"],"url":"https://sinai-school.github.io/","logo":"https://sinai-school.github.io/icon-512.png","email":"senahighschoolforboys@gmail.com","telephone":"+9647703982020","address":{"@type":"PostalAddress","streetAddress":"النهضة، مجاور مركز شرطة باب الشيخ","addressLocality":"بغداد","addressCountry":"IQ"},"parentOrganization":{"@type":"GovernmentOrganization","name":"المديرية العامة لتربية بغداد الرصافة الأولى"}},{"@type":"MobileApplication","name":"تطبيق إعدادية سيناء للبنين","operatingSystem":"Android, HarmonyOS, iOS","applicationCategory":"EducationalApplication","url":"https://sinai-school.github.io/","downloadUrl":"https://github.com/sinai-school/sinai-school.github.io/releases/latest/download/sinai-school.apk","offers":{"@type":"Offer","price":"0","priceCurrency":"IQD"}}]}, ensure_ascii=False) + '</script>'
  '<noscript><h1>إعدادية سيناء للبنين</h1><p>التطبيق والنظام الرسمي لإعدادية سيناء للبنين (ثانوية سيناء سابقاً) — المديرية العامة لتربية بغداد الرصافة الأولى: جدول الدروس، بوابة المدرسين والطلاب، التبليغات. <a href="https://github.com/sinai-school/sinai-school.github.io/releases/latest/download/sinai-school.apk">تنزيل تطبيق الأندرويد</a></p></noscript>\n')
src = re.sub(r'<title>[^<]*</title>', '<title>إعدادية سيناء للبنين — التطبيق والنظام الرسمي</title>', src, count=1)
k = src.find('<title')
html = src[:k] + head + SEO + src[k:] if k >= 0 else head + SEO + src
def _fixhead(h):
    import re as _re
    ns = _re.search(r'<noscript>.*?</noscript>\n?', h, _re.S)
    nos = ns.group(0) if ns else ''
    if ns: h = h.replace(nos, '', 1)
    metas = ''.join(_re.findall(r'<meta name="google-site-verification"[^>]*>|<meta name="(?:description|keywords|robots)"[^>]*>|<link rel="canonical"[^>]*>|<meta property="og:[^>]*>|<script type="application/ld\+json">.*?</script>|<link rel="manifest"[^>]*>|<meta name="theme-color"[^>]*>|<link rel="apple-touch-icon"[^>]*>|<link rel="icon"[^>]*>|<meta name="(?:apple-mobile-web-app-capable|mobile-web-app-capable|apple-mobile-web-app-title|application-name)"[^>]*>', h, _re.S))
    for m in _re.findall(r'<meta name="google-site-verification"[^>]*>|<meta name="(?:description|keywords|robots)"[^>]*>|<link rel="canonical"[^>]*>|<meta property="og:[^>]*>|<script type="application/ld\+json">.*?</script>|<link rel="manifest"[^>]*>|<meta name="theme-color"[^>]*>|<link rel="apple-touch-icon"[^>]*>|<link rel="icon"[^>]*>|<meta name="(?:apple-mobile-web-app-capable|mobile-web-app-capable|apple-mobile-web-app-title|application-name)"[^>]*>', h, _re.S):
        h = h.replace(m, '', 1)
    t = _re.search(r'<title>[^<]*</title>', h)
    title = t.group(0) if t else ''
    if t: h = h.replace(title, '', 1)
    h = h.replace('</head>', title + metas + '</head>', 1)
    h = _re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + nos, h, count=1)
    return h
html = _fixhead(html)
_h8 = hashlib.sha1(re.sub(r'window\.APP_VER="[^"]*"', '', html).encode('utf-8')).hexdigest()[:8]
ver = ver + '-' + _h8
html = re.sub(r'window\.APP_VER="[^"]*"', 'window.APP_VER=' + json.dumps(ver).replace('\\', '\\\\'), html, count=1)
dst = os.path.join(out, 'index.html')
old = open(dst, encoding='utf-8').read() if os.path.exists(dst) else ''
strip = lambda h: re.sub(r'window\.APP_VER="[^"]*"', '', h)
if strip(old) == strip(html):
    print('SAME'); sys.exit(0)
open(dst, 'w', encoding='utf-8').write(html)
open(os.path.join(out, 'version.json'), 'w', encoding='utf-8').write(json.dumps({'v': ver}))
print('CHANGED', ver, len(html))
