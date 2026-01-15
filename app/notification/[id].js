import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'No date provided';
  return timestamp.toDate().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const NotificationDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!id || !user) {
      setLoading(false);
      return;
    }
    
    const fetchNotification = async () => {
      const db = getFirestore();
      let docSnap;

      // 1. Try fetching from the general 'notifications' collection
      const generalDocRef = doc(db, 'notifications', id);
      docSnap = await getDoc(generalDocRef);

      // 2. If not found, try fetching from the user-specific subcollection
      if (!docSnap.exists()) {
        const userDocRef = doc(db, `users/${user.uid}/notifications`, id);
        docSnap = await getDoc(userDocRef);
      }

      // 3. If found in either location, set the data
      if (docSnap.exists()) {
        setNotification(docSnap.data());
      } else {
        console.log("No such document in general or user-specific collections!");
      }
      setLoading(false);
    };

    fetchNotification();
  }, [id, user]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#3B82F6" />;
  }

  if (!notification) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Notification not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notification.imageUrl && (
          <Image source={{ uri: notification.imageUrl }} style={styles.image} />
        )}
        <View style={styles.content}>
          <Text style={styles.title}>{notification.title}</Text>
          <View style={styles.metaContainer}>
            <Feather name="calendar" size={14} color="#64748b" />
            <Text style={styles.metaText}>{formatDate(notification.createdAt)}</Text>
          </View>
          <Text style={styles.body}>{notification.message || notification.body}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, paddingTop: 40, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backButton: { position: 'absolute', left: 16, top: 38 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  scrollContent: { paddingBottom: 30 },
  image: { width: '100%', height: 220 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  metaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  metaText: { marginLeft: 8, fontSize: 14, color: '#64748b' },
  body: { fontSize: 16, lineHeight: 26, color: '#334155' },
  errorText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'red' },
});

export default NotificationDetailScreen;
