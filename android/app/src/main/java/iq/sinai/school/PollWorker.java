package iq.sinai.school;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.annotation.NonNull;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/** يفحص التبليغات الجديدة كل ربع ساعة حتى لو التطبيق مسكّر، ويطلّع إشعار بصوت */
public class PollWorker extends Worker {
    public PollWorker(@NonNull Context c, @NonNull WorkerParameters p) { super(c, p); }

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("sinai_poll", Context.MODE_PRIVATE); }

    static void schedule(Context c) {
        try {
            Constraints k = new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
            PeriodicWorkRequest r = new PeriodicWorkRequest.Builder(PollWorker.class, 15, TimeUnit.MINUTES).setConstraints(k).build();
            WorkManager.getInstance(c.getApplicationContext()).enqueueUniquePeriodicWork("sinai_poll", ExistingPeriodicWorkPolicy.KEEP, r);
        } catch (Exception e) { }
    }

    static void cancel(Context c) {
        try { WorkManager.getInstance(c.getApplicationContext()).cancelUniqueWork("sinai_poll"); } catch (Exception e) { }
    }

    static String read(HttpURLConnection h) throws Exception {
        InputStream in = h.getResponseCode() >= 400 ? h.getErrorStream() : h.getInputStream();
        if (in == null) return "";
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        byte[] b = new byte[8192];
        int n;
        while ((n = in.read(b)) > 0) o.write(b, 0, n);
        in.close();
        return o.toString("UTF-8");
    }

    static String post(String url, String body) throws Exception {
        HttpURLConnection h = (HttpURLConnection) new URL(url).openConnection();
        h.setConnectTimeout(30000);
        h.setReadTimeout(60000);
        h.setInstanceFollowRedirects(false);
        h.setRequestMethod("POST");
        h.setDoOutput(true);
        h.setRequestProperty("Content-Type", "text/plain;charset=utf-8");
        try (OutputStream os = h.getOutputStream()) { os.write(body.getBytes(StandardCharsets.UTF_8)); }
        int code = h.getResponseCode();
        for (int i = 0; i < 4 && code >= 300 && code < 400; i++) {
            String loc = h.getHeaderField("Location");
            h.disconnect();
            if (loc == null) break;
            h = (HttpURLConnection) new URL(loc).openConnection();
            h.setConnectTimeout(30000);
            h.setReadTimeout(60000);
            h.setInstanceFollowRedirects(false);
            code = h.getResponseCode();
        }
        String t = read(h);
        h.disconnect();
        return t;
    }

    @NonNull
    @Override
    public Result doWork() {
        Context c = getApplicationContext();
        SharedPreferences p = prefs(c);
        String url = p.getString("url", null), body = p.getString("body", null);
        if (url == null || body == null) return Result.success();
        try {
            JSONObject r = new JSONObject(post(url, body));
            String err = r.optString("err", "");
            if (err.equals("wrong") || err.equals("wrongnid") || err.equals("notreg") || err.equals("locked") || err.equals("neednid")) {
                p.edit().remove("url").remove("body").apply();
                return Result.success();
            }
            JSONArray notes = r.optJSONArray("notes");
            if (notes == null) return Result.success();
            Set<String> known = new HashSet<>(p.getStringSet("known", new HashSet<>()));
            boolean first = !p.getBoolean("init", false);
            Set<String> now = new HashSet<>(known);
            int shown = 0;
            for (int i = 0; i < notes.length(); i++) {
                JSONObject n = notes.optJSONObject(i);
                if (n == null) continue;
                String id = n.optString("id", "");
                if (id.isEmpty()) continue;
                now.add(id);
                if (first || known.contains(id) || shown >= 3) continue;
                String from = n.optString("from", "");
                String title = n.optString("title", "تبليغ جديد");
                String b = n.optString("body", "");
                if (b.length() > 300) b = b.substring(0, 300) + "…";
                Notifier.show(c, (from.isEmpty() ? "" : from + ": ") + title, b, id.hashCode());
                shown++;
            }
            p.edit().putStringSet("known", now).putBoolean("init", true).apply();
            return Result.success();
        } catch (Exception e) {
            return Result.success();
        }
    }
}
