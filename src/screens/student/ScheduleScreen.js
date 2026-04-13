import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import studentService from "../../api/studentService";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";

export default function ScheduleScreen() {
    const [activeTab, setActiveTab] = useState('CLASSES'); // 'CLASSES' or 'EVENTS'
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [batch, setBatch] = useState(null);
    const [scheduleSlots, setScheduleSlots] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [events, setEvents] = useState([]);

    const fetchData = async () => {
        try {
            const id = await AsyncStorage.getItem("studentId");
            if (id) {
                const [batchRes, eventsRes, bookedRes] = await Promise.all([
                    studentService.getBatch(id).catch(() => ({ data: null })),
                    studentService.getUpcomingEvents().catch(() => ({ data: [] })),
                    studentService.getMyBookedEvents(id).catch(() => ({ data: [] }))
                ]);

                const studentBatch = batchRes.data;
                setBatch(studentBatch);

                if (studentBatch && studentBatch.id) {
                    const [slotsRes, holidayRes] = await Promise.all([
                        studentService.getScheduleByBatch(studentBatch.id).catch(() => ({ data: [] })),
                        studentService.getUpcomingHolidays(studentBatch.id).catch(() => ({ data: [] }))
                    ]);
                    setScheduleSlots(slotsRes.data || []);
                    setHolidays(holidayRes.data || []);
                }

                const upcomingEvents = eventsRes.data || [];
                const bookedEvents = bookedRes.data || [];
                const bookedEventIds = new Set(bookedEvents.map(e => e.id));

                const mergedEvents = upcomingEvents.map(event => ({
                    ...event,
                    participating: bookedEventIds.has(event.id)
                }));

                setEvents(mergedEvents);
            }
        } catch (error) {
            console.error("Error fetching schedule data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const renderClassSchedule = () => {
        if (!batch) {
            return (
                <View style={styles.emptyCenter}>
                    <Icon name="calendar-question" size={60} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No batch assigned yet.</Text>
                </View>
            );
        }

        return (
            <View style={styles.content}>
                <Text style={styles.sectionHeader}>My Weekly Classes</Text>

                {scheduleSlots.length > 0 ? (
                    scheduleSlots.map((slot, index) => (
                        <View key={index} style={styles.slotCard}>
                            <View style={styles.slotDayBox}>
                                <Text style={styles.slotDayText}>{slot.dayOfWeek?.substring(0, 3).toUpperCase()}</Text>
                            </View>
                            <View style={styles.slotInfo}>
                                <Text style={styles.slotActivity}>{slot.activity || batch.name}</Text>
                                <View style={styles.slotTimeRow}>
                                    <Icon name="clock-outline" size={14} color={Colors.TEXT_SECONDARY} />
                                    <Text style={styles.slotTime}>{slot.startTime} - {slot.endTime}</Text>
                                </View>
                            </View>
                            <View style={styles.slotBatchBadge}>
                                <Text style={styles.slotBatchText}>{batch.name}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.batchCard}>
                        <View style={styles.batchHeader}>
                            <View style={styles.iconCircle}>
                                <Icon name="clock-fast" size={24} color={Colors.PRIMARY} />
                            </View>
                            <View style={{ marginLeft: 15 }}>
                                <Text style={styles.batchName}>{batch.name}</Text>
                                <Text style={styles.batchSub}>{batch.style || "Dance Class"}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.batchDetailRow}>
                            <DetailItem icon="calendar" label="Days" value={batch.days || "N/A"} />
                            <DetailItem icon="clock-outline" label="Timing" value={batch.timing || batch.startTime || "N/A"} />
                        </View>
                    </View>
                )}

                <View style={styles.infoBox}>
                    <Icon name="information-outline" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>
                        Showing specific slots for your batch. Attendance is mandatory for these timings.
                    </Text>
                </View>

                {holidays.length > 0 && (
                    <View style={{ marginTop: 25 }}>
                        <Text style={styles.sectionHeader}>Upcoming Holidays</Text>
                        {holidays.map((h, i) => (
                            <View key={i} style={styles.holidayScheduleCard}>
                                <View style={styles.holidayIconBox}>
                                    <Icon name="calendar-star" size={22} color={Colors.PRIMARY} />
                                </View>
                                <View style={styles.holidayInfo}>
                                    <Text style={styles.holidayName}>{h.name}</Text>
                                    <View style={styles.holidayDateRow}>
                                        <Text style={styles.holidayDate}>
                                            {new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </Text>
                                        <View style={styles.holidayBadge}>
                                            <Text style={styles.holidayBadgeText}>HOLIDAY</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const renderEvents = () => (
        <View style={styles.content}>
            <Text style={styles.sectionHeader}>Upcoming Events & Workshops</Text>
            {events.length > 0 ? (
                <FlatList
                    data={events}
                    keyExtractor={(item) => (item.id || Math.random()).toString()}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.eventCard}>
                            <View style={styles.eventCardHeader}>
                                <View style={[styles.eventTag, { backgroundColor: item.participating ? '#ECFDF5' : '#FFF1F2' }]}>
                                    {item.participating && <Icon name="ticket-confirmation" size={12} color="#059669" style={{ marginRight: 4 }} />}
                                    <Text style={[styles.tagText, { color: item.participating ? '#059669' : Colors.PRIMARY }]}>
                                        {item.participating ? "✓ CONFIRMED" : "OPEN"}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.eventTitle}>{item.title || item.name}</Text>
                            <View style={styles.eventInfoRow}>
                                <Icon name="calendar-range" size={16} color={Colors.TEXT_SECONDARY} />
                                <Text style={styles.eventInfoText}>{item.date}</Text>
                                <Icon name="clock-outline" size={16} color={Colors.TEXT_SECONDARY} style={{ marginLeft: 15 }} />
                                <Text style={styles.eventInfoText}>{item.time || "TBA"}</Text>
                            </View>
                            {item.participating && (
                                <View style={styles.confirmedBanner}>
                                    <Icon name="check-circle" size={16} color="#059669" />
                                    <Text style={styles.confirmedText}>Your booking is confirmed!</Text>
                                </View>
                            )}
                        </View>
                    )}
                />
            ) : (
                <View style={styles.emptyCenter}>
                    <Icon name="star-outline" size={60} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No special events planned yet.</Text>
                </View>
            )}
        </View>
    );

    const DetailItem = ({ icon, label, value }) => (
        <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
                <Icon name={icon} size={16} color={Colors.TEXT_SECONDARY} />
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );

    return (
        <BaseScreen 
            title="Class Schedule" 
            loading={loading} 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            useGradient={true}
        >
            <View style={styles.tabWrapper}>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, activeTab === 'CLASSES' && styles.activeBtn]}
                        onPress={() => setActiveTab('CLASSES')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'CLASSES' && styles.activeText]}>Classes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, activeTab === 'EVENTS' && styles.activeBtn]}
                        onPress={() => setActiveTab('EVENTS')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'EVENTS' && styles.activeText]}>Events</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {activeTab === 'CLASSES' ? renderClassSchedule() : renderEvents()}
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    content: { padding: 20 },
    tabWrapper: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeBtn: { backgroundColor: Colors.WHITE, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
    toggleText: { fontSize: 14, fontWeight: '600', color: Colors.TEXT_SECONDARY },
    activeText: { color: Colors.PRIMARY, fontWeight: 'bold' },
    
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginBottom: 15 },
    batchCard: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05 },
    batchHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center' },
    batchName: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    batchSub: { fontSize: 14, color: Colors.TEXT_SECONDARY },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 20 },
    batchDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    detailItem: { flex: 1 },
    detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    detailLabel: { fontSize: 12, color: Colors.TEXT_MUTED, marginLeft: 6, fontWeight: '600' },
    detailValue: { fontSize: 15, fontWeight: '600', color: Colors.TEXT_PRIMARY },
    
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    infoText: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginLeft: 10, flex: 1 },
    
    eventCard: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 16, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05 },
    eventCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    eventTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
    tagText: { fontSize: 10, fontWeight: 'bold' },
    eventTitle: { fontSize: 17, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginBottom: 8 },
    eventInfoRow: { flexDirection: 'row', alignItems: 'center' },
    eventInfoText: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginLeft: 6 },
    confirmedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 10, borderRadius: 10, marginTop: 12, borderWidth: 1, borderColor: '#DCFCE7' },
    confirmedText: { fontSize: 13, color: '#059669', marginLeft: 8, fontWeight: '600' },
    
    emptyCenter: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, color: Colors.TEXT_MUTED, fontSize: 16, fontWeight: '500' },

    slotCard: { backgroundColor: Colors.WHITE, borderRadius: 18, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
    slotDayBox: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center' },
    slotDayText: { fontSize: 14, fontWeight: 'bold', color: Colors.PRIMARY },
    slotInfo: { flex: 1, marginLeft: 15 },
    slotActivity: { fontSize: 16, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginBottom: 4 },
    slotTimeRow: { flexDirection: 'row', alignItems: 'center' },
    slotTime: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginLeft: 5 },
    slotBatchBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    slotBatchText: { fontSize: 10, fontWeight: 'bold', color: '#64748B' },
    
    holidayScheduleCard: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 18, padding: 15, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    holidayIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.WHITE, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1 },
    holidayInfo: { flex: 1, marginLeft: 15 },
    holidayName: { fontSize: 16, fontWeight: 'bold', color: Colors.PRIMARY },
    holidayDateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
    holidayDate: { fontSize: 13, color: Colors.PRIMARY, fontWeight: '500' },
    holidayBadge: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    holidayBadgeText: { fontSize: 8, fontWeight: 'bold', color: Colors.WHITE },
});
