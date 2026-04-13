import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../theme/Colors';
import { AuthContext } from '../context/AuthContext';

const ScreenHeader = ({
    title,
    showBack = true,
    backAction,
    rightIcon,
    onRightPress,
    rightText,
    actions = [], // Array of { icon, onPress, color, size }
    bgColor = Colors.WHITE,
    textColor = Colors.TEXT_PRIMARY,
    iconColor,
    useGradient = false,
}) => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const insets = useSafeAreaInsets();
    
    // If using gradient, default text and icons to white for contrast
    const finalTextColor = useGradient ? Colors.WHITE : textColor;
    const finalIconColor = iconColor || finalTextColor;

    const handleBack = () => {
        if (backAction) {
            backAction();
        } else {
            navigation.goBack();
        }
    };

    const renderActions = () => {
        const actionElements = [];

        if (actions && actions.length > 0) {
            actions.forEach((action, index) => {
                actionElements.push(
                    <TouchableOpacity 
                        key={`action-${index}`} 
                        onPress={action.onPress} 
                        style={[styles.iconBtn, action.style, { marginRight: 10 }]}
                    >
                        <Icon 
                            name={action.icon} 
                            size={action.size || 24} 
                            color={action.color || finalIconColor} 
                        />
                    </TouchableOpacity>
                );
            });
        } else if (rightIcon) {
            actionElements.push(
                <TouchableOpacity key="right-icon" onPress={onRightPress} style={[styles.iconBtn, { marginRight: 10 }]}>
                    <Icon name={rightIcon} size={24} color={finalIconColor} />
                </TouchableOpacity>
            );
        } else if (rightText) {
            actionElements.push(
                <TouchableOpacity key="right-text" onPress={onRightPress} style={[styles.textBtn, { marginRight: 10 }]}>
                    <Text style={[styles.rightText, { color: finalIconColor }]}>{rightText}</Text>
                </TouchableOpacity>
            );
        }

        // Add Profile Picture at the end of actions
        actionElements.push(
            <TouchableOpacity 
                key="profile-btn"
                onPress={() => navigation.navigate("Profile")}
                style={styles.profileBtn}
            >
                <Image 
                    source={user?.avatar ? { uri: user.avatar } : require('../assets/logo.png')} 
                    style={styles.profilePic} 
                />
            </TouchableOpacity>
        );

        return (
            <View style={styles.actionRow}>
                {actionElements}
            </View>
        );
    };

    const HeaderContainer = useGradient ? LinearGradient : View;
    const paddingTop = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 20);

    const containerProps = useGradient 
        ? { colors: [Colors.PRIMARY, "#000000"], style: [styles.container, styles.gradientContainer, { paddingTop }] }
        : { style: [styles.container, { backgroundColor: bgColor, paddingTop }] };

    return (
        <HeaderContainer {...containerProps}>
            <StatusBar 
                barStyle={useGradient ? "light-content" : "dark-content"} 
                backgroundColor="transparent" 
                translucent={true} 
            />
            <View style={[styles.content, useGradient && { height: 90, alignItems: 'center' }]}>
                {/* Left Section (Back Button + Logo) */}
                <View style={styles.left}>
                    {showBack ? (
                        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                            <Icon name="chevron-left" size={32} color={finalIconColor} />
                        </TouchableOpacity>
                    ) : (
                        <Image 
                            source={require('../assets/logo.png')} 
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    )}
                </View>

                {/* Center Section (Title) */}
                <View style={[styles.center, useGradient && { alignItems: 'flex-start', paddingLeft: 10 }]}>
                    <Text 
                        style={[
                            styles.title, 
                            { color: finalTextColor }, 
                            useGradient && { fontSize: 20, textAlign: 'left', width: '100%' }
                        ]} 
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                </View>

                {/* Right Section (Actions + Profile) */}
                <View style={styles.right}>
                    {renderActions()}
                </View>
            </View>
        </HeaderContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 5,
        zIndex: 100,
    },
    gradientContainer: {
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        paddingBottom: 20,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    content: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    left: {
        minWidth: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 50,
        height: 50,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
    },
    right: {
        minWidth: 40,
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    backBtn: {
        padding: 5,
        marginLeft: -5,
    },
    iconBtn: {
        padding: 5,
    },
    textBtn: {
        padding: 5,
    },
    rightText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
        overflow: 'hidden',
        marginLeft: 5,
    },
    profilePic: {
        width: '100%',
        height: '100%',
    }
});

export default ScreenHeader;
