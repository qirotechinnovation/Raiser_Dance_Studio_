import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import adminService from '../../api/adminService';
import Colors from "../../theme/Colors";


const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default function BatchScheduleScreen({ route, navigation }) {
    const { batch } = route.params;
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [newSlot, setNewSlot] = useState({
        dayOfWeek: "MONDAY",
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        activity: "Regular Class"
    });

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const res = await adminService.getSchedulesByBatch(batch.id);
            // Sort by Day index
            const sorted = (res.data || []).sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek));
            setSchedule(sorted);
        } catch (error) {
            console.error("Failed to load schedule", error);
            Alert.alert("Error", "Could not load schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async () => {
        try {
            await adminService.addScheduleSlot(batch.id, newSlot);
            setModalVisible(false);
            fetchSchedule();
            Alert.alert("Success", "Class slot added");
        } catch (error) {
            Alert.alert("Error", "Failed to add slot");
        }
    };

    const handleDeleteSlot = (id) => {
        Alert.alert("Delete", "Remove this slot?", [
            { text: "Cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await adminService.deleteScheduleSlot(id);
                        fetchSchedule();
                    } catch (e) { Alert.alert("Error", "Failed to delete"); }
                }
            }
        ]);
    };

    const renderSlot = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.dayBox}>
                <Text style={styles.dayText}>{item.dayOfWeek.substring(0, 3)}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
                <Text style={styles.activityText}>{item.activity}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteSlot(item.id)}>
                <Icon name="delete" size={24} color={Colors.ERROR} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color="#000" /></TouchableOpacity>
                <Text style={styles.title}>Schedule: {batch.name}</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}><Icon name="plus" size={28} color={Colors.PRIMARY} /></TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 50 }} /> : (
                <FlatList
                    data={schedule}
                    renderItem={renderSlot}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>No classes scheduled yet.</Text>}
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Class Slot</Text>

                        <Text style={styles.label}>Day</Text>
                        <View style={styles.pickerBox}>
                            <Picker selectedValue={newSlot.dayOfWeek} onValueChange={v => setNewSlot({ ...newSlot, dayOfWeek: v })}>
                                {DAYS.map(day => <Picker.Item key={day} label={day} value={day} />)}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Activity</Text>
                        <View style={styles.pickerBox}>
                            <Picker selectedValue={newSlot.activity} onValueChange={v => setNewSlot({ ...newSlot, activity: v })}>
                                <Picker.Item label="Regular Class" value="Regular Class" />
                                <Picker.Item label="Rehearsal" value="Rehearsal" />
                                <Picker.Item label="Workshop" value="Workshop" />
                            </Picker>
                        </View>

                        {/* Simplified Time Input for Demo - In real app use DatePicker */}
                        <Text style={styles.label}>Start Time (e.g. 10:00 AM)</Text>
                        {/* Using simple picker/input for prototype speed, ideally TimePicker */}
                        <View style={styles.pickerBox}>
                            <Picker selectedValue={newSlot.startTime} onValueChange={v => setNewSlot({ ...newSlot, startTime: v })}>
                                {["09:00 AM", "10:00 AM", "11:00 AM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"].map(t => <Picker.Item key={t} label={t} value={t} />)}
                            </Picker>
                        </View>

                        <Text style={styles.label}>End Time (e.g. 11:00 AM)</Text>
                        <View style={styles.pickerBox}>
                            <Picker selectedValue={newSlot.endTime} onValueChange={v => setNewSlot({ ...newSlot, endTime: v })}>
                                {["10:00 AM", "11:00 AM", "12:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"].map(t => <Picker.Item key={t} label={t} value={t} />)}
                            </Picker>
                        </View>

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={{ color: Colors.TEXT_SECONDARY }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddSlot}>
                                <Text style={{ color: Colors.WHITE, fontWeight: 'bold' }}>Save</Text>
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
    dayBox: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    dayText: { color: Colors.PRIMARY, fontWeight: 'bold' },
    info: { flex: 1 },
    timeText: { fontSize: 16, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    activityText: { color: Colors.TEXT_SECONDARY },
    empty: { textAlign: 'center', marginTop: 50, color: Colors.TEXT_MUTED },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: Colors.TEXT_PRIMARY },
    label: { color: Colors.TEXT_SECONDARY, marginBottom: 5, marginTop: 10 },
    pickerBox: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 8 },
    modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 25, gap: 15 },
    cancelBtn: { padding: 10 },
    saveBtn: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});
