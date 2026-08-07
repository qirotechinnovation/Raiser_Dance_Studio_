import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import studentService from "../api/studentService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeProfile, setActiveProfile] = useState(null);
    const [familyProfiles, setFamilyProfiles] = useState([]);

    useEffect(() => {
        loadUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem("user");
            const token = await AsyncStorage.getItem("userToken"); // Standardized to userToken
            if (userJson && token) {
                const parsedUser = JSON.parse(userJson);
                setUser(parsedUser);
                const storedStudentId = await AsyncStorage.getItem("studentId");
                await loadFamilyProfiles(storedStudentId || parsedUser.studentId);
                setActiveProfile({ id: parsedUser.id || 'main', name: parsedUser.name || parsedUser.username || 'Main User', isMain: true });
            }
        } catch (e) {
            console.log("Error loading user", e);
        } finally {
            setLoading(false);
        }
    };
    const loadFamilyProfiles = async (studentId) => {
        try {
            if (!studentId) return;
            const res = await studentService.getFamilyProfiles(studentId);
            if (res.data) {
                setFamilyProfiles(res.data);
            }
        } catch (e) {
            console.log("Error loading family profiles from API", e);
            // Fallback to local storage
            try {
                const userId = user?.id || user?.email;
                if (userId) {
                    const profilesJson = await AsyncStorage.getItem(`familyProfiles_${userId}`);
                    if (profilesJson) {
                        setFamilyProfiles(JSON.parse(profilesJson));
                    } else {
                        setFamilyProfiles([]);
                    }
                }
            } catch (err) {
                console.log("Storage fallback error", err);
            }
        }
    };

    const login = async (userData, token) => {
        try {
            if (userData) {
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                if (userData.role) await AsyncStorage.setItem("userRole", userData.role);
                if (userData.studentId) {
                    await AsyncStorage.setItem("studentId", userData.studentId.toString());
                    await AsyncStorage.setItem("mainStudentId", userData.studentId.toString()); // Backup main ID
                }
                if (userData.id) await AsyncStorage.setItem("userId", userData.id.toString());
            }
            
            if (token) {
                await AsyncStorage.setItem("userToken", token);
            }
            
            setUser(userData);
            await loadFamilyProfiles(userData?.studentId);
            setActiveProfile({ id: userData?.id || 'main', name: userData?.name || userData?.username || 'Main User', isMain: true });
        } catch (e) {
            console.log("Login error", e);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(["user", "userToken", "studentId", "userId", "userRole", "adminEmail", "adminName", "userEmail"]);
            setUser(null);
            setActiveProfile(null);
            setFamilyProfiles([]);
        } catch (e) {
            console.log("Logout error", e);
        }
    };

    const addProfile = async (newProfile) => {
        try {
            const userId = user?.id || user?.email;
            if (!userId) return;
            
            const updatedProfiles = [...familyProfiles, newProfile];
            await AsyncStorage.setItem(`familyProfiles_${userId}`, JSON.stringify(updatedProfiles));
            setFamilyProfiles(updatedProfiles);
        } catch (e) {
            console.log("Error adding profile", e);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            logout,
            activeProfile,
            setActiveProfile,
            familyProfiles,
            addProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};
