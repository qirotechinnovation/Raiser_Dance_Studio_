import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import studentService from '../../api/studentService';
import Colors from "../../theme/Colors";


export default function StudentSangeetInquiriesScreen({ navigation }) {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const sId = await AsyncStorage.getItem("studentId");
            const res = await studentService.getMySangeetInquiries(sId);
            setInquiries(res.data || []);
        } catch (error) {
            console.error("Failed to fetch inquiries", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (inquiryId) => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.7,
        });

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            uploadReceipt(inquiryId, asset);
        }
    };

    const uploadReceipt = async (inquiryId, asset) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: asset.uri,
                type: asset.type,
                name: asset.fileName || 'receipt.jpg'
            });

            await studentService.uploadSangeetReceipt(inquiryId, formData);
            Alert.alert("Success", "Payment proof uploaded! Admin will verify.");
            fetchInquiries(); // Refresh
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to upload receipt.");
        } finally {
            setUploading(false);
        }
    };

    const renderStatusBadge = (status, paymentStatus) => {
        if (status === 'BOOKED' || paymentStatus === 'PAID') {
            return <View style={[styles.badge, styles.badgeSuccess]}><Text style={styles.badgeText}>Confirm</Text></View>;
        }
        if (paymentStatus === 'VERIFICATION_PENDING') {
            return <View style={[styles.badge, styles.badgeInfo]}><Text style={styles.badgeText}>Verifying</Text></View>;
        }
        if (status === 'ACCEPTED') {
            return <View style={[styles.badge, styles.badgeWarning]}><Text style={styles.badgeText}>Pay Now</Text></View>;
        }
        if (status === 'DECLINED') {
            return <View style={[styles.badge, styles.badgeError]}><Text style={styles.badgeText}>Declined</Text></View>;
        }
        return <View style={[styles.badge, styles.badgeGray]}><Text style={styles.badgeText}>{status}</Text></View>;
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.PRIMARY} /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Wedding Inquiries</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={inquiries}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>No requests found.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.pkgName}>{item.packageOfInterest?.name || "Custom Package"}</Text>
                                <View style={styles.infoLine}>
                                    <View style={styles.infoIconContainer}>
                                        <Icon name="calendar-range" size={16} color={Colors.TEXT_SECONDARY} />
                                    </View>
                                    <Text style={styles.infoLabel}>Event Date: {item.eventDate}</Text>
                                </View>
                            </View>
                            {renderStatusBadge(item.status, item.paymentStatus)}
                        </View>

                        {/* Groom/Bride Details */}
                        {(item.brideName || item.groomName) && (
                            <View style={styles.infoLine}>
                                <View style={styles.infoIconContainer}>
                                    <Icon name="human-male-female" size={16} color={Colors.TEXT_SECONDARY} />
                                </View>
                                <Text style={styles.coupleText}>
                                    Couple: {item.groomName || 'Groom'} & {item.brideName || 'Bride'}
                                </Text>
                            </View>
                        )}

                        {/* Fee Section */}
                        {item.status === 'ACCEPTED' && item.feeAmount && (
                            <View style={styles.payBox}>
                                <Text style={styles.payLabel}>Agreed Amount</Text>
                                <Text style={styles.payAmount}>₹{item.feeAmount}</Text>

                                {item.paymentStatus === 'UNPAID' && (
                                    <TouchableOpacity
                                        style={styles.payBtn}
                                        onPress={() => handleUpload(item.id)}
                                        disabled={uploading}
                                    >
                                        <Icon name="cloud-upload" size={18} color={Colors.WHITE} style={{ marginRight: 8 }} />
                                        <Text style={styles.payBtnText}>Upload Payment</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Payment Pending Msg */}
                        {item.paymentStatus === 'VERIFICATION_PENDING' && (
                            <View style={styles.infoBox}>
                                <Icon name="clock-check-outline" size={16} color="#CA8A04" style={{ marginTop: 2 }} />
                                <Text style={styles.infoText}>Payment proof uploaded. Waiting for admin confirmation.</Text>
                            </View>
                        )}

                        {item.remarks && <Text style={styles.remarks}>Admin: {item.remarks}</Text>}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 40, backgroundColor: Colors.WHITE, elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },

    card: { backgroundColor: Colors.WHITE, borderRadius: 16, padding: 16, marginBottom: 15, elevation: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    pkgName: { fontSize: 16, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    infoLine: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    infoIconContainer: { width: 24, alignItems: 'center' },
    infoLabel: { fontSize: 13, color: Colors.TEXT_SECONDARY },
    coupleText: { fontSize: 14, color: '#475569', fontStyle: 'italic', marginTop: 4 },

    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeSuccess: { backgroundColor: '#DCFCE7' },
    badgeWarning: { backgroundColor: '#FEF9C3' },
    badgeInfo: { backgroundColor: '#E0F2FE' },
    badgeError: { backgroundColor: '#FEE2E2' },
    badgeGray: { backgroundColor: '#F1F5F9' },
    badgeText: { fontSize: 11, fontWeight: 'bold', color: '#334155' },

    payBox: { marginTop: 15, padding: 12, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center' },
    payLabel: { fontSize: 12, color: Colors.PRIMARY, textTransform: 'uppercase', fontWeight: 'bold' },
    payAmount: { fontSize: 24, fontWeight: 'bold', color: Colors.PRIMARY, marginVertical: 5 },
    payBtn: { flexDirection: 'row', backgroundColor: Colors.PRIMARY, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, marginTop: 10, width: '100%', justifyContent: 'center', alignItems: 'center' },
    payBtnText: { color: Colors.WHITE, fontWeight: 'bold' },

    infoBox: { flexDirection: 'row', marginTop: 10, backgroundColor: '#FEFCE8', padding: 10, borderRadius: 8, gap: 8 },
    infoText: { fontSize: 12, color: '#854D0E', flex: 1 },
    remarks: { marginTop: 10, fontSize: 12, color: Colors.TEXT_SECONDARY, fontStyle: 'italic', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },

    emptyBox: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: Colors.TEXT_MUTED }
});
