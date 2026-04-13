import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, ScrollView, StatusBar, Platform, Animated, RefreshControl, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";
import Footer from "../../components/Footer";

export default function StudentManagementScreen({ navigation, route }) {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All Students");

    // Batch Mode
    const batchId = route.params?.batchId;
    const [showAddModal, setShowAddModal] = useState(false);
    const [allStudents, setAllStudents] = useState([]); // For picking students to add
    const [pickerSearch, setPickerSearch] = useState("");

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const filters = ["All Students", "Active", "Inactive"];

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchStudents();
        });

        if (route.params?.filter) {
            setActiveFilter(route.params.filter === 'Active' ? 'Active' : (route.params.filter === 'Inactive' ? 'Inactive' : 'All Students'));
        }

        return unsubscribe;
    }, [navigation, route.params]);

    const fetchStudents = async () => {
        try {
            let res;
            if (batchId) {
                res = await adminService.getStudentsByBatch(batchId);
                const allRes = await adminService.getStudents();
                setAllStudents(allRes.data);
            } else {
                res = await adminService.getStudents();
                setAllStudents(res.data);
            }
            setStudents(res.data);

            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
            ]).start();
        } catch (error) {
            console.error("Failed to fetch students:", error);
            Alert.alert("Error", "Could not load students. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const addToBatch = async (student) => {
        try {
            if (students.find(s => s.id === student.id)) {
                Alert.alert("Already Added", `${student.name} is already in this batch.`);
                return;
            }

            Alert.alert("Add Student", `Add ${student.name} to this batch?`, [
                { text: "Cancel" },
                {
                    text: "Add", onPress: async () => {
                        try {
                            await adminService.updateStudent(student.id, { ...student, batch: { id: batchId } });
                            Alert.alert("Success", "Student added to batch");
                            fetchStudents();
                            setShowAddModal(false);
                        } catch (e) {
                            Alert.alert("Error", "Failed to add student to batch");
                        }
                    }
                }
            ]);
        } catch (e) {
            console.error(e);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesFilter = true;
        if (activeFilter === "Active") matchesFilter = s.active === true;
        else if (activeFilter === "Inactive") matchesFilter = s.active === false;

        return matchesSearch && matchesFilter;
    });

    const handleDelete = async (id) => {
        Alert.alert("Confirm Delete", "Remove this student permanently?", [
            { text: "Cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await adminService.deleteStudent(id);
                        fetchStudents();
                    } catch (error) {
                        Alert.alert("Error", "Could not delete student");
                    }
                }
            }
        ]);
    };

    const renderStudentCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Image
                    source={{ uri: `https://ui-avatars.com/api/?name=${item.name}&background=random&color=fff&size=128` }}
                    style={styles.avatarImg}
                />
                <View style={styles.headerTextContainer}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentSubtitle}>
                        {item.skillLevel?.toUpperCase() || "General"} • {item.danceType?.name?.toUpperCase() || "Dance"}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.active ? '#DCFCE7' : '#FEE2E2' }]}>
                        <Text style={[styles.statusText, { color: item.active ? '#166534' : '#991B1B' }]}>
                            {item.active ? "ACTIVE" : "INACTIVE"}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.moreBtn}
                    onPress={() => {
                        Alert.alert("Manage Student", `Options for ${item.name}`, [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete Permanently", style: "destructive", onPress: () => handleDelete(item.id) }
                        ]);
                    }}
                >
                    <Icon name="dots-vertical" size={24} color={Colors.TEXT_MUTED} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Icon name="calendar-clock" size={16} color={Colors.TEXT_MUTED} style={{ marginBottom: 4 }} />
                    <Text style={styles.statLabel}>BATCH</Text>
                    <Text style={styles.statValue}>{item.batch ? item.batch.name : "No Batch"}</Text>
                </View>
                <View style={[styles.statItem, { alignItems: 'flex-end' }]}>
                    <Icon name="phone" size={16} color={Colors.TEXT_MUTED} style={{ marginBottom: 4 }} />
                    <Text style={styles.statLabel}>CONTACT</Text>
                    <Text style={styles.statValue}>{item.parentMobile || item.mobileNumber || item.parentPhone || "N/A"}</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.viewProfileBtn}
                    onPress={() => navigation.navigate("StudentDetails", { id: item.id, studentData: item })}
                >
                    <Text style={styles.viewProfileText}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.mailBtn, { backgroundColor: '#EFF6FF' }]}
                    onPress={() => navigation.navigate("EditStudent", { studentId: item.id })}
                >
                    <Icon name="pencil" size={20} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mailBtn}>
                    <Icon name="phone-outline" size={20} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <BaseScreen 
            title="Student Management" 
            loading={loading}
            isScrollable={false}
            actions={[{ 
                icon: 'plus', 
                onPress: () => batchId ? setShowAddModal(true) : navigation.navigate("AddStudent"),
                color: Colors.PRIMARY,
                size: 30
            }]}
        >
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Icon name="magnify" size={22} color={Colors.PRIMARY} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search students..."
                        placeholderTextColor={Colors.TEXT_MUTED}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
                    {filters.map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Animated.FlatList
                data={filteredStudents}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderStudentCard}
                contentContainerStyle={styles.listContent}
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="account-search-outline" size={60} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No students found</Text>
                    </View>
                }
                ListFooterComponent={<Footer />}
            />

            {/* Add Existing Student Modal */}
            <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Student to Batch</Text>
                        <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeBtn}>
                            <Icon name="close" size={24} color={Colors.TEXT_PRIMARY} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalSearch}>
                        <Icon name="magnify" size={20} color={Colors.TEXT_MUTED} />
                        <TextInput
                            style={styles.modalSearchInput}
                            placeholder="Search student..."
                            value={pickerSearch}
                            onChangeText={setPickerSearch}
                        />
                    </View>

                    <FlatList
                        data={allStudents.filter(s => s.name.toLowerCase().includes(pickerSearch.toLowerCase()) || s.email?.toLowerCase().includes(pickerSearch.toLowerCase()))}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ padding: 20 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.pickerItem} onPress={() => addToBatch(item)}>
                                <View style={styles.pickerAvatar}>
                                    <Text style={styles.pickerAvatarText}>{item.name.charAt(0)}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.pickerName}>{item.name}</Text>
                                    <Text style={styles.pickerSub}>{item.email || "No Email"}</Text>
                                </View>
                                {item.batch && item.batch.id === batchId && (
                                    <Icon name="check-circle" size={20} color="#10B981" />
                                )}
                            </TouchableOpacity>
                        )}
                        ListFooterComponent={<Footer />}
                    />
                </View>
            </Modal>
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    searchSection: {
        backgroundColor: Colors.BG_CONTENT,
        paddingHorizontal: 25,
        paddingTop: 15,
        paddingBottom: 10,
        zIndex: 10
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.WHITE,
        paddingHorizontal: 15,
        borderRadius: 16,
        height: 50,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: Colors.TEXT_PRIMARY },
    filterChip: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.WHITE,
        marginRight: 10,
        borderWidth: 1,
        borderColor: Colors.BORDER,
    },
    filterChipActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
    filterText: { fontSize: 13, fontWeight: "600", color: Colors.TEXT_SECONDARY },
    filterTextActive: { color: Colors.WHITE },
    listContent: { paddingHorizontal: 25, paddingBottom: 50 },
    card: {
        backgroundColor: Colors.WHITE,
        borderRadius: 22,
        padding: 18,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    avatarImg: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: "#F1F5F9" },
    headerTextContainer: { flex: 1, marginLeft: 15 },
    studentName: { fontSize: 17, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    studentSubtitle: { fontSize: 11, fontWeight: "bold", color: Colors.TEXT_MUTED, marginTop: 4, letterSpacing: 0.5 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
    statusText: { fontSize: 9, fontWeight: 'bold' },
    moreBtn: { padding: 5 },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        marginBottom: 15
    },
    statItem: { flex: 1 },
    statLabel: { fontSize: 10, fontWeight: "bold", color: Colors.TEXT_MUTED, marginBottom: 2, letterSpacing: 0.5 },
    statValue: { fontSize: 13, fontWeight: "600", color: Colors.TEXT_PRIMARY },
    cardActions: { flexDirection: "row", alignItems: "center", gap: 10 },
    viewProfileBtn: {
        flex: 1,
        height: 45,
        backgroundColor: "#FFF1F2",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    viewProfileText: { color: Colors.PRIMARY, fontWeight: "bold", fontSize: 13 },
    mailBtn: {
        width: 45,
        height: 45,
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: { alignItems: "center", marginTop: 50 },
    emptyText: { marginTop: 15, fontSize: 15, color: Colors.TEXT_MUTED },
    modalContainer: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: Colors.WHITE, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    closeBtn: { padding: 5 },
    modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.WHITE, margin: 20, paddingHorizontal: 15, height: 45, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER },
    modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: Colors.TEXT_PRIMARY },
    pickerItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.WHITE, padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.BORDER },
    pickerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    pickerAvatarText: { fontSize: 16, fontWeight: 'bold', color: Colors.PRIMARY },
    pickerName: { fontSize: 16, fontWeight: '600', color: Colors.TEXT_PRIMARY },
    pickerSub: { fontSize: 12, color: Colors.TEXT_SECONDARY }
});
