import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem("user");
            const token = await AsyncStorage.getItem("userToken"); // Standardized to userToken
            if (userJson && token) {
                setUser(JSON.parse(userJson));
            }
        } catch (e) {
            console.log("Error loading user", e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, token) => {
        try {
            if (userData) {
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                if (userData.role) await AsyncStorage.setItem("userRole", userData.role);
                if (userData.studentId) await AsyncStorage.setItem("studentId", userData.studentId.toString());
                if (userData.id) await AsyncStorage.setItem("userId", userData.id.toString());
            }
            
            if (token) {
                await AsyncStorage.setItem("userToken", token);
            }
            
            setUser(userData);
        } catch (e) {
            console.log("Login error", e);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(["user", "userToken", "studentId", "userId", "userRole", "adminEmail", "adminName", "userEmail"]);
            setUser(null);
        } catch (e) {
            console.log("Logout error", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
