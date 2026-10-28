<?php
// HH-PROXY v2 — بوابة handhst.com: الصفحات تنخدم فوراً من الكاش وتتحدث بالخلفية، والصور والبيانات من شبكة Cloudflare
// يتحدث وحده من الخادم كل ربع ساعة، فما يحتاج رفع يدوي مرة ثانية
const HH_UP = 'https://hh-shop.7svyn82yzr.workers.dev';
const HH_TTL = 20;
$dir = __DIR__ . '/.hhcache';
if (!is_dir($dir)) @mkdir($dir, 0755);
$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, '/index.php') === 0) $uri = substr($uri, 10) ?: '/';
$m = $_SERVER['REQUEST_METHOD'];
$host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST']);
$path = parse_url($uri, PHP_URL_PATH) ?: '/';
parse_str((string)parse_url($uri, PHP_URL_QUERY), $qs);
$ip = $_SERVER['REMOTE_ADDR'];

function hh_fetch($uri, $m = 'GET', $body = null, $extra = []) {
  global $host, $ip;
  $h = array_merge(['x-hh-host: ' . $host, 'x-hh-ip: ' . $ip], $extra);
  foreach (['CONTENT_TYPE' => 'content-type', 'HTTP_AUTHORIZATION' => 'authorization', 'HTTP_USER_AGENT' => 'user-agent', 'HTTP_ACCEPT_LANGUAGE' => 'accept-language'] as $k => $n) if (!empty($_SERVER[$k])) $h[] = $n . ': ' . $_SERVER[$k];
  $ch = curl_init(HH_UP . $uri);
  curl_setopt_array($ch, [CURLOPT_CUSTOMREQUEST => $m, CURLOPT_RETURNTRANSFER => true, CURLOPT_HEADER => true, CURLOPT_HTTPHEADER => $h, CURLOPT_CONNECTTIMEOUT => 6, CURLOPT_TIMEOUT => 25, CURLOPT_FOLLOWLOCATION => false, CURLOPT_ENCODING => '', CURLOPT_TCP_KEEPALIVE => 1]);
  if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
  $res = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  if ($res === false) return null;
  $hs = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
  $r = ['s' => $code, 't' => 'text/html; charset=utf-8', 'c' => '', 'l' => '', 'b' => substr($res, $hs)];
  foreach (explode("\r\n", substr($res, 0, $hs)) as $line) {
    if (stripos($line, 'content-type:') === 0) $r['t'] = trim(substr($line, 13));
    elseif (stripos($line, 'cache-control:') === 0) $r['c'] = trim(substr($line, 14));
    elseif (stripos($line, 'location:') === 0) $r['l'] = trim(substr($line, 9));
  }
  return $r;
}
function hh_texty($t) { return strpos($t, 'text/') === 0 || strpos($t, 'json') !== false || strpos($t, 'xml') !== false || strpos($t, 'javascript') !== false; }
function hh_store($key, $r) {
  $b = $r['b']; $meta = ['s' => $r['s'], 't' => $r['t'], 'c' => $r['c'], 'e' => '"' . substr(md5($b), 0, 16) . '"', 'at' => microtime(true)];
  @file_put_contents($key . '.b.tmp', $b); @rename($key . '.b.tmp', $key . '.b');
  if (hh_texty($r['t']) && function_exists('gzencode')) { @file_put_contents($key . '.gz.tmp', gzencode($b, 7)); @rename($key . '.gz.tmp', $key . '.gz'); }
  @file_put_contents($key . '.m.tmp', json_encode($meta)); @rename($key . '.m.tmp', $key . '.m');
  return $meta;
}
function hh_send($key, $meta, $tag) {
  http_response_code($meta['s']);
  header('content-type: ' . $meta['t']);
  header('cache-control: ' . ($meta['c'] ?: 'public, max-age=30'));
  header('etag: ' . $meta['e']);
  header('vary: accept-encoding');
  header('x-hh: ' . $tag);
  if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $meta['e']) { http_response_code(304); header('content-length: 0'); return; }
  $ae = isset($_SERVER['HTTP_ACCEPT_ENCODING']) ? $_SERVER['HTTP_ACCEPT_ENCODING'] : '';
  $f = $key . '.b';
  if (strpos($ae, 'gzip') !== false && is_file($key . '.gz') && !ini_get('zlib.output_compression')) { header('content-encoding: gzip'); $f = $key . '.gz'; }
  header('content-length: ' . filesize($f));
  readfile($f);
}
function hh_raw($r, $tag) {
  http_response_code($r['s']);
  header('content-type: ' . $r['t']);
  if ($r['c']) header('cache-control: ' . $r['c']);
  if ($r['l']) header('location: ' . $r['l']);
  header('x-hh: ' . $tag);
  $b = $r['b'];
  $ae = isset($_SERVER['HTTP_ACCEPT_ENCODING']) ? $_SERVER['HTTP_ACCEPT_ENCODING'] : '';
  if (strlen($b) > 600 && hh_texty($r['t']) && strpos($ae, 'gzip') !== false && function_exists('gzencode') && !ini_get('zlib.output_compression')) { header('content-encoding: gzip'); header('vary: accept-encoding'); $b = gzencode($b, 6); }
  header('content-length: ' . strlen($b));
  echo $b;
}
// ينهي الرد للزبون فوراً ويكمل الشغل بالخلفية
function hh_done() {
  if (function_exists('fastcgi_finish_request')) { fastcgi_finish_request(); return; }
  if (function_exists('litespeed_finish_request')) { litespeed_finish_request(); return; }
  ignore_user_abort(true); while (ob_get_level()) @ob_end_flush(); flush();
}
function hh_lock($f, $sec) { if (is_file($f) && time() - filemtime($f) < $sec) return false; @touch($f); return true; }
function hh_keyof($p, $q) { global $host; return md5($host . $p . (isset($q['q']) ? '?q=' . $q['q'] : '')); }
function hh_refresh($p, $q) {
  global $dir;
  $key = $dir . '/' . hh_keyof($p, $q);
  if (!hh_lock($key . '.lk', 15)) return;
  $r = hh_fetch($p . (isset($q['q']) ? '?q=' . rawurlencode($q['q']) : ''));
  if ($r && $r['s'] == 200) hh_store($key, $r);
  @unlink($key . '.lk');
}
function hh_selfupdate() {
  global $dir;
  if (!hh_lock($dir . '/upd', 900)) return;
  $ctx = stream_context_create(['http' => ['timeout' => 10]]);
  $rv = @file_get_contents(HH_UP . '/host/v', false, $ctx);
  if (!$rv || !preg_match('/^[0-9a-f]{16}$/', $rv)) return;
  $hf = __DIR__ . '/.htaccess';
  $ht = is_file($hf) ? file_get_contents($hf) : '';
  $blk = preg_match('/# HH-BEGIN.*?# HH-END\n?/s', $ht, $mm) ? $mm[0] : '';
  $mine = substr(hash('sha256', file_get_contents(__FILE__) . "\n" . $blk), 0, 16);
  if ($mine === $rv) return;
  $php = @file_get_contents(HH_UP . '/host/index.php', false, $ctx);
  $nht = @file_get_contents(HH_UP . '/host/htaccess', false, $ctx);
  if (!$php || !$nht || strpos($php, '<?php') !== 0 || strpos($php, 'HH-PROXY') === false || strpos($php, '// HH-PROXY-END') === false) return;
  if (strpos($nht, '# HH-BEGIN') !== 0 || strpos($nht, '# HH-END') === false) return;
  $newht = $blk ? str_replace($blk, $nht, $ht) : $nht . "\n" . $ht;
  if (@file_put_contents($hf . '.tmp', $newht) !== false) @rename($hf . '.tmp', $hf);
  if (@file_put_contents(__FILE__ . '.tmp', $php) !== false) @rename(__FILE__ . '.tmp', __FILE__);
  if (function_exists('opcache_invalidate')) @opcache_invalidate(__FILE__, true);
}

