import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";

import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";



export default function AddEditSangeetPackageScreen({ navigation, route }) {
    const editPackage = route.params?.package;
    const isEdit = !!editPackage;

    const [form, setForm] = useState({
        name: "",
        price: "",
        details: "",
        numberOfDances: "1",
        theme: "",
        duration: "",
        choreographerList: "",
        billingCycle: "MONTHLY",
        isPopular: false,
        displayOrder: "0",
        image: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            setForm({
                ...editPackage,
                price: editPackage.price.toString(),
                numberOfDances: editPackage.numberOfDances.toString(),
            });
        }
    }, [isEdit, editPackage]);

    const handleSave = async () => {
        if (!form.name || !form.price) {
            Alert.alert("Error", "Please fill in the package name and price.");
            return;
        }

        setLoading(true);
        try {
            const data = {
                ...form,
                price: parseFloat(form.price),
                numberOfDances: parseInt(form.numberOfDances) || 0,
                displayOrder: parseInt(form.displayOrder) || 0
            };

            if (isEdit) {
                await adminService.updateSangeetPackage(editPackage.id, data);
                Alert.alert("Success", "Package updated successfully");
            } else {
                await adminService.createSangeetPackage(data);
                Alert.alert("Success", "Package created successfully");
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to save wedding choreography package");
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, value, key, placeholder, keyboardType = "default", multiline = false) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.textArea]}
                value={value}
                onChangeText={(text) => setForm({ ...form, [key]: text })}
                placeholder={placeholder}
                placeholderTextColor={Colors.TEXT_MUTED}
                keyboardType={keyboardType}
                multiline={multiline}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9F1239" />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>

                {/* Gradient Header */}
                <LinearGradient colors={[Colors.PRIMARY, "#9F1239"]} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Icon name="arrow-left" size={26} color={Colors.WHITE} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{isEdit ? "Edit Package" : "New Package"}</Text>
                        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
                            {loading ? <ActivityIndicator size="small" color={Colors.PRIMARY} /> : <Text style={styles.saveBtnText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerSubtitle}>{isEdit ? 'Update details' : 'Create a new wedding choreography package'}</Text>
                </LinearGradient>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>PACKAGE DETAILS</Text>
                        {renderInput("Package Name", form.name, "name", "e.g. Silver Tier")}

                        {/* Billing Cycle Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Billing Cycle</Text>
                            <View style={styles.pickerContainer}>
                                <TouchableOpacity
                                    style={[styles.pickerOption, form.billingCycle === "MONTHLY" && styles.pickerOptionActive]}
                                    onPress={() => setForm({ ...form, billingCycle: "MONTHLY" })}
                                >
                                    <Icon
                                        name={form.billingCycle === "MONTHLY" ? "radiobox-marked" : "radiobox-blank"}
                                        size={22}
                                        color={form.billingCycle === "MONTHLY" ? Colors.PRIMARY : Colors.TEXT_MUTED}
                                    />
                                    <Text style={[styles.pickerText, form.billingCycle === "MONTHLY" && styles.pickerTextActive]}>Monthly</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.pickerOption, form.billingCycle === "ANNUAL" && styles.pickerOptionActive]}
                                    onPress={() => setForm({ ...form, billingCycle: "ANNUAL" })}
                                >
                                    <Icon
                                        name={form.billingCycle === "ANNUAL" ? "radiobox-marked" : "radiobox-blank"}
                                        size={22}
                                        color={form.billingCycle === "ANNUAL" ? Colors.PRIMARY : Colors.TEXT_MUTED}
                                    />
                                    <Text style={[styles.pickerText, form.billingCycle === "ANNUAL" && styles.pickerTextActive]}>Annual</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {renderInput("Price (₹)", form.price, "price", "e.g. 199", "numeric")}
                        {renderInput("Number of Dances", form.numberOfDances, "numberOfDances", "e.g. 2", "numeric")}
                        {renderInput("Theme / Style", form.theme, "theme", "e.g. Traditional Bollywood")}
                        {renderInput("Duration", form.duration, "duration", "e.g. 3 Days")}
                        {renderInput("Choreographers", form.choreographerList, "choreographerList", "Names separated by commas")}
                        {renderInput("Image URL", form.image, "image", "e.g. https://...")}
                        {renderInput("Package Details", form.details, "details", "Enter features and description...", "default", true)}

                        <View style={styles.inputGroup}>
                            <TouchableOpacity
                                style={styles.checkboxRow}
                                onPress={() => setForm({ ...form, isPopular: !form.isPopular })}
                            >
                                <Icon
                                    name={form.isPopular ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={24}
                                    color={form.isPopular ? Colors.PRIMARY : Colors.TEXT_SECONDARY}
                                />
                                <Text style={styles.checkboxLabel}>Mark as Most Popular</Text>
                            </TouchableOpacity>
                        </View>

                        {renderInput("Display Order", form.displayOrder.toString(), "displayOrder", "e.g. 1", "numeric")}

                    </View>
                    <View style={{ height: 100 }} />

                </ScrollView>
            </KeyboardAvoidingView>
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

    scrollContent: { padding: 20, marginTop: -20 },
    card: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },

    sectionLabel: { fontSize: 11, fontWeight: "bold", color: Colors.TEXT_MUTED, letterSpacing: 1, marginBottom: 15, marginTop: 5 },

    inputGroup: { marginBottom: 15 },
    label: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginBottom: 6, fontWeight: "600" },
    input: {
        backgroundColor: Colors.BG_CONTENT,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        fontSize: 15,
        color: Colors.TEXT_PRIMARY,
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    textArea: { height: 100, paddingTop: 12, textAlignVertical: "top" },

    pickerContainer: { flexDirection: "row", gap: 10 },
    pickerOption: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.BG_CONTENT,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        gap: 8,
        justifyContent: 'center'
    },
    pickerOptionActive: {
        backgroundColor: "#FFF1F2",
        borderColor: Colors.PRIMARY
    },
    pickerText: {
        fontSize: 14,
        color: Colors.TEXT_SECONDARY,
        fontWeight: "600"
    },
    pickerTextActive: {
        color: Colors.PRIMARY,
        fontWeight: "700"
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: Colors.BG_CONTENT,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '600',
        color: Colors.TEXT_PRIMARY
    }
});

