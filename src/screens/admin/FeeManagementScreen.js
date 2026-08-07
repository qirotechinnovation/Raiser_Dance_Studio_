import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StatusBar, Modal, Platform, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";

export default function FeeManagementScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState("Pending");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ collected: "0", outstanding: "0", pendingCount: 0 });
    const [records, setRecords] = useState([]);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [paidAmount, setPaidAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState("GPAY");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchFeeData();
        });
        return unsubscribe;
    }, [navigation, activeTab]);

    useEffect(() => {
        fetchFeeData();
    }, [activeTab]);

    const fetchFeeData = async () => {
        setLoading(true);
        try {
            const [pendingRes, allRes] = await Promise.all([
                adminService.getPendingFees().catch(() => ({ data: [] })),
                adminService.getAllFees().catch(() => ({ data: [] }))
            ]);

            const allFees = Array.isArray(allRes?.data) ? allRes.data : [];
            const pendingFeesFromBackend = Array.isArray(pendingRes?.data) ? pendingRes.data : [];

            // Calculate total collected
            const totalCollected = allFees
                .filter(f => f && f.status?.toUpperCase() === 'PAID')
                .reduce((sum, f) => sum + (f.amount || 0), 0);

            // Compute current dues safely (UNPAID or PARTIAL fees)
            const currentDues = allFees.filter(f => {
                if (!f) return false;
                const status = f.status ? f.status.toUpperCase() : 'UNPAID';
                return status !== 'PAID';
            });

            // Include any additional pending fees returned from backend if not already present
            pendingFeesFromBackend.forEach(pf => {
                if (pf && !currentDues.some(f => f.id === pf.id)) {
                    currentDues.push(pf);
                }
            });

            const totalOutstanding = currentDues.reduce((sum, f) => {
                const remaining = (f.amount || 0) - (f.paidAmount || 0);
                return sum + Math.max(0, remaining);
            }, 0);

            setStats({
                collected: totalCollected,
                outstanding: totalOutstanding,
                pendingCount: currentDues.length
            });

            // Store records based on active tab
            let sourceData = [];
            if (activeTab === "Pending" || activeTab.startsWith("Pending")) {
                sourceData = currentDues; 
            } else if (activeTab === "History") {
                sourceData = allFees.filter(f => f && f.status?.toUpperCase() === 'PAID');
            } else {
                sourceData = allFees;
            }

            setRecords(sourceData);

        } catch (error) {
            console.error("Error fetching fee data", error);
            Alert.alert("Error", "Could not load fee information");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = (fee) => {
        setSelectedFee(fee);
        const remaining = (fee.amount || 0) - (fee.paidAmount || 0);
        setPaidAmount(remaining > 0 ? remaining.toString() : fee.amount?.toString() || "");
        setPaymentModalVisible(true);
    };

    const submitPayment = async () => {
        setLoading(true);
        try {
            await adminService.markFeePaid(selectedFee.id, paymentMode, "", "Mobile Admin Entry", paidAmount);
            setPaymentModalVisible(false);
            fetchFeeData(); 
            Alert.alert("Success", "Payment recorded successfully");
        } catch (e) {
            Alert.alert("Error", "Failed to update payment");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFee = (id) => {
        Alert.alert("Confirm Delete", "Are you sure you want to remove this fee record?", [
            { text: "Cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await adminService.deleteFee(id);
                        fetchFeeData();
                    } catch (e) {
                        Alert.alert("Error", "Delete failed");
                    }
                }
            }
        ]);
    };

    const renderSummaryCard = (title, amount, subtext, isPositive) => (
        <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{title}</Text>
            <Text style={styles.summaryAmount}>₹{Number(amount).toLocaleString()}</Text>
            <View style={styles.summarySubrow}>
                {isPositive ? (
                    <Icon name="trending-up" size={14} color="#10B981" />
                ) : (
                    <Icon name="alert-circle-outline" size={14} color="#F59E0B" />
                )}
                <Text style={[styles.summarySubtext, { color: isPositive ? "#10B981" : "#F59E0B" }]}>
                    {subtext}
                </Text>
            </View>
        </View>
    );

    const renderFeeRecord = ({ item }) => {
        const isPaid = item.status?.toUpperCase() === 'PAID';
        const isPartial = item.status?.toUpperCase() === 'PARTIAL' || (item.paidAmount > 0 && item.paidAmount < item.amount);
        const remainingBal = Math.max(0, (item.amount || 0) - (item.paidAmount || 0));

        let displayStatus = `DUE ${item.dueDate || 'Soon'}`;
        if (isPaid) displayStatus = `PAID ${item.paidDate || ''}`;
        else if (isPartial) displayStatus = `PARTIAL (Bal: ₹${remainingBal})`;

        const autoRenew = item.autoRenewNextCycle !== false;

        return (
            <View style={styles.feeRecordCard}>
                <View style={styles.recordHeader}>
                    <View style={styles.avatarPlaceholder}>
                        <Icon name="account" size={24} color={Colors.TEXT_MUTED} />
                    </View>
                    <View style={styles.recordMainInfo}>
                        <Text style={styles.studentName}>{item.student?.name || 'Unknown'}</Text>
                        <Text style={styles.planSubtitle}>
                            {item.plan} 
                            {item.student?.batch?.name ? ` • ${item.student.batch.name}` : ''} 
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 6 }}>
                            <View style={{ backgroundColor: isPaid ? '#DCFCE7' : isPartial ? '#FEF3C7' : '#FFE4E6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: isPaid ? '#166534' : isPartial ? '#92400E' : '#9F1239' }}>
                                    {isPaid ? 'PAID' : isPartial ? `PARTIAL (Pending: ₹${remainingBal})` : 'UNPAID'}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: autoRenew ? '#E0F2FE' : '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: autoRenew ? '#0369A1' : '#64748B' }}>
                                    {autoRenew ? 'Next Month: Continuing ✓' : 'Next Month: Paused'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.recordPrice}>₹{item.amount}</Text>
                        {item.paidAmount > 0 && (
                            <Text style={{fontSize: 11, color: Colors.TEXT_SECONDARY, marginTop: 2}}>
                                Paid: ₹{item.paidAmount}
                            </Text>
                        )}
                    </View>
                </View>

                {isPaid && (
                    <View style={styles.paidRow}>
                        <View style={styles.checkCircle}>
                            <Icon name="check" size={12} color="#10B981" />
                        </View>
                        <Text style={styles.paidInfo}>Paid on {item.paidDate || ''}</Text>
                    </View>
                )}

                <View style={styles.recordActions}>
                    {!isPaid ? (
                        <TouchableOpacity
                            style={styles.reminderBtn}
                            onPress={() => Alert.alert("Send Reminder", `Send payment reminder for pending ₹${remainingBal} to ${item.student?.name}?`, [
                                { text: "Cancel" },
                                {
                                    text: "Send", onPress: async () => {
                                        try {
                                            await adminService.sendFeeReminder(item.id);
                                            Alert.alert("Success", "Reminder sent!");
                                        } catch (e) { Alert.alert("Error", "Failed to send."); }
                                    }
                                }
                            ])}
                        >
                            <Icon name="bell-ring" size={16} color={Colors.WHITE} style={styles.btnIcon} />
                            <Text style={styles.reminderBtnText}>Remind Dues</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flex: 1 }} />
                    )}

                    {!isPaid && (
                        <TouchableOpacity
                            style={[styles.moreBtn, { backgroundColor: '#DCFCE7', width: 'auto', paddingHorizontal: 15 }]}
                            onPress={() => handleMarkPaid(item)}
                        >
                            <Text style={{ color: '#166534', fontWeight: 'bold' }}>{isPartial ? 'Pay Bal' : 'Pay'}</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={() => navigation.navigate('AddEditFee', { fee: item })}
                    >
                        <Icon name="pencil-outline" size={20} color={Colors.TEXT_SECONDARY} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={() => handleDeleteFee(item.id)}
                    >
                        <Icon name="delete-outline" size={20} color="#E11D48" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <BaseScreen 
            title="Fees" 
            isScrollable={false}
            actions={[
                { icon: 'file-document-outline', onPress: () => navigation.navigate('FeeReports'), color: Colors.PRIMARY, size: 26 },
                { icon: 'plus', onPress: () => navigation.navigate('AddEditFee'), color: Colors.PRIMARY, size: 30 }
            ]}
        >
            <View style={styles.summaryRow}>
                {renderSummaryCard("Collected", stats.collected, "+12% vs last month", true)}
                {renderSummaryCard("Outstanding", stats.outstanding, `${stats.pendingCount} Pending dues`, false)}
            </View>

            <View style={styles.tabsContainer}>
                {["All", "Pending", "History"].map(mode => {
                    const label = mode === "Pending" ? `Pending (${stats.pendingCount})` : mode;
                    const isActive = activeTab === mode || (mode === "Pending" && activeTab.startsWith("Pending"));
                    return (
                        <TouchableOpacity
                            key={mode}
                            style={[styles.tab, isActive && styles.activeTab]}
                            onPress={() => setActiveTab(mode)}
                        >
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.listContainer}>
                {loading ? (
                    <ActivityIndicator size="small" color={Colors.PRIMARY} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={records}
                        renderItem={renderFeeRecord}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 50 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', marginTop: 20, color: Colors.TEXT_MUTED }}>No records found</Text>
                        }
                    />
                )}
            </View>

            <Modal visible={paymentModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Mark Payment</Text>
                        
                        {selectedFee && (
                            <View style={{marginBottom: 20}}>
                                <Text style={{fontSize: 14, color: Colors.TEXT_SECONDARY, marginBottom: 5}}>Total Fee: <Text style={{fontWeight: 'bold', color: Colors.TEXT_PRIMARY}}>₹{selectedFee.amount}</Text></Text>
                                
                                <Text style={styles.modalLabel}>Enter Paid Amount</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    keyboardType="numeric"
                                    value={paidAmount}
                                    onChangeText={setPaidAmount}
                                    placeholder="Enter amount"
                                />
                                
                                {paidAmount !== "" && (
                                    <Text style={{fontSize: 13, color: '#E11D48', marginTop: 8}}>
                                        Pending Balance: ₹{Math.max(0, selectedFee.amount - Number(paidAmount))}
                                    </Text>
                                )}
                            </View>
                        )}

                        <Text style={styles.modalLabel}>Select Payment Mode</Text>
                        <View style={styles.paymentOptions}>
                            {['GPAY', 'CASH', 'PHONEPE', 'BANK'].map(mode => (
                                <TouchableOpacity
                                    key={mode}
                                    style={[styles.payOption, paymentMode === mode && styles.payOptionActive]}
                                    onPress={() => setPaymentMode(mode)}
                                >
                                    <Text style={[styles.payOptionText, paymentMode === mode && styles.payOptionTextActive]}>{mode}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPaymentModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={submitPayment}>
                                <Text style={styles.confirmBtnText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 15 },
    summaryCard: {
        width: "47%",
        backgroundColor: Colors.WHITE,
        borderRadius: 25,
        padding: 18,
        borderWidth: 1,
        borderColor: "#FCE7F3",
        elevation: 3,
        shadowColor: Colors.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    summaryTitle: { fontSize: 13, color: Colors.TEXT_SECONDARY, fontWeight: "600" },
    summaryAmount: { fontSize: 24, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginVertical: 6 },
    summarySubrow: { flexDirection: "row", alignItems: "center" },
    summarySubtext: { fontSize: 11, fontWeight: "600", marginLeft: 4 },
    tabsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginTop: 35,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9"
    },
    tab: {
        paddingVertical: 12,
        marginRight: 25,
        borderBottomWidth: 3,
        borderBottomColor: "transparent"
    },
    activeTab: { borderBottomColor: Colors.PRIMARY },
    tabText: { fontSize: 15, fontWeight: "700", color: Colors.TEXT_MUTED },
    activeTabText: { color: Colors.PRIMARY },
    listContainer: { padding: 20 },
    feeRecordCard: {
        backgroundColor: Colors.WHITE,
        borderRadius: 24,
        padding: 18,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: Colors.BG_CONTENT,
        position: 'relative'
    },
    recordHeader: { flexDirection: "row", alignItems: "center" },
    avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
    recordMainInfo: { flex: 1, marginLeft: 15 },
    studentName: { fontSize: 16, fontWeight: "bold", color: "#000" },
    planSubtitle: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginTop: 2 },
    priceContainer: { alignItems: "flex-end" },
    recordPrice: { fontSize: 16, fontWeight: "bold", color: Colors.PRIMARY },
    recordActions: { flexDirection: "row", marginTop: 15, alignItems: "center" },
    reminderBtn: {
        flex: 1,
        height: 48,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    reminderBtnText: { color: Colors.WHITE, fontWeight: "bold", fontSize: 14 },
    btnIcon: { marginRight: 8 },
    moreBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10
    },
    paidRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
    checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#DCFCE7", justifyContent: "center", alignItems: "center", marginRight: 12 },
    paidInfo: { fontSize: 13, color: Colors.TEXT_SECONDARY, flex: 1, fontWeight: "500" },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: Colors.WHITE, borderRadius: 25, padding: 25 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginBottom: 20 },
    amountInput: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: Colors.TEXT_PRIMARY, backgroundColor: '#F8FAFC' },
    modalLabel: { fontSize: 14, color: Colors.TEXT_SECONDARY, marginBottom: 10, fontWeight: '500' },
    paymentOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
    payOption: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER },
    payOptionActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
    payOptionText: { fontSize: 14, fontWeight: '600', color: Colors.TEXT_SECONDARY },
    payOptionTextActive: { color: Colors.WHITE },
    modalBtns: { flexDirection: 'row', gap: 15 },
    cancelBtn: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    confirmBtn: { flex: 1, paddingVertical: 15, backgroundColor: Colors.PRIMARY, borderRadius: 15, alignItems: 'center' },
    cancelBtnText: { color: Colors.TEXT_SECONDARY, fontWeight: 'bold' },
    confirmBtnText: { color: Colors.WHITE, fontWeight: 'bold' },
});
