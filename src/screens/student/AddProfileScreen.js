import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "../../theme/Colors";
import { AuthContext } from "../../context/AuthContext";

export default function AddProfileScreen({ navigation }) {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [relation, setRelation] = useState("");
    const { addProfile } = useContext(AuthContext);

    const handleSave = async () => {
        if (!name.trim() || !age.trim() || !relation.trim()) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        const newProfile = {
            id: Date.now().toString(),
            name: name.trim(),
            age: age.trim(),
            relation: relation.trim()
        };

        await addProfile(newProfile);
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <LinearGradient colors={['#0D1117', '#151540']} style={styles.container}>
                <StatusBar barStyle="light-content" />
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={28} color={Colors.TEXT_WHITE} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Profile</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.content}>
                    <View style={styles.avatarPreview}>
                        <Icon name="account" size={60} color="#0D1117" />
                    </View>

                    <Text style={styles.label}>Profile Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. John"
                        placeholderTextColor={Colors.TEXT_MUTED}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Age</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 10"
                        placeholderTextColor={Colors.TEXT_MUTED}
                        keyboardType="numeric"
                        value={age}
                        onChangeText={setAge}
                    />

                    <Text style={styles.label}>Relation</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Son, Daughter, Self"
                        placeholderTextColor={Colors.TEXT_MUTED}
                        value={relation}
                        onChangeText={setRelation}
                    />

                    <View style={{ flex: 1 }} />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>SAVE PROFILE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButtonText}>CANCEL</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.TEXT_WHITE,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    avatarPreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: Colors.TEXT_MUTED,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    label: {
        color: Colors.TEXT_WHITE,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 55,
        color: Colors.TEXT_WHITE,
        fontSize: 16,
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: Colors.WHITE,
        height: 55,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    saveButtonText: {
        color: Colors.PRIMARY_DARK,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    cancelButton: {
        height: 55,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: Colors.TEXT_MUTED,
    },
    cancelButtonText: {
        color: Colors.TEXT_MUTED,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
