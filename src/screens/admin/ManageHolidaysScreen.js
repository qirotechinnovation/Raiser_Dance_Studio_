import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


const ManageHolidaysScreen = ({ navigation }) => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [batches, setBatches] = useState([]);
    const [formData, setFormData] = useState({ name: "", date: new Date().toISOString().split('T')[0], description: "", batchId: "" });
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchHolidays();
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await adminService.getBatches();
            setBatches(res.data || []);
        } catch (e) {
            console.log("Error fetching batches", e);
        }
    };

    const fetchHolidays = async () => {
        try {
            const res = await adminService.getHolidays();
            setHolidays(res.data || []);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch holidays");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            date: item.date,
            description: item.description || "",
            batchId: item.batch ? item.batch.id : ""
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.date) {
            Alert.alert("Error", "Name and Date are required");
            return;
        }

        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (payload.batchId) {
                payload.batch = { id: payload.batchId };
            }
            delete payload.batchId;

            if (editingId) {
                await adminService.updateHoliday(editingId, payload);
                Alert.alert("Success", "Holiday updated!");
            } else {
                await adminService.createHoliday(payload);
                Alert.alert("Success", "Holiday created and students notified!");
            }
            setModalVisible(false);
            setFormData({ name: "", date: new Date().toISOString().split('T')[0], description: "", batchId: "" });
            setEditingId(null);
            fetchHolidays();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to save holiday");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Delete", "Are you sure? This will not remove notifications already sent.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    setLoading(true);
                    try {
                        await adminService.deleteHoliday(id);
                        fetchHolidays();
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete");
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.dateBox}>
                <Text style={styles.dateText}>{item.date.split('-')[2]}</Text>
                <Text style={styles.monthText}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.batch && (
                    <View style={styles.batchTag}>
                        <Text style={styles.batchTagText}>{item.batch.name}</Text>
                    </View>
                )}
                <Text style={styles.cardDesc}>{item.description || "No description"}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
                    <Icon name="pencil-outline" size={22} color={Colors.TEXT_SECONDARY} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Icon name="trash-can-outline" size={22} color={Colors.ERROR} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Holidays</Text>
                <TouchableOpacity onPress={() => {
                    setEditingId(null);
                    setFormData({ name: "", date: new Date().toISOString().split('T')[0], description: "", batchId: "" });
                    setModalVisible(true);
                }}>
                    <Icon name="plus-circle" size={28} color={Colors.PRIMARY} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={holidays}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>No upcoming holidays found.</Text>}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingId ? "Edit Holiday" : "New Holiday"}</Text>

                        <Text style={styles.label}>Holiday Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={t => setFormData({ ...formData, name: t })}
                            placeholder="e.g. Diwali Break"
                        />

                        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.date}
                            onChangeText={t => setFormData({ ...formData, date: t })}
                            placeholder="2024-10-31"
                        />

                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={t => setFormData({ ...formData, description: t })}
                            placeholder="Classes will remain closed..."
                            multiline
                        />

                        <Text style={styles.label}>Applicable To</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.batchId}
                                onValueChange={(v) => setFormData({ ...formData, batchId: v })}
                                style={styles.picker}
                            >
                                <Picker.Item label="All Batches (Studio Global)" value="" />
                                {batches.map(b => (
                                    <Picker.Item key={b.id} label={b.name} value={b.id} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={submitting}>
                                {submitting ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.saveText}>{editingId ? "Update" : "Save & Notify"}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: Colors.WHITE, elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    listContent: { padding: 20 },
    card: { backgroundColor: Colors.WHITE, flexDirection: 'row', padding: 15, borderRadius: 16, marginBottom: 15, elevation: 1, alignItems: 'center' },
    dateBox: { width: 50, height: 50, borderRadius: 10, backgroundColor: "#FFF1F2", justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    dateText: { fontSize: 18, fontWeight: "bold", color: Colors.PRIMARY },
    monthText: { fontSize: 10, color: Colors.PRIMARY, fontWeight: "bold" },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    cardDesc: { fontSize: 13, color: Colors.TEXT_SECONDARY },
    editBtn: { padding: 5, marginRight: 5 },
    deleteBtn: { padding: 5 },
    emptyText: { textAlign: "center", color: Colors.TEXT_MUTED, marginTop: 20 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 20, textAlign: "center" },
    label: { fontSize: 12, fontWeight: "bold", color: Colors.TEXT_SECONDARY, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10, padding: 12, marginBottom: 15, color: Colors.TEXT_PRIMARY },
    textArea: { height: 80, textAlignVertical: 'top' },
    pickerContainer: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10, marginBottom: 20, backgroundColor: Colors.BG_CONTENT, overflow: 'hidden' },
    picker: { height: 50, width: '100%' },
    batchTag: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, alignSelf: 'flex-start', marginVertical: 4 },
    batchTagText: { fontSize: 10, fontWeight: "bold", color: Colors.TEXT_SECONDARY },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelBtn: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.BORDER },
    saveBtn: { flex: 1, padding: 15, alignItems: 'center', marginLeft: 10, borderRadius: 10, backgroundColor: Colors.PRIMARY },
    cancelText: { fontWeight: "bold", color: Colors.TEXT_SECONDARY },
    saveText: { fontWeight: "bold", color: Colors.WHITE }
});

export default ManageHolidaysScreen;
