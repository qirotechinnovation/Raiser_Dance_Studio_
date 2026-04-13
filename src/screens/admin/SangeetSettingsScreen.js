import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import adminService from '../../api/adminService';
import Colors from "../../theme/Colors";


export default function SangeetSettingsScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        pageTitle: '',
        heroText: '',
        subHeroText: '',
        aboutTitle: '',
        aboutContent: '',
        contactPhone: '',
        studioAddress: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await adminService.getSangeetSettings();
            if (res.data) {
                setSettings(res.data);
            }
        } catch (error) {
            console.error("Error fetching sangeet settings", error);
            Alert.alert("Error", "Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings.pageTitle || !settings.contactPhone) {
            Alert.alert("Error", "Title and Contact Phone are required");
            return;
        }

        setSaving(true);
        try {
            await adminService.updateSangeetSettings(settings);
            Alert.alert("Success", "Sangeet settings updated successfully!");
        } catch (error) {
            console.error("Error updating settings", error);
            Alert.alert("Error", "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const InputField = ({ label, value, onChangeText, multiline, numberOfLines }) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.textArea]}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                numberOfLines={numberOfLines}
                placeholder={`Enter ${label.toLowerCase()}...`}
                placeholderTextColor={Colors.TEXT_MUTED}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sangeet Experience Settings</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color={Colors.PRIMARY} />
                    ) : (
                        <Text style={styles.saveBtnText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Landing Page Content</Text>

                <InputField
                    label="Page Title"
                    value={settings.pageTitle}
                    onChangeText={(t) => setSettings({ ...settings, pageTitle: t })}
                />

                <InputField
                    label="Hero Text (Main Headline)"
                    value={settings.heroText}
                    onChangeText={(t) => setSettings({ ...settings, heroText: t })}
                    multiline
                    numberOfLines={2}
                />

                <InputField
                    label="Sub-Hero Text"
                    value={settings.subHeroText}
                    onChangeText={(t) => setSettings({ ...settings, subHeroText: t })}
                    multiline
                    numberOfLines={3}
                />

                <Text style={styles.sectionTitle}>About Section</Text>

                <InputField
                    label="About Title"
                    value={settings.aboutTitle}
                    onChangeText={(t) => setSettings({ ...settings, aboutTitle: t })}
                />

                <InputField
                    label="About Content"
                    value={settings.aboutContent}
                    onChangeText={(t) => setSettings({ ...settings, aboutContent: t })}
                    multiline
                    numberOfLines={5}
                />

                <Text style={styles.sectionTitle}>Contact Information</Text>

                <InputField
                    label="Contact Phone"
                    value={settings.contactPhone}
                    onChangeText={(t) => setSettings({ ...settings, contactPhone: t })}
                />

                <InputField
                    label="Studio Address"
                    value={settings.studioAddress}
                    onChangeText={(t) => setSettings({ ...settings, studioAddress: t })}
                    multiline
                    numberOfLines={3}
                />

                <TouchableOpacity style={styles.mainSaveBtn} onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color={Colors.WHITE} />
                    ) : (
                        <>
                            <Icon name="content-save-outline" size={20} color={Colors.WHITE} style={{ marginRight: 8 }} />
                            <Text style={styles.mainSaveBtnText}>Update Experience Settings</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.BG_CONTENT },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    saveBtnText: { color: Colors.PRIMARY, fontWeight: 'bold', fontSize: 16 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 15 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
    input: {
        backgroundColor: Colors.WHITE,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: Colors.TEXT_PRIMARY,
    },
    textArea: { textAlignVertical: 'top', height: 100 },
    mainSaveBtn: {
        backgroundColor: Colors.PRIMARY,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 30,
        elevation: 4,
        shadowColor: Colors.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    mainSaveBtnText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 },
});
