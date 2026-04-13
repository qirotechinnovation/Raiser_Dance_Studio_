import { StyleSheet } from "react-native";
import Colors from "../../theme/Colors";


export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY_DARK,
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },

  card: {
    backgroundColor: Colors.TEXT_PRIMARY,
    borderRadius: 18,
    padding: 18,
    elevation: 8,
  },

  label: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 10,
  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#38BDF8",
    marginTop: 2,
  },
});
