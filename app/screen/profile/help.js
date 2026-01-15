import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const HelpScreen = () => {
  const router = useRouter();

  const faqs = [
    { q: 'How do I change my password?', a: 'You can change your password by going to the main login screen and using the "Forgot Password" option.' },
    { q: 'How is my data used?', a: 'We respect your privacy. Your data is used solely to personalize your experience and is never shared with third parties. Please review our Privacy Policy for more details.' },
    { q: 'How can I contact support?', a: 'For any issues or inquiries, please email us directly. We aim to respond within 24-48 hours.' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.question}>{faq.q}</Text>
            <Text style={styles.answer}>{faq.a}</Text>
          </View>
        ))}
        <Text style={styles.title}>Contact Us</Text>
        <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('mailto:support@example.com')}>
          <Feather name="mail" size={20} color="white" />
          <Text style={styles.contactButtonText}>Email Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, paddingTop: 40, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backButton: { position: 'absolute', left: 16, top: 38 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 16, marginTop: 16 },
  faqItem: { marginBottom: 20 },
  question: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 8 },
  answer: { fontSize: 16, lineHeight: 24, color: '#475569' },
  contactButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 8, marginTop: 8 },
  contactButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
});

export default HelpScreen;