// ———— تحديث فوري بعد أي تعديل من لوحة التحكم ————
if ($path === '/__hh/purge') {
  http_response_code(204); header('content-length: 0');
  if (!hh_lock($dir . '/purge.lk', 2)) exit;
  @file_put_contents($dir . '/gen', (string)microtime(true));
  hh_done();
  hh_refresh('/', []);
  foreach (['/c', '/sitemap.xml'] as $x) hh_refresh($x, []);
  exit;
}

$cacheable = $m === 'GET' && strpos($path, '/admin') !== 0 && strpos($path, '/api/') !== 0 && strpos($path, '/host/') !== 0 && strpos($path, '/img/') !== 0;
if ($cacheable) {
  $key = $dir . '/' . hh_keyof($path, $qs);
  $meta = is_file($key . '.m') ? json_decode(@file_get_contents($key . '.m'), true) : null;
  $gen = is_file($dir . '/gen') ? (float)@file_get_contents($dir . '/gen') : 0;
  if ($meta && is_file($key . '.b') && $meta['at'] >= $gen) {
    hh_send($key, $meta, 'hit');
    hh_done();
    if (microtime(true) - $meta['at'] > HH_TTL) hh_refresh($path, $qs);
    hh_selfupdate();
    exit;
  }
  // أول زيارة، أو صار تعديل من لوحة التحكم: نجيب النسخة الجديدة مباشرة
  $r = hh_fetch($path . (isset($qs['q']) ? '?q=' . rawurlencode($qs['q']) : ''));
  if ($r && $r['s'] == 200) { $meta = hh_store($key, $r); hh_send($key, $meta, 'miss'); }
  elseif ($r && $r['s'] < 500) hh_raw($r, 'pass');
  elseif ($meta && is_file($key . '.b')) hh_send($key, $meta, 'stale');
  else { http_response_code(503); header('content-type: text/html; charset=utf-8'); header('retry-after: 3'); echo '<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width"><meta http-equiv=refresh content=3><body style="font-family:sans-serif;text-align:center;padding-top:30vh;background:#F6F5F1;color:#16181D">لحظات… الصفحة راح تتحدث وحدها</body>'; }
  hh_done();
  if (mt_rand(1, 300) === 1) foreach (glob($dir . '/*.m') ?: [] as $f) if (time() - filemtime($f) > 172800) { $b = substr($f, 0, -2); @unlink($f); @unlink($b . '.b'); @unlink($b . '.gz'); }
  hh_selfupdate();
  exit;
}

$r = hh_fetch($uri, $m, $m === 'POST' ? file_get_contents('php://input') : null);
if (!$r) { http_response_code(502); header('content-type: application/json'); echo '{"err":"net"}'; exit; }
hh_raw($r, 'pass');
// HH-PROXY-END
