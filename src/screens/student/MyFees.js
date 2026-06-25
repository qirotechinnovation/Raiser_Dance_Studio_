import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import studentService from "../../api/studentService";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";

export default function MyFees({ navigation }) {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const loadFees = React.useCallback(async () => {
    const id = await AsyncStorage.getItem("studentId");
    try {
      if (id) {
        const res = await studentService.getFees(id);
        if (res.data) {
          setFees(res.data.history || []);
          setSummary(res.data.summary || {});

          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
          ]).start();
        }
      }
    } catch (e) {
      console.error("Fees fetch error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadFees();
  }, [loadFees]);

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.historyCard}>
      <View style={styles.historyLeft}>
        <View style={[styles.iconBox, { backgroundColor: item.status === 'PAID' ? '#ECFDF5' : '#FFF1F2' }]}>
          <Icon name={item.status === 'PAID' ? "check" : "clock-outline"} size={20} color={item.status === 'PAID' ? "#10B981" : "#E11D48"} />
        </View>
        <View style={{ marginLeft: 12, flex: 1, paddingRight: 10 }}>
          <Text style={styles.historyTitle} numberOfLines={1}>
            {item.feeType || item.plan || 'Monthly Fee'}
            {item.feeMonth && item.feeMonth !== 'N/A' ? ` - ${item.feeMonth}` : ''}
          </Text>
          <Text style={styles.historyDate}>
            {item.batchName ? `Batch: ${item.batchName}\n` : ''}
            {item.date || item.dueDate} • {item.method || 'Pending'}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.historyAmount}>₹{item.amount}</Text>
        {item.status === 'PAID' ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("Receipt", { ...item, studentName: "Me" })}
          >
            <Text style={styles.viewReceipt}>View Receipt</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.viewReceipt, { color: '#E11D48' }]}>Pending</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <BaseScreen 
      title="Fees & Payments" 
      loading={loading}
      actions={[{ icon: 'help-circle-outline', onPress: () => alert("Help Center") }]}
      scrollContentStyle={{ padding: 25 }}
      useGradient={true}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Current Plan Card */}
        {(!summary || !summary.plan) ? (
          <View style={styles.noPlanCard}>
            <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.noPlanGradient}>
              <View style={styles.noPlanIconBox}>
                <Icon name="card-search-outline" size={50} color={Colors.PRIMARY} />
              </View>
              <Text style={styles.noPlanTitle}>No Active Plan found</Text>
              <Text style={styles.noPlanDesc}>
                It looks like you haven't enrolled in a training plan yet. 
                Choose a batch today to start your dance journey!
              </Text>
              <TouchableOpacity 
                style={styles.enrollLargeBtn}
                onPress={() => navigation.navigate("BatchEnrollment")}
              >
                <Text style={styles.enrollLargeBtnText}>Explore & Enroll Now</Text>
                <Icon name="arrow-right" size={20} color={Colors.WHITE} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planLabel}>Current Plan</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.planName}>{summary.plan}</Text>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>Next Due Date</Text>
                <Text style={styles.statValue}>{summary.nextDue || "N/A"}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.statLabel}>Pending Amount</Text>
                <Text style={[styles.statValue, { color: Colors.PRIMARY }]}>₹{summary.pending || "0.00"}</Text>
              </View>
            </View>

            {(summary.pending && parseFloat(summary.pending) > 0) && (
              <TouchableOpacity style={styles.payBtn} onPress={() => alert("Payment Gateway Integration")}>
                <Text style={styles.payBtnText}>Pay Now</Text>
                <Icon name="arrow-right" size={20} color={Colors.WHITE} />
              </TouchableOpacity>
            )}

            <View style={styles.attendanceBox}>
              <Icon name="calendar-check" size={20} color="#10B981" />
              <Text style={styles.attendanceText}>
                Present this month: <Text style={{ fontWeight: 'bold', color: '#10B981' }}>{summary.attendanceCount || 0} days</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Payment History */}
        <Text style={styles.sectionTitle}>Payment History</Text>
        <FlatList
          data={fees}
          keyExtractor={item => (item.id || Math.random()).toString()}
          renderItem={renderHistoryItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No payment history available.</Text>
            </View>
          }
        />
      </Animated.View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planLabel: { fontSize: 13, color: Colors.TEXT_SECONDARY, fontWeight: "600" },
  activeBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeText: { color: "#10B981", fontSize: 10, fontWeight: "bold" },
  planName: { fontSize: 22, fontWeight: "bold", color: Colors.PRIMARY_DARK, marginBottom: 16 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statLabel: { fontSize: 12, color: Colors.TEXT_MUTED, fontWeight: "600", marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
  payBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.3
  },
  payBtnText: { color: Colors.WHITE, fontWeight: "bold", fontSize: 16, marginRight: 8 },
  attendanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#DCFCE7'
  },
  attendanceText: { fontSize: 13, color: '#16A34A', marginLeft: 10, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 16 },
  historyCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  historyTitle: { fontSize: 15, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
  historyDate: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginTop: 2 },
  historyAmount: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
  viewReceipt: { fontSize: 12, color: Colors.PRIMARY, fontWeight: "600", marginTop: 4 },
  emptyBox: { alignItems: 'center', marginTop: 20 },
  emptyText: { color: Colors.TEXT_MUTED },
  noPlanCard: { 
    borderRadius: 24, 
    overflow: 'hidden', 
    backgroundColor: Colors.WHITE,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20
  },
  noPlanGradient: { 
    padding: 30, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  noPlanIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFE4E6'
  },
  noPlanTitle: { fontSize: 20, fontWeight: '900', color: Colors.TEXT_PRIMARY, marginBottom: 12 },
  noPlanDesc: { fontSize: 14, color: Colors.TEXT_SECONDARY, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10, marginBottom: 25 },
  enrollLargeBtn: { 
    flexDirection: 'row',
    backgroundColor: Colors.PRIMARY, 
    paddingHorizontal: 25, 
    paddingVertical: 15, 
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  enrollLargeBtnText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 }
});
