import { StyleSheet, Platform, StatusBar } from 'react-native';
import Colors from "../../theme/Colors";

const HEADER_BG = Colors.PRIMARY; // Navy Blue
const ACCENT_COLOR = Colors.PRIMARY;
const CONTENT_BG = Colors.BG_CONTENT;

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: HEADER_BG },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#fff" },

  // Enhanced Header with Decorative Elements
  header: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  // Decorative circles for modern look
  decorCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    top: 40,
    right: 80,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  decorCircle3: {
    position: 'absolute',
    bottom: -20,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: Colors.WHITE,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  avatarRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  greetingTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.WHITE,
    letterSpacing: 0.5
  },
  greetingName: {
    fontSize: 22,
    color: Colors.WHITE,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  notifBtn: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },

  contentContainer: {
    flex: 1,
    backgroundColor: CONTENT_BG,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20, // Overlap header slightly
    paddingHorizontal: 20,
    overflow: 'hidden'
  },

  // Stats Grid
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 12 },
  statWidget: {
    width: "48%",
    backgroundColor: Colors.WHITE,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000033",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  widgetIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  widgetValue: { fontSize: 16, fontWeight: "800", color: Colors.PRIMARY_DARK, flex: 1 },
  widgetLabel: { fontSize: 10, color: Colors.TEXT_SECONDARY, fontWeight: "600", marginTop: 2 },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 16, marginTop: 10 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 10 },
  viewAllText: { color: HEADER_BG, fontSize: 12, fontWeight: "700" },

  // Events
  eventCard: { width: 170, backgroundColor: Colors.WHITE, borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, overflow: 'hidden' },
  eventImagePlaceholder: { height: 85, backgroundColor: HEADER_BG, justifyContent: 'center', alignItems: 'center' },
  eventTypeTag: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  eventTypeTagText: { color: Colors.WHITE, fontSize: 9, fontWeight: 'bold' },
  eventCardContent: { padding: 10 },
  eventTitle: { fontSize: 13, fontWeight: "bold", color: Colors.TEXT_PRIMARY, marginBottom: 3 },
  eventDate: { fontSize: 10, color: Colors.TEXT_SECONDARY, marginBottom: 6 },
  inquireBtn: { backgroundColor: Colors.TEXT_PRIMARY, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  inquireText: { color: Colors.WHITE, fontSize: 10, fontWeight: 'bold' },
  emptyEventBox: { padding: 15, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
  emptyEventText: { color: Colors.TEXT_MUTED, fontSize: 12 },

  // Actions (Control Center) - Compacted
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 5 },
  actionItem: {
    width: '31%', // 3 Cols
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: Colors.BG_CONTENT
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05
  },
  actionLabel: { fontSize: 11, fontWeight: '700', color: '#334155', textAlign: 'center', lineHeight: 14 },

  // Schedule Row
  scheduleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.WHITE, padding: 12, borderRadius: 16, marginBottom: 10, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, borderWidth: 1, borderColor: '#F1F5F9' },
  timeBox: { backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 12 },
  timeText: { color: "#2563EB", fontWeight: "bold", fontSize: 12 },
  scheduleInfo: { flex: 1 },
  batchName: { fontSize: 14, fontWeight: "bold", color: Colors.TEXT_PRIMARY },
  instructorName: { fontSize: 12, color: Colors.TEXT_SECONDARY },
  checkinBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  checkinText: { fontSize: 10, fontWeight: "bold" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: Colors.WHITE, borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: HEADER_BG, marginBottom: 5 },
  modalInput: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top', backgroundColor: Colors.BG_CONTENT, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 15 },
  submitBtn: { backgroundColor: HEADER_BG, paddingVertical: 10, paddingHorizontal: 25, borderRadius: 12 },
  cancelText: { color: Colors.TEXT_SECONDARY, fontWeight: 'bold' },
  submitText: { color: Colors.WHITE, fontWeight: 'bold' }
});
