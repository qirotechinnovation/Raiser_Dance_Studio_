import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


export default function CalendarScheduleScreen({ navigation }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        generateWeekDates(selectedDate);
        fetchData();
    }, [selectedDate]);

    const generateWeekDates = (date) => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        startOfWeek.setDate(diff);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        setWeekDates(days);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

            const [schedRes, batchRes, holidayRes] = await Promise.all([
                adminService.getAllSchedules(),
                adminService.getBatches(),
                adminService.getHolidays()
            ]);

            // 1. Check for Holidays on this date
            const relevantHolidays = (holidayRes.data || []).filter(h => h.date === dateStr);
            setHolidays(relevantHolidays);

            // 2. Filter Schedules
            const allBatches = batchRes.data || [];
            const customSlots = schedRes.data || [];

            // Filter Custom Slots
            const daySlots = customSlots.filter(s =>
                s.dayOfWeek && (s.dayOfWeek.toUpperCase() === dayName || s.dayOfWeek.toUpperCase().startsWith(dayName.substring(0, 3)))
            );

            // Filter Active Batches (Auto)
            const activeBatches = allBatches.filter(b => {
                // Remove if has custom slot to avoid duplication
                if (daySlots.some(s => s.batch?.id === b.id)) return false;

                // Check Day
                const search = (b.days || "").toUpperCase();
                const targetShort = dayName.substring(0, 3);
                const isDayMatch = search.includes(dayName) || search.includes(targetShort);

                if (!isDayMatch) return false;

                // Check Date Range
                const today = new Date(dateStr);
                if (b.startDate && new Date(b.startDate) > today) return false;
                if (b.endDate && new Date(b.endDate) < today) return false;

                return true;
            });

            // Combine
            const unified = [
                ...daySlots.map(s => ({ ...s, type: 'SLOT' })),
                ...activeBatches.map(b => ({
                    id: `batch-${b.id}`,
                    batch: b,
                    startTime: b.startTime || b.timing?.split('-')[0]?.trim() || "TBA",
                    endTime: b.endTime || b.timing?.split('-')[1]?.trim() || "TBA",
                    activity: b.name,
                    type: 'BATCH_AUTO'
                }))
            ].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

            setSchedule(unified);

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    const changeWeek = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + (direction * 7));
        setSelectedDate(newDate);
    };

    const isSameDate = (d1, d2) => {
        return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Calendar Schedule</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Calendar Strip */}
            <View style={styles.calendarStrip}>
                <View style={styles.monthRow}>
                    <TouchableOpacity onPress={() => changeWeek(-1)}>
                        <Icon name="chevron-left" size={28} color="#4B5563" />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>
                        {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => changeWeek(1)}>
                        <Icon name="chevron-right" size={28} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                <View style={styles.daysRow}>
                    {weekDates.map((date, index) => {
                        const isSelected = isSameDate(date, selectedDate);
                        const isToday = isSameDate(date, new Date());
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.dayItem, isSelected && styles.selectedDayItem]}
                                onPress={() => setSelectedDate(date)}
                            >
                                <Text style={[styles.dayLabel, isSelected && styles.selectedDayText]}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                                </Text>
                                <Text style={[styles.dateText, isSelected && styles.selectedDayText, isToday && !isSelected && styles.todayText]}>
                                    {date.getDate()}
                                </Text>
                                {isToday && <View style={styles.dot} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>

                {/* Holiday Banner */}
                {holidays.length > 0 && holidays.map((h, i) => (
                    <View key={i} style={styles.holidayBanner}>
                        <Icon name="beach" size={24} color={Colors.PRIMARY} />
                        <View style={{ marginLeft: 15 }}>
                            <Text style={styles.holidayTitle}>{h.name}</Text>
                            <Text style={styles.holidaySub}>
                                {h.batch ? `Holiday for ${h.batch.name}` : "Studio Closed"}
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Schedule List */}
                {loading ? (
                    <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 50 }} />
                ) : schedule.length > 0 ? (
                    schedule.map((item, index) => {
                        // Check if this class is affected by holiday
                        const isHolidayAffected = holidays.some(h =>
                            !h.batch || (item.batch?.id && h.batch?.id === item.batch.id)
                        );

                        return (
                            <View key={index} style={[styles.timeSlot, isHolidayAffected && styles.holidayaffectedSlot]}>
                                <View style={styles.timeColumn}>
                                    <Text style={styles.startTime}>{item.startTime}</Text>
                                    <View style={styles.timelineLine} />
                                </View>

                                <View style={[styles.card, isHolidayAffected && styles.alphaCard]}>
                                    <View style={[styles.accent, { backgroundColor: isHolidayAffected ? Colors.TEXT_MUTED : Colors.PRIMARY }]} />
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{item.activity}</Text>
                                        <Text style={styles.cardSub}>
                                            {item.batch?.name} • {item.batch?.instructor}
                                        </Text>
                                        {isHolidayAffected && (
                                            <View style={styles.cancelledTag}>
                                                <Text style={styles.cancelledText}>CANCELLED (HOLIDAY)</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Icon name="calendar-blank" size={60} color={Colors.BORDER} />
                        <Text style={styles.emptyText}>No classes scheduled for this date</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: Colors.WHITE },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    backBtn: { padding: 5 },

    calendarStrip: { backgroundColor: Colors.WHITE, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    monthText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    daysRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10 },
    dayItem: { alignItems: 'center', padding: 10, borderRadius: 14, width: 45 },
    selectedDayItem: { backgroundColor: Colors.PRIMARY, elevation: 3 },
    dayLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
    dateText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    selectedDayText: { color: Colors.WHITE },
    todayText: { color: Colors.PRIMARY },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.PRIMARY, marginTop: 4 },

    content: { padding: 20, paddingBottom: 50 },

    holidayBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FECDD3' },
    holidayTitle: { fontSize: 16, fontWeight: 'bold', color: '#9F1239' },
    holidaySub: { fontSize: 13, color: Colors.PRIMARY, marginTop: 2 },

    timeSlot: { flexDirection: 'row', marginBottom: 15 },
    timeColumn: { width: 60, alignItems: 'center', paddingTop: 10 },
    startTime: { fontSize: 13, fontWeight: 'bold', color: Colors.TEXT_SECONDARY },
    timelineLine: { flex: 1, width: 2, backgroundColor: Colors.BORDER, marginTop: 8 },

    card: { flex: 1, flexDirection: 'row', backgroundColor: Colors.WHITE, borderRadius: 16, overflow: 'hidden', elevation: 2, minHeight: 80 },
    alphaCard: { opacity: 0.6 },
    holidayaffectedSlot: { opacity: 0.8 },
    accent: { width: 4 },
    cardContent: { flex: 1, padding: 15, justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
    cardSub: { fontSize: 13, color: '#6B7280' },

    cancelledTag: { alignSelf: 'flex-start', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 8 },
    cancelledText: { fontSize: 10, fontWeight: 'bold', color: '#B91C1C' },

    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: 15, color: Colors.TEXT_MUTED, fontSize: 15 }
});
