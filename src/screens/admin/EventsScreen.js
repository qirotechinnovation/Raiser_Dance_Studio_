import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import API from "../../api/axios";

export default function EventsScreen() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    API.get("/api/admin/events").then(res => setEvents(res.data));
  }, []);

  return (
    <View style={{ padding: 16 }}>
      <Text>Events</Text>

      <FlatList
        data={events}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}
