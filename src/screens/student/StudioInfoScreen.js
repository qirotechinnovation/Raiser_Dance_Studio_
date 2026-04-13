import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import studentService from '../../api/studentService';
import API from '../../api/axios';
import Colors from "../../theme/Colors";


const { width } = Dimensions.get('window');

export default function StudioInfoScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const baseURL = API.defaults.baseURL;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await studentService.getAboutUsData();
            setData(res.data);
        } catch (error) {
            console.error("Error fetching about us data:", error);
            Alert.alert("Error", "Could not load studio information.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    const settings = data?.settings || {};

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Image
                        source={{ uri: settings.image1Path ? `${baseURL}/uploads/${settings.image1Path}` : "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000&auto=format&fit=crop" }}
                        style={styles.heroImage}
                    />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.heroOverlay} />

                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={Colors.WHITE} />
                    </TouchableOpacity>

                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>{settings.studioName || "Raiser’s studio"}</Text>
                        <Text style={styles.heroTagline}>{settings.tagline || "A PLACE TO LEARN, GROW, AND EXPRESS THROUGH DANCE!"}</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Vision Section */}
                    <View style={styles.visionCard}>
                        <Icon name="format-quote-open" size={30} color="#FECDD3" style={styles.quoteIcon} />
                        <Text style={styles.visionText}>"We rise dancers"</Text>
                        <Text style={styles.aboutDesc}>{settings.aboutText}</Text>
                    </View>

                    {/* Passion Section */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.headerLine} />
                        <Text style={styles.sectionHeading}>OUR PASSION</Text>
                        <View style={styles.headerLine} />
                    </View>
                    <View style={styles.passionBox}>
                        <LinearGradient colors={['#FFF1F2', Colors.WHITE]} style={styles.passionGradient}>
                            <Icon name="heart-pulse" size={40} color={Colors.PRIMARY} style={{ marginBottom: 15 }} />
                            <Text style={styles.passionText}>{settings.passionText}</Text>
                        </LinearGradient>
                    </View>

                    {/* Class Types - Detailed Grid */}
                    <Text style={styles.subHeading}>CLASS PORTFOLIO</Text>
                    <View style={styles.classGrid}>
                        <ClassCard
                            title="Bollywood"
                            time="5:00 - 6:00 PM"
                            desc="Energetic, expressive, and fun-filled, inspired by the latest and classic Bollywood songs."
                            icon="music-note"
                            color="#FDE68A"
                        />
                        <ClassCard
                            title="Special Kids"
                            time="6:00 - 7:00 PM"
                            desc="Designed to nurture young talent in a fun, safe, and supportive environment."
                            icon="human-child"
                            color="#BFDBFE"
                        />
                        <ClassCard
                            title="Beginner"
                            time="7:00 - 8:00 PM"
                            desc="Specially designed for students who are new to dance or want to build strong basics."
                            icon="stairs-up"
                            color="#BBF7D0"
                        />
                        <ClassCard
                            title="Advance"
                            time="8:00 - 9:00 PM"
                            desc="Contemporary Dance blending classical, modern, and lyrical movement for deep expression."
                            icon="star-face"
                            color="#F5D0FE"
                        />
                    </View>

                    {/* Skill Roadmap */}
                    <Text style={styles.subHeading}>SKILL ROADMAP</Text>
                    <View style={styles.roadmap}>
                        <RoadmapItem
                            level="Beginner"
                            points={["Basic body movements", "Rhythm & Timing", "Posture & Discipline"]}
                            icon="numeric-1-circle"
                        />
                        <RoadmapItem
                            level="Intermediate"
                            points={["Improved technique", "Complex choreography", "Stage presence"]}
                            icon="numeric-2-circle"
                        />
                        <RoadmapItem
                            level="Advanced"
                            points={["Precision & Style", "Freestyle creativity", "Professional training"]}
                            icon="numeric-3-circle"
                        />
                    </View>

                    {/* Closing Quote */}
                    <View style={styles.closureBox}>
                        <Text style={styles.closureText}>"Every dancer can rise with the right guidance, practice, and passion."</Text>
                    </View>

                    {/* Contact Footer */}
                    <View style={styles.footer}>
                        <View style={styles.contactItem}>
                            <Icon name="phone" size={20} color={Colors.PRIMARY} />
                            <Text style={styles.footerText}>9503399763</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <Icon name="email" size={20} color={Colors.PRIMARY} />
                            <Text style={styles.footerText}>Raisersdancestudio@gmail.com</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <Icon name="map-marker" size={20} color={Colors.PRIMARY} />
                            <Text style={[styles.footerText, { fontSize: 12, textAlign: 'center' }]}>sector E cidco n4 chh.sambhajinagar</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function ClassCard({ title, time, desc, icon, color }) {
    return (
        <View style={styles.classCard}>
            <View style={[styles.classIconBg, { backgroundColor: color }]}>
                <Icon name={icon} size={24} color={Colors.TEXT_PRIMARY} />
            </View>
            <Text style={styles.classTitle}>{title}</Text>
            <Text style={styles.classTime}>{time}</Text>
            <Text style={styles.classDesc}>{desc}</Text>
        </View>
    );
}

