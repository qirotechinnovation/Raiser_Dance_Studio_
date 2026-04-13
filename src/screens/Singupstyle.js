import { StyleSheet } from "react-native";
import Colors from "../theme/Colors";


export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },

  circle1: {
    position: "absolute",
    width: 180,
    height: 180,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 100,
    top: 80,
    left: -40,
  },

  circle2: {
    position: "absolute",
    width: 240,
    height: 240,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 130,
    top: 240,
    right: -90,
  },

  header: {
    position: "absolute",
    top: 100,
    left: 25, fontWeight: "bold",
  },

  hello: {
    color: "#fff",
    fontSize: 29,
    paddingBottom: 5,
    fontWeight: "bold",
    lineHeight: 40,
  },

  signin: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 40,
  },

  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 100,
  },

  label: {
    color: "#b3002d",
    fontSize: 15,
    marginTop: 18,
    fontWeight: "500",
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 6,
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
  },

  button: {
    backgroundColor: "#b3002d",
    paddingVertical: 14,
    borderRadius: 36,
    alignItems: "center",
    marginTop: 35,
    marginBottom: 50,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  bottomText: {
    textAlign: "right",   // like your image
    fontSize: 14, fontWeight: "bold",
    color: "#444",
  },

  signupLink: {
    color: "#b3002d",
    fontWeight: "bold", fontWeight: "bold",
    fontSize: 14,
  },
});
