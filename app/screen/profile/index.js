import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  BackHandler,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../../../components/BottomNav';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  // --- Custom Back Button Handler ---
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // When on the Profile tab, the back button should go to the main landing page.
        router.replace('/screen/mainLanding');
        return true; // Prevents default back button behavior
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [router])
  );

  const fetchUserData = useCallback(async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    }
    setLoading(false);
    
    // Animate content in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user, db, fadeAnim, scaleAnim]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
            router.replace('/');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.decorativeShapes}>
          <View style={[styles.roundShape, styles.shape1]} />
          <View style={[styles.roundShape, styles.shape2]} />
          <View style={[styles.roundShape, styles.shape3]} />
          <View style={[styles.roundShape, styles.shape4]} />
          <View style={[styles.roundShape, styles.shape5]} />
          <View style={[styles.roundShape, styles.shape6]} />
        </View>
        <ActivityIndicator size="large" color="#5a67d8" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeShapes}>
          <View style={[styles.roundShape, styles.shape1]} />
          <View style={[styles.roundShape, styles.shape2]} />
          <View style={[styles.roundShape, styles.shape3]} />
          <View style={[styles.roundShape, styles.shape4]} />
          <View style={[styles.roundShape, styles.shape5]} />
          <View style={[styles.roundShape, styles.shape6]} />
        </View>

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profile</Text>
              <Text style={styles.headerSubtitle}>Manage your account</Text>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person-outline" size={50} color="#5a67d8" />
                </View>
                <View style={styles.statusIndicator} />
              </View>
              <Text style={styles.userName}>{userData?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{userData?.email}</Text>
              <View style={styles.membershipBadge}>
                <MaterialIcons name="verified" size={16} color="#22c55e" />
                <Text style={styles.membershipText}>Member</Text>
              </View>
            </View>

            {/* Menu Sections */}

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Support</Text>
              <View style={styles.menuContainer}>
                <MenuItem 
                  icon="info" 
                  text="About Us" 
                  onPress={() => router.push('/screen/profile/about')} 
                />
                <MenuItem 
                  icon="help-circle" 
                  text="Help & Support" 
                  onPress={() => router.push('/screen/profile/help')} 
                />
                <MenuItem 
                  icon="file-text" 
                  text="Terms & Conditions" 
                  onPress={() => router.push('/screen/profile/terms')} 
                />
              </View>
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Account Actions</Text>
              <View style={styles.menuContainer}>
                <MenuItem 
                  icon="log-out" 
                  text="Sign Out" 
                  onPress={handleSignOut} 
                  color="#ef4444" 
                  isDestructive
                />
              </View>
            </View>

            {/* Version Info */}
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
              <Text style={styles.versionSubtext}>© 2025 serenox Team</Text>
            </View>
          </ScrollView>
        </Animated.View>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
};

const MenuItem = ({ icon, text, value, onPress, color = '#1e293b', isDestructive = false }) => (
  <TouchableOpacity 
    style={[
      styles.menuItem,
      isDestructive && styles.destructiveMenuItem
    ]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIcon, isDestructive && styles.destructiveIcon]}>
      <Feather name={icon} size={20} color={color} />
    </View>
    <Text style={[styles.menuText, { color }]}>{text}</Text>
    {value && <Text style={styles.menuValue}>{value}</Text>}
    <Feather name="chevron-right" size={20} color="#94a3b8" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
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
    width: 120,
    height: 120,
    backgroundColor: '#5a67d8',
    top: '5%',
    right: '10%',
  },
  shape2: {
    width: 80,
    height: 80,
    backgroundColor: '#ffd700',
    top: '15%',
    left: '5%',
  },
  shape3: {
    width: 60,
    height: 60,
    backgroundColor: '#ff6b6b',
    top: '70%',
    right: '15%',
  },
  shape4: {
    width: 40,
    height: 40,
    backgroundColor: '#4ecdc4',
    top: '80%',
    left: '10%',
  },
  shape5: {
    width: 30,
    height: 30,
    backgroundColor: '#45b7d1',
    top: '40%',
    right: '5%',
  },
  shape6: {
    width: 90,
    height: 90,
    backgroundColor: '#f39c12',
    top: '55%',
    left: '3%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  membershipText: {
    fontSize: 14,
    color: '#15803d',
    fontWeight: '600',
    marginLeft: 4,
  },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  destructiveMenuItem: {
    backgroundColor: '#fef2f2',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveIcon: {
    backgroundColor: '#fee2e2',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  menuValue: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});

export default ProfileScreen;