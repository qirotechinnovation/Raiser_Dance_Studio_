import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Modal, TextInput, ActivityIndicator, Animated, StatusBar, Dimensions, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomDateTimePicker from '../../components/CustomDateTimePicker';
import LinearGradient from 'react-native-linear-gradient';
import studentService from '../../api/studentService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from "../../theme/Colors";


const { width, height } = Dimensions.get('window');

// Premium Gold/Dark Colors
const COLORS = {
    primary: Colors.PRIMARY, // Navy Blue
    secondary: '#000000', // Black
    accent: Colors.WHITE, // White accent
    bg: '#000000',
    surface: Colors.PRIMARY,
    text: Colors.WHITE,
    textMuted: Colors.TEXT_MUTED
};

export default function StudentSangeetScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [allPackages, setAllPackages] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // Animations
    const scrollY = useRef(new Animated.Value(0)).current;

    // Quote animation
    const quoteOpacity = useRef(new Animated.Value(0)).current;
    const quoteTranslate = useRef(new Animated.Value(20)).current;

    // Booking Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [bookingData, setBookingData] = useState({
        eventDate: '',
        brideName: '',
        groomName: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        fetchData();
        Animated.parallel([
            Animated.timing(quoteOpacity, { toValue: 1, duration: 1000, useNativeDriver: false }),
            Animated.timing(quoteTranslate, { toValue: 0, duration: 1000, useNativeDriver: false })
        ]).start();
    }, []);

    const fetchData = async () => {
        try {
            const [pkgRes, settingsRes] = await Promise.all([
                studentService.getSangeetPackages(),
                studentService.getSangeetSettings()
            ]);
            setAllPackages(pkgRes.data || []);
            setSettings(settingsRes.data);
        } catch (error) {
            console.log("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookClick = (pkg) => {
        setSelectedPkg(pkg);
        setBookingData(prev => ({ ...prev, message: `Interested in ${pkg.name}` }));
        setModalVisible(true);
    };

    const confirmBooking = async () => {
        if (!bookingData.eventDate || !bookingData.brideName || !bookingData.groomName) {
            Alert.alert("Error", "Please fill in all wedding details");
            return;
        }

        setSubmitting(true);
        try {
            const studentId = await AsyncStorage.getItem("studentId");
            const studentName = await AsyncStorage.getItem("studentName") || "Student";
            const studentMobile = await AsyncStorage.getItem("studentMobile") || "";

            // Format date to YYYY-MM-DD to match backend requirement
            const rawDate = bookingData.eventDate;
            let formattedDate = rawDate;
            const parsedDate = new Date(rawDate);
            if (!isNaN(parsedDate.getTime())) {
                formattedDate = parsedDate.toISOString().split('T')[0];
            }

            console.log("Booking Payload:", {
                studentId,
                packageId: selectedPkg.id,
                clientName: studentName,
                mobile: studentMobile,
                eventDate: formattedDate,
                bride: bookingData.brideName,
                groom: bookingData.groomName
            });

            const response = await studentService.bookSangeetPackage({
                studentId: studentId,
                packageId: selectedPkg.id,
                clientName: studentName,
                mobile: studentMobile,
                eventDate: formattedDate,
                bride: bookingData.brideName,
                groom: bookingData.groomName,
                status: "PENDING",
                paymentStatus: "UNPAID"
            });

            console.log("Booking Response:", response);

            if (response.data && response.data.status === 'queued') {
                Alert.alert("Saved Offline", "You seem to be offline. Your inquiry has been saved and will be sent automatically when you are back online.");
            } else {
                Alert.alert("Success", "Your wedding choreography inquiry has been sent! Our team will contact you soon.");
            }
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Booking Failed", "Something went wrong. Please check your connection and try again.");
            console.error("Booking Error:", error);
            if (error.response) {
                console.error("Server Response:", error.response.data);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const renderHeader = () => {
        const headerHeight = scrollY.interpolate({
            inputRange: [0, 250],
            outputRange: [height * 0.45, 120 + insets.top],
            extrapolate: 'clamp'
        });

        const imageOpacity = scrollY.interpolate({
            inputRange: [0, 200],
            outputRange: [0.8, 0],
            extrapolate: 'clamp'
        });

        return (
            <Animated.View style={[styles.heroContainer, { height: headerHeight }]}>
                <Animated.Image
                    source={{ uri: 'https://images.unsplash.com/photo-1545243424-0ce743321e11?q=80&w=1000&auto=format&fit=crop' }}
                    style={[styles.heroImage, { opacity: imageOpacity }]}
                />
                <LinearGradient
                    colors={['rgba(0, 0, 51, 0.1)', 'rgba(0, 0, 0, 0.8)', '#000000']}
                    style={styles.heroOverlay}
                />

                <View style={[styles.heroContent, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
                        <View style={styles.backBtnCircle}>
                            <Icon name="arrow-left" size={24} color={Colors.WHITE} />
                        </View>
                    </TouchableOpacity>

                    <Animated.View style={[styles.titleWrapper, {
                        opacity: scrollY.interpolate({ inputRange: [0, 150], outputRange: [1, 0] }),
                        transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, -20] }) }]
                    }]}>
                        <View style={styles.starBadge}>
                            <Icon name="star" size={12} color="#000" />
                            <Text style={styles.starBadgeText}>TEAM RAISER’S</Text>
                        </View>
                        <Text style={styles.heroTitle}>Wedding Choreography</Text>
                        <Text style={styles.heroSub}>Making You Look Like Dancing Stars</Text>
                    </Animated.View>
                </View>
            </Animated.View>
        );
    };

    const renderPackage = ({ item, index }) => {
        const isGold = item.name.toLowerCase().includes('gold') || item.price > 20000;
        const isSilver = item.name.toLowerCase().includes('silver');

        return (
            <View style={[
                styles.pkgCard,
                isGold && styles.goldCard,
                isSilver && styles.silverCard
            ]}>
                {isGold && (
                    <View style={styles.pkgBadge}>
                        <Text style={styles.pkgBadgeText}>PREMIUM CHOICE</Text>
                    </View>
                )}

                <View style={styles.pkgHeader}>
                    <View style={styles.pkgIconBox}>
                        <Icon name={isGold ? "medal" : (isSilver ? "star-circle" : "music")} size={30} color={isGold ? "#FDE68A" : Colors.WHITE} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.pkgName}>{item.name}</Text>
                        <Text style={styles.pkgTheme}>{item.theme || 'Modern Fusion'}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={[styles.priceContainer]}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <Text style={styles.priceValue}>{item.price.toLocaleString()}</Text>
                    <Text style={styles.priceSuffix}>/ full package</Text>
                </View>

                <View style={styles.inclusionsBox}>
                    <Text style={styles.inclusionsTitle}>INCLUDES</Text>
                    {item.details?.split(',').map((feat, i) => (
                        <View key={i} style={styles.featureRow}>
                            <Icon name="check-circle" size={18} color={isGold ? COLORS.accent : '#FBBF24'} style={{ marginTop: 2 }} />
                            <Text style={styles.featureText}>{feat.trim()}</Text>
                        </View>
                    ))}
                    {item.numberOfDances > 0 && (
                        <View style={styles.featureRow}>
                            <Icon name="check-circle" size={18} color={isGold ? COLORS.accent : '#FBBF24'} style={{ marginTop: 2 }} />
                            <Text style={styles.featureText}>Covers {item.numberOfDances} Dances for family</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.bookBtn, isGold && styles.bookBtnGold]}
                    onPress={() => handleBookClick(item)}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.bookBtnText, isGold && { color: '#000' }]}>Select This Plan</Text>
                    <Icon name="arrow-right" size={20} color={isGold ? "#000" : Colors.WHITE} />
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {renderHeader()}

            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingTop: height * 0.45 + 20 }]}
            >
                {/* Vision Statement Section */}
                <Animated.View style={[styles.visionSection, { opacity: quoteOpacity, transform: [{ translateY: quoteTranslate }] }]}>
                    <View style={styles.visionQuoteIcon}>
                        <Icon name="format-quote-open" size={40} color={COLORS.accent} style={{ opacity: 0.5 }} />
                    </View>
                    <Text style={styles.visionText}>
                        "We put a lot of thought & work into creating each piece of choreography, specially customised just for you. Making you look good is our one & only goal!"
                    </Text>
                    <Text style={styles.visionAuthor}>— TEAM RAISER’S</Text>
                </Animated.View>

                <View style={styles.mainContent}>
                    {/* Packages Header */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionLine} />
                        <Text style={styles.sectionTitle}>PACKAGES</Text>
                        <View style={styles.sectionLine} />
                    </View>

                    {/* Dynamic Packages */}
                    {allPackages.sort((a, b) => a.displayOrder - b.displayOrder).map((pkg, idx) => (
                        <View key={pkg.id}>
                            {renderPackage({ item: pkg, index: idx })}
                        </View>
                    ))}

                    {/* Fallback */}
                    {allPackages.length === 0 && (
                        <Text style={styles.emptyText}>No packages available at the moment.</Text>
                    )}
                </View>

                {/* Footer Info */}
                <View style={[styles.footer, { paddingBottom: 100 + insets.bottom }]}>
                    <Icon name="map-marker" size={20} color={Colors.TEXT_SECONDARY} />
                    <Text style={styles.addressText}>{settings?.studioAddress || "Office plot no 70 sector E cidco n4 chh.sambhajinagar"}</Text>
                    <Text style={styles.copyright}>© {new Date().getFullYear()} RAISER’S DANCE STUDIO</Text>
                </View>
            </Animated.ScrollView>

            <TouchableOpacity
                style={[styles.fabHistory, { bottom: 30 + insets.bottom }]}
                onPress={() => navigation.navigate("StudentSangeetInquiries")}
                activeOpacity={0.9}
            >
                <Icon name="calendar-text-outline" size={24} color={Colors.WHITE} />
                <Text style={styles.fabBadgeText}>My Inquiries</Text>
            </TouchableOpacity>

            {/* Booking Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={[styles.modalContent, { paddingBottom: 30 + insets.bottom }]}
                    >
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Book Date</Text>
                                <Text style={styles.modalSub}>Fill your wedding details below</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Icon name="close" size={22} color={Colors.TEXT_MUTED} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tentative Wedding Date</Text>
                                <View>
                                    <TouchableOpacity
                                        style={styles.input}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={[styles.inputText, !bookingData.eventDate && { color: Colors.TEXT_SECONDARY }]}>
                                            {bookingData.eventDate ? bookingData.eventDate : "Select Wedding Date"}
                                        </Text>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <CustomDateTimePicker
                                            visible={showDatePicker}
                                            mode="date"
                                            onClose={() => setShowDatePicker(false)}
                                            onSelect={(val) => {
                                                setBookingData(prev => ({ ...prev, eventDate: val }));
                                                setShowDatePicker(false);
                                            }}
                                        />
                                    )}
                                </View>
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.label}>Bride's Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        placeholderTextColor={Colors.TEXT_SECONDARY}
                                        value={bookingData.brideName}
                                        onChangeText={t => setBookingData(p => ({ ...p, brideName: t }))}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Groom's Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        placeholderTextColor={Colors.TEXT_SECONDARY}
                                        value={bookingData.groomName}
                                        onChangeText={t => setBookingData(p => ({ ...p, groomName: t }))}
                                    />
                                </View>
                            </View>

                            <View style={styles.selectedPkgInfo}>
                                <Text style={styles.summaryLabel}>Selected Package:</Text>
                                <Text style={styles.summaryValue}>{selectedPkg?.name}</Text>
                                <Text style={styles.summaryPrice}>₹{selectedPkg?.price.toLocaleString()}</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.confirmBtn, submitting && styles.disabledBtn]}
                                onPress={confirmBooking}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color={Colors.WHITE} />
                                ) : (
                                    <>
                                        <Text style={styles.confirmBtnText}>Confirm Inquiry</Text>
                                        <Icon name="arrow-right" size={20} color={Colors.WHITE} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },

    heroContainer: { width: width, position: 'absolute', top: 0, overflow: 'hidden', zIndex: 10 },
    heroImage: { width: '100%', height: '100%', position: 'absolute' },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%' },
    heroContent: { height: '100%', justifyContent: 'flex-end', paddingHorizontal: 25, paddingBottom: 40 },

    backBtnHeader: { position: 'absolute', top: 50, left: 20, zIndex: 20 },
    backBtnCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

    titleWrapper: {},
    starBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
    starBadgeText: { color: '#000', fontSize: 10, fontWeight: 'bold', marginLeft: 6, letterSpacing: 1 },
    heroTitle: { color: Colors.WHITE, fontSize: 32, fontWeight: '800', letterSpacing: -0.5, lineHeight: 40 },
    heroSub: { color: COLORS.accent, fontSize: 16, fontWeight: '500', marginTop: 8 },

    scrollContent: { paddingHorizontal: 20 },

    visionSection: { padding: 30, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, marginBottom: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    visionQuoteIcon: { marginBottom: 15 },
    visionText: { color: Colors.BORDER, fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 26, fontWeight: '400' },
    visionAuthor: { color: COLORS.accent, fontWeight: 'bold', fontSize: 12, marginTop: 20, letterSpacing: 2 },

    mainContent: { marginBottom: 20 },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    sectionLine: { height: 1, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
    sectionTitle: { color: Colors.TEXT_SECONDARY, fontSize: 13, fontWeight: 'bold', marginHorizontal: 15, letterSpacing: 2 },

    // Package Card
    pkgCard: { backgroundColor: Colors.PRIMARY, borderRadius: 24, padding: 24, marginBottom: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    goldCard: { borderColor: Colors.WHITE, backgroundColor: Colors.PRIMARY }, // White border for premium
    silverCard: { borderColor: Colors.TEXT_MUTED },

    pkgBadge: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, elevation: 4 },
    pkgBadgeText: { color: '#000', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },

    pkgHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    pkgIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    pkgName: { fontSize: 22, fontWeight: '800', color: Colors.WHITE },
    pkgTheme: { fontSize: 13, color: COLORS.accent, fontWeight: '600', marginTop: 2 },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },

    priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 },
    currencySymbol: { fontSize: 20, fontWeight: '600', color: COLORS.accent },
    priceValue: { fontSize: 36, fontWeight: '800', color: Colors.WHITE, marginLeft: 4 },
    priceSuffix: { fontSize: 14, color: Colors.TEXT_MUTED, fontWeight: '500', marginLeft: 8 },

    inclusionsBox: { marginBottom: 24 },
    inclusionsTitle: { fontSize: 11, fontWeight: '800', color: Colors.TEXT_SECONDARY, marginBottom: 12, letterSpacing: 1 },
    featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
    featureText: { color: Colors.BORDER, fontSize: 14, flex: 1, lineHeight: 22 },

    bookBtn: { backgroundColor: '#334155', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16, gap: 8 },
    bookBtnGold: { backgroundColor: COLORS.accent },
    bookBtnText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 },

    emptyText: { color: Colors.TEXT_SECONDARY, textAlign: 'center', marginTop: 20, fontSize: 15 },

    footer: { padding: 40, alignItems: 'center' },
    addressText: { color: Colors.TEXT_SECONDARY, textAlign: 'center', marginTop: 15, fontSize: 13, lineHeight: 20 },
    copyright: { color: '#475569', fontSize: 11, fontWeight: '700', marginTop: 25 },

    fabHistory: { position: 'absolute', alignSelf: 'center', backgroundColor: Colors.PRIMARY, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, flexDirection: 'row', alignItems: 'center', elevation: 8, shadowColor: Colors.PRIMARY, shadowOpacity: 0.4, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },    fabBadgeText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 15 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: Colors.PRIMARY, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 22, fontWeight: "800", color: Colors.WHITE },
    modalSub: { fontSize: 14, color: Colors.TEXT_MUTED },
    closeBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },

    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: "700", color: COLORS.accent, marginBottom: 8 },
    rowInputs: { flexDirection: 'row' },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, color: Colors.WHITE, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },

    selectedPkgInfo: { backgroundColor: 'rgba(190, 18, 60, 0.1)', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(190, 18, 60, 0.2)' },
    summaryLabel: { fontSize: 12, color: COLORS.primary, fontWeight: '700', marginBottom: 4 },
    summaryValue: { fontSize: 16, color: Colors.WHITE, fontWeight: 'bold', marginBottom: 2 },
    summaryPrice: { fontSize: 18, fontWeight: '900', color: COLORS.accent },

    confirmBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 4 },
    confirmBtnText: { color: Colors.WHITE, fontWeight: "800", fontSize: 16 },
    disabledBtn: { opacity: 0.6 }
});

