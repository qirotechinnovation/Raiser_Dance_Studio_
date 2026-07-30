import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import Colors from "../theme/Colors";
import studentService from "../api/studentService";
import adminService from "../api/adminService";
import API from "../api/axios";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  // Navigation scrolling ref
  const scrollViewRef = useRef(null);

  // Layout positions for scrolling
  const [sectionPositions, setSectionPositions] = useState({
    home: 0,
    about: 0,
    batches: 0,
    workshops: 0,
    gallery: 0,
    fees: 0,
    sangeet: 0,
    location: 0
  });

  // DB Data States
  const [batches, setBatches] = useState([]);
  const [aboutUs, setAboutUs] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [feeStructure, setFeeStructure] = useState([]);
  const [sangeetPackages, setSangeetPackages] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  // Modal & Enrollment Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [inquiryType, setInquiryType] = useState("BATCH"); // BATCH, WORKSHOP, SANGEET
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    mobile: "",
    email: "",
    planType: "MONTHLY",
    notes: "",
    eventDate: new Date().toISOString().split("T")[0],
    brideName: "",
    groomName: ""
  });

  const baseURL = API.defaults.baseURL.replace(/\/$/, ""); // strip trailing slash

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchLandingData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLandingData = async () => {
    setLoading(true);
    try {
      const [batchesRes, aboutRes, feeRes, sangeetRes, eventsRes] = await Promise.allSettled([
        studentService.getAvailableBatches(),
        studentService.getAboutUsData(),
        studentService.getFeeStructure(),
        studentService.getSangeetPackages(),
        studentService.getUpcomingEvents()
      ]);

      if (batchesRes.status === "fulfilled") {
        setBatches(batchesRes.value.data || []);
      }
      if (aboutRes.status === "fulfilled" && aboutRes.value.data) {
        setAboutUs(aboutRes.value.data.settings || null);
        setGallery(aboutRes.value.data.gallery || []);
      }
      if (feeRes.status === "fulfilled") {
        setFeeStructure(feeRes.value.data || []);
      }
      if (sangeetRes.status === "fulfilled") {
        setSangeetPackages(sangeetRes.value.data || []);
      }
      if (eventsRes.status === "fulfilled") {
        setUpcomingEvents(eventsRes.value.data || []);
      }
    } catch (error) {
      console.error("Error fetching landing screen data:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildImageUri = (path) => {
    if (!path) return null;
    const cleanPath = path.trim().replace(/\\/g, "/");
    if (cleanPath.startsWith("http")) return cleanPath;
    const withoutLeadingSlash = cleanPath.replace(/^\//, "");
    const normalized = withoutLeadingSlash.startsWith("uploads/")
      ? withoutLeadingSlash
      : `uploads/${withoutLeadingSlash}`;
    return `${baseURL}/${normalized}`;
  };

  const handleScrollTo = (section) => {
    const yPosition = sectionPositions[section] || 0;
    scrollViewRef.current?.scrollTo({ y: yPosition - 60, animated: true });
  };

  const handleEnrollClick = (batch) => {
    setSelectedBatch(batch);
    setSelectedEvent(null);
    setSelectedPackage(null);
    setInquiryType("BATCH");
    setInquiryForm({
      name: "",
      mobile: "",
      email: "",
      planType: "MONTHLY",
      notes: `I would like to enroll in the ${batch.name} batch.`,
      eventDate: new Date().toISOString().split("T")[0],
      brideName: "",
      groomName: ""
    });
    setModalVisible(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedBatch(null);
    setSelectedPackage(null);
    setInquiryType("WORKSHOP");
    setInquiryForm({
      name: "",
      mobile: "",
      email: "",
      planType: "MONTHLY",
      notes: `I want to enquire about the workshop: ${event.title}.`,
      eventDate: new Date().toISOString().split("T")[0],
      brideName: "",
      groomName: ""
    });
    setModalVisible(true);
  };

  const handleSangeetClick = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedBatch(null);
    setSelectedEvent(null);
    setInquiryType("SANGEET");
    setInquiryForm({
      name: "",
      mobile: "",
      email: "",
      planType: "MONTHLY",
      notes: `I want to enquire about the wedding choreography package: ${pkg.name}.`,
      eventDate: new Date().toISOString().split("T")[0],
      brideName: "",
      groomName: ""
    });
    setModalVisible(true);
  };

  const submitGeneralInquiry = async () => {
    if (!inquiryForm.name.trim() || !inquiryForm.mobile.trim()) {
      Alert.alert("Required Fields", "Please enter your Name and Mobile Number.");
      return;
    }

    setSubmitting(true);
    try {
      let danceType = "";
      let preferredTime = "";
      let skillLevel = "Beginner";
      let notes = inquiryForm.notes;

      if (inquiryType === "BATCH" && selectedBatch) {
        danceType = selectedBatch.name;
        preferredTime = `${selectedBatch.startTime} - ${selectedBatch.endTime}`;
        skillLevel = selectedBatch.level || "Beginner";
      } else if (inquiryType === "WORKSHOP" && selectedEvent) {
        danceType = `Workshop: ${selectedEvent.title}`;
        preferredTime = selectedEvent.time || "";
        notes = `Workshop Inquiry for: ${selectedEvent.title}. Date: ${selectedEvent.date}. Message: ${inquiryForm.notes}`;
      } else if (inquiryType === "SANGEET" && selectedPackage) {
        danceType = `Sangeet Package: ${selectedPackage.name}`;
        notes = `Sangeet Choreography Inquiry for package: ${selectedPackage.name}. Event Date: ${inquiryForm.eventDate}. Bride: ${inquiryForm.brideName}, Groom: ${inquiryForm.groomName}. Message: ${inquiryForm.notes}`;
      }

      const payload = {
        name: inquiryForm.name,
        mobile: inquiryForm.mobile,
        email: inquiryForm.email,
        address: "",
        danceType: danceType,
        skillLevel: skillLevel,
        preferredBatchTime: preferredTime,
        inquiryDate: new Date().toISOString().split("T")[0],
        notes: notes,
        status: "OPEN"
      };

      const res = await adminService.createStudioInquiry(payload);
      if (res.data) {
        Alert.alert(
          "Success",
          "Your inquiry has been submitted successfully! Please log in/sign up to track your request.",
          [
            {
              text: "Go to Login",
              onPress: () => {
                setModalVisible(false);
                navigation.navigate("Login");
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Submission failed:", error);
      Alert.alert(
        "Sign Up Required",
        "To complete your inquiry, please sign up or log in. We have saved your selection preference.",
        [
          {
            text: "Sign Up Now",
            onPress: () => {
              setModalVisible(false);
              navigation.navigate("Signup", {
                inquiryType,
                selectedBatchId: selectedBatch?.id,
                selectedEventId: selectedEvent?.id,
                selectedPackageId: selectedPackage?.id
              });
            }
          },
          {
            text: "Log In",
            onPress: () => {
              setModalVisible(false);
              navigation.navigate("Login");
            }
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getLevelBadgeStyle = (level) => {
    const lvl = (level || "").toLowerCase();
    if (lvl.includes("begin")) return { backgroundColor: "#DCFCE7" };
    if (lvl.includes("intermed")) return { backgroundColor: "#FEF9C3" };
    if (lvl.includes("adv")) return { backgroundColor: "#F3E8FF" };
    return { backgroundColor: "#E2E8F0" };
  };

  const getLevelTextColor = (level) => {
    const lvl = (level || "").toLowerCase();
    if (lvl.includes("begin")) return { color: "#15803D" };
    if (lvl.includes("intermed")) return { color: "#A16207" };
    if (lvl.includes("adv")) return { color: "#6B21A8" };
    return { color: "#475569" };
  };

  const getFeeBadge = (plan) => {
    const p = (plan || "").toLowerCase();
    if (p.includes("year")) return { label: "BEST VALUE", color: "#D97706", bgColor: "#FEF3C7" };
    if (p.includes("quarter")) return { label: "POPULAR", color: "#2563EB", bgColor: "#DBEAFE" };
    return null;
  };

  const getFeeIcon = (plan) => {
    const p = (plan || "").toLowerCase();
    if (p.includes("year")) return { name: "medal-outline", color: "#D97706" };
    if (p.includes("quarter")) return { name: "star-circle-outline", color: "#2563EB" };
    return { name: "ticket-outline", color: Colors.PRIMARY };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Loading Dance Studio...</Text>
      </View>
    );
  }

  // Hero slideshow paths
  const studioImages = aboutUs
    ? [aboutUs.image1Path, aboutUs.image2Path, aboutUs.image3Path].filter(p => p)
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.PRIMARY} />

      {/* Sticky Header / Navigation Bar */}
      <View style={styles.navBar}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.navLogo}
          resizeMode="contain"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navLinks}>
          <TouchableOpacity onPress={() => handleScrollTo("home")} style={styles.navLink}>
            <Text style={styles.navLinkText}>Home</Text>
          </TouchableOpacity>
          {aboutUs && <TouchableOpacity onPress={() => handleScrollTo("about")} style={styles.navLink}>
            <Text style={styles.navLinkText}>About</Text>
          </TouchableOpacity>}
          {batches.length > 0 && <TouchableOpacity onPress={() => handleScrollTo("batches")} style={styles.navLink}>
            <Text style={styles.navLinkText}>Batches</Text>
          </TouchableOpacity>}
          {upcomingEvents.length > 0 && <TouchableOpacity onPress={() => handleScrollTo("workshops")} style={styles.navLink}>
            <Text style={styles.navLinkText}>Workshops</Text>
          </TouchableOpacity>}
          {gallery.length > 0 && <TouchableOpacity onPress={() => handleScrollTo("gallery")} style={styles.navLink}>
            <Text style={styles.navLinkText}>Gallery</Text>
          </TouchableOpacity>}
          {feeStructure.length > 0 && <TouchableOpacity onPress={() => handleScrollTo("fees")} style={styles.navLink}>
            <Text style={styles.navLinkText}>Fees</Text>
          </TouchableOpacity>}
          {sangeetPackages.length > 0 && <TouchableOpacity onPress={() => handleScrollTo("sangeet")} style={styles.navLink}>
            <Text style={styles.navLinkText}>Sangeet</Text>
          </TouchableOpacity>}
          {aboutUs?.address && <TouchableOpacity onPress={() => handleScrollTo("location")} style={styles.navLink}>
            <Text style={styles.navLinkText}>Location</Text>
          </TouchableOpacity>}
        </ScrollView>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section: Home (Hero Banner Slideshow as a Capsule) */}
        <View
          onLayout={(e) => {
            const layout = e.nativeEvent.layout;
            setSectionPositions(prev => ({ ...prev, home: layout.y }));
          }}
          style={styles.heroContainer}
        >
          {studioImages.length > 0 ? (
            <View style={styles.heroSliderContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.heroSlider}
                onScroll={(event) => {
                  const slideSize = event.nativeEvent.layoutMeasurement.width;
                  if (slideSize) {
                    const index = event.nativeEvent.contentOffset.x / slideSize;
                    setActiveSlide(Math.round(index));
                  }
                }}
                scrollEventThrottle={16}
              >
                {studioImages.map((path, idx) => (
                  <View key={idx} style={styles.heroSlide}>
                    <Image source={{ uri: buildImageUri(path) }} style={styles.heroImage} resizeMode="cover" />
                    <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={styles.heroGradient} />
                  </View>
                ))}
              </ScrollView>
              {/* Dot Indicators */}
              <View style={styles.dotContainer}>
                {studioImages.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      activeSlide === idx ? styles.activeDot : styles.inactiveDot
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.heroSliderContainer}>
              <LinearGradient colors={Colors.GRADIENT_MAIN} style={styles.heroPlaceholder}>
                <Icon name="dance-ballroom" size={80} color={Colors.WHITE} style={styles.heroIcon} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={styles.heroGradient} />
              </LinearGradient>
            </View>
          )}

          <Animated.View style={[styles.heroInfo, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.welcomeBadge}>
              <Text style={styles.welcomeBadgeText}>✨ WELCOME TO THE NEXT LEVEL</Text>
            </View>
            <Text style={styles.studioTitle}>{aboutUs?.studioName || "Raisers Dance Studio"}</Text>
            <Text style={styles.studioTagline}>{aboutUs?.tagline || "Where Passion Rises & Talent Transforms"}</Text>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroPrimaryBtn}
                onPress={() => navigation.navigate("Signup")}
              >
                <LinearGradient colors={Colors.GRADIENT_BTN} style={styles.heroPrimaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.heroPrimaryText}>CREATE ACCOUNT</Text>
                  <Icon name="chevron-right" size={20} color={Colors.WHITE} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Section: About Us & Owner Profile */}
        {aboutUs && (
          <View
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              setSectionPositions(prev => ({ ...prev, about: layout.y }));
            }}
            style={styles.section}
          >
            <Text style={styles.sectionSubtitle}>THE VISIONARY</Text>
            <Text style={styles.sectionHeading}>About Our Director</Text>
            <View style={styles.aboutCard}>
              {aboutUs?.image1Path ? (
                <Image source={{ uri: buildImageUri(aboutUs.image1Path) }} style={styles.directorImage} resizeMode="cover" />
              ) : (
                <View style={styles.directorImagePlaceholder}>
                  <Icon name="account-star" size={50} color={Colors.TEXT_MUTED} />
                </View>
              )}
              <View style={styles.aboutContent}>
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerBadgeText}>FOUNDER & DIRECTOR</Text>
                </View>
                <Text style={styles.aboutText}>{aboutUs?.aboutText || "Welcome to Raisers Dance Studio. Experience the art of rhythm, movement, and passion under specialized mentorship."}</Text>
                {aboutUs?.passionText ? (
                  <View style={styles.quoteBox}>
                    <Icon name="format-quote-open" size={22} color={Colors.PRIMARY} style={styles.quoteIcon} />
                    <Text style={styles.passionText}>{aboutUs.passionText}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        )}

        {/* Section: Dance Batches */}
        {batches.length > 0 && (
          <View
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              setSectionPositions(prev => ({ ...prev, batches: layout.y }));
            }}
            style={styles.section}
          >
            <Text style={styles.sectionSubtitle}>OUR CLASSES</Text>
            <Text style={styles.sectionHeading}>Available Dance Batches</Text>
            {batches.map((batch) => (
              <View key={batch.id} style={styles.batchCard}>
                <View style={styles.batchHeader}>
                  <View style={styles.batchIconContainer}>
                    <Icon name="dance-ballroom" size={26} color={Colors.PRIMARY} />
                  </View>
                  <View style={styles.batchTitleContainer}>
                    <Text style={styles.batchName}>{batch.name}</Text>
                    <Text style={styles.batchInstructor}>Instructor: {batch.instructor || "Lead Mentor"}</Text>
                  </View>
                  <View style={[styles.levelBadge, getLevelBadgeStyle(batch.level)]}>
                    <Text style={[styles.levelBadgeText, getLevelTextColor(batch.level)]}>
                      {(batch.level || "Beginner").toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.batchDivider} />

                <View style={styles.batchDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="clock-outline" size={18} color={Colors.PRIMARY} />
                    <Text style={styles.detailValue}>{batch.startTime} - {batch.endTime}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="calendar-multiselect" size={18} color={Colors.PRIMARY} />
                    <Text style={styles.detailValue}>{batch.days || "Mon, Wed, Fri"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="stairs" size={18} color={Colors.PRIMARY} />
                    <Text style={styles.detailValue}>Level: {batch.level || "Beginner"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="account-multiple-outline" size={18} color={Colors.PRIMARY} />
                    <Text style={styles.detailValue}>Capacity: {batch.currentStudents || 0} / {batch.maxCapacity || 20} Enrolled</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.enrollBtn} onPress={() => handleEnrollClick(batch)}>
                  <LinearGradient colors={Colors.GRADIENT_BTN} style={styles.enrollBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Icon name="arrow-right-circle" size={20} color={Colors.WHITE} />
                    <Text style={styles.enrollBtnText}>Enroll In Batch</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Section: Upcoming Workshops & Events */}
        {upcomingEvents.length > 0 && (
          <View
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              setSectionPositions(prev => ({ ...prev, workshops: layout.y }));
            }}
            style={styles.section}
          >
            <Text style={styles.sectionSubtitle}>LEARN FROM THE BEST</Text>
            <Text style={styles.sectionHeading}>Upcoming Workshops & Special Events</Text>
            {upcomingEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventIconContainer}>
                    <Icon name="ticket-star" size={26} color={Colors.PRIMARY} />
                  </View>
                  <View style={styles.eventTitleContainer}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventType}>Style: {event.type || "Special Choreography"}</Text>
                  </View>
                  <View style={styles.eventPriceBadge}>
                    <Text style={styles.eventPriceText}>₹{event.fee || 0}</Text>
                  </View>
                </View>

                <View style={styles.eventDivider} />

                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailItem}>
                    <Icon name="calendar" size={18} color={Colors.PRIMARY} />
                    <Text style={styles.eventDetailValue}>{event.date || "TBD"}</Text>
                  </View>
                  <View style={styles.eventDetailItem}>
                    <Icon name="clock-outline" size={18} color={Colors.PRIMARY} />
                    <Text style={styles.eventDetailValue}>{event.time || "TBD"}</Text>
                  </View>
                  <View style={styles.eventDetailItem}>
                    <Icon name="map-marker" size={18} color={Colors.PRIMARY} />
                    <Text style={styles.eventDetailValue} numberOfLines={1}>{event.venue || "Main Studio"}</Text>
                  </View>
                </View>

                <Text style={styles.eventDesc}>{event.description}</Text>

                <TouchableOpacity style={styles.eventEnquireBtn} onPress={() => handleEventClick(event)}>
                  <LinearGradient colors={Colors.GRADIENT_BTN} style={styles.enrollBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Icon name="message-text-outline" size={18} color={Colors.WHITE} />
                    <Text style={styles.enrollBtnText}>Book / Enquire Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Section: Events Gallery */}
        {gallery.length > 0 && (
          <View
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              setSectionPositions(prev => ({ ...prev, gallery: layout.y }));
            }}
            style={styles.section}
          >
            <Text style={styles.sectionSubtitle}>MOMENTS CAPTURED</Text>
            <Text style={styles.sectionHeading}>Moments & Events Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
              {gallery.map((item, idx) => (
                <View key={item.id || idx} style={styles.galleryCard}>
                  <Image source={{ uri: buildImageUri(item.imagePath) }} style={styles.galleryImage} resizeMode="cover" />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={styles.galleryOverlay}>
                    <Text style={styles.galleryEventName}>{item.eventName}</Text>
                    <Text style={styles.galleryEventDesc} numberOfLines={1}>{item.description}</Text>
                  </LinearGradient>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Section: Fees Structure */}
        {feeStructure.length > 0 && (
          <View
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              setSectionPositions(prev => ({ ...prev, fees: layout.y }));
            }}
            style={styles.section}
          >
            <Text style={styles.sectionSubtitle}>MEMBERSHIP PACKAGES</Text>
            <Text style={styles.sectionHeading}>Fee Structure Guide</Text>
            <View style={styles.feeCard}>
              <Text style={styles.feeSubheading}>Choose your preferred subscription plan:</Text>
              <View style={styles.feeList}>
                {feeStructure.map((fee, idx) => {
                  const badge = getFeeBadge(fee.plan);
                  const iconInfo = getFeeIcon(fee.plan);
                  return (
                    <View key={fee.id || idx} style={styles.feeItem}>
                      <View style={styles.feeMain}>
                        <View style={styles.feeIconContainer}>
                          <Icon name={iconInfo.name} size={22} color={iconInfo.color} />
                        </View>
                        <View style={styles.feeDetails}>
                          <View style={styles.feePlanRow}>
                            <Text style={styles.feePlan}>{fee.plan}</Text>
                            {badge && (
                              <View style={[styles.feePill, { backgroundColor: badge.bgColor }]}>
                                <Text style={[styles.feePillText, { color: badge.color }]}>{badge.label}</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.feeCategory}>{fee.category} Classes</Text>
                        </View>
                      </View>
                      <Text style={styles.feeAmount}>₹{fee.amount}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Section: Sangeet & Wedding Choreography Packages */}
        {sangeetPackages.length > 0 && (
          <View
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              setSectionPositions(prev => ({ ...prev, sangeet: layout.y }));
            }}
            style={styles.section}
          >
            <Text style={styles.sectionSubtitle}>CELEBRATE YOUR BIG DAY</Text>
            <Text style={styles.sectionHeading}>Wedding & Sangeet Choreography</Text>
            {sangeetPackages.map((pkg) => (
              <View key={pkg.id} style={styles.sangeetCard}>
                {pkg.isPopular && (
                  <View style={styles.popularRibbon}>
                    <Text style={styles.popularRibbonText}>MOST POPULAR</Text>
                  </View>
                )}
                <View style={styles.sangeetHeader}>
                  <View style={styles.sangeetIconContainer}>
                    <Icon name="ring" size={26} color="#DB2777" />
                  </View>
                  <View style={styles.sangeetTitleContainer}>
                    <Text style={styles.sangeetName}>{pkg.name}</Text>
                    <Text style={styles.sangeetTheme}>Theme: {pkg.theme || "Traditional & Modern Mix"}</Text>
                  </View>
                </View>

                <View style={styles.sangeetDivider} />

                <View style={styles.sangeetDetails}>
                  <View style={styles.sangeetDetailItem}>
                    <Icon name="dance-ballroom" size={18} color="#DB2777" />
                    <Text style={styles.sangeetDetailValue}>{pkg.numberOfDances} Dances Choreographed</Text>
                  </View>
                  <View style={styles.sangeetDetailItem}>
                    <Icon name="calendar-clock" size={18} color="#DB2777" />
                    <Text style={styles.sangeetDetailValue}>Duration: {pkg.duration || "1 Month"}</Text>
                  </View>
                  <View style={{ width: "100%", marginTop: 8 }}>
                    <Text style={styles.sangeetPrice}>₹{pkg.price} <Text style={{ fontSize: 13, color: Colors.TEXT_SECONDARY, fontWeight: "normal" }}>({pkg.billingCycle || "Package Deal"})</Text></Text>
                  </View>
                </View>

                <Text style={styles.sangeetDetailsText}>{pkg.details}</Text>

                {pkg.choreographerList ? (
                  <View style={styles.choreographerContainer}>
                    <Text style={styles.choreographerTitle}>Specialist Mentors:</Text>
                    <Text style={styles.choreographerList}>{pkg.choreographerList}</Text>
                  </View>
                ) : null}

                <TouchableOpacity style={styles.sangeetEnquireBtn} onPress={() => handleSangeetClick(pkg)}>
                  <LinearGradient colors={["#EC4899", "#DB2777"]} style={styles.enrollBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Icon name="calendar-heart" size={18} color={Colors.WHITE} />
                    <Text style={styles.enrollBtnText}>Book / Enquire Package</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Section: Studio Location & Directions */}
        {aboutUs?.address && (
          <View
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              setSectionPositions(prev => ({ ...prev, location: layout.y }));
            }}
            style={styles.section}
          >
            <Text style={styles.sectionSubtitle}>FIND US</Text>
            <Text style={styles.sectionHeading}>Studio Location & Directions</Text>

            <View style={styles.locationCard}>
              <View style={styles.locationInfoRow}>
                <View style={styles.locationIconBox}>
                  <Icon name="map-marker-radius" size={28} color={Colors.PRIMARY} />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationTitle}>{aboutUs?.studioName || "Raiser's Dance Studio"}</Text>
                  <Text style={styles.locationAddress}>
                    {aboutUs?.address}
                  </Text>
                </View>
              </View>

              <View style={styles.locationDetailsGrid}>
                <View style={styles.locDetailItem}>
                  <Icon name="clock-outline" size={18} color={Colors.PRIMARY} />
                  <Text style={styles.locDetailText}>Mon - Sat: 7:00 AM - 9:00 PM</Text>
                </View>
                <View style={styles.locDetailItem}>
                  <Icon name="calendar-check" size={18} color={Colors.PRIMARY} />
                  <Text style={styles.locDetailText}>Sun: Special Workshops Only</Text>
                </View>
              </View>

              {/* Styled Map Mockup */}
              <View style={styles.mapMockupContainer}>
                <LinearGradient colors={["#E2E8F0", "#CBD5E1"]} style={styles.mapMockupGradient}>
                  {/* Styled Grid Lines for Roads */}
                  <View style={styles.roadHorizontal} />
                  <View style={[styles.roadHorizontal, { top: "60%" }]} />
                  <View style={styles.roadVertical} />
                  <View style={[styles.roadVertical, { left: "70%" }]} />

                  {/* Location Marker */}
                  <View style={styles.mapMarkerContainer}>
                    <Icon name="map-marker" size={32} color={Colors.PRIMARY} />
                    <View style={styles.markerRadarRing} />
                  </View>

                  <Text style={styles.mapLabel}>MG Road</Text>
                  <Text style={[styles.mapLabel, { top: "70%", left: "10%" }]}>Royal Plaza</Text>
                </LinearGradient>
              </View>

              <TouchableOpacity
                style={styles.directionsBtn}
                onPress={() => {
                  Alert.alert("Directions", "Opening Google Maps for Raiser's Dance Studio directions...", [
                    { text: "OK" }
                  ]);
                }}
              >
                <Icon name="navigation-variant" size={20} color={Colors.WHITE} />
                <Text style={styles.directionsBtnText}>Get Directions on Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer Contact Details */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerTitle}>Contact Us</Text>
          {aboutUs?.email ? (
            <View style={styles.footerItem}>
              <Icon name="email-outline" size={16} color={Colors.TEXT_LIGHT} />
              <Text style={styles.footerText}>{aboutUs.email}</Text>
            </View>
          ) : null}
          {aboutUs?.phone ? (
            <View style={styles.footerItem}>
              <Icon name="phone-outline" size={16} color={Colors.TEXT_LIGHT} />
              <Text style={styles.footerText}>{aboutUs.phone}</Text>
            </View>
          ) : null}
          {aboutUs?.address ? (
            <View style={styles.footerItem}>

              <Text style={styles.footerText}>{aboutUs.address}</Text>
            </View>
          ) : null}
          <Text style={styles.copyright}>© 2026 {aboutUs?.studioName || "Raisers Dance Studio"}. All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* Guest Batch Enrollment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {inquiryType === "BATCH" && "Batch Enrollment Inquiry"}
                {inquiryType === "WORKSHOP" && "Workshop Registration"}
                {inquiryType === "SANGEET" && "Sangeet Package Booking"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={Colors.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalSubtitle}>
                {inquiryType === "BATCH" && `Requested Batch: ${selectedBatch?.name}`}
                {inquiryType === "WORKSHOP" && `Workshop: ${selectedEvent?.title}`}
                {inquiryType === "SANGEET" && `Package: ${selectedPackage?.name}`}
              </Text>

              <Text style={styles.fieldLabel}>Your Full Name *</Text>
              <View style={styles.inputBox}>
                <Icon name="account-outline" size={20} color={Colors.TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={Colors.TEXT_MUTED}
                  value={inquiryForm.name}
                  onChangeText={(v) => setInquiryForm({ ...inquiryForm, name: v })}
                />
              </View>

              <Text style={styles.fieldLabel}>Mobile Number *</Text>
              <View style={styles.inputBox}>
                <Icon name="phone-outline" size={20} color={Colors.TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor={Colors.TEXT_MUTED}
                  keyboardType="phone-pad"
                  value={inquiryForm.mobile}
                  onChangeText={(v) => setInquiryForm({ ...inquiryForm, mobile: v })}
                />
              </View>

              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputBox}>
                <Icon name="email-outline" size={20} color={Colors.TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. john@example.com"
                  placeholderTextColor={Colors.TEXT_MUTED}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={inquiryForm.email}
                  onChangeText={(v) => setInquiryForm({ ...inquiryForm, email: v })}
                />
              </View>

              {inquiryType === "BATCH" && (
                <>
                  <Text style={styles.fieldLabel}>Preferred Subscription Plan</Text>
                  <View style={styles.pickerBox}>
                    <Picker
                      selectedValue={inquiryForm.planType}
                      onValueChange={(v) => setInquiryForm({ ...inquiryForm, planType: v })}
                      dropdownIconColor={Colors.TEXT_SECONDARY}
                    >
                      <Picker.Item label="Monthly Plan" value="MONTHLY" />
                      <Picker.Item label="Quarterly Plan" value="QUARTERLY" />
                      <Picker.Item label="Yearly Plan" value="YEARLY" />
                    </Picker>
                  </View>
                </>
              )}

              {inquiryType === "SANGEET" && (
                <>
                  <Text style={styles.fieldLabel}>Event Date *</Text>
                  <View style={styles.inputBox}>
                    <Icon name="calendar-outline" size={20} color={Colors.TEXT_SECONDARY} style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={Colors.TEXT_MUTED}
                      value={inquiryForm.eventDate}
                      onChangeText={(v) => setInquiryForm({ ...inquiryForm, eventDate: v })}
                    />
                  </View>

                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>Bride Name</Text>
                      <View style={styles.inputBox}>
                        <TextInput
                          style={styles.inputField}
                          placeholder="Bride Name"
                          placeholderTextColor={Colors.TEXT_MUTED}
                          value={inquiryForm.brideName}
                          onChangeText={(v) => setInquiryForm({ ...inquiryForm, brideName: v })}
                        />
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>Groom Name</Text>
                      <View style={styles.inputBox}>
                        <TextInput
                          style={styles.inputField}
                          placeholder="Groom Name"
                          placeholderTextColor={Colors.TEXT_MUTED}
                          value={inquiryForm.groomName}
                          onChangeText={(v) => setInquiryForm({ ...inquiryForm, groomName: v })}
                        />
                      </View>
                    </View>
                  </View>
                </>
              )}

              <Text style={styles.fieldLabel}>Special Message / Notes</Text>
              <View style={[styles.inputBox, styles.textAreaBox]}>
                <Icon name="notebook-outline" size={20} color={Colors.TEXT_SECONDARY} style={styles.textAreaIcon} />
                <TextInput
                  style={[styles.inputField, styles.textArea]}
                  placeholder="Add any specific questions or notes..."
                  placeholderTextColor={Colors.TEXT_MUTED}
                  multiline={true}
                  numberOfLines={4}
                  value={inquiryForm.notes}
                  onChangeText={(v) => setInquiryForm({ ...inquiryForm, notes: v })}
                />
              </View>

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={submitGeneralInquiry} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.WHITE} />
                ) : (
                  <>
                    <Icon name="check-circle-outline" size={20} color={Colors.WHITE} />
                    <Text style={styles.modalSubmitText}>Submit Inquiry & Go to Login</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.PRIMARY
  },
  navBar: {
    height: 64,
    backgroundColor: Colors.WHITE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: Colors.PRIMARY_DARK,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 100
  },
  navLogo: {
    width: 38,
    height: 38,
    borderRadius: 8
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10
  },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  navLinkText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "600"
  },
  loginBtn: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  },
  loginBtnText: {
    color: Colors.WHITE,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  scrollContent: {
    backgroundColor: Colors.BG_CONTENT,
    paddingBottom: 40
  },
  heroContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: Colors.BG_CONTENT,
  },
  heroSliderContainer: {
    borderRadius: 32,
    overflow: "hidden",
    height: height * 0.42,
    position: "relative",
    backgroundColor: Colors.PRIMARY_DARK,
    elevation: 10,
    shadowColor: Colors.PRIMARY_DARK,
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    marginTop: 4
  },
  heroSlider: {
    width: "100%",
    height: "100%"
  },
  heroSlide: {
    width: width - 32,
    height: "100%"
  },
  heroImage: {
    width: "100%",
    height: "100%"
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject
  },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  heroIcon: {
    marginBottom: 20
  },
  dotContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    gap: 6,
    zIndex: 20
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: Colors.WHITE,
    width: 18,
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    width: 6,
  },
  heroInfo: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10
  },
  welcomeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)"
  },
  welcomeBadgeText: {
    color: Colors.WHITE,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase"
  },
  studioTitle: {
    color: Colors.WHITE,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 6,
    flexWrap: "wrap",
    lineHeight: 38
  },
  studioTagline: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
    flexWrap: "wrap"
  },
  heroActions: {
    flexDirection: "row",
    width: "100%",
    marginTop: 8
  },
  heroPrimaryBtn: {
    borderRadius: 28,
    overflow: "hidden",
    alignSelf: "flex-start",
    elevation: 6,
    shadowColor: Colors.PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  heroPrimaryGradient: {
    height: 52,
    paddingHorizontal: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },
  heroPrimaryText: {
    color: Colors.WHITE,
    fontWeight: "800",
    letterSpacing: 0.5,
    fontSize: 14
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.PRIMARY_LIGHT,
    letterSpacing: 1.5,
    marginBottom: 4
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.PRIMARY_DARK,
    marginBottom: 20,
    letterSpacing: -0.5
  },
  aboutCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 8,
    shadowColor: Colors.PRIMARY_DARK,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)"
  },
  directorImage: {
    width: "100%",
    height: 260
  },
  directorImagePlaceholder: {
    width: "100%",
    height: 260,
    backgroundColor: Colors.BORDER,
    justifyContent: "center",
    alignItems: "center"
  },
  aboutContent: {
    padding: 24
  },
  ownerBadge: {
    backgroundColor: "#FEF3C7",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14
  },
  ownerBadgeText: {
    color: "#D97706",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1
  },
  aboutText: {
    fontSize: 15,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 23,
    marginBottom: 16
  },
  quoteBox: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.PRIMARY,
    marginTop: 8
  },
  quoteIcon: {
    marginRight: 8,
    marginTop: -2
  },
  passionText: {
    flex: 1,
    fontSize: 14,
    fontStyle: "italic",
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20
  },
  batchCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: Colors.PRIMARY_DARK,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)"
  },
  batchHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  batchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(21, 21, 64, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  batchTitleContainer: {
    flex: 1
  },
  batchName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXT_PRIMARY,
    marginBottom: 2
  },
  batchInstructor: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "center"
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  batchDivider: {
    height: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 18
  },
  batchDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18
  },
  detailItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8
  },
  detailValue: {
    fontSize: 13,
    color: Colors.TEXT_PRIMARY,
    fontWeight: "500",
    flex: 1
  },
  enrollBtn: {
    borderRadius: 14,
    overflow: "hidden",
    elevation: 2,
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  enrollBtnGradient: {
    flexDirection: "row",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },
  enrollBtnText: {
    color: Colors.WHITE,
    fontWeight: "bold",
    fontSize: 14
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.BORDER
  },
  emptyText: {
    color: Colors.TEXT_MUTED,
    fontSize: 14,
    marginTop: 10,
    textAlign: "center"
  },
  galleryScroll: {
    paddingRight: 20
  },
  galleryCard: {
    width: 270,
    height: 170,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: Colors.BORDER,
    position: "relative",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  },
  galleryImage: {
    width: "100%",
    height: "100%"
  },
  galleryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    height: 80,
    justifyContent: "flex-end"
  },
  galleryEventName: {
    color: Colors.WHITE,
    fontWeight: "bold",
    fontSize: 15
  },
  galleryEventDesc: {
    color: Colors.TEXT_LIGHT,
    fontSize: 11,
    marginTop: 2
  },
  feeCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 28,
    padding: 24,
    elevation: 8,
    shadowColor: Colors.PRIMARY_DARK,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)"
  },
  feeSubheading: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 18
  },
  feeList: {
    gap: 14
  },
  feeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Colors.BORDER
  },
  feeMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1
  },
  feeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER
  },
  feeDetails: {
    flexDirection: "column",
    flex: 1
  },
  feePlanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  feePlan: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.TEXT_PRIMARY
  },
  feePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  feePillText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  feeCategory: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.PRIMARY
  },
  footerContainer: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 48,
    alignItems: "center"
  },
  footerTitle: {
    color: Colors.WHITE,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
    paddingHorizontal: 20
  },
  footerText: {
    color: Colors.TEXT_LIGHT,
    fontSize: 13,
    textAlign: "center",
    flexShrink: 1,
    flexWrap: "wrap"
  },
  copyright: {
    color: Colors.TEXT_DIM,
    fontSize: 11,
    marginTop: 30,
    textAlign: "center"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(13, 17, 23, 0.7)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    width: "92%",
    maxHeight: "85%",
    backgroundColor: Colors.WHITE,
    borderRadius: 28,
    padding: 24,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    paddingBottom: 12
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.PRIMARY
  },
  modalScroll: {
    paddingBottom: 12
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.PRIMARY,
    fontWeight: "bold",
    marginBottom: 20,
    backgroundColor: "rgba(21, 21, 64, 0.05)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.TEXT_SECONDARY,
    marginBottom: 6,
    marginLeft: 2
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16
  },
  inputIcon: {
    marginRight: 10
  },
  textAreaIcon: {
    marginRight: 10,
    marginTop: 12
  },
  inputField: {
    flex: 1,
    color: Colors.TEXT_PRIMARY,
    fontSize: 14
  },
  pickerBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    marginBottom: 16
  },
  textAreaBox: {
    height: 110,
    alignItems: "flex-start",
    paddingVertical: 6
  },
  textArea: {
    height: "100%",
    textAlignVertical: "top"
  },
  modalSubmitBtn: {
    backgroundColor: Colors.PRIMARY,
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    elevation: 3,
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 }
  },
  modalSubmitText: {
    color: Colors.WHITE,
    fontWeight: "bold",
    fontSize: 14
  },
  // --- New Modernized Layout Styles ---
  eventCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: Colors.PRIMARY_DARK,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)"
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(21, 21, 64, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  eventTitleContainer: {
    flex: 1
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXT_PRIMARY,
    marginBottom: 2
  },
  eventType: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY
  },
  eventPriceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FEE2E2",
    borderRadius: 12
  },
  eventPriceText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: "bold"
  },
  eventDivider: {
    height: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 16
  },
  eventDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14
  },
  eventDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: "48%",
    marginBottom: 8
  },
  eventDetailValue: {
    fontSize: 12,
    color: Colors.TEXT_PRIMARY,
    fontWeight: "500",
    flex: 1,
    flexWrap: "wrap"
  },
  eventDesc: {
    fontSize: 13.5,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 19,
    marginBottom: 18
  },
  eventEnquireBtn: {
    borderRadius: 14,
    overflow: "hidden"
  },
  sangeetCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: Colors.PRIMARY_DARK,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    position: "relative"
  },
  popularRibbon: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#DB2777",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  popularRibbonText: {
    color: Colors.WHITE,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  sangeetHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  sangeetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(219, 39, 119, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  sangeetTitleContainer: {
    flex: 1,
    paddingRight: 80
  },
  sangeetName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXT_PRIMARY,
    marginBottom: 2
  },
  sangeetTheme: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY
  },
  sangeetDivider: {
    height: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 16
  },
  sangeetDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
    alignItems: "flex-start"
  },
  sangeetDetailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    width: "48%",
    marginBottom: 8
  },
  sangeetDetailValue: {
    fontSize: 12.5,
    color: Colors.TEXT_PRIMARY,
    fontWeight: "500",
    flex: 1,
    flexWrap: "wrap"
  },
  sangeetPrice: {
    fontSize: 20,
    fontWeight: "900",
    color: "#DB2777"
  },
  sangeetDetailsText: {
    fontSize: 13.5,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 19,
    marginBottom: 16
  },
  choreographerContainer: {
    backgroundColor: "#FFF5F7",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#EC4899",
    marginBottom: 18
  },
  choreographerTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#DB2777",
    marginBottom: 2,
    textTransform: "uppercase"
  },
  choreographerList: {
    fontSize: 12.5,
    color: Colors.TEXT_PRIMARY,
    fontWeight: "500"
  },
  sangeetEnquireBtn: {
    borderRadius: 14,
    overflow: "hidden"
  },
  locationCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 24,
    padding: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: Colors.BORDER
  },
  locationInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20
  },
  locationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(159, 18, 57, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14
  },
  locationTextContainer: {
    flex: 1
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4
  },
  locationAddress: {
    fontSize: 13.5,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20
  },
  locationDetailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  locDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1
  },
  locDetailText: {
    fontSize: 12,
    color: Colors.TEXT_PRIMARY,
    fontWeight: "500"
  },
  mapMockupContainer: {
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER
  },
  mapMockupGradient: {
    flex: 1,
    position: "relative"
  },
  roadHorizontal: {
    position: "absolute",
    height: 30,
    width: "100%",
    backgroundColor: "#E2E8F0",
    top: "30%"
  },
  roadVertical: {
    position: "absolute",
    width: 30,
    height: "100%",
    backgroundColor: "#E2E8F0",
    left: "30%"
  },
  mapMarkerContainer: {
    position: "absolute",
    top: "38%",
    left: "32%",
    alignItems: "center",
    justifyContent: "center"
  },
  markerRadarRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(159, 18, 57, 0.2)",
    zIndex: -1
  },
  mapLabel: {
    position: "absolute",
    top: "20%",
    left: "40%",
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748B",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 4,
    borderRadius: 4
  },
  directionsBtn: {
    backgroundColor: Colors.PRIMARY,
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 2
  },
  directionsBtnText: {
    color: Colors.WHITE,
    fontWeight: "bold",
    fontSize: 14
  }
});

