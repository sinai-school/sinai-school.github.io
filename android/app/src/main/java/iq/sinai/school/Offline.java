package iq.sinai.school;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.webkit.WebResourceResponse;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/* نسخة كاملة من النظام محفوظة داخل التطبيق نفسه: تنفتح فوراً بدون إنترنت أو على إنترنت ضعيف جداً،
   وتتحدث وحدها بالخلفية أول ما يتوفر إنترنت. */
final class Offline {
    static final String HOST = "sinai-school.github.io";
    static final String BASE = "https://" + HOST + "/";
    /* المسار على الموقع ← اسم الملف داخل التطبيق */
    static final String[] FILES = {
        "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png",
        "img/logo_s.png", "img/logo_ui.png", "img/logo_m.png", "img/logo_cal.png",
        "img/img_cal2.png", "img/j2eagle.png", "img/j2seal.png"
    };
    private static final Pattern VER = Pattern.compile("window\\.APP_VER=\"([^\"]*)\"");
    private static volatile boolean busy = false;
    private static volatile long lastRun = 0;

    static File dir(Context c) { File d = new File(c.getFilesDir(), "site"); d.mkdirs(); return d; }

    static File file(Context c, String path) { return new File(dir(c), path.replace('/', '_')); }

    static boolean has(Context c) { File f = file(c, "index.html"); return f.exists() && f.length() > 200000; }

    static String key(Uri u) {
        if (u == null || !HOST.equals(u.getHost())) return null;
        String p = u.getPath() == null ? "/" : u.getPath();
        if (p.equals("/") || p.isEmpty()) return "index.html";
        if (p.startsWith("/")) p = p.substring(1);
        for (String f : FILES) if (f.equals(p)) return f;
        return null;
    }

    static boolean online(Context c) {
        try {
            ConnectivityManager cm = (ConnectivityManager) c.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return true;
            if (Build.VERSION.SDK_INT >= 23) {
                Network n = cm.getActiveNetwork();
                if (n == null) return false;
                NetworkCapabilities nc = cm.getNetworkCapabilities(n);
                return nc != null && nc.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
            }
            NetworkInfo ni = cm.getActiveNetworkInfo();
            return ni != null && ni.isConnected();
        } catch (Exception e) { return true; }
    }

    static String mime(String k) {
        if (k.endsWith(".html")) return "text/html";
        if (k.endsWith(".png")) return "image/png";
        if (k.endsWith(".webmanifest")) return "application/manifest+json";
        return "application/octet-stream";
    }

    static WebResourceResponse serve(Context c, String k) {
        try {
            File f = file(c, k);
            if (!f.exists() || f.length() == 0) return null;
            String m = mime(k);
            WebResourceResponse r = new WebResourceResponse(m, m.startsWith("text/") ? "utf-8" : null, new FileInputStream(f));
            if (Build.VERSION.SDK_INT >= 21) {
                Map<String, String> h = new HashMap<>();
                h.put("Cache-Control", "no-cache");
                h.put("Access-Control-Allow-Origin", "*");
                r.setResponseHeaders(h);
                r.setStatusCodeAndReasonPhrase(200, "OK");
            }
            return r;
        } catch (Exception e) { return null; }
    }

    static String readText(Context c, String k) {
        try (FileInputStream in = new FileInputStream(file(c, k))) {
            return new String(readAll(in), StandardCharsets.UTF_8);
        } catch (Exception e) { return null; }
    }

    static String savedVer(Context c) { return c.getSharedPreferences("site", 0).getString("v", ""); }

    private static byte[] readAll(InputStream in) throws Exception {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        byte[] b = new byte[65536];
        int n;
        while ((n = in.read(b)) > 0) o.write(b, 0, n);
        return o.toByteArray();
    }

    private static byte[] get(String url, int timeoutMs) throws Exception {
        HttpURLConnection h = (HttpURLConnection) new URL(url).openConnection();
        h.setConnectTimeout(timeoutMs);
        h.setReadTimeout(timeoutMs);
        h.setUseCaches(false);
        h.setRequestProperty("Cache-Control", "no-cache");
        h.setInstanceFollowRedirects(true);
        try {
            if (h.getResponseCode() != 200) throw new Exception("http " + h.getResponseCode());
            try (InputStream in = h.getInputStream()) { return readAll(in); }
        } finally { h.disconnect(); }
    }

    private static void write(File f, byte[] data) throws Exception {
        File t = new File(f.getPath() + ".tmp");
        try (FileOutputStream o = new FileOutputStream(t)) { o.write(data); o.getFD().sync(); }
        if (!t.renameTo(f)) { f.delete(); if (!t.renameTo(f)) throw new Exception("rename"); }
    }

    interface Done { void updated(String newVer); }

    /* يجيب الأحدث بالخلفية: يقارن version.json، وإذا تغيّر ينزّل الصفحة ويتأكد إنها كاملة قبل ما يستبدل القديمة */
    static void refresh(Context ctx, boolean force, Done done) {
        final Context c = ctx.getApplicationContext();
        long now = System.currentTimeMillis();
        if (busy || (!force && now - lastRun < 60000) || !online(c)) return;
        busy = true;
        lastRun = now;
        new Thread(() -> {
            String nv = null;
            try {
                String remote = "";
                try {
                    String j = new String(get(BASE + "version.json?t=" + System.currentTimeMillis(), 15000), StandardCharsets.UTF_8);
                    Matcher m = Pattern.compile("\"v\"\\s*:\\s*\"([^\"]*)\"").matcher(j);
                    if (m.find()) remote = m.group(1);
                } catch (Exception e) { }
                String have = savedVer(c);
                boolean need = !has(c) || remote.isEmpty() || !same(remote, have);
                if (need) {
                    byte[] page = get(BASE + "index.html?t=" + System.currentTimeMillis(), 120000);
                    String t = new String(page, StandardCharsets.UTF_8);
                    Matcher m = VER.matcher(t);
                    if (page.length > 200000 && m.find() && t.contains("</html>")) {
                        write(file(c, "index.html"), page);
                        nv = m.group(1);
                        c.getSharedPreferences("site", 0).edit().putString("v", nv).apply();
                    }
                }
                for (String f : FILES) {
                    if (f.equals("index.html")) continue;
                    File out = file(c, f);
                    if (out.exists() && out.length() > 0 && !need) continue;
                    try { byte[] b = get(BASE + f, 60000); if (b.length > 0) write(out, b); } catch (Exception e) { }
                }
            } catch (Exception e) {
            } finally {
                busy = false;
            }
            if (nv != null && done != null) done.updated(nv);
        }).start();
    }

    static boolean same(String a, String b) {
        if (a == null || b == null || a.isEmpty() || b.isEmpty()) return false;
        return a.equals(b) || a.startsWith(b + "-") || b.startsWith(a + "-");
    }
}
