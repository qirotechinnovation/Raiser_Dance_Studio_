import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from 'react-native-image-picker';
import adminService from "../../api/adminService";
import API from "../../api/axios";

// Colors
import Colors from "../../theme/Colors";
const HEADER_BG = Colors.PRIMARY;

export default function AdminAboutUsScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState({ 1: false, 2: false, 3: false, 4: false });
    const baseURL = API.defaults.baseURL;

    // Form State
    const [formData, setFormData] = useState({
        studioName: "",
        tagline: "",
        aboutText: "",
        passionText: "",
        email: "",
        phone: "",
        address: "",
        classTypesInfo: "",
        skillLevelsInfo: "",
        danceStylesInfo: "",
        trainingPlanText: "",
        kidsProgramText: "",
        teenClassesText: "",
        adultClassesText: "",
        competitionTeamText: "",
        privateLessonsText: "",
        image1Path: "",
        image2Path: "",
        image3Path: "",
        directorImagePath: ""
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await adminService.getAboutUsSettings();
            if (res.data) {
                setFormData({
                    studioName: res.data.studioName || "",
                    tagline: res.data.tagline || "",
                    aboutText: res.data.aboutText || "",
                    passionText: res.data.passionText || "",
                    email: res.data.email || "",
                    phone: res.data.phone || "",
                    address: res.data.address || "",
                    classTypesInfo: res.data.classTypesInfo || "",
                    skillLevelsInfo: res.data.skillLevelsInfo || "",
                    danceStylesInfo: res.data.danceStylesInfo || "",
                    trainingPlanText: res.data.trainingPlanText || "",
                    kidsProgramText: res.data.kidsProgramText || "",
                    teenClassesText: res.data.teenClassesText || "",
                    adultClassesText: res.data.adultClassesText || "",
                    competitionTeamText: res.data.competitionTeamText || "",
                    privateLessonsText: res.data.privateLessonsText || "",
                    image1Path: res.data.image1Path || "",
                    image2Path: res.data.image2Path || "",
                    image3Path: res.data.image3Path || "",
                    directorImagePath: res.data.directorImagePath || ""
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            Alert.alert("Error", "Could not load settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminService.updateAboutUsSettings(formData);
            Alert.alert("Success", "About Us settings updated!");
            navigation.goBack();
        } catch (error) {
            console.error("Error saving settings:", error);
            Alert.alert("Error", "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const pickImage = (imageNumber) => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert("Error", "Image picking failed.");
                return;
            }

            const asset = response.assets[0];
            const formDataImage = new FormData();
            formDataImage.append('file', {
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `about_us_${imageNumber}.jpg`,
            });

            setUploading({ ...uploading, [imageNumber]: true });
            try {
                const res = await adminService.uploadAboutUsImage(imageNumber, formDataImage);
                if (res.data && res.data.success) {
                    if (imageNumber === 4) {
                        setFormData({ ...formData, directorImagePath: res.data.imagePath });
                    } else {
                        setFormData({ ...formData, [`image${imageNumber}Path`]: res.data.imagePath });
                    }
                    Alert.alert("Success", `Image uploaded successfully!`);
                }
            } catch (error) {
                console.error("Upload error:", error);
                Alert.alert("Error", "Failed to upload image.");
            } finally {
                setUploading({ ...uploading, [imageNumber]: false });
            }
        });
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={HEADER_BG} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={26} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit About Us</Text>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator size="small" color={Colors.WHITE} /> : <Icon name="check" size={26} color={Colors.WHITE} />}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Images Section */}
                <Text style={styles.sectionTitle}>Studio Images</Text>
                <View style={styles.card}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {[1, 2, 3].map(num => (
                            <TouchableOpacity key={num} style={styles.imageSelector} onPress={() => pickImage(num)}>
                                {uploading[num] ? (
                                    <ActivityIndicator color={HEADER_BG} />
                                ) : formData[`image${num}Path`] ? (
                                    <Image
                                        source={{ uri: `${baseURL}/uploads/${formData[`image${num}Path`]}` }}
                                        style={styles.selectedImage}
                                    />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Icon name="camera-plus" size={30} color={Colors.TEXT_MUTED} />
                                        <Text style={styles.placeholderText}>Img {num}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <Text style={styles.infoText}>Tap an image slot to upload/update studio photos.</Text>
                </View>

                {/* Director Image Section */}
                <Text style={styles.sectionTitle}>Director / Owner Photo</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={[styles.imageSelector, { width: 150, height: 150, borderRadius: 75, alignSelf: 'center' }]} onPress={() => pickImage(4)}>
                        {uploading[4] ? (
                            <ActivityIndicator color={HEADER_BG} />
                        ) : formData.directorImagePath ? (
                            <Image
                                source={{ uri: `${baseURL}/uploads/${formData.directorImagePath}` }}
                                style={[styles.selectedImage, { borderRadius: 75 }]}
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Icon name="account-circle-outline" size={40} color={Colors.TEXT_MUTED} />
                                <Text style={styles.placeholderText}>Upload Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={[styles.infoText, { textAlign: 'center' }]}>Tap to upload the owner's photo.</Text>
                </View>

                {/* General Info */}
                <Text style={styles.sectionTitle}>General Info</Text>
                <View style={styles.card}>
                    <InputLabel label="Studio Name" icon="domain" />
                    <TextInput
                        style={styles.input}
                        value={formData.studioName}
                        onChangeText={(t) => setFormData({ ...formData, studioName: t })}
                        placeholder="e.g. Raisers Dance Studio"
                    />

                    <InputLabel label="Tagline" icon="format-quote-close" />
                    <TextInput
                        style={styles.input}
                        value={formData.tagline}
                        onChangeText={(t) => setFormData({ ...formData, tagline: t })}
                        placeholder="e.g. Where Passion Rises..."
                    />
                </View>

                {/* Content */}
                <Text style={styles.sectionTitle}>Content</Text>
                <View style={styles.card}>
                    <InputLabel label="About Description" icon="text-box-outline" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.aboutText}
                        onChangeText={(t) => setFormData({ ...formData, aboutText: t })}
                        placeholder="Describe your studio..."
                        multiline
                    />

                    <InputLabel label="Our Passion" icon="heart-outline" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.passionText}
                        onChangeText={(t) => setFormData({ ...formData, passionText: t })}
                        placeholder="Share your vision and passion..."
                        multiline
                    />
                </View>

                {/* Contact Info */}
                <Text style={styles.sectionTitle}>Contact Details</Text>
                <View style={styles.card}>
                    <InputLabel label="Official Email" icon="email-outline" />
                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(t) => setFormData({ ...formData, email: t })}
                        placeholder="contact@studio.com"
                        keyboardType="email-address"
                    />

                    <InputLabel label="Phone Number" icon="phone-outline" />
                    <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(t) => setFormData({ ...formData, phone: t })}
                        placeholder="+91 98765 43210"
                        keyboardType="phone-pad"
                    />

                    <InputLabel label="Office Address" icon="map-marker-outline" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.address}
                        onChangeText={(t) => setFormData({ ...formData, address: t })}
                        placeholder="Enter office address..."
                        multiline
                    />
                </View>

                {/* Detailed Sections */}
                <Text style={styles.sectionTitle}>Detailed Sections</Text>
                <View style={styles.card}>
                    <InputLabel label="Class Types Info" icon="school-outline" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.classTypesInfo}
                        onChangeText={(t) => setFormData({ ...formData, classTypesInfo: t })}
                        placeholder="Enter class types info..."
                        multiline
                    />

                    <InputLabel label="Skill Levels Info" icon="stairs" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.skillLevelsInfo}
                        onChangeText={(t) => setFormData({ ...formData, skillLevelsInfo: t })}
                        placeholder="Enter skill levels info..."
                        multiline
                    />

                    <InputLabel label="Dance Styles Info" icon="dance-ballroom" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.danceStylesInfo}
                        onChangeText={(t) => setFormData({ ...formData, danceStylesInfo: t })}
                        placeholder="Enter dance styles info..."
                        multiline
                    />

                    <InputLabel label="Training Plan" icon="notebook-outline" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.trainingPlanText}
                        onChangeText={(t) => setFormData({ ...formData, trainingPlanText: t })}
                        placeholder="Enter training plan..."
                        multiline
                    />

                    <InputLabel label="Kids Program" icon="human-child" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.kidsProgramText}
                        onChangeText={(t) => setFormData({ ...formData, kidsProgramText: t })}
                        placeholder="Enter kids program details..."
                        multiline
                    />

                    <InputLabel label="Teen Classes" icon="human-male-female" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.teenClassesText}
                        onChangeText={(t) => setFormData({ ...formData, teenClassesText: t })}
                        placeholder="Enter teen classes details..."
                        multiline
                    />

                    <InputLabel label="Adult Classes" icon="human-female-dance" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.adultClassesText}
                        onChangeText={(t) => setFormData({ ...formData, adultClassesText: t })}
                        placeholder="Enter adult classes details..."
                        multiline
                    />

                    <InputLabel label="Competition Team" icon="trophy-outline" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.competitionTeamText}
                        onChangeText={(t) => setFormData({ ...formData, competitionTeamText: t })}
                        placeholder="Enter competition team details..."
                        multiline
                    />

                    <InputLabel label="Private Lessons" icon="account-star-outline" />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.privateLessonsText}
                        onChangeText={(t) => setFormData({ ...formData, privateLessonsText: t })}
                        placeholder="Enter private lessons details..."
                        multiline
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function InputLabel({ label, icon }) {
    return (
        <View style={styles.labelRow}>
            <Icon name={icon} size={18} color={Colors.TEXT_SECONDARY} />
            <Text style={styles.labelText}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F1F5F9" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        backgroundColor: HEADER_BG,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 4
    },
    headerTitle: { fontSize: 20, color: Colors.WHITE, fontWeight: "bold" },
    backBtn: { padding: 5 },
    saveBtn: { padding: 5 },

    content: { padding: 20 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#334155",
        marginTop: 15,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    card: {
        backgroundColor: Colors.WHITE,
        borderRadius: 16,
        padding: 20,
        marginBottom: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    imageSelector: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: Colors.BG_CONTENT,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        overflow: 'hidden'
    },
    selectedImage: {
        width: '100%',
        height: '100%'
    },
    imagePlaceholder: {
        alignItems: 'center'
    },
    placeholderText: {
        fontSize: 12,
        color: Colors.TEXT_MUTED,
        marginTop: 5
    },
    infoText: {
        fontSize: 12,
        color: Colors.TEXT_SECONDARY,
        marginTop: 10,
        fontStyle: 'italic'
    },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 5 },
    labelText: { fontSize: 13, fontWeight: "600", color: Colors.TEXT_SECONDARY, marginLeft: 8 },
    input: {
        backgroundColor: Colors.BG_CONTENT,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 15,
        color: Colors.TEXT_PRIMARY,
        marginBottom: 15
    },
    textArea: {
        height: 120,
        textAlignVertical: "top"
    }
});
