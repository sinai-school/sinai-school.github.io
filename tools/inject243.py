"""v243: سكربت src/v243-fix.js بآخر index.html + استبدالات نصية بالكود الرئيسي (تتكرر بأمان)."""
import re
p='index.html'; s=open(p,encoding='utf-8').read()
GR='(n=>String(n||"").replace(/\\s+[\\u0621-\\u064A]\\s*$/,"").trim())'
R=[
 ('rep["«الصف»"]=s.s;', 'rep["«الصف»"]='+GR+'(s.s);'),
 ('LDRAFT=lInsert(L,"الطالب ("+s.n+") في الصف ("+s.s+")")', 'LDRAFT=lInsert(L,"الطالب ("+s.n+") في الصف ("+'+GR+'(s.s)+")")'),
 ('أن ولدكم الطالب ("+s.n+") في الصف ("+s.s+")', 'أن ولدكم الطالب ("+s.n+") في الصف ("+'+GR+'(s.s)+")'),
 ('${stIns(sigL).map(t=>t?esc(t):"&nbsp;").join("<br>")}', '${(window.sig243?sig243(sigL,L):stIns(sigL).map(t=>t?esc(t):"&nbsp;").join("<br>"))}'),
 ('if(/اعداد/.test(e))return"إعدادية";return"أخرى"}', 'if(/اعداد/.test(e))return"إعدادية";if(/متوسط/.test(e))return"متوسطة";if(/ابتدا/.test(e))return"ابتدائية";return"أخرى"}'),
 ('const EDU=["دكتوراه","ماجستير","دبلوم عالي","بكالوريوس","دبلوم","إعدادية","أخرى","غير محدد"];', 'const EDU=["دكتوراه","ماجستير","دبلوم عالي","بكالوريوس","دبلوم","إعدادية","متوسطة","ابتدائية","أخرى","غير محدد"];'),
 ('D.text("التوقيع",{sz:13,b:1,al:"c",x0:D.L,x1:D.L+sw});D.gap(2);D.text("المدير: فراس حسن كاظم",{sz:13,b:1,al:"c",x0:D.L,x1:D.L+sw});',
  '{const _sg=String(L.sig??L_SIG).split("\\n").filter(x=>x.trim());(_sg.length?_sg:["التوقيع"]).forEach((t,i)=>{if(i)D.gap(2);D.text(t,{sz:13,b:1,al:"c",x0:D.L,x1:D.L+sw})})}'),
 ('<label>السنة<input id="qa_y" value="${esc(yrs[yrs.length-1]||"")}"', '<label>السنة<input id="qa_y" value="${esc((()=>{try{const m=String(yrSlash()).match(/(\\d{4})\\D+(\\d{4})/);if(m)return Math.max(+m[1],+m[2])+"/"+Math.min(+m[1],+m[2])}catch(e){}return""})()||yrs.filter(y=>/^\\d{4}\\/\\d{4}$/.test(y)).pop()||"")}"'),
 ('try{const a=document.querySelector(\'#nav [aria-current="page"]\');if(a&&a.scrollIntoView)a.scrollIntoView({block:"nearest"})}catch(e){}', 'try{const a=document.querySelector(\'#nav [aria-current="page"]\');if(a&&a.scrollIntoView&&window.__siv243!==a.textContent){window.__siv243=a.textContent;a.scrollIntoView({block:"nearest"})}}catch(e){}'),
]
for a,b in R:
    n=s.count(a)
    if n==0 and s.count(b): continue
    assert n>=1, ('missing', a[:60])
    s=s.replace(a,b)
js=open('src/v243-fix.js',encoding='utf-8').read()
tag='<script id="v243">\n'+js+'\n</script>'
if '<script id="v243">' in s: s=re.sub(r'<script id="v243">.*?</script>',lambda m:tag,s,flags=re.S)
else:
    i=s.rfind('</body></html>'); s=s[:i]+tag+'\n'+s[i:]
open(p,'w',encoding='utf-8').write(s); print('ok',len(s))
