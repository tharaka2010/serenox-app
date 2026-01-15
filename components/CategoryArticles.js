
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Import Feather icons
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming your firebase config is in firebase.tsx
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

const CategoryArticles = ({ category, ListHeaderComponent }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const { language } = useLanguage();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const articlesRef = collection(db, 'articles');
        const q = query(articlesRef, where('category', '==', category));
        
        const querySnapshot = await getDocs(q);
        const fetchedArticles = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Fetched article data:", data); // DEBUG LOG

          const content = language === 'si' ? data.contentSi : data.contentEn;
          console.log("Selected content:", content); // DEBUG LOG
          
          if (content) {
            // Find the first paragraph in the body for a snippet
            const firstParagraph = content.body?.find(item => item.type === 'paragraph')?.text || '';
            
            fetchedArticles.push({
              id: doc.id,
              title: content.title,
              bodySnippet: firstParagraph.substring(0, 100), // Take a small part of the content
              imageUrl: data.imageUrl,
            });
          }
        });
        
        setArticles(fetchedArticles);
      } catch (err) {
        setError('Failed to load articles. Please try again later.');
        console.error("Error fetching articles: ", err);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchArticles();
    }
  }, [category, language]);

  const handleArticlePress = (id) => {
    router.push(`/screen/article/${id}`);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleArticlePress(item.id)}>
      <View style={styles.contentRow}>
        <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.textContainer}>
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.bodySnippet}>{item.bodySnippet}...</Text>
          </View>
          <View style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Explore More</Text>
            <Feather name="arrow-right" size={16} color="#00796B" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListEmptyComponent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#2BC4B0" style={styles.loader} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    return <Text style={styles.emptyText}>No articles found in this category.</Text>;
  };

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeaderComponent} // Pass the header component to the FlatList
      ListEmptyComponent={renderListEmptyComponent}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  bodySnippet: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  exploreButtonText: {
    color: '#00796B',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 6,
  },
});

export default CategoryArticles;
