import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import studentService from "../../api/studentService";
import Colors from "../../theme/Colors";


export default function StudentFeeStructureScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [feeStructure, setFeeStructure] = useState([]);
    const [feeSettings, setFeeSettings] = useState(null);

    useEffect(() => {
        fetchFeeStructure();
    }, []);

    const fetchFeeStructure = async () => {
        try {
            const [structRes, settingsRes] = await Promise.all([
                studentService.getFeeStructure(),
                studentService.getPublicFeeSettings()
            ]);
            setFeeStructure(structRes.data);
            setFeeSettings(settingsRes.data);
        } catch (error) {
            console.error("Error fetching fee structure:", error);
            Alert.alert("Error", `Could not load fee structure: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderCategoryTable = (category, title) => {
        const categoryData = feeStructure.filter(f => f.category === category);
        if (categoryData.length === 0) return null;

        return (
            <View style={styles.tableContainer} key={category}>
                <View style={styles.categoryHeader}>
                    <Icon name={category === 'Kids' ? 'baby-face-outline' : category === 'Regular' ? 'dance-ballroom' : 'star-shooting-outline'} size={24} color={Colors.PRIMARY} />
                    <Text style={styles.tableTitle}>{title}</Text>
                </View>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, { flex: 1.2 }]}>Plan</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Classes</Text>
                        <Text style={[styles.headerCell, { flex: 1 }]}>Fee</Text>
                        <Text style={[styles.headerCell, { flex: 1 }]}>Off</Text>
                    </View>
                    {categoryData.map((item, index) => (
                        <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]} key={item.id}>
                            <Text style={[styles.cell, { flex: 1.2, fontWeight: 'bold' }]}>{item.plan}</Text>
                            <Text style={[styles.cell, { flex: 1.5 }]}>{item.classes}</Text>
                            <Text style={[styles.cell, { flex: 1, color: Colors.PRIMARY, fontWeight: 'bold' }]}>₹{item.amount}/-</Text>
                            <Text style={[styles.cell, { flex: 1, color: '#16A34A', fontWeight: 'bold' }]}>{item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}</Text>
                        </View>
                    ))}
                </View>
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={HEADER_BG} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Icon name="arrow-left" size={24} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fees Structure</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.contentContainer}>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {renderCategoryTable("Kids", "Kids Fees Structure")}
                    {renderCategoryTable("Regular", "Regular Batches")}
                    {renderCategoryTable("Private", "Private Classes")}

                    {/* Fallback for others */}
                    {feeStructure.filter(f => !["Kids", "Regular", "Private"].includes(f.category)).length > 0 &&
                        renderCategoryTable(feeStructure.find(f => !["Kids", "Regular", "Private"].includes(f.category)).category, "Other Fees")
                    }

                    <View style={styles.noteBox}>
                        <View style={styles.noteHeader}>
                            <Icon name="information" size={20} color={Colors.PRIMARY} />
                            <Text style={styles.noteTitle}>Important Notes</Text>
                        </View>
                        {feeSettings?.feeNotes ? feeSettings.feeNotes.split('\n').map((note, idx) => (
                            <Text key={idx} style={styles.noteText}>{note}</Text>
                        )) : (
                            <>
                                <Text style={styles.noteText}>• Admission fees are compulsory for new students.</Text>
                                <Text style={styles.noteText}>• Fees once paid are non-refundable.</Text>
                            </>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerThanks}>Thank You!</Text>
                        <View style={styles.contactRow}>
                            <Icon name="phone" size={16} color={Colors.TEXT_SECONDARY} />
                            <Text style={styles.contactText}>9503399763</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Icon name="email" size={16} color={Colors.TEXT_SECONDARY} />
                            <Text style={styles.contactText}>raisersdancestudio@gmail.com</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const HEADER_BG = Colors.PRIMARY;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: HEADER_BG },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.WHITE },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: Platform.OS === 'android' ? 15 : 0,
        paddingBottom: 25
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.WHITE },
    headerBtn: { padding: 5 },
    contentContainer: {
        flex: 1,
        backgroundColor: Colors.BG_CONTENT,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 25,
        overflow: 'hidden'
    },
    scrollContent: { paddingTop: 25, paddingBottom: 40 },
    tableContainer: { marginBottom: 25 },
    categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'center' },
    tableTitle: { fontSize: 18, fontWeight: "900", color: Colors.TEXT_PRIMARY, marginLeft: 8 },
    table: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.WHITE, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    tableHeader: { flexDirection: 'row', backgroundColor: Colors.BG_CONTENT, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
    headerCell: { fontWeight: "bold", color: "#475569", textAlign: 'center', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
    tableRow: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", alignItems: 'center' },
    evenRow: { backgroundColor: Colors.WHITE },
    oddRow: { backgroundColor: '#FFFBFC' },
    cell: { textAlign: 'center', color: "#334155", fontSize: 13 },
    noteBox: { marginTop: 10, padding: 20, backgroundColor: '#FFF1F2', borderRadius: 16, borderWidth: 1, borderColor: '#FECDD3' },
    noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    noteTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.PRIMARY, marginLeft: 8 },
    noteText: { fontSize: 13, color: "#475569", marginBottom: 6, lineHeight: 18, fontWeight: '500' },
    footer: { marginTop: 30, alignItems: 'center', paddingVertical: 25, borderTopWidth: 1, borderTopColor: Colors.BORDER },
    footerThanks: { fontSize: 18, fontWeight: '900', color: Colors.PRIMARY, marginBottom: 15, letterSpacing: 1 },
    contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    contactText: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginLeft: 8, fontWeight: '600' }
});
