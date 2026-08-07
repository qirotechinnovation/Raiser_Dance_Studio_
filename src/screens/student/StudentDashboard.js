import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar, Animated, ActivityIndicator, Alert, RefreshControl, Modal, TextInput, Easing, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import studentService from "../../api/studentService";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import API from "../../api/axios";
import notifee, { AndroidImportance } from '@notifee/react-native';
import { AuthContext } from "../../context/AuthContext";
import Footer from "../../components/Footer";
import Colors from "../../theme/Colors";
// Standard Theme Colors
const CONTENT_BG = Colors.BG_CONTENT;

// --- Animated Button Component ---
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedBtn = ({ onPress, style, children, disabled }) => {
  const scaleVal = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scaleVal, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleVal, { toValue: 1, useNativeDriver: true }).start();

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.9}
      disabled={disabled}
      style={[style, { transform: [{ scale: scaleVal }] }]}
    >
      {children}
    </AnimatedTouchable>
  );
};

// --- Stat Widget Component ---
function StatWidget({ label, value, icon, color, iconColor, onPress }) {
  return (
    <TouchableOpacity style={styles.statWidget} onPress={onPress} disabled={!onPress}>
      <View style={[styles.widgetIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={22} color={iconColor} />
      </View>
      <View>
        <Text style={styles.widgetValue} numberOfLines={1}>{value}</Text>
        <Text style={styles.widgetLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function StudentDashboard({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [highlights, setHighlights] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const insets = useSafeAreaInsets();

  // Staggered animations for sections
  const sectionAnims = useRef([
    new Animated.Value(0), // Schedule
    new Animated.Value(0), // Overview
    new Animated.Value(0), // Studio Events
    new Animated.Value(0), // Upcoming Holidays
    new Animated.Value(0), // Studio Highlights
    new Animated.Value(0), // Control Center
  ]).current;

  // Inquiry Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Header Bubbles for Zigzag
  const bubble1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const bubble2 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    fetchDashboard();
    checkNotifications(); // Initial check

    // Zigzag Animation
    const floatZigZag = (anim, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: { x: 20, y: -20 }, duration: 1500, delay: delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: { x: -25, y: -10 }, duration: 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: { x: 10, y: 15 }, duration: 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: { x: 0, y: 0 }, duration: 1500, useNativeDriver: true })
        ])
      ).start();
    };

    floatZigZag(bubble1, 0);
    floatZigZag(bubble2, 1000);

    // Polling for notifications every 60 seconds
    const interval = setInterval(() => {
      checkNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // REAL-TIME DATA: Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
      return () => { };
    }, [])
  );

  const checkNotifications = async () => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");
      if (!studentId) return;

      const res = await studentService.getNotifications(studentId);
      const notifs = (res.data || []).filter(n => !n.read); // Only consider unread

      if (notifs.length > 0) {
        const latest = notifs[0];
        const lastId = await AsyncStorage.getItem("lastNotifId");

        if (String(latest.id) !== lastId) {
          await AsyncStorage.setItem("lastNotifId", String(latest.id));

          // Additional safety: Don't show fee reminder if dashboard shows PAID
          if (latest.type === 'FEE_REMINDER' && dashboardData?.feeStatus === 'PAID') {
            return;
          }

          let title = "New Notification";
          if (latest.type === 'EVENT_CANCELLED') title = "Event Cancelled!";
          else if (latest.type === 'FEE_REMINDER') title = "Fee Reminder";
          else if (latest.type === 'NEW_EVENT') title = "New Event!";
          else if (latest.type === 'BOOKING_UPDATE') title = "Booking Update";
          else if (latest.title) title = latest.title;

          triggerSystemNotification(title, latest.message);
        }
      }
    } catch (e) {
      console.log("Polling error", e);
    }
  };

  const triggerSystemNotification = async (title, body) => {
    try {
      if (!notifee) {
        console.warn("Notifee module is not available");
        return;
      }

      await notifee.requestPermission();

      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        title: title,
        body: body,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (e) {
      console.error("System notification failed:", e);
    }
  };

  const runEntranceAnim = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.stagger(100, sectionAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        })
      ))
    ]).start();
  };

  const fetchDashboard = async () => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");
      if (studentId) {
        const [dashboardRes, profileRes] = await Promise.all([
          studentService.getDashboard(studentId).catch(() => ({ data: {} })),
          studentService.getProfile(studentId).catch(() => ({ data: {} })),
        ]);

        const data = dashboardRes.data || {};
        // Fetch holidays based on batch if available
        const holidayRes = data.batchId ? await studentService.getUpcomingHolidays(data.batchId).catch(() => ({ data: [] })) : { data: [] };
        const profData = profileRes.data || {};
        const baseURL = API.defaults.baseURL;

        setDashboardData({
          studentId: studentId,
          name: data.welcomeName || "Student",
          batchName: data.batchName && data.batchName !== "General Batch" ? data.batchName : "No Batch Assigned",
          batchTime: data.todayBatchTiming || "No Class Today",
          instructor: data.instructor || "N/A",
          isPaid: data.feeStatus === "PAID",
          pendingAmount: data.pendingAmount || 0,
          nextEvent: data.nextEvent,
          feeMonth: data.feeMonth || "Month",
          checkedInToday: data.checkedInToday || false,
          attendanceStatus: data.attendanceStatus || "NOT_MARKED",
          latestUpdates: data.latestUpdates || [],
          attendanceCount: data.attendanceCount || 0,
          attendanceRate: data.attendanceRate || 0,
          recentPayments: data.recentPayments || [],
          batchMatesCount: data.batchMatesCount || 0,
          danceTypeInfo: data.danceTypeInfo || null,
          todayActivity: data.todayActivity || null,
          avatar: profData.profilePic
            ? `${baseURL}/uploads/profiles/${profData.profilePic}`
            : "https://randomuser.me/api/portraits/women/44.jpg"
        });
        setHolidays(holidayRes.data || []);
        setHighlights(data.highlights || []);
      } else {
        setDashboardData(prev => prev || {
          name: "Student",
          batchName: "General Batch",
          batchTime: "Check Schedule",
          instructor: "Instructor",
          isPaid: true,
          pendingAmount: 0,
          attendanceCount: 0,
          attendanceRate: 0,
          latestUpdates: []
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard", error);
    } finally {
      runEntranceAnim();
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    if (dashboardData?.checkedInToday) {
      Alert.alert("Info", "You are already checked in for today.");
      return;
    }
    try {
      const idToCheck = dashboardData?.studentId || await AsyncStorage.getItem("studentId");
      if (!idToCheck) return;
      const res = await studentService.checkIn(idToCheck);

      if (res.data.success === false) {
        Alert.alert("Check-in Failed", res.data.message);
      } else {
        // Success! Updated logic confirms presence
        Alert.alert("Success", res.data.message || "Attendance marked successfully! Admin has been notified.");
        setDashboardData(prev => ({ ...prev, checkedInToday: true, attendanceStatus: "PRESENT" }));
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Check-in failed. Please try again.");
    }
  };

  const handleOpenInquiry = (event) => {
    setSelectedEvent(event);
    setInquiryMessage("I am interested in this event.");
    setModalVisible(true);
  };

  const submitInquiry = async () => {
    if (!inquiryMessage.trim()) {
      Alert.alert("Required", "Please enter a message.");
      return;
    }
    setSubmitting(true);
    try {
      await studentService.submitEventInquiry({
        studentId: dashboardData.studentId,
        eventId: selectedEvent.id,
        message: inquiryMessage
      });
      Alert.alert("Success", "Inquiry sent! Admin will review it.");
      setModalVisible(false);
    } catch (error) {
      console.error("Inquiry error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to send inquiry.";
      Alert.alert("Error", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  const events = dashboardData?.latestUpdates || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Stylish Gradient Header */}
      <LinearGradient
        colors={[Colors.PRIMARY, "#000000"]}
        style={[styles.header, {
          paddingTop: Math.max(insets.top + 15, Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 15 : 60),
          minHeight: 200 // Ensure valid height
        }]}
      >
        {/* Animated Zigzag Bubbles */}
        <Animated.View style={{
          position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', top: 20, left: 20,
          transform: bubble1.getTranslateTransform()
        }} />
        <Animated.View style={{
          position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)', top: 50, right: -20,
          transform: bubble2.getTranslateTransform()
        }} />

        {/* Decorative Background Circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />

        <View style={styles.headerTop}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={{ marginLeft: 15, flex: 1 }}>
            <View style={styles.welcomeBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.greetingTitle}>LIVE DASHBOARD</Text>
            </View>
            <Text style={styles.greetingName}>{dashboardData?.name || "Student"}</Text>
          </View>
          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.notifBtnSmall} onPress={() => navigation.navigate("MyReminders")} activeOpacity={0.7}>
              <Icon name="bell-outline" size={20} color={Colors.WHITE} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Profile")} activeOpacity={0.8} style={styles.avatarTrigger}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: dashboardData?.avatar }}
                  style={styles.avatarSmall}
                />
                <View style={styles.avatarRingSmall} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Content Sheet */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 25 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* 🗓️ Today's Class & Schedule Card */}
            <Animated.View style={{
              opacity: sectionAnims[0],
              transform: [{ translateY: sectionAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>My Schedule</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Schedule")}>
                  <Text style={styles.viewAllText}>Full Week</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{new Date().getDate()}</Text>
                    <Text style={styles.dateMonth}>{new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cardLabel}>TODAY'S CLASS</Text>
                    <Text style={styles.batchNameTitle}>{dashboardData?.todayActivity || dashboardData?.batchName}</Text>
                  </View>
                  {dashboardData?.checkedInToday ? (
                    <View style={[styles.statusTag, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.statusTagText, { color: '#166534' }]}>Present</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {dashboardData?.attendanceStatus === "ABSENT" && (
                        <View style={[styles.statusTag, { backgroundColor: '#FEF2F2', marginRight: 8 }]}>
                          <Text style={[styles.statusTagText, { color: Colors.ERROR }]}>Absent</Text>
                        </View>
                      )}
                      <TouchableOpacity style={styles.checkInBtn} onPress={handleCheckIn}>
                        <Text style={styles.checkInBtnText}>Check In</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.divider} />

                <View style={styles.scheduleDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="clock-time-four-outline" size={18} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>{dashboardData?.batchTime || "No Class"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="account-tie-outline" size={18} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>{dashboardData?.instructor || "Instructor"}</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* 💃 My Wedding Choreography - NEW SECTION */}
            {dashboardData?.sangeetBookings?.length > 0 && (
              <Animated.View style={{
                opacity: sectionAnims[0],
                transform: [{ translateY: sectionAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
              }}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>My Choreography</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("SangeetPackages")}>
                    <Text style={styles.viewAllText}>Manage</Text>
                  </TouchableOpacity>
                </View>

                {dashboardData.sangeetBookings.map((bk, i) => (
                  <TouchableOpacity key={i} style={styles.sangeetCard} activeOpacity={0.9} onPress={() => navigation.navigate("SangeetPackages")}>
                    <LinearGradient colors={[Colors.TEXT_PRIMARY, Colors.PRIMARY_DARK]} style={styles.sangeetGradient}>
                      <View style={styles.sangeetHeader}>
                        <View style={styles.sangeetIconBg}>
                          <Icon name="human-male-female" size={24} color="#FDE68A" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.sangeetPkgName}>{bk.packageName}</Text>
                          <View style={styles.sangeetStatusRow}>
                            <View style={[styles.sangeetStatusTag, { backgroundColor: bk.status === 'BOOKED' ? '#065F46' : '#92400E' }]}>
                              <Text style={styles.sangeetStatusText}>{bk.status}</Text>
                            </View>
                            <Text style={styles.sangeetDateText}>{bk.eventDate}</Text>
                          </View>
                        </View>
                        <View style={styles.sangeetPriceBox}>
                          <Text style={styles.sangeetPriceLabel}>FEE</Text>
                          <Text style={styles.sangeetPriceText}>₹{bk.feeAmount || 0}</Text>
                        </View>
                      </View>
                      <View style={styles.sangeetFooter}>
                        <Icon name={bk.paymentStatus === 'PAID' ? "check-circle" : "alert-circle"} size={16} color={bk.paymentStatus === 'PAID' ? "#10B981" : "#FBBF24"} />
                        <Text style={[styles.sangeetPaymentStatus, { color: bk.paymentStatus === 'PAID' ? "#10B981" : "#FBBF24" }]}>
                          Payment: {bk.paymentStatus}
                        </Text>
                        <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}

            {/* 🎛️ Control Center - MOVED UP FOR ACCESSIBILITY */}
            <Animated.View style={{
              opacity: sectionAnims[5],
              transform: [{ translateY: sectionAnims[5].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                <AnimatedBtn style={styles.actionItem} onPress={() => navigation.navigate("Schedule")}>
                  <View style={[styles.actionIcon, { backgroundColor: "#FFF1F2" }]}>
                    <Icon name="calendar-clock" size={24} color={Colors.PRIMARY} />
                  </View>
                  <Text style={styles.actionLabel}>Schedule</Text>
                </AnimatedBtn>

                <AnimatedBtn style={styles.actionItem} onPress={() => navigation.navigate("BatchEnrollment")}>
                  <View style={[styles.actionIcon, { backgroundColor: "#FEF3C7" }]}>
                    <Icon name="account-plus-outline" size={24} color="#D97706" />
                  </View>
                  <Text style={styles.actionLabel}>Join Batch</Text>
                </AnimatedBtn>

                <AnimatedBtn style={styles.actionItem} onPress={() => navigation.navigate("SangeetPackages")}>
                  <View style={[styles.actionIcon, { backgroundColor: "#FAE8FF" }]}>
                    <Icon name="human-male-female" size={24} color="#D946EF" />
                  </View>
                  <Text style={styles.actionLabel}>Choreography</Text>
                </AnimatedBtn>

                <AnimatedBtn style={styles.actionItem} onPress={() => navigation.navigate("StudentInquiries")}>
                  <View style={[styles.actionIcon, { backgroundColor: "#F0FDF4" }]}>
                    <Icon name="message-text-clock-outline" size={24} color="#16A34A" />
                  </View>
                  <Text style={styles.actionLabel}>Inquiries</Text>
                </AnimatedBtn>

                <AnimatedBtn style={styles.actionItem} onPress={() => navigation.navigate("MyEvents")}>
                  <View style={[styles.actionIcon, { backgroundColor: "#EFF6FF" }]}>
                    <Icon name="star-face" size={24} color="#2563EB" />
                  </View>
                  <Text style={styles.actionLabel}>My Events</Text>
                </AnimatedBtn>

                <AnimatedBtn style={styles.actionItem} onPress={() => navigation.navigate("MyReminders")}>
                  <View style={[styles.actionIcon, { backgroundColor: "#E0E7FF" }]}>
                    <Icon name="bell-badge-outline" size={24} color="#4F46E5" />
                  </View>
                  <Text style={styles.actionLabel}>Alerts</Text>
                </AnimatedBtn>

                <AnimatedBtn style={styles.actionItem} onPress={() => navigation.navigate("PodcastHome")}>
                  <View style={[styles.actionIcon, { backgroundColor: Colors.TEXT_PRIMARY }]}>
                    <Icon name="podcast" size={24} color={Colors.WHITE} />
                  </View>
                  <Text style={styles.actionLabel}>Podcast</Text>
                </AnimatedBtn>

                <AnimatedBtn style={styles.actionItem} onPress={() => navigation.navigate("StudentFeeStructure")}>
                  <View style={[styles.actionIcon, { backgroundColor: "#FDF4FF" }]}>
                    <Icon name="currency-inr" size={24} color="#A21CAF" />
                  </View>
                  <Text style={styles.actionLabel}>Fee Plans</Text>
                </AnimatedBtn>

                <AnimatedBtn style={styles.actionItem} onPress={() => navigation.navigate("AboutUs")}>
                  <View style={[styles.actionIcon, { backgroundColor: "#FFF7ED" }]}>
                    <Icon name="town-hall" size={24} color="#EA580C" />
                  </View>
                  <Text style={styles.actionLabel}>Studio</Text>
                </AnimatedBtn>

                <AnimatedBtn style={styles.actionItem} onPress={() => navigation.navigate("StudentGallery")}>
                  <View style={[styles.actionIcon, { backgroundColor: "#ECFDF5" }]}>
                    <Icon name="image-multiple" size={24} color="#059669" />
                  </View>
                  <Text style={styles.actionLabel}>Gallery</Text>
                </AnimatedBtn>
              </View>
            </Animated.View>

            {/* 📊 Quick Stats Grid & Attendance Visualizer */}
            <Animated.View style={{
              opacity: sectionAnims[1],
              transform: [{ translateY: sectionAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Performance Overview</Text>

              {/* Attendance Progress Card */}
              <TouchableOpacity style={styles.attendanceProgressCard} activeOpacity={0.9} onPress={() => navigation.navigate("BatchEnrollment")}>
                <View style={styles.attendanceInfo}>
                  <Text style={styles.attendanceLabel}>Monthly Attendance</Text>
                  <Text style={styles.attendanceValue}>{dashboardData?.attendanceRate || 0}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <Animated.View style={[styles.progressBarFill, { width: `${dashboardData?.attendanceRate || 0}%` }]} />
                </View>
                <Text style={styles.attendanceSubText}>You've attended {dashboardData?.attendanceCount || 0} sessions so far this month.</Text>
              </TouchableOpacity>

              <View style={styles.grid}>
                <StatWidget
                  label="Fee Status" value={dashboardData?.isPaid ? "Paid" : `Due: ₹${dashboardData?.pendingAmount}`}
                  icon="wallet-outline" color="#F0FDF4" iconColor={dashboardData?.isPaid ? "#16A34A" : "#E11D48"}
                  onPress={() => navigation.navigate("Progress")}
                />
                <StatWidget
                  label="Tribe Mates" value={`${dashboardData?.batchMatesCount || 0} Members`}
                  icon="account-group-outline" color="#EFF6FF" iconColor="#2563EB"
                  onPress={() => navigation.navigate("BatchEnrollment")}
                />
              </View>

              {/* Latest Payment Highlight */}
              {dashboardData?.recentPayments?.length > 0 && (
                <View style={styles.paymentHighlight}>
                  <View style={styles.paymentIcon}>
                    <Icon name="check-decagram" size={24} color="#16A34A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentLabel}>LATEST PAYMENT</Text>
                    <Text style={styles.paymentText}>₹{dashboardData.recentPayments[0].amount} for {dashboardData.recentPayments[0].plan}</Text>
                  </View>
                  <Text style={styles.paymentDate}>{dashboardData.recentPayments[0].date}</Text>
                </View>
              )}
            </Animated.View>

            {/* 🎉 Upcoming Events */}
            <Animated.View style={{
              opacity: sectionAnims[2],
              transform: [{ translateY: sectionAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Studio Events</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Schedule", { screen: 'EVENTS' })}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {events.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                  {events.map((event, index) => (
                    <TouchableOpacity key={index} style={styles.eventCard} onPress={() => handleOpenInquiry(event)}>
                      <View style={styles.eventImagePlaceholder}>
                        <Icon name="cards-heart" size={32} color={Colors.WHITE} />
                        <View style={styles.eventTypeTag}>
                          <Text style={styles.eventTypeTagText}>{event.type}</Text>
                        </View>
                      </View>
                      <View style={styles.eventCardContent}>
                        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                        <Text style={styles.eventDate}>{event.sub}</Text>
                        <View style={styles.inquireBtn}>
                          <Text style={styles.inquireText}>Inquire Now</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyEventBox}>
                  <Text style={styles.emptyEventText}>Upcoming events will appear here</Text>
                </View>
              )}
            </Animated.View>

            {/* 🗓️ Holidays Section */}
            {holidays && holidays.length > 0 && (
              <Animated.View style={{
                opacity: sectionAnims[3],
                transform: [{ translateY: sectionAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
              }}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Holidays</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                  {holidays.map((h, i) => (
                    <View key={i} style={styles.holidayCard}>
                      <View style={styles.holidayDateBox}>
                        <Text style={styles.holidayDay}>{h.date.split('-')[2]}</Text>
                        <Text style={styles.holidayMonth}>{new Date(h.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</Text>
                      </View>
                      <View style={styles.holidayContent}>
                        <Text style={styles.holidayName} numberOfLines={1}>{h.name}</Text>
                        <Text style={styles.holidayDesc} numberOfLines={1}>{h.description || "Studio Closed"}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

            {/* ✨ Studio Vision */}
            <Animated.View style={{
              opacity: sectionAnims[4],
              transform: [{ translateY: sectionAnims[4].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Studio Vision</Text>
              <TouchableOpacity
                style={styles.visionCard}
                onPress={() => navigation.navigate("AboutUs")}
                activeOpacity={0.9}
              >
                <LinearGradient colors={["#FFF1F2", Colors.WHITE]} style={styles.visionGradient}>
                  <View style={styles.visionHeader}>
                    <Icon name="heart-pulse" size={24} color={Colors.PRIMARY} />
                    <Text style={styles.visionCardTitle}>Passion & Purpose</Text>
                  </View>
                  <Text style={styles.visionCardContent} numberOfLines={3}>
                    Transforming passion into excellence. Discover your potential through expert guidance and a vibrant dancing community.
                  </Text>
                  <View style={styles.visionFooter}>
                    <Text style={styles.visionLink}>Learn More</Text>
                    <Icon name="arrow-right" size={16} color={Colors.PRIMARY} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* 💃 Explore Dance Styles - Modern Promo Card */}
            <Animated.View style={{
              opacity: sectionAnims[5].interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
              transform: [{ scale: sectionAnims[5].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
              marginTop: 30
            }}>
              <LinearGradient colors={[Colors.TEXT_PRIMARY, Colors.PRIMARY_DARK]} style={styles.exploreCard}>
                <View style={styles.exploreContent}>
                  <View style={styles.exploreBadge}>
                    <Text style={styles.exploreBadgeText}>NEW STYLES</Text>
                  </View>
                  <Text style={styles.exploreTitle}>Explore Dance Styles</Text>
                  <Text style={styles.exploreDesc}>From Bollywood to Contemporary, discover your passion with our expert instructors.</Text>
                  <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate("AboutUs")}>
                    <Text style={styles.exploreBtnText}>View All Styles</Text>
                    <Icon name="arrow-right" size={16} color="#000" />
                  </TouchableOpacity>
                </View>
                <Icon name="human-female-dance" size={100} color="rgba(255,255,255,0.05)" style={styles.exploreIcon} />
              </LinearGradient>
            </Animated.View>

            <Footer />
          </Animated.View>
        </ScrollView>
      </View>

      {/* Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)} >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Inquire about Event</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Type your question..."
              multiline
              value={inquiryMessage}
              onChangeText={setInquiryMessage}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitInquiry} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color={Colors.WHITE} /> : <Text style={styles.submitText}>Send</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.PRIMARY },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 25,
    paddingBottom: 40, // Increased bottom padding
    minHeight: 220, // Increased minHeight
    position: 'relative',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  // Decorative circles for modern look
  decorCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    top: 40,
    right: 80,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  decorCircle3: {
    position: 'absolute',
    bottom: -20,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10
  },
  headerLogo: {
    width: 56,
    height: 56,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  notifBtnSmall: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  avatarTrigger: {
    marginLeft: 4,
  },
  avatarContainer: {
    position: 'relative'
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarRingSmall: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
    marginRight: 6
  },
  greetingTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.WHITE,
    letterSpacing: 1
  },
  greetingName: {
    fontSize: 26,
    color: Colors.WHITE,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },

  contentContainer: {
    flex: 1,
    backgroundColor: CONTENT_BG,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    paddingHorizontal: 20,
    overflow: 'hidden'
  },

  // Schedule Card
  scheduleCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: Colors.TEXT_SECONDARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center' },
  dateBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3'
  },
  dateDay: { fontSize: 16, fontWeight: 'bold', color: Colors.PRIMARY },
  dateMonth: { fontSize: 10, color: '#9F1239', fontWeight: '700' },
  cardLabel: { fontSize: 10, color: Colors.TEXT_MUTED, fontWeight: '800', letterSpacing: 1 },
  batchNameTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginTop: 2 },
  checkInBtn: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, elevation: 2 },
  checkInBtnText: { color: Colors.WHITE, fontSize: 12, fontWeight: 'bold' },
  statusTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusTagText: { fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  scheduleDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, color: '#475569', fontWeight: '500' },

  // Updated Grid
  grid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  statWidget: {
    width: "48%",
    backgroundColor: Colors.WHITE,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.TEXT_SECONDARY,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  widgetIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  widgetValue: { fontSize: 16, fontWeight: "900", color: Colors.PRIMARY_DARK, textAlign: 'center' },
  widgetLabel: { fontSize: 10, color: Colors.TEXT_MUTED, fontWeight: "800", marginTop: 4, letterSpacing: 0.5, textTransform: 'uppercase' },

  // Attendance Card
  attendanceProgressCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 0.8)',
  },
  attendanceInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  attendanceLabel: { fontSize: 13, fontWeight: '700', color: Colors.TEXT_SECONDARY },
  attendanceValue: { fontSize: 24, fontWeight: '800', color: Colors.TEXT_PRIMARY },
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: Colors.PRIMARY, borderRadius: 4 },
  attendanceSubText: { fontSize: 11, color: Colors.TEXT_MUTED, fontWeight: '500' },

  // Payment Highlight
  paymentHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 15,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7'
  },
  paymentIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  paymentLabel: { fontSize: 9, fontWeight: '800', color: '#166534', letterSpacing: 0.5 },
  paymentText: { fontSize: 12, fontWeight: '600', color: Colors.TEXT_PRIMARY, marginTop: 1 },
  paymentDate: { fontSize: 10, color: '#166534', fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 12, marginTop: 5 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, marginTop: 25 },
  viewAllText: { color: Colors.PRIMARY, fontSize: 13, fontWeight: "700" },

  // Events
  eventCard: { width: 170, backgroundColor: Colors.WHITE, borderRadius: 20, marginRight: 15, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, paddingBottom: 12 },
  eventImagePlaceholder: { height: 90, backgroundColor: Colors.PRIMARY, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  eventTypeTag: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  eventTypeTagText: { color: Colors.WHITE, fontSize: 9, fontWeight: 'bold' },
  eventCardContent: { padding: 12 },
  eventTitle: { fontSize: 14, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 4 },
  eventDate: { fontSize: 11, color: Colors.TEXT_SECONDARY, marginBottom: 10, fontWeight: '500' },
  inquireBtn: { backgroundColor: '#F1F5F9', paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  inquireText: { color: Colors.TEXT_PRIMARY, fontSize: 11, fontWeight: '700' },
  emptyEventBox: { padding: 20, alignItems: 'center', backgroundColor: Colors.BG_CONTENT, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  emptyEventText: { color: Colors.TEXT_MUTED, fontSize: 13, fontWeight: '500' },

  // Actions (Control Center)
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionItem: {
    width: '31%',
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    borderWidth: 1,
    borderColor: Colors.BG_CONTENT
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: { fontSize: 11, fontWeight: '700', color: '#334155', textAlign: 'center' },

  // Check in
  checkinBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  checkinText: { fontSize: 10, fontWeight: "bold" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: Colors.WHITE, borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.PRIMARY, marginBottom: 5 },
  modalInput: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top', backgroundColor: Colors.BG_CONTENT, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 15 },
  submitBtn: { backgroundColor: Colors.PRIMARY, paddingVertical: 10, paddingHorizontal: 25, borderRadius: 12 },
  cancelText: { color: Colors.TEXT_SECONDARY, fontWeight: 'bold' },
  submitText: { color: Colors.WHITE, fontWeight: 'bold' },

  // Holiday Card Styles
  holidayCard: {
    width: 200,
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    padding: 12,
    marginRight: 15,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  holidayDateBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  holidayDay: { fontSize: 16, fontWeight: 'bold', color: Colors.ERROR },
  holidayMonth: { fontSize: 9, color: Colors.ERROR, fontWeight: 'bold' },
  holidayContent: { flex: 1 },
  holidayName: { fontSize: 14, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
  holidayDesc: { fontSize: 11, color: Colors.TEXT_SECONDARY, marginTop: 2 },

  // Highlight Cards styles
  highlightCard: {
    width: 220,
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    padding: 18,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05
  },
  highlightIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 6
  },
  highlightContent: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 18
  },

  // Explore Card
  exploreCard: {
    borderRadius: 24,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20
  },
  exploreContent: { flex: 1, zIndex: 1 },
  exploreBadge: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  exploreBadgeText: { color: Colors.WHITE, fontSize: 10, fontWeight: '800' },
  exploreTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.WHITE, marginBottom: 8 },
  exploreDesc: { fontSize: 13, color: Colors.TEXT_MUTED, lineHeight: 20, marginBottom: 20 },
  exploreBtn: { backgroundColor: Colors.WHITE, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  exploreBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  exploreIcon: { position: 'absolute', right: -20, bottom: -10 },

  // Vision Card
  visionCard: {
    borderRadius: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 228, 230, 0.5)',
  },
  visionGradient: {
    padding: 20,
  },
  visionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  visionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
  },
  visionCardContent: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 15,
  },
  visionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  visionLink: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },

  // Sangeet Card Styles
  sangeetCard: {
    borderRadius: 24,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  sangeetGradient: {
    padding: 18,
  },
  sangeetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  sangeetIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(253, 230, 138, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sangeetPkgName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.WHITE,
    letterSpacing: 0.3
  },
  sangeetStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8
  },
  sangeetStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sangeetStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.WHITE,
    letterSpacing: 0.5
  },
  sangeetDateText: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    fontWeight: '500'
  },
  sangeetPriceBox: {
    alignItems: 'flex-end'
  },
  sangeetPriceLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    letterSpacing: 1
  },
  sangeetPriceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FDE68A',
    marginTop: 2
  },
  sangeetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 6
  },
  sangeetPaymentStatus: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5
  }
});
