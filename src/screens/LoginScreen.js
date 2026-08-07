import React, { useState, useRef, useEffect, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Animated, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import styles from "./AuthStyles";
import Colors from "../theme/Colors";
import API from "../api/axios";
import offlineService from "../api/offlineService";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = (anim, duration, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 15, duration: duration, delay: delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: -15, duration: duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: duration, useNativeDriver: true })
        ])
      ).start();
    };

    float(circle1Anim, 3000, 0);
    float(circle2Anim, 4000, 500);
  }, []);

  const handleContactAdmin = async (userEmail, userName) => {
    try {
      await API.post("/auth/request-activation", {
        email: userEmail,
        message: `Student ${userName || userEmail} is requesting account activation.`
      });
      Alert.alert(
        "Request Sent",
        "Your activation request has been sent to the admin. You will be notified once your account is activated.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send request. Please contact admin directly.");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data.success) {
        const { token, user, role, studentId, feeStatus } = res.data;

        if (role === "STUDENT" && user && user.active === false) {
          Alert.alert(
            "Account Inactive",
            "Your account is currently inactive. Please contact your admin to activate your account.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Contact Admin",
                onPress: () => handleContactAdmin(email.trim(), user.name || user.username)
              }
            ]
          );
          return;
        }

        const userData = { ...user, role, studentId, feeStatus };
        await login(userData, token);
        await offlineService.cacheAuth(email.trim(), { password: password.trim(), response: res.data });
      } else {
        if (res.data.message && res.data.message.includes("Inactive")) {
          Alert.alert(
            "Account Inactive",
            "Your account is currently inactive. Please contact your admin to activate your account.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Contact Admin",
                onPress: () => handleContactAdmin(email.trim(), "Student")
              }
            ]
          );
        } else {
          Alert.alert("Login Failed", res.data.message);
        }
      }
    } catch (e) {
      console.log("Login Error:", e);
      if (!e.response) {
        const offlineData = await offlineService.verifyOfflineAuth(email.trim(), password.trim());
        if (offlineData) {
          const { role, studentId, user } = offlineData;
          await login({ ...user, role, studentId }, "offline-token");
          Alert.alert("Offline Log In", "Logged in using cached credentials.");
          return;
        }
        Alert.alert("Connection Error", "Server is unreachable and no cached credentials found.");
      } else {
        Alert.alert("Login Error", e.response.data.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={[Colors.PRIMARY, "#000000"]} style={styles.container}>
        <Animated.View style={[styles.circle1, { transform: [{ translateY: circle1Anim }] }]} />
        <Animated.View style={[styles.circle2, { transform: [{ translateY: circle2Anim }] }]} />

        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.hello}>Welcome Back</Text>
            <Text style={styles.signin}>Sign In</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="yourname@example.com"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginTop: 0, borderWidth: 0, backgroundColor: 'transparent' }]}
                placeholder="********"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Icon name={showPassword ? "eye" : "eye-off"} size={22} color={Colors.PRIMARY} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Please contact the admin to reset your password.")}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.WHITE} />
              ) : (
                <Text style={styles.buttonText}>SIGN IN</Text>
              )}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center' }}>
              <Text style={{ color: '#aaa' }}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={{ color: Colors.PRIMARY, fontWeight: 'bold' }}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* About Us Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate("AboutUs")}
              style={{ marginTop: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
            >
              <Icon name="information-outline" size={16} color="#aaa" style={{ marginRight: 5 }} />
              <Text style={{ color: '#aaa', fontSize: 13 }}>About </Text>
              <Text style={{ color: Colors.PRIMARY, fontSize: 13, fontWeight: 'bold' }}>Raiser's Dance Studio</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

