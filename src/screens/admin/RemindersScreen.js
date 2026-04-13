import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import API from "../../api/axios";

export default function RemindersScreen() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    API.get("/api/admin/reminders").then(res => setReminders(res.data));
  }, []);

  return (
    <View>
      <Text>Reminders</Text>

      <FlatList
        data={reminders}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.message}</Text>
        )}
      />
    </View>
  );
}
