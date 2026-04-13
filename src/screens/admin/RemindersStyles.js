import { StyleSheet } from "react-native";
import Colors from "../../theme/Colors";


export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY_DARK,
    padding: 16,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 14,
  },

  card: {
    backgroundColor: Colors.TEXT_PRIMARY,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FBBF24",
  },

  message: {
    color: "#E5E7EB",
    marginTop: 6,
    fontSize: 14,
  },

  date: {
    color: "#9CA3AF",
    marginTop: 8,
    fontSize: 12,
  },
});
