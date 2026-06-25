import React, { useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, StatusBar } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Colors from "../../theme/Colors";
import { AuthContext } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileSelectionScreen({ navigation }) {
    const { user, familyProfiles, setActiveProfile } = useContext(AuthContext);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // Combine main user with family profiles
    const allProfiles = [
        { id: user?.id || 'main', name: user?.name || user?.username || 'Main User', isMain: true, color: '#E50914' },
        ...familyProfiles.map((p, index) => ({
            ...p,
            color: getProfileColor(index),
            isMain: false
        }))
    ];

    function getProfileColor(index) {
        const colors = ['#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c'];
        return colors[index % colors.length];
    }

    const handleSelectProfile = async (profile) => {
        try {
            if (profile.isMain) {
                const mainId = await AsyncStorage.getItem("mainStudentId") || user?.studentId;
                if (mainId) {
                    await AsyncStorage.setItem("studentId", mainId.toString());
                }
            } else if (profile.studentId) {
                await AsyncStorage.setItem("studentId", profile.studentId.toString());
            }
        } catch (error) {
            console.error("Error setting studentId on profile switch", error);
        }
        setActiveProfile(profile);
    };

    const renderProfile = (profile) => {
        const initials = profile.name ? profile.name.substring(0, 2).toUpperCase() : '??';
        
        return (
            <TouchableOpacity 
                key={profile.id || profile.name} 
                style={styles.profileContainer}
                onPress={() => handleSelectProfile(profile)}
            >
                <View style={[styles.avatarBox, { backgroundColor: profile.color }]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <Text style={styles.profileName} numberOfLines={1}>{profile.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <LinearGradient colors={['#0D1117', '#000000']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
            
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Text style={styles.title}>Who's dancing?</Text>
                
                <ScrollView contentContainerStyle={styles.grid}>
                    {allProfiles.map(renderProfile)}
                </ScrollView>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.TEXT_WHITE,
        marginBottom: 40,
        letterSpacing: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 20,
        gap: 20,
    },
    profileContainer: {
        alignItems: 'center',
        width: 100,
        marginBottom: 20,
    },
    avatarBox: {
        width: 90,
        height: 90,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.TEXT_WHITE,
    },
    profileName: {
        color: Colors.TEXT_MUTED,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    addBox: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.TEXT_MUTED,
        borderStyle: 'dashed',
    }
});
