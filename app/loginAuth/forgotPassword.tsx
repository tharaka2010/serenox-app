import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePasswordReset = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    if (!email) {
      setErrorMessage('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Please check your inbox.');
      Alert.alert('Success', 'Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error.message);
      let userMessage = 'An unexpected error occurred.';
      if (error.code === 'auth/invalid-email') {
        userMessage = 'That email address is invalid!';
      } else if (error.code === 'auth/user-not-found') {
        userMessage = 'No user found with this email.';
      }
      setErrorMessage(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignIn = () => {
    router.replace('/loginAuth/signinscreen');
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
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.formContainer}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="lock-reset" size={40} color="#5a67d8" />
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  Don't worry! Enter your email address and we'll send you a link to reset your password.
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="mail" size={20} color="#9d9d9d" style={styles.icon} />
                  <TextInput
                    placeholder="Enter your email address"
                    placeholderTextColor="#9d9d9d"
                    style={styles.textInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                {errorMessage ? (
                  <View style={styles.errorMessageContainer}>
                    <MaterialIcons name="error" size={16} color="#dc3545" />
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  </View>
                ) : null}

                {successMessage ? (
                  <View style={styles.successMessageContainer}>
                    <MaterialIcons name="check-circle" size={16} color="#28a745" />
                    <Text style={styles.successMessage}>{successMessage}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={handlePasswordReset}
                  style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                  disabled={isLoading}
                >
                  <Text style={styles.resetButtonText}>
                    {isLoading ? 'Sending...' : 'Send Reset Email'}
                  </Text>
                </TouchableOpacity>

                {/* Info Section */}
                <View style={styles.infoContainer}>
                  <MaterialIcons name="info" size={16} color="#6c757d" />
                  <Text style={styles.infoText}>
                    Check your spam folder if you don't see the email in your inbox
                  </Text>
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  onPress={navigateToSignIn}
                  style={styles.backToLoginContainer}
                >
                  <MaterialIcons name="arrow-back" size={16} color="#5a67d8" />
                  <Text style={styles.backToLoginLink}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

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
    width: 120,
    height: 120,
    backgroundColor: '#5a67d8',
    top: '8%',
    right: '5%',
  },
  shape2: {
    width: 80,
    height: 80,
    backgroundColor: '#ffd700',
    top: '70%',
    left: '8%',
  },
  shape3: {
    width: 60,
    height: 60,
    backgroundColor: '#ff6b6b',
    top: '25%',
    left: '10%',
  },
  shape4: {
    width: 40,
    height: 40,
    backgroundColor: '#4ecdc4',
    top: '80%',
    right: '15%',
  },
  shape5: {
    width: 30,
    height: 30,
    backgroundColor: '#45b7d1',
    top: '45%',
    right: '5%',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 400,
    zIndex: 2,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
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
    color: '#1a1a1a',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  inputContainer: {
    width: '100%',
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
    color: '#dc3545',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  successMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: -4,
  },
  successMessage: {
    color: '#28a745',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  resetButton: {
    backgroundColor: '#5a67d8',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#5a67d8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 8,
  },
  resetButtonDisabled: {
    backgroundColor: '#9d9d9d',
    shadowOpacity: 0.1,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    color: '#6c757d',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
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
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  backToLoginLink: {
    color: '#5a67d8',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});