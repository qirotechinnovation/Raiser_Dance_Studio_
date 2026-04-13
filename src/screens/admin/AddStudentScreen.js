import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import adminService from "../../api/adminService";
import CustomDateTimePicker from "../../components/CustomDateTimePicker";
import Colors from "../../theme/Colors";


export default function AddStudentScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [batches, setBatches] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);
    const [danceTypes, setDanceTypes] = useState([]);
    const [skillLevels, setSkillLevels] = useState([]);
    const [feeStructure, setFeeStructure] = useState([]);
    const [feeSettings, setFeeSettings] = useState(null);

    // Derived state for Fee Plans dropdown
    const [availablePlans, setAvailablePlans] = useState([]);
    const [calculatedFee, setCalculatedFee] = useState(0);

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        parentMobile: "",
        address: "",
        taluka: "",
        district: "",
        state: "Maharashtra",
        pincode: "",
        nationality: "Indian",
        parentRelation: "Father",
        email: "",
        password: "password123", // Default password
        skillLevel: "Beginner",
        classType: "Bollywood", 
        batchId: "",
        danceTypeId: "",
        feePlanId: "",
        admissionFee: "200",
        joiningDate: "", // default to empty so they MUST select
        notes: "",
        active: true
    });

    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        fetchMetadata();
    }, []);

    // 1. Fetch Data
    const fetchMetadata = async () => {
        try {
            const [bRes, dRes, sRes, fRes, setRes] = await Promise.all([
                adminService.getBatches(),
                adminService.getDanceTypes(),
                adminService.getSkillLevels(),
                adminService.getFeeStructure(),
                adminService.getFeeSettings().catch(() => ({ data: { admissionFee: 200 } }))
            ]);
            setBatches(bRes.data || []);
            setFilteredBatches(bRes.data || []);
            setDanceTypes(dRes.data || []);
            setSkillLevels(sRes.data || []);
            setFeeStructure(fRes.data || []);
            setFeeSettings(setRes.data);

            // Set default Admission Fee
            if (setRes.data && setRes.data.admissionFee) {
                setFormData(prev => ({ ...prev, admissionFee: setRes.data.admissionFee.toString() }));
            }

            // Set Defaults
            if (dRes.data.length > 0) {
                const defaultDT = dRes.data[0];
                setFormData(prev => ({ ...prev, danceTypeId: defaultDT.id, classType: defaultDT.name }));
            }
            if (sRes.data.length > 0) setFormData(prev => ({ ...prev, skillLevel: sRes.data[0].name }));

        } catch (error) {
            console.error("Failed to fetch metadata:", error);
        }
    };

    // 2. Logic: Filter Batches when Dance Type Changes
    useEffect(() => {
        if (!formData.danceTypeId) return;

        // Find selected dance type name for consistency
        const dt = danceTypes.find(d => d.id === formData.danceTypeId);
        if (dt) {
            // Filter Batches
            const relevantBatches = batches.filter(b => b.danceType && b.danceType.id === formData.danceTypeId);
            setFilteredBatches(relevantBatches);

            // Auto-select first batch if current selection is invalid
            if (relevantBatches.length > 0) {
                const isValid = relevantBatches.find(b => b.id === formData.batchId);
                if (!isValid) {
                    setFormData(prev => ({ ...prev, batchId: relevantBatches[0].id }));
                }
            } else {
                setFormData(prev => ({ ...prev, batchId: "" }));
            }
        }
    }, [formData.danceTypeId, batches, danceTypes]);

    // 3. Logic: Update Available Plans based on Category
    useEffect(() => {
        let category = "Regular";
        const dt = danceTypes.find(d => d.id === formData.danceTypeId);

        if (dt && dt.name.toLowerCase().includes('private')) {
            category = "Private";
        } else if (parseInt(formData.age || 0) > 0 && parseInt(formData.age || 0) < 12) {
            category = "Kids";
        }

        const plans = feeStructure.filter(f => f.category === category);
        setAvailablePlans(plans);

        if (plans.length > 0) {
            const currentPlanExists = plans.find(p => p.id === formData.feePlanId);
            if (!currentPlanExists) {
                setFormData(prev => ({ ...prev, feePlanId: plans[0].id }));
            }
        } else {
            setFormData(prev => ({ ...prev, feePlanId: "" }));
        }

    }, [formData.age, formData.danceTypeId, feeStructure, danceTypes]);

    // 4. Logic: Update Calculated Fee when Plan changes
    useEffect(() => {
        if (formData.feePlanId) {
            const plan = feeStructure.find(p => p.id === formData.feePlanId);
            if (plan) {
                setCalculatedFee(plan.amount);
            }
        } else {
            setCalculatedFee(0);
        }
    }, [formData.feePlanId, feeStructure]);


    const handleSave = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.parentMobile || !formData.joiningDate) {
            Alert.alert("Required Fields", "Please fill Name, Email, Password, Mobile Number, and Admission Date.");
            return;
        }

        setLoading(true);
        try {
            const planObj = feeStructure.find(p => p.id === formData.feePlanId);
            const feePlanName = planObj ? planObj.plan : "Monthly";

            const payload = {
                ...formData,
                batch: formData.batchId ? { id: formData.batchId } : null,
                danceType: formData.danceTypeId ? { id: formData.danceTypeId } : null,
                age: parseInt(formData.age) || 0,
                admissionFee: parseFloat(formData.admissionFee) || 0,
                joiningDate: formData.joiningDate,
                feePlan: feePlanName
            };
            await adminService.addStudent(payload);
            Alert.alert("Success", "New student profile created successfully!", [
                { text: "Done", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Failed to add student:", error);
            const msg = error.response?.data?.message || "Could not create student. Email may be taken.";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.PRIMARY} />

            <LinearGradient colors={[Colors.PRIMARY, Colors.PRIMARY_DARK]} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={26} color={Colors.WHITE} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Student</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
                        {loading ? <ActivityIndicator size="small" color={Colors.PRIMARY} /> : <Text style={styles.saveBtnText}>Save</Text>}
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerSubtitle}>Create a new student profile</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="account-circle-outline" size={22} color={Colors.PRIMARY} />
                        <Text style={styles.cardTitle}>Basic Information</Text>
                    </View>

                    <InputField label="Full Name *" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} icon="account" placeholder="e.g. Rahul Kumar" />
                    <InputField label="Email Address *" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} icon="email" keyboardType="email-address" placeholder="student@example.com" />
                    <InputField 
                        label="Password *" 
                        value={formData.password} 
                        onChange={(v) => setFormData({ ...formData, password: v })} 
                        icon="lock" 
                        secureTextEntry={!showPassword} 
                        placeholder="******" 
                        rightIcon={showPassword ? "eye" : "eye-off"}
                        onRightIconPress={() => setShowPassword(!showPassword)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <InputField label="Age" value={formData.age} onChange={(v) => setFormData({ ...formData, age: v })} icon="numeric" keyboardType="numeric" placeholder="Age" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <InputField label="Mobile *" value={formData.parentMobile} onChange={(v) => setFormData({ ...formData, parentMobile: v })} icon="phone" keyboardType="phone-pad" placeholder="98765..." />
                        </View>
                    </View>

                    <InputField
                        label="Admission Date *"
                        value={formData.joiningDate}
                        onChange={(v) => setFormData({ ...formData, joiningDate: v })}
                        icon="calendar-edit"
                        placeholder="YYYY-MM-DD"
                        rightIcon="calendar"
                        onRightIconPress={() => setShowDatePicker(true)}
                    />

                    <InputField label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} icon="map-marker" multiline placeholder="Resident Address" />
                    
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <InputField label="Taluka" value={formData.taluka} onChange={(v) => setFormData({ ...formData, taluka: v })} icon="map" placeholder="Taluka" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <InputField label="District" value={formData.district} onChange={(v) => setFormData({ ...formData, district: v })} icon="city" placeholder="District" />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <InputField label="State" value={formData.state} onChange={(v) => setFormData({ ...formData, state: v })} icon="earth" placeholder="State" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <InputField label="Pincode" value={formData.pincode} onChange={(v) => setFormData({ ...formData, pincode: v })} icon="mailbox" keyboardType="numeric" placeholder="411001" />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <InputField label="Nationality" value={formData.nationality} onChange={(v) => setFormData({ ...formData, nationality: v })} icon="flag-outline" placeholder="Indian" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <PickerField label="Relation" value={formData.parentRelation}
                                onValueChange={(v) => setFormData({ ...formData, parentRelation: v })}
                                items={[
                                    { label: 'Father', value: 'Father' },
                                    { label: 'Mother', value: 'Mother' },
                                    { label: 'Brother', value: 'Brother' },
                                    { label: 'Sister', value: 'Sister' },
                                    { label: 'Other', value: 'Other' }
                                ]}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="school-outline" size={22} color={Colors.PRIMARY} />
                        <Text style={styles.cardTitle}>Enrollment Details</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <PickerField label="Dance Form" value={formData.danceTypeId}
                                onValueChange={(v) => setFormData({ ...formData, danceTypeId: v })}
                                items={danceTypes.map(d => ({ label: d.name, value: d.id }))}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <PickerField label="Skill Level" value={formData.skillLevel}
                                onValueChange={(v) => setFormData({ ...formData, skillLevel: v })}
                                items={skillLevels.length > 0 ? skillLevels.map(s => ({ label: s.name, value: s.name })) : []}
                            />
                        </View>
                    </View>

                    <PickerField label="Select Batch" value={formData.batchId}
                        onValueChange={(v) => setFormData({ ...formData, batchId: v })}
                        items={filteredBatches.length > 0
                            ? filteredBatches.map(b => ({ label: `${b.name} (${b.timing})`, value: b.id }))
                            : [{ label: "No batches available", value: "" }]
                        }
                    />
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="cash-multiple" size={22} color={Colors.PRIMARY} />
                        <Text style={styles.cardTitle}>Fees & Account</Text>
                    </View>

                    <PickerField label="Fee Plan" value={formData.feePlanId}
                        onValueChange={(v) => setFormData({ ...formData, feePlanId: v })}
                        items={availablePlans.length > 0
                            ? availablePlans.map(p => ({ label: `${p.plan} - ₹${p.amount}`, value: p.id }))
                            : [{ label: "No plans available for this category", value: "" }]
                        }
                    />

                    <View style={styles.feeHighlight}>
                        <Text style={styles.feeLabel}>Total Plan Fee</Text>
                        <Text style={styles.feeValue}>₹{calculatedFee}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <InputField label="Admission Fee" value={formData.admissionFee} onChange={(v) => setFormData({ ...formData, admissionFee: v })} icon="currency-inr" keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1 }}>
                             {/* Empty flex to align the Admission Fee Box */}
                        </View>
                    </View>

                    <PickerField label="Profile Status" value={formData.active}
                        onValueChange={(v) => setFormData({ ...formData, active: v })}
                        items={[{ label: 'Active', value: true }, { label: 'Inactive', value: false }]}
                    />
                </View>

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

