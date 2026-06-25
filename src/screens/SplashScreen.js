import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image, StatusBar } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Colors from "../theme/Colors";

export default function SplashScreen() {
  // Animation Drivers
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const infoOpacity = useRef(new Animated.Value(0)).current;
  const infoTranslateY = useRef(new Animated.Value(20)).current;
  const pulseOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // 1. Spring-scale and double-rotate the logo
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 25,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Once logo animation is done, fade in the text branding
      Animated.parallel([
        Animated.timing(infoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(infoTranslateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // 3. Continuous pulse loop for loading text
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [logoScale, logoRotate, infoOpacity, infoTranslateY, pulseOpacity]);

  // Interpolate rotation from 0..1 to -720deg..0deg (double full spin)
  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-720deg", "0deg"],
  });

  return (
    <LinearGradient colors={Colors.GRADIENT_MAIN} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <View style={styles.centerContainer}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ scale: logoScale }, { rotate: spin }],
            },
          ]}
        >
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Studio Info */}
        <Animated.View
          style={[
            styles.infoContainer,
            {
              opacity: infoOpacity,
              transform: [{ translateY: infoTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>RAISERS</Text>
          <Text style={styles.subtitle}>DANCE STUDIO</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>Where Passion Rises & Talent Transforms</Text>
        </Animated.View>
      </View>

      {/* Pulsing Status at Bottom */}
      <View style={styles.footer}>
        <Animated.Text style={[styles.loadingText, { opacity: pulseOpacity }]}>
          RAISING YOUR RHYTHM...
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
  },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  infoContainer: {
    alignItems: "center",
    marginTop: 25,
    paddingHorizontal: 30,
  },
  title: {
    color: Colors.WHITE,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 6,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.TEXT_LIGHT,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 4,
    marginTop: 4,
    textAlign: "center",
  },
  divider: {
    width: 50,
    height: 2,
    backgroundColor: Colors.WHITE,
    marginVertical: 15,
    opacity: 0.3,
  },
  tagline: {
    color: Colors.TEXT_LIGHT,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    opacity: 0.8,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  loadingText: {
    color: Colors.WHITE,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});
