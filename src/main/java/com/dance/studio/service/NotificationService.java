package com.dance.studio.service;

import org.springframework.stereotype.Service;

@Service
@SuppressWarnings("null")
public class NotificationService {

    public void sendPush(String target, String title, String body) {
        // In real app, integrate with Firebase FCM or OneSignal
        System.out.println("📱 PUSH NOTIFICATION to [" + target + "]: " + title + " - " + body);
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
