// Signupscreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Import your initialized auth and db objects
import { registerForPushNotificationsAsync } from '../../utils/notifications';

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState(''); // New state for Age
  const [gender, setGender] = useState(''); // New state for Gender
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const genderOptions = [
    { label: 'Male', value: 'Male', icon: 'male' },
    { label: 'Female', value: 'Female', icon: 'female' },
    { label: 'Non-binary', value: 'Non-binary', icon: 'transgender' },
    { label: 'Prefer not to say', value: 'Prefer not to say', icon: 'help' },
  ];

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    setShowGenderModal(false);
  };

  const handleSignUp = async () => {
    setErrorMessage(''); // Clear previous errors

    // --- Start of validation for all fields ---
    if (!name || !email || !password || !age || !gender) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password should be at least 6 characters.');
      return;
    }

    // Basic age validation
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) { // Assuming a reasonable age range
      setErrorMessage('Please enter a valid age (1-120).');
      return;
    }
    // --- End of validation for all fields ---

    try {
      // Create user with Email and Password using Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Now, store the additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: user.email,
        age: ageNum,
        gender: gender,
        createdAt: new Date(),
        termsAccepted: false, // Add the termsAccepted flag
      });

      await registerForPushNotificationsAsync(user);

      console.log('User created:', user.uid);
      console.log('User data stored in Firestore');

      // Navigate to the terms and conditions page
      router.replace('/onboarding/terms');
    } catch (error: any) {
      console.error("Sign-up error:", error.message);
      let userMessage = "An unexpected error occurred during registration.";
      if (error.code === 'auth/email-already-in-use') {
        userMessage = 'That email address is already in use!';
      } else if (error.code === 'auth/invalid-email') {
        userMessage = 'That email address is invalid!';
      } else if (error.code === 'auth/weak-password') {
        userMessage = 'The password is too weak.';
      }
      setErrorMessage(userMessage);
    }
  };

  const navigateToSignIn = () => {
    router.replace('/loginAuth/signinscreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Decorative round shapes */}
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Sign up to get started.
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="person" size={20} color="#9d9d9d" style={styles.icon} />
                  <TextInput
                    placeholder="Name"
                    placeholderTextColor="#9d9d9d"
                    style={styles.textInput}
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialIcons name="mail" size={20} color="#9d9d9d" style={styles.icon} />
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
                  <MaterialIcons name="lock" size={20} color="#9d9d9d" style={styles.icon} />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#9d9d9d"
                    secureTextEntry
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                {/* New Age Input */}
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="cake" size={20} color="#9d9d9d" style={styles.icon} />
                  <TextInput
                    placeholder="Age"
                    placeholderTextColor="#9d9d9d"
                    style={styles.textInput}
                    keyboardType="numeric" // Only allow numbers
                    value={age}
                    onChangeText={setAge}
                    maxLength={3} // Max 3 digits for age
                  />
                </View>

                {/* Gender Selector */}
                <TouchableOpacity 
                  style={styles.inputWrapper} 
                  onPress={() => setShowGenderModal(true)}
                >
                  <MaterialIcons name="wc" size={20} color="#9d9d9d" style={styles.icon} />
                  <Text style={[styles.textInput, { color: gender ? '#333' : '#9d9d9d' }]}>
                    {gender || 'Select Gender'}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={20} color="#9d9d9d" />
                </TouchableOpacity>

                {errorMessage ? (
                  <View style={styles.errorMessageContainer}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  </View>
                ) : null}

                <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                </TouchableOpacity>

                <View style={styles.loginTextContainer}>
                  <Text style={styles.loginText}>
                    Already have an account?{' '}
                    <Text style={styles.loginLink} onPress={navigateToSignIn}>
                      Log In
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modern Gender Selection Modal */}
        <Modal
          visible={showGenderModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowGenderModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowGenderModal(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Gender</Text>
                <TouchableOpacity 
                  onPress={() => setShowGenderModal(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={genderOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      gender === item.value && styles.selectedGenderOption
                    ]}
                    onPress={() => handleGenderSelect(item.value)}
                  >
                    <View style={styles.genderOptionContent}>

                      <Text style={[
                        styles.genderOptionText,
                        gender === item.value && styles.selectedGenderOptionText
                      ]}>
                        {item.label}
                      </Text>
                    </View>
                    {gender === item.value && (
                      <MaterialIcons name="check" size={20} color="#5a67d8" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;

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
  },
  shape1: {
    width: 80,
    height: 80,
    backgroundColor: '#ffd700',
    top: '15%',
    right: '10%',
  },
  shape2: {
    width: 60,
    height: 60,
    backgroundColor: '#5a67d8',
    top: '25%',
    left: '8%',
  },
  shape3: {
    width: 45,
    height: 45,
    backgroundColor: '#ff6b6b',
    top: '70%',
    right: '15%',
  },
  shape4: {
    width: 35,
    height: 35,
    backgroundColor: '#4ecdc4',
    top: '80%',
    left: '20%',
  },
  shape5: {
    width: 25,
    height: 25,
    backgroundColor: '#45b7d1',
    top: '40%',
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 400,
    zIndex: 2,
  },
  title: {
    color: "#1a1a1a",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 5,
    marginTop: 30,
    textAlign: 'center',
  },
  subtitle: {
    color: "#6c757d",
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    width: "100%",
    gap: 15,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
    maxHeight: '60%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  selectedGenderOption: {
    backgroundColor: '#f0f4ff',
  },
  genderOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  genderOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '400',
  },
  selectedGenderOptionText: {
    color: '#5a67d8',
    fontWeight: '500',
  },
  errorMessageContainer: {
    marginTop: -5,
    marginBottom: 10,
    alignItems: 'center',
  },
  errorMessage: {
    color: "#dc3545",
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    padding: 8,
    borderRadius: 4,
  },
  signUpButton: {
    backgroundColor: "#5a67d8",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginTop: 5,
    marginBottom: 20,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginTextContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loginText: {
    color: "#6c757d",
    fontSize: 14,
  },
  loginLink: {
    color: "#5a67d8",
    fontWeight: "700",
  },
});

// Note: The Picker might look different on iOS vs Android.
// For a more consistent look, a custom dropdown component might be needed.