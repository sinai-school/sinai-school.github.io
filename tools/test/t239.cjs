const L = require('./lib.cjs');
(async () => {
  const W = +process.argv[2] || 1366;
  const o = await L.staff(W); const p = o.p; p.cur = 'i';
  await p.evaluate(() => view('i')); await p.waitForSelector('#krv .krp', { timeout: 60000 }); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => { const S = kr239State(); const v = S.val; const K = ['s.name','s.stat','n.T.T.m','n.15.4s.m','n.16.4s.m','r.T.P.m','r.T.G.t','f5.Sp.sec.t','f5.T.sec.m','jt.T.t','jt.dir.m','jt.asst.m','jt.tch.m','jt.tch.f','jt.gd.m','ja.T.t','ja.adm.m','ja.lab.m','ja.srv.m','ws.in.t','ws.sec.t','ws.lng.t','ws.T.t','ed.T.t.T','sv.T.t','ag.T.t','ms.t.T','st.T.t','sum.staff.p.t','sum.reg.p.t','sum.new.p.t','sum.sec.p.t','b.rt','lib.T','nat.T.t'];
    const o = {}; K.forEach(k => o[k] = v(k)); o.N = { noAge: S.C.N.noAge, lo: S.C.N.lo.length, hi: S.C.N.hi.length, noSvc: S.C.N.noSvc, noAgeS: S.C.N.noAgeS };
    o.fields = document.querySelectorAll('#krv .kf').length; o.pages = document.querySelectorAll('#krv .krp').length;
    o.ed = {}; ['bt','bg','hd','ms','phd','oth'].forEach(q => ['m','f'].forEach(s => o.ed[q + s] = v(`ed.${q}.${s}.T`)));
    o.edoth = v('ed.T.t.oth'); o.age = {}; for (let a = 15; a <= 21; a++) o.age[a] = [v(`r.${a}.4s.m`), v(`r.${a}.5s.m`), v(`r.${a}.6s.m`), v(`r.${a}.P.t`)];
    return o; });
  console.log(JSON.stringify(r, null, 0));
  await p.screenshot({ path: `/home/claude/scratch/t/i_${W}.png` });
  await p.evaluate(() => kr239Go(6, 1)); await p.waitForTimeout(800); await p.screenshot({ path: `/home/claude/scratch/t/i7_${W}.png` });
  console.log('ERRS', JSON.stringify(o.errs));
  await o.b.close();
})().catch(e => { console.error(e); process.exit(1); });
