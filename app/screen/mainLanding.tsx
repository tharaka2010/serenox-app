//mainLoading.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import BottomNav from "../../components/BottomNav";
import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { submitFeedback } from "../../utils/feedback";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { BackHandler } from "react-native";

// =============================================================================
// CONSTANTS & HELPERS
// =============================================================================

const getScreenDimensions = () => Dimensions.get("window");

const getDeviceType = (width) => {
  if (width >= 768) return 'tablet';
  if (width >= 414) return 'large_phone';
  return 'phone';
};

const CATEGORIES = [
  {
    id: 'general',
    title: 'General Knowledge',
    image: require("../../assets/mainLanding/Homegeneral.png"),
    route: '/screen/Genaral/genaral_main',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 'female',
    title: 'Female',
    image: require("../../assets/mainLanding/homefemale.png"),
    route: '/screen/Female/female_main',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: 'child',
    title: 'Child',
    image: require("../../assets/mainLanding/homechild.png"),
    route: '/screen/Child/child_main',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: 'male',
    title: 'Male',
    image: require("../../assets/mainLanding/homemale.png"),
    route: '/screen/Male/male_main',
    gradient: ['#43e97b', '#38f9d7'],
  },
];

const COLORS = {
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  PINK_OVERLAY: "rgba(255, 192, 203, 0.2)",
  GRAY_TEXT: "#2D3748",
  LIGHT_GRAY: "#F7FAFC",
  BORDER_GRAY: "#E2E8F0",
  TEAL_BUTTON: "#2BC4B0",
  PURPLE_ACCENT: "#E6FFFA",
  DARK_GRAY_SECONDARY: "#4A5568",
  SHADOW: "rgba(0, 0, 0, 0.1)",
  CARD_SHADOW: "rgba(0, 0, 0, 0.05)",
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Mainpage() {
  const router = useRouter();
  const [suggestion, setSuggestion] = useState("");
  const [dimensions, setDimensions] = useState(getScreenDimensions());
  const [deviceType, setDeviceType] = useState(getDeviceType(dimensions.width));
  const [timeOfDayGreeting, setTimeOfDayGreeting] = useState("Welcome");
  const [userName, setUserName] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useEffect(() => {
    const fetchUserDataAndSetGreeting = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          const name = userDoc.exists() ? userDoc.data().name.split(' ')[0] : "User";
          setUserName(name);
          
          const currentHour = new Date().getHours();
          let greeting = "Welcome";
          if (currentHour < 12) {
            greeting = "Good Morning";
          } else if (currentHour < 18) {
            greeting = "Good Afternoon";
          } else {
            greeting = "Good Evening";
          }
          setTimeOfDayGreeting(greeting);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUserName("User");
        setTimeOfDayGreeting("Welcome");
      }
    };

    fetchUserDataAndSetGreeting();

    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
      setDeviceType(getDeviceType(window.width));
    });
    return () => subscription?.remove();
  }, []);

  const responsiveStyles = getResponsiveStyles(dimensions, deviceType);

  const handleCategoryPress = (route) => {
    if (route) {
      router.push(route);
    } else {
      console.warn("Navigation route not defined for this category.");
    }
  };

  const handleSendSuggestion = async () => {
    if (!suggestion.trim()) {
      Alert.alert("Empty Feedback", "Please type a message before sending.");
      return;
    }
    try {
      await submitFeedback(suggestion);
      Alert.alert("Success", "Your feedback has been sent successfully!");
      setSuggestion("");
    } catch (error) {
      Alert.alert("Error", "Could not send feedback. Please try again later.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={responsiveStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={responsiveStyles.container}>
        {/* Decorative Background Shapes */}
        <View style={responsiveStyles.decorativeShapes}>
          <View style={[responsiveStyles.roundShape, responsiveStyles.shape1]} />
          <View style={[responsiveStyles.roundShape, responsiveStyles.shape2]} />
          <View style={[responsiveStyles.roundShape, responsiveStyles.shape3]} />
          <View style={[responsiveStyles.roundShape, responsiveStyles.shape4]} />
          <View style={[responsiveStyles.roundShape, responsiveStyles.shape5]} />
          <View style={[responsiveStyles.roundShape, responsiveStyles.shape6]} />
        </View>

        <ScrollView
          style={responsiveStyles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={responsiveStyles.scrollContent}
        >
          {/* Hero Section */}
          <HeroSection 
            responsiveStyles={responsiveStyles} 
            timeOfDayGreeting={timeOfDayGreeting} 
            userName={userName} 
          />

          {/* Categories Section */}
          <CategoriesSection
            responsiveStyles={responsiveStyles}
            onCategoryPress={handleCategoryPress}
          />

          {/* Doctor Advice Section */}
          <DoctorAdviceSection
            responsiveStyles={responsiveStyles}
            onPress={() => router.push('./docterchanal')}
          />

          {/* Feedback Section */}
          <FeedbackSection
            responsiveStyles={responsiveStyles}
            suggestion={suggestion}
            setSuggestion={setSuggestion}
            onSend={handleSendSuggestion}
          />
          
          <View style={responsiveStyles.bottomBuffer} />
        </ScrollView>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

// =============================================================================
// COMPONENTS
// =============================================================================

const HeroSection = ({ responsiveStyles, timeOfDayGreeting, userName }) => (
  <View style={responsiveStyles.heroSection}>
    {/* Decorative Background Elements */}
    <View style={responsiveStyles.decorativeCircle1} />
    <View style={responsiveStyles.decorativeCircle2} />
    <View style={responsiveStyles.decorativeCircle3} />
    <View style={responsiveStyles.decorativeShape1} />
    <View style={responsiveStyles.decorativeShape2} />
    
    <View style={responsiveStyles.heroContent}>
      <Text style={responsiveStyles.welcomeText}>
        {timeOfDayGreeting}, <Text style={responsiveStyles.welcomeUserName}>{userName}</Text>
      </Text>
      <View style={responsiveStyles.priorityContainer}>
        <Text style={responsiveStyles.priorityText}>Your Health,</Text>
        <Text style={responsiveStyles.priorityTextAccent}>Our Priority</Text>
        <View style={responsiveStyles.priorityUnderline} />
      </View>
    </View>
  </View>
);

const CategoriesSection = ({ responsiveStyles, onCategoryPress }) => (
  <View style={responsiveStyles.categoriesSection}>
    <Text style={responsiveStyles.sectionTitle}>Categories</Text>
    <View style={responsiveStyles.categoriesGrid}>
      {CATEGORIES.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          responsiveStyles={responsiveStyles}
          onPress={() => onCategoryPress(category.route)}
        />
      ))}
    </View>
  </View>
);

const CategoryCard = ({ category, responsiveStyles, onPress }) => (
  <TouchableOpacity
    style={responsiveStyles.categoryCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={responsiveStyles.categoryImageContainer}>
      <Image
        source={category.image}
        style={responsiveStyles.categoryImage}
        resizeMode="cover"
      />
      <View style={responsiveStyles.categoryGradient} />
    </View>
    <Text style={responsiveStyles.categoryTitle}>{category.title}</Text>
  </TouchableOpacity>
);

const DoctorAdviceSection = ({ responsiveStyles, onPress }) => (
  <View style={responsiveStyles.doctorSection}>
    <Text style={responsiveStyles.sectionTitle}>Expert Consultation</Text>
    <TouchableOpacity
      style={responsiveStyles.doctorCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={responsiveStyles.doctorImageContainer}>
        <Image
          source={require("../../assets/mainLanding/doctorchanel.png")}
          style={responsiveStyles.doctorImage}
          resizeMode="contain"
        />
      </View>
      <View style={responsiveStyles.doctorContent}>
        <Text style={responsiveStyles.doctorTitle}>Connect with Doctors</Text>
        <Text style={responsiveStyles.doctorDescription}>
          Get professional medical advice and treatment recommendations
        </Text>
        <View style={responsiveStyles.doctorButton}>
          <Text style={responsiveStyles.doctorButtonText}>Consult Now</Text>
          <Feather name="video" size={16} color={COLORS.WHITE} />
        </View>
      </View>
    </TouchableOpacity>
  </View>
);

const FeedbackSection = ({ responsiveStyles, suggestion, setSuggestion, onSend }) => (
  <View style={responsiveStyles.feedbackSection}>
    <Text style={responsiveStyles.sectionTitle}>Share Your Thoughts</Text>
    <Text style={responsiveStyles.feedbackSubtitle}>
      We value your feedback and will respond to your concerns
    </Text>
    <View style={responsiveStyles.inputContainer}>
      <TextInput
        placeholder="Tell us about your experience..."
        value={suggestion}
        onChangeText={setSuggestion}
        multiline
        numberOfLines={4}
        style={responsiveStyles.textInput}
        textAlignVertical="top"
        placeholderTextColor={COLORS.DARK_GRAY_SECONDARY}
      />
    </View>
    <TouchableOpacity
      style={responsiveStyles.sendButton}
      onPress={onSend}
      activeOpacity={0.8}
    >
      <Text style={responsiveStyles.sendButtonText}>Send Feedback</Text>
      <Feather name="send" size={18} color={COLORS.WHITE} />
    </TouchableOpacity>
  </View>
);

// =============================================================================
// RESPONSIVE STYLES
// =============================================================================

const getResponsiveStyles = (dimensions, deviceType) => {
  const { width, height } = dimensions;
  const isTablet = deviceType === 'tablet';
  const scaleFactor = isTablet ? 1.2 : 1;
  const padding = width * 0.05;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.WHITE,
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.LIGHT_GRAY,
    },
    scrollView: {
      flex: 1,
      zIndex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    bottomBuffer: {
      height: 20,
    },

    // Decorative Background Shapes
    decorativeShapes: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
    },
    roundShape: {
      position: 'absolute',
      borderRadius: 1000,
      opacity: 0.08,
    },
    shape1: {
      width: 90,
      height: 90,
      backgroundColor: COLORS.TEAL_BUTTON,
      top: '8%',
      right: '8%',
    },
    shape2: {
      width: 70,
      height: 70,
      backgroundColor: '#f093fb',
      top: '25%',
      left: '5%',
    },
    shape3: {
      width: 50,
      height: 50,
      backgroundColor: '#4facfe',
      top: '45%',
      right: '10%',
    },
    shape4: {
      width: 35,
      height: 35,
      backgroundColor: '#43e97b',
      top: '65%',
      left: '12%',
    },
    shape5: {
      width: 25,
      height: 25,
      backgroundColor: '#667eea',
      top: '38%',
      right: '15%',
    },
    shape6: {
      width: 40,
      height: 40,
      backgroundColor: '#f5576c',
      top: '80%',
      left: '8%',
    },

    // Hero Section
    heroSection: {
      height: height * 0.3,
      backgroundColor: COLORS.WHITE,
      position: 'relative',
      marginBottom: 20,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Decorative Elements
    decorativeCircle1: {
      position: 'absolute',
      top: -50,
      right: -50,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: COLORS.TEAL_BUTTON,
      opacity: 0.1,
    },
    decorativeCircle2: {
      position: 'absolute',
      top: 60,
      left: -30,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.TEAL_BUTTON,
      opacity: 0.15,
    },
    decorativeCircle3: {
      position: 'absolute',
      bottom: -40,
      right: 30,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: COLORS.TEAL_BUTTON,
      opacity: 0.08,
    },
    decorativeShape1: {
      position: 'absolute',
      top: 30,
      right: 40,
      width: 60,
      height: 60,
      borderRadius: 15,
      backgroundColor: COLORS.TEAL_BUTTON,
      opacity: 0.12,
      transform: [{ rotate: '45deg' }],
    },
    decorativeShape2: {
      position: 'absolute',
      bottom: 40,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.TEAL_BUTTON,
      opacity: 0.1,
    },
    heroContent: {
      alignItems: 'center',
      zIndex: 1,
    },
    welcomeText: {
      fontSize: 28 * scaleFactor,
      fontWeight: '300',
      color: COLORS.GRAY_TEXT,
      marginBottom: 20,
      letterSpacing: 1,
    },
    welcomeUserName: {
      fontWeight: '600',
    },
    priorityContainer: {
      alignItems: 'center',
    },
    priorityText: {
      fontSize: 24 * scaleFactor,
      fontWeight: '600',
      color: COLORS.GRAY_TEXT,
      marginBottom: 5,
    },
    priorityTextAccent: {
      fontSize: 24 * scaleFactor,
      fontWeight: '700',
      color: COLORS.TEAL_BUTTON,
      marginBottom: 15,
    },
    priorityUnderline: {
      width: 80,
      height: 3,
      backgroundColor: COLORS.TEAL_BUTTON,
      borderRadius: 2,
      opacity: 0.8,
    },

    // Categories Section
    categoriesSection: {
      paddingHorizontal: padding,
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 22 * scaleFactor,
      fontWeight: '600',
      color: COLORS.GRAY_TEXT,
      marginBottom: 15,
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 15,
    },
    categoryCard: {
      width: '48%',
      backgroundColor: COLORS.WHITE,
      borderRadius: 20,
      marginBottom: 20,
      shadowColor: COLORS.SHADOW,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      overflow: 'hidden',
    },
    categoryImageContainer: {
      height: 120,
      position: 'relative',
    },
    categoryImage: {
      width: '100%',
      height: '100%',
    },
    categoryGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: COLORS.PINK_OVERLAY,
    },
    categoryTitle: {
      fontSize: 16 * scaleFactor,
      fontWeight: '600',
      color: COLORS.GRAY_TEXT,
      textAlign: 'center',
      paddingVertical: 15,
      paddingHorizontal: 10,
    },

    // Doctor Section
    doctorSection: {
      paddingHorizontal: padding,
      marginBottom: 30,
    },
    doctorCard: {
      backgroundColor: COLORS.WHITE,
      borderRadius: 20,
      shadowColor: COLORS.SHADOW,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      marginTop:10,
      padding:10
    },
    doctorImageContainer: {
      alignItems: 'center',
    },
    doctorImage: {
      width: '100%',       // Make image responsive
      height: undefined,   // Let it scale naturally
      aspectRatio: 1.8,    // Adjust this to your image's real width:height ratio
      resizeMode: 'contain', // Ensure the image doesn't stretch
    },
    doctorContent: {
      alignItems: 'center',
    },
    doctorTitle: {
      fontSize: 20 * scaleFactor,
      fontWeight: '600',
      color: COLORS.GRAY_TEXT,
      marginBottom: 8,
    },
    doctorDescription: {
      fontSize: 16 * scaleFactor,
      color: COLORS.DARK_GRAY_SECONDARY,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 15,
    },
    doctorButton: {
      backgroundColor: COLORS.TEAL_BUTTON,
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: COLORS.TEAL_BUTTON,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    doctorButtonText: {
      color: COLORS.WHITE,
      fontSize: 16 * scaleFactor,
      fontWeight: '600',
      marginRight: 10,
    },

    // Feedback Section
    feedbackSection: {
      paddingHorizontal: padding,
      marginBottom: 30,
    },
    feedbackSubtitle: {
      fontSize: 16 * scaleFactor,
      color: COLORS.DARK_GRAY_SECONDARY,
      marginBottom: 20,
      marginTop: 5,
    },
    inputContainer: {
      backgroundColor: COLORS.WHITE,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: COLORS.BORDER_GRAY,
      shadowColor: COLORS.SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginBottom: 20,
    },
    textInput: {
      padding: 20,
      fontSize: 16 * scaleFactor,
      color: COLORS.GRAY_TEXT,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    sendButton: {
      backgroundColor: COLORS.TEAL_BUTTON,
      borderRadius: 15,
      paddingVertical: 18,
      paddingHorizontal: 30,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: COLORS.TEAL_BUTTON,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    sendButtonText: {
      color: COLORS.WHITE,
      fontSize: 18 * scaleFactor,
      fontWeight: '600',
      marginRight: 10,
    },
  });
};