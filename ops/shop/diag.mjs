// فحص قراءة صورة المنتج بنموذج الرؤية
const T = process.env.CLOUDFLARE_API_TOKEN, A = process.env.CLOUDFLARE_ACCOUNT_ID;
const M = '@cf/meta/llama-3.2-11b-vision-instruct';
const run = async body => { const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${A}/ai/run/${M}`, { method: 'POST', headers: { Authorization: 'Bearer ' + T, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return (await r.text()).slice(0, 400); };
for (const k of ['t30575', 't30586']) {
  const b = new Uint8Array(await (await fetch('https://hh-shop.7svyn82yzr.workers.dev/img/' + k)).arrayBuffer());
  console.log('IMG', k, b.length);
  const body = { messages: [{ role: 'user', content: 'What exact product is shown? Read the brand, model number and product type printed on the box or device. Answer in one short English line only.' }], image: [...b], max_tokens: 60 };
  let t = await run(body); console.log('VIS1', k, t);
  if (/agree|licen/i.test(t)) { console.log('AGREE', await run({ prompt: 'agree' })); console.log('VIS2', k, await run(body)); }
}
