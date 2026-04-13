import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API from '../api/axios';
import Colors from "../theme/Colors";


export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your registered email.");
            return;
        }

        setLoading(true);
        try {
            const res = await API.post("/auth/forgot-password", { email });
            if (res.data.success) {
                Alert.alert("Reset Sent", res.data.message, [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", res.data.message);
            }
        } catch (error) {
            Alert.alert("Error", "Could not connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={30} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reset Password</Text>
                <View style={{ width: 30 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Icon name="lock-reset" size={60} color={Colors.PRIMARY} />
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>Enter your email address and we'll send you instructions to reset your password.</Text>

                <View style={styles.inputBox}>
                    <Icon name="email-outline" size={20} color={Colors.TEXT_SECONDARY} />
                    <TextInput
                        style={styles.input}
                        placeholder="your@email.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <TouchableOpacity style={styles.resetBtn} onPress={handleReset} disabled={loading}>
                    {loading ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.resetBtnText}>SEND RESET LINK</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.WHITE },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    content: { flex: 1, padding: 30, alignItems: "center" },
    iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center", marginBottom: 30 },
    title: { fontSize: 24, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 10 },
    subtitle: { fontSize: 14, color: Colors.TEXT_SECONDARY, textAlign: "center", marginBottom: 40, lineHeight: 22 },
    inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.BG_CONTENT, borderRadius: 15, paddingHorizontal: 15, height: 60, borderWidth: 1, borderColor: Colors.BORDER, width: "100%", marginBottom: 25 },
    input: { flex: 1, marginLeft: 12, fontSize: 16, color: Colors.TEXT_PRIMARY },
    resetBtn: { backgroundColor: Colors.PRIMARY, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", width: "100%", elevation: 4, shadowColor: Colors.PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
    resetBtnText: { color: Colors.WHITE, fontSize: 16, fontWeight: "bold", letterSpacing: 1 }
});
