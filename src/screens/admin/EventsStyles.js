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
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#38BDF8",
    marginBottom: 6,
  },

  text: {
    color: "#CBD5E1",
    fontSize: 14,
    marginTop: 2,
  },
});
