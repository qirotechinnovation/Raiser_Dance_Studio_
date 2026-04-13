import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import adminService from '../../api/adminService';
import Colors from "../../theme/Colors";


export default function AdminRegistrationScreen({ navigation }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        const { name, email, password, confirmPassword } = formData;

        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const res = await adminService.registerAdmin({ name, email, password });
            if (res.data.success) {
                Alert.alert("Success", "New administrator registered successfully.", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Failed", res.data.message || "Registration failed.");
            }
        } catch (error) {
            console.error("Admin registration error:", error);
            Alert.alert("Error", "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Admin</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
                <View style={styles.infoCard}>
                    <Icon name="shield-account-outline" size={40} color={Colors.PRIMARY} />
                    <Text style={styles.infoText}>
                        Register a new administrator to help manage the studio. They will have full access to the admin portal.
                    </Text>
                </View>

                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputBox}>
                    <Icon name="account-outline" size={20} color={Colors.TEXT_SECONDARY} />
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChangeText={(v) => setFormData({ ...formData, name: v })}
                    />
                </View>

                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputBox}>
                    <Icon name="email-outline" size={20} color={Colors.TEXT_SECONDARY} />
                    <TextInput
                        style={styles.input}
                        placeholder="admin@raisers.com"
                        value={formData.email}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onChangeText={(v) => setFormData({ ...formData, email: v })}
                    />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputBox}>
                    <Icon name="lock-outline" size={20} color={Colors.TEXT_SECONDARY} />
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        value={formData.password}
                        onChangeText={(v) => setFormData({ ...formData, password: v })}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Icon name={showPassword ? "eye" : "eye-off"} size={22} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputBox}>
                    <Icon name="lock-check-outline" size={20} color={Colors.TEXT_SECONDARY} />
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        secureTextEntry={!showConfirmPassword}
                        value={formData.confirmPassword}
                        onChangeText={(v) => setFormData({ ...formData, confirmPassword: v })}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Icon name={showConfirmPassword ? "eye" : "eye-off"} size={22} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.btn, loading && styles.btnDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.WHITE} />
                    ) : (
                        <Text style={styles.btnText}>REGISTER ADMIN</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15, backgroundColor: Colors.WHITE, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    backBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
    container: { padding: 25 },
    infoCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF1F2", padding: 20, borderRadius: 20, marginBottom: 30 },
    infoText: { flex: 1, marginLeft: 15, fontSize: 13, color: "#991B1B", lineHeight: 20 },
    label: { fontSize: 12, fontWeight: "bold", color: Colors.TEXT_SECONDARY, textTransform: "uppercase", marginBottom: 8, marginTop: 15, marginLeft: 5 },
    inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.WHITE, borderRadius: 15, paddingHorizontal: 15, height: 60, borderWidth: 1, borderColor: Colors.BORDER },
    input: { flex: 1, marginLeft: 12, fontSize: 16, color: Colors.TEXT_PRIMARY },
    btn: { backgroundColor: Colors.PRIMARY, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginTop: 40, elevation: 4, shadowColor: Colors.PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    btnDisabled: { opacity: 0.7 },
    btnText: { color: Colors.WHITE, fontSize: 16, fontWeight: "bold", letterSpacing: 1 }
});
