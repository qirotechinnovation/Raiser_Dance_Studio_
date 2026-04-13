import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "../../theme/Colors";


export default function SkillLevelsScreen({ navigation }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLevels = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSkillLevels();
      setLevels(res.data);
    } catch (e) {
      console.log("Error loading skill levels", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLevels();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Remove this skill level?", [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await adminService.deleteSkillLevel(id);
            loadLevels();
          } catch (e) {
            Alert.alert("Error", "Could not delete");
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Icon name="gauge" size={24} color="#0EA5E9" />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate("AddEditSkillLevel", { level: item })}>
          <Icon name="pencil" size={20} color={Colors.TEXT_SECONDARY} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 15 }}>
          <Icon name="trash-can" size={20} color={Colors.ERROR} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skill Levels</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddEditSkillLevel")}>
          <Icon name="plus-circle" size={30} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={levels}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={styles.empty}>No skill levels defined</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, backgroundColor: Colors.WHITE },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
  container: { flex: 1, padding: 20 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.WHITE, padding: 18, borderRadius: 15, marginBottom: 12, elevation: 2 },
  name: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: "600", color: Colors.TEXT_PRIMARY },
  actions: { flexDirection: "row", alignItems: "center" },
  empty: { textAlign: "center", marginTop: 50, color: Colors.TEXT_MUTED }
});
