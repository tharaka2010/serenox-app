import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// =================================================================
// MAIN SCREEN: ARTICLE DETAIL PAGE
// =================================================================
const ArticleDetailPage = () => {
  const router = useRouter();
  const { id: articleId } = useLocalSearchParams(); // Get article ID from URL
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [article, setArticle] = useState(null);
  const { language = 'en' } = useLanguage() || {};
  const [loading, setLoading] = useState(true);

  const fetchArticleData = useCallback(async () => {
    if (!user || !articleId) {
      setLoading(false);
      return;
    }


    try {
      // Fetch Article Details
      const articleDocRef = doc(db, 'articles', articleId);
      const articleDocSnap = await getDoc(articleDocRef);

      if (articleDocSnap.exists()) {
        setArticle({ id: articleDocSnap.id, ...articleDocSnap.data() });
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching article data:", error);
    } finally {
      setLoading(false);
    }
  }, [db, user, articleId]);

  useEffect(() => {
    fetchArticleData();
  }, [fetchArticleData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={styles.loader} size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Article not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const content = language === 'si' ? article.contentSi : article.contentEn;
  const title = content.title || '';
  
  // Render the body content based on its structure (array of paragraphs and images)
  const renderBody = () => {
    return content.body?.map((item, index) => {
      if (item.type === 'paragraph') {
        return <Text key={index} style={styles.articleBody}>{item.text}</Text>;
      }
      if (item.type === 'image') {
        return <Image key={index} source={{ uri: item.url }} style={styles.bodyImage} resizeMode="contain" alt={item.alt || 'Article image'} />;
      }
      return null;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>
      <ScrollView style={styles.container}>
        <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
        <View style={styles.contentContainer}>
          <Text style={styles.articleTitle}>{title}</Text>
          <View style={styles.separator} />
          {renderBody()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// =================================================================
// STYLESHEET
// =================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4F46E5', // Match header color
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#4B5563',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5', // Indigo-600
    paddingVertical: 15,
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'android' ? 25 : 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    flex: 1, // Ensure title takes available space
  },
  articleImage: {
    width: screenWidth,
    height: screenWidth * 0.65, // Aspect ratio for a prominent image
    backgroundColor: '#E5E7EB', // Placeholder color
  },
  contentContainer: {
    padding: 20,
  },
  articleTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827', // Nearly black for high contrast
    marginBottom: 16,
    lineHeight: 34,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB', // Light gray separator
    marginBottom: 20,
  },
  articleBody: {
    fontSize: 17,
    lineHeight: 28, // Generous line height for readability
    color: '#374151', // Dark gray for body text
    marginBottom: 16, // Add space between paragraphs
  },
  bodyImage: {
    width: '100%',
    height: 200, // Adjust height as needed
    borderRadius: 8,
    marginVertical: 16,
  },
});

export default ArticleDetailPage;
