import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView, StatusBar, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import adminService from "../../api/adminService";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "../../theme/Colors";


const { width } = Dimensions.get("window");

export default function SangeetPackagesScreen({ navigation }) {
    const [billingCycle, setBillingCycle] = useState("monthly");
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    useFocusEffect(
        React.useCallback(() => {
            fetchPackages();
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        }, [])
    );

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await adminService.getSangeetPackages();
            setPackages(res.data);
        } catch (error) {
            console.error("Error fetching wedding choreography packages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Confirm Delete", "Permanently remove this package?", [
            { text: "Cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await adminService.deleteSangeetPackage(id);
                        fetchPackages();
                    } catch (e) {
                        Alert.alert("Error", "Failed to delete package");
                    }
                }
            }
        ]);
    };

    const renderPackageFeature = (feature, index, color = Colors.PRIMARY) => (
        <View style={styles.featureRow} key={index}>
            <View style={styles.featureIconContainer}>
                <Icon name="check-circle" size={18} color={color} />
            </View>
            <Text style={styles.featureText}>{feature.trim()}</Text>
        </View>
    );

    const renderTierCard = (pkg, index) => {
        const isGold = pkg.name.toLowerCase().includes("gold");
        const isPlatinum = pkg.name.toLowerCase().includes("platinum");

        return (
            <View key={pkg.id} style={[
                styles.tierCard,
                isGold && styles.goldCard,
                isPlatinum && styles.platinumCard
            ]}>
                {isGold && (
                    <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                )}
                {isPlatinum && (
                    <View style={styles.eliteBadge}>
                        <Icon name="medal" size={18} color="#FDE68A" />
                    </View>
                )}

                <View style={styles.cardHeaderRow}>
                    <Text style={[
                        styles.tierLabel,
                        isGold && { color: "#92400E" },
                        isPlatinum && { color: "#FDE68A" }
                    ]}>{pkg.name.toUpperCase()}</Text>

                    <View style={styles.cardActionIcons}>
                        <TouchableOpacity onPress={() => navigation.navigate("AddEditSangeetPackage", { package: pkg })}>
                            <Icon name="pencil" size={20} color={isPlatinum ? "#FDE68A" : Colors.TEXT_SECONDARY} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(pkg.id)} style={{ marginLeft: 15 }}>
                            <Icon name="delete" size={20} color={isPlatinum ? "#FDE68A" : Colors.ERROR} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.priceRow}>
                    <Text style={[styles.currency, isPlatinum && { color: Colors.WHITE }]}>₹</Text>
                    <Text style={[styles.price, isPlatinum && { color: Colors.WHITE }]}>{pkg.price}</Text>
                    <Text style={[styles.billing, isPlatinum && { color: Colors.TEXT_MUTED }]}>/{billingCycle}</Text>
                </View>

                <View style={[styles.featuresList, isPlatinum && styles.featuresListPlatinum]}>
                    {pkg.details?.split(',').map((f, i) => renderPackageFeature(f, i, isPlatinum ? "#FDE68A" : Colors.PRIMARY))}
                    {pkg.numberOfDances > 0 && renderPackageFeature(`${pkg.numberOfDances} Dance Routines`, 100, isPlatinum ? "#FDE68A" : Colors.PRIMARY)}
                </View>

                <TouchableOpacity style={[
                    styles.bookBtn,
                    isGold && styles.goldBtn,
                    isPlatinum && styles.platinumBtn
                ]}>
                    <Text style={[
                        styles.bookBtnText,
                        isGold && styles.bookBtnTextSilver,
                        isPlatinum && { color: Colors.TEXT_PRIMARY }
                    ]}>Select Plan</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="chevron-left" size={30} color={Colors.PRIMARY_DARK} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wedding Choreography Packages</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity style={[styles.helpBtn, { marginRight: 15 }]} onPress={() => navigation.navigate("SangeetInquiries")}>
                        <Icon name="clipboard-list-outline" size={26} color="#475569" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.helpBtn, { marginRight: 15 }]} onPress={() => navigation.navigate("SangeetSettings")}>
                        <Icon name="cog-outline" size={26} color="#475569" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.helpBtn} onPress={() => navigation.navigate("AddEditSangeetPackage")}>
                        <Icon name="plus-circle" size={28} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                <View style={styles.topSection}>
                    <Text style={styles.mainTitle}>Choose Your Premium Experience</Text>
                    <Text style={styles.subTitle}>Select the perfect plan for your musical journey</Text>
                </View>

                {/* Billing Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, billingCycle === "monthly" && styles.toggleActive]}
                        onPress={() => setBillingCycle("monthly")}
                    >
                        <Text style={[styles.toggleText, billingCycle === "monthly" && styles.toggleTextActive]}>Monthly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, billingCycle === "annual" && styles.toggleActive]}
                        onPress={() => setBillingCycle("annual")}
                    >
                        <Text style={[styles.toggleText, billingCycle === "annual" && styles.toggleTextActive]}>Annual (Save 20%)</Text>
                    </TouchableOpacity>
                </View>

                {/* Packages Tier */}
                <View style={styles.tierContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 50 }} />
                    ) : (
                        packages.map((pkg, index) => renderTierCard(pkg, index))
                    )}
                </View>

                {/* Custom Package Footer */}
                <View style={styles.customContainer}>
                    {/* ... (keep as is) ... */}
                    <Text style={styles.customTitle}>Need a custom package?</Text>
                    <Text style={styles.customSub}>For corporate events or wedding parties</Text>
                    <TouchableOpacity style={styles.contactBtn}>
                        <Icon name="email-outline" size={20} color={Colors.PRIMARY} style={{ marginRight: 10 }} />
                        <Text style={styles.contactText}>Contact Sales Representative</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FDFDFD" },
    header: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: "#FDFDFD", justifyContent: "space-between" },
    backBtn: { width: 40 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.PRIMARY, textAlign: "center", flex: 1 },
    helpBtn: { width: 40, alignItems: "flex-end" },
    topSection: { paddingHorizontal: 30, alignItems: "center", marginTop: 10 },
    mainTitle: { fontSize: 26, fontWeight: "bold", color: Colors.TEXT_PRIMARY, textAlign: "center", lineHeight: 32 },
    subTitle: { fontSize: 14, color: Colors.TEXT_SECONDARY, textAlign: "center", marginTop: 10, fontWeight: "500" },
    toggleContainer: {
        flexDirection: "row",
        backgroundColor: "#FCE7F3",
        borderRadius: 25,
        padding: 5,
        marginHorizontal: 30,
        marginTop: 30
    },
    toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 20, alignItems: "center" },
    toggleActive: { backgroundColor: Colors.WHITE },
    toggleText: { fontSize: 13, fontWeight: "bold", color: Colors.PRIMARY },
    toggleTextActive: { color: Colors.PRIMARY },
    tierContainer: { padding: 20, marginTop: 10 },
    tierCard: {
        backgroundColor: Colors.WHITE,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    tierLabel: { fontSize: 11, fontWeight: "bold", color: Colors.TEXT_SECONDARY, letterSpacing: 1 },
    priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 10 },
    currency: { fontSize: 24, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    price: { fontSize: 44, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    billing: { fontSize: 14, color: Colors.TEXT_SECONDARY, marginLeft: 5 },
    featuresList: { marginTop: 20, backgroundColor: Colors.BG_CONTENT, padding: 16, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
    featuresListPlatinum: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)' },
    featureRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
    featureIconContainer: { width: 28, alignItems: 'center', marginTop: 1 },
    featureText: { fontSize: 14, color: "#334155", fontWeight: "500", flex: 1, lineHeight: 20 },
    bookBtn: {
        backgroundColor: "#F1F5F9",
        borderRadius: 20,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 20
    },
    bookBtnText: { fontSize: 15, fontWeight: "bold", color: Colors.PRIMARY },
    goldCard: { borderColor: Colors.PRIMARY, borderWidth: 2 },
    popularBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: "#FDE68A",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderBottomLeftRadius: 20,
        borderTopRightRadius: 28
    },
    popularText: { fontSize: 10, fontWeight: "bold", color: "#92400E" },
    goldBtn: { backgroundColor: Colors.PRIMARY },
    bookBtnTextSilver: { fontSize: 15, fontWeight: "bold", color: Colors.WHITE },
    platinumCard: { backgroundColor: "#111827", borderColor: "#1F2937" },
    eliteBadge: { position: "absolute", top: 25, right: 25 },
    platinumBtn: { backgroundColor: "#FDE68A" },
    cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    cardActionIcons: { flexDirection: "row", alignItems: "center" },
    customContainer: { padding: 30, alignItems: "center", marginTop: 10 },
    customTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
    customSub: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginTop: 5, textAlign: "center" },
    contactBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FCE7F3",
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginTop: 20,
        width: "100%",
        justifyContent: "center"
    },
    contactText: { fontSize: 14, fontWeight: "bold", color: Colors.PRIMARY }
});
