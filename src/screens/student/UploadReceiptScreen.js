import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import studentService from '../../api/studentService';

export default function UploadReceiptScreen({ route, navigation }) {
    const { inquiryId } = route.params;
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
        if (result.assets && result.assets.length > 0) {
            setImage(result.assets[0]);
        }
    };

    const uploadReceipt = async () => {
        if (!image) {
            Alert.alert('Error', 'Please select an image first');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', {
            uri: image.uri,
            type: image.type,
            name: image.fileName || 'receipt.jpg',
        });

        try {
            await studentService.uploadEventReceipt(inquiryId, formData);
            Alert.alert('Success', 'Receipt uploaded successfully!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to upload receipt');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Upload Payment Screenshot</Text>
            <Text style={styles.subtitle}>Please upload the payment proof for your event booking.</Text>

            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image.uri }} style={styles.preview} />
                ) : (
                    <Text style={styles.placeholderText}>Tap to select image</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.submitButton, uploading && styles.disabled]}
                onPress={uploadReceipt}
                disabled={uploading}
            >
                {uploading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Upload Receipt</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 30,
        textAlign: 'center',
    },
    uploadBox: {
        width: '100%',
        height: 250,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#F9FAFB',
    },
    preview: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        resizeMode: 'contain',
    },
    placeholderText: {
        color: '#9CA3AF',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#C2185B',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    disabled: {
        backgroundColor: '#FBCFE8',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
