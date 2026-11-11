"""يضيف/يحدّث سكربت v216 (من src/v216*.js) بآخر index.html"""
import re, glob
p = 'index.html'; s = open(p, encoding='utf-8').read()
js = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob('src/v216*.js')))
tag = '<script id="v216">\n' + js + '\n</script>'
if '<script id="v216">' in s: s = re.sub(r'<script id="v216">.*?</script>', lambda m: tag, s, flags=re.S)
else:
    i = s.rfind('</body></html>'); s = s[:i] + tag + '\n' + s[i:]
open(p, 'w', encoding='utf-8').write(s); print('ok', len(s))
