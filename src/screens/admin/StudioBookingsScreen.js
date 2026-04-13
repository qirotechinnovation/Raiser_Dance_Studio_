import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Image, Modal, TextInput, Alert, Linking, ScrollView } from 'react-native';
import studioService from '../../api/studioService';
import API from '../../api/axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CustomDateTimePicker from '../../components/CustomDateTimePicker';
import Colors from "../../theme/Colors";


const StudioBookingsScreen = ({ navigation }) => {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // View/Action Modal
    const [selectedBooking, setSelectedBooking] = React.useState(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [remarks, setRemarks] = React.useState('');

    // Picker State
    const [pickerVisible, setPickerVisible] = React.useState(false);
    const [pickerMode, setPickerMode] = React.useState('date');

    // CRUD Modal
    const [crudModalVisible, setCrudModalVisible] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState({
        id: null, fullName: '', mobile: '', bookingDate: '', timeSlot: '', purpose: '', message: '', status: 'ACCEPTED', amount: ''
    });

    React.useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const res = await studioService.getAllBookings();
            setBookings(res.data || []);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    const updateStatus = async (status) => {
        try {
            await studioService.updateStatus(selectedBooking.id, status, remarks);
            setModalVisible(false);
            loadBookings();
            Alert.alert("Success", `Booking marked as ${status}`);
        } catch (e) { Alert.alert("Error"); }
    };

    // CRUD Handlers
    const openAddModal = () => {
        setFormData({ id: null, fullName: '', mobile: '', bookingDate: '', timeSlot: '', purpose: '', message: '', status: 'ACCEPTED', amount: '' });
        setIsEditing(false);
        setCrudModalVisible(true);
    };

    const openEditModal = (item) => {
        setFormData({ ...item, amount: item.amount ? item.amount.toString() : '' });
        setIsEditing(true);
        setModalVisible(false); // Close view modal
        setCrudModalVisible(true);
    };

    const handleDelete = async (id) => {
        Alert.alert("Delete", "Are you sure you want to delete this booking?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await studioService.deleteBooking(id);
                        setModalVisible(false);
                        loadBookings();
                    } catch (e) { Alert.alert("Error", "Failed to delete"); }
                }
            }
        ]);
    };

    const handleSave = async () => {
        if (!formData.fullName || !formData.bookingDate || !formData.timeSlot) {
            Alert.alert("Error", "Name, Date and Time Slot are required");
            return;
        }

        try {
            if (isEditing) {
                await studioService.adminUpdateBooking(formData.id, formData);
                Alert.alert("Success", "Booking updated");
            } else {
                await studioService.adminCreateBooking(formData);
                Alert.alert("Success", "Booking created");
            }
            setCrudModalVisible(false);
            loadBookings();
        } catch (e) {
            Alert.alert("Error", "Operation failed");
        }
    };

    const openActionModal = (item) => {
        setSelectedBooking(item);
        setRemarks(item.adminRemarks || '');
        setModalVisible(true);
    };

    const renderItem = ({ item }) => {
        const isPending = item.status === 'PENDING';
        return (
            <TouchableOpacity style={styles.card} onPress={() => openActionModal(item)}>
                <View style={styles.row}>
                    <View>
                        <Text style={styles.name}>{item.fullName}</Text>
                        <Text style={styles.sub}>{item.bookingDate} | {item.timeSlot}</Text>
                        <Text style={styles.purpose}>{item.purpose}</Text>
                        {item.amount && <Text style={{ fontWeight: 'bold', color: '#059669', marginTop: 2 }}>₹{item.amount}</Text>}
                    </View>
                    <View style={[styles.status,
                    { backgroundColor: item.status === 'CONFIRMED' ? '#DEF7EC' : (item.status === 'PENDING' ? '#FEECDC' : '#E1EFFE') }]}>
                        <Text style={styles.statusText}>{item.status.replace(/_/g, ' ')}</Text>
                    </View>
                </View>
                {isPending && (
                    <View style={styles.attnBadge}>
                        <Icon name="alert-circle-outline" size={14} color="#C05621" />
                        <Text style={styles.attnText}>Approval Required</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color="#000" /></TouchableOpacity>
                <Text style={styles.title}>Studio Requests</Text>
                <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={openAddModal}>
                    <Icon name="plus-circle" size={28} color={Colors.PRIMARY} />
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" style={{ marginTop: 50 }} /> :
                <FlatList
                    data={bookings}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50 }}>No bookings found</Text>}
                />}

            {/* View/Action Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.modalTitle}>Booking #{selectedBooking?.id}</Text>
                            <View style={{ flexDirection: 'row', gap: 15 }}>
                                <TouchableOpacity onPress={() => openEditModal(selectedBooking)}>
                                    <Icon name="pencil" size={24} color="#2563EB" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(selectedBooking.id)}>
                                    <Icon name="trash-can" size={24} color="#E53E3E" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.detailBox}>
                            <Text style={styles.label}>Amount:</Text>
                            <Text style={[styles.val, { color: '#059669', fontWeight: 'bold' }]}>{selectedBooking?.amount ? `₹${selectedBooking.amount}` : 'Not Set'}</Text>

                            <Text style={styles.label}>Message:</Text>
                            <Text style={styles.val}>{selectedBooking?.message || 'None'}</Text>

                            <Text style={styles.label}>Mobile:</Text>
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${selectedBooking?.mobile}`)}>
                                <Text style={[styles.val, { color: 'blue' }]}>{selectedBooking?.mobile}</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedBooking?.paymentScreenshot && (
                            <View style={styles.imgBox}>
                                <Text style={styles.label}>Payment Proof:</Text>
                                <Image
                                    source={{ uri: `${API.defaults.baseURL}uploads/studio/payments/${selectedBooking.paymentScreenshot}` }}
                                    style={styles.proofImg}
                                />
                            </View>
                        )}

                        <Text style={styles.label}>Admin Remarks:</Text>
                        <TextInput style={styles.input} value={remarks} onChangeText={setRemarks} placeholder="Add notes..." />

                        <View style={styles.actions}>
                            {selectedBooking?.status === 'PENDING' && (
                                <TouchableOpacity style={[styles.btn, { backgroundColor: '#3182CE' }]} onPress={() => updateStatus('ACCEPTED')}>
                                    <Text style={styles.btnText}>Accept Request</Text>
                                </TouchableOpacity>
                            )}

                            {(selectedBooking?.status === 'PAYMENT_PENDING_VERIFICATION' || selectedBooking?.status === 'ACCEPTED') && (
                                <TouchableOpacity style={[styles.btn, { backgroundColor: '#38A169' }]} onPress={() => updateStatus('CONFIRMED')}>
                                    <Text style={styles.btnText}>Confirm Payment & Book</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={[styles.btn, { backgroundColor: '#E53E3E' }]} onPress={() => updateStatus('REJECTED')}>
                                <Text style={styles.btnText}>Reject</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                            <Text>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Create/Edit Modal */}
            <Modal visible={crudModalVisible} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            <Text style={styles.modalTitle}>{isEditing ? 'Edit Booking' : 'New Booking'}</Text>

                            <Text style={styles.label}>Full Name</Text>
                            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#A0AEC0" value={formData.fullName} onChangeText={t => setFormData({ ...formData, fullName: t })} />

                            <Text style={styles.label}>Mobile</Text>
                            <TextInput style={styles.input} placeholder="Mobile" placeholderTextColor="#A0AEC0" keyboardType="phone-pad" value={formData.mobile} onChangeText={t => setFormData({ ...formData, mobile: t })} />

                            <Text style={styles.label}>Rent Amount (₹)</Text>
                            <TextInput style={styles.input} placeholder="Rent Amount" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={formData.amount} onChangeText={t => setFormData({ ...formData, amount: t })} />

                            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                            <TouchableOpacity onPress={() => { setPickerMode('date'); setPickerVisible(true); }}>
                                <View pointerEvents="none">
                                    <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#A0AEC0" value={formData.bookingDate} editable={false} />
                                    <Icon name="calendar" size={20} color="#666" style={{ position: 'absolute', right: 15, top: 18 }} />
                                </View>
                            </TouchableOpacity>

                            <Text style={styles.label}>Time Slot</Text>
                            <TouchableOpacity onPress={() => { setPickerMode('time'); setPickerVisible(true); }}>
                                <View pointerEvents="none">
                                    <TextInput style={styles.input} placeholder="e.g. 14:00 - 16:00" placeholderTextColor="#A0AEC0" value={formData.timeSlot} editable={false} />
                                    <Icon name="clock-outline" size={20} color="#666" style={{ position: 'absolute', right: 15, top: 18 }} />
                                </View>
                            </TouchableOpacity>

                            <Text style={styles.label}>Purpose</Text>
                            <TextInput style={styles.input} placeholder="Purpose" placeholderTextColor="#A0AEC0" value={formData.purpose} onChangeText={t => setFormData({ ...formData, purpose: t })} />

                            <Text style={styles.label}>Status</Text>
                            <TextInput style={styles.input} placeholder="ACCEPTED, CONFIRMED" placeholderTextColor="#A0AEC0" value={formData.status} onChangeText={t => setFormData({ ...formData, status: t })} />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <TouchableOpacity style={[styles.btn, { backgroundColor: '#718096', flex: 1, marginRight: 5 }]} onPress={() => setCrudModalVisible(false)}>
                                    <Text style={styles.btnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.PRIMARY, flex: 1, marginLeft: 5 }]} onPress={handleSave}>
                                    <Text style={styles.btnText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>

                    <CustomDateTimePicker
                        visible={pickerVisible}
                        mode={pickerMode}
                        onClose={() => setPickerVisible(false)}
                        onSelect={(val) => {
                            if (pickerMode === 'date') setFormData({ ...formData, bookingDate: val });
                            else setFormData({ ...formData, timeSlot: val });
                        }}
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.WHITE },
    title: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
    card: { backgroundColor: Colors.WHITE, padding: 15, borderRadius: 12, marginBottom: 12, elevation: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    name: { fontWeight: 'bold', fontSize: 16, color: '#2D3748' },
    sub: { fontSize: 12, color: '#718096', marginTop: 2 },
    purpose: { fontSize: 12, color: '#4A5568', marginTop: 4, fontStyle: 'italic' },
    status: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    attnBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#FFFAF0', padding: 5, borderRadius: 4, alignSelf: 'flex-start' },
    attnText: { fontSize: 10, color: '#C05621', marginLeft: 4 },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.WHITE, borderRadius: 15, padding: 20, maxHeight: '90%' }, // Inreased height for CRUD form
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    detailBox: { backgroundColor: '#F7FAFC', padding: 10, borderRadius: 8, marginBottom: 15 },
    label: { fontSize: 12, color: '#718096', fontWeight: 'bold', marginTop: 5 },
    val: { fontSize: 14, color: '#2D3748', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 8, padding: 10, marginVertical: 5, color: '#000', backgroundColor: Colors.WHITE }, // Fixed Color
    imgBox: { marginBottom: 15 },
    proofImg: { width: '100%', height: 200, resizeMode: 'contain', backgroundColor: '#EDF2F7', borderRadius: 8, marginTop: 5 },
    actions: { gap: 10 },
    btn: { padding: 12, borderRadius: 8, alignItems: 'center' },
    btnText: { color: Colors.WHITE, fontWeight: 'bold' },
    closeBtn: { alignItems: 'center', marginTop: 15, padding: 10 }
});

export default StudioBookingsScreen;
