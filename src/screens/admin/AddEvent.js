import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, StatusBar, ScrollView, Alert } from "react-native";
import API from "../../api/axios";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomDateTimePicker from '../../components/CustomDateTimePicker';
import Colors from "../../theme/Colors";


export default function AddEvent({ navigation }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');

  const save = async () => {
    if (!title || !date) {
      Alert.alert("Error", "Title and Date are required");
      return;
    }
    try {
      await API.post("/admin/events", { title, date, venue, time, description });
      Alert.alert("Success", "Event Created!");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Failed to create event");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color="#000" /></TouchableOpacity>
        <Text style={styles.title}>Create New Event</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Event Title</Text>
        <TextInput style={styles.input} placeholder="e.g. Summer Dance Workshop" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={() => { setPickerMode('date'); setPickerVisible(true); }}>
          <View pointerEvents="none">
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={date} editable={false} />
            <Icon name="calendar" size={20} color="#666" style={styles.icon} />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity onPress={() => { setPickerMode('time'); setPickerVisible(true); }}>
          <View pointerEvents="none">
            <TextInput style={styles.input} placeholder="e.g. 10:00 AM" value={time} editable={false} />
            <Icon name="clock-outline" size={20} color="#666" style={styles.icon} />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Venue</Text>
        <TextInput style={styles.input} placeholder="e.g. Main Studio Hall" value={venue} onChangeText={setVenue} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Event details..." multiline value={description} onChangeText={setDescription} />

        <TouchableOpacity onPress={save} style={styles.btn}>
          <Text style={styles.btnText}>Create Event</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomDateTimePicker
        visible={pickerVisible}
        mode={pickerMode}
        onClose={() => setPickerVisible(false)}
        onSelect={(val) => {
          if (pickerMode === 'date') setDate(val);
          else setTime(val);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.WHITE, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, color: '#000' },
  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: Colors.TEXT_SECONDARY, marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: Colors.WHITE, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#CBD5E1', color: '#000' },
  icon: { position: 'absolute', right: 15, top: 12 },
  btn: { backgroundColor: Colors.PRIMARY, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  btnText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 }
});
