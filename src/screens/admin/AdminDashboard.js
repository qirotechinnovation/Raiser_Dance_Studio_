import React, { useEffect, useState, useRef, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Dimensions, Alert, RefreshControl, Animated, StatusBar, Platform, Modal } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import adminService from "../../api/adminService";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../api/axios";
import Colors from "../../theme/Colors";
import { AuthContext } from "../../context/AuthContext";
import BaseScreen from "../../components/BaseScreen";
import QuickActionModal from "../../components/QuickActionModal";
import Footer from "../../components/Footer";

// Layout constants to match SignupScreen style
const HEADER_BG = Colors.PRIMARY;
const CONTENT_BG = Colors.BG_CONTENT;

const ACTION_HUB = [
  { id: 1, title: "Students", sub: "Profiles", icon: "account-details-outline", color: "#F0FDF4", iconColor: "#16A34A", screen: "StudentManagement" },
  { id: 2, title: "Attendance", sub: "Tracker", icon: "calendar-check", color: "#F1F5F9", iconColor: "#475569", screen: "AttendanceManagement" },
  { id: 3, title: "Fees", sub: "Collection", icon: "currency-inr", color: "#FFF1F2", iconColor: "#E11D48", screen: "FeeManagement" },
  { id: 4, title: "Batches", sub: "Classes", icon: "theater", color: "#EFF6FF", iconColor: "#2563EB", screen: "BatchManagement" },
  { id: 11, title: "Schedule", sub: "Weekly", icon: "calendar-multiselect", color: "#F0F9FF", iconColor: "#0EA5E9", screen: "ScheduleScreen" },
  { id: 5, title: "Events", sub: "Manage", icon: "calendar-star-outline", color: "#FFFBEB", iconColor: "#D97706", screen: "EventsCategories" },
  { id: 6, title: "Wedding Choreography", sub: "Packages", icon: "human-male-female", color: "#FDF2F8", iconColor: "#DB2777", screen: "AdminSangeetPackages" },
  { id: 7, title: "Event Inquiries", sub: "Events", icon: "message-question-outline", color: "#FEF3C7", iconColor: "#D97706", screen: "AdminEventInquiries" },
  { id: 8, title: "Choreo", sub: "Leads", icon: "account-heart", color: "#FCE7F3", iconColor: Colors.PRIMARY, screen: "SangeetInquiries" },
  { id: 9, title: "Reminders", sub: "Alerts", icon: "bell-ring-outline", color: "#E0E7FF", iconColor: "#4F46E5", screen: "FeeReminders" },
  { id: 10, title: "Cancellations", sub: "Requests", icon: "calendar-remove-outline", color: "#FEF2F2", iconColor: "#DC2626", screen: "AdminCancellationScreen" },
  { id: 12, title: "Studio Bookings", sub: "Podcast", icon: "podcast", color: "#F0F9FF", iconColor: "#000", screen: "StudioBookingsScreen" },
  { id: 13, title: "User Credentials", sub: "View Logins", icon: "shield-key", color: "#F3E8FF", iconColor: "#9333EA", screen: "CREDENTIALS_MODAL" },
  { id: 14, title: "Skill Levels", sub: "Manage", icon: "stairs", color: "#E0F2FE", iconColor: "#0284C7", screen: "SkillLevels" },
  { id: 15, title: "Studio Enquiries", sub: "Walk-ins", icon: "account-search", color: "#F0FDFA", iconColor: "#0D9488", screen: "StudioInquiriesList" },
  { id: 16, title: "Dance Types", sub: "Manage", icon: "human-female-dance", color: "#FFF7ED", iconColor: "#EA580C", screen: "DanceTypesManagement" },
  { id: 18, title: "Settings", sub: "Global", icon: "cog-outline", color: Colors.BG_CONTENT, iconColor: Colors.TEXT_SECONDARY, screen: "AdminSettings" },
  { id: 19, title: "Holidays", sub: "Manage", icon: "palm-tree", color: "#FEF2F2", iconColor: Colors.ERROR, screen: "ManageHolidays" },
  { id: 20, title: "Studio Info", sub: "About Us", icon: "store", color: "#F0F9FF", iconColor: "#2563EB", screen: "EditAboutUs" },
  { id: 21, title: "Studio Gallery", sub: "Photos", icon: "image-multiple-outline", color: "#F0FDF4", iconColor: "#16A34A", screen: "GalleryManagement" },
  { id: 22, title: "Core Values", sub: "Mission", icon: "hand-heart", color: "#FFF1F2", iconColor: "#E11D48", screen: "CoreValues" },
  { id: 17, title: "Fee Structure", sub: "Plans", icon: "wallet-membership", color: "#FDF2F8", iconColor: Colors.PRIMARY, screen: "FeeStructure" },
];

