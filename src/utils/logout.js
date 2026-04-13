import AsyncStorage from "@react-native-async-storage/async-storage";

export const logout = async (navigation) => {
  try {
    await AsyncStorage.multiRemove(["token", "role", "userId"]);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } catch (e) {
    console.log("Logout error", e);
  }
};
