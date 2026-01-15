import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { FontAwesome5, Ionicons, Feather, AntDesign } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { auth, db } from "../firebase";

// =============================================================================
// CONSTANTS & HELPERS
// =============================================================================

const getScreenDimensions = () => Dimensions.get("window");

const getDeviceType = (width) => {
  if (width >= 768) return 'tablet';
  if (width >= 414) return 'large_phone';
  return 'phone';
};

const NAV_ITEMS = [
  { name: "Home", icon: AntDesign, iconName: "home", route: "/screen/mainLanding" },
  { name: "News", icon: FontAwesome5, iconName: "newspaper", route: "/screen/news" },
  { name: "Notifications", icon: Feather, iconName: "bell", route: "/screen/notification" },
  { name: "Profile", icon: Ionicons, iconName: "person-outline", route: "/screen/profile" },
];

const COLORS = {
  WHITE: "#FFFFFF",
  GRAY_BORDER: "#D1D5DB",
  TEXT_COLOR: "#000000",
  ACTIVE_COLOR: "#6200ee",
  INACTIVE_COLOR: "#888888",
  SHADOW_COLOR: "#000000",
  BADGE_BACKGROUND: "#FF0000",
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const BottomNav = () => {
  const router = useRouter();
  const segments = useSegments();
  const [dimensions, setDimensions] = useState(getScreenDimensions());
  const [deviceType, setDeviceType] = useState(getDeviceType(dimensions.width));

  // States for individual counts and data
  const [personalUnreadCount, setPersonalUnreadCount] = useState(0);
  const [generalNotifications, setGeneralNotifications] = useState([]);
  const [readGeneralIds, setReadGeneralIds] = useState([]);
  const [feedbackUnreadCount, setFeedbackUnreadCount] = useState(0);
  
  // Final derived state for the UI badge
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Main effect for setting up all listeners based on auth state
  useEffect(() => {
    let unsubPersonal, unsubGeneral, unsubUserDoc, unsubFeedback;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up any existing Firestore listeners when auth state changes
      if (unsubPersonal) unsubPersonal();
      if (unsubGeneral) unsubGeneral();
      if (unsubUserDoc) unsubUserDoc();
      if (unsubFeedback) unsubFeedback();

      if (user) {
        // Listener 1: Personal unread notifications
        const personalQuery = query(collection(db, "users", user.uid, "notifications"), where("read", "==", false));
        unsubPersonal = onSnapshot(personalQuery, 
          (snapshot) => setPersonalUnreadCount(snapshot.size),
          (error) => console.error("Error fetching personal notifications:", error)
        );

        // Listener 2: All general notifications
        const generalQuery = query(collection(db, "notifications"));
        unsubGeneral = onSnapshot(generalQuery, 
          (snapshot) => setGeneralNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
          (error) => console.error("Error fetching general notifications:", error)
        );

        // Listener 3: User's profile to get readGeneralNotificationIds
        const userDocRef = doc(db, "users", user.uid);
        unsubUserDoc = onSnapshot(userDocRef, 
          (doc) => setReadGeneralIds(doc.data()?.readGeneralNotificationIds || []),
          (error) => console.error("Error fetching user document:", error)
        );

        // Listener 4: Unread feedback replies
        const feedbackQuery = query(collection(db, "users", user.uid, "feedback"), where("read", "==", false));
        unsubFeedback = onSnapshot(feedbackQuery, (snapshot) => {
          // Filter for docs that actually have a reply from an admin
          const repliedAndUnread = snapshot.docs.filter(d => d.data().adminReply);
          setFeedbackUnreadCount(repliedAndUnread.length);
        }, (error) => console.error("Error fetching feedback replies:", error));

      } else {
        // No user is signed in, reset all counts and data
        setPersonalUnreadCount(0);
        setGeneralNotifications([]);
        setReadGeneralIds([]);
        setFeedbackUnreadCount(0);
      }
    });

    // Main cleanup function for when the component unmounts
    return () => {
      unsubAuth();
      if (unsubPersonal) unsubPersonal();
      if (unsubGeneral) unsubGeneral();
      if (unsubUserDoc) unsubUserDoc();
      if (unsubFeedback) unsubFeedback();
    };
  }, []);

  // Effect to calculate the final badge count whenever a dependency changes
  useEffect(() => {
    const unreadGeneralCount = generalNotifications.filter(
      (generalDoc) => !readGeneralIds.includes(generalDoc.id)
    ).length;
    setTotalUnreadCount(personalUnreadCount + unreadGeneralCount + feedbackUnreadCount);
  }, [personalUnreadCount, generalNotifications, readGeneralIds, feedbackUnreadCount]);

  // Effect for handling dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
      setDeviceType(getDeviceType(window.width));
    });
    return () => subscription?.remove();
  }, []);

  const responsiveStyles = getResponsiveStyles(dimensions, deviceType);

  const isActive = (route) => {
    const currentPath = `/${segments.join('/')}`;
    return currentPath.startsWith(route);
  };

  return (
    <View style={responsiveStyles.navContainer}>
      {NAV_ITEMS.map((item) => {
        const IconComponent = item.icon;
        const active = isActive(item.route);
        const iconColor = active ? COLORS.ACTIVE_COLOR : COLORS.INACTIVE_COLOR;
        const textColor = active ? COLORS.ACTIVE_COLOR : COLORS.TEXT_COLOR;

        return (
          <TouchableOpacity
            key={item.name}
            onPress={() => router.replace(item.route)}
            style={responsiveStyles.navItem}
            activeOpacity={0.7}
          >
            <View>
              <IconComponent name={item.iconName} size={responsiveStyles.icon.fontSize} color={iconColor} />
              {item.name === "Notifications" && totalUnreadCount > 0 && (
                <View style={responsiveStyles.badgeContainer}>
                  <Text style={responsiveStyles.badgeText}>
                    {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[responsiveStyles.navText, { color: textColor }]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// =============================================================================
// RESPONSIVE STYLES FUNCTION
// =============================================================================

const getResponsiveStyles = (dimensions, deviceType) => {
  const { width } = dimensions;
  const isTablet = deviceType === 'tablet';
  const isLargePhone = deviceType === 'large_phone';

  const scaleFactor = isTablet ? 1.2 : isLargePhone ? 1.05 : 1;
  const baseIconSize = 24;
  const baseTextSize = 10;
  const basePaddingVertical = 12;

  return StyleSheet.create({
    navContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: COLORS.WHITE,
      paddingVertical: basePaddingVertical * scaleFactor,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: COLORS.GRAY_BORDER,
      shadowColor: COLORS.SHADOW_COLOR,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 10,
      paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 5,
    },
    icon: {
      fontSize: baseIconSize * scaleFactor,
    },
    navText: {
      fontSize: baseTextSize * scaleFactor,
      marginTop: 4,
      fontWeight: '500',
    },
    badgeContainer: {
      position: 'absolute',
      top: -5,
      right: -10,
      backgroundColor: COLORS.BADGE_BACKGROUND,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 5,
      borderWidth: 1,
      borderColor: COLORS.WHITE,
    },
    badgeText: {
      color: COLORS.WHITE,
      fontSize: 10 * scaleFactor,
      fontWeight: 'bold',
    },
  });
};

export default BottomNav;
