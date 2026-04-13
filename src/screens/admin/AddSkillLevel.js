import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


export default function AddSkillLevel({ navigation, route }) {
  const editLevel = route.params?.level;
  const isEdit = !!editLevel;

  const [name, setName] = useState(editLevel?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await adminService.updateSkillLevel(editLevel.id, { ...editLevel, name });
        Alert.alert("Success", "Skill level updated");
      } else {
        await adminService.createSkillLevel({ name });
        Alert.alert("Success", "Skill level added");
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Failed to save skill level");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? "Edit Skill Level" : "New Skill Level"}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>SKILL LEVEL NAME</Text>
        <TextInput
          placeholder="e.g. Beginner, Intermediate, Elite"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={Colors.TEXT_MUTED}
        />

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <Text style={styles.saveText}>{isEdit ? "Update Level" : "Create Level"}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, backgroundColor: Colors.WHITE },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
  container: { padding: 25 },
  label: { fontSize: 12, fontWeight: "bold", color: Colors.TEXT_SECONDARY, marginBottom: 12, letterSpacing: 1 },
  input: { backgroundColor: Colors.WHITE, borderRadius: 15, paddingHorizontal: 15, height: 60, fontSize: 16, color: Colors.TEXT_PRIMARY, borderWidth: 1, borderColor: Colors.BORDER },
  saveBtn: { backgroundColor: Colors.PRIMARY, height: 60, borderRadius: 20, justifyContent: "center", alignItems: "center", marginTop: 30, elevation: 4 },
  saveText: { color: Colors.WHITE, fontSize: 18, fontWeight: "bold" }
});
