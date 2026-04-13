import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, ImageBackground, StatusBar, Platform, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import studentService from '../../api/studentService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";

export default function MyBatch({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [batch, setBatch] = useState(null);

    useEffect(() => {
        fetchBatch();
    }, []);

    const fetchBatch = async () => {
        const studentId = await AsyncStorage.getItem("studentId");
        try {
            if (studentId) {
                const res = await studentService.getBatch(studentId);
                setBatch(res.data || {});
            }
        } catch (error) {
            console.error("Batch fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    const renderBatchContent = () => {
        if (!batch || !batch.name) {
            return (
                <View style={styles.emptyContainer}>
                    <View style={styles.iconCircle}>
                        <Icon name="dance-ballroom" size={60} color={Colors.PRIMARY} />
                    </View>
                    <Text style={styles.emptyTitle}>No Active Batch</Text>
                    <Text style={styles.emptyDesc}>You haven't joined a dance batch yet. Explore our classes and start your journey today!</Text>
                    <TouchableOpacity 
                        style={styles.enrollBtn}
                        onPress={() => navigation.navigate("BatchEnrollment")}
                    >
                        <Text style={styles.enrollBtnText}>Explore & Enroll</Text>
                        <Icon name="arrow-right" size={20} color={Colors.WHITE} />
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.card}>
                <View style={styles.imageHeader}>
                    <Image
                        source={{ uri: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000&auto=format&fit=crop" }}
                        style={styles.batchImage}
                    />
                    <View style={styles.overlay} />
                    <Text style={styles.batchNameOnCard}>{batch.name}</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.row}>
                        <Icon name="clock-outline" size={24} color={Colors.PRIMARY} />
                        <View style={styles.textBlock}>
                            <Text style={styles.label}>Timing</Text>
                            <Text style={styles.value}>{batch.time}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Icon name="calendar-week" size={24} color={Colors.PRIMARY} />
                        <View style={styles.textBlock}>
                            <Text style={styles.label}>Days</Text>
                            <Text style={styles.value}>{batch.days}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Icon name="shoe-ballet" size={24} color={Colors.PRIMARY} />
                        <View style={styles.textBlock}>
                            <Text style={styles.label}>Dance Style</Text>
                            <Text style={styles.value}>{batch.style}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Icon name="account-tie" size={24} color={Colors.PRIMARY} />
                        <View style={styles.textBlock}>
                            <Text style={styles.label}>Instructor</Text>
                            <Text style={styles.value}>{batch.instructor}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <BaseScreen title="My Batch" loading={loading} useGradient={true} scrollContentStyle={{ padding: 20 }}>
            {renderBatchContent()}
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 20,
    },
    imageHeader: {
        height: 150,
        justifyContent: 'flex-end',
        padding: 16,
    },
    batchImage: { ...StyleSheet.absoluteFillObject },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
    batchNameOnCard: { color: '#fff', fontSize: 22, fontWeight: 'bold', zIndex: 1 },
    content: { padding: 20 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    textBlock: { marginLeft: 16 },
    label: { fontSize: 12, color: Colors.TEXT_SECONDARY, fontWeight: 'bold', marginBottom: 2 },
    value: { fontSize: 16, color: Colors.TEXT_PRIMARY, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 40 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingTop: 60 },
    iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.TEXT_PRIMARY, marginBottom: 12 },
    emptyDesc: { fontSize: 16, color: Colors.TEXT_SECONDARY, textAlign: 'center', lineHeight: 24, marginBottom: 35 },
    enrollBtn: { 
        backgroundColor: Colors.PRIMARY, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingVertical: 16, 
        paddingHorizontal: 28, 
        borderRadius: 18, 
        elevation: 3, 
        shadowColor: Colors.PRIMARY, 
        shadowOpacity: 0.3 
    },
    enrollBtnText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16, marginRight: 10 },
});
