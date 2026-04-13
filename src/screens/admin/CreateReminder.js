import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Animated } from "react-native";
import styles from "./CreateReminderStyles";
import API from "../../api/axios";

export default function CreateReminder() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]); // 👈 fixed dependency warning

  const handleCreate = async () => {
    try {
      await API.post("/admin/reminder/create", { title, message });
      alert("Reminder Sent 🔔");
      setTitle("");
      setMessage("");
    } catch (e) {
      alert("Failed to send reminder");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.header}>Create Reminder</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Message"
          placeholderTextColor="#9CA3AF"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>SEND</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
