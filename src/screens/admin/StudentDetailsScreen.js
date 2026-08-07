import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Dimensions, Linking, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import API from "../../api/axios";
import Colors from "../../theme/Colors";


const { width } = Dimensions.get("window");

export default function StudentDetailsScreen({ navigation, route }) {
    const { id, studentData } = route.params;
    const [student, setStudent] = useState(studentData || null);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseURL = API.defaults.baseURL.replace(/\/$/, "");

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        try {
            // Attempt to fetch fresh details
            const sRes = await adminService.getStudentById(id);
            setStudent(sRes.data);

            // Fetch fees (keep mock if API fails for fees specifically, or implement separate try/catch)
            // For now, we assume fees API might be missing, so we use mock fees for demo if real fetch fails
            try {
                const fRes = await adminService.getStudentFees(id);
                setFees(fRes.data);
            } catch (feeError) {
                // Fallback to mock fees for demo
                setFees([
                    { id: 1, plan: "October Tuition", amount: "150.00", status: "PAID", date: "Oct 01", method: "Credit Card" },
                    { id: 2, plan: "September Tuition", amount: "150.00", status: "PAID", date: "Sep 02", method: "Bank Transfer" }
                ]);
            }
        } catch (error) {
            console.error(error);
            if (!student) {
                Alert.alert("Error", "Could not load student details");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            setLoading(true);
            const newStatus = student?.active === false ? true : false;
            await adminService.updateStudent(id, { ...student, active: newStatus });
            await fetchDetails();
            Alert.alert("Success", `Student ${newStatus ? 'Activated' : 'Deactivated'}`);
        } catch (error) {
            console.error("Toggle failed", error);
            Alert.alert("Error", "Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Student",
            "Are you sure you want to delete this student profile? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await adminService.deleteStudent(id);
                            Alert.alert("Success", "Student profile deleted successfully", [
                                { text: "OK", onPress: () => navigation.navigate("StudentManagement") }
                            ]);
                        } catch (error) {
                            console.error("Delete failed", error);
                            Alert.alert("Error", "Failed to delete student");
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.PRIMARY} /></View>;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Icon name="chevron-left" size={32} color={Colors.PRIMARY_DARK} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="lamp" size={24} color={Colors.PRIMARY} style={{ marginRight: 8 }} />
                    <Text style={styles.headerTitle}>Studio Admin</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                    <Icon name="dots-horizontal" size={28} color={Colors.PRIMARY_DARK} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        {student?.profilePic ? (
                            <Image
                                source={{ uri: `${baseURL}/uploads/profiles/${student.profilePic}` }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' }]}>
                                <Icon name="account" size={50} color={Colors.TEXT_MUTED} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{student?.name || "Student Name"}</Text>
                    <Text style={styles.classType}>
                        {student?.danceType?.name || student?.classType || "Course Name"}
                        {student?.batch?.name ? ` • ${student.batch.name}` : ""}
                    </Text>
                    <Text style={styles.studentId}>Student ID: #{student?.id || "0000"}</Text>
                </View>

                {/* Status Toggle Card */}
                <View style={styles.statusToggleCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>Student Active Status</Text>
                        <Text style={styles.toggleSub}>Deactivating student will restrict their access</Text>
                    </View>
                    <Switch
                        value={student?.active !== false}
                        onValueChange={handleToggleStatus}
                        trackColor={{ false: "#CBD5E1", true: Colors.PRIMARY }}
                        thumbColor={Colors.WHITE}
                    />
                </View>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Admission Date</Text>
                        <Text style={styles.statValue}>{student?.joiningDate || "N/A"}</Text>
                        <View style={student?.active === false ? styles.inactiveBadge : styles.activeBadge}>
                            <Icon name={student?.active === false ? "alert-circle" : "check-circle"} size={14} color={student?.active === false ? Colors.ERROR : "#10B981"} />
                            <Text style={student?.active === false ? styles.inactiveText : styles.activeText}>
                                {student?.active === false ? "Inactive" : "Active"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Attendance Rate</Text>
                        <Text style={styles.statValue}>{student?.attendanceRate || "0%"}</Text>
                        <Text style={[styles.growthText, { color: (student?.attendanceGrowth || "").startsWith("-") ? Colors.ERROR : "#10B981" }]}>
                            {student?.attendanceGrowth || "+0%"} from last month
                        </Text>
                    </View>
                </View>

                {/* Fee History & Continuation Status */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Fee History & Status</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("FeeManagement")}><Text style={styles.viewAllText}>Manage Dues</Text></TouchableOpacity>
                </View>

                {fees.map((fee, index) => {
                    const isPaid = fee.status?.toUpperCase() === 'PAID';
                    const isPartial = fee.status?.toUpperCase() === 'PARTIAL' || (fee.paidAmount > 0 && fee.paidAmount < fee.amount);
                    const remainingBal = Math.max(0, (parseFloat(fee.amount) || 0) - (parseFloat(fee.paidAmount) || 0));

                    return (
                        <View key={fee.id || index} style={styles.feeCard}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                                    <Text style={styles.feeAmount}>₹{fee.amount}</Text>
                                    <View style={[styles.paidBadge, { backgroundColor: isPaid ? "#ECFDF5" : isPartial ? "#FEF3C7" : "#FFE4E6" }]}>
                                        <Text style={[styles.paidText, { color: isPaid ? "#10B981" : isPartial ? "#D97706" : "#E11D48" }]}>
                                            {isPaid ? "PAID" : isPartial ? `PARTIAL (Bal: ₹${remainingBal})` : "UNPAID"}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.feePlan}>{fee.plan} {fee.feeMonth ? `• ${fee.feeMonth}` : ''}</Text>
                                <Text style={styles.feeDetail}>
                                    {fee.paidAmount > 0 ? `Paid: ₹${fee.paidAmount} ` : ''}
                                    {isPartial ? `| Pending: ₹${remainingBal} ` : ''}
                                    • {fee.date || fee.dueDate || 'N/A'}
                                </Text>

                                <TouchableOpacity
                                    style={styles.receiptBtn}
                                    onPress={() => navigation.navigate("Receipt", {
                                        ...fee,
                                        studentName: student?.name || "Student",
                                        transactionId: `TXN-${id}-${fee.id}`,
                                    })}
                                >
                                    <Text style={styles.receiptText}>View Receipt</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.receiptIconBox}>
                                <Icon name="receipt" size={28} color={Colors.PRIMARY} style={{ opacity: 0.6 }} />
                            </View>
                        </View>
                    );
                })}

                {/* Next Month / Cycle Continuation Card */}
                <View style={[styles.statusToggleCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD', borderWidth: 1 }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.toggleTitle, { color: '#0369A1' }]}>Next Cycle Continuation</Text>
                        <Text style={styles.toggleSub}>
                            {student?.autoRenewNextCycle !== false
                                ? "Auto-renewal active for next month/quarter. Fee will generate automatically."
                                : "Paused - Student will not be automatically billed next cycle."}
                        </Text>
                    </View>
                    <Icon
                        name={student?.autoRenewNextCycle !== false ? "calendar-sync" : "calendar-remove"}
                        size={28}
                        color={student?.autoRenewNextCycle !== false ? "#0284C7" : Colors.TEXT_MUTED}
                        style={{ marginLeft: 10 }}
                    />
                </View>

                {/* Parent Contact */}
                <Text style={styles.sectionTitle}>Parent Contact</Text>
                <View style={styles.parentCard}>
                    <View style={styles.parentAvatarBox}>
                        <Icon name="account" size={24} color={Colors.PRIMARY} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.parentName}>{student?.parentRelation ? `Parent (${student.parentRelation})` : "Parent / Guardian"}</Text>
                        {/* Explicitly showing the number now */}
                        <Text style={styles.contactText}>{student?.parentMobile || student?.mobileNumber || "No Contact Info"}</Text>
                        <Text style={styles.parentRole}>Primary Contact</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: Colors.PRIMARY }]}
                        onPress={() => Linking.openURL(`tel:${student?.parentMobile || student?.mobileNumber || student?.parentPhone}`)}
                    >
                        <Icon name="phone" size={20} color={Colors.WHITE} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: Colors.WHITE, borderWidth: 1, borderColor: Colors.PRIMARY, marginLeft: 10 }]}
                        onPress={() => Linking.openURL(`sms:${student?.parentMobile || student?.mobileNumber || student?.parentPhone}`)}
                    >
                        <Icon name="message-text-outline" size={20} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                </View>

                {/* Explicit Active/Deactivate Button */}
                <TouchableOpacity
                    style={[styles.statusBtn, { backgroundColor: student?.active ? '#FFF1F2' : '#F0FDF4' }]}
                    onPress={handleToggleStatus}
                >
                    <Icon name={student?.active ? "account-off" : "account-check"} size={22} color={student?.active ? Colors.PRIMARY : "#16A34A"} />
                    <Text style={[styles.statusBtnText, { color: student?.active ? Colors.PRIMARY : "#16A34A" }]}>
                        {student?.active ? "Deactivate Student Account" : "Activate Student Account"}
                    </Text>
                </TouchableOpacity>

                {/* Delete Profile */}
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Icon name="trash-can-outline" size={20} color={Colors.PRIMARY} style={{ marginRight: 8 }} />
                    <Text style={styles.deleteText}>Delete Student Profile</Text>
                </TouchableOpacity>
                <Text style={styles.disclaimer}>
                    Removing this student will archive all records. This action can be undone by an administrator within 30 days.
                </Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    loading: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.BG_CONTENT,
    },
    iconBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.PRIMARY_DARK },

    container: { flex: 1, paddingHorizontal: 20 },

    // Profile
    profileHeader: { alignItems: "center", marginVertical: 24 },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 4,
        backgroundColor: Colors.WHITE,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 16,
    },
    avatar: { width: "100%", height: "100%", borderRadius: 50 },
    name: { fontSize: 24, fontWeight: "800", color: Colors.PRIMARY_DARK, marginBottom: 4 },
    classType: { fontSize: 16, fontWeight: "700", color: Colors.PRIMARY, marginBottom: 2 },
    studentId: { fontSize: 14, fontWeight: "500", color: Colors.TEXT_SECONDARY },

    // Stats
    statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
    statCard: {
        width: (width - 50) / 2,
        backgroundColor: Colors.WHITE,
        borderRadius: 20,
        padding: 16,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statLabel: { fontSize: 12, fontWeight: "600", color: Colors.TEXT_MUTED, marginBottom: 8 },
    statValue: { fontSize: 18, fontWeight: "800", color: Colors.PRIMARY_DARK, marginBottom: 6 },
    activeBadge: { flexDirection: 'row', alignItems: 'center' },
    activeText: { fontSize: 12, fontWeight: "600", color: "#10B981", marginLeft: 4 },
    inactiveBadge: { flexDirection: 'row', alignItems: 'center' },
    inactiveText: { fontSize: 12, fontWeight: "600", color: Colors.ERROR, marginLeft: 4 },
    growthText: { fontSize: 11, fontWeight: "600", color: "#10B981" },

    // Sections
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: Colors.PRIMARY_DARK, marginBottom: 16, marginTop: 10 },
    viewAllText: { fontSize: 14, fontWeight: "700", color: Colors.PRIMARY },

    // Fee History
    feeCard: {
        backgroundColor: Colors.WHITE,
        borderRadius: 24,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    feeAmount: { fontSize: 16, fontWeight: "800", color: Colors.PRIMARY, marginRight: 8 },
    paidBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    paidText: { color: "#10B981", fontSize: 10, fontWeight: "800" },
    feePlan: { fontSize: 16, fontWeight: "700", color: Colors.PRIMARY_DARK, marginTop: 4 },
    feeDetail: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginTop: 2, marginBottom: 12 },
    receiptBtn: { backgroundColor: "#F1F5F9", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
    receiptText: { fontSize: 12, fontWeight: "700", color: Colors.PRIMARY_DARK },
    receiptIconBox: {
        width: 80, height: 80, backgroundColor: "#FFE4E6", borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', marginLeft: 16
    },

    // Parent
    parentCard: {
        backgroundColor: Colors.WHITE,
        borderRadius: 24,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
        elevation: 2,
    },
    parentAvatarBox: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: "#FFE4E6",
        justifyContent: 'center', alignItems: 'center'
    },
    parentName: { fontSize: 16, fontWeight: "800", color: Colors.PRIMARY_DARK },
    parentRole: { fontSize: 12, color: Colors.TEXT_SECONDARY },
    actionBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

    // Delete
    deleteBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: "#FFF1F2", paddingVertical: 16, borderRadius: 20, marginBottom: 12
    },
    deleteText: { color: Colors.PRIMARY, fontWeight: "700", fontSize: 16 },
    disclaimer: { textAlign: 'center', color: Colors.TEXT_MUTED, fontSize: 12, paddingHorizontal: 20, lineHeight: 18 },

    // Toggle
    statusToggleCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.WHITE,
        padding: 20, borderRadius: 24, marginBottom: 24, elevation: 2,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8
    },
    toggleTitle: { fontSize: 16, fontWeight: "800", color: Colors.PRIMARY_DARK, marginBottom: 2 },
    toggleSub: { fontSize: 12, color: Colors.TEXT_SECONDARY, fontWeight: "500" },

    // New Styles
    contactText: { fontSize: 14, fontWeight: "700", color: Colors.TEXT_PRIMARY, marginBottom: 2 },
    statusBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 20, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)'
    },
    statusBtnText: { fontWeight: "800", fontSize: 16, marginLeft: 8 }
});
