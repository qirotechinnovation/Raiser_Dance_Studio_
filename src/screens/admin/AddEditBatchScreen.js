import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { StatusBar } from "react-native";
import adminService from "../../api/adminService";
import CustomDateTimePicker from "../../components/CustomDateTimePicker";
import Colors from "../../theme/Colors";



export default function AddEditBatchScreen({ navigation, route }) {
    const isEdit = route.params?.batch != null;
    const existingBatch = route.params?.batch;

    const [loading, setLoading] = useState(false);
    const [danceTypes, setDanceTypes] = useState([]);

    const [showPicker, setShowPicker] = useState(false);
    const [activeField, setActiveField] = useState(null); // 'startTime', 'endTime', 'startDate', 'endDate'
    const [pickerMode, setPickerMode] = useState('time'); // 'time' or 'date'
    const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);

    const [formData, setFormData] = useState({
        name: existingBatch?.batchName || "",
        danceTypeId: existingBatch?.danceType?.id || "",
        level: existingBatch?.level || "Beginner",
        instructor: existingBatch?.instructorName || "",
        days: existingBatch?.days || "",
        startTime: existingBatch?.startTime || "06:00 PM",
        endTime: existingBatch?.endTime || "07:30 PM",
        maxCapacity: existingBatch?.maxCapacity?.toString() || "20",
        roomNumber: existingBatch?.roomNumber || "101",
        active: existingBatch?.active ?? true,
        startDate: existingBatch?.startDate || "",
        endDate: existingBatch?.endDate || ""
    });

    const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Auto-generate Batch Name
    useEffect(() => {
        if (!isEdit && !isNameManuallyEdited && formData.danceTypeId) {
            const type = danceTypes.find(d => d.id === formData.danceTypeId)?.name || "";
            const time = formData.startTime ? ` - ${formData.startTime}` : "";
            const newName = `${type} ${formData.level}${time}`;
            setFormData(prev => ({ ...prev, name: newName }));
        }
    }, [formData.danceTypeId, formData.level, formData.startTime, danceTypes]);

    const handlePickerConfirm = (value) => {
        setFormData(prev => ({ ...prev, [activeField]: value }));
        setShowPicker(false);
    };

    const openPicker = (field, mode) => {
        setActiveField(field);
        setPickerMode(mode);
        setShowPicker(true);
    };

    const toggleDay = (day) => {
        let currentDays = formData.days ? formData.days.split(',').map(d => d.trim()) : [];
        if (currentDays.includes(day)) {
            currentDays = currentDays.filter(d => d !== day);
        } else {
            currentDays.push(day);
        }
        //Sort days based on week order if needed, but simple join is fine for now
        setFormData(prev => ({ ...prev, days: currentDays.join(', ') }));
    };

    useEffect(() => {
        fetchDanceTypes();
    }, []);

    const fetchDanceTypes = async () => {
        try {
            const res = await adminService.getDanceTypes();
            setDanceTypes(res.data);
            if (!isEdit && res.data.length > 0) {
                setFormData(prev => ({ ...prev, danceTypeId: res.data[0].id }));
            }
        } catch (error) {
            console.error("Failed to fetch dance types:", error);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.instructor || !formData.danceTypeId) {
            Alert.alert("Error", "Please fill required fields");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                id: isEdit ? existingBatch.id : undefined,
                name: formData.name,
                danceType: { id: formData.danceTypeId },
                level: formData.level,
                instructor: formData.instructor,
                days: formData.days,
                startTime: formData.startTime,
                endTime: formData.endTime,
                maxCapacity: parseInt(formData.maxCapacity) || 20,
                roomNumber: formData.roomNumber,
                active: formData.active,
                timing: `${formData.startTime} - ${formData.endTime}`,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null
            };

            if (isEdit) {
                await adminService.updateBatch(existingBatch.id, payload);
            } else {
                await adminService.createBatch(payload);
            }

            Alert.alert("Success", `Batch ${isEdit ? 'updated' : 'created'} successfully`, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Failed to save batch:", error);
            Alert.alert("Error", "Could not save batch details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9F1239" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                {/* Gradient Header */}
                <LinearGradient colors={[Colors.PRIMARY, "#9F1239"]} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Icon name="arrow-left" size={26} color={Colors.WHITE} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{isEdit ? 'Edit Batch' : 'New Batch'}</Text>
                        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
                            {loading ? <ActivityIndicator size="small" color={Colors.PRIMARY} /> : <Text style={styles.saveBtnText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerSubtitle}>{isEdit ? 'Update batch details' : 'Create a new dance batch'}</Text>
                </LinearGradient>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>BASIC INFO</Text>

                        <InputField
                            label="Batch Name *"
                            value={formData.name}
                            onChange={(v) => {
                                setFormData({ ...formData, name: v });
                                setIsNameManuallyEdited(true);
                            }}
                            icon="tag-outline"
                        />

                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>Dance Style *</Text>
                            <Picker
                                selectedValue={formData.danceTypeId}
                                onValueChange={(v) => setFormData({ ...formData, danceTypeId: v })}
                            >
                                {danceTypes.map(dt => (
                                    <Picker.Item key={dt.id} label={dt.name} value={dt.id} />
                                ))}
                            </Picker>
                        </View>

                        <InputField
                            label="Instructor Name *"
                            value={formData.instructor}
                            onChange={(v) => setFormData({ ...formData, instructor: v })}
                            icon="account-tie-outline"
                        />

                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>Skill Level</Text>
                            <Picker
                                selectedValue={formData.level}
                                onValueChange={(v) => setFormData({ ...formData, level: v })}
                            >
                                <Picker.Item label="Beginner" value="Beginner" />
                                <Picker.Item label="Intermediate" value="Intermediate" />
                                <Picker.Item label="Advanced" value="Advanced" />
                            </Picker>
                        </View>

                        <Text style={styles.sectionLabel}>SCHEDULE & CAPACITY</Text>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Days *</Text>
                            <View style={styles.daysContainer}>
                                {daysList.map(day => {
                                    const isSelected = formData.days.includes(day);
                                    return (
                                        <TouchableOpacity
                                            key={day}
                                            style={[styles.dayChip, isSelected && styles.dayChipActive]}
                                            onPress={() => toggleDay(day)}
                                        >
                                            <Text style={[styles.dayChipText, isSelected && styles.dayChipTextActive]}>{day}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => openPicker('startTime', 'time')}>
                                    <View pointerEvents="none">
                                        <InputField
                                            label="Start Time"
                                            value={formData.startTime}
                                            editable={false}
                                            icon="clock-outline"
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: 20 }} />
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => openPicker('endTime', 'time')}>
                                    <View pointerEvents="none">
                                        <InputField
                                            label="End Time"
                                            value={formData.endTime}
                                            editable={false}
                                            icon="clock-check-outline"
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => openPicker('startDate', 'date')}>
                                    <View pointerEvents="none">
                                        <InputField
                                            label="Batch Start Date"
                                            value={formData.startDate}
                                            editable={false}
                                            icon="calendar-start"
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: 20 }} />
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => openPicker('endDate', 'date')}>
                                    <View pointerEvents="none">
                                        <InputField
                                            label="Batch End Date"
                                            value={formData.endDate}
                                            editable={false}
                                            icon="calendar-end"
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <InputField
                                    label="Max Capacity"
                                    value={formData.maxCapacity}
                                    onChange={(v) => setFormData({ ...formData, maxCapacity: v })}
                                    icon="account-group-outline"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ width: 20 }} />
                            <View style={{ flex: 1 }}>
                                <InputField
                                    label="Room Number"
                                    value={formData.roomNumber}
                                    onChange={(v) => setFormData({ ...formData, roomNumber: v })}
                                    icon="door-open"
                                    placeholder="101"
                                />
                            </View>
                        </View>

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Batch Status (Active)</Text>
                            <TouchableOpacity
                                onPress={() => setFormData({ ...formData, active: !formData.active })}
                                style={[styles.switch, formData.active ? styles.switchOn : styles.switchOff]}
                            >
                                <View style={[styles.switchThumb, formData.active ? styles.thumbOn : styles.thumbOff]} />
                            </TouchableOpacity>
                        </View>

                    </View>
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView >

            <CustomDateTimePicker
                visible={showPicker}
                onSelect={handlePickerConfirm}
                onClose={() => setShowPicker(false)}
                mode={pickerMode}
            />
        </View >
    );
}


