package iq.sinai.school;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.os.Build;

/** إشعار التبليغات: بصوت واهتزاز، ويفتح التطبيق على التبليغات */
public final class Notifier {
    static final String CH = "sinai_notes";

    static void channel(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null || nm.getNotificationChannel(CH) != null) return;
        NotificationChannel ch = new NotificationChannel(CH, "تبليغات المدرسة", NotificationManager.IMPORTANCE_HIGH);
        ch.setDescription("تبليغات الإدارة والمدرسين");
        ch.enableVibration(true);
        ch.setVibrationPattern(new long[]{0, 300, 150, 300, 150, 500});
        ch.enableLights(true);
        ch.setLightColor(Color.parseColor("#e0c47c"));
        ch.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
            new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
        nm.createNotificationChannel(ch);
    }

    static boolean allowed(Context c) {
        if (Build.VERSION.SDK_INT >= 33 && c.checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) return false;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        return nm != null && (Build.VERSION.SDK_INT < 24 || nm.areNotificationsEnabled());
    }

    @SuppressWarnings("deprecation")
    static void show(Context c, String title, String body, int id) {
        try {
            channel(c);
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            Intent i = new Intent(c, MainActivity.class);
            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            i.putExtra("open", "notes");
            int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
            PendingIntent pi = PendingIntent.getActivity(c, id, i, fl);
            Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CH) : new Notification.Builder(c);
            b.setSmallIcon(R.drawable.ic_stat_note)
                .setContentTitle(title == null || title.isEmpty() ? "إعدادية سيناء للبنين" : title)
                .setContentText(body == null ? "" : body)
                .setStyle(new Notification.BigTextStyle().bigText(body == null ? "" : body))
                .setAutoCancel(true)
                .setContentIntent(pi)
                .setColor(Color.parseColor("#0c362f"))
                .setCategory(Notification.CATEGORY_MESSAGE);
            if (Build.VERSION.SDK_INT < 26) {
                b.setDefaults(Notification.DEFAULT_ALL).setPriority(Notification.PRIORITY_HIGH);
            }
            nm.notify(id, b.build());
        } catch (Exception e) { }
    }
}
