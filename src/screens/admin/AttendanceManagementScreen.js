import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";
import Footer from "../../components/Footer";

export default function AttendanceManagementScreen({ navigation }) {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [students, setStudents] = useState([]);
    const [history, setHistory] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [mode, setMode] = useState("mark");
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await adminService.getBatches();
            setBatches(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBatch = async (batch) => {
        setLoading(true);
        try {
            const stuRes = await adminService.getStudentsByBatch(batch.id);
            setStudents(stuRes.data);
            setSelectedBatch(batch);

            if (mode === "mark") {
                const today = new Date().toISOString().split('T')[0];
                const attRes = await adminService.getAttendanceByBatchAndDate(batch.id, today);

                const initial = {};
                stuRes.data.forEach(s => {
                    const existing = attRes.data.find(a => a.student?.id === s.id);
                    initial[s.id] = existing ? existing.present : false;
                });
                setAttendance(initial);
            } else {
                fetchHistory(batch.id, selectedYear, selectedMonth);
            }
        } catch (error) {
            Alert.alert("Error", "Could not load data for this batch");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (batchId, year, month) => {
        setLoading(true);
        try {
            const res = await adminService.getAttendanceByBatchAndMonth(batchId, year, month);
            setHistory(res.data);
        } catch (e) {
            Alert.alert("Error", "Could not load history");
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (id) => {
        setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSave = async () => {
        try {
            const records = students.map(s => ({
                student: { id: s.id },
                date: new Date().toISOString().split('T')[0],
                present: attendance[s.id]
            }));
            await adminService.saveAttendance(records);
            Alert.alert("Success", "Attendance saved for " + selectedBatch.name);
            setSelectedBatch(null);
        } catch (error) {
            Alert.alert("Error", "Failed to save attendance");
        }
    };

    const handleDeleteAttendance = async (id) => {
        Alert.alert("Delete", "Remove this record?", [
            { text: "Cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await adminService.deleteAttendance(id);
                        setHistory(prev => prev.filter(h => h.id !== id));
                    } catch (e) {
                        Alert.alert("Error", "Could not delete record");
                    }
                }
            }
        ]);
    };

    const handleToggleStatus = async (item) => {
        try {
            const updated = { ...item, present: !item.present };
            await adminService.updateAttendance(item.id, updated);
            setHistory(prev => prev.map(h => h.id === item.id ? updated : h));
        } catch (e) {
            Alert.alert("Error", "Could not update status");
        }
    };

    if (!selectedBatch) {
        return (
            <BaseScreen 
                title="Select Batch" 
                loading={loading}
                isScrollable={false}
            >
                <View style={styles.modeToggle}>
                    <TouchableOpacity
                        style={[styles.modeBtn, mode === "mark" && styles.modeBtnActive]}
                        onPress={() => setMode("mark")}
                    >
                        <Text style={[styles.modeText, mode === "mark" && styles.modeTextActive]}>Mark Today</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeBtn, mode === "history" && styles.modeBtnActive]}
                        onPress={() => setMode("history")}
                    >
                        <Text style={[styles.modeText, mode === "history" && styles.modeTextActive]}>History</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={batches}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.batchCard} onPress={() => handleSelectBatch(item)}>
                            <View style={styles.batchIcon}>
                                <Icon name="account-group" size={24} color={Colors.TEXT_SECONDARY} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={styles.batchName}>{item.name}</Text>
                                <Text style={styles.batchTiming}>{item.timing}</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color="#CBD5E1" />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No active batches found</Text>}
                    ListFooterComponent={<Footer />}
                />
            </BaseScreen>
        );
    }

    return (
        <BaseScreen 
            title={selectedBatch.name} 
            loading={loading}
            isScrollable={false}
            backAction={() => setSelectedBatch(null)}
            actions={mode === "mark" ? [{ icon: 'check', onPress: handleSave, color: Colors.PRIMARY, size: 28 }] : []}
        >
            {mode === "history" && (
                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Month:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                            <TouchableOpacity
                                key={m}
                                style={[styles.monthPill, selectedMonth === m && styles.monthPillActive]}
                                onPress={() => {
                                    setSelectedMonth(m);
                                    fetchHistory(selectedBatch.id, selectedYear, m);
                                }}
                            >
                                <Text style={[styles.monthPillText, selectedMonth === m && styles.monthPillTextActive]}>
                                    {new Date(0, m - 1).toLocaleString('default', { month: 'short' })}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {mode === "mark" ? (
                <FlatList
                    data={students}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.studentRow}>
                            <Text style={styles.studentNameText}>{item.name}</Text>
                            <TouchableOpacity
                                style={[styles.statusToggle, { backgroundColor: attendance[item.id] ? "#F0FDF4" : "#FEF2F2" }]}
                                onPress={() => toggleAttendance(item.id)}
                            >
                                <Icon
                                    name={attendance[item.id] ? "check-circle" : "close-circle"}
                                    size={24}
                                    color={attendance[item.id] ? "#16A34A" : Colors.ERROR}
                                />
                                <Text style={[styles.statusLabel, { color: attendance[item.id] ? "#16A34A" : Colors.ERROR }]}>
                                    {attendance[item.id] ? "Present" : "Absent"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListFooterComponent={<Footer />}
                />
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.historyRow}>
                            <View style={styles.historyInfo}>
                                <Text style={styles.historyDateText}>{item.date}</Text>
                                <Text style={styles.historyNameText}>{item.student?.name}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.historyStatus, { backgroundColor: item.present ? "#DCFCE7" : "#FEE2E2" }]}
                                onPress={() => handleToggleStatus(item)}
                            >
                                <Text style={[styles.statusText, { color: item.present ? "#15803D" : "#B91C1C" }]}>
                                    {item.present ? "PRESENT" : "ABSENT"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => handleDeleteAttendance(item.id)}>
                                <Icon name="trash-can-outline" size={20} color={Colors.ERROR} />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No attendance records found for this batch</Text>}
                    ListFooterComponent={<Footer />}
                />
            )}
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    modeToggle: { flexDirection: "row", backgroundColor: "#F1F5F9", marginHorizontal: 20, marginTop: 15, borderRadius: 15, padding: 4 },
    modeBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
    modeBtnActive: { backgroundColor: Colors.WHITE, elevation: 2 },
    modeText: { fontSize: 14, fontWeight: "700", color: Colors.TEXT_SECONDARY },
    modeTextActive: { color: Colors.PRIMARY },
    batchCard: { backgroundColor: Colors.WHITE, padding: 18, borderRadius: 15, marginBottom: 12, flexDirection: "row", alignItems: "center", elevation: 1 },
    batchIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
    batchName: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    batchTiming: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginTop: 2 },
    studentRow: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    studentNameText: { flex: 1, fontSize: 16, color: Colors.TEXT_PRIMARY, fontWeight: "500" },
    statusToggle: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    statusLabel: { fontSize: 12, fontWeight: "bold", marginLeft: 8 },
    historyRow: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    historyInfo: { flex: 1 },
    historyDateText: { fontSize: 12, color: Colors.TEXT_SECONDARY, fontWeight: "bold" },
    historyNameText: { fontSize: 16, color: Colors.TEXT_PRIMARY, marginTop: 2, fontWeight: "500" },
    historyStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: "bold" },
    empty: { textAlign: "center", marginTop: 50, color: Colors.TEXT_MUTED },
    filterContainer: { padding: 15, backgroundColor: Colors.BG_CONTENT, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    filterLabel: { fontSize: 12, fontWeight: "bold", color: Colors.TEXT_SECONDARY, marginBottom: 10, textTransform: "uppercase" },
    filterRow: { flexDirection: "row", gap: 8 },
    monthPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.WHITE, borderWidth: 1, borderColor: Colors.BORDER },
    monthPillActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
    monthPillText: { fontSize: 12, color: Colors.TEXT_SECONDARY, fontWeight: "600" },
    monthPillTextActive: { color: Colors.WHITE }
});
