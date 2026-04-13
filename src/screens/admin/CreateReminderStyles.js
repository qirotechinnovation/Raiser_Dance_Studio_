import { StyleSheet } from "react-native";
import Colors from "../../theme/Colors";


export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY_DARK,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  card: {
    width: "100%",
    backgroundColor: Colors.TEXT_PRIMARY,
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FBBF24",
    marginBottom: 16,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    marginBottom: 12,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  button: {
    backgroundColor: "#F59E0B",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#020617",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
