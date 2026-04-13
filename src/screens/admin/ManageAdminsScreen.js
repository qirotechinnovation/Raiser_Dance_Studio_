import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import adminService from '../../api/adminService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from "../../theme/Colors";


const ManageAdminsScreen = ({ navigation }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            const res = await adminService.getAllAdmins();
            setAdmins(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name?.charAt(0) || 'A'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                </View>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{item.role}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.secretBox}>
                <Text style={styles.secretLabel}>Password:</Text>
                <Text style={styles.secretValue}>{item.password}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.BG_CONTENT} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color="#000" /></TouchableOpacity>
                <Text style={styles.title}>All Admins</Text>
            </View>

            {loading ? <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 50 }} /> :
                <FlatList
                    data={admins}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    keyExtractor={item => item.id.toString()}
                />
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: Colors.WHITE, elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, color: '#000' },
    card: { backgroundColor: Colors.WHITE, borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.PRIMARY, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 18 },
    name: { fontSize: 16, fontWeight: 'bold', color: Colors.TEXT_PRIMARY },
    email: { fontSize: 13, color: Colors.TEXT_SECONDARY },
    roleBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    roleText: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
    divider: { height: 1, backgroundColor: Colors.BORDER, marginVertical: 10 },
    secretBox: { backgroundColor: '#FFF1F2', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
    secretLabel: { fontSize: 12, fontWeight: 'bold', color: Colors.PRIMARY, marginRight: 8 },
    secretValue: { fontSize: 14, fontFamily: 'monospace', color: Colors.PRIMARY }
});

export default ManageAdminsScreen;
