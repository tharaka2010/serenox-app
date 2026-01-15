import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import CategoryArticles from '../../components/CategoryArticles';
import ImageSlider from '../../components/ImageSlider';
import { useLanguage } from '../../../context/LanguageContext';

const childImages = [
  require('../../../assets/child_slider/1.png'),
  require('../../../assets/child_slider/2.png'),
  require('../../../assets/child_slider/3.png'),
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.languageSwitcher}>
      <TouchableOpacity onPress={() => setLanguage('en')}>
        <Text style={[styles.languageText, language === 'en' && styles.activeLanguage]}>English</Text>
      </TouchableOpacity>
      <Text style={styles.languageSeparator}>|</Text>
      <TouchableOpacity onPress={() => setLanguage('si')}>
        <Text style={[styles.languageText, language === 'si' && styles.activeLanguage]}>සිංහල</Text>
      </TouchableOpacity>
    </View>
  );
};


const ChildMain = () => {
  const ListHeader = () => (
    <View>
      <ImageSlider images={childImages} />
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Child Health & Wellness</Text>
        <LanguageSwitcher />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CategoryArticles category="Child" ListHeaderComponent={<ListHeader />} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  languageSwitcher: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  languageText: {
    fontSize: 16,
    color: '#6B7280',
  },
  activeLanguage: {
    fontWeight: 'bold',
    color: '#00796B',
  },
  languageSeparator: {
    marginHorizontal: 8,
    color: '#6B7280',
  },
});

export default ChildMain;
