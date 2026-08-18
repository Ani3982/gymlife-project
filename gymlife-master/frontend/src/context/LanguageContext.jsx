import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

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

  // Sync document html lang attribute and class
  useEffect(() => {
    document.documentElement.lang = language;
    if (language !== 'en') {
      document.documentElement.classList.add(`lang-${language}`);
      document.documentElement.classList.remove(`lang-${language === 'mr' ? 'hi' : 'mr'}`);
    } else {
      document.documentElement.classList.remove('lang-mr', 'lang-hi');
    }
  }, [language]);

  // Helper translation function for instant react dictionary
  const t = (key, fallback) => {
    if (!key) return fallback || '';
    return translations[language]?.[key] || translations['en']?.[key] || fallback || key;
  };

  // Helper to thoroughly delete cookies across paths and domains
  const clearTranslateCookies = () => {
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
  };

  // Initialize Google Translate Element
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      try {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,mr,hi',
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );
        }
      } catch (err) {
        console.warn('Google Translate Init Warning:', err);
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.async = true;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    }
  }, []);

  // Language Change Function
  const changeLanguage = (newLang) => {
    const previousLang = language;
    setLanguage(newLang);
    localStorage.setItem('gymlife_language', newLang);

    if (newLang === 'en') {
      // 1. Clear all translation cookies
      clearTranslateCookies();

      // 2. Try triggering Google's Restore Original button if accessible
      try {
        const frame = document.querySelector('.goog-te-banner-frame');
        if (frame && frame.contentDocument) {
          const restoreBtn = frame.contentDocument.querySelector('.goog-close-link') ||
                             frame.contentDocument.querySelector('button');
          if (restoreBtn) restoreBtn.click();
        }
      } catch (err) {}

      // 3. Reset select element
      const selectElem = document.querySelector('#google_translate_element select');
      if (selectElem) {
        selectElem.value = 'en';
        selectElem.dispatchEvent(new Event('change'));
      }

      // 4. Force a clean page reload so DOM text nodes are 100% pristine English
      if (previousLang !== 'en' || document.documentElement.classList.contains('translated-ltr')) {
        setTimeout(() => {
          clearTranslateCookies();
          window.location.reload();
        }, 80);
      }
    } else {
      // For Marathi ('mr') or Hindi ('hi')
      const targetLang = `/auto/${newLang}`;
      const domain = window.location.hostname === 'localhost' ? '' : `domain=${window.location.hostname};`;
      
      document.cookie = `googtrans=${targetLang}; path=/; ${domain}`;
      document.cookie = `googtrans=${targetLang}; path=/;`;
      document.cookie = `googtrans=/en/${newLang}; path=/; ${domain}`;
      document.cookie = `googtrans=/en/${newLang}; path=/;`;

      const selectElem = document.querySelector('#google_translate_element select');
      if (selectElem) {
        selectElem.value = newLang;
        selectElem.dispatchEvent(new Event('change'));
      } else {
        setTimeout(() => {
          const retrySelect = document.querySelector('#google_translate_element select');
          if (retrySelect) {
            retrySelect.value = newLang;
            retrySelect.dispatchEvent(new Event('change'));
          }
        }, 200);
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages: LANGUAGES }}>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
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