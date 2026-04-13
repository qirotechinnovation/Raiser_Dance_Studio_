import { StyleSheet } from "react-native";
import Colors from "../../theme/Colors";


export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_CONTENT,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: Colors.BORDER,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  tabText: {
    color: Colors.TEXT_SECONDARY,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#C2185B",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  eventImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 3,
  },
  statusBadge: {
    marginTop: 5,
    fontWeight: "bold",
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: "#C2185B",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  uploadButton: {
    backgroundColor: "#059669", // Emerald 600
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 5,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 30,
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "100%",
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  disabledInput: {
    backgroundColor: "#E5E7EB",
    color: "#6B7280",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "bold",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#C2185B",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
