import { StatusBar } from "expo-status-bar";
import React, { memo, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useRouter } from "expo-router";

// --- Firebase Imports ---
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// =============================================================================
// CONSTANTS & HELPERS
// =============================================================================

const getScreenDimensions = () => {
  try {
    const { width, height } = Dimensions.get("window");
    return { width, height };
  } catch (error) {
    console.warn("Failed to get screen dimensions:", error);
    return { width: 375, height: 812 };
  }
};

const getDeviceType = (width, height) => {
  const aspectRatio = height / width;
  const minDimension = Math.min(width, height);

  if (minDimension >= 768) {
    return "tablet";
  } else if (aspectRatio > 2.1) {
    return "phone_long";
  } else {
    return "phone";
  }
};

const getOrientation = (width, height) => {
  return width > height ? "landscape" : "portrait";
};

// Image assets configuration
const IMAGES = [
  require("../assets/1.png"),
  require("../assets/2.png"),
  require("../assets/3.png"),
  require("../assets/13.png"),
  require("../assets/12.png"),
  require("../assets/11.png"),
  require("../assets/14.png"),
];

// Logo image
const SERENOX_LOGO = require("../assets/SplashLogo.png");

// Configuration
const CONFIG = {
  AUTOPLAY_TIMEOUT: 1.5,
  PRIMARY_COLOR: "#5a67d8",
  SECONDARY_COLOR: "#ffffff",
  TEXT_COLOR: "#1a1a1a",
  SUBTITLE_COLOR: "#6c757d",
  BACKGROUND_COLOR: "#f8f9fa",
  ACCENT_COLOR: "#ffd700",
  DANGER_COLOR: "#ff6b6b",
  SUCCESS_COLOR: "#4ecdc4",
  INFO_COLOR: "#45b7d1",
  WARNING_COLOR: "#f39c12",
  ROUTES: {
    SIGNIN: "/loginAuth/signinscreen",
    HOME: "/screen/mainLanding",
  },
};

// =============================================================================
// DECORATIVE COMPONENTS
// =============================================================================

