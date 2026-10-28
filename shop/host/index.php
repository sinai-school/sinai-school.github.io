<?php
// بوابة handhst.com → خادم متجر H&H على Cloudflare
$up = 'https://hh-shop.7svyn82yzr.workers.dev';
$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, '/index.php') === 0) $uri = substr($uri, 10) ?: '/';
$m = $_SERVER['REQUEST_METHOD'];
$h = ['x-hh-host: ' . preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST']), 'x-hh-ip: ' . $_SERVER['REMOTE_ADDR']];
foreach (['CONTENT_TYPE' => 'content-type', 'HTTP_AUTHORIZATION' => 'authorization', 'HTTP_USER_AGENT' => 'user-agent', 'HTTP_ACCEPT_LANGUAGE' => 'accept-language'] as $k => $n) if (!empty($_SERVER[$k])) $h[] = $n . ': ' . $_SERVER[$k];
if (empty($_SERVER['HTTP_AUTHORIZATION']) && function_exists('getallheaders')) { foreach (getallheaders() as $k => $v) if (strtolower($k) == 'authorization') $h[] = 'authorization: ' . $v; }
$ch = curl_init($up . $uri);
curl_setopt_array($ch, [CURLOPT_CUSTOMREQUEST => $m, CURLOPT_RETURNTRANSFER => true, CURLOPT_HEADER => true, CURLOPT_HTTPHEADER => $h, CURLOPT_TIMEOUT => 40, CURLOPT_FOLLOWLOCATION => false, CURLOPT_ENCODING => '']);
if ($m === 'POST' || $m === 'PUT') curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
$res = curl_exec($ch);
if ($res === false) { http_response_code(502); header('content-type: text/html; charset=utf-8'); echo '<meta charset=utf-8><p style="font-family:sans-serif;text-align:center;margin-top:20vh">الموقع يتحدّث الآن، حدّث الصفحة بعد لحظات.</p>'; exit; }
$hs = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
http_response_code(curl_getinfo($ch, CURLINFO_RESPONSE_CODE));
foreach (explode("\r\n", substr($res, 0, $hs)) as $line) {
  if (preg_match('/^(content-type|cache-control|location|x-robots-tag):/i', $line)) header($line, true);
}
echo substr($res, $hs);
