"""يضيف/يحدّث سكربت v229 (من src/v229*.js) بآخر index.html"""
import re,glob
p='index.html'; s=open(p,encoding='utf-8').read()
js='\n'.join(open(f,encoding='utf-8').read() for f in sorted(glob.glob('src/v229*.js')))
tag='<script id="v229">\n'+js+'\n</script>'
if '<script id="v229">' in s: s=re.sub(r'<script id="v229">.*?</script>',lambda m:tag,s,flags=re.S)
else:
    i=s.rfind('</body></html>'); s=s[:i]+tag+'\n'+s[i:]
open(p,'w',encoding='utf-8').write(s); print('ok',len(s))
