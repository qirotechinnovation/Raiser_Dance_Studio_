import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import adminService from '../../api/adminService';
import Colors from "../../theme/Colors";


export default function AddEditFeeStructureScreen({ navigation, route }) {
    const { mode, feeItem } = route.params || { mode: 'add' };
    const isEdit = mode === 'edit';

    const [category, setCategory] = useState(feeItem?.category || 'Kids');
    const [plan, setPlan] = useState(feeItem?.plan || '');
    const [classes, setClasses] = useState(feeItem?.classes || '');
    const [amount, setAmount] = useState(feeItem?.amount ? feeItem.amount.toString() : '');
    const [discountPercent, setDiscountPercent] = useState(feeItem?.discountPercent ? feeItem.discountPercent.toString() : '0');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            title: isEdit ? 'Edit Fee Plan' : 'Add Fee Plan',
        });
    }, [navigation, isEdit]);

    const handleSave = async () => {
        if (!plan || !classes || !amount) {
            Alert.alert("Error", "Please fill all required fields.");
            return;
        }

        setLoading(true);
        const uniqueId = isEdit ? feeItem.id : null;
        const payload = {
            category,
            plan,
            classes,
            amount: parseFloat(amount),
            discountPercent: parseFloat(discountPercent) || 0
        };

        try {
            if (isEdit) {
                await adminService.updateFeeStructure(uniqueId, payload);
                Alert.alert("Success", "Fee plan updated successfully!");
            } else {
                await adminService.createFeeStructure(payload);
                Alert.alert("Success", "Fee plan added successfully!");
            }
            navigation.goBack();
        } catch (error) {
            console.error("Error saving fee structure:", error);
            Alert.alert("Error", "Failed to save fee plan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Icon name="arrow-left" size={26} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEdit ? 'Edit Plan' : 'Add Plan'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerBox}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(itemValue) => setCategory(itemValue)}
                        dropdownIconColor="#334155"
                    >
                        <Picker.Item label="Kids Class" value="Kids" />
                        <Picker.Item label="Regular Class" value="Regular" />
                        <Picker.Item label="Private Class" value="Private" />
                    </Picker>
                </View>

                <Text style={styles.label}>Plan Name <Text style={styles.req}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Monthly, Quarterly"
                    placeholderTextColor={Colors.TEXT_MUTED}
                    value={plan}
                    onChangeText={setPlan}
                />

                <Text style={styles.label}>Classes Details <Text style={styles.req}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 8 Classes / Month"
                    placeholderTextColor={Colors.TEXT_MUTED}
                    value={classes}
                    onChangeText={setClasses}
                />

                <Text style={styles.label}>Amount (₹) <Text style={styles.req}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 2500"
                    placeholderTextColor={Colors.TEXT_MUTED}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Discount (%)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 0"
                    placeholderTextColor={Colors.TEXT_MUTED}
                    value={discountPercent}
                    onChangeText={setDiscountPercent}
                    keyboardType="numeric"
                />

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={Colors.WHITE} />
                    ) : (
                        <Text style={styles.saveBtnText}>{isEdit ? "Update Plan" : "Create Plan"}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    headerTitle: { fontSize: 22, fontWeight: "900", color: Colors.TEXT_PRIMARY, flex: 1, marginLeft: 15, letterSpacing: -0.5 },
    headerBtn: { padding: 5 },
    content: { padding: 20 },
    label: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 12 },
    req: { color: Colors.ERROR },
    input: {
        backgroundColor: Colors.WHITE,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: Colors.PRIMARY_DARK
    },
    pickerBox: {
        backgroundColor: Colors.WHITE,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        borderRadius: 10,
        overflow: 'hidden'
    },
    footer: {
        padding: 20,
        backgroundColor: Colors.WHITE,
        borderTopWidth: 1,
        borderTopColor: Colors.BORDER
    },
    saveBtn: {
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    saveBtnText: {
        color: Colors.WHITE,
        fontSize: 16,
        fontWeight: 'bold'
    }
});
