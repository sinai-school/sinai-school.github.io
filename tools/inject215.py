"""يضيف/يحدّث سكربت v215 (من src/v215*.js) بآخر index.html — الشعارات تندمج داخل الصفحة (تفتح بدون إنترنت حتى بالتطبيق)"""
import re, glob, base64
p = 'index.html'; s = open(p, encoding='utf-8').read()
js = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob('src/v215*.js')))
du = lambda f, m: 'data:%s;base64,%s' % (m, base64.b64encode(open(f, 'rb').read()).decode())
js = js.replace('__LOGO_M__', du('img/logo_min_ui.webp', 'image/webp')).replace('__LOGO_S__', du('img/logo_s_ui.webp', 'image/webp'))
tag = '<script id="v215">\n' + js + '\n</script>'
if '<script id="v215">' in s: s = re.sub(r'<script id="v215">.*?</script>', lambda m: tag, s, flags=re.S)
else:
    i = s.rfind('</body></html>'); s = s[:i] + tag + '\n' + s[i:]
open(p, 'w', encoding='utf-8').write(s); print('ok', len(s))
