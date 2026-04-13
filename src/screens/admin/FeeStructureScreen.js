import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Modal, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "../../theme/Colors";


export default function FeeStructureScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [feeStructure, setFeeStructure] = useState([]);
    const [feeSettings, setFeeSettings] = useState(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [admissionFee, setAdmissionFee] = useState('');
    const [feeNotes, setFeeNotes] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        setLoading(true);
        try {
            const [structRes, settingsRes] = await Promise.all([
                adminService.getFeeStructure(),
                adminService.getFeeSettings()
            ]);
            setFeeStructure(structRes.data);
            setFeeSettings(settingsRes.data);
            setAdmissionFee(settingsRes.data?.admissionFee?.toString() || '200');
            setFeeNotes(settingsRes.data?.feeNotes || '');
        } catch (error) {
            console.error("Error fetching data:", error);
            Alert.alert("Error", "Could not load data");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Delete Plan", "Are you sure you want to delete this fee plan?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await adminService.deleteFeeStructure(id);
                        setFeeStructure(prev => prev.filter(item => item.id !== id));
                        Alert.alert("Success", "Plan deleted");
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete plan");
                    }
                }
            }
        ]);
    };

    const handleUpdateSettings = async () => {
        try {
            await adminService.updateFeeSettings({
                ...feeSettings,
                admissionFee: parseFloat(admissionFee),
                feeNotes: feeNotes
            });
            setShowSettingsModal(false);
            Alert.alert("Success", "Settings updated!");
            fetchData();
        } catch (error) {
            Alert.alert("Error", "Failed to update settings");
        }
    };

    const renderCategoryTable = (category, title) => {
        const categoryData = feeStructure.filter(f => f.category === category);

        return (
            <View style={styles.tableContainer} key={category}>
                <View style={styles.categoryHeader}>
                    <Text style={styles.tableTitle}>{title}</Text>
                    {/* Add button specific to category could go here, but global FAB is easier */}
                </View>

                {categoryData.length > 0 ? (
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCell, { flex: 1 }]}>Plan</Text>
                            <Text style={[styles.headerCell, { flex: 1.2 }]}>Classes</Text>
                            <Text style={[styles.headerCell, { flex: 1 }]}>Fees</Text>
                            <Text style={[styles.headerCell, { width: 50 }]}>Act</Text>
                        </View>
                        {categoryData.map((item, index) => (
                            <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]} key={item.id}>
                                <Text style={[styles.cell, { flex: 1 }]}>{item.plan}</Text>
                                <Text style={[styles.cell, { flex: 1.2 }]}>{item.classes}</Text>
                                <Text style={[styles.cell, { flex: 1 }]}>
                                    ₹{item.amount.toLocaleString()}/-
                                    {item.discountPercent > 0 && <Text style={{ fontSize: 10, color: '#16A34A' }}>{'\n'}{item.discountPercent}% Off</Text>}
                                </Text>
                                <View style={{ width: 50, flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <TouchableOpacity onPress={() => navigation.navigate("AddEditFeeStructure", { mode: 'edit', feeItem: item })}>
                                        <Icon name="pencil" size={18} color="#2563EB" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                        <Icon name="delete" size={18} color={Colors.ERROR} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyText}>No plans in this category.</Text>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FDFDFD" />

            {/* Settings Modal */}
            <Modal visible={showSettingsModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>General Fee Settings</Text>
                        <Text style={styles.label}>Admission Fee (₹)</Text>
                        <TextInput
                            style={styles.input}
                            value={admissionFee}
                            onChangeText={setAdmissionFee}
                            keyboardType="numeric"
                        />
                        <Text style={styles.label}>Important Notes (One per line)</Text>
                        <TextInput
                            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                            value={feeNotes}
                            onChangeText={setFeeNotes}
                            multiline
                            placeholder="• Note 1\n• Note 2"
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowSettingsModal(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdateSettings}>
                                <Text style={styles.confirmText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Icon name="arrow-left" size={26} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fees Structure</Text>
                <TouchableOpacity onPress={() => setShowSettingsModal(true)} style={styles.settingsBtn}>
                    <Icon name="cog-outline" size={26} color="#475569" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.settingsCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="information-outline" size={20} color={Colors.PRIMARY} style={{ marginRight: 8 }} />
                        <Text style={styles.settingsText}>Admission Fee: <Text style={{ fontWeight: 'bold' }}>₹{feeSettings?.admissionFee || 0}</Text></Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
                        <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {renderCategoryTable("Kids", "Kids Fees Structure")}
                {renderCategoryTable("Regular", "Beginners / Intermediate / Bollywood")}
                {renderCategoryTable("Private", "Private classes")}

                <View style={styles.noteBox}>
                    <Text style={styles.tableTitle}>Important Notes</Text>
                    {feeSettings?.feeNotes ? feeSettings.feeNotes.split('\n').map((note, i) => (
                        <Text key={i} style={styles.noteText}>{note}</Text>
                    )) : (
                        <Text style={styles.noteText}>• No notes added.</Text>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerContact}>Only visible to Admins</Text>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("AddEditFeeStructure", { mode: 'add' })}
            >
                <Icon name="plus" size={30} color={Colors.WHITE} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FDFDFD" },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
        paddingBottom: 15,
        backgroundColor: Colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    headerTitle: { fontSize: 22, fontWeight: "900", color: Colors.TEXT_PRIMARY, flex: 1, marginLeft: 15, letterSpacing: -0.5 },
    headerBtn: { padding: 5 },
    settingsBtn: { padding: 5 },
    scrollContent: { padding: 20, paddingBottom: 100 },

    settingsCard: {
        backgroundColor: '#FFF1F2',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECDD3'
    },
    settingsText: { fontSize: 14, color: '#9F1239' },
    editText: { color: Colors.PRIMARY, fontWeight: 'bold', textDecorationLine: 'underline' },

    tableContainer: { marginBottom: 30 },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    tableTitle: { fontSize: 18, fontWeight: "bold", color: "#334155" },
    table: {
        borderWidth: 1,
        borderColor: Colors.BORDER,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        backgroundColor: Colors.WHITE
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.BG_CONTENT,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BORDER
    },
    headerCell: {
        fontWeight: "bold",
        color: "#475569",
        textAlign: 'center',
        fontSize: 13
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        alignItems: 'center'
    },
    evenRow: { backgroundColor: Colors.WHITE },
    oddRow: { backgroundColor: '#FDF2F8' },
    cell: {
        textAlign: 'center',
        color: Colors.TEXT_PRIMARY,
        fontSize: 13,
        fontWeight: '500'
    },
    emptyText: { fontStyle: 'italic', color: Colors.TEXT_MUTED, textAlign: 'center' },
    noteBox: { marginTop: 15, paddingHorizontal: 10 },
    noteText: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginBottom: 4 },
    footer: { marginTop: 20, alignItems: 'center', paddingVertical: 20 },
    footerContact: { fontSize: 12, color: Colors.TEXT_MUTED },

    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: Colors.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        backgroundColor: Colors.WHITE,
        borderRadius: 20,
        padding: 25,
        elevation: 5
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginBottom: 20 },
    label: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 8 },
    input: {
        backgroundColor: Colors.BG_CONTENT,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: Colors.PRIMARY_DARK,
        marginBottom: 20
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
    cancelBtn: { paddingVertical: 10, paddingHorizontal: 15 },
    cancelText: { color: Colors.TEXT_SECONDARY, fontWeight: 'bold' },
    confirmBtn: { backgroundColor: Colors.PRIMARY, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
    confirmText: { color: Colors.WHITE, fontWeight: 'bold' }
});
