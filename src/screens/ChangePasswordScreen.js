import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';
import Colors from "../theme/Colors";


export default function ChangePasswordScreen({ navigation }) {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
    const [loading, setLoading] = useState(false);

    const handleChange = async () => {
        if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
            Alert.alert("Error", "All fields are required.");
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const email = (await AsyncStorage.getItem("userRole") === "ADMIN")
                ? await AsyncStorage.getItem("adminEmail")
                : await AsyncStorage.getItem("userEmail");

            const res = await API.post("/auth/change-password", {
                email,
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });

            if (res.data.success) {
                Alert.alert("Success", "Password updated successfully", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", res.data.message);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Update Password</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.container}>
                <Text style={styles.label}>Old Password</Text>
                <View style={styles.inputBox}>
                    <Icon name="lock-outline" size={20} color={Colors.TEXT_SECONDARY} />
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showPasswords.old}
                        placeholder="••••••••"
                        value={passwords.oldPassword}
                        onChangeText={(v) => setPasswords({ ...passwords, oldPassword: v })}
                    />
                    <TouchableOpacity onPress={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}>
                        <Icon name={showPasswords.old ? "eye" : "eye-off"} size={22} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputBox}>
                    <Icon name="lock-reset" size={20} color={Colors.TEXT_SECONDARY} />
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showPasswords.new}
                        placeholder="••••••••"
                        value={passwords.newPassword}
                        onChangeText={(v) => setPasswords({ ...passwords, newPassword: v })}
                    />
                    <TouchableOpacity onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                        <Icon name={showPasswords.new ? "eye" : "eye-off"} size={22} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputBox}>
                    <Icon name="lock-check-outline" size={20} color={Colors.TEXT_SECONDARY} />
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showPasswords.confirm}
                        placeholder="••••••••"
                        value={passwords.confirmPassword}
                        onChangeText={(v) => setPasswords({ ...passwords, confirmPassword: v })}
                    />
                    <TouchableOpacity onPress={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                        <Icon name={showPasswords.confirm ? "eye" : "eye-off"} size={22} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.updateBtn} onPress={handleChange} disabled={loading}>
                    {loading ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.updateBtnText}>SAVE NEW PASSWORD</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, backgroundColor: Colors.WHITE },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    container: { padding: 30 },
    label: { fontSize: 12, fontWeight: "bold", color: Colors.TEXT_SECONDARY, textTransform: "uppercase", marginBottom: 8, marginTop: 20 },
    inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.WHITE, borderRadius: 15, paddingHorizontal: 15, height: 60, borderWidth: 1, borderColor: Colors.BORDER },
    input: { flex: 1, marginLeft: 12, fontSize: 16, color: Colors.TEXT_PRIMARY },
    updateBtn: { backgroundColor: Colors.PRIMARY, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginTop: 40, elevation: 4 },
    updateBtnText: { color: Colors.WHITE, fontSize: 16, fontWeight: "bold", letterSpacing: 1 }
});
