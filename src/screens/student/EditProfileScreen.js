import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import studentService from '../../api/studentService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../api/axios';
import Colors from "../../theme/Colors";


export default function EditProfileScreen({ route, navigation }) {
    const { profile } = route.params;
    const [formData, setFormData] = useState({
        email: profile.email || '',
        mobile: profile.mobile || '',
        avatar: profile.avatar || '',
    });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const id = await AsyncStorage.getItem("studentId");
            const response = await studentService.updateProfile(id, formData);

            if (response.data.status === 'queued') {
                Alert.alert("Offline", "Your profile changes have been saved locally and will sync once you are back online.", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Success", "Profile updated successfully!");
                navigation.goBack();
            }
        } catch (error) {
            // Error handling is largely covered by axios interceptor, but we can show a specific message if it's not a network error
            if (error.response) {
                Alert.alert("Error", error.response.data.message || "Failed to update profile.");
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChoosePhoto = async () => {
        const options = {
            mediaType: 'photo',
            maxWidth: 1000,
            maxHeight: 1000,
            quality: 0.8,
        };

        const result = await launchImageLibrary(options);

        if (result.didCancel) return;
        if (result.errorMessage) {
            Alert.alert('Error', result.errorMessage);
            return;
        }

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const formDataUpload = new FormData();
            formDataUpload.append('file', {
                uri: asset.uri,
                type: asset.type,
                name: asset.fileName || `profile_${Date.now()}.jpg`
            });

            setUploading(true);
            try {
                const id = await AsyncStorage.getItem("studentId");
                if (id) {
                    const uploadRes = await studentService.uploadProfilePic(id, formDataUpload);
                    if (uploadRes.status === 200) {
                        const baseURL = API.defaults.baseURL;
                        // Use the returned filename if available, or just refresh from URI for preview
                        setFormData({ ...formData, avatar: asset.uri });
                        Alert.alert("Success", "Profile photo uploaded!");
                    }
                }
            } catch (error) {
                console.error("Upload error", error);
                Alert.alert("Error", "Failed to upload photo.");
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <Image
                        source={{ uri: formData.avatar || "https://randomuser.me/api/portraits/women/44.jpg" }}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.editIcon} onPress={handleChoosePhoto} disabled={uploading}>
                        {uploading ? (
                            <ActivityIndicator size="small" color={Colors.WHITE} />
                        ) : (
                            <Icon name="camera" size={20} color={Colors.WHITE} />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.hint}>Tap camera icon to change photo</Text>
                </View>

                {/* Hidden URL input since we use picker now, or keep as fallback? removing for cleaner UI */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.mobile}
                        onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                        keyboardType="phone-pad"
                    />
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={Colors.WHITE} />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.WHITE,
        elevation: 2
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    content: { padding: 20 },
    avatarSection: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: Colors.WHITE },
    editIcon: {
        position: 'absolute',
        bottom: 20,
        right: '35%',
        backgroundColor: Colors.PRIMARY,
        padding: 8,
        borderRadius: 20,
    },
    hint: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginTop: 10 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: "#475569", marginBottom: 8 },
    input: {
        backgroundColor: Colors.WHITE,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: Colors.TEXT_PRIMARY,
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    saveBtn: {
        backgroundColor: Colors.TEXT_PRIMARY,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveBtnText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 },
});
