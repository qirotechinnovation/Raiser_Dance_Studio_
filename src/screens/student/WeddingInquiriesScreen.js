import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image, StatusBar } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from 'react-native-image-picker';
import studentService from "../../api/studentService";
import API from "../../api/axios";
import Colors from "../../theme/Colors";


// Styles from Theme
const HEADER_BG = Colors.PRIMARY;

export default function WeddingInquiriesScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [uploadingId, setUploadingId] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const studentId = await AsyncStorage.getItem("studentId");
            if (!studentId) return;

            const res = await studentService.getMySangeetInquiries(studentId);
            setInquiries(res.data);
        } catch (error) {
            console.error("Fetch inquiries error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchInquiries();
    }, []);

    const handleUploadReceipt = async (inquiryId) => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
            if (response.didCancel) return;
            if (response.errorMessage) {
                Alert.alert("Error", "Image selection failed");
                return;
            }

            if (response.assets && response.assets.length > 0) {
                const asset = response.assets[0];
                setUploadingId(inquiryId);

                const formData = new FormData();
                formData.append('file', {
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    name: asset.fileName || 'wedding_receipt.jpg',
                });

                try {
                    await studentService.uploadSangeetReceipt(inquiryId, formData);
                    Alert.alert("Success", "Receipt uploaded! Admin will verify and confirm your booking.");
                    fetchInquiries();
                } catch (error) {
                    Alert.alert("Error", "Upload failed. Please try again.");
                } finally {
                    setUploadingId(null);
                }
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return { bg: '#FEF3C7', text: '#D97706' };
            case 'ACCEPTED': return { bg: '#DBEAFE', text: '#2563EB' };
            case 'PAID': return { bg: '#FFEDD5', text: '#EA580C' };
            case 'BOOKED': return { bg: '#DCFCE7', text: '#16A34A' };
            case 'DECLINED': return { bg: '#FEE2E2', text: '#DC2626' };
            default: return { bg: '#F3F4F6', text: '#4B5563' };
        }
    };

    const renderItem = ({ item }) => {
        const statusStyle = getStatusColor(item.status);
        const canUpload = item.status === 'ACCEPTED';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.eventTitle}>{item.packageOfInterest?.name || "Wedding Package"}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="calendar-heart" size={16} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.dateText}>{item.eventDate} • Wedding Event</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="currency-inr" size={16} color={Colors.PRIMARY} />
                    <Text style={styles.priceText}>Booking Amount: ₹{item.packageOfInterest?.price || "TBD"}</Text>
                </View>

                {item.paymentStatus === 'PAID' && (
                    <View style={styles.paidBadge}>
                        <Icon name="check-decagram" size={14} color="#166534" />
                        <Text style={styles.paidText}>Payment Confirmed</Text>
                    </View>
                )}

                {canUpload && (
                    <View style={styles.actionContainer}>
                        <View style={styles.alertBox}>
                            <Icon name="information" size={18} color={Colors.PRIMARY} />
                            <Text style={styles.instructionText}>
                                Request accepted! Please pay ₹{item.packageOfInterest?.price || ""} and upload the screenshot.
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.uploadBtn}
                            onPress={() => handleUploadReceipt(item.id)}
                            disabled={uploadingId === item.id}
                        >
                            {uploadingId === item.id ? (
                                <ActivityIndicator size="small" color={Colors.WHITE} />
                            ) : (
                                <>
                                    <Icon name="cloud-upload" size={20} color={Colors.WHITE} />
                                    <Text style={styles.uploadBtnText}>Upload Payment Receipt</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {item.receiptPhoto && (
                    <View style={styles.receiptPreview}>
                        <Icon name="file-document-check-outline" size={16} color="#16A34A" />
                        <Text style={styles.receiptText}>Receipt Uploaded (Verifying...)</Text>
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={HEADER_BG} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={HEADER_BG} />

            <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Icon name="arrow-left" size={24} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wedding Bookings</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.contentContainer}>
                <FlatList
                    data={inquiries}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20, paddingTop: 25 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[HEADER_BG]} />}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Icon name="heart-broken-outline" size={60} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No bookings found yet.</Text>
                            <TouchableOpacity
                                style={styles.bookNowBtn}
                                onPress={() => navigation.navigate("SangeetPackages")}
                            >
                                <Text style={styles.bookNowText}>Book a Package</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: HEADER_BG },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingHorizontal: 25,
        paddingBottom: 25
    },
    headerBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.WHITE },
    contentContainer: {
        flex: 1,
        backgroundColor: Colors.BG_CONTENT,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden'
    },
    card: {
        backgroundColor: Colors.WHITE,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: "#F1F5F9"
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    eventTitle: { fontSize: 17, fontWeight: "bold", color: Colors.TEXT_PRIMARY, flex: 1 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    statusText: { fontSize: 11, fontWeight: "800", textTransform: 'uppercase' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    dateText: { fontSize: 14, color: Colors.TEXT_SECONDARY, fontWeight: '500' },
    priceText: { fontSize: 16, color: Colors.PRIMARY, fontWeight: 'bold' },
    paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
    paidText: { fontSize: 11, color: '#166534', fontWeight: 'bold' },
    actionContainer: { marginTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 15 },
    alertBox: { flexDirection: 'row', gap: 8, backgroundColor: '#FFF1F2', padding: 10, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
    instructionText: { fontSize: 12, color: Colors.PRIMARY, fontWeight: "600", flex: 1 },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 10,
        elevation: 3
    },
    uploadBtnText: { color: Colors.WHITE, fontWeight: "bold", fontSize: 15 },
    receiptPreview: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8, backgroundColor: '#F0FDF4', padding: 10, borderRadius: 10 },
    receiptText: { fontSize: 13, color: "#16A34A", fontWeight: "600" },
    emptyBox: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyText: { marginTop: 15, color: Colors.TEXT_SECONDARY, fontSize: 16, fontWeight: '500', textAlign: 'center' },
    bookNowBtn: { marginTop: 20, backgroundColor: Colors.PRIMARY, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    bookNowText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 14 }
});
