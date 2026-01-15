import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'No date provided';
  return timestamp.toDate().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

const NewsDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const docRef = doc(db, 'newsAndArticles', id);

    const fetchNews = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setNewsItem(docSnap.data());
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    };

    const incrementViewCount = async () => {
      await updateDoc(docRef, {
        viewCount: increment(1)
      });
    };

    fetchNews();
    incrementViewCount().catch(err => console.error("Failed to increment view count:", err));

  }, [id]);

  const renderBodyContent = (item, index) => {
    if (item.type === 'paragraph') {
      return <Text key={index} style={styles.bodyText}>{item.text}</Text>;
    }
    if (item.type === 'image') {
      return <Image key={index} source={{ uri: item.url }} style={styles.bodyImage} accessibilityLabel={item.alt} />;
    }
    return null;
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#3B82F6" />;
  }

  if (!newsItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>News item not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={28} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{newsItem.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: newsItem.thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.content}>
          <Text style={styles.title}>{newsItem.title}</Text>
          <View style={styles.metaContainer}>
            <Feather name="calendar" size={14} color="#64748b" />
            <Text style={styles.metaText}>{formatDate(newsItem.createdAt)}</Text>
            <Feather name="eye" size={14} color="#64748b" style={{ marginLeft: 16 }} />
            <Text style={styles.metaText}>{newsItem.viewCount || 0} views</Text>
          </View>
          {newsItem.body.map(renderBodyContent)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16,
    paddingHorizontal: 50, // Give space for back button
    paddingTop: 40, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0',
    justifyContent: 'center',
  },
  backButton: { 
    position: 'absolute', 
    left: 16, 
    top: 38,
    zIndex: 1,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1e293b',
    textAlign: 'center',
  },
  scrollContent: { paddingBottom: 30 },
  thumbnail: { width: '100%', height: width * 0.6 },
  content: { padding: 20 },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: 12 
  },
  metaContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
    paddingBottom: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0' 
  },
  metaText: { 
    marginLeft: 8, 
    fontSize: 14, 
    color: '#64748b' 
  },
  bodyText: { 
    fontSize: 16, 
    lineHeight: 28, 
    color: '#334155', 
    marginBottom: 20 
  },
  bodyImage: {
    width: '100%',
    height: width * 0.7,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: { 
    textAlign: 'center', 
    marginTop: 50, 
    fontSize: 16, 
    color: 'red' 
  },
});

export default NewsDetailScreen;