const DecorativeShapes = memo(() => (
  <View style={styles.decorativeShapes}>
    <View style={[styles.roundShape, styles.shape1]} />
    <View style={[styles.roundShape, styles.shape2]} />
    <View style={[styles.roundShape, styles.shape3]} />
    <View style={[styles.roundShape, styles.shape4]} />
    <View style={[styles.roundShape, styles.shape5]} />
    <View style={[styles.roundShape, styles.shape6]} />
  </View>
));

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LandingScreen() {
  const router = useRouter();
  
  // --- Auth State ---
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

// --- Check Login Status (FIXED) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is logged in, navigate to Home.
        router.replace(CONFIG.ROUTES.HOME)
      }
      // In either case, stop initializing so the correct screen can be shown.
      setInitializing(false);
    });

    // Unsubscribe from the listener when the component unmounts.
    return unsubscribe;
  }, []);

  const [dimensions, setDimensions] = useState(() => {
    const screenDimensions = getScreenDimensions();
    return screenDimensions || { width: 375, height: 812 };
  });
  const [deviceType, setDeviceType] = useState(() => {
    const screenDimensions = getScreenDimensions();
    if (screenDimensions) {
      return getDeviceType(screenDimensions.width, screenDimensions.height);
    }
    return "phone";
  });
  const [orientation, setOrientation] = useState(() => {
    const screenDimensions = getScreenDimensions();
    if (screenDimensions) {
      return getOrientation(screenDimensions.width, screenDimensions.height);
    }
    return "portrait";
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      if (window && window.width && window.height) {
        setDimensions(window);
        setDeviceType(getDeviceType(window.width, window.height));
        setOrientation(getOrientation(window.width, window.height));
      }
    });

    return () => subscription?.remove();
  }, []);

  const handleGetStarted = () => {
    try {
      router.push(CONFIG.ROUTES.SIGNIN);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // --- Loading Screen ---
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: CONFIG.BACKGROUND_COLOR }}>
        <ActivityIndicator size="large" color={CONFIG.PRIMARY_COLOR} />
        <Text style={{ marginTop: 20, color: CONFIG.TEXT_COLOR }}>Checking Login Status...</Text>
      </View>
    );
  }

  const { width, height } = dimensions || { width: 375, height: 812 };
  const isTablet = deviceType === "tablet";
  const isLandscape = orientation === "landscape";

  const scaleFactor = isTablet ? 1.3 : width < 320 ? 0.9 : 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Decorative Background Elements */}
        <DecorativeShapes />

        {isLandscape ? (
          <LandscapeLayout
            dimensions={dimensions}
            deviceType={deviceType}
            onGetStarted={handleGetStarted}
            scaleFactor={scaleFactor}
          />
        ) : (
          <PortraitLayout
            dimensions={dimensions}
            deviceType={deviceType}
            onGetStarted={handleGetStarted}
            scaleFactor={scaleFactor}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

const PortraitLayout = memo(
  ({ dimensions, deviceType, onGetStarted, scaleFactor }) => {
    const { width, height } = dimensions;

    return (
      <View style={styles.portraitContainer}>
        <View style={styles.headerSection}>
          <SerenoxLogo scaleFactor={scaleFactor} />
        </View>

        <View style={styles.carouselSection}>
          <ImageCarousel
            dimensions={dimensions}
            deviceType={deviceType}
            scaleFactor={scaleFactor}
          />
        </View>

        <View style={styles.actionSection}>
          <GetStartedButton
            onPress={onGetStarted}
            dimensions={dimensions}
            scaleFactor={scaleFactor}
          />
        </View>
      </View>
    );
  }
);

const LandscapeLayout = memo(
  ({ dimensions, deviceType, onGetStarted, scaleFactor }) => {
    const { width, height } = dimensions;

    return (
      <View style={styles.landscapeContainer}>
        <View style={styles.landscapeLeft}>
          <SerenoxLogo scaleFactor={scaleFactor} />
          <GetStartedButton
            onPress={onGetStarted}
            dimensions={dimensions}
            scaleFactor={scaleFactor}
          />
        </View>
        <View style={styles.landscapeRight}>
          <ImageCarousel
            dimensions={dimensions}
            deviceType={deviceType}
            scaleFactor={scaleFactor}
          />
        </View>
      </View>
    );
  }
);

// =============================================================================
// CHILD COMPONENTS
// =============================================================================

const SerenoxLogo = memo(({ scaleFactor }) => (
  <View style={styles.logoContainer}>
    <Image
      source={SERENOX_LOGO}
      style={[
        styles.logo,
        {
          width: 600 * scaleFactor,
          height: 400 * scaleFactor,
        }
      ]}
      resizeMode="contain"
    />
  </View>
));

const ImageCarousel = memo(({ dimensions, deviceType, scaleFactor }) => {
  const { width, height } = dimensions;

  const renderItem = ({ item, index }) => {
    return (
      <ImageSlide
        key={`slide-${index}`}
        image={item}
        index={index}
        dimensions={dimensions}
        deviceType={deviceType}
        scaleFactor={scaleFactor}
      />
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <Carousel
        loop
        width={width}
        height={width / 2}
        autoPlay={true}
        data={IMAGES}
        scrollAnimationDuration={1000}
        renderItem={renderItem}
        mode="parallax"
      />
    </View>
  );
});

const ImageSlide = memo(({ image, index, dimensions, deviceType, scaleFactor }) => {
  const { width, height } = dimensions;
  return (
    <View style={styles.slideContainer}>
      <Image
        source={image}
        style={[
          styles.slideImage,
          {
            width: Math.min(width * 0.7, 300),
            height: Math.min(height * 0.3, 250),
          }
        ]}
        resizeMode="cover"
      />
    </View>
  );
});

const GetStartedButton = memo(({ onPress, dimensions, scaleFactor }) => {
  const { width } = dimensions;
  return (
    <TouchableOpacity
      style={[
        styles.getStartedButton,
        {
          paddingVertical: 16 * scaleFactor,
          paddingHorizontal: 32 * scaleFactor,
          borderRadius: 12 * scaleFactor,
          minWidth: Math.max(200, width * 0.8),
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, { fontSize: 18 * scaleFactor }]}>
        Get Started
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CONFIG.BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    backgroundColor: CONFIG.BACKGROUND_COLOR,
  },
  decorativeShapes: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
  },
  roundShape: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.15,
  },
  shape1: { width: 200, height: 200, backgroundColor: CONFIG.PRIMARY_COLOR, top: -50, right: -50 },
  shape2: { width: 150, height: 150, backgroundColor: CONFIG.ACCENT_COLOR, top: '20%', left: -30 },
  shape3: { width: 80, height: 80, backgroundColor: CONFIG.DANGER_COLOR, top: '60%', right: '10%' },
  shape4: { width: 60, height: 60, backgroundColor: CONFIG.SUCCESS_COLOR, bottom: '15%', left: '5%' },
  shape5: { width: 40, height: 40, backgroundColor: CONFIG.INFO_COLOR, top: '40%', right: '5%' },
  shape6: { width: 100, height: 100, backgroundColor: CONFIG.WARNING_COLOR, bottom: -30, right: '20%' },
  portraitContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    zIndex: 1,
  },
  headerSection: { alignItems: 'center', marginTop: 0, zIndex: 2 },
  carouselSection: { flex: 1, justifyContent: 'center', marginVertical: 10, zIndex: 2 },
  actionSection: { alignItems: 'center', zIndex: 2 },
  landscapeContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 20, zIndex: 1,
  },
  landscapeLeft: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingRight: 20, zIndex: 2 },
  landscapeRight: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  logoContainer: { alignItems: 'center' },
  logo: { maxWidth: 550, maxHeight: 250 },
  carouselContainer: { flex: 1, justifyContent: 'center' },
  pagination: { bottom: 10 },
  paginationDot: { backgroundColor: 'rgba(90, 103, 216, 0.3)', width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  paginationActiveDot: { backgroundColor: CONFIG.PRIMARY_COLOR, width: 12, height: 8, borderRadius: 4, marginHorizontal: 4 },
  slideContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, width: '100%' },
  slideImage: { borderRadius: 20 },
  getStartedButton: {
    backgroundColor: CONFIG.PRIMARY_COLOR,
    shadowColor: CONFIG.PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: CONFIG.SECONDARY_COLOR, fontWeight: '600', letterSpacing: 0.5 },
});