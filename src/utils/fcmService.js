/**
 * FCM Service — Firebase Cloud Messaging + Notifee
 * Handles:
 *  - Permission request (Android 13+)
 *  - FCM token retrieval & refresh
 *  - Foreground, Background, and Quit-state notifications
 */

import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Channel IDs ────────────────────────────────────────────────────────────
const CHANNEL_ID_DEFAULT   = 'dance_studio_general';
const CHANNEL_ID_IMPORTANT = 'dance_studio_important';

// ─── Create Notifee Channels (call once on app start) ───────────────────────
export const createNotificationChannels = async () => {
  await notifee.createChannel({
    id:          CHANNEL_ID_DEFAULT,
    name:        'General Notifications',
    description: 'General Dance Studio notifications',
    importance:  AndroidImportance.DEFAULT,
    vibration:   true,
  });

  await notifee.createChannel({
    id:          CHANNEL_ID_IMPORTANT,
    name:        'Important Alerts',
    description: 'Fee reminders, batch updates, announcements',
    importance:  AndroidImportance.HIGH,
    vibration:   true,
    sound:       'default',
  });
};

// ─── Request Permission ──────────────────────────────────────────────────────
export const requestNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('[FCM] Permission granted:', authStatus);
  } else {
    console.log('[FCM] Permission denied');
  }

  return enabled;
};

// ─── Get & Store FCM Token ───────────────────────────────────────────────────
export const getFCMToken = async () => {
  try {
    const cachedToken = await AsyncStorage.getItem('fcmToken');
    if (cachedToken) {
      console.log('[FCM] Cached token:', cachedToken);
      return cachedToken;
    }

    const token = await messaging().getToken();
    await AsyncStorage.setItem('fcmToken', token);
    console.log('[FCM] New token:', token);
    return token;
  } catch (error) {
    console.error('[FCM] Error getting token:', error);
    return null;
  }
};

// ─── Display Notification with Notifee ──────────────────────────────────────
export const displayNotification = async (remoteMessage) => {
  const { notification, data } = remoteMessage;
  const title   = notification?.title || data?.title || 'Dance Studio';
  const body    = notification?.body  || data?.body  || '';
  const isImportant = data?.priority === 'high';

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId:   isImportant ? CHANNEL_ID_IMPORTANT : CHANNEL_ID_DEFAULT,
      importance:  isImportant ? AndroidImportance.HIGH : AndroidImportance.DEFAULT,
      smallIcon:   'ic_notification',        // drawable resource name (fallback to app icon if missing)
      color:       '#C62A47',                // brand red
      pressAction: { id: 'default' },
      style: body.length > 60
        ? { type: AndroidStyle.BIGTEXT, text: body }
        : undefined,
    },
    data: data || {},
  });
};

// ─── Listen for Token Refresh ────────────────────────────────────────────────
export const listenForTokenRefresh = (onNewToken) => {
  return messaging().onTokenRefresh(async (newToken) => {
    await AsyncStorage.setItem('fcmToken', newToken);
    console.log('[FCM] Token refreshed:', newToken);
    if (onNewToken) onNewToken(newToken);
  });
};

// ─── Foreground Message Listener ────────────────────────────────────────────
export const listenForForegroundMessages = () => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('[FCM] Foreground message:', remoteMessage);
    await displayNotification(remoteMessage);
  });
};

// ─── Background Handler (call at module level in index.js) ──────────────────
export const registerBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[FCM] Background message:', remoteMessage);
    await createNotificationChannels();
    await displayNotification(remoteMessage);
  });
};

// ─── Handle Notification that Opened the App ────────────────────────────────
export const getInitialNotification = async () => {
  const remoteMessage = await messaging().getInitialNotification();
  if (remoteMessage) {
    console.log('[FCM] App opened from quit state via notification:', remoteMessage);
    return remoteMessage;
  }
  return null;
};

// ─── Listen for App Opened from Background Notification ─────────────────────
export const listenForNotificationOpenedApp = (callback) => {
  return messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('[FCM] App opened from background via notification:', remoteMessage);
    if (callback) callback(remoteMessage);
  });
};
