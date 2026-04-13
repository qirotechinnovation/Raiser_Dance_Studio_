import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Animated, ScrollView, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import Colors from "../theme/Colors";
import studentService from "../api/studentService";
import API from "../api/axios";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const baseURL = API.defaults.baseURL;

  useEffect(() => {
    const float = (anim, duration = 4000, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 30, duration: duration, delay: delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: -30, duration: duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: duration, useNativeDriver: true })
        ])
      ).start();
    };

    float(bubble1, 3000, 0);
    float(bubble2, 3500, 500);
    float(bubble3, 4000, 200);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={Colors.GRADIENT_MAIN}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Decorative Bubbles */}
      <Animated.View style={[styles.bubble, { width: 120, height: 120, top: 80, left: -30, opacity: 0.05, transform: [{ translateY: bubble1 }] }]} />
      <Animated.View style={[styles.bubble, { width: 180, height: 180, top: 180, right: -50, opacity: 0.08, transform: [{ translateY: bubble2 }] }]} />
      <Animated.View style={[styles.bubble, { width: 100, height: 100, bottom: 200, left: 40, opacity: 0.05, transform: [{ translateY: bubble3 }] }]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Logo Section */}
          <View style={styles.header}>
            <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.logoRing}>
                <Image
                  source={require("../assets/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>
            
            <TouchableOpacity
              style={styles.aboutBtn}
              onPress={() => navigation.navigate("AboutUs")}
            >
              <Icon name="information-variant" size={24} color={Colors.TEXT_WHITE} />
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.centerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.welcomeText}>
              Discover Your <Text style={styles.boldText}>Rhythm</Text>
            </Text>
            <View style={styles.visionSnippet}>
              <View style={styles.visionBadge}>
                <Text style={styles.visionBadgeText}>OUR LEGACY</Text>
              </View>
              <Text style={styles.visionText}>
                Where passion rises, confidence grows, and talent transforms into excellence. Experience the art of motion.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("AboutUs")} style={styles.readMoreBtn}>
                <Text style={styles.readMore}>Explore Our Story</Text>
                <Icon name="arrow-right" size={16} color={Colors.WHITE} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Colors.GRADIENT_BTN}
                style={styles.gradientBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryBtnText}>GET STARTED</Text>
                <Icon name="chevron-right" size={24} color={Colors.TEXT_WHITE} />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("Signup")}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 30, justifyContent: "space-between", paddingBottom: 20 },

  bubble: {
    position: "absolute",
    backgroundColor: Colors.TEXT_WHITE,
    borderRadius: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 40,
  },
  logoRing: {
    padding: 15,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
  },
  aboutBtn: {
    position: 'absolute',
    right: 0,
    top: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
  },
  logo: {
    width: 140,
    height: 140,
  },
  centerSection: {
    alignItems: "center",
    marginTop: -40,
  },
  welcomeText: {
    fontSize: 40,
    color: Colors.TEXT_WHITE,
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: -1,
  },
  boldText: {
    fontWeight: "800",
    color: Colors.TEXT_WHITE,
  },
  visionSnippet: {
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 24,
    borderRadius: 28,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
  },
  visionBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 15,
  },
  visionBadgeText: {
    color: Colors.TEXT_WHITE,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  visionText: {
    color: Colors.TEXT_LIGHT,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readMore: {
    color: Colors.TEXT_WHITE,
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 15,
  },
  gradientBtn: {
    height: 64,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  primaryBtnText: {
    color: Colors.TEXT_WHITE,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
    marginLeft: 24,
  },
  secondaryBtn: {
    width: '100%',
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
  },
  secondaryBtnText: {
    color: Colors.TEXT_WHITE,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  versionText: {
    color: Colors.TEXT_DIM,
    fontSize: 10,
    marginTop: 20,
    fontWeight: '600',
  }
});
