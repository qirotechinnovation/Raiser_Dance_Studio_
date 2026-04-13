import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import adminService from '../../api/adminService';
import Colors from "../../theme/Colors";


export default function AdminSangeetInquiryScreen({ navigation }) {
    const [inquiries, setInquiries] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInquiries = async () => {
        try {
            const res = await adminService.getSangeetInquiries();
            setInquiries(res.data || []);
        } catch (e) {
            console.error("Fetch inquiries error", e);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchInquiries().then(() => setRefreshing(false));
    }, []);

    const handleAccept = async (id) => {
        try {
            await adminService.acceptSangeetInquiry(id);
            Alert.alert("Success", "Inquiry accepted.");
            fetchInquiries();
        } catch (e) {
            Alert.alert("Error", "Failed to accept inquiry.");
        }
    };

    const handleDecline = async (id) => {
        try {
            await adminService.declineSangeetInquiry(id);
            Alert.alert("Success", "Inquiry declined.");
            fetchInquiries();
        } catch (e) {
            Alert.alert("Error", "Failed to decline inquiry.");
        }
    };

    const handleConfirmPayment = async (id) => {
        Alert.alert(
            "Confirm Payment",
            "Has the first payment been received? This will create an event and add the student as a participant.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Paid",
                    onPress: async () => {
                        try {
                            await adminService.confirmSangeetPayment(id);
                            Alert.alert("Success", "Payment confirmed and event created!");
                            fetchInquiries();
                        } catch (e) {
                            Alert.alert("Error", "Failed to confirm payment.");
                        }
                    }
                }
            ]
        );
    };

    const renderInquiry = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.clientName}>{item.clientName}</Text>
                <View style={[styles.statusBadge, item.status === 'BOOKED' ? styles.statusBooked : (item.status === 'ACCEPTED' ? styles.statusAccepted : (item.status === 'DECLINED' ? styles.statusDeclined : styles.statusPending))]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <Icon name="phone" size={16} color="#666" />
                <Text style={styles.infoText}>{item.mobile}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="calendar" size={16} color="#666" />
                <Text style={styles.infoText}>Event Date: {item.eventDate}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="package-variant-closed" size={16} color="#666" />
                <Text style={styles.infoText}>Package: {item.packageOfInterest?.name || 'Custom'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="cash" size={16} color="#666" />
                <Text style={styles.infoText}>Payment: {item.paymentStatus}</Text>
            </View>

            {item.status === 'PENDING' && (
                <View style={styles.actions}>
                    <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => handleAccept(item.id)}>
                        <Text style={styles.btnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.declineBtn]} onPress={() => handleDecline(item.id)}>
                        <Text style={styles.btnText}>Decline</Text>
                    </TouchableOpacity>
                </View>
            )}

            {item.status === 'ACCEPTED' && item.paymentStatus === 'UNPAID' && (
                <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={() => handleConfirmPayment(item.id)}>
                    <Text style={styles.btnText}>Confirm First Payment</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={30} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wedding Inquiries</Text>
                <View style={{ width: 30 }} />
            </View>

            <FlatList
                data={inquiries}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderInquiry}
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No inquiries found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF2' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: Colors.WHITE, elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
    card: { backgroundColor: Colors.WHITE, borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    clientName: { fontSize: 16, fontWeight: 'bold', color: '#111' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusPending: { backgroundColor: '#FEF3C7' },
    statusAccepted: { backgroundColor: '#D1FAE5' },
    statusDeclined: { backgroundColor: '#FEE2E2' },
    statusBooked: { backgroundColor: '#DBEAFE' },
    statusText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    infoText: { marginLeft: 10, fontSize: 14, color: '#666' },
    actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    acceptBtn: { backgroundColor: '#10B981' },
    declineBtn: { backgroundColor: Colors.ERROR },
    confirmBtn: { backgroundColor: '#C2185B', marginTop: 15 },
    btnText: { color: Colors.WHITE, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
});
