import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import adminService from "../../api/adminService";
import CustomDateTimePicker from "../../components/CustomDateTimePicker";
import Colors from "../../theme/Colors";



export default function EditStudentScreen({ navigation, route }) {
    const { studentId } = route.params;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [batches, setBatches] = useState([]);
    const [danceTypes, setDanceTypes] = useState([]);
    const [skillLevels, setSkillLevels] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        parentMobile: "",
        address: "",
        email: "",
        password: "",
        skillLevel: "Beginner",
        classType: "Kids",
        batchId: "",
        danceTypeId: "",
        feePlan: "Monthly",
        admissionFee: "200",
        notes: "",
        joiningDate: "",
        active: true
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [bRes, dRes, sRes, skRes] = await Promise.all([
                adminService.getBatches(),
                adminService.getDanceTypes(),
                adminService.getStudentById(studentId),
                adminService.getSkillLevels()
            ]);
            setBatches(bRes.data);
            setDanceTypes(dRes.data);
            setSkillLevels(skRes.data);

            const s = sRes.data;
            setFormData({
                name: s.name,
                age: String(s.age),
                parentMobile: s.parentMobile,
                address: s.address,
                email: s.email,
                skillLevel: s.skillLevel || "Beginner",
                classType: s.classType || "Kids",
                batchId: s.batch?.id || "",
                danceTypeId: s.danceType?.id || "",
                feePlan: s.feePlan || "Monthly",
                admissionFee: String(s.admissionFee),
                notes: s.notes || "",
                joiningDate: s.joiningDate || "",
                active: s.active ?? true
            });
        } catch (error) {
            Alert.alert("Error", "Could not load data");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!formData.name || !formData.email) {
            Alert.alert("Error", "Required fields missing");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                batch: { id: formData.batchId },
                danceType: { id: formData.danceTypeId },
                age: parseInt(formData.age) || 0,
                admissionFee: parseFloat(formData.admissionFee) || 200
            };

            // Only include password if admin provided a new one
            if (!formData.password || formData.password.trim() === "") {
                delete payload.password;
            }

            await adminService.updateStudent(studentId, payload);
            Alert.alert("Success", "Student updated successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update student");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.PRIMARY} /></View>;

    return (

        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9F1239" />

            {/* Gradient Header */}
            <LinearGradient colors={[Colors.PRIMARY, "#9F1239"]} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={26} color={Colors.WHITE} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Student</Text>
                    <TouchableOpacity onPress={handleUpdate} disabled={saving} style={styles.saveBtn}>
                        {saving ? <ActivityIndicator size="small" color={Colors.PRIMARY} /> : <Text style={styles.saveBtnText}>Update</Text>}
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerSubtitle}>Modify student profile details</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* 1. Basic Info Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>BASIC INFORMATION</Text>

                    <InputField label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} icon="account-outline" />
                    <InputField label="Email Address" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} icon="email-outline" keyboardType="email-address" editable={false} />
                    <InputField 
                        label="Password (Leave blank to keep current)" 
                        value={formData.password} 
                        onChange={(v) => setFormData({ ...formData, password: v })} 
                        icon="lock-outline" 
                        secureTextEntry={!showPassword} 
                        placeholder="Enter new password" 
                        rightIcon={showPassword ? "eye" : "eye-off"}
                        onRightIconPress={() => setShowPassword(!showPassword)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <InputField label="Age" value={formData.age} onChange={(v) => setFormData({ ...formData, age: v })} icon="numeric" keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <InputField
                                label="Admission Date"
                                value={formData.joiningDate}
                                onChange={(v) => setFormData({ ...formData, joiningDate: v })}
                                icon="calendar-edit"
                                placeholder="YYYY-MM-DD"
                                rightIcon="calendar"
                                onRightIconPress={() => setShowDatePicker(true)}
                            />
                        </View>
                    </View>

                    <InputField label="Parent Mobile" value={formData.parentMobile} onChange={(v) => setFormData({ ...formData, parentMobile: v })} icon="phone-outline" keyboardType="phone-pad" />
                    <InputField label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} icon="map-marker-outline" multiline />
                </View>

                {/* 2. Class & Level */}
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>CLASS & LEVEL</Text>

                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>Skill Level</Text>
                        <Picker
                            selectedValue={formData.skillLevel}
                            onValueChange={(v) => setFormData({ ...formData, skillLevel: v })}
                            style={{ color: Colors.TEXT_PRIMARY }}
                        >
                            {skillLevels.length > 0 ? (
                                skillLevels.map(lvl => <Picker.Item key={lvl.id} label={lvl.name} value={lvl.name} />)
                            ) : (
                                <Picker.Item label="Select Skill Level" value="" />
                            )}
                        </Picker>
                    </View>

                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>Batch Allocation</Text>
                        <Picker
                            selectedValue={formData.batchId}
                            onValueChange={(v) => setFormData({ ...formData, batchId: v })}
                            style={{ color: Colors.TEXT_PRIMARY }}
                        >
                            {batches.map(b => <Picker.Item key={b.id} label={`${b.name} (${b.timing})`} value={b.id} />)}
                        </Picker>
                    </View>

                </View>

                {/* 3. Fees & Settings */}
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>FEES & PLAN</Text>

                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>Fees Plan</Text>
                        <Picker
                            selectedValue={formData.feePlan}
                            onValueChange={(v) => setFormData({ ...formData, feePlan: v })}
                            style={{ color: Colors.TEXT_PRIMARY }}
                        >
                            <Picker.Item label="Monthly" value="Monthly" />
                            <Picker.Item label="Quarterly" value="Quarterly" />
                            <Picker.Item label="Yearly" value="Yearly" />
                        </Picker>
                    </View>

                    <InputField label="Admin Notes" value={formData.notes} onChange={(v) => setFormData({ ...formData, notes: v })} icon="note-text-outline" multiline />

                    <Text style={styles.sectionLabel}>ACCOUNT STATUS</Text>

                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>Account Status</Text>
                        <Picker
                            selectedValue={formData.active}
                            onValueChange={(v) => setFormData({ ...formData, active: v })}
                            style={{ color: Colors.TEXT_PRIMARY }}
                        >
                            <Picker.Item label="Active" value={true} />
                            <Picker.Item label="Inactive" value={false} />
                        </Picker>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <CustomDateTimePicker
                visible={showDatePicker}
                mode="date"
                onSelect={(date) => setFormData({ ...formData, joiningDate: date })}
                onClose={() => setShowDatePicker(false)}
            />
        </View>
    );
}


function InputField({ label, value, onChange, icon, rightIcon, onRightIconPress, ...props }) {
    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputBox}>
                <Icon name={icon} size={20} color={Colors.TEXT_SECONDARY} />
                <TextInput style={[styles.input, { flex: 1, marginLeft: 10 }]} value={value} onChangeText={onChange} {...props} />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={{ padding: 10 }}>
                        <Icon name={rightIcon} size={20} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F1F5F9" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    },
    pickerLabel: { position: 'absolute', top: -10, left: 10, backgroundColor: Colors.WHITE, paddingHorizontal: 5, fontSize: 10, color: Colors.TEXT_SECONDARY, fontWeight: 'bold', zIndex: 1 },

    row: { flexDirection: 'row' }
});
