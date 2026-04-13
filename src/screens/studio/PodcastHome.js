import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from "../../theme/Colors";


const PodcastHome = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.PRIMARY_DARK} translucent />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Poster Header */}
                <View style={styles.posterContainer}>
                    <View style={styles.brandBadge}>
                        <Icon name="microphone-variant" size={20} color={Colors.WHITE} />
                        <Text style={styles.brandTitle}>Talk to Rise Studio</Text>
                    </View>

                    <Text style={styles.mainTitle}>PODCAST STUDIO{"\n"}ON RENT</Text>
                    <Text style={styles.subText}>Professional Podcast Studio On Rent in MH20</Text>

                    {/* Stylized Decor */}
                    <View style={styles.decorCircle} />
                </View>

                {/* Feature Cards Grid */}
                <View style={styles.gridContainer}>
                    <View style={styles.featureCard}>
                        <Icon name="video-4k-box" size={32} color="#3B82F6" />
                        <Text style={styles.featureTitle}>4K Production</Text>
                        <Text style={styles.featureDesc}>Rode Mics + Studio Lights & Cinematic Vibes</Text>
                    </View>
                    <View style={styles.featureCard}>
                        <Icon name="chair-rolling" size={32} color="#8B5CF6" />
                        <Text style={styles.featureTitle}>Aesthetic</Text>
                        <Text style={styles.featureDesc}>Clean Studio with Props & Comfortable Seating</Text>
                    </View>
                    <View style={styles.featureCard}>
                        <Icon name="account-group" size={32} color="#10B981" />
                        <Text style={styles.featureTitle}>For Creators</Text>
                        <Text style={styles.featureDesc}>Perfect for Startups, Influencers & Interviews</Text>
                    </View>
                    <View style={styles.featureCard}>
                        <Icon name="cash-multiple" size={32} color="#F59E0B" />
                        <Text style={styles.featureTitle}>Affordable</Text>
                        <Text style={styles.featureDesc}>Packages start low with optional editing</Text>
                    </View>
                </View>

                {/* Checklist */}
                <View style={styles.checklistContainer}>
                    <ChecklistItem icon="movie-open-play" title="Shoot Your Episode" subtitle="High quality Video Production" />
                    <ChecklistItem icon="share-variant" title="Share Your Success" subtitle="Distributed on top platforms" />
                    <ChecklistItem icon="calendar-clock" title="Book Your Slot" subtitle="Quick Consultation, Easy Process" />
                </View>

                {/* Call to Action */}
                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => navigation.navigate('StudioBookingForm')}
                    activeOpacity={0.8}
                >
                    <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.bookBtnGradient}>
                        <Text style={styles.bookButtonText}>BOOK TODAY!</Text>
                        <Icon name="arrow-right" size={24} color={Colors.WHITE} />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('StudioMyBookings')}>
                    <Text style={styles.historyBtnText}>View My Bookings Status</Text>
                </TouchableOpacity>

                {/* Footer Info */}
                <View style={styles.contactContainer}>
                    <View style={styles.contactRow}>
                        <Icon name="instagram" size={20} color="#E1306C" />
                        <Text style={styles.contactText}>@talktorisestudio</Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Icon name="phone" size={20} color="#22C55E" />
                        <Text style={styles.contactText}>9503399763</Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Icon name="map-marker" size={20} color={Colors.ERROR} />
                        <Text style={styles.contactText}>Plot 70 sector e cidco n4, MH20</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const ChecklistItem = ({ icon, title, subtitle }) => (
    <View style={styles.checklistItem}>
        <View style={styles.checkIconBox}>
            <Icon name={icon} size={24} color={Colors.WHITE} />
        </View>
        <View>
            <Text style={styles.checkTitle}>{title}</Text>
            <Text style={styles.checkSubtitle}>{subtitle}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.PRIMARY_DARK, // Deep Navy/Black
    },
    scrollContent: {
        paddingBottom: 40,
    },
    posterContainer: {
        padding: 25,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
        backgroundColor: Colors.TEXT_PRIMARY,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        marginBottom: 20
    },
    brandBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start',
        marginBottom: 15, gap: 5
    },
    brandTitle: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 12 },
    mainTitle: {
        color: Colors.WHITE, fontSize: 36, fontWeight: '900', lineHeight: 40, marginBottom: 10
    },
    subText: { color: Colors.TEXT_MUTED, fontSize: 16 },

    decorCircle: {
        position: 'absolute', top: -50, right: -50, width: 200, height: 200,
        borderRadius: 100, backgroundColor: 'rgba(59, 130, 246, 0.1)'
    },

    gridContainer: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20
    },
    featureCard: {
        width: '48%', backgroundColor: Colors.TEXT_PRIMARY, borderRadius: 20, padding: 15, marginBottom: 15,
        elevation: 2, alignItems: 'center', borderWidth: 1, borderColor: '#334155'
    },
    featureTitle: { color: Colors.BG_CONTENT, fontWeight: 'bold', fontSize: 14, marginTop: 10, marginBottom: 4 },
    featureDesc: { color: Colors.TEXT_MUTED, fontSize: 11, textAlign: 'center' },

    checklistContainer: { paddingHorizontal: 25, marginVertical: 10 },
    checklistItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    checkIconBox: {
        width: 48, height: 48, borderRadius: 12, backgroundColor: '#3B82F6',
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    checkTitle: { color: Colors.WHITE, fontSize: 16, fontWeight: 'bold' },
    checkSubtitle: { color: Colors.TEXT_MUTED, fontSize: 13 },

    bookButton: {
        marginHorizontal: 25, marginTop: 10, borderRadius: 30, elevation: 5,
        shadowColor: '#3B82F6', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { height: 4 }
    },
    bookBtnGradient: {
        paddingVertical: 18, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10
    },
    bookButtonText: { color: Colors.WHITE, fontSize: 18, fontWeight: 'bold' },

    historyBtn: { alignSelf: 'center', padding: 15 },
    historyBtnText: { color: '#60A5FA', fontSize: 14, fontWeight: '600' },

    contactContainer: {
        borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20, marginTop: 10, paddingHorizontal: 25
    },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    contactText: { color: Colors.TEXT_MUTED, fontSize: 14 }
});

export default PodcastHome;
