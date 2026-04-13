import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";

const HEADER_BG = Colors.PRIMARY;

export default function AboutUsCardsScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [cards, setCards] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        icon: "information",
        displayOrder: "0",
        active: true
    });

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const res = await adminService.getAboutUsCards();
            setCards(res.data || []);
        } catch (error) {
            console.error("Error fetching cards:", error);
            Alert.alert("Error", "Could not load About Us cards.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (card = null) => {
        if (card) {
            setEditingCard(card);
            setFormData({
                title: card.title,
                content: card.content,
                icon: card.icon || "information",
                displayOrder: card.displayOrder.toString(),
                active: card.active
            });
        } else {
            setEditingCard(null);
            setFormData({
                title: "",
                content: "",
                icon: "information",
                displayOrder: (cards.length + 1).toString(),
                active: true
            });
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            Alert.alert("Error", "Title and Content are required.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                displayOrder: parseInt(formData.displayOrder) || 0
            };

            if (editingCard) {
                await adminService.updateAboutUsCard(editingCard.id, payload);
                Alert.alert("Success", "Card updated successfully");
            } else {
                await adminService.createAboutUsCard(payload);
                Alert.alert("Success", "Card created successfully");
            }
            fetchCards();
            setModalVisible(false);
        } catch (error) {
            console.error("Error saving card:", error);
            Alert.alert("Error", "Failed to save card.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Card",
            "Are you sure you want to delete this section?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await adminService.deleteAboutUsCard(id);
                            fetchCards();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete card.");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = (item) => (
        <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerTitleRow}>
                    <Icon name={item.icon || "information"} size={22} color={HEADER_BG} />
                    <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => handleOpenModal(item)} style={styles.actionBtn}>
                        <Icon name="pencil-outline" size={20} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                        <Icon name="delete-outline" size={20} color="#E11D48" />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>
            <View style={styles.cardFooter}>
                <Text style={styles.orderText}>Order: {item.displayOrder}</Text>
                {!item.active && <Text style={styles.inactiveText}>Inactive</Text>}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={HEADER_BG} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={26} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage About Us Cards</Text>
                <TouchableOpacity onPress={() => handleOpenModal()} style={styles.addBtn}>
                    <Icon name="plus" size={26} color={Colors.WHITE} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Dashboard Highlights & About Us Sections</Text>
                <Text style={styles.infoText}>These cards appear on the Student and Admin dashboards as "Highlights" and on the About Us screen.</Text>

                {cards.map(renderItem)}

                {cards.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Icon name="card-text-outline" size={60} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No cards created yet.</Text>
                        <TouchableOpacity style={styles.emptyAddBtn} onPress={() => handleOpenModal()}>
                            <Text style={styles.emptyAddText}>Add Your First Card</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingCard ? "Edit Card" : "New Card"}</Text>

                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={(t) => setFormData({ ...formData, title: t })}
                            placeholder="e.g. Our Vision"
                        />

                        <Text style={styles.label}>Icon Name (MaterialDesignIcons)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.icon}
                            onChangeText={(t) => setFormData({ ...formData, icon: t })}
                            placeholder="e.g. eye-outline"
                        />

                        <Text style={styles.label}>Display Order</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.displayOrder}
                            onChangeText={(t) => setFormData({ ...formData, displayOrder: t })}
                            keyboardType="numeric"
                            placeholder="e.g. 1"
                        />

                        <Text style={styles.label}>Content</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.content}
                            onChangeText={(t) => setFormData({ ...formData, content: t })}
                            placeholder="Describe this section..."
                            multiline
                            numberOfLines={4}
                        />

                        <TouchableOpacity
                            style={[styles.input, styles.switchRow]}
                            onPress={() => setFormData({ ...formData, active: !formData.active })}
                        >
                            <Text>Active Status</Text>
                            <Icon
                                name={formData.active ? "check-circle" : "close-circle"}
                                size={24}
                                color={formData.active ? "#16A34A" : Colors.TEXT_SECONDARY}
                            />
                        </TouchableOpacity>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.submitBtn]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color={Colors.WHITE} />
                                ) : (
                                    <Text style={styles.submitBtnText}>Save Card</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        backgroundColor: HEADER_BG,
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    headerTitle: { color: Colors.WHITE, fontSize: 18, fontWeight: "bold" },
    backBtn: { padding: 5 },
    addBtn: { padding: 5 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 5 },
    infoText: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginBottom: 20 },
    card: {
        backgroundColor: Colors.WHITE,
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },
    headerTitleRow: { flexDirection: "row", alignItems: "center" },
    cardTitle: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginLeft: 10 },
    headerActions: { flexDirection: "row" },
    actionBtn: { padding: 5, marginLeft: 10 },
    cardContent: { fontSize: 14, color: "#475569", lineHeight: 20 },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9"
    },
    orderText: { fontSize: 12, color: Colors.TEXT_MUTED },
    inactiveText: { fontSize: 12, color: "#E11D48", fontWeight: "bold" },

    emptyContainer: { alignItems: "center", marginTop: 60 },
    emptyText: { fontSize: 16, color: Colors.TEXT_MUTED, marginTop: 15 },
    emptyAddBtn: { marginTop: 20, backgroundColor: HEADER_BG, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    emptyAddText: { color: Colors.WHITE, fontWeight: "bold" },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    modalContent: {
        backgroundColor: Colors.WHITE,
        borderRadius: 20,
        padding: 20,
        width: "100%",
        maxHeight: "90%"
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 20 },
    label: { fontSize: 14, fontWeight: "600", color: Colors.TEXT_SECONDARY, marginBottom: 8 },
    input: {
        backgroundColor: "#F1F5F9",
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        marginBottom: 15
    },
    textArea: { height: 100, textAlignVertical: "top" },
    switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
    modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, marginLeft: 10 },
    cancelBtn: { backgroundColor: "#F1F5F9" },
    submitBtn: { backgroundColor: HEADER_BG },
    cancelBtnText: { color: "#475569", fontWeight: "bold" },
    submitBtnText: { color: Colors.WHITE, fontWeight: "bold" }
});
