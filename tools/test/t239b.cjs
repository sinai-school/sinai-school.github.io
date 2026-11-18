const L = require('./lib.cjs');
const W = +process.argv[2] || 1366;
const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) process.exitCode = 1; };
(async () => {
  let o = await L.staff(W); let p = o.p;
  const open = async () => { await p.evaluate(() => view('i')); await p.waitForSelector('#krv .krp', { timeout: 60000 }); await p.waitForTimeout(1500); };
  await open();
  const v = k => p.evaluate(k => kr239State().val(k), k);
  const base = await v('r.T.P.m');
  // type into a cell
  const sel = '.kf[data-k="r.15.4s.m"]';
  await p.$eval(sel, e => e.scrollIntoView({ block: 'center' }));
  await p.click(sel); await p.keyboard.press('Control+A'); await p.keyboard.type('٨٠');
  ok(await v('r.T.P.m') == base, 'لا يُحفظ قبل الخروج من الخانة (القيمة المحفوظة ثابتة)');
  const live = await p.$eval('.kf[data-k="r.T.4s.m"]', e => e.textContent); ok(live == '١١٦', 'المجموع يتحدث وقت الكتابة: ' + live);
  await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  ok(await v('r.15.4s.m') == '80', 'الخانة حُفظت 80');
  ok(+(await v('r.T.P.m')) == +base + 3, 'مجموع الإعدادي = ' + (await v('r.T.P.m')));
  ok(+(await v('sum.reg.p.t')) == +base + 3, 'الخلاصة التدقيقية تتحدث: ' + (await v('sum.reg.p.t')));
  ok(await p.$eval(sel, e => e.classList.contains('ov')), 'الخانة مظللة كمعدّلة');
  // tick
  await p.$eval('.kf[data-k="x:own.gov"]', e => e.scrollIntoView({ block: 'center' }));
  await p.click('.kf[data-k="x:own.gov"]'); await p.waitForTimeout(200);
  ok(await v('x:own.gov') == '', 'إلغاء ✓ حكومية');
  await p.click('.kf[data-k="x:own.priv"]'); await p.waitForTimeout(200);
  ok(await v('x:own.priv') == '✓', '✓ خاصة');
  const same = await p.$$eval('.kf[data-k="x:own.priv"]', L => L.map(e => e.getAttribute('aria-checked')));
  ok(same.every(x => x == 'true') && same.length == 2, 'نفس الخانة بالغلاف واستمارة ١ تتحدث معاً');
  // free text
  await p.click('button[aria-pressed]'); await p.evaluate(() => kr239Go(0, 1)); await p.waitForTimeout(300);
  const bb = await (await p.$('#krp0 .krp')).boundingBox(); await p.mouse.click(bb.x + bb.width * .2, bb.y + bb.height * .2); await p.waitForTimeout(200);
  await p.keyboard.type('ملاحظة تجريبية ١٢'); await p.mouse.click(5, 300); await p.waitForTimeout(800);
  ok((await p.evaluate(() => kr239State().ADD.length)) == 1, 'النص الحر أُضيف');
  // header edit syncs across pages
  await p.evaluate(() => kr239Go(6, 1)); const hs = '#krp6 .kf[data-k="s.name"]';
  await p.click(hs); await p.keyboard.press('Control+A'); await p.keyboard.type('اعدادية سيناء للبنين'); await p.keyboard.press('Tab'); await p.waitForTimeout(300);
  const nm = await p.$$eval('.kf[data-k="s.name"]', L => [...new Set(L.map(e => e.textContent))]); ok(nm.length == 1 && nm[0] == 'اعدادية سيناء للبنين', 'تعديل اسم المدرسة يظهر في كل الصفحات (' + nm.length + ')');
  // bar auto
  await p.click(hs); await p.waitForTimeout(150); await p.click('#krbar [data-a="auto"]'); await p.waitForTimeout(300);
  ok((await v('s.name')) == 'إعدادية سيناء للبنين', 'زر «تلقائي» يرجّع الخانة');
  await p.mouse.click(5, 300); await p.waitForTimeout(1500);
  // reload → persistence
  await o.b.close(); o = await L.staff(W); p = o.p; await open();
  ok(await v('r.15.4s.m') == '80', 'التعديل باقٍ بعد إعادة الفتح (من الخادم)');
  ok((await p.evaluate(() => kr239State().ADD.length)) == 1, 'النص الحر باقٍ بعد إعادة الفتح');
  ok(await v('x:own.gov') == '' && await v('x:own.priv') == '✓', 'خانات ✓ باقية');
  // print
  await p.evaluate(() => { window.__pr = 0; window.print = () => { window.__pr = document.querySelectorAll('#pr221 img').length; }; window.__sv = []; saveFile = async (n, b) => { window.__sv.push([n, b.size || b.length, b.type]); }; });
  const go = async (what) => { await p.evaluate(w => { kr239Do(w); }, what); await p.waitForSelector('.kr239p [data-go]'); await p.click('.kr239p [data-go]'); try { await p.waitForSelector('.st120 [data-go]', { timeout: 6000 }); await p.click('.st120 [data-go]'); } catch (e) { console.log('no stamp dialog'); } };
  await go('print'); await p.waitForFunction(() => window.__pr > 0, null, { timeout: 120000 });
  ok((await p.evaluate(() => window.__pr)) == 16, 'الطباعة: ١٦ صفحة');
  await go('pdf'); await p.waitForFunction(() => window.__sv.length > 0, null, { timeout: 120000 });
  const pdf = await p.evaluate(() => window.__sv[0]); ok(/\.pdf$/.test(pdf[0]) && pdf[1] > 500000, 'PDF: ' + pdf[0] + ' ' + Math.round(pdf[1] / 1024) + 'KB');
  await p.evaluate(() => { kr239Do('img'); }); await p.waitForSelector('.kr239p [data-go]'); await p.click('.kr239p input[value=cur]'); await p.click('.kr239p [data-go]'); try { await p.waitForSelector('.st120 [data-go]', { timeout: 6000 }); await p.click('.st120 [data-go]'); } catch (e) { }
  await p.waitForFunction(() => window.__sv.length > 1, null, { timeout: 60000 });
  const im = await p.evaluate(() => window.__sv[1]); ok(/\.png$/.test(im[0]), 'صورة: ' + im[0] + ' ' + Math.round(im[1] / 1024) + 'KB');
  // render one page to file for visual check
  const d = await p.evaluate(async () => { const S = kr239State(); return null; });
  // reset + restore
  await p.evaluate(() => kr239Reset()); await p.waitForTimeout(1500);
  ok(await v('r.15.4s.m') == '77', 'إرجاع الكل للتعبئة التلقائية');
  await p.waitForSelector('button[onclick="kr239Bak()"]'); await p.click('button[onclick="kr239Bak()"]'); await p.waitForTimeout(1500);
  ok(await v('r.15.4s.m') == '80', 'استرجاع تعديلاتي');
  // cleanup: reset fully
  await p.evaluate(() => kr239Reset()); await p.waitForTimeout(1200);
  console.log('ERRS', JSON.stringify(o.errs)); await o.b.close();
})().catch(e => { console.error(e); process.exit(1); });
