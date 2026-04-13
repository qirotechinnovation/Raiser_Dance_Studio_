import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import studentService from '../../api/studentService';
import studioService from '../../api/studioService';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from "../../theme/Colors";


const StudioMyBookings = ({ navigation }) => {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const id = await AsyncStorage.getItem("studentId");
            if (id) {
                const res = await studioService.getMyBookings(id);
                setData(res.data || []);
            }
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    const handleUploadPayment = (bookingId) => {
        launchImageLibrary({ mediaType: 'photo' }, async (response) => {
            if (response.assets && response.assets.length > 0) {
                const asset = response.assets[0];
                const formData = new FormData();
                formData.append('file', {
                    uri: asset.uri, type: asset.type, name: asset.fileName || 'pay.jpg'
                });

                try {
                    await studioService.uploadPayment(bookingId, formData);
                    Alert.alert("Uploaded", "Payment proof uploaded. Wait for verification.");
                    loadData();
                } catch (e) {
                    Alert.alert("Error", "Upload failed");
                }
            }
        });
    };

    const renderItem = ({ item }) => {
        const isAccepted = item.status === 'ACCEPTED';
        const isPaymentPending = item.status === 'PAYMENT_PENDING' || item.status === 'ACCEPTED';

        const getStatusColor = (s) => {
            if (s === 'CONFIRMED') return '#10B981';
            if (s === 'PENDING') return '#F59E0B';
            if (s === 'REJECTED') return Colors.ERROR;
            return '#3B82F6';
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.date}>{item.bookingDate} @ {item.timeSlot}</Text>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>
                <Text style={styles.purpose}>{item.purpose}</Text>

                {item.amount && (
                    <View style={styles.amountBox}>
                        <Icon name="cash" size={16} color="#059669" />
                        <Text style={styles.amountLabel}>Booking Amount:</Text>
                        <Text style={styles.amountValue}>₹{item.amount}</Text>
                    </View>
                )}

                {item.adminRemarks && <Text style={styles.remarks}>Admin: {item.adminRemarks}</Text>}

                {isAccepted && (
                    <TouchableOpacity style={styles.uploadBtn} onPress={() => handleUploadPayment(item.id)}>
                        <Text style={styles.uploadText}>Upload Payment Proof</Text>
                    </TouchableOpacity>
                )}

                {item.status === 'PAYMENT_PENDING_VERIFICATION' && (
                    <Text style={styles.info}>Payment uploaded, waiting for verification...</Text>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} /></TouchableOpacity>
                <Text style={styles.title}>My Studio Bookings</Text>
            </View>

            {loading ? <ActivityIndicator size="large" style={{ marginTop: 50 }} /> :
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>No bookings yet</Text>}
                />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.WHITE },
    title: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, color: Colors.PRIMARY_DARK },
    card: { backgroundColor: Colors.WHITE, padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    date: { fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    purpose: { color: Colors.TEXT_SECONDARY },
    amountBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        gap: 6
    },
    amountLabel: { fontSize: 12, color: '#166534', fontWeight: '600' },
    amountValue: { fontSize: 16, color: '#059669', fontWeight: 'bold', marginLeft: 'auto' },
    remarks: { marginTop: 10, fontSize: 12, color: Colors.ERROR, fontStyle: 'italic' },
    uploadBtn: { marginTop: 15, backgroundColor: '#2563EB', padding: 10, borderRadius: 8, alignItems: 'center' },
    uploadText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 12 },
    info: { marginTop: 10, fontSize: 12, color: '#F59E0B' }
});

export default StudioMyBookings;
