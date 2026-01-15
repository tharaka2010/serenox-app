// app/screen/docterchanal.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList, // Use FlatList for efficient rendering of doctor list
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator, // For loading state
  Alert, // For error messages
  SafeAreaView, // For handling notches/status bars
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons"; // For stars and other icons
import { db, auth } from "../../firebase.tsx"; // Corrected: Added .tsx extension
import { collection, getDocs } from "firebase/firestore"; // Import Firestore functions

// =============================================================================
// CONSTANTS & HELPERS FOR RESPONSIVENESS
// =============================================================================

const getScreenDimensions = () => Dimensions.get("window");
const getDeviceType = (width) => {
  if (width >= 768) return "tablet";
  if (width >= 414) return "large_phone";
  return "phone";
};

const COLORS = {
  PRIMARY: "#2BC4B0", // Teal-like color for buttons/accents
  ACCENT_PURPLE: "#D8BFD8", // Light purple for card background or highlights
  TEXT_DARK: "#333333", // Dark gray for main text
  TEXT_MEDIUM: "#6B7280", // Medium gray for secondary text (specialty, bio)
  TEXT_LIGHT: "#A0AEC0", // Light gray for subtle text (email)
  WHITE: "#FFFFFF",
  STAR_YELLOW: "#FFC107", // Gold for ratings
  BORDER_LIGHT: "#E2E8F0", // Light border for inputs/containers
};

// =============================================================================
// RESPONSIVE STYLES FUNCTION
// =============================================================================

