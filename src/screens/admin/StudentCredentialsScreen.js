import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


export default function StudentCredentialsScreen({ navigation }) {
    const [students, setStudents] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [activeTab, setActiveTab] = useState("Students");

    useEffect(() => {
        fetchCredentials();
    }, []);

    const fetchCredentials = async () => {
        try {
            const [studentRes, adminRes] = await Promise.all([
                adminService.getStudents(),
                adminService.getUsers()
            ]);
            setStudents(studentRes.data);
            setAdmins(adminRes.data);
            setFilteredData(studentRes.data);
        } catch (error) {
            console.error("Error fetching credentials:", error);
            Alert.alert("Error", "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        const sourceData = activeTab === "Students" ? students : admins;
        if (text) {
            const filtered = sourceData.filter(
                (item) =>
                    (item.name || item.username || "").toLowerCase().includes(text.toLowerCase()) ||
                    (item.email || "").toLowerCase().includes(text.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(sourceData);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery("");
        setFilteredData(tab === "Students" ? students : admins);
    };

    const togglePasswordVisibility = (id) => {
        setVisiblePasswords((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(item.name || item.username || "?").charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{item.name || item.username}</Text>
                    <Text style={styles.role}>{item.classType || item.role || "User"}</Text>
                </View>
                {/* Only show status for students, admins usually strictly active */}
                {item.role !== "ADMIN" && (
                    <View style={[styles.statusBadge, { backgroundColor: item.active !== false ? "#DCFCE7" : "#FEE2E2" }]}>
                        <Text style={[styles.statusText, { color: item.active !== false ? "#166534" : "#991B1B" }]}>
                            {item.active !== false ? "Active" : "Inactive"}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            <View style={styles.credentialRow}>
                <Icon name="email-outline" size={20} color={Colors.TEXT_SECONDARY} />
                <View style={styles.credentialInfo}>
                    <Text style={styles.credentialLabel}>Email</Text>
                    <Text style={styles.credentialValue}>{item.email}</Text>
                </View>
            </View>

            <View style={styles.credentialRow}>
                <Icon name="lock-outline" size={20} color={Colors.TEXT_SECONDARY} />
                <View style={styles.credentialInfo}>
                    <Text style={styles.credentialLabel}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <Text style={[visiblePasswords[item.id] ? styles.passwordText : styles.hiddenPassword]}>
                            {visiblePasswords[item.id] ? item.password : "********"}
                        </Text>
                        <TouchableOpacity onPress={() => togglePasswordVisibility(item.id)} style={styles.eyeBtn}>
                            <Icon name={visiblePasswords[item.id] ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.TEXT_MUTED} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Credentials Vault</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "Students" && styles.activeTab]}
                    onPress={() => handleTabChange("Students")}
                >
                    <Text style={[styles.tabText, activeTab === "Students" && styles.activeTabText]}>Students</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "Admins" && styles.activeTab]}
                    onPress={() => handleTabChange("Admins")}
                >
                    <Text style={[styles.tabText, activeTab === "Admins" && styles.activeTabText]}>Admins</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Icon name="magnify" size={24} color={Colors.TEXT_MUTED} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by Name or Email"
                    placeholderTextColor={Colors.TEXT_MUTED}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="account-search-outline" size={60} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BORDER
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    backBtn: { padding: 4 },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.WHITE,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingHorizontal: 15,
        borderRadius: 12,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginTop: 15,
        marginBottom: 15
    },
    tab: {
        marginRight: 15,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: "#F1F5F9"
    },
    activeTab: {
        backgroundColor: Colors.PRIMARY
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.TEXT_SECONDARY
    },
    activeTabText: {
        color: Colors.WHITE
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: Colors.TEXT_PRIMARY },
    listContent: { paddingHorizontal: 20, paddingBottom: 20 },
    card: {
        backgroundColor: Colors.WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        elevation: 2,
        shadowColor: Colors.TEXT_SECONDARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4
    },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12
    },
    avatarText: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_SECONDARY },
    headerInfo: { flex: 1 },
    name: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    role: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: "bold" },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 16 },
    credentialRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
    credentialInfo: { flex: 1, marginLeft: 12 },
    credentialLabel: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginBottom: 2 },
    credentialValue: { fontSize: 15, fontWeight: "500", color: Colors.TEXT_PRIMARY },
    passwordText: { fontSize: 16, fontWeight: "bold", color: "#000000" }, // Explicit black for password
    passwordContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    hiddenPassword: { letterSpacing: 3, fontSize: 18, color: "#000000" }, // Black for asterisks too
    eyeBtn: { padding: 4 },
    emptyContainer: { alignItems: "center", marginTop: 60 },
    emptyText: { color: Colors.TEXT_MUTED, fontSize: 16, marginTop: 10 }
});
