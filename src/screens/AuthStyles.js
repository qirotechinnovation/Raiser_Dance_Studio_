import { StyleSheet } from "react-native";
import Colors from "../theme/Colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },

  circle1: {
    position: "absolute",
    width: 170,
    height: 170,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 100,
    top: 90,
    left: -40,
  },

  circle2: {
    position: "absolute",
    width: 230,
    height: 230,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 130,
    top: 230,
    right: -90,
  },

  header: {
    position: "absolute",
    top: 80,
    left: 30,
  },

  hello: {
    paddingTop: 50,
    color: Colors.TEXT_WHITE,
    fontWeight: "bold",
    fontSize: 26,
    lineHeight: 30,
  },

  signin: {
    paddingTop: 50,
    color: Colors.TEXT_WHITE,
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 40,
  },

  card: {
    backgroundColor: Colors.BG_CARD,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 50,
    marginTop: 20,
    elevation: 10,
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  label: {
    color: Colors.PRIMARY,
    fontSize: 16,
    marginTop: 20,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 18,
    color: Colors.TEXT_DARK,
    fontWeight: "500",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.BORDER,
  },

  eyeIcon: {
    padding: 10,
  },

  forgot: {
    textAlign: "right",
    color: Colors.TEXT_MUTED,
    fontSize: 14,
    marginTop: 10,
    marginBottom: 30,
    fontWeight: "500",
  },

  button: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },

  buttonText: {
    color: Colors.TEXT_WHITE,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },

  bottomText: {
    textAlign: "center",
    fontSize: 15,
    color: Colors.TEXT_SECONDARY,
    marginTop: 25,
  },

  signupLink: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 15,
  },
});
