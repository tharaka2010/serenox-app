import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AboutScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Our Mission</Text>
        <Text style={styles.paragraph}>
          Our mission is to provide accessible, accurate, and comprehensive sex education to empower individuals to make informed decisions about their health and relationships. We believe in a world where everyone has the knowledge and confidence to lead a healthy life.
        </Text>
        <Text style={styles.title}>Our Website</Text>
        <Text style={styles.paragraph}>
          For more detailed articles, resources, and community discussions, please visit our official website.
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://sexeducation-c0902.web.app')}>
          <Text style={styles.link}>sexeducation-c0902.web.app</Text>
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, marginTop: 16 },
  paragraph: { fontSize: 16, lineHeight: 26, color: '#334155', marginBottom: 16 },
  link: { fontSize: 16, color: '#3B82F6', textDecorationLine: 'underline' },
});

export default AboutScreen;
