import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from './ScreenHeader';
import Footer from './Footer';
import Colors from '../theme/Colors';

/**
 * BaseScreen provides a standardized layout for all app screens.
 * Includes a standardized Header, an optional auto-revealing Footer, 
 * and integrated loading states.
 */
const BaseScreen = ({
    title,
    showBack = true,
    backAction,
    actions = [],
    rightIcon,
    onRightPress,
    rightText,
    loading = false,
    isScrollable = true,
    children,
    headerBgColor = Colors.WHITE,
    headerTextColor = Colors.TEXT_PRIMARY,
    containerStyle,
    scrollContentStyle,
    footerStyle,
    showFooter = true,
    useGradient = false // New prop for premium gradient header
}) => {
    const footerFadeAnim = useRef(new Animated.Value(0)).current;
    const [footerVisible, setFooterVisible] = useState(false);

    const onScroll = (event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
        
        if (isCloseToBottom && !footerVisible) {
            setFooterVisible(true);
            Animated.timing(footerFadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Colors.PRIMARY} />
                </View>
            );
        }

        if (isScrollable) {
            return (
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                >
                    {children}
                    {showFooter && (
                        <Animated.View style={[{ opacity: footerFadeAnim, marginTop: 40 }, footerStyle]}>
                            <Footer />
                        </Animated.View>
                    )}
                </ScrollView>
            );
        }

        return (
            <View style={[styles.flexContent, containerStyle]}>
                {children}
                {showFooter && (
                    <View style={[{ position: 'absolute', bottom: 0, left: 0, right: 0 }, footerStyle]}>
                        <Footer />
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <ScreenHeader 
                title={title}
                showBack={showBack}
                backAction={backAction}
                actions={actions}
                rightIcon={rightIcon}
                onRightPress={onRightPress}
                rightText={rightText}
                bgColor={headerBgColor}
                textColor={headerTextColor}
                useGradient={useGradient}
            />
            <View style={styles.layout}>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.BG_CONTENT || '#F8FAFC',
    },
    layout: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    flexContent: {
        flex: 1,
    }
});

export default BaseScreen;
