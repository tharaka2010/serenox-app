import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  SafeAreaView,
} from "react-native";
import BottomNav from "../../components/BottomNav";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const { width } = Dimensions.get("window");

const COLORS = {
  WHITE: "#FFFFFF",
  LIGHT_GRAY: "#F7FAFC",
  TEAL_BUTTON: "#2BC4B0",
};

const NewsCard = ({ item }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/screen/news/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardSnippet} numberOfLines={3}>{item.snippet}</Text>
        <View style={styles.readMoreContainer}>
          <Text style={styles.readMoreText}>Read More</Text>
          <Feather name="arrow-right" size={16} color="#3B82F6" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function News() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'News', 'Article'

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/screen/mainLanding');
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const newsCollection = collection(db, 'newsAndArticles');
        let q;
        if (filter === 'All') {
          q = query(newsCollection, orderBy("createdAt", "desc"));
        } else {
          // Temporarily remove orderBy to avoid needing a composite index
          q = query(newsCollection, where("type", "==", filter));
        }
        const newsSnapshot = await getDocs(q);
        const newsList = newsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNews(newsList);
      } catch (error) {
        console.error("Error fetching news: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [filter]);

  const FilterButton = ({ title }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === title && styles.filterButtonActive]}
      onPress={() => setFilter(title)}
    >
      <Text style={[styles.filterButtonText, filter === title && styles.filterButtonTextActive]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>News & Articles</Text>
        </View>
        <View style={styles.filterContainer}>
          <FilterButton title="All" />
          <FilterButton title="News" />
          <FilterButton title="Article" />
        </View>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.decorativeShapes}>
        <View style={[styles.roundShape, styles.shape1]} />
        <View style={[styles.roundShape, styles.shape2]} />
        <View style={[styles.roundShape, styles.shape3]} />
        <View style={[styles.roundShape, styles.shape4]} />
        <View style={[styles.roundShape, styles.shape5]} />
        <View style={[styles.roundShape, styles.shape6]} />
      </View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>News & Articles</Text>
      </View>
      <View style={styles.filterContainer}>
        <FilterButton title="All" />
        <FilterButton title="News" />
        <FilterButton title="Article" />
      </View>
      <FlatList
        data={news}
        renderItem={({ item }) => <NewsCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>No {filter} Found</Text>
            <Text style={styles.emptySubtext}>Check back later for the latest updates.</Text>
          </View>
        )}
      />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: '#1e293b',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    color: '#475569',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: width * 0.5,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  cardSnippet: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  decorativeShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  roundShape: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.08,
  },
  shape1: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.TEAL_BUTTON,
    top: '8%',
    right: '8%',
  },
  shape2: {
    width: 70,
    height: 70,
    backgroundColor: '#f093fb',
    top: '25%',
    left: '5%',
  },
  shape3: {
    width: 50,
    height: 50,
    backgroundColor: '#4facfe',
    top: '45%',
    right: '10%',
  },
  shape4: {
    width: 35,
    height: 35,
    backgroundColor: '#43e97b',
    top: '65%',
    left: '12%',
  },
  shape5: {
    width: 25,
    height: 25,
    backgroundColor: '#667eea',
    top: '38%',
    right: '15%',
  },
  shape6: {
    width: 40,
    height: 40,
    backgroundColor: '#f5576c',
    top: '80%',
    left: '8%',
  },
});