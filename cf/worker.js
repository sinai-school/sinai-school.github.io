// خادم إعدادية سيناء على Cloudflare — المرحلة الأولى: فحص الاتصال وقاعدة البيانات
export default {
  async fetch(req, env) {
    const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: h });
    let db = 0;
    try { await env.DB.prepare('select 1').first(); db = 1; } catch (e) {}
    return new Response(JSON.stringify({ ok: 1, service: 'sinai-cf', stage: 1, db }), { headers: h });
  }
};
// 2026-10-23T00:50:43
