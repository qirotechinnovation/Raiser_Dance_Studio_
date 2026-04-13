import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const OfflineStatus = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [visible, setVisible] = useState(false);
    const slideAnim = new Animated.Value(-100);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = !!state.isConnected;
            setIsConnected(connected);
            if (!connected) {
                setVisible(true);
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            } else if (visible) {
                // Return to normal color/hide after 3 seconds of being online
                setTimeout(() => {
                    Animated.timing(slideAnim, {
                        toValue: -100,
                        duration: 500,
                        useNativeDriver: true,
                    }).start(() => setVisible(false));
                }, 3000);
            }
        });

        return () => unsubscribe();
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[
            styles.container,
            { transform: [{ translateY: slideAnim }], backgroundColor: isConnected ? '#10B981' : '#64748B' }
        ]}>
            <Icon name={isConnected ? "wifi-check" : "wifi-off"} size={16} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.text}>
                {isConnected ? "Back Online - Syncing..." : "Offline Mode - Using Local Data"}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    text: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    }
});

export default OfflineStatus;
