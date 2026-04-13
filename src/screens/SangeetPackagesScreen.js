import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, Animated, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import studentService from "../api/studentService";
import Colors from "../theme/Colors";

const { width } = Dimensions.get("window");

export default function SangeetPackagesScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [packages, setPackages] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        fetchPackages();
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await studentService.getSangeetPackages();
            setPackages(response.data || []);
        } catch (error) {
            console.error("Error fetching packages:", error);
            Alert.alert("Error", "Failed to load packages. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (packageId, packageName) => {
        try {
            setBookingLoading(true);
            const studentId = await AsyncStorage.getItem("studentId");
            if (!studentId) {
                Alert.alert("Error", "Please login first");
                return;
            }

            const eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + 30);
            const dateStr = eventDate.toISOString().split('T')[0];

            const response = await studentService.bookSangeetPackage({
                studentId,
                packageId,
                eventDate: dateStr
            });

            if (response.data?.status === 'queued') {
                Alert.alert("Saved Offline", response.data.message, [{ text: "OK", onPress: () => navigation.goBack() }]);
            } else {
                Alert.alert(
                    "Inquiry Sent! 🎉",
                    `Your request for ${packageName} has been sent. Our team will contact you soon!`,
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            if (!error.response) return;
            Alert.alert("Error", "Failed to send inquiry. Please try again.");
        } finally {
            setBookingLoading(false);
        }
    };

    const parseFeatures = (details) => {
        if (!details) return [];
        return details.split(',').map(f => f.trim()).filter(f => f.length > 0);
    };

    const getTierStyle = (index, total) => {
        if (index === total - 1) return { isPremium: true, isPopular: false }; // last = premium
        if (index === 1) return { isPremium: false, isPopular: true }; // second = popular
        return { isPremium: false, isPopular: false };
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Gradient Header */}
            <LinearGradient
                colors={[Colors.PRIMARY, Colors.PRIMARY_DARK || '#7f0f2b']}
                style={[styles.header, { paddingTop: insets.top + 15 }]}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={24} color={Colors.WHITE} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <View style={styles.headerBadge}>
                            <Icon name="star" size={12} color={Colors.PRIMARY} />
                            <Text style={styles.headerBadgeText}>TEAM RAISER'S</Text>
                        </View>
                        <Text style={styles.headerTitle}>Wedding Choreography</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate("StudentSangeetInquiries")} style={styles.backBtn}>
                        <Icon name="calendar-text-outline" size={24} color={Colors.WHITE} />
                    </TouchableOpacity>
                </View>

                {/* Quote */}
                <View style={styles.quoteBanner}>
                    <Icon name="format-quote-open" size={28} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.quoteText}>Making you look like dancing stars on your special day</Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.PRIMARY} />
                        <Text style={styles.loadingText}>Loading packages...</Text>
                    </View>
                ) : (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {/* Section Title */}
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionLine} />
                            <Text style={styles.sectionTitle}>OUR PACKAGES</Text>
                            <View style={styles.sectionLine} />
                        </View>

                        {packages.length > 0 ? packages.map((pkg, index) => {
                            const { isPremium, isPopular } = getTierStyle(index, packages.length);
                            const features = parseFeatures(pkg.details);

                            return (
                                <View key={pkg.id} style={[
                                    styles.card,
                                    isPopular && styles.popularCard,
                                    isPremium && styles.premiumCard,
                                ]}>
                                    {isPopular && (
                                        <View style={styles.popularBadge}>
                                            <Icon name="star" size={10} color="#fff" />
                                            <Text style={styles.popularText}>MOST POPULAR</Text>
                                        </View>
                                    )}
                                    {isPremium && (
                                        <View style={styles.premiumBadge}>
                                            <Icon name="crown" size={12} color="#FDE68A" />
                                            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                                        </View>
                                    )}

                                    {/* Package Header */}
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.packageIconBox, isPremium && { backgroundColor: 'rgba(253,230,138,0.15)' }]}>
                                            <Icon
                                                name={isPremium ? "crown" : (isPopular ? "medal" : "music")}
                                                size={26}
                                                color={isPremium ? "#FDE68A" : (isPopular ? Colors.PRIMARY : Colors.TEXT_SECONDARY)}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.packageName, isPremium && styles.premiumText, isPopular && { color: Colors.PRIMARY }]}>
                                                {pkg.name}
                                            </Text>
                                            <Text style={[styles.packageTheme, isPremium && { color: 'rgba(255,255,255,0.5)' }]}>
                                                {pkg.theme || 'Modern Fusion Choreography'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[styles.divider, isPremium && { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

                                    {/* Price */}
                                    <View style={styles.priceRow}>
                                        <Text style={[styles.currency, isPremium && styles.premiumText]}>₹</Text>
                                        <Text style={[styles.price, isPremium && styles.premiumText, isPopular && { color: Colors.PRIMARY }]}>
                                            {Number(pkg.price).toLocaleString('en-IN')}
                                        </Text>
                                        <Text style={[styles.period, isPremium && { color: 'rgba(255,255,255,0.4)' }]}> / full package</Text>
                                    </View>

                                    {/* Features */}
                                    <View style={[styles.featuresBox, isPremium && { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                                        <Text style={[styles.includesLabel, isPremium && { color: 'rgba(255,255,255,0.4)' }]}>INCLUDES</Text>
                                        {features.map((feature, idx) => (
                                            <View key={idx} style={styles.featureRow}>
                                                <Icon
                                                    name="check-circle"
                                                    size={16}
                                                    color={isPremium ? "#FDE68A" : (isPopular ? Colors.PRIMARY : '#10B981')}
                                                />
                                                <Text style={[styles.featureText, isPremium && { color: 'rgba(255,255,255,0.8)' }]}>
                                                    {feature}
                                                </Text>
                                            </View>
                                        ))}
                                        {pkg.numberOfDances > 0 && (
                                            <View style={styles.featureRow}>
                                                <Icon name="check-circle" size={16} color={isPremium ? "#FDE68A" : (isPopular ? Colors.PRIMARY : '#10B981')} />
                                                <Text style={[styles.featureText, isPremium && { color: 'rgba(255,255,255,0.8)' }]}>
                                                    {pkg.numberOfDances} Dance Routines for family
                                                </Text>
                                            </View>
                                        )}
                                        {pkg.duration && (
                                            <View style={styles.featureRow}>
                                                <Icon name="clock-outline" size={16} color={isPremium ? "#FDE68A" : Colors.TEXT_SECONDARY} />
                                                <Text style={[styles.featureText, isPremium && { color: 'rgba(255,255,255,0.8)' }]}>
                                                    Duration: {pkg.duration}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Book Button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.bookBtn,
                                            isPopular && { backgroundColor: Colors.PRIMARY },
                                            isPremium && { backgroundColor: '#FDE68A' },
                                            bookingLoading && { opacity: 0.5 }
                                        ]}
                                        onPress={() => handleBook(pkg.id, pkg.name)}
                                        disabled={bookingLoading}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={[
                                            styles.bookBtnText,
                                            isPopular && { color: Colors.WHITE },
                                            isPremium && { color: '#1c1917' }
                                        ]}>
                                            {bookingLoading ? "Sending..." : "Select This Plan"}
                                        </Text>
                                        <Icon
                                            name="arrow-right"
                                            size={18}
                                            color={isPremium ? '#1c1917' : (isPopular ? Colors.WHITE : Colors.TEXT_SECONDARY)}
                                        />
                                    </TouchableOpacity>
                                </View>
                            );
                        }) : (
                            <View style={styles.emptyContainer}>
                                <Icon name="package-variant-closed" size={60} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No Packages Yet</Text>
                                <Text style={styles.emptyText}>Check back soon for our choreography packages!</Text>
                            </View>
                        )}

                        {/* Contact Footer */}
                        <View style={styles.contactContainer}>
                            <Icon name="headset" size={28} color={Colors.PRIMARY} />
                            <Text style={styles.contactTitle}>Need a Custom Package?</Text>
                            <Text style={styles.contactSub}>For corporate events, large wedding parties, or special requirements</Text>
                            <TouchableOpacity style={styles.contactBtn}>
                                <Icon name="email-outline" size={18} color={Colors.PRIMARY} />
                                <Text style={styles.contactBtnText}>Contact Sales Team</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingBottom: 25,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 6,
        gap: 4,
    },
    headerBadgeText: {
        color: Colors.PRIMARY,
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    headerTitle: {
        color: Colors.WHITE,
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
    },
    quoteBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 14,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    quoteText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        fontStyle: 'italic',
        flex: 1,
        lineHeight: 20,
    },

    scrollView: { flex: 1 },

    loadingContainer: { paddingTop: 80, alignItems: 'center' },
    loadingText: { marginTop: 12, color: Colors.TEXT_SECONDARY, fontSize: 14 },

    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 28,
        marginBottom: 20,
    },
    sectionLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    sectionTitle: {
        marginHorizontal: 14,
        fontSize: 12,
        fontWeight: '800',
        color: Colors.TEXT_SECONDARY,
        letterSpacing: 2,
    },

    // Cards
    card: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: Colors.WHITE,
        borderRadius: 24,
        padding: 22,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    popularCard: {
        borderColor: Colors.PRIMARY,
        borderWidth: 2,
        elevation: 8,
        shadowColor: Colors.PRIMARY,
        shadowOpacity: 0.15,
    },
    premiumCard: {
        backgroundColor: '#111827',
        borderColor: '#1F2937',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.4,
    },

    popularBadge: {
        position: 'absolute',
        top: -12,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.PRIMARY,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    popularText: { color: Colors.WHITE, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

    premiumBadge: {
        position: 'absolute',
        top: -12,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDE68A',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    premiumBadgeText: { color: '#92400E', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    packageIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    packageName: { fontSize: 18, fontWeight: '800', color: Colors.TEXT_PRIMARY },
    premiumText: { color: Colors.WHITE },
    packageTheme: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginTop: 2 },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },

    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 18 },
    currency: { fontSize: 20, fontWeight: '700', color: Colors.TEXT_PRIMARY },
    price: { fontSize: 38, fontWeight: '800', color: Colors.TEXT_PRIMARY },
    period: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginLeft: 4 },

    featuresBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    includesLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.TEXT_SECONDARY,
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
    featureText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },

    bookBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingVertical: 15,
        borderRadius: 16,
        gap: 8,
    },
    bookBtnText: { fontSize: 15, fontWeight: '700', color: Colors.TEXT_SECONDARY },

    emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginTop: 16 },
    emptyText: { fontSize: 14, color: Colors.TEXT_SECONDARY, textAlign: 'center', marginTop: 8, lineHeight: 20 },

    contactContainer: {
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 20,
        backgroundColor: Colors.WHITE,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    contactTitle: { fontSize: 17, fontWeight: '800', color: Colors.TEXT_PRIMARY, marginTop: 12, marginBottom: 6 },
    contactSub: { fontSize: 13, color: Colors.TEXT_SECONDARY, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF1F2',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FECDD3',
    },
    contactBtnText: { fontSize: 14, fontWeight: '700', color: Colors.PRIMARY },
});
