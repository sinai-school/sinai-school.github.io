"""يضيف/يحدّث طبقة التنسيق v228 (src/v228-theme.css) كآخر <style> بالصفحة"""
import re
p='index.html'; s=open(p,encoding='utf-8').read()
css=open('src/v228-theme.css',encoding='utf-8').read()
tag='<style id="v228">\n'+css+'</style>'
if '<style id="v228">' in s: s=re.sub(r'<style id="v228">.*?</style>',lambda m:tag,s,flags=re.S)
else:
    i=s.rfind('</body></html>'); s=s[:i]+tag+'\n'+s[i:]
open(p,'w',encoding='utf-8').write(s); print('ok',len(s))
