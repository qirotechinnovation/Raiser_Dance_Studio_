import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";


const { width } = Dimensions.get("window");

export default function EventsCategoriesScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [events, setEvents] = useState([]);
    const [danceTypes, setDanceTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [eventsRes, danceTypesRes] = await Promise.all([
                adminService.getEvents(),
                adminService.getDanceTypes()
            ]);
            setEvents(eventsRes.data);
            setDanceTypes(danceTypesRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditEvent = (item) => {
        navigation.navigate('AddEditEvent', { event: item });
    };

    const renderEventCard = ({ item }) => (
        <TouchableOpacity style={styles.eventCard} onPress={() => handleEditEvent(item)}>
            <Image
                source={{ uri: item.photo ? `${adminService.BASE_URL}/uploads/events/${item.photo}` : 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400' }}
                style={styles.eventImage}
            />
            <View style={styles.eventOverlay}>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{item.date ? item.date.split('-')[2] : '15'} {item.date ? new Date(item.date).toLocaleString('default', { month: 'short' }).toUpperCase() : 'AUG'}</Text>
                </View>
                <View style={styles.eventBottomInfo}>
                    <Text style={styles.eventTitle}>{item.title || "Summer Blast 2024"}</Text>
                    <View style={styles.venueRow}>
                        <Icon name="map-marker" size={14} color={Colors.WHITE} />
                        <Text style={styles.venueText}>{item.venue || "Grand Theater"}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderDanceType = ({ item, index }) => (
        <TouchableOpacity key={item.id || index} style={styles.danceCard}>
            <Image
                source={{ uri: `https://images.unsplash.com/photo-1547153760-18fc26048965?auto=format&fit=crop&q=80&w=200&sig=${index}` }}
                style={styles.danceImage}
            />
            <View style={styles.danceOverlay}>
                <Text style={styles.danceName}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerLabel}>DASHBOARD</Text>
                    <Text style={styles.headerTitle}>Dynamic Events Hub</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEditEvent')}>
                    <Icon name="plus-circle" size={32} color={Colors.PRIMARY} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <Icon name="magnify" size={24} color={Colors.PRIMARY} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search events or styles..."
                            placeholderTextColor={Colors.TEXT_MUTED}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('EventsManagement')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.PRIMARY} />
                    ) : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={events}
                            renderItem={renderEventCard}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.eventsList}
                        />
                    )}
                </View>

                <View style={[styles.sectionHeader, { marginTop: 30 }]}>
                    <View>
                        <Text style={styles.sectionTitle}>Dance Types</Text>
                        <Text style={styles.sectionSub}>Explore {danceTypes.length} genres</Text>
                    </View>
                </View>

                <View style={styles.danceGrid}>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.PRIMARY} />
                    ) : (
                        danceTypes.map((item, index) => (
                            <View key={item.id || index} style={styles.danceCardWrapper}>
                                {renderDanceType({ item, index })}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.WHITE },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerLabel: { fontSize: 10, fontWeight: "bold", color: Colors.PRIMARY, letterSpacing: 1 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    addBtn: { padding: 5 },
    searchSection: { paddingHorizontal: 20, marginTop: 10 },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.WHITE,
        height: 55,
        borderRadius: 27.5,
        paddingHorizontal: 20,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: Colors.TEXT_PRIMARY },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, marginTop: 30, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    sectionSub: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginTop: 2 },
    seeAll: { fontSize: 14, fontWeight: "bold", color: Colors.PRIMARY },
    eventsList: { paddingLeft: 20, paddingRight: 5 },
    eventCard: {
        width: width * 0.7,
        height: 280,
        borderRadius: 30,
        marginRight: 15,
        overflow: 'hidden',
        backgroundColor: "#F1F5F9"
    },
    eventImage: { width: "100%", height: "100%" },
    eventOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)', padding: 20, justifyContent: 'space-between' },
    dateBadge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.PRIMARY,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    dateBadgeText: { color: Colors.WHITE, fontSize: 12, fontWeight: 'bold' },
    eventBottomInfo: { marginBottom: 10 },
    eventTitle: { color: Colors.WHITE, fontSize: 18, fontWeight: 'bold' },
    venueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    venueText: { color: Colors.WHITE, fontSize: 12, marginLeft: 4 },
    danceGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 15,
    },
    danceCardWrapper: {
        width: "50%",
        padding: 5,
    },
    danceCard: {
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: "#F1F5F9"
    },
    danceImage: { width: "100%", height: "100%" },
    danceOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 15,
        justifyContent: 'flex-end'
    },
    danceName: { color: Colors.WHITE, fontSize: 16, fontWeight: 'bold' }
});
