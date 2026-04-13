import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


const AdminCoreValuesScreen = ({ navigation }) => {
    const [values, setValues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ title: "", description: "", icon: "star", displayOrder: "0" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchValues();
    }, []);

    const fetchValues = async () => {
        try {
            const res = await adminService.getCoreValues();
            setValues(res.data || []);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch core values");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.description) {
            Alert.alert("Error", "Title and Description are required");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                icon: formData.icon || "star",
                displayOrder: parseInt(formData.displayOrder) || 0
            };

            if (editingItem) {
                await adminService.updateCoreValue(editingItem.id, payload);
                Alert.alert("Success", "Core Value updated!");
            } else {
                await adminService.createCoreValue(payload);
                Alert.alert("Success", "Core Value created!");
            }
            setModalVisible(false);
            fetchValues();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to save core value");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Delete", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    setLoading(true);
                    try {
                        await adminService.deleteCoreValue(id);
                        fetchValues();
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete");
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            icon: item.icon,
            displayOrder: String(item.displayOrder)
        });
        setModalVisible(true);
    };

    const openCreate = () => {
        setEditingItem(null);
        setFormData({ title: "", description: "", icon: "star", displayOrder: "0" });
        setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.iconBox}>
                <Icon name={item.icon} size={28} color={Colors.PRIMARY} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
                <Text style={styles.cardOrder}>Order: {item.displayOrder}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                    <Icon name="pencil" size={20} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                    <Icon name="delete" size={20} color={Colors.ERROR} />
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
                <Text style={styles.headerTitle}>Core Values</Text>
                <TouchableOpacity onPress={openCreate}>
                    <Icon name="plus" size={28} color={Colors.PRIMARY} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={values}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>No core values found.</Text>}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); fetchValues(); }}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingItem ? "Edit Value" : "New Core Value"}</Text>

                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={t => setFormData({ ...formData, title: t })}
                            placeholder="e.g. Excellence"
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={t => setFormData({ ...formData, description: t })}
                            placeholder="Short description..."
                            multiline
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: '48%' }}>
                                <Text style={styles.label}>Icon (MDI Name)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.icon}
                                    onChangeText={t => setFormData({ ...formData, icon: t })}
                                    placeholder="star"
                                />
                            </View>
                            <View style={{ width: '48%' }}>
                                <Text style={styles.label}>Order</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.displayOrder}
                                    onChangeText={t => setFormData({ ...formData, displayOrder: t })}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={submitting}>
                                {submitting ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.saveText}>Save</Text>}
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: Colors.WHITE, borderBottomWidth: 1, borderColor: Colors.BORDER },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    listContent: { padding: 20 },
    card: { backgroundColor: Colors.WHITE, flexDirection: 'row', padding: 15, borderRadius: 16, marginBottom: 15, elevation: 2, alignItems: 'center' },
    iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#FFF1F2", justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    cardDesc: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginBottom: 4 },
    cardOrder: { fontSize: 10, color: Colors.TEXT_MUTED, fontWeight: "bold" },
    actions: { justifyContent: 'space-between', height: 50 },
    actionBtn: { padding: 5 },
    emptyText: { textAlign: "center", color: Colors.TEXT_MUTED, marginTop: 20 },

    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 20, textAlign: "center" },
    label: { fontSize: 12, fontWeight: "bold", color: Colors.TEXT_SECONDARY, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10, padding: 12, marginBottom: 15, color: Colors.TEXT_PRIMARY, backgroundColor: Colors.BG_CONTENT },
    textArea: { height: 80, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelBtn: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER },
    saveBtn: { flex: 1, padding: 15, alignItems: 'center', marginLeft: 10, borderRadius: 12, backgroundColor: Colors.PRIMARY },
    cancelText: { fontWeight: "bold", color: Colors.TEXT_SECONDARY },
    saveText: { fontWeight: "bold", color: Colors.WHITE }
});

export default AdminCoreValuesScreen;
