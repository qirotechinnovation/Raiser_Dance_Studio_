import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, Image, StyleSheet, Modal } from "react-native";
import adminService from "../../api/adminService";
import API from "../../api/axios";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";

export default function AdminEventInquiriesScreen() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        loadInquiries();
    }, []);

    const loadInquiries = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllEventInquiries();
            setInquiries(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await adminService.updateEventInquiryStatus(id, status);
            Alert.alert("Success", `Inquiry marked as ${status}`);
            loadInquiries();
        } catch (error) {
            Alert.alert("Error", "Update failed");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.studentName}>{item.student?.name || "Unknown Student"}</Text>
                <Text style={styles.studentMobile}>{item.student?.parentMobile || "No Contact"}</Text>
                <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
            <Text style={styles.eventName}>{item.event?.title}</Text>
            <Text style={styles.message}>"{item.message}"</Text>

            <View style={styles.actionRow}>
                {item.status === 'PENDING' && (
                    <>
                        <TouchableOpacity style={styles.acceptBtn} onPress={() => updateStatus(item.id, 'ACCEPTED')}>
                            <Text style={styles.btnText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rejectBtn} onPress={() => updateStatus(item.id, 'REJECTED')}>
                            <Text style={styles.btnText}>Reject</Text>
                        </TouchableOpacity>
                    </>
                )}

                {item.status === 'PAID' && (
                    <>
                        <TouchableOpacity style={styles.viewBtn} onPress={() => setSelectedImage(item.receiptPhoto)}>
                            <Text style={styles.btnText}>View Receipt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.verifyBtn} onPress={() => updateStatus(item.id, 'CONFIRMED')}>
                            <Text style={styles.btnText}>Verify & Confirm</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );

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

    return (
        <BaseScreen 
            title="Event Inquiries" 
            loading={loading}
            useGradient={true}
            onRefresh={loadInquiries}
        >
            <View style={{ padding: 20 }}>
                <FlatList
                    data={inquiries}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: Colors.TEXT_MUTED }}>No event inquiries yet</Text>}
                />
            </View>

            <Modal visible={!!selectedImage} transparent={true}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.closeModal} onPress={() => setSelectedImage(null)}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                    <Image source={{ uri: `${API.defaults.baseURL}uploads/events/receipts/${selectedImage}` }} style={styles.fullImage} />
                </View>
            </Modal>
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
    studentName: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
    studentMobile: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginTop: 2 },
    statusBadge: { fontWeight: "bold", fontSize: 14 },
    eventName: { fontSize: 14, color: "#4B5563", marginBottom: 5, fontStyle: "italic" },
    message: { fontSize: 14, color: "#374151", marginBottom: 15 },
    actionRow: { flexDirection: "row", gap: 10 },
    acceptBtn: { backgroundColor: "#22C55E", padding: 8, borderRadius: 5 },
    rejectBtn: { backgroundColor: Colors.ERROR, padding: 8, borderRadius: 5 },
    viewBtn: { backgroundColor: Colors.TEXT_SECONDARY, padding: 8, borderRadius: 5 },
    verifyBtn: { backgroundColor: "#10B981", padding: 8, borderRadius: 5 },
    btnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
    fullImage: { width: "90%", height: "80%", resizeMode: "contain" },
    closeModal: { position: "absolute", top: 40, right: 20, padding: 10 },
    closeText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});
