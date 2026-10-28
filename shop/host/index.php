<?php
// بوابة handhst.com — الصفحة تنخدم من هنا (مع كاش)، والصور والبيانات تجي مباشرة من شبكة Cloudflare السريعة
$up = 'https://hh-shop.7svyn82yzr.workers.dev';
$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, '/index.php') === 0) $uri = substr($uri, 10) ?: '/';
$m = $_SERVER['REQUEST_METHOD'];
$host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST']);
$path = parse_url($uri, PHP_URL_PATH);
$cacheable = $m === 'GET' && strpos($path, '/admin') !== 0 && strpos($path, '/api/') !== 0;
$dir = __DIR__ . '/.hhcache';
$key = $dir . '/' . md5($host . $uri);
$ttl = 90;

function out($code, $ct, $cc, $body, $tag) {
  http_response_code($code);
  header('content-type: ' . $ct);
  if ($cc) header('cache-control: ' . $cc);
  header('x-hh: ' . $tag);
  if (strpos($ct, 'text/') === 0 || strpos($ct, 'json') !== false || strpos($ct, 'xml') !== false) {
    $ae = isset($_SERVER['HTTP_ACCEPT_ENCODING']) ? $_SERVER['HTTP_ACCEPT_ENCODING'] : '';
    if (strpos($ae, 'gzip') !== false && function_exists('gzencode') && !ini_get('zlib.output_compression')) {
      header('content-encoding: gzip'); header('vary: accept-encoding'); $body = gzencode($body, 6);
    }
  }
  header('content-length: ' . strlen($body));
  echo $body;
}

if ($cacheable && is_file($key) && (time() - filemtime($key)) < $ttl) {
  $c = json_decode(file_get_contents($key), true);
  if ($c) { out($c['s'], $c['t'], $c['c'], base64_decode($c['b']), 'hit'); exit; }
}

$h = ['x-hh-host: ' . $host, 'x-hh-ip: ' . $_SERVER['REMOTE_ADDR']];
foreach (['CONTENT_TYPE' => 'content-type', 'HTTP_AUTHORIZATION' => 'authorization', 'HTTP_USER_AGENT' => 'user-agent', 'HTTP_ACCEPT_LANGUAGE' => 'accept-language'] as $k => $n) if (!empty($_SERVER[$k])) $h[] = $n . ': ' . $_SERVER[$k];
$ch = curl_init($up . $uri);
curl_setopt_array($ch, [CURLOPT_CUSTOMREQUEST => $m, CURLOPT_RETURNTRANSFER => true, CURLOPT_HEADER => true, CURLOPT_HTTPHEADER => $h, CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 30, CURLOPT_FOLLOWLOCATION => false, CURLOPT_ENCODING => '']);
if ($m === 'POST') curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
if ($res === false || $code >= 500) {
  if ($cacheable && is_file($key)) { $c = json_decode(file_get_contents($key), true); if ($c) { out($c['s'], $c['t'], $c['c'], base64_decode($c['b']), 'stale'); exit; } }
  out(503, 'text/html; charset=utf-8', 'no-store', '<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width"><body style="background:#13161B;color:#EDE8DF;font-family:sans-serif;text-align:center;padding-top:30vh">لحظات… حدّث الصفحة</body>', 'err');
  exit;
}
$hs = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$ct = 'text/html; charset=utf-8'; $cc = ''; $loc = '';
foreach (explode("\r\n", substr($res, 0, $hs)) as $line) {
  if (stripos($line, 'content-type:') === 0) $ct = trim(substr($line, 13));
  elseif (stripos($line, 'cache-control:') === 0) $cc = trim(substr($line, 14));
  elseif (stripos($line, 'location:') === 0) $loc = trim(substr($line, 9));
}
$body = substr($res, $hs);
if ($loc) header('location: ' . $loc);
if ($cacheable && $code == 200) {
  if (!is_dir($dir)) @mkdir($dir, 0755);
  @file_put_contents($key . '.tmp', json_encode(['s' => $code, 't' => $ct, 'c' => $cc, 'b' => base64_encode($body)]));
  @rename($key . '.tmp', $key);
}
out($code, $ct, $cc, $body, 'miss');
