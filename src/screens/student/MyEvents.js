import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, Animated, ActivityIndicator, TouchableOpacity, Modal, TextInput, Image, Alert, Platform, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import studentService from "../../api/studentService";
import API from "../../api/axios";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";

const DEFAULT_EVENT_IMAGE = "https://cdn-icons-png.flaticon.com/512/1458/1458514.png";

export default function MyEvents() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming | inquiries | booked
  const [events, setEvents] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [bookedEvents, setBookedEvents] = useState([]);
  const [cancellations, setCancellations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState({ name: "", mobile: "" });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Inquiry Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const studentId = await AsyncStorage.getItem("studentId");

      if (!studentId) {
        setLoading(false);
        return;
      }

      if (!studentData.name) {
        studentService.getProfile(studentId).then(res => {
          setStudentData({
            name: res.data.name || "Student",
            mobile: res.data.mobile || "N/A"
          });
        }).catch(err => console.error("Profile fetch error", err));
      }

      if (activeTab === "upcoming") {
        const res = await studentService.getUpcomingEvents();
        setEvents(res.data || []);
      } else if (activeTab === "booked") {
        const res = await studentService.getMyBookedEvents(studentId);
        setBookedEvents(res.data || []);
        const cancelRes = await API.get(`/student/events/${studentId}/cancellations`);
        setCancellations(cancelRes.data || []);
      } else {
        const res = await studentService.getMyEventInquiries(studentId);
        setInquiries(res.data || []);
      }

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
      ]).start();

    } catch (e) {
      console.log("Error loading data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnquire = (event) => {
    setSelectedEvent(event);
    setMessage(`I am interested in ${event.title}. Please provide more details.`);
    setModalVisible(true);
  };

  const submitInquiry = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message.");
      return;
    }
    setSubmitting(true);
    try {
      const studentId = await AsyncStorage.getItem("studentId");
      await studentService.submitEventInquiry({
        eventId: selectedEvent.id,
        studentId: studentId,
        message: message,
      });
      Alert.alert("Success", "Inquiry sent successfully!");
      setModalVisible(false);
      setActiveTab("inquiries");
      loadData();
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message || "Failed to send inquiry.";
      Alert.alert("Error", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED": return "#22C55E";
      case "REJECTED": return Colors.ERROR;
      case "PENDING": return "#F59E0B";
      case "PAID": return "#3B82F6";
      case "CONFIRMED": return "#10B981";
      default: return "#6B7280";
    }
  };

  const renderEventItem = ({ item }) => {
    const existingInquiry = inquiries.find(inq =>
      inq.event.id === item.id && inq.status !== 'REJECTED'
    );

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.photo ? `${API.defaults.baseURL}uploads/events/${item.photo}` : DEFAULT_EVENT_IMAGE }}
          style={styles.eventImage}
        />
        <View style={styles.cardContent}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{item.date || 'TBA'}</Text>
          </View>
          <Text style={styles.titleText} numberOfLines={2}>{item.title || 'Event'}</Text>
          <View style={styles.row}>
            <Icon name="map-marker" size={16} color={Colors.TEXT_SECONDARY} />
            <Text style={styles.infoText} numberOfLines={1}>{item.venue || 'Studio'}</Text>
          </View>
          <View style={styles.row}>
            <Icon name="clock-outline" size={16} color={Colors.TEXT_SECONDARY} />
            <Text style={styles.infoText}>{item.time || 'TBA'}</Text>
          </View>
          {item.description && (
            <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
          )}

          {existingInquiry ? (
            <TouchableOpacity
              style={[styles.bookButton, { backgroundColor: Colors.TEXT_MUTED }]}
              disabled={true}
            >
              <Text style={styles.bookButtonText}>
                {existingInquiry.status === 'CONFIRMED' ? 'Event Booked' : 'Request Pending'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.bookButton} onPress={() => handleEnquire(item)}>
              <Text style={styles.bookButtonText}>Enquire / Book</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleCancelBooking = async (event) => {
    Alert.alert(
      "Request Cancellation",
      `Are you sure you want to request cancellation for this ticket?\n\nEvent: ${event.title}`,
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Request Cancel", style: "destructive", onPress: async () => {
            try {
              const studentId = await AsyncStorage.getItem("studentId");
              const res = await API.post("/student/events/cancel-request", {
                eventId: event.id,
                studentId: studentId,
                reason: "User requested cancellation"
              });
              if (res.data.success) {
                Alert.alert("Success", res.data.message);
                loadData();
              }
            } catch (error) { Alert.alert("Error", "Failed to cancel."); }
          }
        }
      ]
    );
  };

  const renderBookedItem = ({ item }) => {
    const eventDate = new Date(item.date);
    const now = new Date();
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
    const canCancel = hoursUntilEvent > 24;
    const pendingCancellation = cancellations.find(c => c.event.id === item.id && c.status === "PENDING");

    return (
      <View style={[styles.card, { borderColor: '#10B981', borderWidth: 2 }]}>
        <Image
          source={{ uri: item.photo ? `${API.defaults.baseURL}uploads/events/${item.photo}` : DEFAULT_EVENT_IMAGE }}
          style={styles.eventImage}
        />
        <View style={styles.cardContent}>
          <View style={[styles.dateBadge, { backgroundColor: '#10B981' }]}>
            <Text style={[styles.dateText, { color: Colors.WHITE }]}>{item.date || 'TBA'}</Text>
          </View>
          <Text style={styles.titleText} numberOfLines={2}>{item.title || 'Event'}</Text>
          <View style={[styles.row, { marginBottom: 10 }]}>
            <Icon name="check-circle" size={18} color="#10B981" />
            <Text style={[styles.infoText, { color: '#10B981', fontWeight: 'bold' }]}>Confirmed Booking</Text>
          </View>
          <View style={styles.row}>
            <Icon name="map-marker" size={16} color={Colors.TEXT_SECONDARY} />
            <Text style={styles.infoText} numberOfLines={1}>{item.venue || 'Studio'}</Text>
          </View>
          <View style={styles.row}>
            <Icon name="clock-outline" size={16} color={Colors.TEXT_SECONDARY} />
            <Text style={styles.infoText}>{item.time || 'TBA'}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
            <TouchableOpacity style={[styles.bookButton, { flex: 1, backgroundColor: '#10B981', marginTop: 0 }]} activeOpacity={1}>
              <Text style={styles.bookButtonText}>✓ Confirmed</Text>
            </TouchableOpacity>
            {pendingCancellation ? (
              <TouchableOpacity style={[styles.bookButton, { flex: 1, backgroundColor: '#F59E0B', marginTop: 0 }]} disabled={true}>
                <Text style={styles.bookButtonText}>Pending</Text>
              </TouchableOpacity>
            ) : (
              canCancel && (
                <TouchableOpacity style={[styles.bookButton, { flex: 1, backgroundColor: Colors.ERROR, marginTop: 0 }]} onPress={() => handleCancelBooking(item)}>
                  <Text style={styles.bookButtonText}>Cancel</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderInquiryItem = ({ item }) => (
    <View style={[styles.card, { borderLeftWidth: 5, borderLeftColor: getStatusColor(item.status) }]}>
      <View style={styles.cardContent}>
        <Text style={styles.titleText}>{item.event?.title || "Unknown Event"}</Text>
        <Text style={styles.infoText}>📅 Inquiry Date: {new Date(item.timestamp).toLocaleDateString()}</Text>
        <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
        {item.status === 'ACCEPTED' && (
          <TouchableOpacity style={styles.uploadButton} onPress={() => navigation.navigate('UploadReceipt', { inquiryId: item.id })}>
            <Icon name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.uploadButtonText}> Upload Receipt</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <BaseScreen 
      title="Event Hub" 
      loading={loading} 
      isScrollable={false} 
      useGradient={true}
    >
      <View style={styles.tabContainer}>
        {["upcoming", "inquiries", "booked"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === "upcoming" ? "Explore" : tab === "inquiries" ? "Inquiries" : "My Bookings"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={activeTab === "upcoming" ? events : (activeTab === "booked" ? bookedEvents : inquiries)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={activeTab === "upcoming" ? renderEventItem : (activeTab === "booked" ? renderBookedItem : renderInquiryItem)}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="calendar-remove" size={50} color="#CBD5E1" />
            <Text style={styles.emptyText}>Nothing here yet.</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Event Inquiry</Text>
            <Text style={styles.modalSubtitle}>{selectedEvent?.title}</Text>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmLabel}>For: {studentData.name}</Text>
            </View>
            <TextInput style={styles.input} value={message} onChangeText={setMessage} multiline placeholder="Message..." />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitInquiry} disabled={submitting}>
                <Text style={styles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  tabContainer: { flexDirection: "row", backgroundColor: "#F1F5F9", marginHorizontal: 20, marginTop: 15, borderRadius: 16, padding: 5, marginBottom: 20, borderWidth: 1, borderColor: Colors.BORDER },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12 },
  activeTab: { backgroundColor: Colors.WHITE, elevation: 2 },
  tabText: { fontWeight: "600", color: Colors.TEXT_SECONDARY, fontSize: 13 },
  activeTabText: { color: Colors.PRIMARY, fontWeight: "700" },
  card: { backgroundColor: Colors.WHITE, borderRadius: 20, marginBottom: 20, elevation: 3, overflow: 'hidden', borderWidth: 1, borderColor: Colors.BORDER },
  eventImage: { width: "100%", height: 150, resizeMode: "cover" },
  cardContent: { padding: 15 },
  dateBadge: { position: 'absolute', top: -140, right: 15, backgroundColor: Colors.WHITE, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, elevation: 2 },
  dateText: { fontWeight: 'bold', color: Colors.PRIMARY, fontSize: 12 },
  titleText: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 5 },
  infoText: { fontSize: 14, color: "#475569" },
  descText: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginTop: 8, lineHeight: 20 },
  bookButton: { marginTop: 15, backgroundColor: Colors.PRIMARY, paddingVertical: 12, borderRadius: 12, alignItems: "center", elevation: 2 },
  bookButtonText: { color: Colors.WHITE, fontWeight: "bold", fontSize: 14 },
  statusTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 5, marginBottom: 10 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  uploadButton: { flexDirection: "row", backgroundColor: "#0EA5E9", paddingVertical: 10, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 10 },
  uploadButtonText: { color: Colors.WHITE, fontWeight: "bold", fontSize: 13 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: Colors.TEXT_MUTED, fontSize: 16, marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: Colors.WHITE, borderRadius: 24, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: Colors.PRIMARY, fontWeight: "600", marginBottom: 15 },
  confirmBox: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 12, marginBottom: 15 },
  confirmLabel: { fontSize: 12, fontWeight: 'bold', color: Colors.PRIMARY_DARK },
  input: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 12, padding: 12, fontSize: 16, color: Colors.TEXT_PRIMARY, backgroundColor: Colors.BG_CONTENT, height: 100, marginBottom: 20, textAlignVertical: 'top' },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 15, alignItems: 'center' },
  cancelBtnText: { color: Colors.TEXT_SECONDARY, fontWeight: "bold" },
  submitBtn: { backgroundColor: Colors.PRIMARY, paddingVertical: 10, paddingHorizontal: 25, borderRadius: 12 },
  submitBtnText: { color: Colors.WHITE, fontWeight: "bold" },
});
