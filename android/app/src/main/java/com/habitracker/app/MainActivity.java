package com.habitracker.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "SystemBar")
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
        // Set default status and navigation bar colors (dark mode)
        setSystemBarStyleNative("dark");
    }

    // Native method to set system bar style
    public void setSystemBarStyleNative(String mode) {
        android.view.Window window = this.getWindow();
        if ("dark".equals(mode)) {
            window.setStatusBarColor(android.graphics.Color.parseColor("#121212"));
            window.setNavigationBarColor(android.graphics.Color.parseColor("#121212"));
            int flags = window.getDecorView().getSystemUiVisibility();
            flags &= ~android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            window.getDecorView().setSystemUiVisibility(flags);
        } else {
            window.setStatusBarColor(android.graphics.Color.parseColor("#FFFFFF"));
            window.setNavigationBarColor(android.graphics.Color.parseColor("#FFFFFF"));
            int flags = window.getDecorView().getSystemUiVisibility();
            flags |= android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            window.getDecorView().setSystemUiVisibility(flags);
        }
    }

    @PluginMethod
    public void setSystemBarStyle(PluginCall call) {
        String mode = call.getString("mode", "light");
        setSystemBarStyleNative(mode);
        call.resolve();
    }

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Habit Reminders";
            String description = "Notifications for habit reminders";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel("habit-reminders", name, importance);
            channel.setDescription(description);
            
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
} 