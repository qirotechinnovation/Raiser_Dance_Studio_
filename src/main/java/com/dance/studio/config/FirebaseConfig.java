package com.dance.studio.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-credentials.json");

                if (serviceAccount == null) {
                    System.err.println("Firebase credentials file not found in resources!");
                    return;
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("Firebase application has been initialized successfully.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error initializing Firebase: " + e.getMessage());
        }
    }
}
