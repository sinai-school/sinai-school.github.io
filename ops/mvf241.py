"""v242: نقل المرفقات القديمة (f_cf…) من القاعدة الأساسية لقواعد الملفات — نسخ ← تحقق حرف بحرف ← حذف الأصل.
call(body) = طلب للخادم (admin op mvf241 بالسر). ids = [(id, عدد القطع, الطول)]. ما يحذف شي إلا بعد ما كل القطع تتطابق."""
import time
def move_all(call, ids, budget=1500):
    out = []; t0 = time.time()
    for fid, n, b in ids:
        st = {'id': fid[:10] + '…', 'chunks': n, 'mb': round(b * 0.75 / 1048576, 1)}
        if time.time() - t0 > budget: st['skip'] = 'time'; out.append(st); continue
        try:
            nx = 0; r = None
            while nx >= 0:
                r = call({'op': 'mvf241', 'id': fid, 'st': 'copy', 'from': nx})
                if not r.get('ok'): break
                if r.get('gone'): break
                nx = r.get('next', -1)
            if not r or not r.get('ok') or r.get('gone'): st['copy'] = r; out.append(st); continue
            nx = 0; good = True
            while nx >= 0:
                r = call({'op': 'mvf241', 'id': fid, 'st': 'verify', 'from': nx})
                if not r.get('ok'): good = False; st['verify'] = r; break
                nx = r.get('next', -1)
            if not good: out.append(st); continue
            r = call({'op': 'mvf241', 'id': fid, 'st': 'fin', 'verified': 1})
            st['fin'] = r
        except Exception as e:
            st['err'] = repr(e)[:160]
        out.append(st)
    return out
