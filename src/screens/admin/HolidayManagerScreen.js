import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import adminService from '../../api/adminService';
import Colors from "../../theme/Colors";


export default function HolidayManagerScreen({ navigation }) {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const [newHoliday, setNewHoliday] = useState({
        name: "",
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        description: ""
    });

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const res = await adminService.getUpcomingHolidays();
            setHolidays(res.data || []);
        } catch (error) {
            console.error("Failed to load holidays", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHoliday = async () => {
        if (!newHoliday.name || !newHoliday.date) {
            Alert.alert("Error", "Name and Date are required");
            return;
        }

        try {
            await adminService.addHoliday(newHoliday);
            setModalVisible(false);
            fetchHolidays();
            Alert.alert("Success", "Holiday added & students notified!");
            setNewHoliday({ name: "", date: "", description: "" });
        } catch (error) {
            Alert.alert("Error", "Failed to add holiday");
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Delete", "Remove this holiday?", [
            { text: "Cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await adminService.deleteHoliday(id);
                        fetchHolidays();
                    } catch (e) { Alert.alert("Error", "Failed to delete"); }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.dateBox}>
                <Text style={styles.month}>{new Date(item.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
                <Text style={styles.day}>{new Date(item.date).getDate()}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.holidayName}>{item.name}</Text>
                <Text style={styles.desc}>{item.description}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Icon name="trash-can-outline" size={24} color={Colors.ERROR} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color="#000" /></TouchableOpacity>
                <Text style={styles.title}>Holiday Manager</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}><Icon name="plus" size={28} color={Colors.PRIMARY} /></TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 50 }} /> : (
                <FlatList
                    data={holidays}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>No upcoming holidays.</Text>}
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Holiday</Text>

                        <Text style={styles.label}>Holiday Name</Text>
                        <TextInput style={styles.input} value={newHoliday.name} onChangeText={t => setNewHoliday({ ...newHoliday, name: t })} placeholder="e.g. Diwali" />

                        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                        <TextInput style={styles.input} value={newHoliday.date} onChangeText={t => setNewHoliday({ ...newHoliday, date: t })} placeholder="2024-11-01" />

                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput style={styles.input} value={newHoliday.description} onChangeText={t => setNewHoliday({ ...newHoliday, description: t })} placeholder="Studio closed" />

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={{ color: Colors.TEXT_SECONDARY }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddHoliday}>
                                <Text style={{ color: Colors.WHITE, fontWeight: 'bold' }}>Notify & Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: Colors.WHITE, elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.WHITE, padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
    dateBox: { width: 50, alignItems: 'center', marginRight: 15, borderRightWidth: 1, borderRightColor: Colors.BORDER, paddingRight: 10 },
    month: { fontSize: 12, color: Colors.PRIMARY, fontWeight: 'bold' },
    day: { fontSize: 20, color: Colors.TEXT_PRIMARY, fontWeight: 'bold' },
    info: { flex: 1 },
    holidayName: { fontSize: 16, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    desc: { color: Colors.TEXT_SECONDARY, fontSize: 12 },
    empty: { textAlign: 'center', marginTop: 50, color: Colors.TEXT_MUTED },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: Colors.TEXT_PRIMARY },
    label: { color: Colors.TEXT_SECONDARY, marginBottom: 5, marginTop: 10 },
    input: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 8, padding: 10, backgroundColor: Colors.BG_CONTENT },
    modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 25, gap: 15 },
    cancelBtn: { padding: 10 },
    saveBtn: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});
