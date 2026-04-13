import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    elevation: 2,
  },
  month: { fontSize: 16, fontWeight: "bold" },
  amount: { fontSize: 14 },
});
