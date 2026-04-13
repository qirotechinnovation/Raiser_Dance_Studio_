import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CustomDateTimePicker = ({ visible, onClose, onSelect, mode = 'date' }) => {
    // Mode: 'date' or 'time'
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'year'
    const [currentDate, setCurrentDate] = useState(new Date()); // For Calendar Navigation

    // Reset view mode when opening
    React.useEffect(() => {
        if (visible) setViewMode('calendar');
    }, [visible]);

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const changeMonth = (dir) => {
        const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + dir));
        setCurrentDate(new Date(newDate));
    };

    const changeYear = (year) => {
        const newDate = new Date(currentDate.setFullYear(year));
        setCurrentDate(new Date(newDate));
        setViewMode('calendar');
    };

    const handleDatePress = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (mode === 'date') {
            onSelect(dateStr);
            onClose();
        }
    };

    const handleTimePress = (time) => {
        onSelect(time);
        onClose();
    };

    const renderYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            years.push(i);
        }

        return (
            <View>
                <TouchableOpacity style={styles.backToCal} onPress={() => setViewMode('calendar')}>
                    <Icon name="arrow-left" size={20} color="#333" />
                    <Text style={styles.backText}>Back to Calendar</Text>
                </TouchableOpacity>
                <FlatList
                    data={years}
                    keyExtractor={item => item.toString()}
                    numColumns={3}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.yearCell, item === currentDate.getFullYear() && styles.activeYearCell]}
                            onPress={() => changeYear(item)}
                        >
                            <Text style={[styles.yearText, item === currentDate.getFullYear() && styles.activeYearText]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        );
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const numDays = getDaysInMonth(month, year);
        const firstDay = getFirstDayOfMonth(month, year);

        const slots = [];
        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            slots.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }
        // Days
        for (let i = 1; i <= numDays; i++) {
            slots.push(
                <TouchableOpacity key={`day-${i}`} style={styles.dayCell} onPress={() => handleDatePress(i)}>
                    <Text style={styles.dayText}>{i}</Text>
                </TouchableOpacity>
            );
        }

        return (
            <View>
                <View style={styles.calHeader}>
                    <TouchableOpacity onPress={() => changeMonth(-1)}><Icon name="chevron-left" size={24} color="#333" /></TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewMode('year')}>
                        <Text style={styles.calTitle}>{MONTHS[month]} {year} <Icon name="menu-down" size={20} /></Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeMonth(1)}><Icon name="chevron-right" size={24} color="#333" /></TouchableOpacity>
                </View>
                <View style={styles.daysHeader}>
                    {DAYS.map(d => <Text key={d} style={styles.dayLabel}>{d}</Text>)}
                </View>
                <View style={styles.daysGrid}>
                    {slots}
                </View>
            </View>
        );
    };

    const renderTime = () => {
        // Generate Slots 09:00 AM to 09:00 PM
        const times = [];
        const format12Hour = (h, m) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const hr12 = h % 12 || 12;
            return `${String(hr12).padStart(2, '0')}:${m} ${period}`;
        };

        for (let i = 9; i <= 21; i++) {
            times.push(format12Hour(i, '00'));
            if (i !== 21) {
                times.push(format12Hour(i, '30'));
            } else {
                times.push(format12Hour(i, '30'));
            }
        }

        return (
            <FlatList
                data={times}
                keyExtractor={item => item}
                numColumns={3}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.timeCell} onPress={() => handleTimePress(item)}>
                        <Text style={styles.timeText}>{item}</Text>
                    </TouchableOpacity>
                )}
            />
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {mode === 'date'
                                ? (viewMode === 'year' ? 'Select Year' : 'Select Date')
                                : 'Select Time'}
                        </Text>
                        <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color="#333" /></TouchableOpacity>
                    </View>
                    <View style={styles.body}>
                        {mode === 'date'
                            ? (viewMode === 'year' ? renderYears() : renderCalendar())
                            : renderTime()}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '90%', backgroundColor: '#FFF', borderRadius: 15, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 18, fontWeight: 'bold' },
    body: { maxHeight: 400 },

    // Calendar
    calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    calTitle: { fontSize: 16, fontWeight: '600' },
    daysHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
    dayLabel: { width: 35, textAlign: 'center', fontWeight: 'bold', color: '#888' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
    dayText: { fontSize: 16 },

    // Time
    timeCell: { flex: 1, margin: 5, padding: 10, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center' },
    timeText: { fontSize: 14, fontWeight: '600' },

    // Year Picker
    yearCell: { flex: 1, margin: 5, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    activeYearCell: { backgroundColor: '#BE123C', borderColor: '#BE123C' },
    yearText: { fontSize: 16, fontWeight: '600', color: '#333' },
    activeYearText: { color: '#FFF' },
    backToCal: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    backText: { marginLeft: 10, fontSize: 14, color: '#333', fontWeight: '500' }
});

export default CustomDateTimePicker;