function RoadmapItem({ level, points, icon }) {
    return (
        <View style={styles.roadmapItem}>
            <View style={styles.roadmapHeader}>
                <Icon name={icon} size={28} color={Colors.PRIMARY} />
                <Text style={styles.roadmapLevel}>{level}</Text>
            </View>
            <View style={styles.roadmapContent}>
                {points.map((p, i) => (
                    <View key={i} style={styles.bulletRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>{p}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.WHITE },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    hero: { height: 400, justifyContent: 'flex-end' },
    heroImage: { ...StyleSheet.absoluteFillObject },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    backBtn: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },

    heroContent: { padding: 30, paddingBottom: 50 },
    heroTitle: { fontSize: 36, fontWeight: '900', color: Colors.WHITE, letterSpacing: 1 },
    heroTagline: { fontSize: 14, color: "#FDA4AF", fontWeight: 'bold', textTransform: 'uppercase', marginTop: 8 },

    content: { marginTop: -40, borderTopLeftRadius: 40, borderTopRightRadius: 40, backgroundColor: Colors.WHITE, padding: 25 },

    visionCard: { backgroundColor: Colors.WHITE, padding: 10, marginBottom: 20 },
    quoteIcon: { marginBottom: -10 },
    visionText: { fontSize: 22, fontWeight: '900', color: Colors.PRIMARY, fontStyle: 'italic', marginBottom: 15 },
    aboutDesc: { fontSize: 15, color: '#475569', lineHeight: 24, textAlign: 'justify' },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
    headerLine: { flex: 1, height: 1, backgroundColor: Colors.BORDER },
    sectionHeading: { fontSize: 12, fontWeight: 'bold', color: Colors.TEXT_MUTED, marginHorizontal: 15, letterSpacing: 2 },

    passionBox: { marginBottom: 30 },
    passionGradient: { padding: 25, borderRadius: 25, alignItems: 'center', borderWidth: 1, borderColor: '#FFE4E6' },
    passionText: { fontSize: 15, color: '#334155', lineHeight: 24, textAlign: 'center', fontStyle: 'italic' },

    subHeading: { fontSize: 20, fontWeight: '900', color: Colors.PRIMARY_DARK, marginBottom: 20, letterSpacing: 0.5 },

    classGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
    classCard: { width: (width - 70) / 2, backgroundColor: '#FAFAFA', borderRadius: 20, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    classIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    classTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    classTime: { fontSize: 12, color: Colors.PRIMARY, fontWeight: 'bold', marginVertical: 5 },
    classDesc: { fontSize: 11, color: Colors.TEXT_SECONDARY, lineHeight: 16 },

    roadmap: { marginBottom: 40 },
    roadmapItem: { marginBottom: 20, backgroundColor: Colors.BG_CONTENT, borderRadius: 20, padding: 20 },
    roadmapHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    roadmapLevel: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginLeft: 12 },
    roadmapContent: { marginLeft: 40 },
    bulletRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.PRIMARY, marginRight: 10 },
    bulletText: { fontSize: 14, color: '#475569' },

    closureBox: { padding: 30, backgroundColor: Colors.TEXT_PRIMARY, borderRadius: 30, alignItems: 'center', marginBottom: 40 },
    closureText: { color: Colors.WHITE, fontSize: 16, fontWeight: 'bold', textAlign: 'center', lineHeight: 24, fontStyle: 'italic' },

    footer: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 30, alignItems: 'center', paddingBottom: 20 },
    contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    footerText: { marginLeft: 12, fontSize: 14, color: Colors.TEXT_SECONDARY, fontWeight: '600' }
});
