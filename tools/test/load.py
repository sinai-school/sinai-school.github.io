import json,sqlite3,os,base64,hashlib,time
S='/home/claude/scratch'
for f in ('t.db','t_f.db'):
    if os.path.exists(S+'/h/'+f): os.remove(S+'/h/'+f)
D=json.load(open(S+'/dump.json'))
db=sqlite3.connect(S+'/h/t.db'); db.executescript(open('/home/claude/sinai-school.github.io/cf/schema.sql').read())
CH=400000
def blob(i,s):
    for n in range(max(1,-(-len(s)//CH))): db.execute('insert or replace into chunks(id,i,d) values(?,?,?)',(i,n,s[n*CH:(n+1)*CH]))
mx=0
for m in D['meta']:
    p=m['p']; db.execute("insert or replace into docs(p,rev,at,by,h,oh,n,t) values(?,?,?,?,?,?,1,'docs')",(p,m['rev'],m['at'],m['by'],m['h'],m['h'])); blob('d_'+p,D['docs'][p]); mx=max(mx,m['rev'])
salt=os.urandom(16); h=base64.b64encode(hashlib.pbkdf2_hmac('sha256',b'Test-1234',salt,100000)).decode()
roles=[{'id':'r_own','u':'tstown','name':'مدير الاختبار','salt':base64.b64encode(salt).decode(),'h':h,'own':1,'on':1,'secs':[]},{'id':'r_stf','u':'tststf','name':'موظف الاختبار','salt':base64.b64encode(salt).decode(),'h':h,'on':1,'secs':['p','t','a','x']},{'id':'r_ro','u':'tstro','name':'عرض فقط','salt':base64.b64encode(salt).decode(),'h':h,'on':1,'ro':1,'secs':['p','t']}]
mx+=1; db.execute("insert or replace into docs(p,rev,at,by,h,oh,n,t) values('__roles',?,?,'o','','',1,'docs')",(mx,int(time.time()*1000))); blob('d___roles',json.dumps({'list':roles}))
for r in D['acc']: db.execute('insert into acc(kind,key,name,phone,created,updated,nid) values(?,?,?,?,?,?,?)',(r['kind'],r['key'],r['name'],r['phone'],r['created'],r['updated'],r['nid'] or ''))
for r in D['prof']: db.execute('insert into prof(kind,key,name,json,photo,updated,status) values(?,?,?,?,?,?,?)',(r['kind'],r['key'],r['name'],r['json'],'',r['updated'],r['status']))
for r in D['kv']: db.execute('insert or replace into kv(k,v) values(?,?)',(r['k'],r['v']))
for k,v in [('SECRET','localtestsecret'),('DREV',str(mx))]: db.execute('insert or replace into kv(k,v) values(?,?)',(k,v))
if D['snap']: blob('snap',D['snap'])
for r in D['notes']: db.execute('insert or ignore into notes(seq,id,scope,target,frm,title,body,date,cat,files) values(?,?,?,?,?,?,?,?,?,?)',(r['seq'],r['id'],r['scope'],r['target'],r['frm'],r['title'],'',r['date'],r['cat'],''))
db.commit(); sqlite3.connect(S+'/h/t_f.db').close(); print('loaded',len(D['meta']))
