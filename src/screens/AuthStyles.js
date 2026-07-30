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
    paddingHorizontal: 30,
    marginTop: 80,
    marginBottom: 20,
  },

  hello: {
    color: Colors.TEXT_WHITE,
    fontWeight: "bold",
    fontSize: 26,
    lineHeight: 30,
  },

  signin: {
    color: Colors.TEXT_WHITE,
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 40,
    marginTop: 5,
  },

  card: {
    backgroundColor: Colors.BG_CARD,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    ...Colors.SHADOW_MEDIUM,
  },

  label: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 13,
    marginTop: 16,
    marginBottom: 6,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: Colors.RADIUS_INPUT || 12,
    paddingHorizontal: 15,
    height: 55,
    color: Colors.TEXT_DARK,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    justifyContent: 'center',
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: Colors.RADIUS_INPUT || 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    height: 55,
    overflow: "hidden",
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
    ...Colors.SHADOW_LIGHT,
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
