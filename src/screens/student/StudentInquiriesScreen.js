import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from 'react-native-image-picker';
import studentService from "../../api/studentService";
import API from "../../api/axios";
import Colors from "../../theme/Colors";


// Styles from Theme
const HEADER_BG = Colors.PRIMARY;

export default function StudentInquiriesScreen({ navigation }) {
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

            const res = await studentService.getMyEventInquiries(studentId);
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
                    name: asset.fileName || 'receipt.jpg',
                });

                try {
                    await studentService.uploadEventReceipt(inquiryId, formData);
                    Alert.alert("Success", "Receipt uploaded! Waiting for admin verification.");
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
            case 'CONFIRMED': return { bg: '#DCFCE7', text: '#16A34A' };
            default: return { bg: '#F3F4F6', text: '#4B5563' };
        }
    };

    const renderItem = ({ item }) => {
        const statusStyle = getStatusColor(item.status);
        const canUpload = item.status === 'ACCEPTED';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.eventTitle}>{item.event?.title || "Unknown Event"}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                    </View>
                </View>

                <Text style={styles.dateText}>{item.event?.date} • {item.event?.venue}</Text>

                {item.message && (
                    <View style={styles.msgBox}>
                        <Text style={styles.msgText}>Your Msg: {item.message}</Text>
                    </View>
                )}

                {canUpload && (
                    <View style={styles.actionContainer}>
                        <Text style={styles.instructionText}>Admin accepted! Please upload payment receipt.</Text>
                        <TouchableOpacity
                            style={styles.uploadBtn}
                            onPress={() => handleUploadReceipt(item.id)}
                            disabled={uploadingId === item.id}
                        >
                            {uploadingId === item.id ? (
                                <ActivityIndicator size="small" color={Colors.WHITE} />
                            ) : (
                                <>
                                    <Icon name="cloud-upload-outline" size={20} color={Colors.WHITE} />
                                    <Text style={styles.uploadBtnText}>Upload Payment Receipt</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {item.receiptPhoto && (
                    <View style={styles.receiptPreview}>
                        <Icon name="check-circle-outline" size={16} color="#16A34A" />
                        <Text style={styles.receiptText}>Receipt Uploaded</Text>
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

            {/* Header Area */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Inquiries</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* Curved Sheet Content */}
            <View style={styles.contentContainer}>
                <FlatList
                    data={inquiries}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 25, paddingTop: 30 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[HEADER_BG]} />}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Icon name="text-box-search-outline" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No inquiries found.</Text>
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
        paddingTop: 15,
        paddingBottom: 25
    },
    backBtn: { padding: 5 },
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
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    eventTitle: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY, flex: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: "bold" },
    dateText: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginBottom: 12 },
    msgBox: { backgroundColor: Colors.BG_CONTENT, padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: Colors.BORDER },
    msgText: { fontSize: 13, color: "#475569", fontStyle: 'italic' },
    actionContainer: { marginTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 12 },
    instructionText: { fontSize: 12, color: Colors.PRIMARY, marginBottom: 8, fontWeight: "600" },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
        elevation: 2
    },
    uploadBtnText: { color: Colors.WHITE, fontWeight: "bold", fontSize: 14 },
    receiptPreview: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
    receiptText: { fontSize: 12, color: "#16A34A", fontWeight: "600" },
    emptyBox: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 10, color: Colors.TEXT_MUTED }
});
