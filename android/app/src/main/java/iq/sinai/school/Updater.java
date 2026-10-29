package iq.sinai.school;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.widget.Toast;
import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/* تحديث التطبيق نفسه بضغطة وحدة (بدون حذف ولا إعادة تثبيت، والبيانات والدخول يبقون) */
final class Updater {
    private static final String REL = "https://github.com/sinai-school/sinai-school.github.io/releases/latest/download/";
    private static volatile boolean busy = false;

    static void check(Activity a) {
        final android.content.SharedPreferences p = a.getSharedPreferences("upd", 0);
        long now = System.currentTimeMillis();
        if (busy || now - p.getLong("at", 0) < 6 * 3600 * 1000L || !Offline.online(a)) return;
        busy = true;
        new Thread(() -> {
            try {
                int remote = Integer.parseInt(new String(get(REL + "app-version.txt", 15000), "UTF-8").trim());
                p.edit().putLong("at", System.currentTimeMillis()).apply();
                int mine = (int) (Build.VERSION.SDK_INT >= 28
                        ? a.getPackageManager().getPackageInfo(a.getPackageName(), 0).getLongVersionCode()
                        : a.getPackageManager().getPackageInfo(a.getPackageName(), 0).versionCode);
                if (remote > mine && p.getInt("skip", 0) != remote) a.runOnUiThread(() -> ask(a, remote));
            } catch (Exception e) {
            } finally { busy = false; }
        }).start();
    }

    private static void ask(Activity a, int v) {
        if (a.isFinishing()) return;
        try {
            new AlertDialog.Builder(a)
                .setTitle("تحديث التطبيق")
                .setMessage("نزلت نسخة جديدة من تطبيق إعدادية سيناء (أسرع وتنفتح بدون إنترنت). حدّثه هسه؟ بياناتك ودخولك يبقون مثل ما هم.")
                .setPositiveButton("تحديث", (d, x) -> download(a))
                .setNegativeButton("بعدين", (d, x) -> a.getSharedPreferences("upd", 0).edit().putLong("at", System.currentTimeMillis()).apply())
                .show();
        } catch (Exception e) { }
    }

    private static void download(Activity a) {
        Toast.makeText(a, "جارٍ تنزيل التحديث…", Toast.LENGTH_LONG).show();
        new Thread(() -> {
            try {
                File dir = new File(a.getCacheDir(), "apk");
                dir.mkdirs();
                File f = new File(dir, "sinai-school.apk");
                byte[] b = get(REL + "sinai-school.apk", 180000);
                if (b.length < 100000) throw new Exception("small");
                try (FileOutputStream o = new FileOutputStream(f)) { o.write(b); }
                Uri u = FileProvider.getUriForFile(a, "iq.sinai.school.files", f);
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(u, "application/vnd.android.package-archive");
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                a.runOnUiThread(() -> { try { a.startActivity(i); } catch (Exception e) { openBrowser(a); } });
            } catch (Exception e) {
                a.runOnUiThread(() -> openBrowser(a));
            }
        }).start();
    }

    private static void openBrowser(Activity a) {
        try { a.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(REL + "sinai-school.apk"))); } catch (Exception e) { }
    }

    private static byte[] get(String url, int t) throws Exception {
        HttpURLConnection h = null;
        String u = url;
        for (int r = 0; r < 6; r++) {
            h = (HttpURLConnection) new URL(u).openConnection();
            h.setConnectTimeout(t);
            h.setReadTimeout(t);
            h.setUseCaches(false);
            h.setInstanceFollowRedirects(false);
            int c = h.getResponseCode();
            if (c >= 300 && c < 400 && h.getHeaderField("Location") != null) {
                u = new URL(new URL(u), h.getHeaderField("Location")).toString();
                h.disconnect();
                continue;
            }
            if (c != 200) { h.disconnect(); throw new Exception("http " + c); }
            break;
        }
        try (InputStream in = h.getInputStream()) {
            java.io.ByteArrayOutputStream o = new java.io.ByteArrayOutputStream();
            byte[] buf = new byte[65536];
            int n;
            while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
            return o.toByteArray();
        } finally { h.disconnect(); }
    }
}
