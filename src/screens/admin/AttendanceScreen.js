import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, Animated } from "react-native";
import styles from "./AttendanceStyles";
import API from "../../api/axios";
import Colors from "../../theme/Colors";


export default function AttendanceScreen() {
  const [attendance, setAttendance] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadAttendance = async () => {
    try {
      const res = await API.get("/admin/attendance/batch/1");
      setAttendance(res.data);
    } catch (e) {
      console.log("Error loading attendance", e);
    }
  };

  useEffect(() => {
    loadAttendance();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]); // 👈 fixed dependency warning

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.studentName}</Text>
      <Text style={styles.date}>📅 {item.date}</Text>
      <Text
        style={[
          styles.status,
          { color: item.present ? "#22C55E" : Colors.ERROR },
        ]}
      >
        {item.present ? "Present" : "Absent"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        Attendance
      </Animated.Text>

      <FlatList
        data={attendance}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
