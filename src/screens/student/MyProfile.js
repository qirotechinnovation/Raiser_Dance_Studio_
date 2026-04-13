import React, { useEffect, useRef, useState, useCallback, useContext } from "react";
import { View, Text, Animated, Image, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from 'react-native-image-picker';
import studentService from "../../api/studentService";
import { useFocusEffect } from '@react-navigation/native';
import Colors from "../../theme/Colors";
import { AuthContext } from "../../context/AuthContext";
import BaseScreen from "../../components/BaseScreen";

export default function MyProfile({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: "Loading...",
    email: "",
    mobile: "",
    studentId: "",
    admissionDate: "",
    classType: "",
    trainPlan: "",
    skillLevel: "",
    danceType: "",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg" 
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadProfile();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadProfile = async () => {
    try {
      const id = await AsyncStorage.getItem("studentId");
      if (id) {
        const response = await studentService.getProfile(id);
        if (response.data) {
          setProfile(response.data);
        }
      }
    } catch (error) {
      console.log("Load Profile Error", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: async () => {
          await logout();
        } 
      }
    ]);
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const formData = new FormData();
        formData.append('file', { 
          uri: asset.uri, 
          type: asset.type, 
          name: asset.fileName || `profile_${Date.now()}.jpg` 
        });

        try {
          const id = await AsyncStorage.getItem("studentId");
          if (id) {
            const uploadRes = await studentService.uploadProfilePic(id, formData);
            if (uploadRes.status === 200) {
                Alert.alert("Success", "Profile photo updated!");
                loadProfile();
            }
          }
        } catch (error) {
          console.log("Upload error", error);
          Alert.alert("Error", "Failed to upload photo.");
        }
      }
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
  }, []);

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Icon name={icon} size={20} color={Colors.PRIMARY} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={styles.valueText}>{value || "Not Set"}</Text>
      </View>
    </View>
  );

  return (
    <BaseScreen 
      title="Profile" 
      loading={loading}
      useGradient={true}
      actions={[{ icon: 'pencil', onPress: () => navigation.navigate("EditProfile", { profile }) }]}
      scrollContentStyle={{ padding: 25 }}
    >
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Avatar Section */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image 
                source={{ uri: profile.avatar ? `${profile.avatar}?t=${new Date().getTime()}` : "https://randomuser.me/api/portraits/women/44.jpg" }} 
                style={styles.avatar} 
            />
            <TouchableOpacity style={styles.cameraIcon} onPress={handlePickImage}>
              <Icon name="camera" size={20} color={Colors.WHITE} />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{profile.name}</Text>
          <Text style={styles.subtextText}>{profile.danceType || "Dance Type"} • {profile.skillLevel || "Level"}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Active Student</Text>
          </View>
        </View>

        {/* Info Cards */}
        <Text style={styles.sectionTitle}>Contact Details</Text>
        <View style={styles.card}>
          <InfoRow icon="email-outline" label="Email" value={profile.email} />
          <View style={styles.divider} />
          <InfoRow icon="phone-outline" label="Phone" value={profile.mobile} />
        </View>

        <Text style={styles.sectionTitle}>Academic Info</Text>
        <View style={styles.card}>
          <InfoRow icon="card-account-details-outline" label="Student ID" value={`#${profile.studentId}`} />
          <View style={styles.divider} />
          <InfoRow icon="calendar-clock" label="Admission Date" value={profile.admissionDate} />
          <View style={styles.divider} />
          <InfoRow icon="school-outline" label="Class Type" value={profile.classType} />
        </View>

        <Text style={styles.sectionTitle}>Training Plan</Text>
        <View style={styles.card}>
          <InfoRow icon="notebook-outline" label="Current Plan" value={profile.trainPlan} />
          <View style={styles.divider} />
          <InfoRow icon="trophy-outline" label="Skill Level" value={profile.skillLevel} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="logout" size={20} color={Colors.PRIMARY} style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </Animated.View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', marginBottom: 25 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: Colors.WHITE, backgroundColor: Colors.BORDER },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.PRIMARY, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.WHITE },
  nameText: { fontSize: 22, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginBottom: 4 },
  subtextText: { fontSize: 14, color: Colors.TEXT_SECONDARY, marginBottom: 12 },
  badge: { backgroundColor: "#ECFDF5", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#10B981", fontWeight: 'bold', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginBottom: 12, marginTop: 10 },
  card: { backgroundColor: Colors.WHITE, borderRadius: 20, padding: 16, marginBottom: 10, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, borderWidth: 1, borderColor: Colors.BORDER },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F1F5F9", justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  labelText: { fontSize: 12, color: Colors.TEXT_MUTED, fontWeight: '600', marginBottom: 2 },
  valueText: { fontSize: 16, color: Colors.TEXT_PRIMARY, fontWeight: '500' },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 8, marginLeft: 56 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25, marginBottom: 20, paddingVertical: 15, borderRadius: 15, backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: Colors.BORDER },
  logoutText: { color: Colors.PRIMARY, fontSize: 16, fontWeight: 'bold' },
});