export default function AdminDashboard({ navigation }) {
  const { logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Credentials Feature
  const [users, setUsers] = useState([]);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Header Bubbles for Zigzag
  const bubble1X = useRef(new Animated.Value(0)).current;
  const bubble1Y = useRef(new Animated.Value(0)).current;
  const bubble2X = useRef(new Animated.Value(0)).current;
  const bubble2Y = useRef(new Animated.Value(0)).current;

  // Staggered animations for sections
  const sectionAnims = useRef([
    new Animated.Value(0), // Credentials Access Card
    new Animated.Value(0), // Stats Grid
    new Animated.Value(0), // Studio Events
    new Animated.Value(0), // Control Centre
    new Animated.Value(0), // Studio Highlights
    new Animated.Value(0), // Today's Classes
  ]).current;

  useEffect(() => {
    fetchDashboard();

    const animateBubble = (animX, animY, delay) => {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(animX, { toValue: 20, duration: 1500, delay: delay, useNativeDriver: true }),
            Animated.timing(animX, { toValue: -20, duration: 1500, useNativeDriver: true }),
            Animated.timing(animX, { toValue: 0, duration: 1500, useNativeDriver: true })
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animY, { toValue: -20, duration: 1500, delay: delay, useNativeDriver: true }),
            Animated.timing(animY, { toValue: 20, duration: 1500, useNativeDriver: true }),
            Animated.timing(animY, { toValue: 0, duration: 1500, useNativeDriver: true })
          ])
        )
      ]).start();
    };

    animateBubble(bubble1X, bubble1Y, 0);
    animateBubble(bubble2X, bubble2Y, 1000);
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive", onPress: async () => {
          await logout();
          // Navigation is handled by AppNavigator observing AuthContext state
        }
      }
    ]);
  };

  const fetchDashboard = async () => {
    try {
      const adminId = await AsyncStorage.getItem("userId");
      if (adminId) {
        const [dashRes, profRes, notifRes, usersRes] = await Promise.all([
          adminService.getDashboard(adminId),
          adminService.getAdminProfile(adminId).catch(() => ({ data: {} })),
          adminService.getUnreadNotifications().catch(() => ({ data: [] })),
          adminService.getUsers().catch(() => ({ data: [] }))
        ]);

        if (usersRes?.data) setUsers(usersRes.data);

        if (notifRes && notifRes.data) setUnreadCount(notifRes.data.length);

        const dashData = dashRes.data || {};
        const profData = profRes.data || {};
        const baseURL = API.defaults.baseURL;

        setData({
          ...dashData,
          adminAvatar: profData.profilePic || profData.avatar
            ? `${baseURL}/uploads/profiles/${profData.profilePic || profData.avatar}`
            : 'https://randomuser.me/api/portraits/women/65.jpg'
        });

        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.stagger(100, sectionAnims.map(anim =>
            Animated.spring(anim, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true
            })
          ))
        ]).start();
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  // Format numbers for display
  const formatNumber = (num) => {
    if (!num || num === 0) return "0";
    if (typeof num === 'number') {
      return num.toLocaleString('en-IN');
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "₹0";
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E11D48" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Stylish Gradient Header */}
      <LinearGradient
        colors={[HEADER_BG, "#000000"]}
        style={[styles.header, {
          paddingTop: Math.max(insets.top + 15, Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 15 : 60),
          minHeight: 200 // Ensure valid height
        }]}
      >
        {/* Animated Zigzag Bubbles */}
        <Animated.View style={[styles.decorCircle1, { transform: [{ translateX: bubble1X }, { translateY: bubble1Y }] }]} />
        <Animated.View style={[styles.decorCircle2, { transform: [{ translateX: bubble2X }, { translateY: bubble2Y }] }]} />
        <View style={styles.decorCircle3} />

        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.avatarContainer} activeOpacity={0.8}>
            <Image
              source={{ uri: data?.adminAvatar }}
              style={styles.avatarImg}
            />
            <View style={styles.avatarRing} />
          </TouchableOpacity>
          <View style={{ marginLeft: 15, flex: 1 }}>
            <View style={styles.portalBadge}>
              <Icon name="shield-check" size={12} color={Colors.WHITE} />
              <Text style={styles.greetingTitle}>ADMIN PORTAL</Text>
            </View>
            <Text style={styles.greetingName}>{data?.name || "Administrator"}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.notifBtn} onPress={() => setShowQuickActions(true)} activeOpacity={0.7}>
              <Icon name="plus-circle-outline" size={24} color={Colors.WHITE} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.notifBtn, { marginLeft: 10 }]} onPress={() => navigation.navigate("Notifications")} activeOpacity={0.7}>
              <Icon name="bell-outline" size={20} color={Colors.WHITE} />
              {unreadCount > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifDotText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#E11D48"]} />}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Credentials Access Card */}
            <Animated.View style={{
              opacity: sectionAnims[0],
              transform: [{ translateY: sectionAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <TouchableOpacity
                style={[styles.statCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD', marginBottom: 20, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1 }]}
                onPress={() => setShowCredsModal(true)}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                  <Icon name="shield-key-outline" size={24} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0369A1' }}>User Credentials</Text>
                  <Text style={{ fontSize: 12, color: Colors.TEXT_SECONDARY }}>View Admin & Student Logins</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#0284C7" />
              </TouchableOpacity>
            </Animated.View>

            {/* Stats Grid */}
            <Animated.View style={{
              opacity: sectionAnims[1],
              transform: [{ translateY: sectionAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <View style={styles.grid}>
                {/* Prominent Revenue Card */}
                <TouchableOpacity
                  style={styles.revenueCard}
                  onPress={() => navigation.navigate("FeeManagement")}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ECFDF5', '#F0FDF4']}
                    style={styles.revenueGradient}
                  >
                    <View style={styles.revenueIconBox}>
                      <Icon name="cash-check" size={28} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.revenueLabel}>REVENUE: {new Date().toLocaleString('default', { month: 'long' }).toUpperCase()} {new Date().getFullYear()}</Text>
                      <Text style={styles.revenueValue}>{formatCurrency(data?.feesCollectedThisMonth)}</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#059669" />
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
                  <StatWidget
                    label="Active Students" value={formatNumber(data?.activeStudents)}
                    icon="account-check" color="#F0FDF4" iconColor="#16A34A"
                    onPress={() => navigation.navigate("StudentManagement", { filter: 'Active' })}
                    style={{ width: '48%' }}
                  />
                  <StatWidget
                    label="Pending Fees" value={formatCurrency(data?.pendingFeesAmount)}
                    icon="cash-clock" color="#FFF1F2" iconColor="#E11D48"
                    onPress={() => navigation.navigate("FeeManagement")} style={{ width: '48%' }}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
                  <StatWidget
                    label="Inactive" value={formatNumber(data?.inactiveStudents)}
                    icon="account-off-outline" color="#FEF2F2" iconColor={Colors.ERROR}
                    onPress={() => navigation.navigate("StudentManagement", { filter: 'Inactive' })}
                    style={{ width: '48%' }}
                  />
                  <StatWidget
                    label="Event Leads" value={formatNumber(data?.pendingEventInquiries)}
                    icon="star-outline" color="#FEF3C7" iconColor="#D97706"
                    onPress={() => navigation.navigate("AdminEventInquiries")}
                    style={{ width: '48%' }}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
                  <StatWidget
                    label="Choreo Leads" value={formatNumber(data?.pendingSangeetInquiries)}
                    icon="music-clef-treble" color="#FCE7F3" iconColor={Colors.PRIMARY}
                    onPress={() => navigation.navigate("SangeetInquiries")}
                    style={{ width: '48%' }}
                  />
                  <StatWidget
                    label="Total Revenue" value={formatCurrency(data?.totalFeesCollected)}
                    icon="chart-areaspline" color="#EEF2FF" iconColor="#4338CA"
                    onPress={() => navigation.navigate("FeeManagement")}
                    style={{ width: '48%' }}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
                  <StatWidget
                    label="Batch Req" value={formatNumber(data?.pendingBatchEnrollments)}
                    icon="school-outline" color="#F0FDF4" iconColor="#16A34A"
                    onPress={() => navigation.navigate("BatchManagement", { initialFilter: "Requests", filter: "Requests" })}
                    style={{ width: '100%' }}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Combined Schedule & Events Sections */}
            <Animated.View style={{
              opacity: sectionAnims[2],
              transform: [{ translateY: sectionAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Studio Events</Text>
                <TouchableOpacity onPress={() => navigation.navigate("EventsCategories")}>
                  <Text style={styles.viewAll}>Manage</Text>
                </TouchableOpacity>
              </View>

              {data?.eventList?.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                  {data.eventList.slice(0, 5).map((ev, index) => (
                    <TouchableOpacity key={index} style={styles.eventCard} onPress={() => navigation.navigate("EventsCategories")}>
                      <View style={styles.eventImagePlaceholder}>
                        <Icon name="star-circle-outline" size={32} color={Colors.WHITE} />
                      </View>
                      <View style={styles.eventContent}>
                        <Text style={styles.eventTitle} numberOfLines={1}>{ev.title}</Text>
                        <Text style={styles.eventDate}>{ev.date}</Text>
                        <View style={styles.eventTypeBadge}>
                          <Text style={styles.eventTypeText}>{ev.type}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No upcoming events</Text>
                </View>
              )}
            </Animated.View>

            {/* Upcoming Holidays Section */}
            <Animated.View style={{
              opacity: sectionAnims[2],
              transform: [{ translateY: sectionAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                <Text style={styles.sectionTitle}>Upcoming Holidays</Text>
                <TouchableOpacity onPress={() => navigation.navigate("ManageHolidays")}>
                  <Text style={styles.viewAll}>Manage</Text>
                </TouchableOpacity>
              </View>

              {data?.holidayList?.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                  {data.holidayList.map((h, index) => (
                    <View key={index} style={styles.holidayCard}>
                      <View style={styles.holidayDateBox}>
                        <Text style={styles.holidayDay}>{h.date.split('-')[2]}</Text>
                        <Text style={styles.holidayMonth}>{new Date(h.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</Text>
                      </View>
                      <View style={styles.holidayContent}>
                        <Text style={styles.holidayName} numberOfLines={1}>{h.name}</Text>
                        <Text style={styles.holidayDesc} numberOfLines={1}>{h.batch ? h.batch.name : "Studio Global"}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={[styles.emptyBox, { backgroundColor: Colors.BG_CONTENT }]}>
                  <Text style={styles.emptyText}>No upcoming holidays</Text>
                </View>
              )}
            </Animated.View>

            {/* Quick Actions Grid */}
            <Animated.View style={{
              opacity: sectionAnims[3],
              transform: [{ translateY: sectionAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Control Centre</Text>
              <View style={styles.actionGrid}>
                {ACTION_HUB.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.actionItem}
                    onPress={() => {
                      if (item.screen === 'CREDENTIALS_MODAL') {
                        setShowCredsModal(true);
                      } else if (item.screen) {
                        navigation.navigate(item.screen);
                      }
                    }}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: item.color }]}>
                      <Icon name={item.icon} size={26} color={item.iconColor} />
                    </View>
                    <Text style={styles.actionLabel}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>



            {/* Today's Schedule List */}
            <Animated.View style={{
              opacity: sectionAnims[5],
              transform: [{ translateY: sectionAnims[5].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Classes</Text>
                <TouchableOpacity onPress={() => navigation.navigate("ScheduleScreen")}>
                  <Text style={styles.viewAll}>Full Schedule</Text>
                </TouchableOpacity>
              </View>

              {data?.todayList?.length > 0 ? data.todayList.slice(0, 4).map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.scheduleRow}
                  onPress={() => navigation.navigate("AttendanceManagement")}
                  activeOpacity={0.7}
                >
                  <View style={styles.timeBox}>
                    <Text style={styles.timeText}>{item.startTime || "N/A"}</Text>
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.batchName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.instructorName}>{item.instructor || "Instructor"}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.statusText, { color: '#166534' }]}>Running</Text>
                  </View>
                </TouchableOpacity>
              )) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No classes scheduled for today.</Text>
                </View>
              )}
            </Animated.View>

            <View style={{ marginTop: 20 }}>
              <Footer />
            </View>
          </Animated.View>
        </ScrollView>
      </View>

      {/* Credentials Modal (Moved to bottom for clarity) */}
      <Modal visible={showCredsModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: Colors.BG_CONTENT }}>
          <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.WHITE, borderBottomWidth: 1, borderColor: Colors.BORDER }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.PRIMARY_DARK }}>User Credentials</Text>
            <TouchableOpacity onPress={() => setShowCredsModal(false)}>
              <Icon name="close-circle" size={30} color={Colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {users.map((user, index) => (
              <View key={index} style={{ backgroundColor: Colors.WHITE, padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: user.role === 'ADMIN' ? '#FCE7F3' : '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                  <Icon name={user.role === 'ADMIN' ? 'shield-account' : 'school'} size={24} color={user.role === 'ADMIN' ? Colors.PRIMARY : '#0284C7'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#334155' }}>{user.name || user.username || "User"}</Text>
                  <Text style={{ fontSize: 12, color: Colors.TEXT_SECONDARY }}>{user.email}</Text>
                  <Text style={{ fontSize: 12, color: Colors.PRIMARY_DARK, marginTop: 2 }}>Pass: {user.password || "******"}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: user.role === 'ADMIN' ? Colors.PRIMARY : '#0284C7', backgroundColor: user.role === 'ADMIN' ? '#FFE4E6' : '#E0F2FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      {user.role}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Quick Action Modal */}
      <QuickActionModal 
        visible={showQuickActions} 
        onClose={() => setShowQuickActions(false)} 
        navigation={navigation} 
      />
    </View>
  );
}

function StatWidget({ label, value, icon, color, iconColor, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.statWidget, style]} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={[styles.widgetIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.widgetValue} numberOfLines={1}>{value}</Text>
        <Text style={styles.widgetLabel} numberOfLines={1}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HEADER_BG },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 25,
    paddingBottom: 40, // Increased bottom padding
    minHeight: 220, // Added minHeight for better sizing
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
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10
  },
  avatarContainer: {
    position: 'relative'
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.WHITE,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  avatarRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  portalBadge: {
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
  greetingTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: 0.5
  },
  greetingName: {
    fontSize: 22,
    color: Colors.WHITE,
    fontWeight: "bold",
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
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
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FBBF24",
    borderWidth: 2,
    borderColor: HEADER_BG,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  notifDotText: {
    color: '#000',
    fontSize: 9,
    fontWeight: 'bold'
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },
  contentContainer: {
    flex: 1,
    backgroundColor: CONTENT_BG,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20, // Overlap header slightly
    paddingHorizontal: 20,
    overflow: 'hidden'
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: Colors.PRIMARY_DARK, marginBottom: 16, marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAll: { fontSize: 12, fontWeight: '700', color: HEADER_BG },

  // Layouts
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: 12 },

  // Widgets
  statWidget: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.TEXT_SECONDARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BG_CONTENT,
    minHeight: 90
  },
  priorityWidget: { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' },
  widgetIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  widgetTextContainer: { flex: 1 },
  widgetValue: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.PRIMARY_DARK,
    letterSpacing: -0.5,
    marginBottom: 2
  },
  widgetLabel: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
    fontWeight: "600",
    letterSpacing: 0.2
  },

  // Revenue Card
  revenueCard: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5'
  },
  revenueGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  revenueIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center'
  },
  revenueLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 1
  },
  revenueValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#064E3B',
    marginTop: 2
  },
  priorityText: { color: Colors.PRIMARY },
  priorityLabel: { color: "#9F1239" },
  arrowIcon: { marginLeft: 5 },

  // Alert Card
  alertCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECDD3',
    elevation: 3,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  alertIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  alertLabel: { fontSize: 13, color: '#9F1239', fontWeight: '600', marginBottom: 2 },
  alertValue: { fontSize: 22, color: Colors.PRIMARY, fontWeight: '800' },
  alertBadge: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  alertBadgeText: { color: Colors.WHITE, fontSize: 10, fontWeight: 'bold' },

  // Actions
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  actionItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.WHITE,
    paddingVertical: 15,
    borderRadius: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  actionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  actionLabel: { fontSize: 11, fontWeight: "700", color: "#334155", textAlign: 'center', lineHeight: 14 },
  actionSub: { fontSize: 9, color: Colors.TEXT_MUTED, textAlign: 'center', marginTop: 1 },

  // Schedule
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.TEXT_SECONDARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: Colors.BG_CONTENT
  },
  timeBox: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70
  },
  timeText: { color: "#2563EB", fontWeight: "800", fontSize: 13 },
  scheduleInfo: { flex: 1 },
  batchName: { fontSize: 15, fontWeight: "700", color: Colors.TEXT_PRIMARY, marginBottom: 2 },
  instructorName: { fontSize: 12, color: Colors.TEXT_SECONDARY, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },

  // Events Scroll
  eventCard: {
    width: 200,
    backgroundColor: Colors.WHITE,
    borderRadius: 22,
    marginRight: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    paddingBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10
  },
  eventImagePlaceholder: {
    height: 110,
    backgroundColor: HEADER_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0
  },
  eventContent: { paddingHorizontal: 16, paddingTop: 12 },
  eventTitle: { fontSize: 16, fontWeight: "800", color: Colors.TEXT_PRIMARY, marginBottom: 6 },
  eventDate: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginBottom: 8, fontWeight: '500' },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  eventTypeText: { fontSize: 10, color: "#2563EB", fontWeight: "700", textTransform: 'uppercase' },

  // Utilities
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24
  },
  viewAll: {
    fontSize: 13,
    color: "#E11D48",
    fontWeight: "700",
    letterSpacing: 0.3
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#CBD5E1'
  },
  emptyText: {
    color: Colors.TEXT_SECONDARY,
    fontWeight: '500',
    marginTop: 5
  },
  // Holiday Card Styles (consistent with Student side)
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
    borderColor: '#F1F5F9',
    marginBottom: 5
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
  }
});
