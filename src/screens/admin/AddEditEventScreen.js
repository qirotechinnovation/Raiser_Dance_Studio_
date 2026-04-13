import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from "react-native-linear-gradient";
import { StatusBar } from "react-native";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";



export default function AddEditEventScreen({ navigation, route }) {
    const isEdit = route.params?.event != null;
    const existingEvent = route.params?.event;

    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [formData, setFormData] = useState({
        title: existingEvent?.title || "",
        type: existingEvent?.type || "Bollywood",
        venue: existingEvent?.venue || "",
        date: existingEvent?.date || new Date().toISOString().split('T')[0],
        time: existingEvent?.time || "06:00 PM",
        description: existingEvent?.description || "",
        photo: existingEvent?.photo || "",
        fee: existingEvent?.fee?.toString() || ""
    });

    const handleImagePick = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
            if (response.didCancel) return;
            if (response.errorMessage) {
                Alert.alert("Error", "Image selection failed");
                return;
            }
            if (response.assets && response.assets.length > 0) {
                setSelectedImage(response.assets[0]);
            }
        });
    };

    const handleSave = async () => {
        if (!formData.title || !formData.venue || !formData.date) {
            Alert.alert("Error", "Please fill required fields (Title, Venue, Date)");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                id: isEdit ? existingEvent.id : undefined,
                title: formData.title,
                type: formData.type,
                venue: formData.venue,
                date: formData.date,
                time: formData.time,
                description: formData.description,
                fee: formData.fee ? parseFloat(formData.fee) : 0.0,
                photo: isEdit ? existingEvent.photo : ""
            };

            let eventId;
            if (isEdit) {
                await adminService.updateEvent(existingEvent.id, payload);
                eventId = existingEvent.id;
            } else {
                const res = await adminService.createEvent(payload);
                eventId = res.data.id;
            }

            if (selectedImage && eventId) {
                const photoData = new FormData();
                photoData.append('file', {
                    uri: Platform.OS === 'android' ? selectedImage.uri : selectedImage.uri.replace('file://', ''),
                    type: selectedImage.type || 'image/jpeg',
                    name: selectedImage.fileName || `event_${eventId}.jpg`,
                });
                await adminService.uploadEventPhoto(eventId, photoData);
            }

            Alert.alert("Success", `Event ${isEdit ? 'updated' : 'created'} successfully`, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Failed to save event:", error);
            Alert.alert("Error", "Could not save event details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9F1239" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                {/* Gradient Header */}
                <LinearGradient colors={[Colors.PRIMARY, "#9F1239"]} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Icon name="arrow-left" size={26} color={Colors.WHITE} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{isEdit ? 'Edit Event' : 'New Event'}</Text>
                        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
                            {loading ? <ActivityIndicator size="small" color={Colors.PRIMARY} /> : <Text style={styles.saveBtnText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerSubtitle}>{isEdit ? 'Update event details' : 'Create a new studio event'}</Text>
                </LinearGradient>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>EVENT DETAILS</Text>

                        <InputField
                            label="Event Title *"
                            value={formData.title}
                            onChange={(v) => setFormData({ ...formData, title: v })}
                            icon="party-popper"
                        />

                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>Category / Style</Text>
                            <Picker
                                selectedValue={formData.type}
                                onValueChange={(v) => setFormData({ ...formData, type: v })}
                                style={{ color: Colors.TEXT_PRIMARY }}
                            >
                                <Picker.Item label="Bollywood" value="Bollywood" />
                                <Picker.Item label="Hip Hop" value="Hip Hop" />
                                <Picker.Item label="Salsa" value="Salsa" />
                                <Picker.Item label="Contemporary" value="Contemporary" />
                                <Picker.Item label="Classical" value="Classical" />
                                <Picker.Item label="Jazz" value="Jazz" />
                            </Picker>
                        </View>

                        <InputField
                            label="Venue / Location *"
                            value={formData.venue}
                            onChange={(v) => setFormData({ ...formData, venue: v })}
                            icon="map-marker-outline"
                        />

                        <Text style={styles.sectionLabel}>DATE & TIME</Text>
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <InputField
                                    label="Date (YYYY-MM-DD) *"
                                    value={formData.date}
                                    onChange={(v) => setFormData({ ...formData, date: v })}
                                    icon="calendar-outline"
                                    placeholder="2024-05-20"
                                />
                            </View>
                            <View style={{ width: 20 }} />
                            <View style={{ flex: 1 }}>
                                <InputField
                                    label="Time"
                                    value={formData.time}
                                    onChange={(v) => setFormData({ ...formData, time: v })}
                                    icon="clock-outline"
                                    placeholder="06:00 PM"
                                />
                            </View>
                        </View>

                        <InputField
                            label="Entry Fee (₹)"
                            value={formData.fee}
                            onChange={(v) => setFormData({ ...formData, fee: v })}
                            icon="currency-inr"
                            keyboardType="numeric"
                            placeholder="0.00"
                        />

                        <Text style={styles.sectionLabel}>ADDITIONAL INFO</Text>

                        <View style={styles.imageSection}>
                            <Text style={styles.inputLabel}>Event Photo</Text>
                            <TouchableOpacity style={styles.imageUploadBtn} onPress={handleImagePick}>
                                {selectedImage ? (
                                    <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                                ) : formData.photo ? (
                                    <Image source={{ uri: `${adminService.BASE_URL}/uploads/events/${formData.photo}` }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Icon name="camera-plus" size={30} color={Colors.TEXT_MUTED} />
                                        <Text style={styles.uploadText}>Select Photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {selectedImage && <Text style={styles.selectedText}>Image Selected</Text>}
                        </View>

                        <InputField
                            label="Description"
                            value={formData.description}
                            onChange={(v) => setFormData({ ...formData, description: v })}
                            icon="text-subject"
                            multiline
                            numberOfLines={4}
                            style={{ height: 100, textAlignVertical: 'top', paddingTop: 10 }}
                        />

                        <View style={{ height: 100 }} />
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>
        </View>
    );
}


function InputField({ label, value, onChange, icon, style, ...props }) {
    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.inputBox, style]}>
                <Icon name={icon} size={20} color={Colors.TEXT_SECONDARY} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder={`Enter ${label.split('*')[0].trim()}`}
                    placeholderTextColor={Colors.TEXT_MUTED}
                    {...props}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F1F5F9" },
    header: { padding: 20, paddingTop: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
    headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 22, fontWeight: "bold", color: Colors.WHITE },
    headerSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginLeft: 5 },
    saveBtn: { backgroundColor: Colors.WHITE, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, elevation: 2 },
    saveBtnText: { color: Colors.PRIMARY, fontWeight: "bold", fontSize: 14 },

    content: { flex: 1, padding: 20, marginTop: -20 },
    card: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },

    sectionLabel: { fontSize: 11, fontWeight: "bold", color: Colors.TEXT_MUTED, letterSpacing: 1, marginBottom: 15, marginTop: 5 },

    inputWrapper: { marginBottom: 15 },
    inputLabel: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginBottom: 6, fontWeight: "600" },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.BG_CONTENT,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.BORDER,
    },
    input: { flex: 1, marginLeft: 10, color: Colors.TEXT_PRIMARY, fontSize: 15, fontWeight: "500" },

    pickerContainer: {
        backgroundColor: Colors.BG_CONTENT,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.BORDER,
    },
    pickerLabel: { position: 'absolute', top: -10, left: 10, backgroundColor: Colors.WHITE, paddingHorizontal: 5, fontSize: 10, color: Colors.TEXT_SECONDARY, fontWeight: 'bold', zIndex: 1 },

    row: { flexDirection: "row" },

    imageSection: { marginBottom: 20 },
    imageUploadBtn: {
        height: 180,
        backgroundColor: "#FFF1F2",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#FECDD3",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },
    previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
    placeholderImage: { alignItems: "center" },
    uploadText: { color: Colors.PRIMARY, marginTop: 8, fontWeight: "Bold" },
    selectedText: { color: "#16A34A", fontSize: 12, marginTop: 4, fontWeight: "bold", textAlign: "center" }
});

