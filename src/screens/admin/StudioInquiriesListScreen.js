import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Alert, Linking } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";

export default function StudioInquiriesListScreen({ navigation }) {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchInquiries();
        }, [])
    );

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const res = await adminService.getStudioInquiries();
            setInquiries(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Delete Inquiry", "Are you sure?", [
            { text: "Cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    await adminService.deleteStudioInquiry(id);
                    fetchInquiries();
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.mobile}>{item.mobile}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: item.status === 'OPEN' ? '#DBEAFE' : '#DCFCE7' }]}>
                    <Text style={[styles.badgeText, { color: item.status === 'OPEN' ? '#1E40AF' : '#166534' }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <Text style={styles.detailText}><Icon name="calendar" /> {item.inquiryDate} ({item.preferredBatchTime})</Text>
                <Text style={styles.detailText}><Icon name="dance-ballroom" /> {item.danceType} • {item.skillLevel}</Text>
                {item.address ? <Text style={styles.address} numberOfLines={1}><Icon name="map-marker" /> {item.address}</Text> : null}
            </View>

            <View style={styles.actions}>
                <View style={styles.contactActions}>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.mobile}`)} style={[styles.actionBtn, styles.callBtn]}>
                        <Icon name="phone" size={18} color={Colors.WHITE} />
                        <Text style={styles.actionText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL(`sms:${item.mobile}`)} style={[styles.actionBtn, styles.msgBtn]}>
                        <Icon name="message-processing" size={18} color={Colors.WHITE} />
                        <Text style={styles.actionText}>Msg</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Icon name="trash-can-outline" size={20} color={Colors.ERROR} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <BaseScreen 
            title="Studio Enquiries" 
            loading={loading}
            useGradient={true}
            onRefresh={fetchInquiries}
            actions={[{ icon: 'plus-circle', onPress: () => navigation.navigate("StudioInquiryForm"), color: Colors.WHITE, size: 28 }]}
        >
            <View style={{ padding: 20 }}>
                <FlatList
                    data={inquiries}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={styles.empty}>No inquiries found</Text>}
                />
            </View>
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: Colors.WHITE, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
    name: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    mobile: { fontSize: 14, color: Colors.TEXT_SECONDARY },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: "bold" },
    details: { marginBottom: 15, padding: 10, backgroundColor: Colors.BG_CONTENT, borderRadius: 10 },
    detailText: { fontSize: 13, color: "#334155", marginBottom: 6 },
    address: { fontSize: 12, color: "#475569", marginTop: 4, fontStyle: 'italic' },
    actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 15 },
    contactActions: { flexDirection: "row", gap: 10 },
    actionBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    callBtn: { backgroundColor: "#10B981" },
    msgBtn: { backgroundColor: "#3B82F6" },
    actionText: { color: Colors.WHITE, fontWeight: "bold", marginLeft: 5, fontSize: 12 },
    deleteBtn: { padding: 8, backgroundColor: "#FEF2F2", borderRadius: 8 },
    empty: { textAlign: "center", marginTop: 50, color: Colors.TEXT_MUTED }
});
