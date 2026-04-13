import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

export default function QuickActionModal({ visible, onClose, navigation }) {
    const actions = [
        { label: "New Student", icon: "account-plus", color: "#6366F1", route: "AddStudent" },
        { label: "Add Fee", icon: "wallet-plus", color: "#EC4899", route: "AddEditFee" },
        { label: "New Batch", icon: "calendar-plus", color: "#10B981", route: "AddEditBatch" },
        { label: "Create Event", icon: "star-plus", color: "#F59E0B", route: "AddEditEvent" },
        { label: "Wedding Pkg", icon: "music-note-plus", color: "#BE123C", route: "AddEditSangeetPackage" },
    ];

    const handleAction = (route) => {
        onClose();
        navigation.navigate(route);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Quick Actions</Text>
                    <View style={styles.grid}>
                        {actions.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionItem}
                                onPress={() => handleAction(item.route)}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}>
                                    <Icon name={item.icon} size={30} color={item.color} />
                                </View>
                                <Text style={styles.actionLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Icon name="close" size={24} color="#64748B" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalContainer: {
        width: width * 0.85,
        backgroundColor: "#FFFFFF",
        borderRadius: 30,
        padding: 25,
        alignItems: "center",
        elevation: 20
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1E293B",
        marginBottom: 25
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 15
    },
    actionItem: {
        width: (width * 0.85 - 80) / 2,
        alignItems: "center",
        marginBottom: 20
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569"
    },
    closeBtn: {
        marginTop: 10,
        padding: 10
    }
});
