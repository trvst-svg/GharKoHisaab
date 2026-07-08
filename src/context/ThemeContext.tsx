import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, ThemeName, ThemeColorsType } from '../constants/colors';
import { LanguageType } from '../constants/translations';
import { getSetting, setSetting } from '../features/settings/SettingsModel';

interface ThemeContextType {
  colors: ThemeColorsType;
  themeName: ThemeName;
  language: LanguageType;
  changeTheme: (name: ThemeName) => Promise<void>;
  changeLanguage: (lang: LanguageType) => Promise<void>;
  isThemeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('indigo');
  const [language, setLanguage] = useState<LanguageType>('en');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const savedTheme = await getSetting('app_theme', 'indigo') as ThemeName;
        const savedLang = await getSetting('app_language', 'en') as LanguageType;
        
        if (THEMES[savedTheme]) {
          setThemeName(savedTheme);
        }
        setLanguage(savedLang);
        setIsThemeLoaded(true);
      } catch (e) {
        console.error('Failed to load theme/language configurations:', e);
        setIsThemeLoaded(true);
      }
    }
    loadConfig();
  }, []);

  const changeTheme = async (name: ThemeName) => {
    if (THEMES[name]) {
      setThemeName(name);
      await setSetting('app_theme', name);
    }
  };

  const changeLanguage = async (lang: LanguageType) => {
    setLanguage(lang);
    await setSetting('app_language', lang);
  };

  const colors = THEMES[themeName] || THEMES.indigo;

  return (
    <ThemeContext.Provider
      value={{
        colors,
        themeName,
        language,
        changeTheme,
        changeLanguage,
        isThemeLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
