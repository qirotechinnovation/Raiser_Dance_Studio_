import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, RefreshControl, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";
import Footer from "../../components/Footer";

export default function NotificationsScreen({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await adminService.getNotifications();
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleMarkRead = async (id) => {
        try {
            await adminService.markNotificationRead(id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Mark read failed:", error);
        }
    };

    const handleApprove = async (id, studentName) => {
        Alert.alert(
            "Confirm Activation",
            `Are you sure you want to activate ${studentName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Activate",
                    onPress: async () => {
                        try {
                            const res = await adminService.approveActivation(id);
                            if (res.data.success) {
                                Alert.alert("Success", "Student activated!");
                                fetchNotifications();
                            } else {
                                Alert.alert("Error", res.data.message || "Failed");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Activation failed");
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (id, studentName) => {
        Alert.alert(
            "Reject Request",
            `Are you sure you want to reject activation for ${studentName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await adminService.rejectActivation(id);
                            if (res.data.success) {
                                fetchNotifications();
                            } else {
                                Alert.alert("Error", res.data.message || "Failed");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Rejection failed");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isActivation = item.type === "ACTIVATION";
        const studentId = item.student?.id;
        const studentName = item.student?.name || "Student";

        return (
            <View style={[styles.card, !item.read && styles.unreadCard]}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                        <Icon
                            name={isActivation ? "account-check" : "bell-ring-outline"}
                            size={24}
                            color={isActivation ? "#2563EB" : "#E11D48"}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.message}>{item.message}</Text>
                        <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
                    </View>
                    {!item.read && (
                        <TouchableOpacity onPress={() => handleMarkRead(item.id)}>
                            <Icon name="circle-medium" size={24} color="#E11D48" />
                        </TouchableOpacity>
                    )}
                </View>

                {isActivation && (
                    <View style={styles.actionRow}>
                        {/* View Profile */}
                        {studentId && (
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.viewBtn]}
                                onPress={() => navigation.navigate("EditStudent", { studentId })}
                            >
                                <Icon name="eye-outline" size={18} color="#475569" />
                                <Text style={styles.viewBtnText}>View Profile</Text>
                            </TouchableOpacity>
                        )}

                        {/* Actions if unread or not processed yet */}
                        {!item.read && !item.message.includes("[APPROVED]") && !item.message.includes("[REJECTED]") && (
                            <>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.rejectBtn]}
                                    onPress={() => handleReject(item.id, studentName)}
                                >
                                    <Icon name="close" size={18} color={Colors.ERROR} />
                                    <Text style={styles.rejectBtnText}>Reject</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.approveBtn]}
                                    onPress={() => handleApprove(item.id, studentName)}
                                >
                                    <Icon name="check" size={18} color={Colors.WHITE} />
                                    <Text style={styles.approveBtnText}>Approve</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const handleClearAll = () => {
        if (notifications.length === 0) return;

        Alert.alert("Clear All", "Are you sure you want to delete all notifications?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Clear",
                style: "destructive",
                onPress: async () => {
                    try {
                        await adminService.clearAllNotifications();
                        fetchNotifications();
                    } catch (error) {
                        Alert.alert("Error", "Failed to clear notifications");
                    }
                }
            }
        ]);
    };

    return (
        <BaseScreen 
            title="Notifications" 
            loading={loading}
            isScrollable={false}
            rightText={notifications.length > 0 ? "Clear All" : null}
            onRightPress={handleClearAll}
            iconColor="#E11D48"
        >
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={<Text style={styles.emptyText}>No notifications</Text>}
                ListFooterComponent={<Footer />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#E11D48"]} />}
            />
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.WHITE,
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        shadowColor: Colors.TEXT_SECONDARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    unreadCard: {
        borderColor: "#FECDD3",
        backgroundColor: "#FFF1F2"
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start"
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center"
    },
    message: {
        fontSize: 15,
        color: Colors.TEXT_PRIMARY,
        lineHeight: 22,
        fontWeight: "500"
    },
    time: {
        fontSize: 13,
        color: Colors.TEXT_SECONDARY,
        marginTop: 6,
        fontWeight: "500"
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 18,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingTop: 16,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
    },
    viewBtn: {
        borderColor: Colors.BORDER,
        backgroundColor: Colors.WHITE,
        marginRight: "auto" // Pushes other buttons to right
    },
    viewBtnText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "600",
        color: "#475569"
    },
    rejectBtn: {
        borderColor: "#FECDD3",
        backgroundColor: "#FEF2F2",
        marginRight: 10
    },
    rejectBtnText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "700",
        color: Colors.ERROR
    },
    approveBtn: {
        borderColor: "#2563EB",
        backgroundColor: "#2563EB",
        borderWidth: 0,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2
    },
    approveBtnText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "700",
        color: Colors.WHITE
    },
    emptyText: {
        textAlign: "center",
        marginTop: 60,
        fontSize: 16,
        color: Colors.TEXT_MUTED,
        fontWeight: "500"
    }
});
