import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, FlatList, Animated, TouchableOpacity,
  StyleSheet, RefreshControl, Alert
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import studentService from "../../api/studentService";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";

export default function MyReminders() {
  const navigation = useNavigation();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Start at 1 so the screen is always visible — animation is just a bonus effect
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");
      if (!studentId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Animate out slightly while loading
      Animated.timing(fadeAnim, { toValue: 0.4, duration: 200, useNativeDriver: true }).start();

      const res = await studentService.getNotifications(studentId);

      // Safely extract array from any API response shape
      let data = res?.data;
      if (!Array.isArray(data)) {
        // Handle common wrapped shapes: { data: [], content: [], notifications: [] }
        data = data?.notifications ?? data?.content ?? data?.data ?? [];
      }
      if (!Array.isArray(data)) {
        data = [];
      }

      setReminders(data);

      // Animate back in
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    } catch (e) {
      console.log("Error loading reminders:", e);
      setReminders([]);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReminders();
  }, []);

  const handleNotificationClick = (item) => {
    try {
      if (item.type === 'BOOKING_UPDATE') {
        navigation.navigate('StudioMyBookings');
      } else if (item.type === 'NEW_EVENT' || item.type === 'EVENT_CONFIRMED') {
        navigation.navigate('MyEvents');
      } else if (item.type === 'FEE_REMINDER') {
        navigation.navigate('StudentFeeStructure');
      } else if (item.type === 'EVENT_CANCELLED') {
        Alert.alert("Event Cancelled", item.message || "An event has been cancelled.");
      } else {
        // For unknown types, just show the message
        if (item.message) {
          Alert.alert(item.title || "Notification", item.message);
        }
      }
    } catch (err) {
      console.log("Navigation error:", err);
    }
  };

  const renderItem = ({ item, index }) => {
    // Defensively fall back for any field that might be null/undefined
    let title = item?.title;
    if (!title) {
      if (item?.type === 'FEE_REMINDER') title = 'Fee Reminder';
      else if (item?.type === 'EVENT_CANCELLED') title = 'Event Cancelled';
      else if (item?.type === 'BOOKING_UPDATE') title = 'Booking Update';
      else if (item?.type === 'NEW_EVENT') title = 'New Event';
      else title = 'Notification';
    }

    const timestamp = item?.timestamp ?? item?.createdAt;
    const date = item?.date
      || (timestamp ? new Date(timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Just now');
    const message = item?.message ?? '';
    const isCancelled = item?.type === 'EVENT_CANCELLED';
    const isFee = item?.type === 'FEE_REMINDER';
    const isBooking = item?.type === 'BOOKING_UPDATE';

    let iconName = "bell-ring-outline";
    let iconColor = Colors.PRIMARY;
    let iconBg = '#F0F4FF';

    if (isFee) { iconName = "cash-multiple"; iconColor = "#D97706"; iconBg = "#FFFBEB"; }
    else if (isCancelled) { iconName = "calendar-remove"; iconColor = Colors.DANGER; iconBg = "#FEF2F2"; }
    else if (isBooking) { iconName = "calendar-check-outline"; iconColor = "#059669"; iconBg = "#ECFDF5"; }

    return (
      <TouchableOpacity
        style={[styles.card, isCancelled && styles.cancelledCard]}
        onPress={() => handleNotificationClick(item)}
        activeOpacity={0.75}
      >
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Icon name={iconName} size={26} color={iconColor} />
        </View>
        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardTitle, isCancelled && { color: Colors.DANGER }]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>
          {!!message && (
            <Text style={styles.messageText} numberOfLines={2}>{message}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BaseScreen title="Reminders" loading={loading} isScrollable={false} useGradient={true} showFooter={false}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={reminders}
          keyExtractor={(item, index) => (item?.id != null ? item.id.toString() : `reminder-${index}`)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.PRIMARY]}
              tintColor={Colors.PRIMARY}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon name="bell-sleep-outline" size={50} color={Colors.PRIMARY} />
              </View>
              <Text style={styles.emptyTitle}>All Clear!</Text>
              <Text style={styles.emptyText}>You have no notifications right now.</Text>
            </View>
          }
        />
      </Animated.View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  cancelledCard: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFFAFA',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: { flex: 1 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  messageText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 19,
  },
  dateText: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
    flexShrink: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
  },
});
