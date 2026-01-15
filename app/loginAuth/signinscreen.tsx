//signinscreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from 'expo-router';
import { registerForPushNotificationsAsync } from '../../utils/notifications';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage(''); // Clear previous errors
    setIsLoading(true);
    
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setIsLoading(false);
      return;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user has accepted the terms
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().termsAccepted) {
        // User has accepted terms, go to main landing
        router.replace('/screen/mainLanding');
      } else {
        // User has not accepted terms, go to terms screen
        router.replace('/onboarding/terms');
      }
      
      await registerForPushNotificationsAsync(user);
    } catch (error: any) {
      console.error("Login error:", error.message);
      let userMessage = "An unexpected error occurred during login.";
      if (error.code === 'auth/invalid-email') {
        userMessage = 'That email address is invalid!';
      } else if (error.code === 'auth/user-disabled') {
        userMessage = 'This user has been disabled.';
      } else if (error.code === 'auth/user-not-found') {
        userMessage = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        userMessage = 'Wrong password.';
      } else if (error.code === 'auth/too-many-requests') {
        userMessage = 'Too many failed login attempts. Please try again later.';
      }
      setErrorMessage(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.push('/loginAuth/signupscreen');
  };

  const navigateToForgotPassword = () => {
    router.push('/loginAuth/forgotPassword');
  };

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

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.formContainer}>
              {/* Welcome Section */}
              <View style={styles.welcomeSection}>
                <View style={styles.logoContainer}>
                  <MaterialIcons name="lock" size={40} color="#5a67d8" />
                </View>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to your account to continue
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="mail"
                    size={20}
                    color="#9d9d9d"
                    style={styles.icon}
                  />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#9d9d9d"
                    style={styles.textInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="lock"
                    size={20}
                    color="#9d9d9d"
                    style={styles.icon}
                  />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#9d9d9d"
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility" : "visibility-off"}
                      size={20}
                      color="#9d9d9d"
                    />
                  </TouchableOpacity>
                </View>

                {errorMessage ? (
                  <View style={styles.errorMessageContainer}>
                    <MaterialIcons name="error" size={16} color="#dc3545" />
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={handleLogin}
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={navigateToForgotPassword}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPasswordLink}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  onPress={navigateToSignUp}
                  style={styles.signUpContainer}
                >
                  <Text style={styles.signUpText}>
                    Don't have an account?{' '}
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
    opacity: 0.1,
  },
  shape1: {
    width: 100,
    height: 100,
    backgroundColor: '#5a67d8',
    top: '10%',
    right: '5%',
  },
  shape2: {
    width: 80,
    height: 80,
    backgroundColor: '#ffd700',
    top: '20%',
    left: '10%',
  },
  shape3: {
    width: 60,
    height: 60,
    backgroundColor: '#ff6b6b',
    top: '65%',
    right: '20%',
  },
  shape4: {
    width: 40,
    height: 40,
    backgroundColor: '#4ecdc4',
    top: '75%',
    left: '15%',
  },
  shape5: {
    width: 30,
    height: 30,
    backgroundColor: '#45b7d1',
    top: '35%',
    right: '8%',
  },
  shape6: {
    width: 50,
    height: 50,
    backgroundColor: '#f39c12',
    top: '50%',
    left: '5%',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 400,
    zIndex: 2,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    color: "#1a1a1a",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: "#6c757d",
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    width: "100%",
    gap: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    height: 54,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: -4,
  },
  errorMessage: {
    color: "#dc3545",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  loginButton: {
    backgroundColor: "#5a67d8",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#5a67d8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: "#9d9d9d",
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordLink: {
    color: "#5a67d8",
    fontSize: 14,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    color: '#6c757d',
    fontSize: 14,
    marginHorizontal: 16,
  },
  signUpContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  signUpText: {
    color: "#6c757d",
    fontSize: 14,
  },
  signUpLink: {
    color: "#5a67d8",
    fontWeight: "600",
  },
});