function InputField({ label, value, onChange, icon, multiline, rightIcon, onRightIconPress, ...props }) {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={[styles.inputBox, multiline && { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
                <Icon name={icon} size={20} color={Colors.TEXT_SECONDARY} style={{ marginRight: 10 }} />
                <TextInput
                    style={[styles.input, multiline && { height: '100%', textAlignVertical: 'top' }]}
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor={Colors.TEXT_MUTED}
                    multiline={multiline}
                    {...props}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={{ padding: 10 }}>
                        <Icon name={rightIcon} size={20} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

function PickerField({ label, value, onValueChange, items }) {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.pickerBox}>
                <Picker
                    selectedValue={value}
                    onValueChange={onValueChange}
                    dropdownIconColor={Colors.TEXT_SECONDARY}
                    style={{ color: Colors.TEXT_PRIMARY, marginHorizontal: -5 }}
                >
                    {items.map((item, idx) => (
                        <Picker.Item key={idx} label={item.label} value={item.value} style={{ fontSize: 14 }} />
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
    headerTitle: { fontSize: 24, fontWeight: "bold", color: Colors.WHITE },
    headerSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginLeft: 5 },
    saveBtn: { backgroundColor: Colors.WHITE, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, elevation: 2 },
    saveBtnText: { color: Colors.PRIMARY, fontWeight: "bold", fontSize: 14 },

    content: { flex: 1, padding: 20, marginTop: -20 },
    card: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", paddingBottom: 10 },
    cardTitle: { fontSize: 16, fontWeight: "bold", color: Colors.PRIMARY_DARK, marginLeft: 10 },

    fieldContainer: { marginBottom: 15 },
    fieldLabel: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginBottom: 6, fontWeight: "600" },
    inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.BG_CONTENT, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER, paddingHorizontal: 15, height: 50 },
    input: { flex: 1, color: Colors.TEXT_PRIMARY, fontSize: 15 },

    pickerBox: { backgroundColor: Colors.BG_CONTENT, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER, height: 50, justifyContent: 'center' },

    row: { flexDirection: 'row' },

    feeHighlight: {
        backgroundColor: '#F0FDF4',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BBF7D0'
    },
    feeLabel: { color: '#166534', fontWeight: 'bold' },
    feeValue: { color: '#15803D', fontSize: 18, fontWeight: 'bold' }
});
