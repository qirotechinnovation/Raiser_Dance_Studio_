import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import API from "../../api/axios";
import Colors from "../../theme/Colors";


export default function AdminCancellationScreen({ navigation }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await API.get("/admin/events/cancellations");
            // Filter only PENDING requests or show all sorted by date
            const pending = res.data.filter(r => r.status === "PENDING");
            const processed = res.data.filter(r => r.status !== "PENDING");
            setRequests([...pending, ...processed]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load cancellation requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const res = await API.post(`/admin/events/cancellations/${id}/action`, { action });
            if (res.data.success) {
                Alert.alert("Success", `Request ${action === "APPROVE" ? "Approved" : "Declined"}`);
                loadRequests();
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Action failed");
        }
    };

    const renderItem = ({ item }) => {
        const isPending = item.status === "PENDING";

        return (
            <View style={[styles.card, !isPending && styles.cardProcessed]}>
                <View style={styles.headerRow}>
                    <Text style={styles.eventName}>{item.event?.title || "Unknown Event"}</Text>
                    <View style={[
                        styles.statusBadge,
                        isPending ? styles.statusPending : (item.status === "APPROVED" ? styles.statusApproved : styles.statusDeclined)
                    ]}>
                        <Text style={[
                            styles.statusText,
                            isPending ? styles.textPending : (item.status === "APPROVED" ? styles.textApproved : styles.textDeclined)
                        ]}>{item.status}</Text>
                    </View>
                </View>

                <Text style={styles.studentName}>Student: {item.student?.name}</Text>
                <Text style={styles.reason}>Reason: {item.reason}</Text>
                <Text style={styles.date}>Requested: {new Date(item.requestDate).toLocaleDateString()}</Text>

                {isPending && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnDecline]}
                            onPress={() => handleAction(item.id, "DECLINE")}
                        >
                            <Text style={styles.btnText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnApprove]}
                            onPress={() => handleAction(item.id, "APPROVE")}
                        >
                            <Text style={styles.btnText}>Approve</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.PRIMARY} barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cancellation Requests</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="check-all" size={50} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No pending cancellation requests</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F1F5F9" },
    header: {
        backgroundColor: Colors.PRIMARY,
        padding: 20,
        paddingTop: 50,
        flexDirection: "row",
        alignItems: "center",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 5
    },
    backBtn: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.WHITE },

    listContent: { padding: 20 },
    card: {
        backgroundColor: Colors.WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2
    },
    cardProcessed: { opacity: 0.7 },

    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
    eventName: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY, flex: 1, marginRight: 10 },

    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusPending: { backgroundColor: "#FEF3C7" },
    statusApproved: { backgroundColor: "#DCFCE7" },
    statusDeclined: { backgroundColor: "#FEE2E2" },

    statusText: { fontSize: 11, fontWeight: "bold" },
    textPending: { color: "#D97706" },
    textApproved: { color: "#16A34A" },
    textDeclined: { color: "#DC2626" },

    studentName: { fontSize: 14, color: "#475569", fontWeight: "600", marginBottom: 4 },
    reason: { fontSize: 14, color: Colors.TEXT_SECONDARY, fontStyle: "italic", marginBottom: 8 },
    date: { fontSize: 12, color: Colors.TEXT_MUTED, marginBottom: 12 },

    actionRow: { flexDirection: "row", gap: 12, borderTopWidth: 1, borderTopColor: Colors.BORDER, paddingTop: 12 },
    btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
    btnDecline: { backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: Colors.BORDER },
    btnApprove: { backgroundColor: Colors.PRIMARY },
    btnText: { fontWeight: "bold", fontSize: 13, color: Colors.WHITE },

    emptyContainer: { alignItems: "center", marginTop: 50 },
    emptyText: { color: Colors.TEXT_MUTED, marginTop: 10, fontSize: 16 }
});
