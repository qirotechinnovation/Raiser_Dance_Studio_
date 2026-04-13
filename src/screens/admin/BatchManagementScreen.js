import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, StatusBar, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";
import Footer from "../../components/Footer";

export default function BatchManagementScreen({ navigation, route }) {
    const [statusFilter, setStatusFilter] = useState(route.params?.initialFilter || (route.params?.filter === "Requests" ? "Requests" : "Active"));
    const [searchQuery, setSearchQuery] = useState("");
    const [batches, setBatches] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchData();
        });
        return unsubscribe;
    }, [navigation, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (statusFilter === "Requests") {
                const res = await adminService.getBatchInquiries();
                setInquiries(res.data);
            } else if (statusFilter === "Today") {
                const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const res = await adminService.getBatchesByStatus("ACTIVE");
                const todayBatches = res.data.filter(b => b.days && b.days.includes(day));
                setBatches(todayBatches);
            } else {
                const status = statusFilter.toUpperCase(); 
                const res = await adminService.getBatchesByStatus(status);
                setBatches(res.data);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not load data");
        } finally {
            setLoading(false);
        }
    };

    const filteredBatches = batches.filter(b =>
        b.danceType?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.instructorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.batchName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (item) => {
        navigation.navigate('AddEditBatch', { batch: item });
    };

    const handleDeleteBatch = async (id) => {
        Alert.alert("Delete", "Remove this batch permanently?", [
            { text: "Cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await adminService.deleteBatch(id);
                        fetchData();
                    } catch (e) {
                        Alert.alert("Error", "Could not delete batch");
                    }
                }
            }
        ]);
    };

    const handleApproveInquiry = async (id) => {
        try {
            await adminService.approveBatchInquiry(id);
            Alert.alert("Success", "Student enrolled successfully");
            fetchData();
        } catch (e) { Alert.alert("Error", "Failed to approve"); }
    };

    const handleRejectInquiry = async (id) => {
        try {
            await adminService.rejectBatchInquiry(id);
            fetchData();
        } catch (e) { Alert.alert("Error", "Failed to reject"); }
    };

    const handleViewStudents = (item) => {
        navigation.navigate('StudentManagement', { batchId: item.id });
    };

    const renderInquiryCard = ({ item }) => (
        <View style={styles.batchCard}>
            <View style={[styles.cardAccent, { backgroundColor: '#F59E0B' }]} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.batchCategory, { color: '#F59E0B' }]}>ENROLLMENT REQUEST</Text>
                    <Text style={styles.detailTextSmall}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.batchTitle}>{item.student?.name}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={styles.detailTextSmall}>Batch: {item.batch?.name}</Text>
                    <Text style={[styles.detailTextSmall, { color: '#059669', fontWeight: 'bold' }]}>{item.planType || "MONTHLY"}</Text>
                </View>
                <Text style={[styles.detailTextSmall, { marginBottom: 20, fontStyle: 'italic' }]}>"{item.message || "I want to join this batch."}"</Text>

                <View style={styles.cardActions}>
                    <TouchableOpacity style={[styles.viewStudentsBtn, { backgroundColor: '#10B981', marginRight: 10 }]} onPress={() => handleApproveInquiry(item.id)}>
                        <Text style={styles.viewStudentsText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.viewStudentsBtn, { backgroundColor: Colors.ERROR }]} onPress={() => handleRejectInquiry(item.id)}>
                        <Text style={styles.viewStudentsText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderBatchCard = ({ item }) => (
        <View style={styles.batchCard}>
            <View style={styles.cardAccent} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.batchCategory}>
                        {item.danceType?.name?.toUpperCase() || "DANCE STYLE"} • {item.level || "BEGINNER"}
                    </Text>
                    <View style={[styles.enrollmentBadge, item.currentStudents >= item.maxCapacity && styles.fullBadge]}>
                        <Text style={[styles.enrollmentText, item.currentStudents >= item.maxCapacity && styles.fullText]}>
                            {item.currentStudents}/{item.maxCapacity} {item.currentStudents >= item.maxCapacity ? 'Full' : 'Enrolled'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.batchTitle}>{item.name || "Elite Batch"}</Text>

                <View style={styles.detailRow}>
                    <Icon name="calendar-month-outline" size={18} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailTextSmall}>{item.days || "Mon, Wed, Fri"}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Icon name="clock-outline" size={18} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailTextSmall}>{item.startTime} - {item.endTime}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Icon name="account-tie-outline" size={18} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailTextSmall}>Instructor: {item.instructor} • Room {item.roomNumber || '101'}</Text>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.viewStudentsBtn}
                        onPress={() => handleViewStudents(item)}
                    >
                        <Text style={styles.viewStudentsText}>View Students</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.editIconBtn}
                        onPress={() => handleEdit(item)}
                    >
                        <Icon name="pencil" size={20} color={Colors.TEXT_PRIMARY} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.editIconBtn, { backgroundColor: "#FEF2F2" }]}
                        onPress={() => handleDeleteBatch(item.id)}
                    >
                        <Icon name="trash-can-outline" size={20} color={Colors.ERROR} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderHeader = () => (
        <>
            <View style={styles.filterContainer}>
                {["Today", "Requests", "Active", "Archive"].map(filter => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.filterTab, statusFilter === filter && styles.activeFilterTab]}
                        onPress={() => setStatusFilter(filter)}
                    >
                        <Text style={[styles.filterTabText, statusFilter === filter && styles.activeFilterTabText]}>{filter}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="magnify" size={24} color={Colors.PRIMARY} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={statusFilter === "Requests" ? "Search requests..." : "Search style or instructor"}
                        placeholderTextColor={Colors.TEXT_MUTED}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>
        </>
    );

    const renderFooterContent = () => (
        <>
            {statusFilter !== "Requests" && (
                <View style={styles.adminTools}>
                    <Text style={styles.toolsTitle}>ADMINISTRATIVE TOOLS</Text>
                    <TouchableOpacity style={styles.toolItem}>
                        <View style={[styles.toolIconBox, { backgroundColor: "#FFF1F2" }]}>
                            <Icon name="calendar-edit" size={20} color={Colors.PRIMARY} />
                        </View>
                        <View style={styles.toolText}>
                            <Text style={styles.toolLabel}>Bulk Schedule Update</Text>
                            <Text style={styles.toolSub}>Modify multiple timings at once</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#CBD5E1" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolItem}>
                        <View style={[styles.toolIconBox, { backgroundColor: "#FFF1F2" }]}>
                            <Icon name="account-multiple-plus" size={20} color={Colors.PRIMARY} />
                        </View>
                        <View style={styles.toolText}>
                            <Text style={styles.toolLabel}>Assign Instructors</Text>
                            <Text style={styles.toolSub}>Manage teacher availability</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#CBD5E1" />
                    </TouchableOpacity>
                </View>
            )}
            <Footer />
        </>
    );

    return (
        <BaseScreen 
            title="Batches" 
            loading={loading}
            isScrollable={false}
            actions={[{ icon: 'plus', onPress: () => navigation.navigate('AddEditBatch'), color: Colors.PRIMARY, size: 30 }]}
        >
            <FlatList
                data={statusFilter === "Requests" ? inquiries : filteredBatches}
                renderItem={statusFilter === "Requests" ? renderInquiryCard : renderBatchCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={<Text style={styles.emptyText}>{statusFilter === "Requests" ? "No new requests" : "No batches found"}</Text>}
                ListFooterComponent={renderFooterContent}
            />
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: "row",
        backgroundColor: "#F1F5F9",
        marginHorizontal: 20,
        marginTop: 15,
        borderRadius: 20,
        padding: 6,
    },
    filterTab: { flex: 1, height: 44, justifyContent: "center", alignItems: "center", borderRadius: 16 },
    activeFilterTab: { backgroundColor: Colors.WHITE, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05 },
    filterTabText: { fontSize: 15, fontWeight: "700", color: Colors.TEXT_MUTED },
    activeFilterTabText: { color: Colors.PRIMARY },
    searchContainer: { paddingHorizontal: 20, paddingVertical: 15 },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.WHITE,
        paddingHorizontal: 20,
        borderRadius: 30,
        height: 56,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: Colors.BG_CONTENT,
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: Colors.TEXT_PRIMARY },
    listContent: { paddingHorizontal: 20, paddingBottom: 50 },
    batchCard: {
        backgroundColor: Colors.WHITE,
        borderRadius: 28,
        marginBottom: 20,
        flexDirection: "row",
        elevation: 4,
        shadowColor: Colors.PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 15,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#FCE7F3",
    },
    cardAccent: { width: 6, backgroundColor: Colors.PRIMARY },
    cardContent: { flex: 1, padding: 22 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    batchCategory: { fontSize: 12, fontWeight: "bold", color: Colors.PRIMARY, letterSpacing: 0.5 },
    enrollmentBadge: { backgroundColor: "#FFF1F2", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    fullBadge: { backgroundColor: "#FEF2F2" },
    enrollmentText: { fontSize: 11, color: Colors.PRIMARY, fontWeight: "bold" },
    fullText: { color: Colors.ERROR },
    batchTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 18 },
    detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    detailTextSmall: { fontSize: 14, color: Colors.TEXT_SECONDARY, marginLeft: 10, fontWeight: "600" },
    cardActions: { flexDirection: "row", marginTop: 20, gap: 12 },
    viewStudentsBtn: {
        flex: 1,
        height: 52,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
    },
    viewStudentsText: { color: Colors.WHITE, fontWeight: "bold", fontSize: 15 },
    editIconBtn: {
        width: 52,
        height: 52,
        backgroundColor: "#F1F5F9",
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    adminTools: { marginTop: 30, marginBottom: 20 },
    toolsTitle: { fontSize: 12, fontWeight: "bold", color: Colors.TEXT_MUTED, marginBottom: 20, letterSpacing: 1.5, paddingLeft: 5 },
    toolItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.WHITE,
        padding: 18,
        borderRadius: 24,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.BG_CONTENT,
        elevation: 1,
    },
    toolIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    toolText: { flex: 1, marginLeft: 18 },
    toolLabel: { fontSize: 15, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    toolSub: { fontSize: 12, color: Colors.TEXT_MUTED, marginTop: 2, fontWeight: "500" },
    emptyText: { textAlign: 'center', marginTop: 50, color: Colors.TEXT_MUTED, fontSize: 15 },
});
