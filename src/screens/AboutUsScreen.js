import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import studentService from '../api/studentService';
import API from '../api/axios';
import { Image } from 'react-native';
import Colors from "../theme/Colors";


export default function AboutUsScreen({ navigation }) {
    const [data, setData] = useState(null);
    const [coreValues, setCoreValues] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageLoadStates, setImageLoadStates] = useState({});
    const baseURL = API.defaults.baseURL.replace(/\/$/, ''); // strip trailing slash

    useEffect(() => {
        fetchData();
    }, []);

    const buildImageUri = (path) => {
        if (!path) return null;
        const cleanPath = path.trim().replace(/\\/g, '/'); // fix backslashes
        if (cleanPath.startsWith('http')) return cleanPath;
        const withoutLeadingSlash = cleanPath.replace(/^\//, '');
        const normalized = withoutLeadingSlash.startsWith('uploads/')
            ? withoutLeadingSlash
            : `uploads/${withoutLeadingSlash}`;
        return `${baseURL}/${normalized}`;
    };

    const fetchData = async () => {
        try {
            const response = await studentService.getAboutUsData();
            if (response.data) {
                const settings = response.data.settings || {};
                // 🔍 DEBUG: print raw image paths from API
                console.log('=== About Us API Response ===');
                console.log('image1Path:', settings.image1Path);
                console.log('image2Path:', settings.image2Path);
                console.log('image3Path:', settings.image3Path);
                console.log('gallery count:', (response.data.gallery || []).length);
                if (response.data.gallery?.length) {
                    console.log('gallery[0].imagePath:', response.data.gallery[0].imagePath);
                }
                console.log('baseURL:', API.defaults.baseURL);
                setData(settings);
                setCoreValues(response.data.coreValues || []);
                setGallery(response.data.gallery || []);
            } else {
                console.log('About Us: No data in response', response.data);
            }
        } catch (error) {
            console.error("Failed to load about us data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmail = () => {
        if (data?.email) Linking.openURL(`mailto:${data.email}`);
    };

    const handlePhone = () => {
        if (data?.phone) Linking.openURL(`tel:${data.phone}`);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    if (!data) return null;

    const renderSection = (title, content, icon) => {
        if (!content) return null;
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Icon name={icon} size={24} color={Colors.PRIMARY} />
                    <Text style={styles.cardTitle}>{title}</Text>
                </View>
                <Text style={styles.description}>{content}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <LinearGradient colors={[Colors.PRIMARY, '#9F1239']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={26} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Us</Text>
                <View style={{ width: 26 }} />
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Studio Images Section */}
                {(data.image1Path || data.image2Path || data.image3Path) && (
                    <View style={styles.studioImagesContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled>
                            {[data.image1Path, data.image2Path, data.image3Path].filter(p => p).map((path, index) => {
                                const imageUri = buildImageUri(path);
                                console.log(`[StudioImage ${index}] path: "${path}" -> uri: "${imageUri}"`);
                                return (
                                    <View key={index} style={styles.studioHeroImageWrapper}>
                                        {!imageLoadStates[`hero_${index}`] && (
                                            <ActivityIndicator size="small" color={Colors.PRIMARY} style={StyleSheet.absoluteFill} />
                                        )}
                                        <Image
                                            source={{ uri: imageUri }}
                                            style={styles.studioHeroImage}
                                            resizeMode="cover"
                                            onLoad={() => setImageLoadStates(prev => ({ ...prev, [`hero_${index}`]: true }))}
                                            onError={(e) => {
                                                console.log(`[StudioImage ${index}] LOAD ERROR:`, e.nativeEvent.error);
                                                console.log(`[StudioImage ${index}] Failed URI:`, imageUri);
                                                setImageLoadStates(prev => ({ ...prev, [`hero_${index}`]: true }));
                                            }}
                                        />
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Hero Section */}
                <View style={[styles.heroSection, (data.image1Path || data.image2Path || data.image3Path) && { marginTop: -40 }]}>
                    <View style={styles.logoContainer}>
                        <Icon name="dance-ballroom" size={80} color={Colors.PRIMARY} />
                    </View>
                    <Text style={styles.studioName}>{data.studioName || "Raiser's Dance Studio"}</Text>
                    <Text style={styles.tagline}>{data.tagline || "Where Passion Rises & Talent Transforms"}</Text>
                </View>

                {/* Fallback to static About Us content */}
                {renderSection("About Us", data.aboutText, "information-outline")}
                {renderSection("Our Passion", data.passionText, "heart-outline")}

                <View style={styles.divider} />

                {/* Programs & Info */}
                {renderSection("Class Types", data.classTypesInfo, "clipboard-list-outline")}
                {renderSection("Skill Levels", data.skillLevelsInfo, "stairs")}
                {renderSection("Dance Styles", data.danceStylesInfo, "music-note-eighth")}

                {renderSection("Training Plan", data.trainingPlanText, "run")}
                {renderSection("Kids Program", data.kidsProgramText, "emoticon-happy-outline")}
                {renderSection("Teen Classes", data.teenClassesText, "account-star-outline")}
                {renderSection("Adult Classes", data.adultClassesText, "human-female-dance")}

                {renderSection("Competition Team", data.competitionTeamText, "trophy-outline")}
                {renderSection("Private Lessons", data.privateLessonsText, "account-tie")}

                {/* Core Values Section */}
                {coreValues.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="diamond-stone" size={24} color={Colors.PRIMARY} />
                            <Text style={styles.cardTitle}>Our Core Values</Text>
                        </View>
                        <View style={styles.valuesGrid}>
                            {coreValues.map((v, i) => (
                                <View key={i} style={styles.valueItem}>
                                    <View style={styles.valueIconBox}>
                                        <Icon name={v.icon || "star"} size={20} color={Colors.PRIMARY} />
                                    </View>
                                    <Text style={styles.valueTitle}>{v.title}</Text>
                                    <Text style={styles.valueDesc}>{v.description}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Contact Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="phone-outline" size={24} color={Colors.PRIMARY} />
                        <Text style={styles.cardTitle}>Get In Touch</Text>
                    </View>

                    <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                        <Icon name="email-outline" size={20} color={Colors.TEXT_SECONDARY} />
                        <Text style={styles.contactText}>{data.email || "Raisersdancestudio@gmail.com"}</Text>
                        <Icon name="chevron-right" size={20} color={Colors.TEXT_MUTED} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactItem} onPress={handlePhone}>
                        <Icon name="phone" size={20} color={Colors.TEXT_SECONDARY} />
                        <Text style={styles.contactText}>{data.phone || "9503399763"}</Text>
                        <Icon name="chevron-right" size={20} color={Colors.TEXT_MUTED} />
                    </TouchableOpacity>

                    {data.address && (
                        <View style={styles.contactItem}>
                            <Icon name="map-marker-outline" size={20} color={Colors.TEXT_SECONDARY} />
                            <Text style={styles.contactText}>{data.address}</Text>
                        </View>
                    )}
                </View>

                {/* Gallery Section - Now Last */}
                {gallery.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="image-multiple-outline" size={24} color={Colors.PRIMARY} />
                            <Text style={styles.cardTitle}>Moments of Joy</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                            {gallery.map((item, index) => {
                                const galleryUri = buildImageUri(item.imagePath);
                                console.log(`[Gallery ${index}] path: "${item.imagePath}" -> uri: "${galleryUri}"`);
                                return (
                                    <View key={index} style={styles.galleryItem}>
                                        <View style={styles.galleryCardContainer}>
                                            {!imageLoadStates[`gallery_${index}`] && (
                                                <ActivityIndicator size="small" color={Colors.PRIMARY} style={StyleSheet.absoluteFill} />
                                            )}
                                            {galleryUri ? (
                                                <Image
                                                    source={{ uri: galleryUri }}
                                                    style={styles.galleryImage}
                                                    resizeMode="cover"
                                                    onLoad={() => setImageLoadStates(prev => ({ ...prev, [`gallery_${index}`]: true }))}
                                                    onError={(e) => {
                                                        console.log(`[Gallery ${index}] LOAD ERROR:`, e.nativeEvent.error);
                                                        console.log(`[Gallery ${index}] Failed URI:`, galleryUri);
                                                        setImageLoadStates(prev => ({ ...prev, [`gallery_${index}`]: true }));
                                                    }}
                                                />
                                            ) : null}
                                            <LinearGradient 
                                                colors={['transparent', 'rgba(0,0,0,0.8)']} 
                                                style={styles.galleryOverlay}
                                            >
                                                <Text style={styles.galleryName}>{item.eventName}</Text>
                                            </LinearGradient>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        elevation: 4,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.WHITE },
    scrollContent: { padding: 20 },

    heroSection: {
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: 20,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF1F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3,
        shadowColor: Colors.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    studioName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.TEXT_PRIMARY,
        marginBottom: 8,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 14,
        color: Colors.TEXT_SECONDARY,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingHorizontal: 20,
    },
    studioImagesContainer: {
        height: 250,
        marginHorizontal: -20,
        marginBottom: 20,
        backgroundColor: Colors.BORDER
    },
    studioHeroImageWrapper: {
        width: width,
        height: 250,
        backgroundColor: Colors.BORDER,
        overflow: 'hidden',
    },
    studioHeroImage: {
        width: width,
        height: 250,
    },

    card: {
        backgroundColor: Colors.WHITE,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.TEXT_PRIMARY,
        marginLeft: 10,
    },
    description: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.BORDER,
        marginVertical: 20,
    },

    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.BG_CONTENT,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    contactText: {
        flex: 1,
        fontSize: 15,
        color: Colors.TEXT_PRIMARY,
        marginLeft: 12,
        fontWeight: '500',
    },

    // New Styles
    valuesGrid: { marginTop: 10 },
    valueItem: { marginBottom: 15, backgroundColor: Colors.BG_CONTENT, padding: 15, borderRadius: 12 },
    valueIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    valueTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginBottom: 4 },
    valueDesc: { fontSize: 13, color: Colors.TEXT_SECONDARY, lineHeight: 20 },

    galleryItem: { marginRight: 15, width: 220 },
    galleryCardContainer: { width: 220, height: 140, borderRadius: 15, overflow: 'hidden', backgroundColor: Colors.BORDER },
    galleryImage: { width: '100%', height: '100%' },
    galleryOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, height: 60, justifyContent: 'flex-end' },
    galleryName: { fontSize: 13, fontWeight: 'bold', color: Colors.WHITE, textAlign: 'left' }
});
