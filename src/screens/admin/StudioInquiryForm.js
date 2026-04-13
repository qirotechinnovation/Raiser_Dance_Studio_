import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


export default function StudioInquiryForm({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [danceTypes, setDanceTypes] = useState([]);
    const [skillLevels, setSkillLevels] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        address: "",
        email: "",
        danceType: "Bollywood",
        skillLevel: "Beginner",
        preferredBatchTime: "Morning",
        inquiryDate: new Date().toISOString().split('T')[0],
        notes: "",
        status: "OPEN"
    });

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [dRes, sRes] = await Promise.all([
                adminService.getDanceTypes(),
                adminService.getSkillLevels()
            ]);
            setDanceTypes(dRes.data);
            setSkillLevels(sRes.data);

            if (dRes.data.length > 0) setFormData(prev => ({ ...prev, danceType: dRes.data[0].name }));
            if (sRes.data.length > 0) setFormData(prev => ({ ...prev, skillLevel: sRes.data[0].name }));
        } catch (error) {
            console.error("Failed to fetch metadata:", error);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.mobile) {
            Alert.alert("Required Fields", "Name and Mobile Number are required.");
            return;
        }

        setLoading(true);
        try {
            await adminService.createStudioInquiry(formData);
            Alert.alert("Success", "Inquiry recorded successfully!", [
                { text: "View List", onPress: () => navigation.replace("StudioInquiriesList") },
                {
                    text: "Add Another", onPress: () => {
                        setFormData(prev => ({ ...prev, name: "", mobile: "", address: "", email: "", notes: "" }));
                    }
                }
            ]);
        } catch (error) {
            console.error("Failed to save inquiry:", error);
            Alert.alert("Error", "Could not save inquiry.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

            <LinearGradient colors={["#8B5CF6", "#7C3AED"]} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={26} color={Colors.WHITE} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Studio Inquiry</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
                        {loading ? <ActivityIndicator size="small" color="#7C3AED" /> : <Text style={styles.saveBtnText}>Save</Text>}
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerSubtitle}>Record walk-in visitor details</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                <View style={styles.card}>
                    <InputRow label="Visitor Name *" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} icon="account" />
                    <InputRow label="Mobile Number *" value={formData.mobile} onChange={(v) => setFormData({ ...formData, mobile: v })} icon="phone" keyboardType="phone-pad" />
                    <InputRow label="Email Address" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} icon="email" keyboardType="email-address" />
                    <InputRow label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} icon="map-marker" multiline />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Interests & Preferences</Text>

                    <PickerRow label="Interest (Dance Type)" value={formData.danceType}
                        onValueChange={(v) => setFormData({ ...formData, danceType: v })}
                        items={danceTypes.map(d => ({ label: d.name, value: d.name }))}
                    />

                    <PickerRow label="Skill Level" value={formData.skillLevel}
                        onValueChange={(v) => setFormData({ ...formData, skillLevel: v })}
                        items={skillLevels.map(s => ({ label: s.name, value: s.name }))}
                    />

                    <PickerRow label="Preferred Batch Time" value={formData.preferredBatchTime}
                        onValueChange={(v) => setFormData({ ...formData, preferredBatchTime: v })}
                        items={['Morning 6-7', 'Morning 7-8', 'Evening 5-6', 'Evening 6-7', 'Evening 7-8', 'Weekend'].map(t => ({ label: t, value: t }))}
                    />

                    <InputRow label="Admission Date (Expected)" value={formData.inquiryDate} onChange={(v) => setFormData({ ...formData, inquiryDate: v })} icon="calendar" />
                    <InputRow label="Admin Notes" value={formData.notes} onChange={(v) => setFormData({ ...formData, notes: v })} icon="notebook" multiline />
                </View>

            </ScrollView>
        </View>
    );
}

function InputRow({ label, value, onChange, icon, multiline, keyboardType }) {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputBox, multiline && { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
                <Icon name={icon} size={20} color={Colors.TEXT_SECONDARY} style={{ marginRight: 10 }} />
                <TextInput
                    style={[styles.input, multiline && { height: '100%', textAlignVertical: 'top' }]}
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor={Colors.TEXT_MUTED}
                    multiline={multiline}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );
}

function PickerRow({ label, value, onValueChange, items }) {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.pickerBox}>
                <Picker selectedValue={value} onValueChange={onValueChange} dropdownIconColor={Colors.TEXT_SECONDARY}>
                    {items.map((item, idx) => (
                        <Picker.Item key={idx} label={item.label} value={item.value} style={{ fontSize: 14, color: Colors.TEXT_PRIMARY }} />
                    ))}
                </Picker>
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
    saveBtn: { backgroundColor: Colors.WHITE, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
    saveBtnText: { color: "#7C3AED", fontWeight: "bold", fontSize: 13 },
    content: { flex: 1, padding: 20, marginTop: -20 },
    card: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 15 },
    fieldContainer: { marginBottom: 15 },
    label: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginBottom: 6, fontWeight: "600" },
    inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.BG_CONTENT, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER, paddingHorizontal: 12, height: 48 },
    input: { flex: 1, color: Colors.TEXT_PRIMARY, fontSize: 14 },
    pickerBox: { backgroundColor: Colors.BG_CONTENT, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER, height: 48, justifyContent: 'center' }
});
