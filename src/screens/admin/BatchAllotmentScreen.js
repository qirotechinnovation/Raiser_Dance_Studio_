import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import adminService from '../../api/adminService';
import Colors from "../../theme/Colors";


export default function BatchAllotmentScreen({ navigation }) {
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [danceTypes, setDanceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [allotmentData, setAllotmentData] = useState({ batchId: '', danceTypeId: '' });
    const [feeStructure, setFeeStructure] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [stdRes, bRes, dRes, fRes] = await Promise.all([
                adminService.getNewRegistrations(),
                adminService.getBatches(),
                adminService.getDanceTypes(),
                adminService.getFeeStructure()
            ]);
            setStudents(stdRes.data);
            setBatches(bRes.data);
            setDanceTypes(dRes.data);
            setFeeStructure(fRes.data);
            if (bRes.data.length > 0) setAllotmentData(prev => ({ ...prev, batchId: bRes.data[0].id }));
            if (dRes.data.length > 0) setAllotmentData(prev => ({ ...prev, danceTypeId: dRes.data[0].id }));
        } catch (error) {
            console.error("Failed to fetch data:", error);
            Alert.alert("Error", "Could not load registration data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAllot = async () => {
        if (!selectedStudent || !allotmentData.batchId || !allotmentData.danceTypeId) {
            Alert.alert("Error", "Please select a student and both batch/dance type.");
            return;
        }

        try {
            const payload = {
                ...selectedStudent,
                batch: { id: allotmentData.batchId },
                danceType: { id: allotmentData.danceTypeId },
            };
            await adminService.updateStudent(selectedStudent.id, payload);
            Alert.alert("Success", `Batch allotted to ${selectedStudent.name}`);
            setSelectedStudent(null);
            fetchData();
        } catch (error) {
            Alert.alert("Error", "Failed to allot batch.");
        }
    };

    const renderStudentCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, selectedStudent?.id === item.id && styles.selectedCard]}
            onPress={() => setSelectedStudent(item)}
        >
            <View style={styles.cardInfo}>
                <Icon name="account-clock-outline" size={24} color={Colors.PRIMARY} />
                <View style={{ marginLeft: 15 }}>
                    <Text style={styles.stdName}>{item.name}</Text>
                    <Text style={styles.stdEmail}>{item.email}</Text>
                </View>
            </View>
            <Icon name={selectedStudent?.id === item.id ? "radiobox-marked" : "radiobox-blank"} size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Registrations</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Students Waiting for Batch ({students.length})</Text>
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderStudentCard}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Icon name="checkbox-multiple-marked-circle-outline" size={60} color="#CBD5E1" />
                            <Text style={styles.emptyText}>All students have been allotted batches!</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                />

                {selectedStudent && (
                    <View style={styles.allotmentPanel}>
                        <Text style={styles.panelTitle}>Allot Batch for {selectedStudent.name}</Text>

                        {/* Fee Preview */}
                        <View style={styles.feePreview}>
                            <Icon name="cash-multiple" size={16} color="#059669" />
                            <Text style={styles.feePreviewText}>
                                Suggested Fee: {(() => {
                                    let cat = "Regular";
                                    if (selectedStudent.classType === "Private") {
                                        cat = "Private";
                                    } else if (selectedStudent.age < 12) {
                                        cat = "Kids";
                                    }
                                    const fee = feeStructure.find(f => f.category === cat && f.plan === "Monthly");
                                    return fee ? `₹${fee.amount}/mo (${cat})` : "N/A";
                                })()}
                            </Text>
                        </View>

                        <View style={styles.pickerWrapper}>
                            <Text style={styles.pickerLabel}>Select Batch</Text>
                            <Picker
                                selectedValue={allotmentData.batchId}
                                onValueChange={(v) => setAllotmentData({ ...allotmentData, batchId: v })}
                                style={{ color: Colors.TEXT_PRIMARY }}
                            >
                                {batches.map(b => (
                                    <Picker.Item key={b.id} label={`${b.name} (${b.timing})`} value={b.id} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.pickerWrapper}>
                            <Text style={styles.pickerLabel}>Select Dance Type</Text>
                            <Picker
                                selectedValue={allotmentData.danceTypeId}
                                onValueChange={(v) => setAllotmentData({ ...allotmentData, danceTypeId: v })}
                                style={{ color: Colors.TEXT_PRIMARY }}
                            >
                                {danceTypes.map(d => (
                                    <Picker.Item key={d.id} label={d.name} value={d.id} />
                                ))}
                            </Picker>
                        </View>

                        <TouchableOpacity style={styles.allotBtn} onPress={handleAllot}>
                            <Text style={styles.allotBtnText}>CONFIRM ALLOTMENT</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, backgroundColor: Colors.WHITE, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    container: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 14, fontWeight: "bold", color: Colors.TEXT_SECONDARY, textTransform: "uppercase", marginBottom: 15 },
    card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Colors.WHITE, padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2 },
    selectedCard: { borderWidth: 2, borderColor: Colors.PRIMARY },
    cardInfo: { flexDirection: "row", alignItems: "center" },
    stdName: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    stdEmail: { fontSize: 12, color: Colors.TEXT_SECONDARY },
    allotmentPanel: { backgroundColor: Colors.WHITE, padding: 20, borderRadius: 24, elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, position: 'absolute', bottom: 0, left: 0, right: 0 },
    panelTitle: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 15 },
    pickerWrapper: { backgroundColor: Colors.BG_CONTENT, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER, marginBottom: 10 },
    pickerLabel: { position: 'absolute', top: 5, left: 15, fontSize: 10, color: Colors.TEXT_MUTED, zIndex: 1 },
    allotBtn: { backgroundColor: Colors.PRIMARY, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center", marginTop: 10 },
    allotBtnText: { color: Colors.WHITE, fontWeight: "bold", fontSize: 14, letterSpacing: 1 },
    feePreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 8, borderRadius: 8, marginBottom: 15 },
    feePreviewText: { fontSize: 13, color: '#059669', fontWeight: 'bold', marginLeft: 8 },
    emptyBox: { alignItems: "center", marginTop: 50 },
    emptyText: { marginTop: 15, color: Colors.TEXT_MUTED, textAlign: "center" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" }
});
