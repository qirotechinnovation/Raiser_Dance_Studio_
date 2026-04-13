import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";

import { useIsFocused } from "@react-navigation/native";
import Colors from "../../theme/Colors";


export default function EventsManagementScreen({ navigation }) {
    const isFocused = useIsFocused();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFocused) {
            fetchEvents();
        }
    }, [isFocused]);

    const fetchEvents = async () => {
        try {
            const res = await adminService.getEvents();
            setEvents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert("Confirm Delete", "Remove this event?", [
            { text: "Cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await adminService.deleteEvent(id);
                        fetchEvents();
                    } catch (error) {
                        Alert.alert("Error", "Could not delete event");
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.dateCircle}>
                <Text style={styles.dateText}>{item.date?.split('-')[2] || "00"}</Text>
                <Text style={styles.monthText}>{item.date?.split('-')[1] || "MM"}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.meta}>
                    <Icon name="map-marker-outline" size={14} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.metaText}>{item.venue || "Studio Main Hall"}</Text>
                    <Text style={[styles.metaText, { marginLeft: 10 }]}>{item.time}</Text>
                </View>
            </View>
            <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => navigation.navigate("AddEditEvent", { event: item })}>
                    <Icon name="pencil" size={18} color={Colors.TEXT_SECONDARY} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 15 }}>
                    <Icon name="trash-can" size={18} color={Colors.ERROR} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="chevron-left" size={28} color={Colors.PRIMARY_DARK} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Events Management</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("AddEditEvent")}>
                    <Icon name="calendar-plus" size={24} color="#E11D48" />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#E11D48" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={events}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={<Text style={styles.empty}>No events scheduled</Text>}
                    />
                )}
            </View>

            {/* Modal removed in favor of AddEditEventScreen */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: Colors.WHITE },
    backBtn: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.PRIMARY_DARK, flex: 1 },
    addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center" },
    container: { flex: 1, padding: 20 },
    card: { backgroundColor: Colors.WHITE, borderRadius: 15, padding: 15, marginBottom: 15, flexDirection: "row", alignItems: "center", elevation: 2 },
    dateCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", marginRight: 15 },
    dateText: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    monthText: { fontSize: 10, fontWeight: "bold", color: Colors.TEXT_SECONDARY, textTransform: "uppercase" },
    info: { flex: 1 },
    actionRow: { flexDirection: "row", paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: "#F1F5F9" },
    title: { fontSize: 16, fontWeight: "bold", color: Colors.PRIMARY_DARK },
    meta: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    metaText: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginLeft: 4 },
    empty: { textAlign: "center", marginTop: 50, color: Colors.TEXT_MUTED },
    // Removed unused modal styles
});
