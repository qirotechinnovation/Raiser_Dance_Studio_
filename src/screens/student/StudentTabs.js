import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import StudentDashboard from "./StudentDashboard";
import MyBatch from "./MyBatch";
import MyProfile from "./MyProfile";
import MyFees from "./MyFees";


import MyEvents from "./MyEvents";
import ScheduleScreen from "./ScheduleScreen";
import Colors from "../../theme/Colors";



const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.WHITE,
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          height: 60,
          paddingBottom: 10
        },
        tabBarActiveTintColor: Colors.PRIMARY,
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
      <Tab.Screen name="Batch" component={MyBatch}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />
        }}
      />

      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Progress" component={MyFees} />
      <Tab.Screen name="Profile" component={MyProfile} />
    </Tab.Navigator>
  );
}

