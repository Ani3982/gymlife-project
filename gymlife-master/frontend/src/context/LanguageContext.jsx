import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, dynamicTextTranslations } from '../utils/translations';

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', short: 'मरा' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', short: 'हिं' }
];

const LanguageContext = createContext({
  language: 'en',
  changeLanguage: () => {},
  t: (key, fallback) => fallback || key,
  languages: LANGUAGES
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gymlife_language') || 'en';
  });

  // Thoroughly clear any obsolete translation cookies
  const clearTranslateCookies = useCallback(() => {
    const cookieNames = ['googtrans', 'googtrans_en'];
    const hostname = window.location.hostname;
    const domainParts = hostname.split('.');
    const domains = [
      '',
      `domain=${hostname};`,
      `domain=.${hostname};`,
      domainParts.length > 1 ? `domain=.${domainParts.slice(-2).join('.')};` : ''
    ];

    cookieNames.forEach(name => {
      domains.forEach(dom => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${dom}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    });
  }, []);

  // Sync document html lang attribute and classes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.classList.remove('lang-en', 'lang-mr', 'lang-hi');
    document.documentElement.classList.add(`lang-${language}`);
    clearTranslateCookies();
  }, [language, clearTranslateCookies]);

  /**
   * Supercharged Translation Helper
   * 1. Matches exact translation key (e.g. 'hero_sub', 'appointment_title')
   * 2. Matches dynamic database strings (e.g. 'Class drop-in', 'Weightlifting', 'Free riding')
   * 3. Fallbacks cleanly to English or the supplied fallback
   */
  const t = useCallback((keyOrText, fallback) => {
    if (!keyOrText && keyOrText !== 0) return fallback || '';
    const lookupStr = String(keyOrText).trim();

    // If active language is English
    if (language === 'en') {
      if (translations.en?.[lookupStr]) return translations.en[lookupStr];
      return fallback || lookupStr;
    }

    // 1. Direct dictionary key match for active language
    if (translations[language]?.[lookupStr]) {
      return translations[language][lookupStr];
    }

    // 2. Direct dynamic text dictionary match (API & DB strings)
    if (dynamicTextTranslations[language]?.[lookupStr]) {
      return dynamicTextTranslations[language][lookupStr];
    }

    // 3. Case-insensitive / normalized lookup
    const lower = lookupStr.toLowerCase();
    const dynamicKeys = Object.keys(dynamicTextTranslations[language] || {});
    for (const dKey of dynamicKeys) {
      if (dKey.toLowerCase() === lower) {
        return dynamicTextTranslations[language][dKey];
      }
    }

    const dictKeys = Object.keys(translations[language] || {});
    for (const dKey of dictKeys) {
      if (dKey.toLowerCase() === lower) {
        return translations[language][dKey];
      }
    }

    // 4. Fallback to English dictionary or provided fallback
    return translations.en?.[lookupStr] || fallback || lookupStr;
  }, [language]);

  // Language Change Function (Instant Bi-directional Switching)
  const changeLanguage = (newLang) => {
    if (!LANGUAGES.some(l => l.code === newLang)) return;
    setLanguage(newLang);
    localStorage.setItem('gymlife_language', newLang);
    clearTranslateCookies();

    // Dispatch custom window event so any non-react listeners update
    try {
      window.dispatchEvent(new CustomEvent('gymlifeLanguageChanged', { detail: { language: newLang } }));
    } catch (e) {}
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      changeLanguage: () => {},
      t: (key, fallback) => fallback || key,
      languages: LANGUAGES
    };
  }
  return context;
};
export default LanguageContext;