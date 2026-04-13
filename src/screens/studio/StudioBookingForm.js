import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import studioService from '../../api/studioService';
import studentService from '../../api/studentService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ScreenHeader from '../../components/ScreenHeader';
import CustomDateTimePicker from '../../components/CustomDateTimePicker';
import Colors from "../../theme/Colors";


const StudioBookingForm = ({ navigation }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        purpose: '',
        message: '',
        bookingDate: '', // YYYY-MM-DD
        timeSlot: '', // HH:MM
    });
    const [submitting, setSubmitting] = useState(false);

    // Picker State
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerMode, setPickerMode] = useState('date');

    // Auto-fill student data on mount
    React.useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const id = await AsyncStorage.getItem("studentId");
            if (id) {
                const res = await studentService.getProfile(id);
                if (res.data) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: res.data.name || '',
                        mobile: res.data.mobile || '',
                    }));
                }
            }
        } catch (e) { console.log(e); }
    };

    const handleSubmit = async () => {
        // Basic validation
        if (!formData.fullName || !formData.mobile || !formData.bookingDate || !formData.timeSlot) {
            Alert.alert("Missing Fields", "Please fill all required fields marked with *");
            return;
        }

        setSubmitting(true);
        try {
            const studentId = await AsyncStorage.getItem("studentId");
            await studioService.createBooking({ ...formData, studentId });

            Alert.alert("Success", "Booking request sent! Admin will review it shortly.", [
                { text: "OK", onPress: () => navigation.navigate('StudioMyBookings') }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to submit booking. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} translucent={true} />
            <ScreenHeader title="Reserve Studio" />

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.fullName}
                        onChangeText={t => setFormData({ ...formData, fullName: t })}
                        placeholder="Ex. John Doe"
                        placeholderTextColor={Colors.TEXT_MUTED}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mobile Number *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.mobile}
                        onChangeText={t => setFormData({ ...formData, mobile: t })}
                        keyboardType="phone-pad"
                        placeholder="Ex. 9000000000"
                        placeholderTextColor={Colors.TEXT_MUTED}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Purpose *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.purpose}
                        onChangeText={t => setFormData({ ...formData, purpose: t })}
                        placeholder="Podcast, Reels, Interview, etc."
                        placeholderTextColor={Colors.TEXT_MUTED}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Date *</Text>
                        <TouchableOpacity onPress={() => { setPickerMode('date'); setPickerVisible(true); }}>
                            <View pointerEvents="none">
                                <TextInput
                                    style={styles.input}
                                    value={formData.bookingDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={Colors.TEXT_MUTED}
                                    editable={false}
                                />
                                <Icon name="calendar" size={20} color={Colors.TEXT_SECONDARY} style={{ position: 'absolute', right: 15, top: 15 }} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Time Slot *</Text>
                        <TouchableOpacity onPress={() => { setPickerMode('time'); setPickerVisible(true); }}>
                            <View pointerEvents="none">
                                <TextInput
                                    style={styles.input}
                                    value={formData.timeSlot}
                                    placeholder="Select Time"
                                    placeholderTextColor={Colors.TEXT_MUTED}
                                    editable={false}
                                />
                                <Icon name="clock-outline" size={20} color={Colors.TEXT_SECONDARY} style={{ position: 'absolute', right: 15, top: 15 }} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Message / Specific Needs</Text>
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        value={formData.message}
                        onChangeText={t => setFormData({ ...formData, message: t })}
                        multiline
                        placeholder="Do you need editing? Any props?"
                        placeholderTextColor={Colors.TEXT_MUTED}
                    />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
                    {submitting ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.submitButtonText}>Submit Request</Text>}
                </TouchableOpacity>
            </ScrollView>

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
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.WHITE
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.PRIMARY_DARK, marginLeft: 15 },
    backBtn: { padding: 5 },

    content: { padding: 25 },

    inputGroup: { marginBottom: 20 },
    label: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 8 },
    input: {
        backgroundColor: Colors.WHITE, borderRadius: 12, padding: 15, color: Colors.PRIMARY_DARK, borderWidth: 1, borderColor: Colors.BORDER, fontSize: 15
    },
    row: { flexDirection: 'row' },

    submitButton: {
        backgroundColor: '#2563EB', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, elevation: 3
    },
    submitButtonText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 }
});

export default StudioBookingForm;
