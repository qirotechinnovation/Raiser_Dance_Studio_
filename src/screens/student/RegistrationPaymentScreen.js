import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API from '../../api/axios';
import studentService from '../../api/studentService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from "../../theme/Colors";


export default function RegistrationPaymentScreen({ navigation, route }) {
    const [loading, setLoading] = useState(false);
    const [fetchingFee, setFetchingFee] = useState(true);
    const [proof, setProof] = useState(null);
    const [status, setStatus] = useState(route.params?.status || 'PENDING');
    const [feeAmount, setFeeAmount] = useState(200); // Default fallback

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await studentService.getPublicFeeSettings();
            if (res.data && res.data.admissionFee) {
                setFeeAmount(res.data.admissionFee);
            }
        } catch (error) {
            console.error("Error fetching fee settings:", error);
            // Fallback to default is already set
        } finally {
            setFetchingFee(false);
        }
    };

    const handleSelectImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.7,
        });

        if (result.assets && result.assets.length > 0) {
            setProof(result.assets[0]);
        }
    };

    const handleUpload = async () => {
        if (!proof) {
            Alert.alert("Error", "Please select a screenshot first.");
            return;
        }

        setLoading(true);
        try {
            const studentId = await AsyncStorage.getItem("studentId");
            const formData = new FormData();
            formData.append('file', {
                uri: proof.uri,
                type: proof.type,
                name: proof.fileName || 'proof.jpg'
            });

            await studentService.uploadRegistrationFee(studentId, formData);

            setStatus('VERIFICATION_PENDING');
            Alert.alert("Success", "Proof uploaded! Admin will verify shortly.");
        } catch (error) {
            console.error("Upload failed", error);
            Alert.alert("Error", "Failed to upload proof.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    if (status === 'VERIFICATION_PENDING') {
        return (
            <View style={styles.container}>
                <LinearGradient colors={[Colors.PRIMARY, "#9F1239"]} style={styles.header}>
                    <Text style={styles.headerTitle}>Verification Pending</Text>
                </LinearGradient>
                <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Icon name="clock-check-outline" size={80} color="#F59E0B" />
                    <Text style={styles.pendingText}>Payment submitted for review.</Text>
                    <Text style={styles.subText}>You can access the dashboard once the admin approves your registration fee.</Text>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (fetchingFee) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.PRIMARY, "#9F1239"]} style={styles.header}>
                <Text style={styles.headerTitle}>Registration Fee</Text>
                <Text style={styles.headerSub}>One-time payment required</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.amountLabel}>Amount to Pay</Text>
                    <Text style={styles.amount}>₹{feeAmount}</Text>

                    <View style={styles.qrContainer}>
                        <Image 
                            source={require('../../assets/payment_qr.jpg')} 
                            style={styles.qrImage} 
                            resizeMode="contain"
                        />
                        <Text style={styles.upiId}>UPI: 9503399763-2@ybl</Text>
                    </View>

                    <Text style={styles.instruction}>
                        1. Scan QR code to pay ₹{feeAmount}.
                        {"\n"}2. Take a screenshot of payment.
                        {"\n"}3. Upload it below.
                    </Text>

                    <TouchableOpacity style={styles.uploadBox} onPress={handleSelectImage}>
                        {proof ? (
                            <Image source={{ uri: proof.uri }} style={styles.previewImg} />
                        ) : (
                            <>
                                <Icon name="cloud-upload-outline" size={40} color={Colors.PRIMARY} />
                                <Text style={styles.uploadText}>Tap to Upload Screenshot</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitBtn, !proof && styles.disabledBtn]}
                        onPress={handleUpload}
                        disabled={!proof || loading}
                    >
                        {loading ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.submitText}>Submit Payment</Text>}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutLink} onPress={handleLogout}>
                    <Text style={styles.linkText}>Cancel & Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.BG_CONTENT },
    header: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.WHITE },
    headerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 5 },
    content: { padding: 20 },
    card: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 25, alignItems: 'center', elevation: 4 },
    amountLabel: { color: Colors.TEXT_SECONDARY, fontSize: 14, textTransform: 'uppercase', fontWeight: 'bold' },
    amount: { fontSize: 40, fontWeight: 'bold', color: Colors.PRIMARY, marginVertical: 10 },
    qrContainer: { marginVertical: 20, alignItems: 'center', width: '100%' },
    qrImage: { width: 200, height: 200, marginBottom: 10 },
    upiId: { marginTop: 10, fontSize: 16, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, backgroundColor: '#F1F5F9', padding: 8, borderRadius: 8 },
    instruction: { textAlign: 'center', color: Colors.TEXT_SECONDARY, lineHeight: 22, marginVertical: 20 },
    uploadBox: { width: '100%', height: 150, borderWidth: 2, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    uploadText: { color: Colors.PRIMARY, fontWeight: 'bold', marginTop: 10 },
    previewImg: { width: '100%', height: '100%', borderRadius: 13, resizeMode: 'cover' },
    submitBtn: { backgroundColor: Colors.PRIMARY, width: '100%', padding: 15, borderRadius: 12, alignItems: 'center' },
    disabledBtn: { backgroundColor: '#CBD5E1' },
    submitText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 },
    logoutLink: { marginTop: 20, alignItems: 'center' },
    linkText: { color: Colors.TEXT_SECONDARY, fontWeight: 'bold' },

    // Pending State
    pendingText: { fontSize: 20, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginTop: 20 },
    subText: { textAlign: 'center', color: Colors.TEXT_SECONDARY, marginTop: 10, maxWidth: '80%' },
    logoutBtn: { marginTop: 40, backgroundColor: Colors.TEXT_PRIMARY, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    logoutText: { color: Colors.WHITE, fontWeight: 'bold' }
});
