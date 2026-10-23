import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../utils/translations';

const ThemeLanguageContext = createContext();

export function ThemeLanguageProvider({ children }) {
  // Theme state: 'dark' or 'light'
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('minigame_theme') || 'dark';
  });

  // Language state: 'vi' or 'en'
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('minigame_lang') || 'vi';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem('minigame_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('minigame_lang', lang);
  }, [lang]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleLang = () => {
    setLangState(prev => (prev === 'vi' ? 'en' : 'vi'));
  };

  const setLang = (newLang) => {
    setLangState(newLang);
  };

  const t = (key, fallback = '') => {
    return getTranslation(lang, key, fallback);
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        lang,
        toggleLang,
        setLang,
        t
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLang() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLang must be used within a ThemeLanguageProvider');
  }
  return context;
}
