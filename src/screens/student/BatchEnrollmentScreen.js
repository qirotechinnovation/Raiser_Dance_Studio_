import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import studentService from "../../api/studentService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";

export default function BatchEnrollmentScreen({ navigation }) {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [feeStructure, setFeeStructure] = useState([]);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("MONTHLY");
    const [studentData, setStudentData] = useState({ name: "", mobile: "" });

    useEffect(() => {
        fetchBatches();
        fetchStudentProfile();
        fetchFeeStructure();
    }, []);

    const fetchFeeStructure = async () => {
        try {
            const res = await studentService.getFeeStructure();
            setFeeStructure(res.data || []);
        } catch (error) {
            console.error("Error fetching fee structure:", error);
        }
    };

    const fetchBatches = async () => {
        try {
            const res = await studentService.getAvailableBatches();
            setBatches(res.data || []);
        } catch (error) {
            console.error("Error fetching batches:", error);
            Alert.alert("Error", "Failed to load batches");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentProfile = async () => {
        try {
            const studentId = await AsyncStorage.getItem("studentId");
            const res = await studentService.getProfile(studentId);
            setStudentData({
                name: res.data.name || "Student",
                mobile: res.data.mobile || "N/A"
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleEnrollClick = (batch) => {
        setSelectedBatch(batch);
        setMessage(`I would like to enroll in ${batch.name}.`);
        setModalVisible(true);
    };

    const submitEnrollment = async () => {
        if (!message.trim()) {
            Alert.alert("Required", "Please enter a message");
            return;
        }

        setSubmitting(true);
        try {
            const studentId = await AsyncStorage.getItem("studentId");
            await studentService.submitBatchInquiry({
                studentId: studentId,
                batchId: selectedBatch.id,
                message: message,
                planType: selectedPlan
            });
            Alert.alert("Success", "Enrollment request submitted! Admin will review it.");
            setModalVisible(false);
            setMessage("");
        } catch (error) {
            Alert.alert("Error", "Failed to submit enrollment request");
        } finally {
            setSubmitting(false);
        }
    };

    const renderBatch = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                    <Icon name="account-group" size={28} color={Colors.PRIMARY} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.batchName}>{item.name}</Text>
                    <Text style={styles.instructor}>👨‍🏫 {item.instructor || "Instructor"}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Icon name="clock-outline" size={16} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>{item.startTime} - {item.endTime}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="calendar" size={16} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>{item.days || "Mon, Wed, Fri"}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="signal" size={16} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>Level: {item.level || "All Levels"}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="account-multiple" size={16} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>
                        {item.currentStudents || 0}/{item.maxCapacity || 20} Students
                    </Text>
                </View>

                {/* Estimated Fees Integration */}
                <View style={styles.feeSection}>
                    <Text style={styles.feeTitle}>ESTIMATED FEES</Text>
                    <View style={styles.feeGrid}>
                        {feeStructure
                            .filter(f => f.category === (item.level === 'Kids' ? 'Kids' : 'Regular'))
                            .slice(0, 2)
                            .map((fee, idx) => (
                                <View key={idx} style={styles.feeChip}>
                                    <Text style={styles.feeChipLabel}>{fee.plan}</Text>
                                    <Text style={styles.feeChipValue}>₹{fee.amount}</Text>
                                </View>
                            ))
                        }
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.enrollBtn} onPress={() => handleEnrollClick(item)}>
                <Icon name="school-outline" size={18} color={Colors.WHITE} />
                <Text style={styles.enrollBtnText}>Request Enrollment</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <BaseScreen title="Batch Enrollment" loading={loading} isScrollable={false} useGradient={true}>
            <FlatList
                data={batches}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderBatch}
                contentContainerStyle={{ paddingBottom: 25, paddingTop: 20, paddingHorizontal: 20 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="school-outline" size={60} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No batches available</Text>
                    </View>
                }
            />

            {/* Enrollment Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enrollment Request</Text>
                        <Text style={styles.modalSubtitle}>{selectedBatch?.name}</Text>

                        <View style={styles.confirmBox}>
                            <Text style={styles.confirmLabel}>Requesting for:</Text>
                            <Text style={styles.confirmValue}>{studentData.name}</Text>
                            <Text style={styles.confirmSub}>{studentData.mobile}</Text>
                        </View>

                        <Text style={styles.sectionLabel}>Select Plan:</Text>
                        <View style={styles.planContainer}>
                            <TouchableOpacity
                                style={[styles.planOption, message.includes("Monthly") ? styles.activePlan : null]}
                                onPress={() => setMessage(`I would like to enroll in ${selectedBatch.name} (Monthly).`)}
                            >
                                <Icon name={message.includes("Monthly") ? "radiobox-marked" : "radiobox-blank"} size={20} color={message.includes("Monthly") ? Colors.PRIMARY : Colors.TEXT_SECONDARY} />
                                <Text style={[styles.planText, message.includes("Monthly") && styles.activePlanText]}>Monthly</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.planOption, message.includes("Quarterly") ? styles.activePlan : null]}
                                onPress={() => setMessage(`I would like to enroll in ${selectedBatch.name} (Quarterly).`)}
                            >
                                <Icon name={message.includes("Quarterly") ? "radiobox-marked" : "radiobox-blank"} size={20} color={message.includes("Quarterly") ? Colors.PRIMARY : Colors.TEXT_SECONDARY} />
                                <Text style={[styles.planText, message.includes("Quarterly") && styles.activePlanText]}>Quarterly</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Add a note (optional)..."
                            multiline
                            value={message}
                            onChangeText={setMessage}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={submitEnrollment} disabled={submitting}>
                                {submitting ? <ActivityIndicator size="small" color={Colors.WHITE} /> : <Text style={styles.submitText}>Submit</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.WHITE,
        borderRadius: 20,
        padding: 18,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: Colors.BORDER,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#FFF1F2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    batchName: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 4 },
    instructor: { fontSize: 13, color: Colors.TEXT_SECONDARY },

    details: { marginBottom: 15 },
    detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    detailText: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginLeft: 8 },

    enrollBtn: {
        flexDirection: "row",
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    enrollBtnText: { color: Colors.WHITE, fontSize: 14, fontWeight: "bold" },

    emptyContainer: { alignItems: "center", marginTop: 80 },
    emptyText: { color: Colors.TEXT_MUTED, fontSize: 16, marginTop: 15 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
    modalContent: { width: "90%", backgroundColor: Colors.WHITE, borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 22, fontWeight: "bold", color: Colors.PRIMARY, marginBottom: 5 },
    modalSubtitle: { fontSize: 16, color: Colors.TEXT_SECONDARY, marginBottom: 15 },
    modalInput: {
        borderWidth: 1,
        borderColor: Colors.BORDER,
        borderRadius: 15,
        padding: 15,
        height: 100,
        textAlignVertical: "top",
        backgroundColor: Colors.BG_CONTENT,
        marginBottom: 20,
    },
    modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 15 },
    cancelBtn: { paddingVertical: 10, paddingHorizontal: 15 },
    submitBtn: { backgroundColor: Colors.PRIMARY, paddingVertical: 10, paddingHorizontal: 25, borderRadius: 12 },
    cancelText: { color: Colors.TEXT_SECONDARY, fontWeight: "bold" },
    submitText: { color: Colors.WHITE, fontWeight: "bold" },

    confirmBox: { backgroundColor: Colors.BG_CONTENT, padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: Colors.BORDER },
    confirmLabel: { fontSize: 10, color: Colors.TEXT_MUTED, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    confirmValue: { fontSize: 16, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    confirmSub: { fontSize: 12, color: Colors.TEXT_SECONDARY },

    feeSection: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    feeTitle: { fontSize: 10, fontWeight: 'bold', color: Colors.TEXT_MUTED, letterSpacing: 1, marginBottom: 8 },
    feeGrid: { flexDirection: 'row', gap: 10 },
    feeChip: { backgroundColor: Colors.BG_CONTENT, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.BORDER, flex: 1, alignItems: 'center' },
    feeChipLabel: { fontSize: 10, color: Colors.TEXT_SECONDARY, textTransform: 'uppercase' },
    feeChipValue: { fontSize: 13, fontWeight: 'bold', color: Colors.PRIMARY },

    sectionLabel: { fontSize: 14, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginBottom: 10, marginTop: 5 },
    planContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    planOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER, backgroundColor: Colors.BG_CONTENT, gap: 8 },
    activePlan: { borderColor: Colors.PRIMARY, backgroundColor: '#FFF1F2' },
    planText: { fontSize: 14, color: Colors.TEXT_SECONDARY, fontWeight: 'bold' },
    activePlanText: { color: Colors.PRIMARY },
});
