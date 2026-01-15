import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const TERMS_DATA = [
  {
    id: 1,
    title: "Acceptance of Terms",
    content: "By accessing or using our Serenox app, you agree to abide by these terms and conditions. Your continued use of the application constitutes acceptance of all policies outlined herein.",
  },
  {
    id: 2,
    title: "Responsible Usage",
    content: "You must use the app responsibly and in compliance with all applicable laws and regulations. This includes respecting educational content and using features as intended.",
  },
  {
    id: 3,
    title: "User Conduct",
    content: "• Do not use the app for any illegal or unauthorized purposes\n• Respect the privacy and rights of other users\n• Maintain appropriate behavior in all interactions\n• Report any misuse or inappropriate content",
  },
  {
    id: 4,
    title: "Data and Privacy",
    content: "• Your personal information will be handled according to our Privacy Policy\n• You agree not to misuse or share other users' data\n• We implement security measures to protect your information\n• You have control over your data and privacy settings",
  },
  {
    id: 5,
    title: "Prohibited Activities",
    content: "The following activities are strictly prohibited:\n• Unauthorized distribution of app content\n• Attempting to harm or hack the app\n• Misrepresentation of your identity\n• Sharing inappropriate or harmful content\n• Circumventing security measures",
  },
  {
    id: 6,
    title: "Content Disclaimer",
    content: "The information provided in the app is for educational purposes only. We do not guarantee its accuracy or completeness. Always consult with healthcare professionals for medical advice.",
  },
  {
    id: 7,
    title: "Changes to Terms",
    content: "We reserve the right to update or modify these terms at any time. Continued use of the app indicates your acceptance of the updated terms. Users will be notified of significant changes.",
  },
  {
    id: 8,
    title: "Termination",
    content: "Failure to comply with these terms may result in the termination of your account or access to the app. We reserve the right to suspend or terminate access for violations.",
  },
  {
    id: 9,
    title: "Contact Us",
    content: "If you have any questions about these terms, please contact us at support@serenox.com.",
  },
];

const TermsAndConditionsScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {TERMS_DATA.map((term) => (
          <View key={term.id}>
            <Text style={styles.sectionTitle}>{term.id}. {term.title}</Text>
            <Text style={styles.paragraph}>
              {term.content}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, paddingTop: 40, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backButton: { position: 'absolute', left: 16, top: 38 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, marginTop: 16 },
  paragraph: { fontSize: 16, lineHeight: 26, color: '#334155', marginBottom: 16 },
});

export default TermsAndConditionsScreen;