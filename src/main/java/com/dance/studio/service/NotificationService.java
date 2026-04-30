package com.dance.studio.service;

import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@SuppressWarnings("null")
public class NotificationService {

    public void sendPush(String target, String title, String body) {
        try {
            // Notification payload for system tray/lock screen display when app is in background
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            // Custom data payload that React Native can read when notification is tapped
            Map<String, String> data = new HashMap<>();
            data.put("screen", "NotificationsScreen");
            data.put("click_action", "FLUTTER_NOTIFICATION_CLICK"); // Standard value for cross-platform click handling in many libs
            data.put("title", title);
            data.put("body", body);

            // Android specific configuration to ensure it shows up with high priority and on lock screen
            AndroidConfig androidConfig = AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .setNotification(AndroidNotification.builder()
                            .setChannelId("high_importance_channel") // Ensure React Native side matches this or uses default
                            .setDefaultSound(true)
                            .setDefaultVibrateTimings(true)
                            .setVisibility(AndroidNotification.Visibility.PUBLIC) // Shows fully on lock screen
                            .build())
                    .build();

            Message message = Message.builder()
                    .setToken(target)
                    .setNotification(notification)
                    .putAllData(data)
                    .setAndroidConfig(androidConfig)
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("📱 PUSH NOTIFICATION SUCCESS to [" + target + "]: " + response);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("📱 PUSH NOTIFICATION FAILED to [" + target + "]: " + e.getMessage());
        }
    }

    public void sendSMS(String mobile, String message) {
        // In real app, integrate with Twilio or MSG91
        System.out.println("💬 SMS to [" + mobile + "]: " + message);
    }

    public void sendEmail(String email, String subject, String body) {
        // In real app, integrate with AWS SES or SendGrid
        System.out.println("📧 EMAIL to [" + email + "]: " + subject);
    }
}

