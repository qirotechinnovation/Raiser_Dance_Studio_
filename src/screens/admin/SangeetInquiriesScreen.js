import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import adminService from '../../api/adminService';
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";


export default function SangeetInquiriesScreen({ navigation }) {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fee Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [feeAmount, setFeeAmount] = useState("");

    // Image Modal
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const res = await adminService.getSangeetInquiries();
            setInquiries(res.data || []);
        } catch (e) {
            console.error("Fetch inquiries error", e);
            Alert.alert("Error", "Could not load inquiries");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchInquiries();
    }, []);

    const openAcceptModal = (inquiry) => {
        setSelectedInquiry(inquiry);
        setFeeAmount(inquiry.packageOfInterest?.price ? inquiry.packageOfInterest.price.toString() : "");
        setModalVisible(true);
    };

    const confirmAccept = async () => {
        if (!feeAmount) {
            Alert.alert("Error", "Please enter agreed fee amount.");
            return;
        }

        try {
            await adminService.updateSangeetInquiry(selectedInquiry.id, {
                ...selectedInquiry,
                status: "ACCEPTED",
                feeAmount: parseFloat(feeAmount),
                packageOfInterest: selectedInquiry.packageOfInterest
            });
            setModalVisible(false);
            Alert.alert("Success", "Inquiry accepted with fee: " + feeAmount);
            fetchInquiries();
        } catch (e) {
            Alert.alert("Error", "Failed to accept inquiry.");
        }
    };

    const viewReceipt = (filename) => {
        setSelectedImage(filename);
        setImageModalVisible(true);
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

    const handleDelete = async (id) => {
        Alert.alert("Delete Inquiry", "Are you sure you want to remove this inquiry?", [
            { text: "Cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await adminService.deleteSangeetInquiry(id);
                        fetchInquiries();
                    } catch (e) {
                        Alert.alert("Error", "Failed to delete inquiry.");
                    }
                }
            }
        ]);
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
                <View>
                    <Text style={styles.clientName}>{item.clientName}</Text>
                    <Text style={styles.mobile}>{item.mobile}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'BOOKED' ? styles.statusBooked : (item.status === 'ACCEPTED' ? styles.statusAccepted : (item.status === 'DECLINED' ? styles.statusDeclined : styles.statusPending))]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                    <Icon name="calendar-heart" size={16} color={Colors.TEXT_SECONDARY} />
                </View>
                <Text style={styles.infoText}>Event Date: {item.eventDate}</Text>
            </View>
            <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                    <Icon name="package-variant-closed" size={16} color={Colors.TEXT_SECONDARY} />
                </View>
                <Text style={styles.infoText}>Package: {item.packageOfInterest?.name || 'Custom'}</Text>
            </View>
            <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                    <Icon name="cash" size={16} color={Colors.TEXT_SECONDARY} />
                </View>
                <Text style={styles.infoText}>Payment: {item.paymentStatus}</Text>
            </View>

            {(item.brideName || item.groomName) && (
                <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer} />
                    <Text style={[styles.infoText, { fontStyle: 'italic', marginBottom: 5 }]}>
                        Couple: {item.groomName} & {item.brideName}
                    </Text>
                </View>
            )}

            {item.feeAmount && (
                <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                        <Icon name="currency-inr" size={16} color={Colors.PRIMARY} />
                    </View>
                    <Text style={[styles.infoText, { fontWeight: 'bold' }]}>Fee: ₹{item.feeAmount}</Text>
                </View>
            )}

            {item.paymentProof && (
                <TouchableOpacity style={styles.proofBtn} onPress={() => viewReceipt(item.paymentProof)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <Icon name="image" size={16} color="#4F46E5" />
                        <Text style={styles.proofText}>View Payment Receipt</Text>
                    </View>
                </TouchableOpacity>
            )}

            {item.status === 'PENDING' && (
                <View style={styles.actions}>
                    <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => openAcceptModal(item)}>
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

            {item.paymentStatus === 'VERIFICATION_PENDING' && (
                <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={() => handleConfirmPayment(item.id)}>
                    <Text style={styles.btnText}>Verify & Confirm Payment</Text>
                </TouchableOpacity>
            )}

            {item.status !== 'PENDING' && (
                <TouchableOpacity style={[styles.btn, styles.deleteSmallBtn]} onPress={() => handleDelete(item.id)}>
                    <Icon name="trash-can-outline" size={16} color={Colors.ERROR} />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <BaseScreen 
            title="Choreo Leads" 
            loading={loading}
            refreshing={refreshing}
            onRefresh={onRefresh}
            useGradient={true}
        >
            <View style={{ padding: 20 }}>
                <FlatList
                    data={inquiries}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderInquiry}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={styles.empty}>No wedding inquiries yet</Text>}
                />
            </View>

            {/* Fee Modal */}
            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Accept Inquiry</Text>
                        <Text style={styles.label}>Set Agreed Fee Amount (₹)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={feeAmount}
                            onChangeText={setFeeAmount}
                            placeholder="Enter amount"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton} onPress={confirmAccept}>
                                <Text style={styles.submitButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Image Modal */}
            <Modal visible={imageModalVisible} transparent animationType="slide" onRequestClose={() => setImageModalVisible(false)}>
                <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center' }}>
                    <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }} onPress={() => setImageModalVisible(false)}>
                        <Icon name="close" size={30} color={Colors.WHITE} />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: `${adminService.BASE_URL}uploads/sangeet/${selectedImage}` }}
                        style={{ width: '100%', height: '80%', resizeMode: 'contain' }}
                    />
                </View>
            </Modal>
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20, marginBottom: 15, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
    clientName: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    mobile: { fontSize: 14, color: Colors.TEXT_SECONDARY, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusPending: { backgroundColor: '#FEF3C7' },
    statusAccepted: { backgroundColor: '#D1FAE5' },
    statusDeclined: { backgroundColor: '#FEE2E2' },
    statusBooked: { backgroundColor: '#DBEAFE' },
    statusText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    infoIconContainer: { width: 26, alignItems: 'center' },
    infoText: { fontSize: 14, color: Colors.TEXT_SECONDARY },
    actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
    acceptBtn: { backgroundColor: '#10B981' },
    declineBtn: { backgroundColor: Colors.ERROR },
    confirmBtn: { backgroundColor: Colors.PRIMARY, marginTop: 15 },
    btnText: { color: Colors.WHITE, fontWeight: 'bold' },
    deleteSmallBtn: {
        backgroundColor: '#FEF2F2',
        marginTop: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        borderRadius: 20
    },
    empty: { textAlign: "center", marginTop: 50, color: Colors.TEXT_MUTED },
    proofBtn: { marginTop: 8 },
    proofText: { color: '#4F46E5', marginLeft: 5, fontWeight: '600' },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContent: { width: "85%", backgroundColor: Colors.WHITE, borderRadius: 20, padding: 25, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 15 },
    label: { fontSize: 14, fontWeight: "600", color: Colors.TEXT_SECONDARY, marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: Colors.BORDER,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: Colors.TEXT_PRIMARY,
        backgroundColor: Colors.BG_CONTENT,
        marginBottom: 20
    },
    modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
    cancelButton: { paddingVertical: 10, paddingHorizontal: 15 },
    cancelButtonText: { color: Colors.TEXT_SECONDARY, fontWeight: "bold" },
    submitButton: { backgroundColor: Colors.PRIMARY, paddingVertical: 10, paddingHorizontal: 25, borderRadius: 12 },
    submitButtonText: { color: Colors.WHITE, fontWeight: "bold" },
});
