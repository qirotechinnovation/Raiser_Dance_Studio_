import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import AdminDashboard from "./AdminDashboard";
import StudentManagementScreen from "./StudentManagementScreen";
import FeeManagementScreen from "./FeeManagementScreen";
import BatchManagementScreen from "./BatchManagementScreen";

const Tab = createBottomTabNavigator();

export default function AdminTabs({ navigation }) {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: "#A00532",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginBottom: 5 },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;
            if (route.name === "Home") iconName = "view-grid";
            else if (route.name === "Students") iconName = "account-group";
            else if (route.name === "Fees") iconName = "wallet-outline";
            else if (route.name === "Schedule") iconName = "calendar";
            else if (route.name === "AddStudent") iconName = "Add";
            else if (route.name === "Settings") iconName = "cog-outline";

            return <Icon name={iconName} size={28} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={AdminDashboard} />
        <Tab.Screen name="Students" component={StudentManagementScreen} />
        <Tab.Screen
          name="Add"
          component={View} // Dummy component
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("AddStudent");
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <View style={styles.plusBtn}>
                <Icon name="plus" size={32} color="#fff" />
              </View>
            )
          }}
        />
        <Tab.Screen name="Schedule" component={BatchManagementScreen} />
        <Tab.Screen name="Fees" component={FeeManagementScreen} />
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    backgroundColor: "#fff",
    elevation: 10,
    borderTopWidth: 0,
  },
  plusBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#A00532",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30, // Floats above
    elevation: 5,
  }
});
