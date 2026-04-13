import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineStatus from './src/components/OfflineStatus';
import Footer from './src/components/Footer';
import { AuthProvider } from './src/context/AuthContext';

import {
  createNotificationChannels,
  requestNotificationPermission,
  getFCMToken,
  listenForForegroundMessages,
  listenForTokenRefresh,
  listenForNotificationOpenedApp,
  getInitialNotification,
} from './src/utils/fcmService';

export default function App() {
  useEffect(() => {
    let unsubscribeForeground;
    let unsubscribeTokenRefresh;
    let unsubscribeOpened;

    const initFCM = async () => {
      // 1. Create Android notification channels
      await createNotificationChannels();

      // 2. Request permission (Android 13+ requires explicit permission)
      const permitted = await requestNotificationPermission();
      if (!permitted) return;

      // 3. Get device FCM token (stored in AsyncStorage for later upload to backend)
      await getFCMToken();

      // 4. Handle foreground messages (app is in foreground)
      unsubscribeForeground = listenForForegroundMessages();

      // 5. Refresh token listener
      unsubscribeTokenRefresh = listenForTokenRefresh((newToken) => {
        console.log('[App] FCM Token refreshed:', newToken);
        // TODO: send newToken to your backend here
      });

      // 6. App opened from background notification tap
      unsubscribeOpened = listenForNotificationOpenedApp((remoteMessage) => {
        console.log('[App] Notification opened app from background:', remoteMessage);
        // TODO: navigate to a specific screen based on remoteMessage.data
      });

      // 7. App opened from quit state by tapping a notification
      const initialMessage = await getInitialNotification();
      if (initialMessage) {
        console.log('[App] Notification opened app from quit state:', initialMessage);
        // TODO: handle deep navigation based on initialMessage.data
      }
    };

    initFCM();

    return () => {
      if (unsubscribeForeground)   unsubscribeForeground();
      if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
      if (unsubscribeOpened)       unsubscribeOpened();
    };
  }, []);

  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <OfflineStatus />
        <View style={{ flex: 1 }}>
          <AppNavigator />
        </View>
        <Footer />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151540', // Brand Navy Dark
  },
});