function InputField({ label, value, onChange, icon, ...props }) {
    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputBox}>
                <Icon name={icon} size={20} color={Colors.TEXT_SECONDARY} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder={`Enter ${label.split('*')[0].trim()}`}
                    placeholderTextColor={Colors.TEXT_MUTED}
                    {...props}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F1F5F9" },
    header: { padding: 20, paddingTop: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
    headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 22, fontWeight: "bold", color: Colors.WHITE },
    headerSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginLeft: 5 },
    saveBtn: { backgroundColor: Colors.WHITE, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, elevation: 2 },
    saveBtnText: { color: Colors.PRIMARY, fontWeight: "bold", fontSize: 14 },

    content: { flex: 1, padding: 20, marginTop: -20 },
    card: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },

    sectionLabel: { fontSize: 11, fontWeight: "bold", color: Colors.TEXT_MUTED, letterSpacing: 1, marginBottom: 15, marginTop: 5 },

    inputWrapper: { marginBottom: 15 },
    inputLabel: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginBottom: 6, fontWeight: "600" },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.BG_CONTENT,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.BORDER,
    },
    input: { flex: 1, marginLeft: 10, color: Colors.TEXT_PRIMARY, fontSize: 15, fontWeight: "500" },

    pickerContainer: {
        backgroundColor: Colors.BG_CONTENT,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        // overflow: 'hidden'
    },
    pickerLabel: { position: 'absolute', top: -10, left: 10, backgroundColor: Colors.WHITE, paddingHorizontal: 5, fontSize: 10, color: Colors.TEXT_SECONDARY, fontWeight: 'bold', zIndex: 1 },

    row: { flexDirection: "row" },

    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        marginTop: 5,
        backgroundColor: Colors.BG_CONTENT,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    switchLabel: { fontSize: 14, fontWeight: "600", color: Colors.TEXT_PRIMARY },
    switch: { width: 50, height: 28, borderRadius: 14, padding: 3 },
    switchOn: { backgroundColor: Colors.PRIMARY },
    switchOff: { backgroundColor: Colors.BORDER },
    switchThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.WHITE },
    thumbOn: { alignSelf: "flex-end" },
    thumbOff: { alignSelf: "flex-start" },

    daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
    dayChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    dayChipActive: {
        backgroundColor: Colors.PRIMARY,
        borderColor: Colors.PRIMARY
    },
    dayChipText: { fontSize: 13, color: Colors.TEXT_SECONDARY, fontWeight: '600' },
    dayChipTextActive: { color: Colors.WHITE }
});

