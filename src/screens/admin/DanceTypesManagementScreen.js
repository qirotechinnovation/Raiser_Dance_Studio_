import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


export default function DanceTypesManagementScreen({ navigation }) {
    const [danceTypes, setDanceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [editingType, setEditingType] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);

    useEffect(() => {
        fetchDanceTypes();
    }, []);

    const fetchDanceTypes = async () => {
        try {
            const res = await adminService.getDanceTypes();
            setDanceTypes(res.data);
        } catch (error) {
            Alert.alert("Error", "Could not load dance types");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newName.trim()) {
            Alert.alert("Error", "Please enter a dance type name");
            return;
        }

        try {
            console.log("Adding dance type:", newName.trim());
            const response = await adminService.createDanceType({ name: newName.trim(), active: true });
            console.log("Dance type added successfully:", response.data);
            Alert.alert("Success", `Dance type "${newName.trim()}" added successfully!`);
            setNewName("");
            fetchDanceTypes();
        } catch (error) {
            console.error("Error adding dance type:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error message:", error.message);

            const errorMsg = error.response?.data?.message || error.message || "Failed to add dance type";
            Alert.alert("Error", `Failed to add dance type: ${errorMsg}`);
        }
    };

    const handleUpdate = async () => {
        if (!editingType.name) return;
        try {
            await adminService.updateDanceType(editingType.id, editingType);
            setEditModalVisible(false);
            setEditingType(null);
            fetchDanceTypes();
        } catch (error) {
            Alert.alert("Error", "Failed to update");
        }
    };

    const handleDelete = async (id) => {
        Alert.alert("Confirm", "Delete this dance type?", [
            { text: "Cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await adminService.deleteDanceType(id);
                        fetchDanceTypes();
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete");
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Icon name="dance-ballroom" size={24} color="#E11D48" />
            <Text style={styles.name}>{item.name}</Text>
            <View style={{ marginRight: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: item.active ? '#DCFCE7' : '#FEE2E2', height: 20, justifyContent: 'center' }}>
                <Text style={{ fontSize: 10, color: item.active ? '#166534' : '#991B1B', fontWeight: 'bold' }}>
                    {item.active ? 'ACTIVE' : 'INACTIVE'}
                </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => { setEditingType(item); setEditModalVisible(true); }}>
                    <Icon name="pencil-outline" size={20} color={Colors.TEXT_SECONDARY} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 15 }}>
                    <Icon name="trash-can-outline" size={20} color={Colors.ERROR} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="chevron-left" size={28} color={Colors.PRIMARY_DARK} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dance Types</Text>
            </View>

            <View style={styles.container}>
                <View style={styles.addBar}>
                    <TextInput
                        style={styles.input}
                        placeholder="New Dance Type (e.g. Hip Hop)"
                        placeholderTextColor={Colors.TEXT_MUTED}
                        value={newName}
                        onChangeText={setNewName}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAdd}
                    >
                        <Icon name="plus" size={24} color={Colors.WHITE} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#E11D48" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={danceTypes}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingTop: 10 }}
                    />
                )}
            </View>

            <Modal visible={editModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Dance Type</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={editingType?.name}
                            onChangeText={(v) => setEditingType({ ...editingType, name: v })}
                        />
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
                            onPress={() => setEditingType(prev => ({ ...prev, active: !prev.active }))}
                        >
                            <Icon name={editingType?.active ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color="#E11D48" />
                            <Text style={{ marginLeft: 10, fontSize: 16 }}>Active</Text>
                        </TouchableOpacity>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelBtn}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleUpdate} style={styles.updateBtn}>
                                <Text style={styles.updateBtnText}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: Colors.WHITE },
    backBtn: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.PRIMARY_DARK },
    container: { flex: 1, padding: 20 },
    addBar: { flexDirection: "row", marginBottom: 20 },
    input: { flex: 1, backgroundColor: Colors.WHITE, borderRadius: 12, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: Colors.BORDER, color: Colors.TEXT_PRIMARY },
    addButton: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#E11D48", justifyContent: "center", alignItems: "center", marginLeft: 10 },
    addButtonDisabled: { backgroundColor: "#FECACA", opacity: 0.5 },
    card: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.WHITE, padding: 16, borderRadius: 15, marginBottom: 10, elevation: 1 },
    name: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: "600", color: Colors.TEXT_PRIMARY },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContent: { backgroundColor: Colors.WHITE, width: "80%", borderRadius: 20, padding: 25 },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
    modalInput: { backgroundColor: Colors.BG_CONTENT, borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: Colors.BORDER, color: Colors.TEXT_PRIMARY },
    modalButtons: { flexDirection: "row", justifyContent: "flex-end" },
    cancelBtn: { padding: 10, marginRight: 10 },
    updateBtn: { backgroundColor: "#E11D48", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    updateBtnText: { color: Colors.WHITE, fontWeight: "bold" }
});
