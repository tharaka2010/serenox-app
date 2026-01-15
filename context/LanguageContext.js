
import React, { createContext, useState, useContext } from 'react';
import * as Localization from 'expo-localization';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const locale = Localization.getLocales()[0]?.languageCode;
  const [language, setLanguage] = useState(locale === 'si' ? 'si' : 'en');

  const value = {
    language,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
