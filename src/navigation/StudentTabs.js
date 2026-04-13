import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import studentService from "../api/studentService";

import StudentDashboard from "../screens/student/StudentDashboard";
import MyProfile from "../screens/student/MyProfile";
import MyFees from "../screens/student/MyFees";
import MyEvents from "../screens/student/MyEvents";

const Tab = createBottomTabNavigator();

export default function StudentTabs({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");
      if (studentId) {
        const res = await studentService.getDashboard(studentId);
        setIsActive(res.data.active !== false);
      }
    } catch (error) {
      console.error("Status check failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A00532" />
      </View>
    );
  }

  if (!isActive) {
    return (
      <View style={styles.inactiveContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.inactiveBox}>
          <View style={styles.warningIconBox}>
            <MaterialCommunityIcons name="account-off-outline" size={60} color="#A00532" />
          </View>
          <Text style={styles.inactiveTitle}>Account Inactive</Text>
          <Text style={styles.inactiveSubtitle}>
            Your account has been deactivated by the studio administration.
          </Text>
          <Text style={styles.inactiveNote}>
            Please contact the front desk or your instructor to resolve this.
          </Text>

          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => navigation.navigate("StudioInfo")}
          >
            <Text style={styles.contactBtnText}>Contact Studio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          height: 60,
          paddingBottom: 10
        },
        tabBarActiveTintColor: "#A00532",
        tabBarInactiveTintColor: "#6B7280",
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Schedule") iconName = "calendar";
          else if (route.name === "Progress") iconName = "analytics";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={StudentDashboard} />
      <Tab.Screen name="Schedule" component={MyEvents} />
      <Tab.Screen name="Progress" component={MyFees} />
      <Tab.Screen name="Profile" component={MyProfile} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  inactiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20
  },
  inactiveBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  warningIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  inactiveTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10
  },
  inactiveSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10
  },
  inactiveNote: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 30
  },
  contactBtn: {
    backgroundColor: '#A00532',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  logoutBtn: {
    paddingVertical: 10,
  },
  logoutBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500'
  }
});
