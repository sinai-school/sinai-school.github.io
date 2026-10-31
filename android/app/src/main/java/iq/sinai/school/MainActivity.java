package iq.sinai.school;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import android.webkit.WebResourceError;
import android.webkit.WebResourceResponse;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.widget.FrameLayout;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private static final String HOME = "https://sinai-school.github.io/";
    private static final int FILE_REQ = 7;
    private WebView web;
    private ValueCallback<Uri[]> fileCb;
    private boolean mainErr = false;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Window w = getWindow();
        w.setStatusBarColor(Color.parseColor("#0c362f"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0c362f"));
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0c362f"));
        root.addView(web);
        setContentView(root);
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, ins) -> {
            Insets b = ins.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.ime());
            v.setPadding(b.left, b.top, b.right, b.bottom);
            return WindowInsetsCompat.CONSUMED;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setSupportZoom(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " SinaiSchoolApp/2");
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);

        web.addJavascriptInterface(new Bridge(), "SinaiApp");

        /* طلبات Service Worker: بدون إنترنت تنخدم من النسخة المحفوظة داخل التطبيق */
        if (Build.VERSION.SDK_INT >= 24) {
            try {
                ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient() {
                    @Override
                    public WebResourceResponse shouldInterceptRequest(WebResourceRequest req) {
                        return local(req, false);
                    }
                });
            } catch (Exception e) { }
        }

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest req) {
                return local(req, req.isForMainFrame());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                Uri u = req.getUrl();
                String host = u.getHost() == null ? "" : u.getHost();
                String scheme = u.getScheme() == null ? "" : u.getScheme();
                if ((scheme.equals("https") || scheme.equals("http")) && host.endsWith("sinai-school.github.io")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { }
                return true;
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest req, WebResourceError err) {
                if (!req.isForMainFrame()) return;
                mainErr = true;
                // بدون إنترنت: افتح النسخة الكاملة المحفوظة داخل التطبيق، وإذا ما موجودة (أول مرة) اعرض رسالة
                String page = Offline.has(MainActivity.this) ? Offline.readText(MainActivity.this, "index.html") : null;
                if (page != null) v.loadDataWithBaseURL(HOME, page, "text/html", "utf-8", HOME);
                else v.loadDataWithBaseURL(HOME, OFFLINE_HTML, "text/html", "utf-8", null);
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                if (mainErr) mainErr = false;
                else refreshSite(false);
                v.evaluateJavascript(PATCH_JS, null);
                Intent it = getIntent();
                if (it != null && "notes".equals(it.getStringExtra("open"))) {
                    it.removeExtra("open");
                    v.postDelayed(() -> v.evaluateJavascript("window.nt91Open&&window.nt91Open()", null), 2500);
                }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                try {
                    startActivityForResult(p.createIntent(), FILE_REQ);
                } catch (Exception e) {
                    fileCb = null;
                    return false;
                }
                return true;
            }
        });

        web.setDownloadListener((url, ua, cd, mime, len) -> {
            if (url.startsWith("blob:")) {
                web.evaluateJavascript("window.__sinaiBlob&&window.__sinaiBlob(" + q(url) + ",'file')", null);
            } else if (url.startsWith("data:")) {
                saveDataUrl(url, "file");
            } else {
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) { }
            }
        });

        Notifier.channel(this);
        Updater.check(this);
        if (state != null) web.restoreState(state);
        else web.loadUrl(HOME);
        if (PollWorker.prefs(this).getString("url", null) != null) PollWorker.schedule(this);
    }

    private static final String OFFLINE_HTML =
        "<!doctype html><html lang='ar' dir='rtl'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>" +
        "<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c362f;color:#f6edd2;font:17px/1.8 sans-serif;text-align:center;padding:24px;box-sizing:border-box}" +
        "button{margin-top:18px;border:0;border-radius:12px;padding:13px 28px;font:700 17px sans-serif;background:#e0c47c;color:#1b1406}</style></head>" +
        "<body><div><h2>لا يوجد اتصال بالإنترنت</h2><p>تأكد من الإنترنت ثم اضغط «إعادة المحاولة».</p>" +
        "<button onclick=\"location.href='" + HOME + "'\">إعادة المحاولة</button></div></body></html>";

    private static String q(String s) {
        return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'";
    }

    // Makes downloads (blob links) and printing work inside the app.
    private static final String PATCH_JS =
        "(function(){if(window.__sinaiPatched)return;window.__sinaiPatched=1;" +
        "window.__sinaiBlob=function(u,n){fetch(u).then(function(r){return r.blob()}).then(function(b){var f=new FileReader();f.onload=function(){SinaiApp.save(n||'file',f.result)};f.readAsDataURL(b)})};" +
        "document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[download]');if(!a)return;var h=a.href||'';if(h.indexOf('blob:')==0||h.indexOf('data:')==0){e.preventDefault();e.stopPropagation();if(h.indexOf('data:')==0)SinaiApp.save(a.download||'file',h);else window.__sinaiBlob(h,a.download)}},true);" +
        "var oc=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){var h=this.href||'';if(this.hasAttribute('download')&&(h.indexOf('blob:')==0||h.indexOf('data:')==0)){if(h.indexOf('data:')==0)SinaiApp.save(this.download||'file',h);else window.__sinaiBlob(h,this.download);return}return oc.apply(this,arguments)};" +
        "window.print=function(){SinaiApp.print()};" +
        "try{navigator.canShare=function(d){return!!(d&&d.files&&d.files.length)};navigator.share=function(d){return new Promise(function(ok,no){var f=d&&d.files&&d.files[0];if(!f){no(new Error('x'));return}var r=new FileReader();r.onload=function(){SinaiApp.share(f.name||'file',r.result);ok()};r.onerror=function(){no(new Error('x'))};r.readAsDataURL(f)})}}catch(e){}" +
        "var op=window.open;window.open=function(u){if(u&&String(u).indexOf('blob:')==0){window.__sinaiBlob(u,'file.pdf');return null}return op.apply(window,arguments)};" +
        "})();";

    private void saveDataUrl(String dataUrl, String name) {
        try {
            int c = dataUrl.indexOf(',');
            String meta = dataUrl.substring(5, c);
            String mime = meta.split(";")[0];
            if (mime.isEmpty()) mime = "application/octet-stream";
            byte[] bytes = Base64.decode(dataUrl.substring(c + 1), Base64.DEFAULT);
            if (!name.contains(".")) {
                if (mime.contains("pdf")) name += ".pdf";
                else if (mime.contains("sheet") || mime.contains("excel")) name += ".xlsx";
                else if (mime.contains("word")) name += ".docx";
                else if (mime.contains("html")) name += ".html";
                else if (mime.contains("png")) name += ".png";
                else if (mime.contains("jpeg")) name += ".jpg";
            }
            Uri out;
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues cv = new ContentValues();
                cv.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                cv.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                boolean img = mime.startsWith("image/");
                /* الصور تروح للاستوديو (الصور / إعدادية سيناء)، والملفات للتنزيلات */
                cv.put(MediaStore.MediaColumns.RELATIVE_PATH, img ? Environment.DIRECTORY_PICTURES + "/إعدادية سيناء" : Environment.DIRECTORY_DOWNLOADS);
                out = getContentResolver().insert(img ? MediaStore.Images.Media.EXTERNAL_CONTENT_URI : MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                try (OutputStream os = getContentResolver().openOutputStream(out)) { os.write(bytes); }
            } else {
                boolean img = mime.startsWith("image/");
                File dir = getExternalFilesDir(img ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS);
                File f = new File(dir, name);
                try (FileOutputStream os = new FileOutputStream(f)) { os.write(bytes); }
                out = Uri.fromFile(f);
                if (img) { try { android.media.MediaScannerConnection.scanFile(this, new String[]{ f.getAbsolutePath() }, new String[]{ mime }, null); } catch (Exception x) { } }
            }
            final Uri fu = out;
            final String fm = mime;
            final String fn = name;
            runOnUiThread(() -> {
                Toast.makeText(this, (fm.startsWith("image/") ? "انحفظت الصورة بالاستوديو: " : "انحفظ الملف بالتنزيلات: ") + fn, Toast.LENGTH_LONG).show();
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW);
                    i.setDataAndType(fu, fm);
                    i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(i);
                } catch (Exception e) { }
            });
        } catch (Exception e) {
            runOnUiThread(() -> Toast.makeText(this, "تعذّر حفظ الملف", Toast.LENGTH_LONG).show());
        }
    }

    private void shareDataUrl(String dataUrl, String name) {
        try {
            int c = dataUrl.indexOf(',');
            String mime = dataUrl.substring(5, c).split(";")[0];
            if (mime.isEmpty()) mime = "application/octet-stream";
            byte[] bytes = Base64.decode(dataUrl.substring(c + 1), Base64.DEFAULT);
            if (!name.contains(".") && mime.contains("pdf")) name += ".pdf";
            File dir = new File(getCacheDir(), "shared");
            if (dir.exists()) { File[] old = dir.listFiles(); if (old != null) for (File o : old) o.delete(); }
            dir.mkdirs();
            File f = new File(dir, name.replaceAll("[\\\\/:*?\"<>|]", "_"));
            try (FileOutputStream os = new FileOutputStream(f)) { os.write(bytes); }
            Uri u = FileProvider.getUriForFile(this, "iq.sinai.school.files", f);
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType(mime);
            i.putExtra(Intent.EXTRA_STREAM, u);
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            final Intent ch = Intent.createChooser(i, "مشاركة الملف");
            runOnUiThread(() -> startActivity(ch));
        } catch (Exception e) {
            runOnUiThread(() -> Toast.makeText(this, "تعذّرت المشاركة", Toast.LENGTH_LONG).show());
        }
    }

    private class Bridge {
        @JavascriptInterface
        public void share(String name, String dataUrl) { shareDataUrl(dataUrl, name); }

        @JavascriptInterface
        public void save(String name, String dataUrl) { saveDataUrl(dataUrl, name); }

        @JavascriptInterface
        public boolean isApp() { return true; }

        /* إشعارات التبليغات بصوت */
        @JavascriptInterface
        public void notify(String title, String body) { Notifier.show(MainActivity.this, title, body, (int) (System.currentTimeMillis() % 1000000)); }

        @JavascriptInterface
        public boolean canNotify() { return Notifier.allowed(MainActivity.this); }

        @JavascriptInterface
        public void enableNotify() {
            Notifier.channel(MainActivity.this);
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                runOnUiThread(() -> requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 9));
            }
            PollWorker.schedule(MainActivity.this);
        }

        @JavascriptInterface
        public void setPoll(String url, String body) {
            PollWorker.prefs(MainActivity.this).edit().putString("url", url).putString("body", body).apply();
            PollWorker.schedule(MainActivity.this);
        }

        @JavascriptInterface
        public void knownIds(String csv) {
            java.util.Set<String> s = new java.util.HashSet<>(PollWorker.prefs(MainActivity.this).getStringSet("known", new java.util.HashSet<>()));
            for (String x : (csv == null ? "" : csv).split(",")) if (!x.isEmpty()) s.add(x);
            PollWorker.prefs(MainActivity.this).edit().putStringSet("known", s).putBoolean("init", true).apply();
        }

        @JavascriptInterface
        public void stopPoll() {
            PollWorker.prefs(MainActivity.this).edit().clear().apply();
            PollWorker.cancel(MainActivity.this);
        }

        @JavascriptInterface
        public void print() {
            runOnUiThread(() -> {
                try {
                    PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
                    PrintDocumentAdapter ad = web.createPrintDocumentAdapter("إعدادية سيناء");
                    pm.print("إعدادية سيناء", ad, new PrintAttributes.Builder().build());
                } catch (Exception e) { }
            });
        }
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == FILE_REQ && fileCb != null) {
            fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCb = null;
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        if (i != null && "notes".equals(i.getStringExtra("open")) && web != null)
            web.evaluateJavascript("window.nt91Open&&window.nt91Open()", null);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.evaluateJavascript("window.__chkUpd&&window.__chkUpd()", null);
        refreshSite(false);
        Updater.check(this);
    }

    /* الصفحة الرئيسية تنفتح فوراً من النسخة المحفوظة بالتطبيق (حتى بدون إنترنت)، والملفات الثانية بس لما ماكو إنترنت */
    private WebResourceResponse local(WebResourceRequest req, boolean main) {
        try {
            if (!"GET".equalsIgnoreCase(req.getMethod())) return null;
            String k = Offline.key(req.getUrl());
            if (k == null) return null;
            if (main && !"index.html".equals(k)) return null;
            if (!Offline.has(this)) return null;
            if (main || !Offline.online(this)) return Offline.serve(this, k);
        } catch (Exception e) { }
        return null;
    }

    private void refreshSite(boolean force) {
        Offline.refresh(this, force, nv -> runOnUiThread(() -> {
            if (web != null) web.evaluateJavascript("(function(){var v=" + q(nv) + ";if(window.APP_VER&&window.APP_VER!==v&&v.indexOf(window.APP_VER+'-')!==0){try{localStorage.removeItem('rl86v')}catch(e){}window.__chkUpd&&window.__chkUpd()}})()", null);
        }));
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else new AlertDialog.Builder(this)
            .setMessage("تريد تطلع من التطبيق؟")
            .setPositiveButton("نعم", (d, x) -> finish())
            .setNegativeButton("لا", null)
            .show();
    }
}