const getResponsiveStyles = (dimensions, deviceType) => {
  const { width, height } = dimensions;
  const isTablet = deviceType === "tablet";
  const isLargePhone = deviceType === "large_phone";

  // Base scaling factor - adjusted for a slightly more compact feel
  const scale = isTablet ? 1.4 : isLargePhone ? 1.1 : 1;

  // Paddings & Margins
  const horizontalPadding = width * 0.05; // 5% of width
  const verticalSpacing = height * 0.02; // 2% of height for gaps

  // Header
  const headerHeight = Platform.OS === "android" ? 60 * scale : 90 * scale;
  const headerTitleSize = Math.max(20, 24 * scale);

  // Doctor Card
  const cardPadding = Math.max(16, 20 * scale);
  const cardMarginBottom = Math.max(18, 25 * scale); // Space between cards
  const imageSize = Math.max(90, 120 * scale); // Larger doctor image

  // Text Sizes
  const nameFontSize = Math.max(20, 24 * scale);
  const specialtyFontSize = Math.max(15, 18 * scale);
  const bioFontSize = Math.max(13, 15 * scale);
  const emailFontSize = Math.max(12, 14 * scale);
  const starSize = Math.max(16, 18 * scale);

  // Button
  const buttonPaddingVertical = Math.max(10, 12 * scale);
  const buttonPaddingHorizontal = Math.max(20, 25 * scale);
  const buttonTextSize = Math.max(15, 17 * scale);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.WHITE,
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.WHITE,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    // Header Styles
    header: {
      backgroundColor: COLORS.PRIMARY, // Use primary color for header
      paddingHorizontal: horizontalPadding,
      height: headerHeight,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center", // Centered title
      paddingTop: Platform.OS === "android" ? 0 : 30, // Adjust for iOS status bar
      borderBottomLeftRadius: 20, // Subtle curve
      borderBottomRightRadius: 20,
      shadowColor: "#000", // Shadow for depth
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
    },
    headerTitle: {
      color: COLORS.WHITE,
      fontSize: headerTitleSize,
      fontWeight: "700", // Bold
    },

    // FlatList Container
    listContentContainer: {
      paddingHorizontal: horizontalPadding,
      paddingTop: verticalSpacing,
      paddingBottom: verticalSpacing * 4, // More padding at bottom for bottom nav area
    },

    // Doctor Card Styles
    doctorCard: {
      backgroundColor: COLORS.WHITE, // White background for cards
      borderRadius: 15, // More rounded corners
      marginBottom: cardMarginBottom,
      padding: cardPadding,
      flexDirection: "column", // Stack image and text vertically
      alignItems: "center", // Center content horizontally
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, // Subtle shadow
      shadowRadius: 6,
      elevation: 6,
      borderWidth: 1,
      borderColor: COLORS.BORDER_LIGHT, // Light border
    },
    doctorImage: {
      width: imageSize,
      height: imageSize,
      borderRadius: imageSize / 2, // Perfect circle
      marginBottom: verticalSpacing, // Space below image
      borderWidth: 3,
      borderColor: COLORS.PRIMARY, // Accent border around image
    },
    doctorName: {
      fontSize: nameFontSize,
      fontWeight: "bold",
      color: COLORS.TEXT_DARK,
      textAlign: "center",
      marginBottom: verticalSpacing * 0.5,
    },
    doctorSpecialty: {
      fontSize: specialtyFontSize,
      color: COLORS.TEXT_MEDIUM,
      textAlign: "center",
      marginBottom: verticalSpacing * 0.5,
    },
    doctorEmail: {
      fontSize: emailFontSize,
      color: COLORS.TEXT_LIGHT,
      textAlign: "center",
      marginBottom: verticalSpacing,
    },
    doctorBio: {
      fontSize: bioFontSize,
      color: COLORS.TEXT_DARK,
      textAlign: "center",
      lineHeight: bioFontSize * 1.5,
      marginBottom: verticalSpacing * 1.5,
    },
    ratingContainer: {
      flexDirection: "row",
      marginBottom: verticalSpacing * 1.5, // Space above button
    },
    starIcon: {
      marginHorizontal: 2, // Small space between stars
    },
    appointmentButton: {
      backgroundColor: COLORS.PRIMARY,
      paddingVertical: buttonPaddingVertical,
      paddingHorizontal: buttonPaddingHorizontal,
      borderRadius: 30, // Pill shape
      alignSelf: "center", // Center button if doctor card is column
      shadowColor: COLORS.PRIMARY, // Shadow for button
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    appointmentButtonText: {
      color: COLORS.WHITE,
      fontWeight: "600",
      fontSize: buttonTextSize,
      textTransform: "uppercase", // Make text uppercase
      letterSpacing: 0.8,
    },
    emptyListText: {
      textAlign: "center",
      fontSize: 16,
      color: COLORS.TEXT_MEDIUM,
      marginTop: 50,
    },
  });
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Docterchanal() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState(getScreenDimensions());
  const [deviceType, setDeviceType] = useState(getDeviceType(dimensions.width));

  // Initialize responsiveStyles early
  const responsiveStyles = getResponsiveStyles(dimensions, deviceType);

  // Effect for screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
      setDeviceType(getDeviceType(window.width));
    });
    return () => subscription?.remove();
  }, []);

  // Effect for fetching doctors from Firebase
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Since the top-level console.log showed 'db' is defined,
        // the error implies a very specific hot-reloading or runtime context issue.
        // The code here is correct for accessing db.collection.
        const doctorsCollection = await getDocs(collection(db, "doctors"));
        const doctorsList = doctorsCollection.docs.map((doc) => ({
          id: doc.id, // Important: Get the Firestore Document ID
          ...doc.data(),
        }));
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        Alert.alert(
          "Error",
          "Failed to load doctor list. Please check your internet connection and Firebase setup.",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []); // Empty dependency array means this runs once on mount

  // --- Loading State ---
  if (loading) {
    return (
      <SafeAreaView style={responsiveStyles.safeArea}>
        <View style={responsiveStyles.header}>
          <Text style={responsiveStyles.headerTitle}>Our Doctors</Text>
        </View>
        <View style={responsiveStyles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={{ marginTop: 10, color: COLORS.TEXT_MEDIUM }}>
            Loading Doctors...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Render Individual Doctor Card Item ---
  const renderDoctorItem = ({ item }) => (
    // In app/screen/docterchanal.js, inside renderDoctorItem
    <TouchableOpacity
      style={responsiveStyles.doctorCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "./docappiment", // Make sure this path is correct
          params: { doctorId: item.id }, // item.id is the Firestore Document ID
        })
      }
    >
      <Image
        source={{ uri: item.image }} // Use the image URL from Firebase
        style={responsiveStyles.doctorImage}
      />
      <Text style={responsiveStyles.doctorName}>{item.name}</Text>
      <Text style={responsiveStyles.doctorSpecialty}>{item.specialty}</Text>
      {item.email && (
        <Text style={responsiveStyles.doctorEmail}>{item.email}</Text>
      )}

      <View style={responsiveStyles.ratingContainer}>
        {/* Render stars based on rating number */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Feather
            key={i}
            name="star"
            size={responsiveStyles.starSize}
            color={
              i < Math.floor(item.rating || 0)
                ? COLORS.STAR_YELLOW
                : COLORS.BORDER_LIGHT
            } // Filled or empty star
            style={responsiveStyles.starIcon}
          />
        ))}
      </View>

      <TouchableOpacity
        style={responsiveStyles.appointmentButton}
        onPress={() =>
          router.push({
            pathname: "./docappiment",
            params: { doctorId: item.id },
          })
        }
      >
        <Text style={responsiveStyles.appointmentButtonText}>
          Make Appointment
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // =============================================================================
  // MAIN COMPONENT RENDER
  // =============================================================================

  return (
    <SafeAreaView style={responsiveStyles.safeArea}>
      <View style={responsiveStyles.container}>
        {/* Header */}
        <View style={responsiveStyles.header}>
          {/* Optional: Back button if this isn't the root of a stack */}
          {/* <TouchableOpacity
            style={{ position: 'absolute', left: responsiveStyles.headerPaddingHorizontal }}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
          </TouchableOpacity> */}
          <Text style={responsiveStyles.headerTitle}>Our Medical Experts</Text>
        </View>

        {/* Doctor List */}
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id} // Unique key is the Firestore document ID
          renderItem={renderDoctorItem}
          contentContainerStyle={responsiveStyles.listContentContainer}
          showsVerticalScrollIndicator={false} // Hide scroll indicator
          ListEmptyComponent={() => (
            <View style={responsiveStyles.loadingContainer}>
              <Text style={responsiveStyles.emptyListText}>
                No doctors found in the database. Please add some.
              </Text>
            </View>
          )}
        />
        {/* BottomNav is assumed to be in the parent layout, so not included here */}
      </View>
    </SafeAreaView>
  );
}
