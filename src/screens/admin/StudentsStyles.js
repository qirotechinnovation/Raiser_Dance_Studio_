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
    marginBottom: 12,
  },

  card: {
    backgroundColor: Colors.TEXT_PRIMARY,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 6,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#38BDF8",
  },

  info: {
    color: "#CBD5E1",
    marginTop: 4,
    fontSize: 14,
  },
});
