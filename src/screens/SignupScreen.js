import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import API from "../api/axios";
import Colors from "../theme/Colors";

export default function StudentSignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [parentMobile, setParentMobile] = useState("");
  const [address, setAddress] = useState("");
  const [taluka, setTaluka] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [nationality, setNationality] = useState("Indian"); // Default
  const [parentRelation, setParentRelation] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    if (!name || !age || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    // Ensure mobile starts with +91
    const finalMobile = parentMobile.startsWith("+91") ? parentMobile : "+91" + parentMobile;

    try {
      const response = await API.post("/auth/register", {
        name,
        age: parseInt(age, 10),
        email,
        password,
        parentMobile: finalMobile,
        address,
        taluka,
        district,
        pincode,
        state,
        nationality,
        parentRelation,
      });

      if (response.data && response.data.success) {
        Alert.alert("Success", "Account created successfully", [
          { text: "Log In", onPress: () => navigation.replace("Login") }
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Registration failed");
      }
    } catch (e) {
      console.log("Registration Error:", e);
      Alert.alert("Error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={Colors.GRADIENT_MAIN} style={styles.container}>
        <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Icon name="arrow-left" size={24} color={Colors.TEXT_WHITE} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSubtitle}>Join the Dance Studio community</Text>
      </View>

      <View style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="e.g. Isabella Rossi" placeholderTextColor="#aaa" value={name} onChangeText={setName} />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Age</Text>
              <TextInput style={styles.input} placeholder="Yrs" placeholderTextColor="#aaa" keyboardType="numeric" value={age} onChangeText={setAge} />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>
                {(!age || parseInt(age, 10) < 18) ? "Parent Mobile" : "Mobile Number"}
              </Text>
              <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }]}>
                <Text style={{ color: '#000', fontWeight: 'bold', marginRight: 5 }}>+91</Text>
                <TextInput
                  style={{ flex: 1, color: Colors.TEXT_PRIMARY, fontSize: 16 }}
                  placeholder="Mobile"
                  placeholderTextColor="#aaa"
                  keyboardType="phone-pad"
                  value={parentMobile}
                  onChangeText={setParentMobile}
                />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholder="isabella@example.com" placeholderTextColor="#aaa" autoCapitalize="none" value={email} onChangeText={setEmail} />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0, marginTop: 0, backgroundColor: 'transparent' }]}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Icon name={showPassword ? "eye" : "eye-off"} size={22} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0, marginTop: 0, backgroundColor: 'transparent' }]}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Icon name={showConfirmPassword ? "eye" : "eye-off"} size={22} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Address Section */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>Residence Details</Text>
          </View>

          <Text style={styles.label}>Full Address</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
            placeholder="House No, Street, Landmark"
            placeholderTextColor="#aaa"
            multiline
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Taluka</Text>
              <TextInput style={styles.input} placeholder="Taluka" placeholderTextColor="#aaa" value={taluka} onChangeText={setTaluka} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>District</Text>
              <TextInput style={styles.input} placeholder="District" placeholderTextColor="#aaa" value={district} onChangeText={setDistrict} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>State</Text>
              <View style={styles.modernInputContainer}>
                <Icon name="map-marker-radius" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                <TextInput style={styles.modernInput} placeholder="State" placeholderTextColor={Colors.TEXT_PLACEHOLDER} value={state} onChangeText={setState} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Pincode</Text>
              <View style={styles.modernInputContainer}>
                <Icon name="mailbox" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                <TextInput style={styles.modernInput} placeholder="6 Digits" placeholderTextColor={Colors.TEXT_PLACEHOLDER} keyboardType="numeric" maxLength={6} value={pincode} onChangeText={setPincode} />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Nationality</Text>
          <View style={styles.modernInputContainer}>
            <Icon name="earth" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
            <TextInput style={styles.modernInput} placeholder="e.g. Indian" placeholderTextColor={Colors.TEXT_PLACEHOLDER} value={nationality} onChangeText={setNationality} />
          </View>

          <Text style={styles.label}>Parent/Guardian Relation</Text>
          <View style={styles.relationContainer}>
            {['Mom', 'Dad', 'Brother', 'Other'].map((rel) => (
              <TouchableOpacity
                key={rel}
                style={[styles.relationBtn, parentRelation === rel && styles.relationBtnActive]}
                onPress={() => setParentRelation(rel)}
              >
                <Text style={[styles.relationText, parentRelation === rel && styles.relationTextActive]}>{rel}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.signupBtn} onPress={signup} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.signupBtnText}>SIGN UP</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLinkText}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </LinearGradient>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { marginTop: 50, marginLeft: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  header: { paddingHorizontal: 25, marginBottom: 20, marginTop: 10 },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: Colors.TEXT_WHITE },
  headerSubtitle: { fontSize: 14, color: Colors.TEXT_LIGHT, marginTop: 5 },

  card: {
    flex: 1,
    backgroundColor: Colors.BG_CARD,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.TEXT_SECONDARY,
    marginBottom: 6,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: Colors.RADIUS_INPUT || 12,
    paddingHorizontal: 15,
    height: 55,
    color: Colors.TEXT_DARK,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    justifyContent: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F1F5F9",
    borderRadius: Colors.RADIUS_INPUT || 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    overflow: 'hidden',
    height: 55,
  },
  eyeIcon: {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  row: { flexDirection: "row" },
  signupBtn: {
    backgroundColor: Colors.PRIMARY,
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    elevation: 4,
  },
  signupBtnText: { color: Colors.TEXT_WHITE, fontSize: 16, fontWeight: "bold", letterSpacing: 1 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 25, marginBottom: 10 },
  footerText: { color: Colors.TEXT_SECONDARY },
  loginLinkText: { color: Colors.PRIMARY, fontWeight: "bold" },

  sectionDivider: { marginTop: 25, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 5 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: Colors.PRIMARY, textTransform: 'uppercase', letterSpacing: 1 },

  modernInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F1F5F9",
    borderRadius: Colors.RADIUS_INPUT || 12,
    height: 55,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  modernInput: { flex: 1, color: Colors.TEXT_DARK, fontSize: 16 },

  relationContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  relationBtn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: Colors.BORDER },
  relationBtnActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
  relationText: { color: Colors.TEXT_SECONDARY, fontWeight: '600' },
  relationTextActive: { color: Colors.TEXT_WHITE },
});
