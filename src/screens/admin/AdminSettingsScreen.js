import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Switch, ActivityIndicator } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import adminService from '../../api/adminService';
import API from '../../api/axios';
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

export default function AdminSettingsScreen({ navigation }) {
    const { logout, user, login } = useContext(AuthContext);
    const [adminInfo, setAdminInfo] = useState({
        name: user?.name || 'Super Admin',
        email: user?.email || 'admin@raisers.com',
        avatar: user?.avatar || 'https://randomuser.me/api/portraits/women/65.jpg'
    });
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadAdminInfo();
    }, []);

    const loadAdminInfo = async () => {
        setLoading(true);
        try {
            const adminId = await AsyncStorage.getItem("userId");
            if (adminId) {
                const res = await adminService.getAdminProfile(adminId).catch(() => ({ data: {} }));
                const data = res.data || {};
                const baseURL = API.defaults.baseURL;

                setAdminInfo({
                    name: data.name || await AsyncStorage.getItem("adminName") || "Super Admin",
                    email: data.email || await AsyncStorage.getItem("adminEmail") || "admin@raisers.com",
                    avatar: data.profilePic
                        ? `${baseURL}/uploads/profiles/${data.profilePic}`
                        : 'https://randomuser.me/api/portraits/women/65.jpg'
                });
            }
        } catch (e) {
            console.log("Error loading admin info", e);
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = () => {
        const options = {
            mediaType: 'photo',
            maxWidth: 1000,
            maxHeight: 1000,
            quality: 0.8,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert("Error", response.errorMessage);
                return;
            }

            const asset = response.assets[0];
            const formData = new FormData();
            formData.append('file', {
                uri: asset.uri,
                type: asset.type,
                name: asset.fileName || `admin_profile_${Date.now()}.jpg`
            });

            setUploading(true);
            try {
                const adminId = await AsyncStorage.getItem("userId");
                if (adminId) {
                    const res = await adminService.uploadAdminProfilePic(adminId, formData);
                    const baseURL = API.defaults.baseURL;
                    const newAvatar = `${baseURL}/uploads/profiles/${res.data.profilePic}`;
                    
                    // Update AuthContext so header updates immediately
                    await login({ ...user, avatar: newAvatar }, null);
                    
                    Alert.alert("Success", "Profile photo updated!");
                    loadAdminInfo();
                }
            } catch (error) {
                console.error("Upload failed", error);
                Alert.alert("Error", "Failed to upload photo");
            } finally {
                setUploading(false);
            }
        });
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, subtitle, onPress, toggle, value, onToggle, color = Colors.TEXT_PRIMARY }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={toggle !== undefined}
        >
            <View style={[styles.iconBox, { backgroundColor: color + "10" }]}>
                <Icon name={icon} size={22} color={color} />
            </View>
            <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {toggle !== undefined ? (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: "#CBD5E1", true: Colors.PRIMARY }}
                    thumbColor={Colors.WHITE}
                />
            ) : (
                <Icon name="chevron-right" size={20} color={Colors.TEXT_MUTED} />
            )}
        </TouchableOpacity>
    );

    return (
        <BaseScreen title="Settings" showBack={true} loading={loading}>
            <View style={styles.container}>
                {/* Profile Section */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: adminInfo?.avatar || 'https://randomuser.me/api/portraits/women/65.jpg' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editAvatarBtn} onPress={handlePickImage} disabled={uploading}>
                            {uploading ? (
                                <ActivityIndicator size="small" color={Colors.WHITE} />
                            ) : (
                                <Icon name="camera" size={16} color={Colors.WHITE} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.adminName}>{adminInfo.name}</Text>
                    <Text style={styles.adminEmail}>{adminInfo.email}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Verified Administrator</Text>
                    </View>
                </View>

                {/* Studio Configuration */}
                <Text style={styles.sectionTitle}>Studio Configuration</Text>
                <View style={styles.card}>
                    <SettingItem
                        icon="currency-usd"
                        title="Fee Settings"
                        subtitle="Tax rates, grace periods, dunning"
                        onPress={() => navigation.navigate("FeeManagement")}
                        color="#E11D48"
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="dance-ballroom"
                        title="Dance Categories"
                        subtitle="Manage genres and class levels"
                        onPress={() => navigation.navigate("DanceTypesManagement")}
                        color="#9333EA"
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="information-outline"
                        title="Studio Information"
                        subtitle="Contact info, address, social links"
                        onPress={() => navigation.navigate("EditAboutUs")}
                        color="#2563EB"
                    />
                </View>

                {/* Account & Security */}
                <Text style={styles.sectionTitle}>Account & Security</Text>
                <View style={styles.card}>
                    <SettingItem
                        icon="bell-outline"
                        title="Push Notifications"
                        toggle
                        value={notificationsEnabled}
                        onToggle={setNotificationsEnabled}
                        color="#0D9488"
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="lock-outline"
                        title="Change Password"
                        subtitle="Keep your account secure"
                        onPress={() => navigation.navigate("ChangePassword")}
                        color={Colors.TEXT_SECONDARY}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="shield-plus-outline"
                        title="Add New Admin"
                        subtitle="Create another admin account"
                        onPress={() => navigation.navigate("AdminRegistration")}
                        color={Colors.PRIMARY}
                    />
                </View>

                {/* Danger Zone */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Icon name="logout" size={20} color={Colors.PRIMARY} style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Logout from Portal</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.2.0 • Build 2024</Text>
            </View>
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    profileCard: { backgroundColor: Colors.WHITE, borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 25, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
    avatarWrapper: { position: 'relative', marginBottom: 15 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#F1F5F9" },
    editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.PRIMARY, width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: Colors.WHITE },
    adminName: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 4 },
    adminEmail: { fontSize: 14, color: Colors.TEXT_SECONDARY, marginBottom: 12 },
    badge: { backgroundColor: "#ECFDF5", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: "#10B981", fontSize: 12, fontWeight: "bold" },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: Colors.TEXT_SECONDARY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    card: { backgroundColor: Colors.WHITE, borderRadius: 24, paddingVertical: 8, paddingHorizontal: 4, marginBottom: 25, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
    settingItem: { flexDirection: "row", alignItems: "center", padding: 16 },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 16 },
    settingText: { flex: 1 },
    settingTitle: { fontSize: 16, fontWeight: "600", color: Colors.TEXT_PRIMARY },
    settingSubtitle: { fontSize: 12, color: Colors.TEXT_MUTED, marginTop: 2 },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginLeft: 76 },
    logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFF1F2", paddingVertical: 16, borderRadius: 20, borderWidth: 1, borderColor: "#FECDD3", marginTop: 10 },
    logoutText: { color: Colors.PRIMARY, fontSize: 16, fontWeight: "bold" },
    versionText: { textAlign: "center", color: Colors.TEXT_MUTED, fontSize: 12, marginTop: 30 }
});
