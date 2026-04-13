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
    marginBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: Colors.TEXT_PRIMARY,
    width: "48%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 8,
  },
logoutBtn: {
  marginTop: 20,
  backgroundColor: Colors.ERROR,
  padding: 12,
  borderRadius: 10,
  alignItems: "center",
},
logoutText: {
  color: "#fff",
  fontWeight: "bold",
},

  cardTitle: {
    color: "#CBD5E1",
    fontSize: 14,
  },

  cardValue: {
    color: "#38BDF8",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 6,
  },
});
