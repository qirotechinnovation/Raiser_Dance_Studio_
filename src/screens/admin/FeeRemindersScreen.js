import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


export default function FeeRemindersScreen({ navigation }) {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await adminService.getPendingFees();
            setPending(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReminder = async (feeId) => {
        try {
            await adminService.sendFeeReminder(feeId);
            Alert.alert("Sent", "Fee reminder was sent successfully.");
        } catch (error) {
            Alert.alert("Error", "Failed to send reminder");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.student?.name || "Student"}</Text>
                <Text style={styles.subText}>₹{item.amount} • Due {item.dueDate}</Text>
                <Text style={styles.phone}>{item.student?.parentMobile || "No Phone"}</Text>
            </View>
            <TouchableOpacity style={styles.remindBtn} onPress={() => handleSendReminder(item.id)}>
                <Icon name="bell-ring-outline" size={20} color="#0D9488" />
                <Text style={styles.remindBtnText}>Remind</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="chevron-left" size={28} color={Colors.PRIMARY_DARK} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fee Reminders</Text>
            </View>

            <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>PENDING COLLECTIONS</Text>
                <Text style={styles.summaryValue}>₹{pending.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}</Text>
            </View>

            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0D9488" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={pending}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={<Text style={styles.empty}>All fees are up to date! 🎉</Text>}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F0FDFA" },
    header: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: Colors.WHITE },
    backBtn: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.PRIMARY_DARK },
    summaryBox: { backgroundColor: "#0D9488", margin: 20, padding: 25, borderRadius: 20, elevation: 4 },
    summaryLabel: { color: "#CCFBF1", fontSize: 12, fontWeight: "bold", letterSpacing: 1 },
    summaryValue: { color: Colors.WHITE, fontSize: 32, fontWeight: "bold", marginTop: 5 },
    container: { flex: 1, paddingHorizontal: 20 },
    card: { backgroundColor: Colors.WHITE, borderRadius: 15, padding: 18, marginBottom: 12, flexDirection: "row", alignItems: "center", elevation: 1 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    subText: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginTop: 2 },
    phone: { fontSize: 12, color: Colors.TEXT_MUTED, marginTop: 4 },
    remindBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0FDFA", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
    remindBtnText: { color: "#0D9488", fontWeight: "bold", fontSize: 13, marginLeft: 8 },
    empty: { textAlign: "center", marginTop: 50, color: "#0D9488", fontSize: 16, fontWeight: "500" }
});
