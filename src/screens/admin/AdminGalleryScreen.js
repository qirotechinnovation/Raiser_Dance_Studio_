import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, Image, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from 'react-native-image-picker';
import adminService from "../../api/adminService";
import API from "../../api/axios";
import Colors from "../../theme/Colors";


const AdminGalleryScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ eventName: "", description: "", displayOrder: "0", category: "GENERAL" });
    const [selectedImage, setSelectedImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const baseURL = API.defaults.baseURL;

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const res = await adminService.getGalleryItems();
            setItems(res.data || []);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch gallery items");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handlePickImage = () => {
        const options = {
            mediaType: 'photo',
            maxWidth: 1000,
            maxHeight: 1000,
            quality: 0.8,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert("Error", response.errorMessage);
                return;
            }
            setSelectedImage(response.assets[0]);
        });
    };

    const handleSave = async () => {
        if (!formData.eventName || !formData.description) {
            Alert.alert("Error", "Event Name and Description are required");
            return;
        }

        if (!editingItem && !selectedImage) {
            Alert.alert("Error", "Please select an image");
            return;
        }

        setSubmitting(true);
        try {
            if (editingItem) {
                // Update text only (backend doesn't support image update in same endpoint currently based on my review)
                await adminService.updateGalleryItem(
                    editingItem.id,
                    formData.eventName,
                    formData.description,
                    formData.category,
                    parseInt(formData.displayOrder) || 0
                );
                Alert.alert("Success", "Gallery item updated!");
            } else {
                // Create new
                const data = new FormData();
                data.append('eventName', formData.eventName);
                data.append('description', formData.description);
                data.append('category', formData.category);
                data.append('displayOrder', parseInt(formData.displayOrder) || 0);
                data.append('file', {
                    uri: selectedImage.uri,
                    type: selectedImage.type,
                    name: selectedImage.fileName || `gallery_${Date.now()}.jpg`
                });

                await adminService.uploadGalleryItem(data);
                Alert.alert("Success", "Gallery item created!");
            }
            setModalVisible(false);
            fetchGallery();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to save gallery item");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Delete", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    setLoading(true);
                    try {
                        await adminService.deleteGalleryItem(id);
                        fetchGallery();
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete");
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setFormData({
            eventName: item.eventName,
            description: item.description,
            category: item.category || "GENERAL",
            displayOrder: String(item.displayOrder)
        });
        setSelectedImage(null); // Cannot update image in edit for now
        setModalVisible(true);
    };

    const openCreate = () => {
        setEditingItem(null);
        setFormData({ eventName: "", description: "", displayOrder: "0", category: "GENERAL" });
        setSelectedImage(null);
        setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: `${baseURL}/uploads/${item.imagePath}` }}
                style={styles.cardImage}
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.eventName}</Text>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.cardOrder}>Order: {item.displayOrder}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                    <Icon name="pencil" size={20} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                    <Icon name="delete" size={20} color={Colors.ERROR} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Icon name="arrow-left" size={26} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Event Gallery</Text>
                <TouchableOpacity onPress={openCreate} style={styles.addBtn}>
                    <Icon name="plus" size={28} color={Colors.PRIMARY} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>No gallery items found.</Text>}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); fetchGallery(); }}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingItem ? "Edit Item" : "New Gallery Item"}</Text>

                        {!editingItem && (
                            <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                                {selectedImage ? (
                                    <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                                ) : (
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon name="camera" size={32} color={Colors.TEXT_MUTED} />
                                        <Text style={{ color: Colors.TEXT_MUTED, marginTop: 5 }}>Select Image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}

                        <Text style={styles.label}>Event Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.eventName}
                            onChangeText={t => setFormData({ ...formData, eventName: t })}
                            placeholder="e.g. Annual Show 2024"
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={t => setFormData({ ...formData, description: t })}
                            placeholder="Short description..."
                            multiline
                        />

                        <Text style={styles.label}>Display Order</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.displayOrder}
                            onChangeText={t => setFormData({ ...formData, displayOrder: t })}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoryRow}>
                            {["GENERAL", "WEDDING", "CLASS", "EVENT"].map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.catBtn, formData.category === cat && styles.catBtnActive]}
                                    onPress={() => setFormData({ ...formData, category: cat })}
                                >
                                    <Text style={[styles.catBtnText, formData.category === cat && styles.catBtnTextActive]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={submitting}>
                                {submitting ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.saveText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
        paddingBottom: 15,
        backgroundColor: Colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    headerTitle: { fontSize: 22, fontWeight: "900", color: Colors.TEXT_PRIMARY, flex: 1, marginLeft: 15, letterSpacing: -0.5 },
    headerBtn: { padding: 5 },
    addBtn: { padding: 5 },
    listContent: { padding: 20 },
    card: { backgroundColor: Colors.WHITE, flexDirection: 'row', borderRadius: 16, marginBottom: 15, elevation: 2, overflow: 'hidden' },
    cardImage: { width: 100, height: 100, backgroundColor: Colors.BORDER },
    cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 2 },
    categoryBadge: { backgroundColor: "#F1F5F9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 4 },
    categoryText: { fontSize: 9, fontWeight: "800", color: Colors.TEXT_SECONDARY, textTransform: 'uppercase' },
    cardDesc: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginBottom: 6 },
    cardOrder: { fontSize: 10, color: Colors.TEXT_MUTED, fontWeight: "bold" },
    actions: { justifyContent: 'space-between', padding: 10, alignItems: 'center' },
    actionBtn: { padding: 8 },
    emptyText: { textAlign: "center", color: Colors.TEXT_MUTED, marginTop: 20 },

    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 20, textAlign: "center" },
    label: { fontSize: 12, fontWeight: "bold", color: Colors.TEXT_SECONDARY, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10, padding: 12, marginBottom: 15, color: Colors.TEXT_PRIMARY, backgroundColor: Colors.BG_CONTENT },
    textArea: { height: 80, textAlignVertical: 'top' },
    imagePicker: { height: 150, borderWidth: 2, borderColor: Colors.BORDER, borderStyle: 'dashed', borderRadius: 12, marginBottom: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },

    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelBtn: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER },
    saveBtn: { flex: 1, padding: 15, alignItems: 'center', marginLeft: 10, borderRadius: 12, backgroundColor: Colors.PRIMARY },
    cancelText: { fontWeight: "bold", color: Colors.TEXT_SECONDARY },
    saveText: { fontWeight: "bold", color: Colors.WHITE },

    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    catBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.BORDER, backgroundColor: Colors.BG_CONTENT },
    catBtnActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
    catBtnText: { fontSize: 11, fontWeight: "bold", color: Colors.TEXT_SECONDARY },
    catBtnTextActive: { color: Colors.WHITE }
});

export default AdminGalleryScreen;
