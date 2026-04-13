import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


export default function ScheduleScreen({ navigation }) {
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase());
    const [schedules, setSchedules] = useState([]);
    const [allBatches, setAllBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNeedsSchedule, setShowNeedsSchedule] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchData();
        });
        return unsubscribe;
    }, [navigation, selectedDay]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schedRes, batchRes] = await Promise.all([
                adminService.getAllSchedules(),
                adminService.getBatches()
            ]);

            const batches = batchRes.data || [];
            setAllBatches(batches);

            // Filter schedules by selected day
            const filteredSched = schedRes.data.filter(s =>
                s.dayOfWeek && (s.dayOfWeek.toUpperCase() === selectedDay || s.dayOfWeek.toUpperCase().startsWith(selectedDay.substring(0, 3)))
            );

            // Also find active batches for this day that might not have custom slots
            const activeBatches = batches.filter(batch => {
                // Skip if already in custom slots
                if (filteredSched.some(s => s.batch?.id === batch.id)) return false;

                // Check if batch is scheduled for this day using improved logic
                // For direct check, we'll use a simple includes for now as we can't easily call our JAVA helper here
                const search = batch.days?.toUpperCase() || "";
                const target = selectedDay;
                const targetShort = target.substring(0, 3);

                return search.includes(target) || search.includes(targetShort);
            });

            // Merge them for a unified view
            const unified = [
                ...filteredSched.map(s => ({ ...s, type: 'SLOT' })),
                ...activeBatches.map(b => ({
                    id: `batch-${b.id}`,
                    batch: b,
                    startTime: b.startTime || b.timing?.split('-')[0]?.trim() || "TBA",
                    endTime: b.endTime || b.timing?.split('-')[1]?.trim() || "TBA",
                    activity: b.name,
                    type: 'BATCH_AUTO'
                }))
            ].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

            setSchedules(unified);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not load schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleSyncAll = async () => {
        setSyncing(true);
        try {
            await adminService.syncAllSchedules();
            Alert.alert("Success", "All schedules synchronized with batch details.");
            fetchData();
        } catch (error) {
            Alert.alert("Error", "Failed to sync schedules.");
        } finally {
            setSyncing(false);
        }
    };

    const handleEdit = (batch) => {
        navigation.navigate('AddEditBatch', { batch: batch });
    };

    const handleDeleteSlot = async (id) => {
        Alert.alert("Delete", "Remove this specific class slot?", [
            { text: "Cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await adminService.deleteScheduleSlot(id);
                        fetchData();
                    } catch (e) {
                        Alert.alert("Error", "Could not delete slot");
                    }
                }
            }
        ]);
    };

    const renderScheduleCard = ({ item }) => (
        <View style={styles.batchCard}>
            <View style={[styles.cardAccent, { backgroundColor: getDayColor(selectedDay) }]} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.batchCategory, { color: getDayColor(selectedDay) }]}>
                        {item.startTime} - {item.endTime}
                    </Text>
                    <View style={[styles.enrollmentBadge, item.batch.currentStudents >= item.batch.maxCapacity && styles.fullBadge]}>
                        <Text style={[styles.enrollmentText, item.batch.currentStudents >= item.batch.maxCapacity && styles.fullText]}>
                            {item.batch.currentStudents}/{item.batch.maxCapacity}
                        </Text>
                    </View>
                </View>

                <Text style={styles.batchTitle}>{item.activity || item.batch.name || "Class Name"}</Text>

                <View style={styles.detailRow}>
                    <Icon name="human-male-board" size={18} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>{item.batch.instructor || "Instructor"}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Icon name="map-marker-outline" size={18} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>Room {item.batch.roomNumber || 'TBA'}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Icon name="stairs" size={18} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>{item.batch.level || "All Levels"}</Text>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: getDayColor(selectedDay) }]}
                        onPress={() => navigation.navigate('StudentManagement', { batchId: item.batch.id })}
                    >
                        <Text style={styles.actionBtnText}>Students</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item.batch)}>
                        <Icon name="pencil" size={20} color={Colors.TEXT_PRIMARY} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleDeleteSlot(item.id)}>
                        <Icon name="link-off" size={20} color={Colors.ERROR} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const getDayColor = (day) => {
        const colors = {
            MONDAY: Colors.ERROR,
            TUESDAY: "#F59E0B",
            WEDNESDAY: "#10B981",
            THURSDAY: "#3B82F6",
            FRIDAY: "#8B5CF6",
            SATURDAY: "#EC4899",
            SUNDAY: "#6366F1",
            PEnding: Colors.TEXT_SECONDARY
        };
        return colors[day] || Colors.PRIMARY;
    };

    const getNeedsScheduleBatches = () => {
        // Find batches that are not in ANY schedule slot
        return allBatches.filter(batch =>
            !schedules.some(s => s.batch?.id === batch.id) &&
            // Also check all schedules just in case another day has it
            !allBatches.some(b => b.id === batch.id && schedules.some(s => s.batch?.id === b.id)) // This is a bit redundant but safe
        );
        // Correct logic: batch is un-scheduled if it has NO entries in the database for schedules
    };

    // Better logic for unscheduled batches
    const unscheduledBatches = allBatches.filter(b => {
        // We really need total schedules to be sure, or a specific endpoint
        // Let's assume 'schedules' as filtered by day isn't enough.
        // If we want to show batches with NO schedule at all, we'd need allSchedules unfiltered.
        return true; // placeholder
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="chevron-left" size={32} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Weekly Schedule</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={[styles.addBtn, { marginRight: 15 }]} onPress={handleSyncAll} disabled={syncing}>
                        {syncing ? <ActivityIndicator size="small" color={Colors.PRIMARY} /> : <Icon name="sync" size={26} color="#475569" />}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEditBatch')}>
                        <Icon name="plus" size={30} color={Colors.TEXT_PRIMARY} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.daySelectorContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScrollContent}>
                    {daysOfWeek.map((day) => (
                        <TouchableOpacity
                            key={day}
                            style={[styles.dayTab, selectedDay === day && { backgroundColor: getDayColor(day), borderColor: getDayColor(day) }]}
                            onPress={() => setSelectedDay(day)}
                        >
                            <Text style={[styles.dayText, selectedDay === day && styles.activeDayText]}>
                                {day.substring(0, 3)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.viewToggle}>
                <TouchableOpacity
                    style={[styles.toggleBtn, !showNeedsSchedule && styles.activeToggle]}
                    onPress={() => setShowNeedsSchedule(false)}
                >
                    <Text style={[styles.toggleText, !showNeedsSchedule && styles.activeToggleText]}>Weekly View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, showNeedsSchedule && styles.activeToggle]}
                    onPress={() => setShowNeedsSchedule(true)}
                >
                    <Text style={[styles.toggleText, showNeedsSchedule && styles.activeToggleText]}>Pending Schedule</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={getDayColor(selectedDay)} style={{ marginTop: 50 }} />
            ) : showNeedsSchedule ? (
                <FlatList
                    data={allBatches.filter(b => !b.days || b.days === 'N/A')} // Simple heuristic for unscheduled
                    renderItem={({ item }) => (
                        <View style={styles.batchCard}>
                            <View style={[styles.cardAccent, { backgroundColor: Colors.TEXT_SECONDARY }]} />
                            <View style={styles.cardContent}>
                                <Text style={styles.batchTitle}>{item.name}</Text>
                                <View style={styles.detailRow}>
                                    <Icon name="alert-circle-outline" size={18} color={Colors.ERROR} />
                                    <Text style={[styles.detailText, { color: Colors.ERROR }]}>No class slots defined</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.scheduleLink}
                                    onPress={() => navigation.navigate('BatchSchedule', { batch: item })}
                                >
                                    <Icon name="calendar-plus" size={20} color={Colors.PRIMARY} />
                                    <Text style={styles.scheduleLinkText}>Set Schedule Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="check-circle-outline" size={60} color="#10B981" />
                            <Text style={styles.emptyText}>All batches have schedules!</Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={schedules}
                    renderItem={renderScheduleCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="calendar-blank-outline" size={60} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No classes scheduled for {selectedDay}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    topHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: Colors.WHITE,
        elevation: 2,
    },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    addBtn: { padding: 5 },
    daySelectorContainer: {
        backgroundColor: Colors.WHITE,
        paddingVertical: 15,
        elevation: 1,
    },
    dayScrollContent: {
        paddingHorizontal: 15,
        gap: 10,
    },
    dayTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        backgroundColor: "#F1F5F9",
    },
    dayText: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.TEXT_SECONDARY,
    },
    activeDayText: {
        color: Colors.WHITE,
    },
    listContent: {
        padding: 20,
        paddingBottom: 50,
    },
    batchCard: {
        backgroundColor: Colors.WHITE,
        borderRadius: 24,
        marginBottom: 16,
        flexDirection: "row",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        overflow: "hidden",
    },
    cardAccent: { width: 6 },
    cardContent: { flex: 1, padding: 20 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    batchCategory: { fontSize: 13, fontWeight: "bold", letterSpacing: 0.5 },
    enrollmentBadge: { backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    fullBadge: { backgroundColor: "#FEF2F2" },
    enrollmentText: { fontSize: 12, color: Colors.TEXT_SECONDARY, fontWeight: "bold" },
    fullText: { color: Colors.ERROR },
    batchTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 12 },
    detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    detailText: { fontSize: 14, color: Colors.TEXT_SECONDARY, marginLeft: 10, fontWeight: "500" },
    cardActions: { flexDirection: "row", marginTop: 15, gap: 10 },
    actionBtn: {
        flex: 1,
        height: 44,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    actionBtnText: { color: Colors.WHITE, fontWeight: "bold", fontSize: 14 },
    iconBtn: {
        width: 44,
        height: 44,
        backgroundColor: "#F1F5F9",
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { marginTop: 15, fontSize: 16, color: Colors.TEXT_MUTED, fontWeight: "500" },

    viewToggle: { flexDirection: 'row', backgroundColor: Colors.WHITE, paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    activeToggle: { backgroundColor: '#FFF1F2' },
    toggleText: { fontSize: 13, fontWeight: 'bold', color: Colors.TEXT_SECONDARY },
    activeToggleText: { color: Colors.PRIMARY },

    scheduleLink: { flexDirection: 'row', alignItems: 'center', marginTop: 15, backgroundColor: '#FFF1F2', padding: 12, borderRadius: 12, alignSelf: 'flex-start' },
    scheduleLinkText: { marginLeft: 8, color: Colors.PRIMARY, fontWeight: 'bold', fontSize: 14 }
});
