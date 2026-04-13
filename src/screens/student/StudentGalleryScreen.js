import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import API from "../../api/axios";
import adminService from "../../api/adminService"; // Reusing the gallery fetcher
import Colors from "../../theme/Colors";


const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 60) / 2;

const CATEGORIES = [
    { id: 'ALL', label: 'All Photos', icon: 'apps' },
    { id: 'WEDDING', label: 'Weddings', icon: 'human-male-female' },
    { id: 'EVENT', label: 'Events', icon: 'star' },
    { id: 'CLASS', label: 'Classes', icon: 'school' },
    { id: 'GENERAL', label: 'Studio', icon: 'image-multiple' }
];

const StudentGalleryScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    const baseURL = API.defaults.baseURL;

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const res = await adminService.getGalleryItems();
            setItems(res.data || []);
            setFilteredItems(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterByCategory = (catId) => {
        setSelectedCategory(catId);
        if (catId === 'ALL') {
            setFilteredItems(items);
        } else {
            setFilteredItems(items.filter(item => item.category === catId));
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <LinearGradient colors={[Colors.TEXT_PRIMARY, Colors.PRIMARY_DARK]} style={styles.headerGradient}>
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={26} color={Colors.WHITE} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Studio Gallery</Text>
                    <View style={{ width: 40 }} />
                </View>

                <FlatList
                    horizontal
                    data={CATEGORIES}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.catChip, selectedCategory === item.id && styles.catChipActive]}
                            onPress={() => filterByCategory(item.id)}
                        >
                            <Icon name={item.icon} size={16} color={selectedCategory === item.id ? Colors.WHITE : Colors.TEXT_MUTED} />
                            <Text style={[styles.catChipText, selectedCategory === item.id && styles.catChipTextActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </LinearGradient>
        </View>
    );

    const renderGalleryItem = ({ item }) => (
        <TouchableOpacity style={styles.galleryItem} activeOpacity={0.9}>
            <Image
                source={{ uri: `${baseURL}/uploads/${item.imagePath}` }}
                style={styles.galleryImage}
                resizeMode="cover"
            />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.itemOverlay}>
                <Text style={styles.itemTitle}>{item.eventName}</Text>
                <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {renderHeader()}

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={Colors.PRIMARY} />
                    <Text style={styles.loadingText}>Loading Moments...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    renderItem={renderGalleryItem}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Icon name="image-off-outline" size={60} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No photos found in this category.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { height: 160 },
    headerGradient: { flex: 1, padding: 20, justifyContent: 'space-between' },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold', color: Colors.WHITE },
    categoryList: { paddingVertical: 10 },
    catChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    catChipActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
    catChipText: { color: Colors.TEXT_MUTED, fontSize: 13, fontWeight: 'bold' },
    catChipTextActive: { color: Colors.WHITE },

    listContent: { padding: 20 },
    galleryItem: {
        width: COLUMN_WIDTH,
        height: COLUMN_WIDTH * 1.3,
        margin: 5,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Colors.BORDER,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    galleryImage: { width: '100%', height: '100%' },
    itemOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        height: '40%',
        justifyContent: 'flex-end'
    },
    itemTitle: { color: Colors.WHITE, fontSize: 12, fontWeight: 'bold' },
    itemDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },

    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: Colors.TEXT_SECONDARY, fontWeight: 'bold' },
    emptyBox: { flex: 1, marginTop: 100, alignItems: 'center' },
    emptyText: { marginTop: 15, color: Colors.TEXT_MUTED, fontSize: 14, fontWeight: '500' }
});

export default StudentGalleryScreen;
