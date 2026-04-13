import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import AdminDashboard from "../screens/admin/AdminDashboard";
import StudentManagementScreen from "../screens/admin/StudentManagementScreen";
import FeeManagementScreen from "../screens/admin/FeeManagementScreen";
import BatchManagementScreen from "../screens/admin/BatchManagementScreen";
import AdminSettingsScreen from "../screens/admin/AdminSettingsScreen";
import AddStudentScreen from "../screens/admin/AddStudentScreen";
import QuickActionModal from "../components/QuickActionModal";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: "#BE123C",
                tabBarInactiveTintColor: "#94A3B8",
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tab.Screen
                name="Home"
                component={AdminDashboard}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
                }}
            />
            <Tab.Screen
                name="Fees"
                component={FeeManagementScreen}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="wallet-outline" size={22} color={color} />,
                }}
            />
            <Tab.Screen
                name="AddStudent"
                component={AddStudentScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{
                            top: -18,
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: '#E11D48',
                            justifyContent: 'center',
                            alignItems: 'center',
                            elevation: 8,
                            shadowColor: '#E11D48',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            borderWidth: 3,
                            borderColor: '#FFFFFF',
                        }}>
                            <Ionicons name="add" size={28} color="#FFFFFF" />
                        </View>
                    ),
                    tabBarLabel: 'Add Student',
                }}
            />
            <Tab.Screen
                name="Schedule"
                component={BatchManagementScreen}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={AdminSettingsScreen}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        paddingBottom: 5,
        paddingTop: 5,
        paddingHorizontal: 5,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
        marginBottom: 2,
    }
});
