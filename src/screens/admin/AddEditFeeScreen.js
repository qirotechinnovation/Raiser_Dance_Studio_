import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StatusBar } from "react-native";

import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


export default function AddEditFeeScreen({ navigation, route }) {
    const isEdit = route.params?.fee != null;
    const existingFee = route.params?.fee;

    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [feeStructure, setFeeStructure] = useState([]);

    const [formData, setFormData] = useState({
        studentId: existingFee?.student?.id || "",
        amount: existingFee?.amount?.toString() || "",
        paidAmount: existingFee?.paidAmount?.toString() || "0",
        plan: existingFee?.plan || "Monthly",
        discountPercent: existingFee?.discountPercent?.toString() || "0",
        dueDate: existingFee?.dueDate || new Date().toISOString().split('T')[0],
        remarks: existingFee?.remarks || "",
        status: existingFee?.status || "UNPAID",
        feeType: existingFee?.feeType || "Monthly Fee",
        feeMonth: existingFee?.feeMonth || new Date().toLocaleString('default', { month: 'long' }),
        batchName: existingFee?.batchName || "",
        autoRenewNextCycle: existingFee?.autoRenewNextCycle !== false ? "YES" : "NO"
    });

    const fetchFeeStructure = React.useCallback(async () => {
        try {
            const res = await adminService.getFeeStructure();
            setFeeStructure(res.data);
        } catch (e) {
            console.error("Failed to fetch fee structure", e);
        }
    }, []);

    const autoFetchAmount = React.useCallback((studentId, plan) => {
        if (!studentId || !plan || feeStructure.length === 0) return;

        const student = students.find(s => s.id === studentId);
        if (!student) return;

        let category = "Regular";
        if (student.classType === "Private") {
            category = "Private";
        } else if (student.age < 12) {
            category = "Kids";
        }

        // Map frontend plans to backend plans if necessary
        const planMap = {
            "Monthly": "Monthly",
            "Quarterly": "Quarterly",
            "HalfYearly": "Half-year",
            "Yearly": "Yearly"
        };
        const targetPlan = planMap[plan] || plan;

        const fee = feeStructure.find(f => f.category === category && f.plan === targetPlan);
        if (fee) {
            setFormData(prev => ({ ...prev, amount: fee.amount.toString() }));
        }
    }, [students, feeStructure]);

    const fetchStudents = React.useCallback(async () => {
        try {
            const res = await adminService.getStudents();
            setStudents(res.data);
            if (!isEdit && res.data.length > 0) {
                const firstStudent = res.data[0];
                setFormData(prev => ({ 
                    ...prev, 
                    studentId: firstStudent.id,
                    batchName: firstStudent.batch ? firstStudent.batch.name : ""
                }));
                autoFetchAmount(firstStudent.id, formData.plan);
            }
        } catch (error) {
            console.error("Failed to fetch students:", error);
        }
    }, [isEdit, formData.plan, autoFetchAmount]);

    useEffect(() => {
        fetchStudents();
        fetchFeeStructure();
    }, [fetchStudents, fetchFeeStructure]);

    useEffect(() => {
        if (!isEdit && formData.studentId && formData.plan) {
            autoFetchAmount(formData.studentId, formData.plan);
        }
    }, [isEdit, formData.studentId, formData.plan, autoFetchAmount]);

    const handleSave = async () => {
        if (!formData.studentId || !formData.amount || !formData.dueDate) {
            Alert.alert("Error", "Please fill required fields (Student, Amount, Due Date)");
            return;
        }

        setLoading(true);
        try {
            const totalAmt = parseFloat(formData.amount) || 0;
            const paidAmt = parseFloat(formData.paidAmount) || 0;
            
            // Auto compute status if user partially paid
            let computedStatus = formData.status;
            if (paidAmt >= totalAmt && totalAmt > 0) {
                computedStatus = "PAID";
            } else if (paidAmt > 0 && paidAmt < totalAmt) {
                computedStatus = "PARTIAL";
            }

            const payload = {
                id: isEdit ? existingFee.id : undefined,
                amount: totalAmt,
                paidAmount: paidAmt,
                plan: formData.plan,
                discountPercent: parseFloat(formData.discountPercent) || 0,
                dueDate: formData.dueDate,
                remarks: formData.remarks,
                status: computedStatus,
                feeType: formData.feeType,
                feeMonth: formData.feeMonth,
                batchName: formData.batchName,
                autoRenewNextCycle: formData.autoRenewNextCycle === "YES"
            };

            if (isEdit) {
                await adminService.updateFee(existingFee.id, payload);
            } else {
                await adminService.addFee(formData.studentId, payload);
            }

            Alert.alert("Success", `Fee record ${isEdit ? 'updated' : 'assigned'} successfully`, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Failed to save fee:", error);
            Alert.alert("Error", "Could not save fee details.");
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
                        <Text style={styles.headerTitle}>{isEdit ? 'Edit Fee Record' : 'Assign New Fee'}</Text>
                        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
                            {loading ? <ActivityIndicator size="small" color={Colors.PRIMARY} /> : <Text style={styles.saveBtnText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerSubtitle}>{isEdit ? 'Update payment status or details' : 'Create a new fee demand for a student'}</Text>
                </LinearGradient>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>STUDENT & PLAN</Text>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>Select Student *</Text>
                            <Picker
                                selectedValue={formData.studentId}
                                onValueChange={(v) => {
                                    const selectedStud = students.find(s => s.id === v);
                                    setFormData({ 
                                        ...formData, 
                                        studentId: v,
                                        batchName: selectedStud && selectedStud.batch ? selectedStud.batch.name : ""
                                    });
                                }}
                                enabled={!isEdit}
                                style={{ color: Colors.TEXT_PRIMARY }}
                            >
                                {students.map(s => (
                                    <Picker.Item key={s.id} label={s.name} value={s.id} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>Fee Type</Text>
                            <Picker
                                selectedValue={formData.feeType}
                                onValueChange={(v) => setFormData({ ...formData, feeType: v })}
                                style={{ color: Colors.TEXT_PRIMARY }}
                            >
                                <Picker.Item label="Monthly Fee" value="Monthly Fee" />
                                <Picker.Item label="Admission Fee" value="Admission Fee" />
                            </Picker>
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>Fee Month</Text>
                            <Picker
                                selectedValue={formData.feeMonth}
                                onValueChange={(v) => setFormData({ ...formData, feeMonth: v })}
                                style={{ color: Colors.TEXT_PRIMARY }}
                            >
                                <Picker.Item label="N/A" value="N/A" />
                                <Picker.Item label="January" value="January" />
                                <Picker.Item label="February" value="February" />
                                <Picker.Item label="March" value="March" />
                                <Picker.Item label="April" value="April" />
                                <Picker.Item label="May" value="May" />
                                <Picker.Item label="June" value="June" />
                                <Picker.Item label="July" value="July" />
                                <Picker.Item label="August" value="August" />
                                <Picker.Item label="September" value="September" />
                                <Picker.Item label="October" value="October" />
                                <Picker.Item label="November" value="November" />
                                <Picker.Item label="December" value="December" />
                            </Picker>
                        </View>

                        <InputField
                            label="Batch / Class Name"
                            value={formData.batchName}
                            onChange={(v) => setFormData({ ...formData, batchName: v })}
                            icon="google-classroom"
                        />

                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>Fee Plan</Text>
                            <Picker
                                selectedValue={formData.plan}
                                onValueChange={(v) => setFormData({ ...formData, plan: v })}
                                style={{ color: Colors.TEXT_PRIMARY }}
                            >
                                <Picker.Item label="Monthly" value="Monthly" />
                                <Picker.Item label="Quarterly" value="Quarterly" />
                                <Picker.Item label="Half Yearly" value="HalfYearly" />
                                <Picker.Item label="Yearly" value="Yearly" />
                                <Picker.Item label="Uniform" value="Uniform" />
                                <Picker.Item label="Event Fee" value="Event Fee" />
                            </Picker>
                        </View>

                        <Text style={styles.sectionLabel}>AMOUNT & PAYMENTS</Text>
                        <InputField
                            label="Total Plan Amount (₹) *"
                            value={formData.amount}
                            onChange={(v) => setFormData({ ...formData, amount: v })}
                            icon="currency-inr"
                            keyboardType="numeric"
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <InputField
                                    label="Paid Amount (₹) [Partial]"
                                    value={formData.paidAmount}
                                    onChange={(v) => setFormData({ ...formData, paidAmount: v })}
                                    icon="cash-check"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ width: 15 }} />
                            <View style={{ flex: 1 }}>
                                <InputField
                                    label="Discount (%)"
                                    value={formData.discountPercent}
                                    onChange={(v) => setFormData({ ...formData, discountPercent: v })}
                                    icon="percent-outline"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Calculated Balance Preview */}
                        {formData.amount !== "" && (
                            <View style={{ backgroundColor: '#FFF1F2', padding: 12, borderRadius: 12, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: Colors.PRIMARY }}>
                                <Text style={{ fontSize: 13, color: Colors.TEXT_PRIMARY, fontWeight: '600' }}>
                                    Remaining Fee Pending: <Text style={{ color: Colors.PRIMARY, fontWeight: 'bold', fontSize: 15 }}>₹{Math.max(0, (parseFloat(formData.amount) || 0) - (parseFloat(formData.paidAmount) || 0))}</Text>
                                </Text>
                                <Text style={{ fontSize: 11, color: Colors.TEXT_MUTED, marginTop: 2 }}>
                                    {(parseFloat(formData.paidAmount) || 0) > 0 && (parseFloat(formData.paidAmount) || 0) < (parseFloat(formData.amount) || 0)
                                        ? "Status will be marked as PARTIAL (Pending Dues)"
                                        : (parseFloat(formData.paidAmount) || 0) >= (parseFloat(formData.amount) || 0) && (parseFloat(formData.amount) || 0) > 0
                                        ? "Status will be marked as PAID"
                                        : "Status will be UNPAID"}
                                </Text>
                            </View>
                        )}

                        <InputField
                            label="Due Date *"
                            value={formData.dueDate}
                            onChange={(v) => setFormData({ ...formData, dueDate: v })}
                            icon="calendar-outline"
                            placeholder="YYYY-MM-DD"
                        />

                        <Text style={styles.sectionLabel}>CONTINUATION & STATUS</Text>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>Next Month / Cycle Continuation</Text>
                            <Picker
                                selectedValue={formData.autoRenewNextCycle}
                                onValueChange={(v) => setFormData({ ...formData, autoRenewNextCycle: v })}
                                style={{ color: Colors.TEXT_PRIMARY }}
                            >
                                <Picker.Item label="Yes - Continue Next Month/Cycle (Auto-Renew)" value="YES" />
                                <Picker.Item label="No - Pause/Discontinue Next Month" value="NO" />
                            </Picker>
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>Manual Status Override</Text>
                            <Picker
                                selectedValue={formData.status}
                                onValueChange={(v) => setFormData({ ...formData, status: v })}
                                style={{ color: Colors.TEXT_PRIMARY }}
                            >
                                <Picker.Item label="Unpaid / Pending" value="UNPAID" />
                                <Picker.Item label="Partial Payment" value="PARTIAL" />
                                <Picker.Item label="Fully Paid" value="PAID" />
                            </Picker>
                        </View>

                        <InputField
                            label="Admin Remarks"
                            value={formData.remarks}
                            onChange={(v) => setFormData({ ...formData, remarks: v })}
                            icon="note-text-outline"
                            multiline
                            style={{ height: 80, alignItems: 'flex-start', paddingTop: 10 }}
                        />

                        <View style={{ height: 100 }} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}


function InputField({ label, value, onChange, icon, style, ...props }) {
    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.inputBox, style]}>
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
    },
    pickerLabel: { position: 'absolute', top: -10, left: 10, backgroundColor: Colors.WHITE, paddingHorizontal: 5, fontSize: 10, color: Colors.TEXT_SECONDARY, fontWeight: 'bold', zIndex: 1 },

    row: { flexDirection: "row" }
});
